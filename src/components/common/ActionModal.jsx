import React from 'react';

/**
 * ActionModal - A sleek, reusable modal component designed for confirmations and alerts.
 * It uses glassmorphism and modern UI patterns to feel "premium."
 */
const ActionModal = ({ 
  visible,        // Boolean: Controls if the modal is shown
  title,          // String: Bold heading at the top
  description,    // String: Helpful sub-text explaining the choice
  onConfirm,      // Function: What happens when the user hits the "Big" button
  onCancel,       // Function: Close logic (fired by "Cancel" or clicking outside)
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDangerous = false, // If true, the button turns Red (useful for "Delete" or "Cancel Ride")
  children        // Extra components we might want to tuck inside (like date pickers)
}) => {
  // If the modal isn't supposed to be seen, we don't render anything at all.
  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-150 flex items-center justify-center p-6 animate-in fade-in duration-300'>
      {/* 
          Backdrop: 
          This is the dark, blurred layer behind the modal. 
          Clicking it trigger onCancel to escape the modal easily.
      */}
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onCancel}></div>
      
      {/* 
          Modal Card: 
          Uses rounded corners and a zoom-in animation to feel responsive.
      */}
      <div className='relative w-full max-w-sm bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/30 animate-in zoom-in-95 duration-300'>
        <h3 className='text-xl font-black mb-2 text-slate-900'>{title}</h3>
        <p className='text-sm font-medium mb-8 leading-relaxed text-slate-800'>{description}</p>
        
        {/* If we passed extra JSX via 'children', show it here */}
        {children && <div className="mb-8">{children}</div>}

        <div className='flex flex-col gap-3'>
          {/* 
              Primary Action Button:
              Features a gradient and scale-down effect on click for tactile feedback.
          */}
          <button 
            onClick={onConfirm}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
              isDangerous 
                ? 'bg-linear-to-r from-red-500/80 to-red-600/80 backdrop-blur-lg text-white shadow-2xl hover:shadow-3xl' 
                : 'bg-linear-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-lg text-white shadow-2xl hover:shadow-3xl'
            }`}
          >
            {confirmText}
          </button>

          {/* 
              Secondary Action (Cancel): 
              Lighter styling so it doesn't distract from the main goal.
          */}
          <button 
            onClick={onCancel}
            className='w-full py-4 rounded-2xl font-bold text-sm transition-all text-slate-700 hover:text-slate-900 active:scale-95 hover:scale-105'
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
