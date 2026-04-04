import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-110 px-4 pb-4 select-none">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between px-12 py-4">
        <NavLink 
          to="/home" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-700'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
        </NavLink>

        <NavLink 
          to="/my-rides" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-700'}`
          }
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Rides</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-700'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;
