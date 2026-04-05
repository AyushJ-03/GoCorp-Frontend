import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import ActionModal from '../components/common/ActionModal';

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

    const fetchRide = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/ride/${id}`);
            setRide(res.data?.data);
        } catch (err) {
            showToast('Failed to load ride details', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        setShowBottomNav(false);
        fetchRide();
        return () => setShowBottomNav(true);
    }, [id, setShowBottomNav, fetchRide]);

    const handleCancel = useCallback(async () => {
        setCancelLoading(true);
        try {
            await api.patch(`/ride/cancel/${id}`, { cancel_reason: selectedReason });
            setShowCancelModal(false);
            showToast('Ride cancelled successfully', 'success');
            fetchRide();
        } catch (err) {
            showToast('Failed to cancel ride', 'error');
        } finally {
            setCancelLoading(false);
        }
    }, [id, selectedReason, showToast, fetchRide]);

    if (loading && !ride) return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
            <div className='w-full max-w-md bg-white rounded-4xl p-10 text-center shadow-sm animate-pulse'>
                <div className='w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-6'></div>
                <div className='h-5 bg-slate-100 rounded-full w-3/4 mx-auto mb-3'></div>
                <div className='h-4 bg-slate-100 rounded-full w-1/2 mx-auto'></div>
            </div>
        </div>
    );

    if (!ride) return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
            <div className='w-full max-w-md bg-white rounded-4xl p-10 text-center shadow-xl'>
              <h2 className='text-xl font-black text-slate-800'>Ride not found</h2>
              <button onClick={() => navigate(-1)} className='mt-6 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest'>Go Back</button>
            </div>
        </div>
    );

    const isUpcoming = ["PENDING", "IN_CLUSTERING", "CLUSTERED", "BOOKED_SOLO"].includes(ride.status);

    return (
        <div className='min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-24'>
            {/* Header section with status */}
            <div className='bg-white px-6 pt-16 pb-8 border-b border-slate-100 sticky top-0 z-40 shadow-sm'>
                <div className='flex items-center gap-5 mb-8'>
                    <button 
                        onClick={() => navigate(-1)} 
                        className='p-4 bg-slate-900/5 backdrop-blur-xl text-slate-900 rounded-2xl active:scale-95 transition-all'
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 19l-7-7 7-7' /></svg>
                    </button>
                    <div className="min-w-0">
                        <h1 className='text-3xl font-black text-slate-900 leading-tight tracking-tight'>Ride Ticket</h1>
                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Your Confirmed Trip</p>
                    </div>
                </div>

                <div className='flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100'>
                    <div className='flex items-center gap-3'>
                        <div className={`w-2.5 h-2.5 rounded-full bg-blue-500 ${isUpcoming ? 'animate-pulse' : ''}`}></div>
                        <span className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-800'>{ride.status}</span>
                    </div>
                    <div className='text-right'>
                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>Scheduled Time</p>
                        <p className='text-sm font-black text-blue-600 uppercase tracking-widest'>
                            {ride.scheduled_at ? new Date(ride.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true}) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details Content */}
            <div className='px-6 pt-8 space-y-4'>
                {/* Main Vertical Bar: Departure & Arrival */}
                <div className='bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4'>
                    <div className='flex items-start gap-4'>
                        <div className='mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0'></div>
                        <div className='min-w-0'>
                            <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>From Destination</p>
                            <p className='text-sm font-bold text-slate-700 leading-tight'>{ride.pickup_address}</p>
                        </div>
                    </div>
                    <div className='ml-1.5 w-px h-6 bg-slate-100'></div>
                    <div className='flex items-start gap-4'>
                        <div className='mt-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-50 shrink-0'></div>
                        <div className='min-w-0'>
                            <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>To Departure</p>
                            <p className='text-sm font-bold text-slate-700 leading-tight'>{ride.drop_address}</p>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats Bar */}
                <div className='flex gap-4'>
                    <div className='flex-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm'>
                        <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Mode</p>
                        <p className='text-xs font-black text-slate-800 uppercase tracking-widest'>{ride.solo_preference ? '🚗 Solo' : '👥 Pool'}</p>
                    </div>
                    <div className='flex-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm'>
                        <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Category</p>
                        <p className='text-xs font-black text-slate-800 uppercase tracking-widest'>{ride.destination_type}</p>
                    </div>
                </div>

                {/* Participants - Carpool transparency */}
                {!ride.solo_preference && (
                  <div className='bg-white rounded-3xl p-6 shadow-sm border border-slate-100'>
                      <h3 className='text-[9px] font-black text-slate-900 uppercase tracking-widest mb-4'>Participants</h3>
                      <div className='flex flex-wrap gap-4'>
                          <div className='flex flex-col items-center gap-1.5'>
                              <div className='w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xs border border-blue-100'>
                                  {ride.employee_id?.name?.first_name?.charAt(0)}{ride.employee_id?.name?.last_name?.charAt(0)}
                              </div>
                              <p className='text-[8px] font-bold text-slate-500 uppercase'>Owner</p>
                          </div>
                          {ride.invited_employee_ids?.map(emp => (
                              <div key={emp._id} className='flex flex-col items-center gap-1.5 opacity-80'>
                                  <div className='w-10 h-10 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center font-black text-xs border border-slate-100'>
                                      {emp.name?.first_name?.charAt(0)}{emp.name?.last_name?.charAt(0)}
                                  </div>
                                  <p className='text-[8px] font-bold text-slate-400 uppercase'>Invite</p>
                              </div>
                          ))}
                      </div>
                  </div>
                )}

                {/* Cancellation Meta */}
                {ride.status === 'CANCELLED' && (
                    <div className='bg-rose-50 p-6 rounded-3xl border border-rose-100'>
                        <p className='text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 font-black'>Cancellation Log</p>
                        <p className='text-xs font-bold text-rose-700 italic border-l-2 border-rose-200 pl-4 py-1'>{ride.cancel_reason || 'No specific reason given.'}</p>
                    </div>
                )}

                {/* Actions */}
                {isUpcoming && (
                  <div className="pt-6">
                    <button 
                       onClick={() => setShowCancelModal(true)}
                       disabled={cancelLoading}
                       className='w-full py-5 bg-rose-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3'
                    >
                       {cancelLoading ? 'Processing Request...' : 'Request Cancellation'}
                    </button>
                  </div>
                )}
            </div>

            {/* Cancel Modal */}
            <ActionModal
                visible={showCancelModal}
                title="Cancel Ride?"
                description="Are you sure you want to request cancellation? This cannot be undone."
                onConfirm={handleCancel}
                onCancel={() => setShowCancelModal(false)}
                confirmText={cancelLoading ? "Processing..." : "Confirm Cancellation"}
                isDangerous={true}
            >
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {['Change of plans', 'Wait time too long', 'Incorrect address', 'Other'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setSelectedReason(r)}
                      className={`p-4 rounded-xl text-left text-[10px] font-black uppercase tracking-widest border transition-all ${selectedReason === r ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
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
