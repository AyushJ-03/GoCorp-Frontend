import React, { useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { isValidPos, getDistance as calcDistance } from '../utils/geoUtils';
import RideSummary from './RideSummary';
import ActionModal from './common/ActionModal';
import { useUI } from '../context/UIContext';

const getMarkerIcon = () => {
    return L.divIcon({
        html: `
            <div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute inset-0 rounded-full border-[5px] border-orange-500 shadow-sm"></div>
                <div class="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_6px_rgba(249,115,22,1)]"></div>
            </div>
        `,
        className: 'custom-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const getOfficeMarkerIcon = () => {
    return L.divIcon({
        html: `
            <div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute inset-0 bg-blue-600/20 rounded-full animate-ping duration-[3000ms]"></div>
                <div class="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                <div class="absolute -top-10 px-2 py-1 bg-blue-600 text-white text-[7px] font-black uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap pointer-events-none">Corporate Office</div>
            </div>
        `,
        className: 'office-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

// --- MAP LAYER ---
export const MapLayer = ({ pickupPos, destinationPos, officePos, mapCenter, bookingStep, MapEventsHandler, ChangeView, onMapMove, onReverseGeocode, onMoveStart, isDragging, onCurrentLocation }) => {
    return (
        <div className='absolute inset-0 z-0 bg-slate-50'>
            <MapContainer 
                className='z-0'
                center={isValidPos(mapCenter) ? mapCenter : [28.6273, 77.3725]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }} 
                zoomControl={false}
                dragging={bookingStep !== 'confirmSummary'}
                scrollWheelZoom={bookingStep !== 'confirmSummary'}
                doubleClickZoom={bookingStep !== 'confirmSummary'}
                touchZoom={bookingStep !== 'confirmSummary'}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
                <MapEventsHandler 
                    onMoveStart={onMoveStart}
                    onMoveEnd={onMapMove}
                    onReverseGeocode={onReverseGeocode}
                    bookingStep={bookingStep}
                />
                <ChangeView center={mapCenter} />

                {/* Persistent Office Marker & Radius - Always Visible */}
                {isValidPos(officePos) && (
                    <>
                        <Circle 
                            center={officePos} 
                            radius={200} 
                            pathOptions={{ 
                                color: '#2563eb', 
                                fillColor: '#2563eb', 
                                fillOpacity: 0.1, 
                                weight: 2, 
                                dashArray: '8, 12' 
                            }} 
                            eventHandlers={{
                                click: () => onMapMove({ target: { getCenter: () => L.latLng(officePos) } })
                            }}
                        />
                        <Marker 
                            position={officePos} 
                            icon={getOfficeMarkerIcon()} 
                            eventHandlers={{
                                click: () => onMapMove({ target: { getCenter: () => L.latLng(officePos) } })
                            }}
                        />
                    </>
                )}

                {/* In summary mode, show BOTH pickup and destination pins if available */}
                {bookingStep === 'confirmSummary' && isValidPos(pickupPos) && (
                    <Marker position={pickupPos} icon={getMarkerIcon()} />
                )}
                {bookingStep === 'confirmSummary' && isValidPos(destinationPos) && (
                    <Marker position={destinationPos} icon={getMarkerIcon()} />
                )}
            </MapContainer>

            {/* Bullseye Screen Center Pin */}
            {(bookingStep === 'pickingPickup' || bookingStep === 'pickingDestination') && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none flex items-center justify-center w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-[5px] border-orange-500 shadow-sm"></div>
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_6px_rgba(249,115,22,1)]"></div>
                </div>
            )}

        {/* FABs */}
        <button 
            onClick={onCurrentLocation}
            className='absolute bottom-32 right-6 z-40 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-slate-800 active:scale-90 transition-all border border-white/20 hover:bg-white hover:shadow-3xl hover:text-orange-500'
        >
            <svg className='w-6 h-6 transition-transform group-hover:rotate-45' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
        </button>
    </div>
    );
};

// --- HEADER ---
export const LocationHeader = ({ 
    bookingStep, onBack, localQuery, setLocalQuery, isTyping, setIsTyping, 
    handleSearch, isFetchingSuggestions, displayText, suggestions = [], onSuggestionClick,
    onSaveLocation
}) => (
    <div className='absolute top-0 left-0 right-0 p-6 z-100 animate-in slide-in-from-top duration-500'>
        <div className='max-w-md mx-auto bg-white/20 backdrop-blur-3xl rounded-[2.5rem] p-3 shadow-2xl border border-white/30'>
            <div className='flex items-center gap-3'>
                <button onClick={onBack} className='w-12 h-12 bg-white/60 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-slate-900 hover:text-orange-500 shrink-0'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M15 19l-7-7 7-7' strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} /></svg>
                </button>
                <div className='flex-1 relative'>
                    <input 
                        type='text' 
                        value={isTyping ? localQuery : displayText} 
                        onChange={(e) => { setLocalQuery(e.target.value); setIsTyping(true); }}
                        onFocus={(e) => { setLocalQuery(displayText); setIsTyping(true); e.target.select(); }}
                        onBlur={() => { if (!isFetchingSuggestions) setTimeout(() => setIsTyping(false), 200); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (suggestions && suggestions.length > 0) {
                                    onSuggestionClick(suggestions[0]);
                                } else {
                                    handleSearch();
                                }
                            }
                        }}
                        className='w-full h-12 bg-white/40 border border-white/20 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 placeholder-slate-400'
                        placeholder={bookingStep === 'pickingPickup' ? 'Enter Pickup' : 'Enter Destination'}
                    />
                </div>
            </div>

            {/* Suggestions */}
            {isTyping && (suggestions.length > 0 || isFetchingSuggestions) && (
                <div className='mt-3 bg-white/60 backdrop-blur-3xl rounded-3xl p-2 shadow-2xl border border-white/40 max-h-[300px] overflow-y-auto animate-in zoom-in-95 duration-200'>
                    {isFetchingSuggestions ? (
                        <div className='p-8 flex flex-col items-center gap-3'>
                            <div className='w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
                            <span className='text-[10px] font-black text-slate-600 uppercase tracking-widest'>Searching...</span>
                        </div>
                    ) : (
                        suggestions.map((s, i) => (
                            <div key={i} onMouseDown={(e) => { e.preventDefault(); onSuggestionClick(s); }} className='p-4 hover:bg-white/80 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group'>
                                <div className='w-10 h-10 bg-slate-900/5 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-orange-500 group-hover:text-white transition-all'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} /></svg>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-bold text-slate-800 truncate'>{s.addr}</p>
                                    <p className='text-[10px] font-black text-slate-600 uppercase tracking-widest opacity-80'>{s.subtext}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    </div>
);

/**
 * Shared Map Component Wrapper for usage inside Views
 */
const MapBackground = ({ pickup, destination, officePos, mapCenter, currentGPSPos, bookingStep, onMapMove, onReverseGeocode, onMoveStart, isDragging, onCurrentLocation, MapEventsHandler, ChangeView }) => {
    // In summary mode, the map is always centered on the current GPS position, clean and silent.
    const activeCenter = bookingStep === 'confirmSummary' && isValidPos(currentGPSPos) 
        ? currentGPSPos 
        : mapCenter;

    return (
        <div className='absolute inset-0 z-0'>
            <MapLayer 
                pickupPos={pickup?.pos} 
                destinationPos={destination?.pos} 
                officePos={officePos}
                mapCenter={activeCenter} 
                bookingStep={bookingStep} 
                onMapMove={onMapMove} 
                onReverseGeocode={onReverseGeocode}
                onMoveStart={onMoveStart} 
                isDragging={isDragging}
                onCurrentLocation={onCurrentLocation}
                MapEventsHandler={MapEventsHandler}
                ChangeView={ChangeView}
            />
        </div>
    );
};

// --- HOME VIEW PAGE ---
export const HomeViewPage = ({ 
    onShortcutClick, officeAddress, officePos, homeAddress, homePos, currentGPSPos,
    gpsStatus, savedLocations = [], recentLocations = [], onRemoveFavorite 
}) => {
    const getDistance = (pos) => {
        try {
            if (gpsStatus === 'searching') return 'Detecting...';
            if (gpsStatus === 'error' || !isValidPos(currentGPSPos) || !isValidPos(pos)) return '-';
            
            // Calculate real distance using [Lat, Lng]
            const meters = calcDistance(currentGPSPos, pos);
            const dist = (meters / 1000).toFixed(1);
            return `${dist} KM`;
        } catch {
            return '-';
        }
    };

    return (
        <div className='w-full h-dvh bg-linear-to-b from-slate-50 to-blue-50 flex flex-col pt-20 pb-24 font-sans select-none overflow-y-auto relative z-10'>
            <div className='mb-10 px-6'>
                <h1 className='text-6xl font-black text-slate-900 tracking-tighter leading-none'>Where<br/>to?</h1>
                <p className='text-slate-700 font-bold text-sm mt-4 uppercase tracking-widest opacity-80 italic'>Ready for your next trip?</p>
            </div>

            {/* Core Shortcuts */}
            <div className='px-6 space-y-4 mb-10'>
                <div onClick={() => onShortcutClick('office')} className='group bg-white/40 backdrop-blur-3xl rounded-[2rem] p-5 flex items-center gap-5 cursor-pointer hover:bg-white transition-all active:scale-[0.98] border border-white/60 shadow-sm hover:shadow-xl'>
                    <div className='w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' /></svg>
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='text-slate-900 font-black text-base'>Office</h3>
                        <p className='text-slate-700 text-[10px] truncate font-medium uppercase tracking-widest opacity-70'>{officeAddress.split(',')[0]}</p>
                    </div>
                </div>

                <div onClick={() => onShortcutClick('home')} className='group bg-white/40 backdrop-blur-3xl rounded-[2rem] p-5 flex items-center gap-5 cursor-pointer hover:bg-white transition-all active:scale-[0.98] border border-white/60 shadow-sm hover:shadow-xl'>
                    <div className='w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:-rotate-6 transition-transform'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' /></svg>
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='text-slate-900 font-black text-base'>Home</h3>
                        <p className='text-slate-700 text-[10px] truncate font-medium uppercase tracking-widest opacity-70'>{homeAddress.split(',')[0]}</p>
                    </div>
                </div>
            </div>

            {/* Favourites - Vertical List */}
            {savedLocations.length > 0 && (
                <div className='px-6 mb-10'>
                    <h2 className='px-1 mb-4 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] opacity-60'>Favorites</h2>
                    <div className='space-y-3'>
                        {savedLocations.map((loc, i) => (
                            <div 
                                key={i} 
                                onClick={() => onShortcutClick('saved', loc)}
                                className='bg-white/40 backdrop-blur-3xl rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white transition-all active:scale-[0.98] border border-white/60 shadow-sm hover:shadow-md'
                            >
                                <div className='w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center shrink-0'>
                                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'><path d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'/></svg>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-bold text-slate-900 truncate'>{loc.name || loc.addr.split(',')[0]}</p>
                                    <p className='text-[10px] font-black text-slate-600 uppercase tracking-widest opacity-60'>{loc.addr.split(',').slice(1,2)}</p>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='text-right shrink-0'>
                                        <span className='text-[9px] font-black text-slate-800 bg-slate-900/5 px-2 py-1 rounded-full'>{getDistance(loc.pos)}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFavorite(loc.addr);
                                        }}
                                        className='w-8 h-8 bg-slate-900/5 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-90'
                                        title="Remove favorite"
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M6 18L18 6M6 6l12 12' strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recents - Vertical List */}
            {recentLocations.length > 0 && (
                <div className='px-6'>
                    <h2 className='px-1 mb-4 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] opacity-60'>Recent Places</h2>
                    <div className='space-y-3'>
                        {recentLocations.map((loc, i) => (
                            <div 
                                key={i} 
                                onClick={() => onShortcutClick('recent', loc)}
                                className='bg-white/30 backdrop-blur-3xl rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/60 transition-all active:scale-[0.98] border border-white/40'
                            >
                                <div className='w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} /></svg>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-bold text-slate-900 truncate'>{loc.addr.split(',')[0]}</p>
                                    <p className='text-[10px] font-black text-slate-600 uppercase tracking-widest opacity-60'>{loc.addr.split(',').slice(1,2)}</p>
                                </div>
                                <div className='text-right shrink-0'>
                                    <span className='text-[9px] font-black text-slate-800 bg-slate-900/5 px-2 py-1 rounded-full'>{getDistance(loc.pos)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const LocationPickerView = ({ 
    bookingStep, onBack, pickup, setPickup, destination, setDestination, mapCenter, setMapCenter, 
    localQuery, setLocalQuery, isTyping, setIsTyping, handleSearch, isFetchingSuggestions, 
    suggestions, onSuggestionClick, isDragging, setIsDragging, onCurrentLocation, reverseGeocode, 
    MapEventsHandler, ChangeView, onSaveLocation, officePos,
    onConfirmPin
}) => {
    return (
        <div className='w-full h-dvh bg-white flex flex-col relative font-sans select-none overflow-hidden'>
            <MapBackground 
                pickup={pickup} destination={destination} officePos={officePos} mapCenter={mapCenter} 
                bookingStep={bookingStep} onMapMove={setMapCenter} 
                onReverseGeocode={reverseGeocode} onMoveStart={() => setIsDragging(true)} 
                isDragging={isDragging} onCurrentLocation={onCurrentLocation}
                MapEventsHandler={MapEventsHandler} ChangeView={ChangeView}
            />

            <LocationHeader 
                bookingStep={bookingStep} onBack={onBack}
                localQuery={localQuery} setLocalQuery={setLocalQuery}
                isTyping={isTyping} setIsTyping={setIsTyping}
                handleSearch={handleSearch} isFetchingSuggestions={isFetchingSuggestions}
                displayText={bookingStep === 'pickingPickup' ? pickup.addr : destination.addr}
                suggestions={suggestions} onSuggestionClick={onSuggestionClick}
                onSaveLocation={onSaveLocation}
            />

            {/* Confirm Floating Button */}
            {!isTyping && (
                <div className='absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-6 animate-in slide-in-from-bottom duration-500'>
                    <button 
                        onClick={onConfirmPin}
                        disabled={isDragging}
                        className='w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(15,23,42,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-wait'
                    >
                        {isDragging ? (
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                <span>Updating Location...</span>
                            </div>
                        ) : (
                            <>
                                <span>Confirm {bookingStep === 'pickingPickup' ? 'Pickup' : 'Destination'}</span>
                                <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M17 8l4 4m0 0l-4 4m4-4H3' strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} /></svg>
                            </>
                        )}
                    </button>
                </div>
            )}

        </div>
    );
};

// --- CONFIRMATION VIEW ---
export const ConfirmationView = ({ 
    officeAddress, pickup, destination, scheduledTime, isSolo, onToggleSolo, 
    onEditPickup, onEditDestination, onConfirm, loading, mapCenter, currentGPSPos,
    onSchedulingClick, MapEventsHandler, ChangeView,
    invitedEmployees, onAddInvite, onRemoveInvite, onBack,
    isOfficeFixed, onSaveLocation, onRemoveLocation, savedLocations, officePos
}) => {
    const { showToast } = useUI();

    const handleOfficeRuleClick = () => {
        const side = isOfficeFixed === 'pickup' ? 'pickup' : 'destination';
        showToast(`For office rides, the ${side} is fixed to your office area`, 'info', 1500);
    };

    return (
        <div className='w-full h-dvh bg-white flex flex-col relative font-sans select-none overflow-hidden'>
            <MapBackground 
                pickup={pickup} destination={destination} officePos={officePos} mapCenter={mapCenter} 
                currentGPSPos={currentGPSPos}
                bookingStep='confirmSummary' onMapMove={() => {}} 
                onReverseGeocode={() => {}} onMoveStart={() => {}} 
                isDragging={false} onCurrentLocation={() => {}}
                MapEventsHandler={MapEventsHandler} ChangeView={ChangeView}
            />

            <RideSummary 
                officeAddress={officeAddress}
                pickup={pickup} destination={destination} scheduledTime={scheduledTime}
                onEditTime={onSchedulingClick}
                onEditPickup={onEditPickup}
                onEditDestination={onEditDestination}
                isSolo={isSolo} onToggleSolo={onToggleSolo}
                onConfirm={onConfirm} loading={loading}
                invitedEmployees={invitedEmployees}
                onAddInvite={onAddInvite}
                onRemoveInvite={onRemoveInvite}
                onBack={onBack}
                onOfficeRuleClick={handleOfficeRuleClick}
                isOfficeFixed={isOfficeFixed}
                onSaveLocation={onSaveLocation}
                onRemoveLocation={onRemoveLocation}
                savedLocations={savedLocations}
            />
        </div>
    );
};

// --- SCHEDULING VIEW ---
export const SchedulingView = ({ selectedTime, onCancel, onSelect }) => {
    const [t, setT] = useState({ 
        h: selectedTime?.getHours() % 12 || 12, 
        m: selectedTime?.getMinutes() || 0,
        p: selectedTime?.getHours() >= 12 ? 'PM' : 'AM' 
    });
    const [isTomorrow, setIsTomorrow] = useState(false);
    const [error, setError] = useState(null);
    
    // Typing handlers with validation
    const handleHourChange = (val) => {
        setError(null);
        let n = parseInt(val);
        if (isNaN(n)) n = '';
        if (n > 12) n = 12;
        if (n === 0) n = 1; 
        setT(p => ({...p, h: n}));
    };

    const handleMinuteChange = (val) => {
        setError(null);
        let n = parseInt(val);
        if (isNaN(n)) n = '';
        if (n > 59) n = 59;
        setT(p => ({...p, m: n}));
    };

    const handleConfirm = () => {
        const d = new Date(); 
        if (isTomorrow) d.setDate(d.getDate() + 1);
        
        let h = parseInt(t.h) || 12; 
        if (t.p === 'PM' && h < 12) h += 12; 
        if (t.p === 'AM' && h === 12) h = 0; 
        d.setHours(h, parseInt(t.m) || 0, 0, 0); 
        
        // Past time validation for Today
        if (!isTomorrow && d < new Date()) {
            setError("Rides cannot be scheduled in the past.");
            return;
        }

        onSelect(d);
    };

    return (
        <ActionModal
            visible={true}
            title="Departure"
            description="When would you like to request your ride?"
            onConfirm={handleConfirm}
            onCancel={onCancel}
            confirmText="Set Time"
            isDangerous={false}
        >
            <div className='flex flex-col items-center gap-6 py-2'>
                {/* Visual context for the picker */}
                <div className='absolute -top-10 -left-10 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl -z-10'></div>

                {/* Day Switcher */}
                <div className='bg-slate-100/50 p-1 rounded-2xl flex w-full max-w-[200px] shadow-inner border border-slate-200/50'>
                    <button 
                        onClick={() => { setIsTomorrow(false); setError(null); }} 
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 font-black text-[9px] uppercase tracking-widest ${!isTomorrow ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5' : 'text-slate-700 hover:text-slate-900'}`}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => { setIsTomorrow(true); setError(null); }} 
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 font-black text-[9px] uppercase tracking-widest ${isTomorrow ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5' : 'text-slate-700 hover:text-slate-900'}`}
                    >
                        Tomorrow
                    </button>
                </div>
                
                {/* Time Selection Row */}
                <div className='flex justify-center gap-4 relative items-center'>
                    {/* Hours Column */}
                    <div className='flex flex-col items-center'>
                        <button onClick={() => { setT(p => ({...p, h: p.h === 12 ? 1 : (parseInt(p.h)||0)+1})); setError(null); }} className='p-2 text-slate-700 hover:text-orange-500 transition-colors'><svg className='w-5 h-5 rotate-180' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M19 9l-7 7-7-7' strokeWidth={3}/></svg></button>
                        <input 
                            type="tel" 
                            value={t.h} 
                            onChange={(e) => handleHourChange(e.target.value)}
                            className='w-16 h-20 bg-white/50 border border-slate-200 rounded-2xl text-center text-3xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400/30 shadow-sm'
                        />
                        <button onClick={() => { setT(p => ({...p, h: p.h === 1 ? 12 : (parseInt(p.h)||0)-1})); setError(null); }} className='p-2 text-slate-700 hover:text-orange-500 transition-colors'><svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M19 9l-7 7-7-7' strokeWidth={3}/></svg></button>
                    </div>
                    
                    <span className='text-3xl font-black text-slate-700 self-center mb-1'>:</span>
                    
                    {/* Minutes Column */}
                    <div className='flex flex-col items-center'>
                        <button onClick={() => { setT(p => ({...p, m: (parseInt(p.m)||0) === 59 ? 0 : (parseInt(p.m)||0)+1})); setError(null); }} className='p-2 text-slate-700 hover:text-orange-500 transition-colors'><svg className='w-5 h-5 rotate-180' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M19 9l-7 7-7-7' strokeWidth={3}/></svg></button>
                        <input 
                            type="tel" 
                            value={t.m.toString().padStart(2, '0')} 
                            onChange={(e) => handleMinuteChange(e.target.value)}
                            className='w-16 h-20 bg-white/50 border border-slate-200 rounded-2xl text-center text-3xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400/30 shadow-sm'
                        />
                        <button onClick={() => { setT(p => ({...p, m: (parseInt(p.m)||0) === 0 ? 59 : (parseInt(p.m)||0)-1})); setError(null); }} className='p-2 text-slate-700 hover:text-orange-500 transition-colors'><svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M19 9l-7 7-7-7' strokeWidth={3}/></svg></button>
                    </div>
                    
                    {/* AM/PM Switch */}
                    <button 
                        onClick={() => { setT(p => ({...p, p: p.p === 'AM' ? 'PM' : 'AM'})); setError(null); }} 
                        className='w-16 h-20 self-center bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-slate-800'
                    >
                        {t.p}
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className='w-full -mb-2 py-3 bg-rose-50/80 backdrop-blur-md border border-rose-100 rounded-2xl flex items-center justify-center animate-in zoom-in-95 duration-200'>
                        <p className='text-rose-500 font-black text-[10px] uppercase tracking-wider flex items-center gap-2'>
                            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} /></svg>
                            {error}
                        </p>
                    </div>
                )}
            </div>
        </ActionModal>
    );
};
