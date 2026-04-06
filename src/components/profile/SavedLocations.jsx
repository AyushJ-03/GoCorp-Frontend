import React from 'react';

const SavedLocations = ({ locations, onDelete }) => {
    return (
        <div className='mb-8'>
            <div className='flex items-center justify-between mb-6 px-1'>
                <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]'>Saved Destinations</h3>
                <span className='px-3 py-1 bg-indigo-500/5 text-indigo-500 text-[8px] font-black tracking-widest uppercase rounded-full border border-indigo-500/10'>
                    {locations?.length || 0} Places
                </span>
            </div>

            <div className='space-y-4'>
                {locations?.length > 0 ? (
                    locations.map((loc, idx) => (
                        <div key={idx} className='bg-white/50 backdrop-blur-3xl rounded-[2rem] p-5 flex items-center gap-5 border border-white/60 shadow-xl group hover:bg-white/80 transition-all duration-300'>
                            <div className='w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform'>
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-black text-slate-900 truncate leading-tight mb-1'>{loc.addr}</p>
                                <p className='text-[8px] font-black text-indigo-500 uppercase tracking-widest opacity-60'>Saved Place</p>
                            </div>
                            <button 
                                onClick={() => onDelete(loc.addr)} 
                                className='w-12 h-12 bg-rose-500/5 text-rose-500 rounded-2xl flex items-center justify-center active:scale-90 hover:bg-rose-500 hover:text-white transition-all shadow-sm'
                            >
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' /></svg>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className='bg-white/30 backdrop-blur-md rounded-[2.5rem] p-10 text-center border-2 border-white/40 border-dashed'>
                        <div className='w-16 h-16 bg-slate-950/5 text-slate-400 rounded-3xl mx-auto mb-6 flex items-center justify-center'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.788 0l5.447 2.724A2 2 0 0118 6v9.382a2 2 0 01-1.106 1.789L11.447 19.553a2 2 0 01-1.788 0z' /></svg>
                        </div>
                        <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]'>No saved locations yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedLocations;
