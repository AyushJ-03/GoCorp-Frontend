import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import ActionModal from '../components/common/ActionModal';

// Modular Ride Components
import RideListItem from '../components/rides/RideListItem';
import EmptyRideState from '../components/rides/EmptyRideState';

/**
 * MyRides - Premium Ride History & Active Manifest.
 * Overhauled with modular components and high-fidelity glassmorphism.
 */
const MyRides = () => {
    const navigate = useNavigate();
    const { setShowBottomNav } = useUser();
    const { showToast } = useUI();
    
    const [rides, setRides] = useState({ active: [], past: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('active');
    
    // Modal & Cancellation States
    const [cancelTarget, setCancelTarget] = useState(null);
    const [selectedReason, setSelectedReason] = useState('Change of plans');

    const cancelReasons = [
        'Change of plans',
        'Found another ride',
        'Wait time too long',
        'Incorrect address',
        'Other'
    ];

    const fetchRides = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/user/my-rides');
            setRides(res.data?.data || { active: [], past: [] });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sync manifests');
            showToast('Sync failure detected', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (setShowBottomNav) setShowBottomNav(true);
        fetchRides();
    }, [setShowBottomNav, fetchRides]);

    const handleCancel = async () => {
        if (!cancelTarget) return;
        try {
            await api.patch(`/ride/cancel/${cancelTarget}`, { cancel_reason: selectedReason });
            setCancelTarget(null);
            showToast('Ride cancelled successfully', 'success');
            fetchRides();
        } catch (err) {
            // Handled by API interceptor
        }
    };

    const goToRideDetails = (id) => navigate(`/ride/details/${id}`);
    const displayedRides = tab === 'active' ? (rides.active || []) : (rides.past || []);

    if (loading && !rides.active.length && !rides.past.length) {
        return (
            <div className='min-h-screen bg-slate-50 flex flex-col px-6 pt-20 space-y-6'>
                <div className='h-12 w-48 bg-slate-200 rounded-full animate-pulse mb-10'></div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='h-32 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 animate-pulse'></div>
                ))}
            </div>
        );
    }

    return (
        <div className='w-full h-dvh bg-linear-to-b from-slate-50 to-blue-50 flex flex-col font-sans select-none overflow-x-hidden relative'>
            
            {/* Background Glows for Depth */}
            <div className='absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none'></div>
            <div className='absolute bottom-0 -left-32 w-96 h-96 bg-orange-400/10 rounded-full blur-[140px] pointer-events-none'></div>

            {/* Scroll Container */}
            <div className='flex-1 overflow-y-auto px-6 pt-16 pb-32 relative z-10'>
                
                {/* Header Section */}
                <div className='mb-10 animate-in slide-in-from-top-10 duration-700'>
                    <h1 className='text-4xl font-black text-slate-900 tracking-tight'>My Rides</h1>
                    <div className='flex items-center gap-2 opacity-50 mt-1 ml-1'>
                        <span className='w-1 h-1 bg-indigo-500 rounded-full'></span>
                        <p className='text-[10px] font-black uppercase tracking-widest'>Track and manage your requests</p>
                    </div>
                </div>

                {/* Tab Controller with Sliding Indicator */}
                <div className='relative flex p-1.5 bg-white/40 backdrop-blur-md rounded-[2.2rem] border border-white/60 mb-10 shadow-sm overflow-hidden'>
                    {/* The Sliding Background */}
                    <div 
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-950 rounded-[1.8rem] transition-all duration-500 ease-out shadow-2xl z-0 ${
                            tab === 'active' ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    />
                    
                    {['active', 'past'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`relative z-10 flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                tab === t ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {t === 'active' ? `Active (${rides.active?.length || 0})` : `History (${rides.past?.length || 0})`}
                        </button>
                    ))}
                </div>

                {/* Content Feed with Transactional Animation */}
                <div key={tab} className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                    {error ? (
                        <div className='text-center py-20 bg-rose-500/5 rounded-[3rem] border border-rose-500/10'>
                            <p className='text-rose-500 font-bold mb-6'>{error}</p>
                            <button 
                                onClick={fetchRides} 
                                className='px-10 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-200'
                            >
                                Retry
                            </button>
                        </div>
                    ) : displayedRides.length === 0 ? (
                        <EmptyRideState type={tab} />
                    ) : (
                        displayedRides.map((ride, idx) => (
                            <div key={ride._id} className='animate-in slide-in-from-bottom-10 duration-700' style={{ animationDelay: `${idx * 100}ms` }}>
                                <RideListItem 
                                    ride={ride} 
                                    onCancel={setCancelTarget} 
                                    onClick={goToRideDetails} 
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            
            <ActionModal
                visible={!!cancelTarget}
                title="Cancel Ride?"
                description="Please select a reason for canceling this request. This action cannot be undone."
                onConfirm={handleCancel}
                onCancel={() => setCancelTarget(null)}
                confirmText="Cancel Ride"
                isDangerous={true}
            >
                <div className='grid grid-cols-1 gap-2 mt-6'>
                    {cancelReasons.map(r => (
                        <button
                            key={r}
                            onClick={() => setSelectedReason(r)}
                            className={`p-4 rounded-2xl text-left text-[10px] font-bold transition-all border ${
                                selectedReason === r
                                    ? 'bg-slate-950 text-white border-slate-950 shadow-xl scale-[1.02]'
                                    : 'bg-white/50 border-white/60 text-slate-400 hover:bg-white hover:text-slate-600'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </ActionModal>
        </div>
    );
};

export default MyRides;
