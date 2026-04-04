import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import { isValidPos } from '../utils/geoUtils';

// --- SHARED UI COMPONENTS ---
import Toast from '../components/common/Toast';
import ActionModal from '../components/common/ActionModal';
import RideSummary from '../components/RideSummary';

// --- DASHBOARD VIEWS ---
import { 
    HomeViewPage, 
    LocationPickerView, 
    ConfirmationView, 
    SchedulingView 
} from '../components/DashboardViews';
import CoworkerSearchView from '../components/CoworkerSearchView';

const ChangeView = ({ center }) => {
  const map = useMapEvents({});
  const lastCenter = useRef(null);
  useEffect(() => {
    if (!isValidPos(center)) return;
    if (center.join(',') !== lastCenter.current) {
      map.setView(center, map.getZoom() || 15);
      lastCenter.current = center.join(',');
    }
  }, [center, map]);
  return null;
};

const MapEventsHandler = ({ onMoveStart, onMoveEnd, onReverseGeocode, bookingStep }) => {
  const map = useMapEvents({
    move: () => onMoveStart(),
    moveend: () => {
        const center = map.getCenter();
        onMoveEnd([center.lat, center.lng]);
        onReverseGeocode(center.lat, center.lng, bookingStep);
    },
    locationfound: (e) => {
        onMoveEnd([e.latlng.lat, e.latlng.lng]);
        onReverseGeocode(e.latlng.lat, e.latlng.lng, bookingStep);
    }
  });
  return null;
};

