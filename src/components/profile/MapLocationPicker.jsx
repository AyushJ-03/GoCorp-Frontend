import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import api, { mapService } from '../../services/api';
import { isValidPos } from '../../utils/geoUtils';

/**
 * Shared Map Components - Exact Parity with DashboardViews.jsx
 */
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (isValidPos(center)) map.setView(center, 16);
    }, [center, map]);
    return null;
};

const MapInitializer = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 500);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const MapEvents = ({ onMoveStart, onMoveEnd, geocodeTimeout }) => {
    useMapEvents({
        movestart: () => {
            onMoveStart();
            if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
        },
        moveend: (e) => {
            const center = e.target.getCenter();
            onMoveEnd(center);
        }
    });
    return null;
};

const MapLocationPicker = ({ initialPos, onConfirm, onCancel }) => {
    // Exact State Pattern from Dashboard.jsx
    const [mapCenter, setMapCenter] = useState(isValidPos(initialPos) ? initialPos : [28.6273, 77.3725]);
    const [selectedPos, setSelectedPos] = useState(mapCenter);
    const [address, setAddress] = useState('Locating...');
    const [localQuery, setLocalQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

    const geocodeTimeout = useRef(null);
    const searchTimeout = useRef(null);

    // Exact Geocoding Logic from Dashboard.jsx
    const reverseGeocode = useCallback(async (center) => {
        const lat = center.lat;
        const lon = center.lng;
        setIsGeocoding(true);
        try {
            const res = await mapService.reverse(lat, lon);
            const addr = res.data?.data?.display_name || 'Selected Location';
            setAddress(addr);
            // Synchronize the search bar text as well
            setLocalQuery(addr);
        } catch (err) {
            if (err.response?.status === 429) {
                setAddress('Retrying location identification...');
            } else {
                setAddress('Failed to identify location');
            }
        } finally {
            setIsGeocoding(false);
            setIsDragging(false);
        }
    }, []);

    const debouncedGeocode = useCallback((center) => {
        if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
        geocodeTimeout.current = setTimeout(() => {
            reverseGeocode(center);
        }, 1000);
    }, [reverseGeocode]);

    // Exact Search Logic from Dashboard.jsx
    const handleSearch = useCallback(async (q) => {
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
        } catch (err) { }
        finally { setIsFetchingSuggestions(false); }
    }, []);

    useEffect(() => {
        if (!isTyping || !localQuery || localQuery.length < 3) {
            setSuggestions([]);
            return;
        }
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => handleSearch(localQuery), 500);
        return () => clearTimeout(searchTimeout.current);
    }, [localQuery, isTyping, handleSearch]);

    // Initial Geocode
    useEffect(() => {
        reverseGeocode({ lat: mapCenter[0], lng: mapCenter[1] });
        return () => {
            if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, []);

    const handleSuggestionClick = (s) => {
        const newPos = s.pos;
        setMapCenter(newPos);
        setSelectedPos(newPos);
        setAddress(s.addr);
        setLocalQuery(s.addr);
        setIsTyping(false);
        setSuggestions([]);
        reverseGeocode({ lat: newPos[0], lng: newPos[1] });
    };

    const onCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const latlng = [pos.coords.latitude, pos.coords.longitude];
                setMapCenter(latlng);
                setSelectedPos(latlng);
                reverseGeocode({ lat: latlng[0], lng: latlng[1] });
            });
        }
    };

    return (
        <div className='fixed inset-0 z-[1000] bg-white flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-300'>
            
            {/* 1. MAP BACKGROUND (Base Layer) */}
            <MapContainer 
                center={mapCenter} 
                zoom={16} 
                style={{ height: '100%', width: '100%', position: 'absolute', inset: 0, zIndex: 0 }} 
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
                <MapEvents 
                    onMoveStart={() => setIsDragging(true)}
                    onMoveEnd={(center) => {
                        setSelectedPos([center.lat, center.lng]);
                        debouncedGeocode(center);
                    }}
                    geocodeTimeout={geocodeTimeout}
                />
                <ChangeView center={mapCenter} />
                <MapInitializer />
            </MapContainer>

            {/* EXACT Screen Center Pin - Now direct child for clear visibility */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none flex items-center justify-center w-8 h-8">
                <div className="absolute inset-0 rounded-full border-[5px] border-orange-500 shadow-sm transition-transform duration-300"></div>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_6px_rgba(249,115,22,1)]"></div>
            </div>

            {/* EXACT Floating Header from DashboardViews.jsx */}
            <div className='absolute top-0 left-0 right-0 p-6 z-[150] animate-in slide-in-from-top duration-500'>
                <div className='max-w-md mx-auto bg-white/20 backdrop-blur-3xl rounded-[2.5rem] p-3 shadow-2xl border border-white/60'>
                    <div className='flex items-center gap-3'>
                        <button 
                            onClick={onCancel}
                            className='w-12 h-12 bg-white/60 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-slate-900 hover:text-orange-500 shrink-0'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M15 19l-7-7 7-7' strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} /></svg>
                        </button>
                        <div className='flex-1 relative'>
                            <input 
                                type='text' 
                                value={isTyping ? localQuery : address} 
                                onChange={(e) => { setLocalQuery(e.target.value); setIsTyping(true); }}
                                onFocus={(e) => { setLocalQuery(address); setIsTyping(true); e.target.select(); }}
                                onBlur={() => { if (!isFetchingSuggestions) setTimeout(() => setIsTyping(false), 200); }}
                                className='w-full px-5 py-4 bg-white/60 backdrop-blur-3xl border border-white/80 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-400' 
                                placeholder='Search home address...' 
                            />
                        </div>
                    </div>

                    {/* EXACT Suggestions Overlay from DashboardViews.jsx */}
                    {isTyping && (suggestions.length > 0 || isFetchingSuggestions) && (
                        <div className='mt-3 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-3 shadow-2xl border border-white/40 max-h-[300px] overflow-y-auto animate-in zoom-in-95 duration-200'>
                            {isFetchingSuggestions ? (
                                <div className='p-8 flex flex-col items-center gap-3'>
                                    <div className='w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
                                    <span className='text-[10px] font-black text-slate-600 uppercase tracking-widest'>Searching Area...</span>
                                </div>
                            ) : (
                                suggestions.map((s, i) => (
                                    <div key={i} onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s); }} className='p-4 hover:bg-white/80 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group'>
                                        <div className='w-10 h-10 bg-slate-900/5 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-orange-500 group-hover:text-white transition-all'>
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} /></svg>
                                        </div>
                                        <div className='flex-1 min-w-0 text-left'>
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

            {/* GPS FAB Button */}
            {!isTyping && (
                <button 
                    onClick={onCurrentLocation}
                    className='absolute bottom-32 right-6 z-40 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-slate-800 active:scale-90 transition-all border border-white/20 hover:text-orange-500'
                >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                </button>
            )}

            {/* EXACT Floating Footer from DashboardViews.jsx */}
            {!isTyping && (
                <div className='absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-6 animate-in slide-in-from-bottom duration-500'>
                    <button 
                        onClick={() => onConfirm({ addr: address, pos: selectedPos })}
                        disabled={isGeocoding || isDragging} 
                        className='w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-70'
                    >
                        {isGeocoding || isDragging ? (
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                <span>Updating...</span>
                            </div>
                        ) : (
                            <>
                                <span>Confirm Home Location</span>
                                <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M17 8l4 4m0 0l-4 4m4-4H3' strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} /></svg>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MapLocationPicker;
