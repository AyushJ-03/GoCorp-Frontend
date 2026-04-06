import React from 'react';

const PersonalForm = ({ form, onChange, onSubmit, loading }) => {
    return (
        <div className='bg-white/40 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl border border-white/60 mb-8'>
            <div className='flex items-center gap-3 mb-8 ml-1'>
                <div className='w-2 h-2 bg-indigo-500 rounded-full animate-pulse'></div>
                <h3 className='text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] opacity-80'>Personal Details</h3>
            </div>
            
            <form onSubmit={onSubmit} className='space-y-6'>
                <div className='grid grid-cols-2 gap-6'>
                    <div className='relative group'>
                        <label className='absolute -top-2.5 left-4 px-2 bg-blue-50/50 backdrop-blur-md text-[8px] font-black text-indigo-500 tracking-[0.2em] uppercase transition-all group-focus-within:text-orange-500 z-10'>
                            First Name
                        </label>
                        <input 
                            type='text' 
                            value={form.first_name} 
                            onChange={(e) => onChange({...form, first_name: e.target.value})} 
                            className='w-full px-5 py-4 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:bg-white/80 transition-all placeholder:text-slate-300' 
                            placeholder='First Name' 
                        />
                    </div>
                    <div className='relative group'>
                        <label className='absolute -top-2.5 left-4 px-2 bg-blue-50/50 backdrop-blur-md text-[8px] font-black text-indigo-500 tracking-[0.2em] uppercase transition-all group-focus-within:text-orange-500 z-10'>
                            Last Name
                        </label>
                        <input 
                            type='text' 
                            value={form.last_name} 
                            onChange={(e) => onChange({...form, last_name: e.target.value})} 
                            className='w-full px-5 py-4 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:bg-white/80 transition-all placeholder:text-slate-300' 
                            placeholder='Last Name' 
                        />
                    </div>
                </div>

                <div className='relative group'>
                    <label className='absolute -top-2.5 left-4 px-2 bg-blue-50/50 backdrop-blur-md text-[8px] font-black text-indigo-500 tracking-[0.2em] uppercase transition-all group-focus-within:text-orange-500 z-10'>
                        Phone Number
                    </label>
                    <div className='relative'>
                        <input 
                            type='tel' 
                            value={form.contact} 
                            onChange={(e) => onChange({...form, contact: e.target.value})} 
                            className='w-full pl-12 pr-5 py-4 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:bg-white/80 transition-all placeholder:text-slate-300' 
                            placeholder='Mobile Number' 
                        />
                        <div className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' /></svg>
                        </div>
                    </div>
                </div>

                <button 
                    type='submit' 
                    disabled={loading} 
                    className='w-full py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all hover:bg-black group flex items-center justify-center gap-4'
                >
                    {loading ? (
                        <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                    ) : (
                        <>
                            <span>Save Changes</span>
                            <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M14 5l7 7m0 0l-7 7m7-7H3' /></svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default PersonalForm;
