import React from "react";
import { User } from "../../types";
import { Button, Input } from "../ui";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  userName: string;
  userEmail: string;
  setUserName: (val: string) => void;
  setUserEmail: (val: string) => void;
  onUserSubmit: (e: React.FormEvent) => void;
  onUserEdit: (user: User) => void;
  onUserDelete: (id: number) => void;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  isSubmitting: boolean;
}

export const Sidebar = ({
  isOpen, onClose, users, userName, userEmail, setUserName, setUserEmail,
  onUserSubmit, onUserEdit, onUserDelete, editingUser, setEditingUser, isSubmitting
}: SidebarProps) => (
  <>
    <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out border-r border-gray-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col p-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-[#1C1C1E] tracking-tight">Family Members</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>

        <section className="mb-10 bg-[#FDFCF9] p-6 rounded-[2rem] border border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">{editingUser ? "Update Profile" : "Add Member"}</h3>
          <form onSubmit={onUserSubmit} className="space-y-3">
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Name" required />
            <Input value={userEmail} type="email" onChange={(e) => setUserEmail(e.target.value)} placeholder="Email" required />
            <div className="flex gap-2">
              <Button type="submit" isLoading={isSubmitting} className="flex-1">
                {editingUser ? "Update" : "Add"}
              </Button>
              {editingUser && (
                <Button variant="ghost" onClick={() => { setEditingUser(null); setUserName(""); setUserEmail(""); }}>✕</Button>
              )}
            </div>
          </form>
        </section>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {users.map(user => (
            <div key={user.id} className="group p-4 bg-white rounded-2xl border border-gray-50 hover:shadow-md transition-all flex justify-between items-center">
              <div className="min-w-0">
                <p className="font-black text-[#1C1C1E] truncate text-sm">{user.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">{user.email}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm" onClick={() => onUserEdit(user)} className="px-2 py-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </Button>
                <Button variant="danger" size="sm" onClick={() => onUserDelete(user.id)} className="px-2 py-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {isOpen && <div onClick={onClose} className="fixed inset-0 bg-[#1C1C1E]/20 backdrop-blur-sm z-40 transition-opacity" />}
  </>
);
