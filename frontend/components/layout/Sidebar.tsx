import React from "react";
import { User, FoodLog } from "../../types";
import { Button } from "../ui";
import { SettingsMenu } from "../settings/SettingsMenu";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFamily: () => void;
  onOpenSuggestions: () => void;
  onOpenContainers: () => void;
}

export const Sidebar = ({
  isOpen, onClose, onOpenFamily, onOpenSuggestions, onOpenContainers
}: SidebarProps) => (
  <>
    <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out-quint border-r border-gray-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col p-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-[#1C1C1E] tracking-tight">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <SettingsMenu 
            onOpenFamily={onOpenFamily}
            onOpenSuggestions={onOpenSuggestions}
            onOpenContainers={onOpenContainers}
            compact={true}
          />
        </div>
      </div>
    </div>
    {isOpen && <div onClick={onClose} className="fixed inset-0 bg-[#1C1C1E]/20 backdrop-blur-sm z-40 animate-in fade-in duration-500" />}
  </>
);
