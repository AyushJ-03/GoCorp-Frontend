import React from 'react'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
  const { 
    formData, 
    handleChange, 
    handleSignIn, 
    showPassword, 
    setShowPassword, 
    error, 
    loading, 
    isServerOffline 
  } = useAuth()

  return (
    <div className='w-full h-screen bg-white flex flex-col overflow-hidden font-sans pb-10'>
      <div className='flex-1 flex flex-col items-center justify-center px-6 py-4'>
        <div className='text-center mb-8 max-w-md lg:max-w-lg'>
          <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-2 lg:mb-3'>Sign In</h1>
          <p className='text-gray-600 text-sm lg:text-base font-semibold'>Welcome back, you've been missed!</p>
        </div>

        {isServerOffline && (
          <div className='w-full max-w-sm lg:max-w-md bg-amber-500/10 text-amber-600 px-5 py-4 rounded-2xl mb-6 text-sm font-bold border border-amber-500/20 flex items-center gap-3 animate-pulse'>
            <div className='w-2 h-2 bg-amber-500 rounded-full'></div>
            <span>System under maintenance. Retrying connection...</span>
          </div>
        )}

        {error && !isServerOffline && (
          <div className='w-full max-w-sm lg:max-w-md bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs lg:text-sm font-bold border border-red-100 flex items-center gap-2'>
            <svg className='w-4 h-4 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className='w-full max-w-sm lg:max-w-md space-y-4 lg:space-y-5'>
          <div className={`${isServerOffline ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
            <label className='block text-gray-800 font-bold mb-1.5 lg:mb-2 text-[11px] lg:text-xs uppercase tracking-wider'>Email</label>
            <input
              name='email'
              type='email'
              required
              value={formData.email}
              onChange={handleChange}
              placeholder='example@gmail.com'
              className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
            />
          </div>

          <div className={`${isServerOffline ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
            <label className='block text-gray-800 font-bold mb-1.5 lg:mb-2 text-[11px] lg:text-xs uppercase tracking-wider'>Password</label>
            <div className='relative'>
              <input
                name='password'
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder='••••••••'
                className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                {showPassword ? (
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                  </svg>
                ) : (
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3l18 18' />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className='flex justify-end'>
            <a href='#' className='text-orange-500 font-black hover:text-orange-600 text-[10px] lg:text-xs tracking-widest uppercase transition-colors'>Forgot Password?</a>
          </div>

          <button 
            type='submit'
            disabled={loading || isServerOffline}
            className={`w-full bg-linear-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-lg text-white font-black py-4 lg:py-5 rounded-4xl shadow-2xl transition-all active:scale-95 hover:scale-105 text-base lg:text-lg ${loading || isServerOffline ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-3xl'}`}
          >
            {isServerOffline ? 'Server Offline' : loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <p className='text-center text-gray-600 font-bold text-xs lg:text-sm pt-4'>
            For account assistance, please contact your office administrator.
          </p>
        </form>
      </div>

      <div className='flex justify-center shrink-0 mb-2'>
        <div className='w-32 h-1.5 bg-black rounded-full'></div>
      </div>
    </div>
  )
}

export default Login
