import React from "react";
import { Button, Input } from "../ui";

interface ContainerManagerProps {
  newContainerName: string;
  setNewContainerName: (val: string) => void;
  onContainerSubmit: (e: React.FormEvent) => void;
  isCreatingContainer: boolean;
}

export const ContainerManager = ({
  newContainerName, setNewContainerName, onContainerSubmit, isCreatingContainer
}: ContainerManagerProps) => (
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-black text-[#1C1C1E] uppercase tracking-tight">Storage Spaces</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add New Container</p>
      </div>
    </div>
    <form onSubmit={onContainerSubmit} className="space-y-3 bg-[#FDFCF9] p-6 rounded-[2rem] border border-gray-100 shadow-sm">
      <Input
        value={newContainerName}
        onChange={(e) => setNewContainerName(e.target.value)}
        placeholder="e.g. Kitchen Fridge"
        required
        maxLength={30}
        disabled={isCreatingContainer}
      />
      <Button type="submit" isLoading={isCreatingContainer} variant="secondary" className="w-full">
        Add Space
      </Button>
    </form>
  </section>
);
