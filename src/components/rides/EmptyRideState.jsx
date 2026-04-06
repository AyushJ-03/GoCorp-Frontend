import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EmptyRideState - A premium empty manifest visual.
 * Used when no active or history ride data is found.
 */
const EmptyRideState = ({ type }) => {
    const navigate = useNavigate();

    return (
        <div className='w-full py-20 px-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden'>
            
            {/* Atmospheric Background Glow */}
            <div className='absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl'></div>
            <div className='absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/10 rounded-full blur-3xl'></div>

            <div className='w-24 h-24 bg-white/80 rounded-[2.5rem] border border-white flex items-center justify-center mb-8 shadow-sm relative z-10'>
                <svg className='w-10 h-10 text-slate-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
            </div>

            <div className='relative z-10'>
                <h3 className='text-2xl font-black text-slate-900 tracking-tight uppercase mb-4'>
                    {type === 'active' ? 'No Active Rides' : 'No History Yet'}
                </h3>
                <p className='text-xs font-bold text-slate-400 leading-relaxed max-w-xs mx-auto mb-10 uppercase opacity-60'>
                    {type === 'active' 
                        ? "You don't have any active ride requests at the moment." 
                        : "Your ride history is currently empty."}
                </p>

                {type === 'active' && (
                    <button 
                        onClick={() => navigate('/home')}
                        className='px-10 py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:bg-black group flex items-center justify-center gap-4'
                    >
                        <span>Book a Ride</span>
                        <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M14 5l7 7m0 0l-7 7m7-7H3' /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyRideState;