// --- MAIN DASHBOARD PAGE ---
const Dashboard = () => {
    const { user, isServerOffline, checkStatus, setShowBottomNav, updateProfile } = useUser();
    const { showToast } = useUI();
    
    // UI Logic State
    const [bookingStep, setBookingStep] = useState('home');
    const [pickup, setPickup] = useState({ addr: 'Getting location...', pos: [28.6273, 77.3725] });
    const [destination, setDestination] = useState({ addr: 'Set Destination', pos: [28.6273, 77.3725] });
    const [mapCenter, setMapCenter] = useState([28.6273, 77.3725]);
    const [localQuery, setLocalQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [scheduledTime, setScheduledTime] = useState(new Date());
    const [isSolo, setIsSolo] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showConfirmBooking, setShowConfirmBooking] = useState(false);
    const [isOfficeFixed, setIsOfficeFixed] = useState(null); // 'pickup' | 'destination' | null
    const [retryLoading, setRetryLoading] = useState(false);
    const [invitedEmployees, setInvitedEmployees] = useState([]);
    const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);

    const { officeAddress, officePos, homeAddress, homePos } = React.useMemo(() => {
        const oPos = user?.office_address?.pos;
        const hPos = user?.home_address?.pos;
        return {
            officeAddress: user?.office_address?.addr || "Office HQ",
            officePos: (oPos && oPos.length === 2) ? oPos : [28.6273, 77.3725],
            homeAddress: user?.home_address?.addr || "Set in Profile",
            homePos: (hPos && hPos.length === 2) ? hPos : null
        };
    }, [user]);

    const handleCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            setIsDragging(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latlng = [pos.coords.latitude, pos.coords.longitude];
                    setMapCenter(latlng);
                    reverseGeocode(latlng[0], latlng[1], bookingStep === 'home' ? 'pickingPickup' : bookingStep);
                    setIsDragging(false);
                },
                () => {
                    showToast('Could not access location.', 'error');
                    setIsDragging(false);
                }
            );
        }
    }, [bookingStep, showToast]);

    useEffect(() => {
        if (!user) return;
        // Hide bottom nav during the full-screen ride summary for better focus
        if (bookingStep === 'confirmSummary') {
            setShowBottomNav(false);
        } else {
            setShowBottomNav(true);
        }
    }, [setShowBottomNav, user, bookingStep]);

    useEffect(() => {
        if (user) handleCurrentLocation();
    }, [user, handleCurrentLocation]);

    const reverseGeocode = async (lat, lng, step) => {
        try {
            const res = await api.get(`/maps/reverse?lat=${lat}&lon=${lng}`);
            const addr = res.data?.data?.display_name || 'Selected Location';
            const pos = [lat, lng];
            if (step === 'pickingPickup' || step === 'home') setPickup({ addr, pos });
            else if (step === 'pickingDestination') setDestination({ addr, pos });
        } catch (err) { 
            console.error("Geocode error", err); 
        } finally {
            setIsDragging(false);
        }
    };

    const handleSearch = async () => {
        if (!localQuery) return;
        setIsFetchingSuggestions(true);
        try {
            const res = await api.get(`/maps/search?q=${localQuery}`);
            const results = res.data.data.map(s => ({ addr: s.display_name, pos: [parseFloat(s.lat), parseFloat(s.lon)] }));
            setSuggestions(results);
        } catch (err) { console.error("Search error", err); }
        finally { setIsFetchingSuggestions(false); }
    };

    const handleShortcut = (type, data = null) => {
        if (type === 'office') {
            setDestination({ addr: officeAddress, pos: officePos });
            setIsOfficeFixed('destination');
            setBookingStep('confirmSummary');
        } else if (type === 'home') {
            if (homePos) {
                setPickup({ addr: officeAddress, pos: officePos });
                setDestination({ addr: homeAddress, pos: homePos });
                setIsOfficeFixed('pickup');
                setBookingStep('confirmSummary');
            } else {
                showToast('Home address not set in profile.', 'error');
            }
        } else if (type === 'saved' || type === 'recent') {
            if (data) {
                setDestination({ addr: data.addr, pos: data.pos });
                // If picking a favorite from home screen, we assume it's TO that place, 
                // so PICKUP must be office (Office Rule)
                setPickup({ addr: officeAddress, pos: officePos });
                setIsOfficeFixed('pickup');
                setBookingStep('confirmSummary');
            }
        }
    };

    const handleSaveLocation = async (loc) => {
        if (!loc || !loc.addr || !loc.pos) {
            showToast('Invalid location data.', 'error');
            return;
        }
        
        const isSaved = user.saved_locations?.some(s => s.addr === loc.addr);
        if (isSaved) {
            showToast('Already in favorites!', 'info');
            return;
        }

        const name = loc.addr.split(',')[0] || 'Saved Location';
        try {
            const cleanExisting = (user.saved_locations || []).map(s => ({
                name: s.name,
                addr: s.addr,
                pos: s.pos
            }));
            const newSavedList = [...cleanExisting, { name, addr: loc.addr, pos: loc.pos }];
            await updateProfile({ saved_locations: newSavedList });
            showToast(`Saved "${name}" to favorites!`, 'success');
        } catch (err) {
            showToast('Failed to save location.', 'error');
        }
    };

    const handleRemoveFavorite = async (addr) => {
        try {
            const newSavedList = (user.saved_locations || []).filter(s => s.addr !== addr).map(s => ({
                name: s.name,
                addr: s.addr,
                pos: s.pos
            }));
            await updateProfile({ saved_locations: newSavedList });
            showToast('Removed from favorites.', 'success');
        } catch (err) {
            showToast('Failed to remove favorite.', 'error');
        }
    };

    const updateRecentLocations = async (newLoc) => {
        // Keep only top 5 unique recent locations
        const currentRecents = user.recent_locations || [];
        const filtered = currentRecents.filter(r => r.addr !== newLoc.addr);
        const newRecents = [{ addr: newLoc.addr, pos: newLoc.pos, last_used: new Date() }, ...filtered].slice(0, 5);
        try {
            await updateProfile({ recent_locations: newRecents });
        } catch (err) { console.error("Failed to update recents", err); }
    };

    const handleInviteEmployee = (emp) => {
        if (invitedEmployees.find(e => e._id === emp._id)) return;
        if (invitedEmployees.length >= 3) {
            showToast("Max 3 invitees allowed.", "error");
            return;
        }
        setInvitedEmployees([...invitedEmployees, emp]);
    };

    const handleRemoveEmployee = (id) => {
        setInvitedEmployees(invitedEmployees.filter(e => e._id !== id));
    };

    const handleToggleSolo = () => {
        const newValue = !isSolo;
        setIsSolo(newValue);
        if (newValue === true) {
            setInvitedEmployees([]); // Clear invites if switching to Solo
        }
    };

    const handleConfirmBooking = async () => {
        setBookingLoading(true);
        try {
            await api.post('/ride-request/request', {
                pickup_address: pickup.addr,
                pickup_location: { type: 'Point', coordinates: [pickup.pos[1], pickup.pos[0]] },
                drop_address: destination.addr,
                drop_location: { type: 'Point', coordinates: [destination.pos[1], destination.pos[0]] },
                destination_type: bookingStep === 'office' ? 'OFFICE' : (bookingStep === 'home' ? 'HOME' : 'OTHER'),
                solo_preference: isSolo,
                scheduled_at: scheduledTime.toISOString(),
                invited_employee_ids: invitedEmployees.map(e => e._id)
            });
            showToast('Ride requested!', 'success');
            
            // Update Recent Locations (non-office location)
            const nonOfficeLoc = pickup.addr === officeAddress ? destination : pickup;
            if (nonOfficeLoc.addr !== officeAddress) {
                updateRecentLocations(nonOfficeLoc);
            }

            setBookingStep('home');
            setInvitedEmployees([]);
            setShowConfirmBooking(false);
        } catch (err) {
            showToast(err.response?.data?.message || 'Booking failed.', 'error');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleRetryConnection = async () => {
        setRetryLoading(true);
        const healthy = await checkStatus();
        if (healthy) showToast('Back online!', 'success');
        else showToast('Still offline. Please check your internet.', 'error');
        setRetryLoading(false);
    };

    if (user === undefined || user === null) {
        return <div className='w-full h-screen bg-white flex items-center justify-center'><div className='w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div></div>;
    }

    // --- RENDER CORRECT VIEW BASED ON BOOKING STEP ---
    let MainViewContent = null;
    
    if (bookingStep === 'home') {
        MainViewContent = (
            <HomeViewPage 
                onShortcutClick={handleShortcut} 
                officeAddress={officeAddress} officePos={officePos} 
                homeAddress={homeAddress} homePos={homePos} 
                mapCenter={mapCenter} 
                savedLocations={user.saved_locations || []}
                recentLocations={user.recent_locations || []}
                onRemoveFavorite={handleRemoveFavorite}
            />
        );
    } else if (bookingStep === 'pickingPickup' || bookingStep === 'pickingDestination') {
        MainViewContent = (
            <LocationPickerView 
                bookingStep={bookingStep}
                onBack={() => setBookingStep('home')}
                pickup={pickup} setPickup={setPickup}
                destination={destination} setDestination={setDestination}
                mapCenter={mapCenter} setMapCenter={setMapCenter}
                localQuery={localQuery} setLocalQuery={setLocalQuery}
                isTyping={isTyping} setIsTyping={setIsTyping}
                handleSearch={handleSearch}
                isFetchingSuggestions={isFetchingSuggestions}
                suggestions={suggestions}
                onSuggestionClick={(s) => {
                    setIsTyping(false);
                    setLocalQuery('');
                    if (bookingStep === 'pickingPickup') {
                        setPickup(s);
                        if (s.addr === officeAddress) setIsOfficeFixed('pickup');
                        else if (destination.addr !== officeAddress) {
                            // If user manually picks non-office pickup, DESTINATION must be office
                            setDestination({ addr: officeAddress, pos: officePos });
                            setIsOfficeFixed('destination');
                        }
                    } else {
                        setDestination(s);
                        if (s.addr === officeAddress) setIsOfficeFixed('destination');
                        else if (pickup.addr !== officeAddress) {
                            // If user manually picks non-office destination, PICKUP must be office
                            setPickup({ addr: officeAddress, pos: officePos });
                            setIsOfficeFixed('pickup');
                        }
                    }
                    setMapCenter(s.pos);
                    setBookingStep('confirmSummary');
                }}
                isDragging={isDragging} setIsDragging={setIsDragging}
                onCurrentLocation={handleCurrentLocation}
                reverseGeocode={reverseGeocode}
                MapEventsHandler={MapEventsHandler}
                ChangeView={ChangeView}
                onSaveLocation={handleSaveLocation}
            />
        );
    } else if (bookingStep === 'confirmSummary') {
        MainViewContent = <ConfirmationView 
            officeAddress={officeAddress}
            pickup={pickup} destination={destination} scheduledTime={scheduledTime}
            onEditTime={() => setBookingStep('scheduling')}
            onEditPickup={() => setBookingStep('pickingPickup')}
            onEditDestination={() => setBookingStep('pickingDestination')}
            isSolo={isSolo} onToggleSolo={handleToggleSolo}
            onConfirm={() => setShowConfirmBooking(true)} loading={bookingLoading}
            mapCenter={mapCenter}
            onSchedulingClick={() => setBookingStep('scheduling')}
            MapEventsHandler={MapEventsHandler}
            ChangeView={ChangeView}
            invitedEmployees={invitedEmployees}
            onRemoveInvite={handleRemoveEmployee}
            onBack={() => { setBookingStep('home'); setIsOfficeFixed(null); }}
            isOfficeFixed={isOfficeFixed}
            onSaveLocation={handleSaveLocation}
            savedLocations={user.saved_locations || []}
        />;
    } else if (bookingStep === 'scheduling') {
        MainViewContent = <SchedulingView 
            selectedTime={scheduledTime} 
            onCancel={() => setBookingStep('confirmSummary')} 
            onSelect={(d) => { setScheduledTime(d); setBookingStep('confirmSummary'); }} 
        />;
    }

    return (
        <>
            <div className={`transition-opacity duration-500 ${isServerOffline ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                {MainViewContent}
            </div>
            
            {/* --- MODALS --- */}

            {/* Offline Modal */}
            <ActionModal
                visible={isServerOffline}
                title="Connection Lost"
                description="We're having trouble reaching the dispatch server. Please check your internet connection."
                onConfirm={handleRetryConnection}
                onCancel={() => {}} 
                confirmText={retryLoading ? "Reconnecting..." : "Retry Now"}
                isDangerous={false}
            >
                <div className='flex items-center justify-center py-4'>
                    <div className='w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin'></div>
                </div>
            </ActionModal>
            
            {/* Coworker Search Modal */}
            <ActionModal
                visible={isSearchingEmployees}
                title="Invite Colleagues"
                description="Search for people from your company to join this ride."
                onConfirm={() => setIsSearchingEmployees(false)}
                onCancel={() => setIsSearchingEmployees(false)}
                confirmText="Done"
                isDangerous={false}
            >
                <CoworkerSearchView 
                    onSelect={(emp) => handleInviteEmployee(emp)}
                    currentInvites={invitedEmployees}
                />
            </ActionModal>

            {/* Booking Confirmation Modal */}
            <ActionModal 
                visible={showConfirmBooking}
                title="Confirm Dispatch?"
                description={`Ready to book your ride to ${destination.addr}?`}
                onConfirm={handleConfirmBooking}
                onCancel={() => setShowConfirmBooking(false)}
                confirmText="Book Now"
                isDangerous={false}
            >
                <div className='bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4'>
                    <div className='flex items-center gap-3 mb-2'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                        <p className='text-[10px] font-black text-slate-700 uppercase tracking-widest'>Route Ready</p>
                    </div>
                    <p className='text-xs font-bold text-slate-800 leading-relaxed'>
                        From <span className='text-orange-500'>{pickup.addr.split(',')[0]}</span> to <span className='text-rose-500'>{destination.addr.split(',')[0]}</span>
                    </p>
                </div>
            </ActionModal>
        </>
    );
};

export default Dashboard;
