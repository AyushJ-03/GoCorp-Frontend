import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import ActionModal from '../components/common/ActionModal';

// --- INLINED SUB-COMPONENTS ---

// Status config: colors, labels, icons
const STATUS_CONFIG = {
  PENDING: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-400' },
  IN_CLUSTERING: { label: 'Finding Match', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-400' },
  CLUSTERED: { label: 'Match Found', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dot: 'bg-indigo-400' },
  BOOKED_SOLO: { label: 'Solo Ride', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-400' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-200', dot: 'bg-rose-400' },
};

const RideCard = ({ ride, onCancel, onClick }) => {
  const cfg = STATUS_CONFIG[ride.status] || STATUS_CONFIG.PENDING;
  const statusLabel = ride.status_label || cfg.label;

  return (
    <div 
      onClick={() => onClick(ride._id)}
      className={`bg-white rounded-4xl border ${cfg.border} shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform`}
    >
      <div className='bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex items-center justify-between group hover:border-orange-100 transition-colors'>
          <div className='flex items-center gap-5'>
              <div className={`w-4 h-4 rounded-full ring-8 ${ride.status === 'CANCELLED' ? 'bg-rose-500 ring-rose-50' : 'bg-orange-500 ring-orange-50 animate-pulse'}`}></div>
              <span className='text-3xl font-black text-slate-800 uppercase tracking-tighter'>{statusLabel}</span>
          </div>
          <p className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2rem] bg-slate-50 px-4 py-2 rounded-full border border-slate-100'>
              {ride.scheduled_at ? new Date(ride.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
          </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-50 shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pickup</p>
              <p className="text-sm font-bold text-slate-700 leading-snug truncate">{ride.pickup_address || 'N/A'}</p>
            </div>
          </div>
          <div className="ml-1 w-px h-4 bg-slate-100"></div>
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-400 ring-4 ring-rose-50 shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drop</p>
              <p className="text-sm font-bold text-slate-700 leading-snug truncate">{ride.drop_address || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {ride.destination_type}
          </span>
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {ride.solo_preference ? '🚗 Solo' : '👥 Pool'}
          </span>
          {ride.is_late_request && (
            <span className="px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-widest">
              ⚡ Late
            </span>
          )}
        </div>

        {["PENDING", "IN_CLUSTERING", "CLUSTERED", "BOOKED_SOLO"].includes(ride.status) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(ride._id);
            }}
            className="w-full mt-2 py-4 bg-rose-500/80 backdrop-blur-lg text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:scale-105 hover:shadow-lg"
          >
            Cancel Ride
          </button>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const MyRides = () => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [rides, setRides] = useState({ active: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('active');
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
      setError(err.response?.data?.message || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      setError(null);
      await api.patch(`/ride-request/cancel/${cancelTarget}`, { cancel_reason: selectedReason });
      setCancelTarget(null);
      showToast('Ride cancelled successfully', 'success');
      fetchRides();
    } catch (err) {
      // Error is handled globally
    }
  };

  const goToRideDetails = (id) => navigate(`/ride/details/${id}`);
  const goToBooking = () => navigate('/home');
  const displayedRides = tab === 'active' ? (rides.active || []) : (rides.past || []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="px-6 pt-14 pb-4 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Rides</h1>
        <p className="text-slate-500 font-medium text-sm mt-0.5">Track your requests & history</p>

        <div className="flex gap-2 mt-6">
          {['active', 'past'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === t ? 'bg-slate-900/80 backdrop-blur-lg text-white shadow-xl scale-100 font-black' : 'bg-slate-100/70 backdrop-blur-md text-slate-500 font-black'
              }`}
            >
              {t === 'active' ? `Active (${rides.active?.length || 0})` : `History (${rides.past?.length || 0})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 pb-32 space-y-5 lg:space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-12 bg-slate-50"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-slate-50 rounded-full w-16"></div>
                    <div className="h-8 bg-slate-50 rounded-full w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-rose-500 font-bold mb-6">{error}</p>
            <button onClick={fetchRides} className="px-10 py-4 bg-slate-900/80 backdrop-blur-lg text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-2xl active:scale-95 hover:scale-105 transition-all">
              Retry
            </button>
          </div>
        ) : displayedRides.length === 0 ? (
          <div className="text-center py-20 px-8 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-white border border-slate-100 rounded-4xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800">{tab === 'active' ? 'No active rides' : 'No past rides'}</h3>
            <p className="text-sm text-slate-400 mt-2 mb-10 font-medium">
              {tab === 'active' ? 'Looking for a ride? Start your journey now.' : 'Your travel history will appear right here.'}
            </p>
            {tab === 'active' && (
              <button 
                onClick={goToBooking} 
                className="px-10 py-5 bg-slate-900/80 backdrop-blur-lg text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25rem] shadow-2xl active:scale-95 hover:scale-105 transition-all hover:shadow-3xl"
              >
                Book a New Ride
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {displayedRides.map(ride => (
              <div key={ride._id} className="animate-in slide-in-from-bottom-5 duration-500">
                  <RideCard 
                    ride={ride} 
                    onCancel={setCancelTarget} 
                    onClick={goToRideDetails}
                  />
              </div>
            ))}
          </div>
        )}
      </div>

      <ActionModal
          visible={!!cancelTarget}
          title="Cancel Ride?"
          description="Please select a reason for cancellation. This action cannot be undone."
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          confirmText="Yes, Cancel"
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
                              : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
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
