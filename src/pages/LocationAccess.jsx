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
    return () => setShowBottomNav(true)
  }, [setShowBottomNav])

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

  const handleMaybeLater = () => {
    navigate('/dashboard')
  }

  return (
    <div className='w-full min-h-screen bg-white flex flex-col overflow-y-auto'>
      {/* Main content area */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 py-8 text-center'>
        {/* Location Icon */}
        <div className='mb-12'>
          <div className='w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center'>
            <div className='text-orange-500'>
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className='text-2xl font-bold mb-4 text-gray-900'>Enable Location Access</h1>

        {/* Description */}
        <p className='text-gray-600 text-sm md:text-base leading-relaxed max-w-xs mx-auto'>
          To ensure a seamless and efficient experience, allow us access to your location.
        </p>
      </div>

      {/* Buttons container */}
      <div className='px-6 pb-12 pt-4 bg-white flex flex-col items-center'>
        <div className='w-full max-w-60'>
          <button 
            onClick={handleAllowLocation}
            className='w-full bg-linear-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-lg text-white font-bold py-4 rounded-full mb-4 transition-all active:scale-95 hover:scale-105 shadow-2xl hover:shadow-3xl'
          >
            Allow Location Access
          </button>
          <button 
            onClick={handleMaybeLater}
            className='w-full text-orange-500 font-semibold py-2 hover:opacity-80 transition-all active:scale-95 hover:scale-105'
          >
            Maybe Later
          </button>
        </div>
      </div>

      {/* iOS style bottom indicator */}
      <div className='flex justify-center shrink-0 pb-3'>
        <div className='w-32 h-1 bg-black rounded-full'></div>
      </div>
    </div>
  )
}

export default LocationAccess
