import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useUI } from '../context/UIContext'

const LocationAccess = () => {
  const navigate = useNavigate()
  const { setShowBottomNav } = useUser()
  const { showToast } = useUI()

  // Hide BottomNav on mount, restore on unmount
  useEffect(() => {
    setShowBottomNav(false)

    // Check if permission is already granted
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'granted') {
          navigate('/dashboard');
        }
      }
    };
    checkPermission();

    return () => setShowBottomNav(true)
  }, [setShowBottomNav, navigate])

  const handleAllowLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Location access granted - navigate to dashboard
          navigate('/dashboard')
        },
        (error) => {
          // Location access denied
          showToast('Failed to get location. Please allow access in your browser settings.', 'error')
        }
      )
    } else {
      showToast('Geolocation is not supported by your browser.', 'error')
    }
  }

  return (
    <div className='w-full min-h-screen bg-slate-50 flex flex-col font-sans select-none overflow-x-hidden relative'>
      
      {/* Background Glows for Depth */}
      <div className='absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none'></div>
      <div className='absolute bottom-0 -left-32 w-96 h-96 bg-orange-400/10 rounded-full blur-[140px] pointer-events-none'></div>

      {/* Main content area */}
      <div className='flex-1 flex flex-col items-center justify-center px-8 py-12 text-center relative z-10'>
        {/* Location Icon with Premium Aura */}
        <div className='mb-16 relative'>
          <div className='absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-110'></div>
          <div className='w-56 h-56 bg-white/40 backdrop-blur-3xl rounded-[3rem] flex items-center justify-center border border-white/60 shadow-2xl animate-in zoom-in-95 duration-700 relative z-10'>
            <div className='text-indigo-600 drop-shadow-2xl'>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className='text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-6'>Location Access</h1>

        {/* Description */}
        <p className='text-slate-500 text-sm font-bold leading-relaxed max-w-xs mx-auto opacity-70'>
          Precision tracking is required to synchronize your dispatch requests. Please authorize location access to proceed.
        </p>
      </div>

      {/* Button container */}
      <div className='px-8 pb-16 pt-8 relative z-10 flex flex-col items-center'>
        <button 
          onClick={handleAllowLocation}
          className='w-full max-w-md py-6 bg-slate-950 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all hover:bg-black group flex items-center justify-center gap-4'
        >
          <span>Authorize Access</span>
          <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M14 5l7 7m0 0l-7 7m7-7H3' /></svg>
        </button>
      </div>

      {/* iOS style bottom indicator */}
      <div className='flex justify-center shrink-0 pb-3'>
        <div className='w-32 h-1 bg-black rounded-full'></div>
      </div>
    </div>
  )
}

export default LocationAccess
