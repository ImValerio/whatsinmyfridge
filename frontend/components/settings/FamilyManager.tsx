import React from "react";
import { User } from "../../types";
import { Button, Input } from "../ui";

interface FamilyManagerProps {
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

export const FamilyManager = ({
  users, userName, userEmail, setUserName, setUserEmail,
  onUserSubmit, onUserEdit, onUserDelete, editingUser, setEditingUser, isSubmitting
}: FamilyManagerProps) => (
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-black text-[#1C1C1E] uppercase tracking-tight">Family Members</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{editingUser ? "Update Profile" : "Add New Member"}</p>
      </div>
    </div>
    
    <form onSubmit={onUserSubmit} className="space-y-3 bg-[#FDFCF9] p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
      <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Name" required />
      <Input value={userEmail} type="email" onChange={(e) => setUserEmail(e.target.value)} placeholder="Email" required />
      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          {editingUser ? "Update" : "Add Member"}
        </Button>
        {editingUser && (
          <Button variant="ghost" onClick={() => { setEditingUser(null); setUserName(""); setUserEmail(""); }}>✕</Button>
        )}
      </div>
    </form>

    <div className="mt-6 space-y-3">
      {users.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm font-medium">No family members added yet.</p>
        </div>
      ) : (
        users.map(user => (
          <div key={user.id} className="group p-4 bg-white rounded-2xl border border-gray-50 hover:shadow-md transition-all flex justify-between items-center">
            <div className="min-w-0">
              <p className="font-black text-[#1C1C1E] truncate text-sm">{user.name}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">{user.email}</p>
            </div>
            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="sm" onClick={() => onUserEdit(user)} className="px-2 py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </Button>
              <Button variant="danger" size="sm" onClick={() => onUserDelete(user.id)} className="px-2 py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);
