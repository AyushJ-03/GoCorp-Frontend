import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import ActionModal from '../components/common/ActionModal';
import { MapLayer } from '../components/DashboardViews';
import { MapEventsHandler, ChangeView } from './Dashboard';
import { isValidPos } from '../utils/geoUtils';

/**
 * RideDetails - Enhanced with Live Map & OSRM Polling
 */
const RideDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setShowBottomNav } = useUser();
    const { showToast } = useUI();

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('Change of plans');
    
    // Polling State
    const pollingRef = useRef(null);

    const fetchRide = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await api.get(`/ride/${id}`);
            const data = res.data?.data;
            setRide(data);
            
            // Stop polling if ride is final (COMPLETED, CANCELLED) or in a stable state we don't care about
            if (["COMPLETED", "CANCELLED", "DROPPED_OFF", "REJECTED"].includes(data.status)) {
                if (pollingRef.current) clearInterval(pollingRef.current);
            }
        } catch (err) {
            if (!silent) showToast('Failed to load ride details', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        setShowBottomNav(false);
        fetchRide();

        // Start polling for live clustering/batching updates
        pollingRef.current = setInterval(() => {
            fetchRide(true);
        }, 10000);

        return () => {
            setShowBottomNav(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
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
            <div className='w-full max-w-md bg-white/60 backdrop-blur-3xl rounded-[3rem] p-12 text-center border border-white/40 animate-pulse shadow-2xl'>
                <div className='w-20 h-20 bg-slate-200/50 rounded-3xl mx-auto mb-8 shadow-inner'></div>
                <div className='h-6 bg-slate-200/50 rounded-full w-3/4 mx-auto mb-4'></div>
                <div className='h-4 bg-slate-200/50 rounded-full w-1/2 mx-auto opacity-50'></div>
            </div>
        </div>
    );

    if (!ride) return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900'>
            <div className='w-full max-w-md bg-white/60 backdrop-blur-3xl rounded-[3rem] p-12 text-center shadow-2xl border border-white/40'>
              <div className='w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl mx-auto mb-6 flex items-center justify-center'>
                  <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' /></svg>
              </div>
              <h2 className='text-3xl font-black tracking-tighter mb-4 uppercase'>No Ticket Found</h2>
              <p className='text-slate-500 text-sm font-bold uppercase tracking-widest mb-10'>Verify your ride history</p>
              <button 
                  onClick={() => navigate(-1)} 
                  className='w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] shadow-xl active:scale-95 transition-all'
              >
                  Return to App
              </button>
            </div>
        </div>
    );

    const isUpcoming = ["PENDING", "IN_CLUSTERING", "CLUSTERED", "BOOKED_SOLO", "ACCEPTED", "ARRIVED"].includes(ride.status);
    const showOTP = ["ACCEPTED", "ARRIVED", "STARTED", "PENDING", "IN_CLUSTERING", "CLUSTERED", "BOOKED_SOLO"].includes(ride.status);

    // Extract real-time map data
    const pickupPos = ride.pickup_location?.coordinates 
        ? [ride.pickup_location.coordinates[1], ride.pickup_location.coordinates[2] || ride.pickup_location.coordinates[0]] 
        : null;
    // Wait, MongoDB is [lng, lat]. Let's be consistent.
    const getPos = (loc) => loc?.coordinates ? [loc.coordinates[1], loc.coordinates[0]] : null;
    
    const pPos = getPos(ride.pickup_location);
    const dPos = getPos(ride.drop_location);
    const officePos = getPos(ride.office_id?.office_location);
    
    // Extract polyline from either clustering or batching info
    const rawPolyline = ride.batch?.pickup_polyline?.coordinates || ride.clustering?.pickup_polyline?.coordinates || [];
    const polyline = rawPolyline.map(p => [p[1], p[0]]);

    return (
        <div className='min-h-screen bg-linear-to-b from-slate-50 to-blue-50 flex flex-col font-sans select-none pb-32 text-slate-900 relative overflow-x-hidden'>
            {/* Background Glows */}
            <div className='absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none'></div>
            <div className='absolute top-1/2 -left-32 w-80 h-80 bg-orange-400/10 rounded-full blur-[120px] pointer-events-none'></div>

            {/* Header / Sticky Bar */}
            <div className='sticky top-0 z-50 p-6 backdrop-blur-xl bg-white/40 border-b border-white/60'>
                <div className='flex items-center gap-5'>
                    <button 
                        onClick={() => navigate(-1)} 
                        className='w-12 h-12 bg-white/80 hover:bg-white active:scale-90 transition-all rounded-2xl flex items-center justify-center border border-white/60 shadow-sm group'
                    >
                        <svg className='w-5 h-5 group-hover:-translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M15 19l-7-7 7-7' /></svg>
                    </button>
                    <div className='min-w-0'>
                        <h1 className='text-2xl font-black tracking-tighter uppercase italic text-slate-900'>Ride Ticket</h1>
                        <div className='flex items-center gap-2 opacity-50'>
                            <span className='w-1 h-1 bg-slate-900 rounded-full animate-pulse'></span>
                            <p className='text-[8px] font-black uppercase tracking-[0.3em]'>System Transmit Secured</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className='px-6 pt-10 space-y-8 max-w-lg mx-auto w-full'>
                
                {/* LIVE MAP VIEW */}
                <div className='relative w-full h-80 rounded-[3rem] overflow-hidden border border-white/60 shadow-2xl animate-in zoom-in-95 duration-700'>
                    <MapLayer 
                        pickupPos={pPos}
                        destinationPos={dPos}
                        officePos={officePos}
                        polyline={polyline}
                        mapCenter={pPos || [28.6273, 77.3725]}
                        bookingStep='confirmSummary'
                        MapEventsHandler={MapEventsHandler}
                        ChangeView={ChangeView}
                        onMapMove={() => {}}
                        onReverseGeocode={() => {}}
                        onMoveStart={() => {}}
                        isDragging={false}
                        onCurrentLocation={() => {}}
                        participants={ride.group_participants || []}
                        currentRideId={id}
                    />
                    
                    {/* Status Badge Over Map */}
                    <div className='absolute top-6 left-6 z-40 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2'>
                        <div className={`w-2 h-2 rounded-full ${isUpcoming ? 'bg-indigo-400 animate-pulse' : 'bg-slate-400'}`}></div>
                        <span className='text-[8px] font-black text-white uppercase tracking-widest'>{ride.status}</span>
                    </div>
                </div>

                {/* CLUSTERING PROGRESS INDICATOR - Only show if we have data to avoid glitchy placeholders */}
                {ride.status === 'IN_CLUSTERING' && ride.clustering && (
                    <div className='bg-indigo-600 rounded-3xl p-6 shadow-xl border border-white/20 relative overflow-hidden group animate-in slide-in-from-top duration-500'>
                        <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
                        <div className='flex items-center justify-between gap-4'>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-1'>
                                    <div className='flex -space-x-3'>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className='w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center animate-pulse' style={{ animationDelay: `${i * 200}ms` }}>
                                                <svg className='w-4 h-4 text-white/50' fill='currentColor' viewBox='0 0 24 24'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>
                                            </div>
                                        ))}
                                    </div>
                                    <h4 className='text-sm font-black text-white tracking-tight'>Optimizing Group</h4>
                                </div>
                                <p className='text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none'>
                                    Seeking {4 - (ride.clustering?.current_size || 0)} more partners...
                                </p>
                            </div>
                            <div className='w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center'>
                                <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* OTP Section (Visual Centerpiece) */}
                {showOTP && (
                    <div className='relative group animate-in zoom-in-95 duration-700'>
                        <div className='bg-linear-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(79,70,229,0.2)] relative overflow-hidden border border-white/20'>
                            {/* Glowing Ring Decorative */}
                            <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-30'></div>
                            
                            <div className='flex items-center justify-between relative z-20'>
                                <div>
                                    <p className='text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-2'>Verification Required</p>
                                    <h3 className='text-sm font-black uppercase tracking-widest text-white leading-none mb-1'>Ride OTP</h3>
                                    <p className='text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none'>Share only with driver</p>
                                </div>
                                <div className='flex items-center gap-2 bg-slate-950/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl'>
                                    {ride.otp.split('').map((char, i) => (
                                        <span key={i} className='text-4xl font-black tracking-tight text-white animate-in slide-in-from-bottom duration-500' style={{ animationDelay: `${i * 100}ms` }}>{char}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Bar */}
                <div className='bg-white/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 flex items-center justify-between shadow-xl'>
                    <div className='flex items-center gap-4'>
                        <div className={`w-3 h-3 rounded-full ${isUpcoming ? 'bg-indigo-500 shadow-[0_0_15px_rgba(102,126,234,0.3)] animate-pulse' : 'bg-slate-300'}`}></div>
                        <div>
                            <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>Status</p>
                            <span className='text-sm font-black uppercase tracking-widest text-slate-900'>{ride.status}</span>
                        </div>
                    </div>
                    <div className='h-8 w-px bg-slate-200'></div>
                    <div className='text-right'>
                        <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-right'>Departure Time</p>
                        <span className='text-sm font-black uppercase tracking-[0.1em] text-orange-500'>
                            {ride.scheduled_at ? new Date(ride.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true}) : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Route Section */}
                <div className='bg-white/50 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/60 shadow-xl relative overflow-hidden'>
                    <div className='absolute top-1/2 left-8 bottom-1/2 w-0.5 border-l-2 border-dashed border-slate-200 translate-y-[-50%] h-[30%]'></div>
                    
                    <div className='space-y-10 relative z-10'>
                        <div className='flex items-start gap-5'>
                            <div className='w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] mt-1 shrink-0 border-4 border-white'></div>
                            <div className='min-w-0'>
                                <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>Pickup Address</p>
                                <p className='text-base font-bold text-slate-900 leading-tight tracking-tight'>{ride.pickup_address}</p>
                            </div>
                        </div>

                        <div className='flex items-start gap-5'>
                            <div className='w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] mt-1 shrink-0 border-4 border-white'></div>
                            <div className='min-w-0'>
                                <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>Destination Address</p>
                                <p className='text-base font-bold text-slate-900 leading-tight tracking-tight'>{ride.drop_address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ride Stats Icons Row */}
                <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-sm flex items-center gap-4 group hover:bg-white/60 transition-all'>
                        <div className='w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform'>
                            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /></svg>
                        </div>
                        <div className='min-w-0'>
                            <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Ride Mode</p>
                            <p className='text-[10px] font-black uppercase text-slate-900 truncate'>{ride.solo_preference ? 'Solo Ride' : 'Pooled Ride'}</p>
                        </div>
                    </div>
                    <div className='bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-sm flex items-center gap-4 group hover:bg-white/60 transition-all'>
                        <div className='w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform'>
                            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                        </div>
                        <div className='min-w-0'>
                            <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Category</p>
                            <p className='text-[10px] font-black uppercase text-slate-900 truncate'>{ride.destination_type}</p>
                        </div>
                    </div>
                </div>

                {/* Carpool Participants */}
                {!ride.solo_preference && (
                  <div className='bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl'>
                      <div className='flex items-center justify-between mb-8'>
                          <h3 className='text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]'>Participants</h3>
                          <span className='px-3 py-1 bg-slate-900/5 text-[9px] font-black tracking-widest uppercase rounded-full border border-slate-900/5'>
                            {ride.group_participants ? `Group Manifest (${ride.group_participants.length})` : 'Individual Booking'}
                          </span>
                      </div>
                      <div className='flex flex-wrap gap-6'>
                          {(ride.group_participants || [{ ...ride.employee_id, is_requester: true }]).map((emp, idx) => (
                              <div key={emp._id || idx} className={`flex flex-col items-center gap-3 group ${!emp.is_requester ? 'opacity-70 hover:opacity-100' : ''} transition-all text-center`}>
                                  <div className={`w-14 h-14 ${emp.is_requester ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'} rounded-[1.2rem] flex items-center justify-center font-black text-sm border-2 border-white shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                                      {emp.profile_image ? (
                                        <img src={emp.profile_image} alt={emp.name?.first_name} className='w-full h-full object-cover' />
                                      ) : (
                                        <span>{emp.name?.first_name?.charAt(0)}{emp.name?.last_name?.charAt(0)}</span>
                                      )}
                                  </div>
                                  <p className={`text-[9px] font-black ${emp.is_requester ? 'text-indigo-500' : 'text-slate-400'} uppercase tracking-widest`}>
                                    {emp.is_requester ? 'Requester' : 'Partner'}
                                  </p>
                              </div>
                          ))}
                          {/* If single ride has guests but no group participants yet (local view) */}
                          {!ride.group_participants && ride.invited_employee_ids?.map(emp => (
                              <div key={emp._id} className='flex flex-col items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity text-center'>
                                  <div className='w-14 h-14 bg-slate-100 text-slate-500 rounded-[1.2rem] flex items-center justify-center font-black text-sm border-2 border-white shadow-sm group-hover:scale-110 transition-transform'>
                                      {emp.name?.first_name?.charAt(0)}{emp.name?.last_name?.charAt(0)}
                                  </div>
                                  <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>Member</p>
                              </div>
                          ))}
                      </div>
                  </div>
                )}

                {/* Cancellation Meta */}
                {ride.status === 'CANCELLED' && (
                    <div className='bg-rose-500/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-rose-500/10 shadow-sm group'>
                        <div className='flex items-center gap-3 mb-4'>
                            <svg className='w-4 h-4 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' /></svg>
                            <p className='text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] font-black uppercase tracking-[0.2em]'>Cancellation Record</p>
                        </div>
                        <p className='text-sm font-bold text-rose-600/80 italic leading-relaxed pl-4 border-l border-rose-500/30'>{ride.cancel_reason || 'Manual override performed.'}</p>
                    </div>
                )}

                {/* Primary Action Buttons */}
                {isUpcoming && (
                  <div className="pt-10 pb-4">
                    <button 
                       onClick={() => setShowCancelModal(true)}
                       disabled={cancelLoading}
                       className='w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 hover:brightness-110'
                    >
                       {cancelLoading ? (
                           <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                       ) : (
                           <>
                               <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' /></svg>
                               <span>Request Cancellation</span>
                           </>
                       )}
                    </button>
                    <p className='text-center mt-6 text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]'>Immutable Record ID: {id.slice(-8)}</p>
                  </div>
                )}
            </main>

            {/* Cancel Modal Styling Update */}
            <ActionModal
                visible={showCancelModal}
                title="Cancel Ride?"
                description="This action cannot be undone. Are you sure you wish to transmit cancellation?"
                onConfirm={handleCancel}
                onCancel={() => setShowCancelModal(false)}
                confirmText={cancelLoading ? "Transmitting..." : "Discard Ticket"}
                isDangerous={true}
            >
                <div className="grid grid-cols-1 gap-3 mt-6">
                  {['Change of plans', 'Wait time too long', 'Incorrect address', 'Other'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setSelectedReason(r)}
                      className={`p-5 rounded-2xl text-left text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${selectedReason === r ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`}
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
