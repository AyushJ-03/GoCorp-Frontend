import React from 'react';

const Toast = ({ visible, message, type }) => {
  if (!visible) return null;

  return (
    <div className={`fixed top-12 left-1/2 transform -translate-x-1/2 z-200 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
      type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900/90 backdrop-blur-md border border-white/20'
    } text-white`}>
      {type === 'success' ? (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
        </svg>
      ) : type === 'error' ? (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
        </svg>
      ) : null}
      <span className='text-sm font-bold'>{message}</span>
    </div>
  );
};

export default Toast;
