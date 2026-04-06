import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import ActionModal from '../components/common/ActionModal';

// Modular Profile Components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import SavedLocations from '../components/profile/SavedLocations';
import PersonalForm from '../components/profile/PersonalForm';

/**
 * Profile - Refactored Premium User Portal.
 * Now modularized for better maintainability and visual fidelity.
 */
const Profile = () => {
    const { user, login, logout, setShowBottomNav } = useUser();
    const { showToast } = useUI();
    
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

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
            const res = await api.get('/user/summary');
            const data = res.data?.data;
            setSummary(data);
        } catch (err) {
            showToast('Failed to fetch account summary', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        setShowBottomNav(true);
        fetchSummary();
        
        // Sync local form with user context on mount
        if (user) {
            setForm({
                first_name: user.name?.first_name || '',
                last_name: user.name?.last_name || '',
                contact: user.contact || '',
            });
        }
    }, [setShowBottomNav, fetchSummary, user]);

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
            // Update Global User Context
            login(res.data.data.user, localStorage.getItem('token'));
            showToast('Profile updated successfully', 'success');
            fetchSummary();
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        } finally {
            setSaveLoading(false);
        }
    };

    const confirmRemoveLocation = async () => {
        if (!deleteTarget) return;
        try {
            const res = await api.delete('/user/saved-locations', { data: { addr: deleteTarget } });
            // Update Global User Context to reflect removed location
            login(res.data.data.user, localStorage.getItem('token'));
            
            showToast('Location removed successfully', 'success');
            setShowDelete(false);
            setDeleteTarget(null);
            fetchSummary();
        } catch (err) {
            showToast('Failed to remove location', 'error');
        }
    };

    if (loading && !summary) {
        return (
            <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 space-y-10'>
                <div className='w-full max-w-md bg-white/60 backdrop-blur-3xl rounded-[3.5rem] p-12 text-center border border-white/40 animate-pulse shadow-2xl'>
                    <div className='w-24 h-24 bg-slate-200/50 rounded-[2rem] mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700'></div>
                    <div className='h-8 bg-slate-200/50 rounded-full w-3/4 mx-auto mb-5'></div>
                    <div className='h-4 bg-slate-200/50 rounded-full w-1/2 mx-auto'></div>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-dvh bg-linear-to-b from-slate-50 to-blue-50 flex flex-col font-sans select-none overflow-x-hidden relative'>
            
            {/* Background Glows for Depth */}
            <div className='absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none'></div>
            <div className='absolute bottom-0 -left-32 w-96 h-96 bg-orange-400/10 rounded-full blur-[140px] pointer-events-none'></div>

            {/* Scroll Container */}
            <div className='flex-1 overflow-y-auto px-6 pt-16 pb-32 relative z-10'>
                
                {/* Header Section */}
                <div className='mb-10 animate-in slide-in-from-top-10 duration-700'>
                    <h1 className='text-5xl font-black text-slate-900 tracking-tighter italic uppercase'>Profile</h1>
                    <div className='flex items-center gap-2 opacity-40 mt-1 ml-1'>
                        <span className='w-1 h-1 bg-slate-900 rounded-full'></span>
                        <p className='text-[8px] font-black uppercase tracking-[0.4em]'>Manage your account settings</p>
                    </div>
                </div>

                {/* Profile Hero Section */}
                <ProfileHeader 
                    firstName={user?.name?.first_name} 
                    lastName={user?.name?.last_name} 
                    email={user?.email} 
                    role={user?.role}
                    officeName={user?.office_id?.name || 'Main Office'}
                />

                {/* Performance Stats */}
                <ProfileStats 
                    totalRides={summary?.rideCount} 
                    upcomingRides={summary?.upcomingRides}
                />

                {/* Locations Manager */}
                <SavedLocations 
                    locations={user?.saved_locations} 
                    onDelete={(addr) => { setDeleteTarget(addr); setShowDelete(true); }}
                />

                {/* Update Identity Section */}
                <PersonalForm 
                    form={form} 
                    onChange={setForm} 
                    onSubmit={handleUpdateProfile} 
                    loading={saveLoading}
                />

                {/* Session Lifecycle */}
                <button 
                    onClick={() => setShowLogout(true)} 
                    className='w-full py-6 bg-rose-500/10 backdrop-blur-md text-rose-600 font-black text-[10px] tracking-[0.4em] uppercase rounded-[2rem] active:scale-[0.98] transition-all hover:bg-rose-500 hover:text-white shadow-xl border border-rose-500/20 mb-10'
                >
                    Sign Out
                </button>
            </div>

            {/* --- MODALS --- */}
            
            {/* Logout Confirmation */}
            <ActionModal 
                visible={showLogout} 
                title='Sign Out?' 
                description='Are you sure you want to sign out? You will need to log in again to book a ride.' 
                onConfirm={logout} 
                onCancel={() => setShowLogout(false)} 
                confirmText='Sign Out' 
                isDangerous={false}
            />

            {/* Delete Location Confirmation */}
            <ActionModal 
                visible={showDelete} 
                title='Remove Location' 
                description={`Are you sure you want to remove \"${deleteTarget}\" from your saved locations?`} 
                onConfirm={confirmRemoveLocation} 
                onCancel={() => { setShowDelete(false); setDeleteTarget(null); }} 
                confirmText='Remove' 
                isDangerous={true}
            />
        </div>
    );
};

export default Profile;
