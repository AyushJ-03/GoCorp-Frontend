import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import { isValidPos, getDistance as calcDistance } from '../utils/geoUtils';

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
    const key = `${center[0].toFixed(6)},${center[1].toFixed(6)}`;
    if (key !== lastCenter.current) {
      map.setView(center, map.getZoom() || 15);
      lastCenter.current = key;
    }
  }, [center, map]);
  return null;
};

const MapEventsHandler = ({ onMoveStart, onMoveEnd, onReverseGeocode, bookingStep }) => {
  const map = useMapEvents({
    move: () => onMoveStart(),
    moveend: () => {
        const center = map.getCenter();
        const lat = parseFloat(center.lat.toFixed(6));
        const lng = parseFloat(center.lng.toFixed(6));
        onMoveEnd([lat, lng]);
        onReverseGeocode(lat, lng, bookingStep);
    },
    locationfound: (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        onMoveEnd([lat, lng]);
        onReverseGeocode(lat, lng, bookingStep);
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
    const [previousStep, setPreviousStep] = useState('home'); // Dynamic navigation
    const [tempLocation, setTempLocation] = useState(null); // Persistence fix
    
    const changeStep = useCallback((newStep) => {
        setPreviousStep(bookingStep);
        setBookingStep(newStep);
    }, [bookingStep]);

    const [pickup, setPickup] = useState({ addr: 'Getting location...', pos: [28.6273, 77.3725] });
    const [destination, setDestination] = useState({ addr: 'Set Destination', pos: [28.6273, 77.3725] });
    const [mapCenter, setMapCenter] = useState([28.6273, 77.3725]);
    const [currentGPSPos, setCurrentGPSPos] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('searching');
    
    // Strict LatLng Guard: Ensures internal app state is always [Lat, Lng]
    // even if the database has legacy swapped data.
    const toLatLng = useCallback((pos) => {
        if (!pos || !Array.isArray(pos) || pos.length !== 2) return null;
        // Noida specific sanity check: Lat is ~28, Lng is ~77.
        // If they are swapped (Lat > 50 in this region), swap them back.
        if (pos[0] > 60 && pos[1] < 40) return [pos[1], pos[0]];
        return [pos[0], pos[1]];
    }, []);

    const [localQuery, setLocalQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [scheduledTime, setScheduledTime] = useState(new Date());
    const [isSolo, setIsSolo] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showConfirmBooking, setShowConfirmBooking] = useState(false);
    const [isOfficeFixed, setIsOfficeFixed] = useState(null); // 'pickup' | 'destination' | null
    const [retryLoading, setRetryLoading] = useState(false);
    const [invitedEmployees, setInvitedEmployees] = useState([]);
    const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);

    // Refs for map stability
    const hasInitGeo = useRef(false);
    const geocodeTimeout = useRef(null);
    const pendingCoordRef = useRef(null); // Request Deduplication

    const { officeAddress, officePos, homeAddress, homePos } = React.useMemo(() => {
        // Extract dynamically populated office from the updated backend
        const populatedOffice = user?.office_id;
        const populatedOfficeLoc = populatedOffice?.office_location?.coordinates; 
        
        let populatedOfficeAddr = null;
        if (populatedOffice?.address) {
            populatedOfficeAddr = `${populatedOffice.name || 'Office'} - ${populatedOffice.address.address_line}, ${populatedOffice.address.city}`;
        }

        const rawOPos = populatedOfficeLoc || user?.office_address?.pos;
        const rawHPos = user?.home_address?.pos;

        return {
            officeAddress: populatedOfficeAddr || user?.office_address?.addr || "Office HQ",
            officePos: toLatLng(rawOPos) || [28.6273, 77.3725],
            homeAddress: user?.home_address?.addr || "Set in Profile",
            homePos: toLatLng(rawHPos)
        };
    }, [user, toLatLng]);

    // Rounding lat/lng to 5 decimal places (approx 1m precision)
    // and preventing feedback loops if the distance is trivial.
    const roundCoord = (n) => parseFloat(n).toFixed(5);

    const reverseGeocode = useCallback(async (lat, lng, step) => {
        const coordKey = `${roundCoord(lat)},${roundCoord(lng)}`;
        
        // Prevent duplicate concurrent requests for the exact same spot
        if (pendingCoordRef.current === coordKey) return;
        pendingCoordRef.current = coordKey;

        try {
            const res = await api.get(`/maps/reverse?lat=${lat}&lon=${lng}`);
            const addr = res.data?.data?.display_name || 'Selected Location';
            const pos = [lat, lng];
            
            // Core Staging Logic: Only use tempLocation during active drag-to-pick
            // For shortcuts or initial loads, commit directly to the global state
            if (bookingStep === 'pickingPickup' && step === 'pickingPickup') {
                setTempLocation({ addr, pos });
            } else if (bookingStep === 'pickingDestination' && step === 'pickingDestination') {
                setTempLocation({ addr, pos });
            } else if (step === 'pickingPickup' || step === 'home') {
                setPickup({ addr, pos });
            } else if (step === 'pickingDestination') {
                setDestination({ addr, pos });
            }
        } catch (err) { 
            console.error("Geocode error", err); 
        } finally {
            setIsDragging(false);
            if (pendingCoordRef.current === coordKey) {
                pendingCoordRef.current = null;
            }
        }
    }, [bookingStep, roundCoord]);

    const debouncedGeocode = useCallback((lat, lng, step) => {
        if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
        geocodeTimeout.current = setTimeout(() => {
            reverseGeocode(lat, lng, step);
        }, 800);
    }, [reverseGeocode]);

    const handleCurrentLocation = useCallback((force = false) => {
        if (navigator.geolocation) {
            // If not a force update and we already have a lock, don't jump again
            if (!force && hasInitGeo.current) return;

            setIsDragging(true);
            setGpsStatus('searching');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latlng = [pos.coords.latitude, pos.coords.longitude];
                    setMapCenter(latlng);
                    setCurrentGPSPos(latlng);
                    setGpsStatus('locked');
                    hasInitGeo.current = true;

                    setPickup(prev => {
                        if (prev.addr === 'Getting location...' || (prev.pos[0] === 28.6273 && prev.pos[1] === 77.3725)) {
                            setTimeout(() => reverseGeocode(latlng[0], latlng[1], 'pickingPickup'), 0);
                            return { addr: 'Fetching precise location...', pos: latlng };
                        }
                        return prev;
                    });
                    
                    setIsDragging(false);
                },
                (err) => {
                    console.error("GPS Error:", err);
                    setGpsStatus('error');
                    setIsDragging(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    }, [reverseGeocode]);

    useEffect(() => {
        if (!user) return;
        // Only show bottom navigation on the home view (where the map is hidden)
        if (bookingStep === 'home') {
            setShowBottomNav(true);
        } else {
            setShowBottomNav(false);
        }
    }, [setShowBottomNav, user, bookingStep]);

    useEffect(() => {
        // Only trigger location discovery if we're on the "Recent Places" screen (home) 
        // or starting a pick, to avoid redundant background work.
        if (user && !hasInitGeo.current && (bookingStep === 'home' || bookingStep.startsWith('picking'))) {
            handleCurrentLocation();
        }
    }, [user, handleCurrentLocation, bookingStep]);

    const handleSearch = useCallback(async (queryOverride) => {
        const q = typeof queryOverride === 'string' ? queryOverride : localQuery;
        if (!q || q.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsFetchingSuggestions(true);
        try {
            const res = await api.get(`/maps/search?q=${q}`);
            const results = (res.data?.data || []).map(s => {
                const a = s.address || {};
                const city = a.city || a.town || a.village || a.county || '';
                const country = a.country || '';
                const subtext = [city, country].filter(Boolean).join(', ');
                return { 
                    addr: s.display_name, 
                    pos: [parseFloat(s.lat), parseFloat(s.lon)],
                    subtext: subtext.length > 0 ? subtext : 'KNOWN LOCATION'
                };
            });
            setSuggestions(results);
        } catch (err) { console.error("Search error", err); }
        finally { setIsFetchingSuggestions(false); }
    }, [localQuery]);

    useEffect(() => {
        if (!isTyping || !localQuery || localQuery.length < 3) {
            setSuggestions([]);
            return;
        }
        const handler = setTimeout(() => {
            handleSearch(localQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [localQuery, isTyping, handleSearch]);

    const handleShortcut = (type, data = null) => {
        // Reset to current time whenever a shortcut is used for a fresh start
        setScheduledTime(new Date());
        
        if (type === 'office') {
            const capturePos = isValidPos(currentGPSPos) ? currentGPSPos : mapCenter;
            const nextPickup = { addr: 'Fetching location...', pos: capturePos };
            const nextDest = { addr: officeAddress, pos: officePos };

            if (!validateRideDistance(nextPickup, nextDest)) return;

            setDestination(nextDest);
            setPickup(nextPickup);
            setTimeout(() => reverseGeocode(capturePos[0], capturePos[1], 'pickingPickup'), 0);
            setMapCenter(capturePos);
            
            setIsOfficeFixed('destination');
            changeStep('confirmSummary');
        } else if (type === 'home') {
            if (homePos) {
                const nextPickup = { addr: officeAddress, pos: officePos };
                const nextDest = { addr: homeAddress, pos: homePos };

                if (!validateRideDistance(nextPickup, nextDest)) return;

                setPickup(nextPickup);
                setDestination(nextDest);
                setIsOfficeFixed('pickup');
                changeStep('confirmSummary');
            } else {
                showToast('Home address not set in profile.', 'error');
            }
        } else if (type === 'saved' || type === 'recent') {
            if (data) {
                const nextPickup = { addr: officeAddress, pos: officePos };
                const nextDest = { addr: data.addr, pos: data.pos };

                if (!validateRideDistance(nextPickup, nextDest)) return;

                setDestination(nextDest);
                setPickup(nextPickup);
                setIsOfficeFixed('pickup');
                changeStep('confirmSummary');
            }
        }
    };

    const handleSaveLocation = async (loc) => {
        if (!loc || !loc.addr || !loc.pos || !isValidPos(loc.pos)) {
            showToast('Invalid location data.', 'error');
            return;
        }
        
        const entryPos = [loc.pos[0], loc.pos[1]]; // Strictly [Lat, Lng]
        const isSaved = (user.saved_locations || []).some(s => {
            const sPos = toLatLng(s.pos);
            return sPos && sPos[0] === entryPos[0] && sPos[1] === entryPos[1];
        });
        
        if (isSaved) {
            showToast('Already in favorites!', 'info');
            return;
        }

        const name = loc.addr.split(',')[0] || 'Saved Location';
        try {
            const cleanExisting = (user.saved_locations || []).map(s => ({
                name: s.name,
                addr: s.addr,
                pos: toLatLng(s.pos)
            }));
            const newSavedList = [...cleanExisting, { name, addr: loc.addr, pos: entryPos }];
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
                pos: [s.pos[0], s.pos[1]]
            }));
            await updateProfile({ saved_locations: newSavedList });
            showToast('Removed from favorites.', 'success');
        } catch (err) {
            showToast('Failed to remove favorite.', 'error');
        }
    };

    const updateRecentLocations = async (newLoc) => {
        if (!newLoc || !newLoc.pos || !isValidPos(newLoc.pos)) return;
        
        // Ensure strictly [Lat, Lng]
        const latLng = [newLoc.pos[0], newLoc.pos[1]];

        // Keep only top 5 unique recent locations
        const currentRecents = (user.recent_locations || []).map(r => ({
            ...r,
            pos: toLatLng(r.pos)
        }));
        
        const filtered = currentRecents.filter(r => r.addr !== newLoc.addr);
        const newRecents = [{ 
            name: newLoc.addr.split(',')[0],
            addr: newLoc.addr, 
            pos: [latLng[0], latLng[1]], 
            last_used: new Date() 
        }, ...filtered].slice(0, 5);

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
        // Pre-flight validation: Ensure time hasn't passed while waiting
        const now = new Date();
        if (scheduledTime < new Date(now.getTime() - 60000)) {
            showToast('Rides cannot be scheduled in the past. Please update time.', 'error');
            setBookingStep('scheduling');
            setShowConfirmBooking(false);
            return;
        }

        setBookingLoading(true);
        try {
            await api.post('/ride/book-ride', {
                employee_id: user._id,
                office_id: user.office_id,
                pickup_address: pickup.addr,
                pickup_location: { type: 'Point', coordinates: [pickup.pos[1], pickup.pos[0]] },
                drop_address: destination.addr,
                drop_location: { type: 'Point', coordinates: [destination.pos[1], destination.pos[0]] },
                destination_type: destination.addr === officeAddress ? 'OFFICE' : (destination.addr === homeAddress ? 'HOME' : 'OTHER'),
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
            
            // Re-fetch or refresh current view
            handleCurrentLocation();
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

    const validateRideDistance = useCallback((p, d) => {
        if (!p || !d || !isValidPos(p.pos) || !isValidPos(d.pos)) return true;
        const dist = calcDistance(p.pos, d.pos);
        if (dist < 500) {
            showToast('Pickup and Destination must be at least 500m apart.', 'error');
            return false;
        }
        return true;
    }, [showToast]);

    const handleConfirmPin = useCallback(() => {
        const s = tempLocation || (bookingStep === 'pickingPickup' ? pickup : destination);
        
        let finalPickup = pickup;
        let finalDest = destination;

        // Use a 200m threshold for "At Office" detection as per user request
        const distFromOffice = calcDistance(s.pos, officePos);
        const isNearOffice = distFromOffice <= 200;

        // --- RADIUS ENFORCEMENT ---
        // If we are MOVING the side that was already office-bound, we must stay within 200m
        if (bookingStep === 'pickingPickup' && isOfficeFixed === 'pickup' && !isNearOffice) {
            showToast('Office pickup must be within 200m of the actual office.', 'error');
            return;
        }
        if (bookingStep === 'pickingDestination' && isOfficeFixed === 'destination' && !isNearOffice) {
            showToast('Office destination must be within 200m of the actual office.', 'error');
            return;
        }

        if (bookingStep === 'pickingPickup') {
            finalPickup = s;
            if (!isNearOffice) {
                // Not near office pickup? Force destination to office (Office-ride)
                finalDest = { addr: officeAddress, pos: officePos };
            } else if (!destination.pos && homePos) {
                // Near office pickup and no destination set? Default to Home (Home-ride)
                finalDest = { addr: homeAddress || 'Home', pos: homePos };
            }
        } else {
            finalDest = s;
            if (!isNearOffice) {
                // Not near office destination? Force pickup to office (Home-ride)
                finalPickup = { addr: officeAddress, pos: officePos };
            } else if (!pickup.pos && homePos) {
                // Near office destination and no pickup set? Default to Home (Office-ride)
                finalPickup = { addr: homeAddress || 'Home', pos: homePos };
            }
        }

        // --- 500M VALIDATION (Only if both points are real) ---
        if (isValidPos(finalPickup.pos) && isValidPos(finalDest.pos)) {
            const rideDist = calcDistance(finalPickup.pos, finalDest.pos);
            if (rideDist < 500) {
                showToast('Pickup and Destination must be at least 500m apart.', 'error');
                return;
            }
        }

        // Commit state
        setPickup(finalPickup);
        setDestination(finalDest);
        
        // Update office anchor for summary rules
        if (bookingStep === 'pickingPickup') {
            setIsOfficeFixed(isNearOffice ? 'pickup' : 'destination');
        } else {
            setIsOfficeFixed(isNearOffice ? 'destination' : 'pickup');
        }

        setTempLocation(null);

        // If we still don't have a destination, go pick it. Otherwise, summary.
        if (bookingStep === 'pickingPickup' && (!finalDest.pos || finalDest.addr?.includes('...'))) {
            changeStep('pickingDestination');
            setMapCenter(isValidPos(currentGPSPos) ? currentGPSPos : [28.6273, 77.3725]);
        } else {
            changeStep('confirmSummary');
        }
    }, [bookingStep, pickup, destination, officeAddress, officePos, tempLocation, changeStep, showToast, isOfficeFixed, homePos, homeAddress, currentGPSPos]);

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
                currentGPSPos={currentGPSPos} 
                gpsStatus={gpsStatus}
                savedLocations={(user.saved_locations || []).map(l => ({ ...l, pos: toLatLng(l.pos) }))}
                recentLocations={(user.recent_locations || []).map(l => ({ ...l, pos: toLatLng(l.pos) }))}
                onRemoveFavorite={handleRemoveFavorite}
            />
        );
    } else if (bookingStep === 'pickingPickup' || bookingStep === 'pickingDestination') {
        MainViewContent = (
            <LocationPickerView 
                bookingStep={bookingStep}
                onBack={() => { setBookingStep(previousStep); setTempLocation(null); }}
                pickup={bookingStep === 'pickingPickup' ? (tempLocation || pickup) : pickup}
                destination={bookingStep === 'pickingDestination' ? (tempLocation || destination) : destination}
                setPickup={setPickup}
                setDestination={setDestination}
                mapCenter={mapCenter} setMapCenter={setMapCenter}
                localQuery={localQuery} setLocalQuery={setLocalQuery}
                isTyping={isTyping} setIsTyping={setIsTyping}
                handleSearch={handleSearch}
                isFetchingSuggestions={isFetchingSuggestions}
                suggestions={suggestions}
                onSuggestionClick={(s) => {
                    setIsTyping(false);
                    setLocalQuery('');
                    setMapCenter(s.pos);
                    setTempLocation(s);
                }}
                onConfirmPin={handleConfirmPin}
                isDragging={isDragging} setIsDragging={setIsDragging}
                onCurrentLocation={handleCurrentLocation}
                reverseGeocode={debouncedGeocode}
                MapEventsHandler={MapEventsHandler}
                ChangeView={ChangeView}
                onSaveLocation={handleSaveLocation}
                officePos={officePos}
            />
        );
    } else if (bookingStep === 'confirmSummary') {
        MainViewContent = <ConfirmationView 
            officeAddress={officeAddress}
            pickup={pickup} destination={destination} scheduledTime={scheduledTime}
            onEditTime={() => changeStep('scheduling')}
            onEditPickup={() => { 
                setTempLocation(pickup);
                setMapCenter(pickup.pos); 
                changeStep('pickingPickup'); 
            }}
            onEditDestination={() => { 
                setTempLocation(destination);
                setMapCenter(destination.pos); 
                changeStep('pickingDestination'); 
            }}
            isSolo={isSolo} onToggleSolo={handleToggleSolo}
            onConfirm={() => setShowConfirmBooking(true)} loading={bookingLoading}
            mapCenter={mapCenter}
            currentGPSPos={currentGPSPos}
            onSchedulingClick={() => changeStep('scheduling')}
            MapEventsHandler={MapEventsHandler}
            ChangeView={ChangeView}
            invitedEmployees={invitedEmployees}
            onAddInvite={() => setIsSearchingEmployees(true)}
            onRemoveInvite={handleRemoveEmployee}
            onBack={() => { changeStep('home'); setIsOfficeFixed(null); }}
            isOfficeFixed={isOfficeFixed}
            onSaveLocation={handleSaveLocation}
            onRemoveLocation={handleRemoveFavorite}
            savedLocations={user.saved_locations || []}
            officePos={officePos}
            distance={calcDistance(pickup.pos, destination.pos)}
        />;
    }
 else if (bookingStep === 'scheduling') {
        MainViewContent = <SchedulingView 
            selectedTime={scheduledTime} 
            onCancel={() => changeStep('confirmSummary')} 
            onSelect={(d) => { setScheduledTime(d); changeStep('confirmSummary'); }} 
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
