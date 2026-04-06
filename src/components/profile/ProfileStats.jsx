import React from 'react';

const ProfileStats = ({ totalRides, upcomingRides }) => {
    return (
        <div className='grid grid-cols-2 gap-4 mb-6'>
            <div className='bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl group hover:bg-white/60 hover:-translate-y-1 transition-all duration-300'>
                <div className='flex items-center justify-between mb-4'>
                    <div className='w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' /></svg>
                    </div>
                </div>
                <div className='min-w-0'>
                    <p className='text-3xl font-black text-slate-900 tracking-tight'>{totalRides || 0}</p>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1'>Total Rides</p>
                </div>
            </div>

            <div className='bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl group hover:bg-white/60 hover:-translate-y-1 transition-all duration-300'>
                <div className='flex items-center justify-between mb-2'>
                    <div className='w-10 h-10 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                    </div>
                </div>
                <div className='min-w-0'>
                    <p className='text-3xl font-black text-slate-900 tracking-tight'>{upcomingRides || 0}</p>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1'>Upcoming Rides</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileStats;
