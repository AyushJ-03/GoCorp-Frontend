import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import ActionModal from '../components/common/ActionModal';

// --- MAIN PAGE ---

const RideDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setShowBottomNav } = useUser();
    const { showToast } = useUI();
    
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('Change of plans');

    const cancelReasons = [
        'Change of plans',
        'Found another ride',
        'Wait time too long',
        'Incorrect address',
        'Other'
    ];

    const fetchRide = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/ride-request/${id}`);
            setRide(res.data?.data);
        } catch (err) {
            // Error handled globally
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setShowBottomNav(false);
        fetchRide();
        return () => setShowBottomNav(true);
    }, [id, setShowBottomNav, fetchRide]);

    const handleCancel = async () => {
        setCancelLoading(true);
        try {
            await api.patch(`/ride-request/cancel/${id}`, { cancel_reason: selectedReason });
            setShowCancelModal(false);
            showToast('Ride cancelled successfully', 'success');
            fetchRide();
        } catch (err) {
            // Error handled globally
        } finally {
            setCancelLoading(false);
        }
    };

    const goBack = () => navigate(-1);

    if (loading && !ride) return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
            <div className='w-full max-w-md bg-white rounded-[2.5rem] p-10 text-center shadow-sm animate-pulse'>
                <div className='w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-6'></div>
                <div className='h-5 bg-slate-100 rounded-full w-3/4 mx-auto mb-3'></div>
                <div className='h-4 bg-slate-100 rounded-full w-1/2 mx-auto'></div>
            </div>
        </div>
    );

    if (!ride && !loading) return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
            <div className='w-full max-w-md bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-slate-100'>
                <div className='w-20 h-20 bg-rose-50 rounded-4xl mx-auto mb-6 flex items-center justify-center'>
                    <svg className='w-10 h-10 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                </div>
                <h2 className='text-2xl font-black text-slate-800 mb-3 tracking-tight'>Oops</h2>
                <p className='text-slate-500 text-sm mb-10 font-medium italic overflow-hidden text-ellipsis'>We couldn't find that ride.</p>
                <button onClick={goBack} className='w-full py-5 bg-slate-900/80 backdrop-blur-lg text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 hover:scale-105 transition-all hover:shadow-3xl'>Return to Dashboard</button>
            </div>
        </div>
    );

    const statusLabel = ride.status_label || (ride.status === 'IN_CLUSTERING' ? 'Finding Match' : ride.status);

    return (
        <div className='min-h-screen bg-slate-50 pb-20'>
            {/* Header */}
            <div className='bg-white px-6 pt-14 pb-6 border-b border-slate-100 sticky top-0 z-40 shadow-sm'>
                <div className='flex items-center gap-5'>
                    <button onClick={goBack} className='p-3 bg-slate-900/50 backdrop-blur-md text-white rounded-2xl hover:bg-slate-900/60 transition-all active:scale-90 hover:scale-105'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 19l-7-7 7-7' />
                        </svg>
                    </button>
                    <div className="min-w-0">
                        <h1 className='text-2xl font-black text-slate-900 leading-tight tracking-tight'>Ride Details</h1>
                        <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest truncate'>Reference: {ride._id}</p>
                    </div>
                </div>
            </div>

            <div className='px-6 py-8 space-y-6'>
                {/* Status Card */}
                <div className='bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex items-center justify-between group hover:border-orange-100 transition-colors'>
                    <div className='flex items-center gap-5'>
                        <div className={`w-4 h-4 rounded-full ring-8 ${ride.status === 'CANCELLED' ? 'bg-rose-500 ring-rose-50' : 'bg-orange-500 ring-orange-50 animate-pulse'}`}></div>
                        <span className='text-3xl font-black text-slate-800 uppercase tracking-tighter'>{statusLabel}</span>
                    </div>
                    <p className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2rem] bg-slate-50 px-4 py-2 rounded-full border border-slate-100'>
                        {ride.scheduled_at ? new Date(ride.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                    </p>
                </div>

                {/* Route Details */}
                <div className='bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8 relative overflow-hidden'>
                     <div className='flex flex-col gap-10 relative'>
                        {/* Connecting Line */}
                        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-slate-50 dashed border-l-2 border-dashed border-slate-100"></div>
                        
                        <div className='flex gap-5 relative z-10'>
                            <div className='w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm'>
                                <div className='w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]'></div>
                            </div>
                            <div className="min-w-0">
                                <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1'>Departure point</p>
                                <p className='text-sm font-bold text-slate-700 leading-snug'>{ride.pickup_address}</p>
                            </div>
                        </div>

                        <div className='flex gap-5 relative z-10'>
                            <div className='w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm'>
                                <div className='w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.5)]'></div>
                            </div>
                            <div className="min-w-0">
                                <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1'>Arrival destination</p>
                                <p className='text-sm font-bold text-slate-700 leading-snug'>{ride.drop_address}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className='border-t border-slate-50 pt-8 grid grid-cols-2 gap-6'>
                         <div className='bg-slate-50/50 p-4 rounded-2xl'>
                            <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1'>Category</p>
                            <p className='text-sm font-black text-slate-800 tracking-tight'>{ride.destination_type || 'N/A'}</p>
                         </div>
                         <div className='bg-slate-50/50 p-4 rounded-2xl'>
                            <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1'>Arrangement</p>
                            <p className='text-sm font-black text-slate-800 tracking-tight'>{ride.solo_preference ? '🚗 Solo' : '👥 Pool'}</p>
                         </div>
                    </div>
                </div>

                {/* Cancellation Message */}
                {ride.status === 'CANCELLED' && (
                    <div className='bg-rose-50/50 rounded-4xl border border-rose-100 p-8 animate-in zoom-in duration-300'>
                        <div className='flex items-center gap-3 mb-3'>
                            <svg className='w-5 h-5 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                            <h3 className='text-sm font-black text-rose-600 uppercase tracking-widest'>Cancellation Log</h3>
                        </div>
                        <p className='text-sm font-bold text-rose-700 italic border-l-4 border-rose-200 pl-4 py-1 leading-relaxed'>
                            {ride.cancel_reason || 'No specific reason given by the requester.'}
                        </p>
                        <p className='text-[10px] font-black text-rose-300 uppercase tracking-widest mt-4 text-right'>
                            {ride.cancelled_at ? new Date(ride.cancelled_at).toLocaleString() : ''}
                        </p>
                    </div>
                )}

                {/* Actions */}
                {["PENDING", "IN_CLUSTERING", "CLUSTERED", "BOOKED_SOLO"].includes(ride.status) && (
                    <div className="pt-4">
                        <button 
                            disabled={cancelLoading}
                            onClick={() => setShowCancelModal(true)}
                            className='w-full py-6 bg-rose-500/80 backdrop-blur-lg text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 hover:scale-105 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-3xl'
                        >
                            {cancelLoading ? <div className='w-4 h-4 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin'></div> : 'Request Cancellation'}
                        </button>
                    </div>
                )}
            </div>

            <ActionModal
                visible={showCancelModal}
                title="Cancel Ride?"
                description="Please select a reason for cancellation. This action cannot be undone."
                onConfirm={handleCancel}
                onCancel={() => setShowCancelModal(false)}
                confirmText={cancelLoading ? "Processing..." : "Yes, Cancel"}
                isDangerous={true}
            >
                <div className="grid grid-cols-1 gap-2 mt-4">
                    {cancelReasons.map(r => (
                        <button
                            key={r}
                            onClick={() => setSelectedReason(r)}
                            className={`p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                                selectedReason === r 
                                    ? 'bg-slate-900/10 border-slate-900/20 text-slate-900 ring-2 ring-slate-900/10' 
                                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
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

export default RideDetails;
