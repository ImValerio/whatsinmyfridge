import React from "react";
import { Button, Card } from "../ui";

interface SettingsMenuProps {
  onOpenFamily: () => void;
  onOpenSuggestions: () => void;
  onOpenContainers: () => void;
  compact?: boolean;
}

export const SettingsMenu = ({ onOpenFamily, onOpenSuggestions, onOpenContainers, compact = false }: SettingsMenuProps) => (
  <div className="grid gap-4">
    <Card className={`group relative overflow-hidden border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all duration-500 ${compact ? 'p-6' : 'p-8'}`}>
      <div className="relative z-10">
        <div className={`${compact ? 'w-10 h-10 mb-4' : 'w-12 h-12 mb-6'} rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-emerald-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-black text-[#1C1C1E] mb-2`}>Family Members</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Manage members who receive notifications.</p>
        <Button 
          onClick={onOpenFamily} 
          size={compact ? "md" : "lg"}
          className="w-full justify-between group/btn shadow-sm hover:shadow-emerald-200/50"
        >
          <span>Manage Family</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
    </Card>

    <Card className={`group relative overflow-hidden border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] transition-all duration-500 ${compact ? 'p-6' : 'p-8'}`}>
      <div className="relative z-10">
        <div className={`${compact ? 'w-10 h-10 mb-4' : 'w-12 h-12 mb-6'} rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-black text-[#1C1C1E] mb-2`}>Smart Library</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Customize your autocomplete dictionary.</p>
        <Button 
          onClick={onOpenSuggestions} 
          variant="secondary"
          size={compact ? "md" : "lg"}
          className="w-full justify-between group/btn shadow-sm hover:shadow-blue-200/50 bg-blue-500 text-white hover:bg-blue-600"
        >
          <span>Manage Library</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
    </Card>

    <Card className={`group relative overflow-hidden border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] transition-all duration-500 ${compact ? 'p-6' : 'p-8'}`}>
      <div className="relative z-10">
        <div className={`${compact ? 'w-10 h-10 mb-4' : 'w-12 h-12 mb-6'} rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-orange-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-black text-[#1C1C1E] mb-2`}>Storage Spaces</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Add fridges or pantries across your home.</p>
        <Button 
          onClick={onOpenContainers} 
          variant="secondary"
          size={compact ? "md" : "lg"}
          className="w-full justify-between group/btn shadow-sm hover:shadow-orange-200/50 bg-orange-500 text-white hover:bg-orange-600"
        >
          <span>Manage Spaces</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
    </Card>
  </div>
);
