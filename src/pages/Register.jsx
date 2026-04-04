import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
  const { 
    formData, 
    handleChange, 
    handleRegister, 
    error, 
    loading 
  } = useAuth()

  return (
    <div className='w-full min-h-screen bg-white flex flex-col overflow-y-auto font-sans pb-10'>
      <div className='flex-1 flex flex-col items-center justify-center px-6 py-12'>
        <div className='text-center mb-10 max-w-md lg:max-w-lg'>
          <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-2 lg:mb-3'>Create Account</h1>
          <p className='text-gray-600 text-sm lg:text-base font-semibold'>Fill in your details to get started</p>
        </div>

        {error && (
          <div className='w-full max-w-md lg:max-w-lg bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm lg:text-base font-bold border border-red-100 flex items-center gap-3'>
            <svg className='w-5 h-5 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className='w-full max-w-md lg:max-w-lg space-y-5 lg:space-y-6'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <label className='block text-gray-800 font-bold mb-2 lg:mb-2.5 text-xs lg:text-sm uppercase tracking-widest'>First Name</label>
              <input
                name="firstName"
                type='text'
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder='John'
                className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
              />
            </div>
            <div className='flex-1'>
              <label className='block text-gray-800 font-bold mb-2 lg:mb-2.5 text-xs lg:text-sm uppercase tracking-widest'>Last Name</label>
              <input
                name="lastName"
                type='text'
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder='Doe'
                className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
              />
            </div>
          </div>

          <div>
            <label className='block text-gray-800 font-bold mb-2 lg:mb-2.5 text-xs lg:text-sm uppercase tracking-widest'>Email Address</label>
            <input
              name="email"
              type='email'
              required
              value={formData.email}
              onChange={handleChange}
              placeholder='john.doe@company.com'
              className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
            />
          </div>

          <div>
            <label className='block text-gray-800 font-bold mb-2 lg:mb-2.5 text-xs lg:text-sm uppercase tracking-widest'>Contact Number</label>
            <input
              name="contact"
              type='tel'
              required
              pattern="[0-9]{10}"
              value={formData.contact}
              onChange={handleChange}
              placeholder='9876543210'
              className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
            />
          </div>

          <div>
            <label className='block text-gray-800 font-bold mb-2 lg:mb-2.5 text-xs lg:text-sm uppercase tracking-widest'>Password</label>
            <input
              name="password"
              type='password'
              required
              value={formData.password}
              onChange={handleChange}
              placeholder='••••••••'
              className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
            />
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <label className='block text-gray-800 font-bold mb-2 lg:mb-2.5 text-xs lg:text-sm uppercase tracking-widest'>Company ID</label>
              <input
                name="companyId"
                type='text'
                required
                value={formData.companyId}
                onChange={handleChange}
                placeholder='ID from Admin'
                className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
              />
            </div>
            <div className='flex-1'>
              <label className='block text-gray-800 font-bold mb-2 lg:mb-2.5 text-xs lg:text-sm uppercase tracking-widest'>Office ID</label>
              <input
                name="officeId"
                type='text'
                required
                value={formData.officeId}
                onChange={handleChange}
                placeholder='ID from Admin'
                className='w-full px-5 py-4 lg:py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm lg:text-base font-bold'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className={`w-full bg-linear-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-lg text-white font-black py-5 lg:py-6 rounded-4xl text-base lg:text-lg shadow-2xl transition-all active:scale-95 hover:scale-105 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-3xl'}`}
          >
            {loading ? 'Processing...' : 'Register Account'}
          </button>

          <p className='text-center text-gray-600 font-semibold text-sm lg:text-base pt-4'>
            Already have an account? <Link to='/login' className='text-orange-500 font-black'>Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
