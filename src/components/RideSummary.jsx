import React from 'react';

/**
 * RideSummary Card - A premium, focused view for reviewing ride details before dispatch.
 * Uses advanced glassmorphism and a vertical route timeline.
 */
const RideSummary = ({ 
    officeAddress,
    pickup, 
    destination, 
    scheduledTime, 
    isSolo, 
    onToggleSolo, 
    onEditTime, 
    onEditPickup, 
    onEditDestination, 
    invitedEmployees = [],
    onAddInvite,
    onRemoveInvite,
    onBack,
    onConfirm, 
    loading,
    onOfficeRuleClick,
    isOfficeFixed,
    onSaveLocation,
    savedLocations = []
}) => {
    const isSaved = (addr) => savedLocations.some(s => s.addr === addr);
    // Format time for display (e.g., 09:45 PM)
    const formatTime = (date) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className='absolute inset-x-4 top-[10%] z-50 animate-in slide-in-from-top-10 duration-700 pointer-events-none'>
            <div className='bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/30 pointer-events-auto relative overflow-hidden'>
                {/* Decorative background glow */}
                <div className='absolute -top-24 -right-24 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl opacity-50'></div>
                
                <div className='flex items-center justify-between mb-8 relative z-10'>
                    <div className='flex items-center gap-4'>
                        <button 
                            onClick={onBack}
                            className='w-12 h-12 bg-slate-900/5 hover:bg-slate-900/10 active:scale-95 transition-all rounded-2xl flex items-center justify-center border border-slate-900/5 group'
                        >
                            <svg className='w-5 h-5 text-slate-800 group-hover:-translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M15 19l-7-7 7-7' strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} /></svg>
                        </button>
                        <div>
                            <h2 className='text-3xl font-black text-slate-900 tracking-tight'>Ride Summary</h2>
                            <p className='text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mt-1'>Review & Dispatch</p>
                        </div>
                    </div>
                    <div className='px-4 py-2 bg-slate-900/10 backdrop-blur-md rounded-2xl border border-slate-900/5'>
                        <span className='text-[10px] font-black text-slate-900 uppercase tracking-widest'>Ready</span>
                    </div>
                </div>

                {/* Vertical Route Timeline */}
                <div className='relative mb-8 space-y-2 z-10'>
                    {/* The dotted line connecting pickup and drop */}
                    <div className='absolute left-[21px] top-10 bottom-10 w-0.5 border-l-2 border-dashed border-slate-300/50'></div>

                    {/* Pickup Point */}
                    <div 
                        className={`group rounded-2xl flex items-center gap-4 transition-all border shadow-sm ${
                            isOfficeFixed === 'pickup' ? 'bg-slate-50/50 border-slate-100 opacity-80' : 'bg-white/40 backdrop-blur-xl border-white/50 hover:bg-white/60'
                        }`}
                    >
                        <div 
                            onClick={isOfficeFixed === 'pickup' ? onOfficeRuleClick : onEditPickup}
                            className='flex-1 flex items-center gap-4 p-4 cursor-pointer active:scale-[0.98] transition-all'
                        >
                            <div className='w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0 border border-emerald-100'>
                                <div className='w-2.5 h-2.5 bg-current rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]'></div>
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-[9px] font-black text-slate-700 uppercase tracking-widest mb-0.5'>Pick-up point</p>
                                <p className='text-sm font-bold text-slate-800 truncate leading-tight'>{pickup.addr}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (isOfficeFixed === 'pickup') {
                                    onOfficeRuleClick();
                                } else {
                                    onSaveLocation(pickup);
                                }
                            }}
                            className={`mr-4 w-8 h-8 rounded-lg ${isSaved(pickup.addr) || isOfficeFixed === 'pickup' ? 'bg-orange-500/10' : 'bg-slate-900/5'} flex items-center justify-center transition-all hover:bg-orange-500/20 active:scale-90 ${isOfficeFixed === 'pickup' || isSaved(pickup.addr) ? 'opacity-100' : 'opacity-100'}`}
                        >
                            <svg className={`w-4 h-4 ${isSaved(pickup.addr) || isOfficeFixed === 'pickup' ? 'text-orange-500' : 'text-slate-700'}`} fill={isSaved(pickup.addr) || isOfficeFixed === 'pickup' ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'><path d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} /></svg>
                        </button>
                    </div>

                    {/* Spacer */}
                    <div className='h-2'></div>

                    {/* Drop-off Point */}
                    <div 
                        className={`group rounded-2xl flex items-center gap-4 transition-all border shadow-sm ${
                            isOfficeFixed === 'destination' ? 'bg-slate-50/50 border-slate-100 opacity-80' : 'bg-white/40 backdrop-blur-xl border-white/50 hover:bg-white/60'
                        }`}
                    >
                        <div 
                            onClick={isOfficeFixed === 'destination' ? onOfficeRuleClick : onEditDestination}
                            className='flex-1 flex items-center gap-4 p-4 cursor-pointer active:scale-[0.98] transition-all'
                        >
                            <div className='w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shadow-sm shrink-0 border border-rose-100'>
                                <div className='w-2.5 h-2.5 bg-current rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]'></div>
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-[9px] font-black text-slate-700 uppercase tracking-widest mb-0.5'>Drop-off destination</p>
                                <p className='text-sm font-bold text-slate-800 truncate leading-tight'>{destination.addr}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (isOfficeFixed === 'destination') {
                                    onOfficeRuleClick();
                                } else {
                                    onSaveLocation(destination);
                                }
                            }}
                            className={`mr-4 w-8 h-8 rounded-lg ${isSaved(destination.addr) || isOfficeFixed === 'destination' ? 'bg-orange-500/10' : 'bg-slate-900/5'} flex items-center justify-center transition-all hover:bg-orange-500/20 active:scale-90 ${isOfficeFixed === 'destination' || isSaved(destination.addr) ? 'opacity-100' : 'opacity-100'}`}
                        >
                            <svg className={`w-4 h-4 ${isSaved(destination.addr) || isOfficeFixed === 'destination' ? 'text-orange-500' : 'text-slate-700'}`} fill={isSaved(destination.addr) || isOfficeFixed === 'destination' ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'><path d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} /></svg>
                        </button>
                    </div>
                </div>

                {/* Invitations Section - Only for Pooled rides */}
                {!isSolo && (
                    <div className='mb-8 relative z-10'>
                        <div className='flex items-center justify-between mb-4 px-1'>
                            <h3 className='text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]'>Invited Coworkers</h3>
                            <span className='px-2 py-0.5 bg-slate-900/5 rounded-full text-[9px] font-black text-slate-700'>{invitedEmployees.length}/3</span>
                        </div>
                        
                        <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-none'>
                            {/* Invited List */}
                            {invitedEmployees.map((emp) => (
                                <div 
                                    key={emp._id} 
                                    onClick={() => onRemoveInvite(emp._id)}
                                    className='relative group animate-in zoom-in-50 duration-300'
                                >
                                    <div className='w-12 h-12 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl flex items-center justify-center text-xs font-black text-slate-800 shadow-sm group-hover:bg-rose-50 group-hover:text-rose-500 transition-all cursor-pointer'>
                                        {emp.name.first_name[0]}{emp.name.last_name[0]}
                                    </div>
                                    <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 uppercase tracking-tighter'>Remove</div>
                                </div>
                            ))}

                            {/* Add Button */}
                            {invitedEmployees.length < 3 && (
                                <button 
                                    onClick={onAddInvite}
                                    className='w-12 h-12 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-all hover:bg-slate-800'
                                >
                                    <svg className='w-5 h-5 font-black' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M12 4v16m8-8H4' strokeWidth={3} /></svg>
                                </button>
                            )}

                            {invitedEmployees.length === 0 && (
                                <div 
                                    onClick={onAddInvite}
                                    className='flex-1 py-4 bg-white/10 border border-white/20 border-dashed rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all group'
                                >
                                    <p className='text-[9px] font-black text-slate-700 group-hover:text-slate-900 uppercase tracking-widest'>Click + to invite colleagues</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Extra Details (Time & Preference) */}
                <div className='grid grid-cols-2 gap-4 mb-8 z-10 relative'>
                    {/* Time Picker Trigger */}
                    <div 
                        onClick={onEditTime}
                        className='bg-slate-900/80 backdrop-blur-xl text-white p-5 rounded-3xl shadow-xl active:scale-[0.95] transition-all cursor-pointer hover:bg-slate-900 border border-slate-700 group'
                    >
                        <p className='text-[9px] font-black text-white/50 uppercase tracking-widest mb-1 group-hover:text-orange-400 transition-colors'>Departure</p>
                        <div className='flex items-baseline gap-1'>
                            <p className='text-2xl font-black tracking-tight'>{formatTime(scheduledTime).split(' ')[0]}</p>
                            <span className='text-[10px] font-black opacity-50'>{formatTime(scheduledTime).split(' ')[1]}</span>
                        </div>
                    </div>

                    {/* Ride Preference Switcher */}
                    <div className='bg-white/40 backdrop-blur-xl p-1.5 rounded-3xl flex shadow-inner border border-white/50'>
                        <button 
                            onClick={onToggleSolo} 
                            className={`flex-1 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${isSolo ? 'bg-white text-slate-900 shadow-md' : 'text-slate-700 hover:text-slate-900'}`}
                        >
                            <span className='text-[10px] font-black uppercase tracking-widest'>Solo</span>
                        </button>
                        <button 
                            onClick={onToggleSolo} 
                            className={`flex-1 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${!isSolo ? 'bg-white text-slate-900 shadow-md' : 'text-slate-700 hover:text-slate-900'}`}
                        >
                            <span className='text-[10px] font-black uppercase tracking-widest'>Pool</span>
                        </button>
                    </div>
                </div>

                {/* Final Action Button */}
                <button 
                    onClick={onConfirm} 
                    disabled={loading} 
                    className='relative w-full py-6 bg-slate-900 group overflow-hidden rounded-[2rem] font-black text-[10px] tracking-[0.3em] uppercase text-white shadow-[0_15px_30px_rgba(15,23,42,0.3)] active:scale-[0.98] transition-all disabled:opacity-50'
                >
                    <div className='absolute inset-0 bg-linear-to-r from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                    <div className='relative flex items-center justify-center gap-4'>
                        {loading ? (
                            <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                        ) : (
                            <>
                                <span>Confirm Dispatch</span>
                                <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M17 8l4 4m0 0l-4 4m4-4H3' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} /></svg>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default RideSummary;
