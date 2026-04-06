import React from 'react';

const ProfileHeader = ({ firstName, lastName, email, role, officeName }) => {
    const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;

    return (
        <div className='bg-linear-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 mb-6 shadow-[0_20px_50px_rgba(79,70,229,0.2)] border border-white/20 relative overflow-hidden backdrop-blur-sm'>
            {/* Decorative Elements */}
            <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-30'></div>
            <div className='absolute top-0 right-0 p-4 opacity-10'>
                <svg className='w-24 h-24 text-white' fill='currentColor' viewBox='0 0 24 24'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>
            </div>

            <div className='flex items-center gap-5 relative z-10'>
                <div className='w-14 h-14 bg-white/20 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white font-black text-xl border-2 border-white/40 shrink-0 shadow-2xl animate-in zoom-in-95 duration-500'>
                    {initials || '?'}
                </div>
                <div className='min-w-0 flex-1 px-1'>
                    <div className='flex flex-wrap items-center gap-2 mb-1'>
                        <h2 className='text-2xl font-black text-white tracking-tighter leading-tight'>{firstName} {lastName}</h2>
                        <span className='px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-full border border-white/20'>
                            {role || 'Employee'}
                        </span>
                    </div>
                    <p className='text-indigo-100/70 text-xs font-bold truncate mb-3'>{email}</p>
                    
                    {officeName && (
                        <div className='flex items-center gap-2 bg-slate-950/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 w-fit shrink-0'>
                            <svg className='w-3 h-3 text-orange-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' /></svg>
                            <span className='text-white font-black text-[9px] uppercase tracking-widest'>{officeName}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
