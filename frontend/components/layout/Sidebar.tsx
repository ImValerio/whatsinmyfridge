import React from "react";
import { User, FoodLog } from "../../types";
import { Button } from "../ui";
import { FamilyManager } from "../settings/FamilyManager";
import { SuggestionsManager } from "../settings/SuggestionsManager";
import { ContainerManager } from "../settings/ContainerManager";

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
  newContainerName: string;
  setNewContainerName: (val: string) => void;
  onContainerSubmit: (e: React.FormEvent) => void;
  isCreatingContainer: boolean;
  foodLogs: FoodLog[];
  foodLogName: string;
  setFoodLogName: (val: string) => void;
  onFoodLogSubmit: (e: React.FormEvent) => void;
  onFoodLogEdit: (log: FoodLog) => void;
  onFoodLogDelete: (id: number) => void;
  editingFoodLog: FoodLog | null;
  setEditingFoodLog: (log: FoodLog | null) => void;
  isSubmittingFoodLog: boolean;
  foodLogPage: number;
  foodLogLastPage: number;
  foodLogTotal: number;
  setFoodLogPage: (page: number) => void;
}

export const Sidebar = ({
  isOpen, onClose, users, userName, userEmail, setUserName, setUserEmail,
  onUserSubmit, onUserEdit, onUserDelete, editingUser, setEditingUser, isSubmitting,
  newContainerName, setNewContainerName, onContainerSubmit, isCreatingContainer,
  foodLogs, foodLogName, setFoodLogName, onFoodLogSubmit, onFoodLogEdit, onFoodLogDelete,
  editingFoodLog, setEditingFoodLog, isSubmittingFoodLog, foodLogPage, foodLogLastPage, foodLogTotal, setFoodLogPage
}: SidebarProps) => (
  <>
    <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out border-r border-gray-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col p-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-[#1C1C1E] tracking-tight">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 pr-2">
          <FamilyManager
            users={users}
            userName={userName}
            userEmail={userEmail}
            setUserName={setUserName}
            setUserEmail={setUserEmail}
            onUserSubmit={onUserSubmit}
            onUserEdit={onUserEdit}
            onUserDelete={onUserDelete}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            isSubmitting={isSubmitting}
          />

          <SuggestionsManager
            foodLogs={foodLogs}
            foodLogName={foodLogName}
            setFoodLogName={setFoodLogName}
            onFoodLogSubmit={onFoodLogSubmit}
            onFoodLogEdit={onFoodLogEdit}
            onFoodLogDelete={onFoodLogDelete}
            editingFoodLog={editingFoodLog}
            setEditingFoodLog={setEditingFoodLog}
            isSubmittingFoodLog={isSubmittingFoodLog}
            foodLogPage={foodLogPage}
            foodLogLastPage={foodLogLastPage}
            foodLogTotal={foodLogTotal}
            setFoodLogPage={setFoodLogPage}
          />

          <ContainerManager
            newContainerName={newContainerName}
            setNewContainerName={setNewContainerName}
            onContainerSubmit={onContainerSubmit}
            isCreatingContainer={isCreatingContainer}
          />
        </div>
      </div>
    </div>
    {isOpen && <div onClick={onClose} className="fixed inset-0 bg-[#1C1C1E]/20 backdrop-blur-sm z-40 transition-opacity" />}
  </>
);
