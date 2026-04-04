import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className='w-full h-screen bg-white flex flex-col overflow-hidden font-sans'>
      {/* Top Section / Logo space */}
      <div className='h-16 flex justify-center items-center shrink-0'>
        {/* Placeholder for logo */}
        <div className='w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'>
          <div className='w-5 h-5 bg-orange-500 rounded-md rotate-45'></div>
        </div>
      </div>

      {/* Main content area */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 pb-6'>
        {/* Modern Hero Section */}
        <div className='relative w-full max-w-70 aspect-square flex items-center justify-center mb-6'>
          {/* Animated Background Glow */}
          <div className='absolute w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-60'></div>

          {/* Floating Feature Icons */}
          {/* Car Icon */}
          <div className='absolute -top-2 -left-2 w-12 h-12 bg-white shadow-lg rounded-xl flex items-center justify-center z-20 transform -rotate-12'>
            <img src='/src/assets/image.png' alt='Car' className='w-8 h-8 object-contain rounded-md' />
          </div>

          {/* Driver Icon */}
          <div className='absolute top-1/4 -right-4 w-12 h-12 bg-white shadow-lg rounded-xl flex items-center justify-center z-20 transform rotate-12'>
            <img src='/src/assets/driver.png' alt='Driver' className='w-8 h-8 object-contain rounded-md' />
          </div>

          {/* Support Icon */}
          <div className='absolute bottom-1/4 -left-6 w-12 h-12 bg-white shadow-lg rounded-xl flex items-center justify-center z-20 transform -rotate-12'>
            <div className='w-8 h-8 bg-orange-50 rounded-md flex items-center justify-center'>
              <svg className='w-5 h-5 text-orange-500' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' />
              </svg>
            </div>
          </div>

          {/* Location Icon */}
          <div className='absolute -bottom-1 -right-1 w-12 h-12 bg-white shadow-lg rounded-xl flex items-center justify-center z-20 transform rotate-12'>
            <div className='w-8 h-8 bg-orange-50 rounded-md flex items-center justify-center'>
              <svg className='w-5 h-5 text-orange-500' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z' />
              </svg>
            </div>
          </div>

          {/* Main Hero Image */}
          <div className='relative w-48 h-60 bg-gray-50 rounded-4xl overflow-hidden shadow-xl z-10 border-4 border-white'>
            <img
              src='/src/assets/hero-woman.png'
              alt='Hero Woman'
              className='w-full h-full object-cover'
            />
          </div>
        </div>

        {/* Content Section */}
        <div className='text-center max-w-xs'>
          <h1 className='text-2xl font-extrabold text-gray-900 mb-3 leading-tight tracking-tight'>
            Welcome to Your <span className='text-orange-500'>Ultimate Transportation</span> Solution
          </h1>

          <p className='text-gray-600 text-xs mb-8 leading-relaxed'>
            Experience seamless travel with our all-in-one platform. Book rides anytime, anywhere.
          </p>

          <button
            onClick={() => navigate('/login')}
            className='w-full bg-linear-to-r from-orange-500/90 to-orange-600/90 backdrop-blur-lg text-white font-bold py-3.5 rounded-full mb-4 shadow-lg shadow-orange-500/30 transition-all duration-200 active:scale-95 hover:scale-105 text-base hover:shadow-2xl'
          >
            Let's Get Started
          </button>

          <div className='text-xs text-gray-600'>
            Don't have an account? <br />
            <button className='text-orange-500 font-bold hover:underline mt-0.5 uppercase tracking-wide text-[10px]'>
              Contact Your Office Admin
            </button>
          </div>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className='flex justify-center shrink-0 pb-3'>
        <div className='w-32 h-1.5 bg-black rounded-full'></div>
      </div>
    </div>
  );
};

export default Home;
