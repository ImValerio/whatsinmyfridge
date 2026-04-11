import React, { useEffect, useState } from "react";

interface BottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomModal = ({ isOpen, onClose, title, children }: BottomModalProps) => {
  const [isRendering, setIsRendering] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendering(true);
      setIsClosing(false);
    } else if (isRendering) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendering(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendering]);

  if (!isRendering) return null;

  return (
    <div 
      className={`fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 
        ${isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'}`}
    >
      <div 
        className={`w-full sm:max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl
          ${isClosing 
            ? 'animate-out slide-out-to-bottom-full sm:zoom-out-95 duration-300 ease-in-quint' 
            : 'animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 ease-out-quint'}`}
      >
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
          <h2 className="text-2xl font-black text-[#1C1C1E]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="pb-8">
          {children}
        </div>
      </div>
    </div>
  );
};
