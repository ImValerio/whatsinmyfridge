import React from "react";
import { User } from "../../types";

interface HeaderProps {
  users: User[];
  onOpenSidebar: () => void;
  totalItems: number;
  expiredItems: number;
}

export const Header = ({ users, onOpenSidebar, totalItems, expiredItems }: HeaderProps) => (
  <header className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
          <span className="text-white text-2xl">🥦</span>
        </div>
        <span className="text-sm font-bold tracking-widest uppercase text-emerald-600/80">Inventory Tracker</span>
      </div>
      <button
        onClick={onOpenSidebar}
        className="group flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95"
      >
        {users != null && users.length > 0 ? (
          <div className="flex -space-x-2">
            {users.slice(0, 3).map(u => (
              <div key={u.id} className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-emerald-600 uppercase">
                {u.name.charAt(0)}
              </div>
            ))}
            {users.length > 3 && <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400">+{users.length - 3}</div>}
          </div>)
          : <div className="hidden"></div>

        }
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
      </button>
    </div>
    <h1 className="text-4xl sm:text-6xl font-black text-[#1C1C1E] tracking-tight leading-[0.9] mb-4">
      What&apos;s in <br /><span className="text-emerald-500">my fridge?</span>
    </h1>
    <p className="text-xl text-gray-500/80 font-medium">
      Reduce waste, stay fresh, and know exactly what you have.
    </p>

    <div className="mt-8 flex gap-4">
      <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex-1">
        <span className="block text-3xl font-black text-[#1C1C1E]">{totalItems}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Items</span>
      </div>
      <div className={`px-6 py-4 rounded-3xl shadow-sm border flex-1 transition-colors ${expiredItems > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-gray-100'}`}>
        <span className={`block text-3xl font-black ${expiredItems > 0 ? 'text-rose-600' : 'text-[#1C1C1E]'}`}>{expiredItems}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${expiredItems > 0 ? 'text-rose-400' : 'text-gray-400'}`}>Expired</span>
      </div>
    </div>
  </header>
);
