import React from 'react';

/**
 * RideListItem - A premium, glassmorphic card representing a single ride request.
 * features a vertically aligned route visualization and high-fidelity status badges.
 */
const RideListItem = ({ ride, onCancel, onClick }) => {
  // Status configuration for premium visuals
  const STATUS_CONFIG = {
    PENDING: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    IN_CLUSTERING: { label: 'Finding Match', bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', dot: 'bg-blue-500' },
    CLUSTERED: { label: 'Match Found', bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20', dot: 'bg-indigo-500' },
    BOOKED_SOLO: { label: 'Solo Ride', bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20', dot: 'bg-purple-500' },
    ACCEPTED: { label: 'Accepted', bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    ARRIVED: { label: 'Arrived', bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20', dot: 'bg-orange-500' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  };

  const cfg = STATUS_CONFIG[ride.status] || STATUS_CONFIG.PENDING;
  const time = ride.scheduled_at ? new Date(ride.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

  return (
    <div 
        onClick={() => onClick(ride._id)}
        className='group relative bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 p-6 flex items-center justify-between gap-6 cursor-pointer active:scale-[0.98] transition-all hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden'
    >
        <div className='flex items-center gap-6 flex-1 min-w-0'>
            {/* Status Visual */}
            <div className='flex flex-col items-center gap-2 shrink-0'>
                <div className={`px-4 py-2 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center gap-2`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${ride.status !== 'CANCELLED' && ride.status !== 'COMPLETED' ? 'animate-pulse' : ''}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
                </div>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>{time}</p>
            </div>

            {/* Vertical Route Info */}
            <div className='relative pl-6 flex-1 min-w-0 border-l border-slate-200/50 flex flex-col gap-5'>
                <div className='absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 bg-linear-to-b from-indigo-500 to-orange-400 opacity-20'></div>

                <div className='flex flex-col gap-4'>
                    <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>Pickup</p>
                        <p className='text-xs font-black text-slate-900 leading-tight tracking-tight'>{ride.pickup_address || 'Unknown Origin'}</p>
                    </div>
                    <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>Drop-off</p>
                        <p className='text-xs font-black text-slate-900 leading-tight tracking-tight'>{ride.drop_address || 'Unknown Destination'}</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 mt-4 ml-1'>
                    <div className='flex items-center gap-1 px-2 py-1 bg-slate-950/5 rounded-lg border border-slate-950/5'>
                        <svg className='w-2.5 h-2.5 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /></svg>
                        <span className='text-[8px] font-black text-slate-500 uppercase tracking-widest'>{ride.solo_preference ? 'Solo' : 'Pool'}</span>
                    </div>
                    <div className='flex items-center gap-1 px-2 py-1 bg-slate-950/5 rounded-lg border border-slate-950/5'>
                        <svg className='w-2.5 h-2.5 text-orange-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                        <span className='text-[8px] font-black text-slate-500 uppercase tracking-widest'>{ride.destination_type}</span>
                    </div>
                </div>
            </div>

            {/* Action Arrow */}
            <div className='self-center shrink-0 w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M9 5l7 7-7 7' /></svg>
            </div>
        </div>
    </div>
  );
};

export default RideListItem;
