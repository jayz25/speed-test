"use client";

const CapsLockAlert = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-sm font-medium"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      Caps Lock is on
    </div>
  );
};

export default CapsLockAlert;