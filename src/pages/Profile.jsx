import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import ActionModal from '../components/common/ActionModal';

const Profile = () => {
    const { user, login, logout, setShowBottomNav } = useUser();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Modal States
    const [showLogout, setShowLogout] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [form, setForm] = useState({
        first_name: user?.name?.first_name || '',
        last_name: user?.name?.last_name || '',
        contact: user?.contact || '',
    });

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/user/summary');
            const data = res.data?.data;
            setSummary(data);
            if (data) {
                setForm({
                    first_name: data.firstName || '',
                    last_name: data.lastName || '',
                    contact: data.contact || '',
                });
            }
        } catch (err) {
            setError('Failed to fetch profile details');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setShowBottomNav(true);
        fetchSummary();
    }, [setShowBottomNav, fetchSummary]);

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setSaveLoading(true);
        try {
            const res = await api.patch('/user/update-profile', {
                name: {
                    first_name: form.first_name,
                    last_name: form.last_name
                },
                contact: form.contact
            });
            login(res.data.data.user, localStorage.getItem('token'));
            setToast({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
            fetchSummary();
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Update failed', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSaveLoading(false);
        }
    };

    const confirmRemoveLocation = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete('/user/saved-locations', { data: { addr: deleteTarget } });
            setToast({ message: 'Location removed', type: 'success' });
            setShowDelete(false);
            setDeleteTarget(null);
            fetchSummary();
        } catch (err) {
            setToast({ message: 'Failed to remove location', type: 'error' });
        }
    };

    if (loading && !summary) {
        return (
            <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
                <div className='w-full max-w-md bg-white rounded-4xl p-10 text-center shadow-sm animate-pulse'>
                    <div className='w-20 h-20 bg-slate-100 rounded-4xl mx-auto mb-6'></div>
                    <div className='h-5 bg-slate-100 rounded-full w-3/4 mx-auto mb-3'></div>
                    <div className='h-4 bg-slate-100 rounded-full w-1/2 mx-auto'></div>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-dvh bg-linear-to-b from-slate-50 to-blue-50 flex flex-col px-6 pt-12 pb-32 font-sans select-none overflow-y-auto'>
            <div className='mb-8'>
                <h1 className='text-5xl font-black text-slate-900 tracking-tight'>Profile</h1>
                <p className='text-slate-600 font-medium text-sm mt-2'>Manage your personal settings</p>
            </div>

            {toast && (
                <div className={`mb-4 px-5 py-3 rounded-lg text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 border
                    ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {toast.type === 'success' ? '✓ ' : '✕ '} {toast.message}
                </div>
            )}

            {/* Profile Card */}
            <div className='bg-linear-to-br from-purple-500 to-purple-600 rounded-3xl p-6 mb-4 shadow-xl border border-white/20 relative overflow-hidden backdrop-blur-sm shrink-0'>
                <div className='flex items-start gap-4'>
                    <div className='w-16 h-16 bg-white/30 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white font-black text-xl border-2 border-white/50 shrink-0 shadow-lg'>
                        {form.first_name?.charAt(0)}{form.last_name?.charAt(0)}
                    </div>
                    <div className='flex-1 pt-1 overflow-hidden'>
                        <h2 className='text-white font-black text-xl truncate'>{form.first_name} {form.last_name}</h2>
                        <p className='text-white/80 text-sm truncate'>{user?.email}</p>
                    </div>
                </div>

                <div className='mt-6 bg-white/20 backdrop-blur-xl rounded-2xl p-4 flex justify-around text-center border border-white/30'>
                    <div>
                        <p className='text-2xl font-black text-white'>{summary?.rideCount || 0}</p>
                        <p className='text-white/80 text-[8px] font-black tracking-[0.2em] mt-1 uppercase'>Total Rides</p>
                    </div>
                    <div className='border-l border-white/30'></div>
                    <div>
                        <p className='text-2xl font-black text-white'>{summary?.savedLocations?.length || 0}</p>
                        <p className='text-white/80 text-[8px] font-black tracking-[0.2em] mt-1 uppercase'>Saved Places</p>
                    </div>
                </div>
            </div>

            {/* Saved Locations Section */}
            <div className='mb-6'>
                <h3 className='text-slate-900 font-black text-xs tracking-widest uppercase mb-4 opacity-50'>Saved Locations</h3>
                <div className='space-y-3'>
                    {summary?.savedLocations?.length > 0 ? (
                        summary.savedLocations.map((loc, idx) => (
                            <div key={idx} className='bg-white/40 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 border border-white/60 shadow-sm'>
                                <div className='w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-bold text-slate-800 truncate'>{loc.addr}</p>
                                    <p className='text-[9px] font-black text-slate-500 uppercase tracking-widest'>Location</p>
                                </div>
                                <button 
                                    onClick={() => { setDeleteTarget(loc.addr); setShowDelete(true); }} 
                                    className='w-10 h-10 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center active:scale-90 hover:bg-rose-100 hover:text-rose-500 transition-all'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className='bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center border border-white/40 border-dashed'>
                            <p className='text-slate-500 text-xs font-bold italic tracking-wide'>No saved locations yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Personal Info Form */}
            <div className='bg-white/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/60 mb-6'>
                <h3 className='text-slate-900 font-black text-xs tracking-widest uppercase mb-6 opacity-80'>Personal Info</h3>
                <form onSubmit={handleUpdateProfile} className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase mb-2 ml-1'>First Name</label>
                            <input type='text' value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} className='w-full px-4 py-3 bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/30' placeholder='First Name' />
                        </div>
                        <div>
                            <label className='block text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase mb-2 ml-1'>Last Name</label>
                            <input type='text' value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} className='w-full px-4 py-3 bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/30' placeholder='Last Name' />
                        </div>
                    </div>
                    <div>
                        <label className='block text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase mb-2 ml-1'>Phone</label>
                        <input type='tel' value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className='w-full px-4 py-3 bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/30' placeholder='Enter Phone' />
                    </div>
                    <button type='submit' disabled={saveLoading} className='w-full py-4 bg-slate-900/40 backdrop-blur-lg text-white font-black text-[10px] tracking-widest uppercase rounded-2xl active:scale-[0.98] transition-all hover:bg-slate-900/60 shadow-lg mt-4'>
                        {saveLoading ? 'Syncing...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Logout Button */}
            <button onClick={() => setShowLogout(true)} className='w-full py-5 bg-rose-500/40 backdrop-blur-md text-white font-black text-[10px] tracking-widest uppercase rounded-2xl active:scale-[0.98] transition-all hover:bg-rose-600/60 shadow-lg border border-rose-400/30'>
                Sign Out
            </button>

            {/* --- MODALS --- */}
            
            {/* Logout Modal */}
            <ActionModal 
                visible={showLogout} 
                title='Sign Out?' 
                description='Are you sure you want to end your current session?' 
                onConfirm={logout} 
                onCancel={() => setShowLogout(false)} 
                confirmText='Sign Out' 
                isDangerous={false}
            />

            {/* Delete Location Modal */}
            <ActionModal 
                visible={showDelete} 
                title='Remove Place' 
                description={`This will remove \"${deleteTarget}\" from your saved locations.`} 
                onConfirm={confirmRemoveLocation} 
                onCancel={() => { setShowDelete(false); setDeleteTarget(null); }} 
                confirmText='Remove' 
                isDangerous={true}
            />
        </div>
    );
};

export default Profile;
