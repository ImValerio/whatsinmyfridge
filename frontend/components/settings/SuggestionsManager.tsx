import React from "react";
import { FoodLog } from "../../types";
import { Button, Input } from "../ui";

interface SuggestionsManagerProps {
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

export const SuggestionsManager = ({
  foodLogs, foodLogName, setFoodLogName, onFoodLogSubmit, onFoodLogEdit, onFoodLogDelete,
  editingFoodLog, setEditingFoodLog, isSubmittingFoodLog, foodLogPage, foodLogLastPage, foodLogTotal, setFoodLogPage
}: SuggestionsManagerProps) => (
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-black text-[#1C1C1E] uppercase tracking-tight">Smart Library</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{editingFoodLog ? "Update Suggestion" : "Add New Item"}</p>
      </div>
    </div>

    <form onSubmit={onFoodLogSubmit} className="space-y-3 bg-[#FDFCF9] p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
      <Input value={foodLogName} onChange={(e) => setFoodLogName(e.target.value)} placeholder="Food name" required />
      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmittingFoodLog} className="w-full">
          {editingFoodLog ? "Update" : "Add Suggestion"}
        </Button>
        {editingFoodLog && (
          <Button variant="ghost" onClick={() => { setEditingFoodLog(null); setFoodLogName(""); }}>✕</Button>
        )}
      </div>
    </form>

    <div className="mt-6 space-y-3">
      {foodLogs.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm font-medium">No suggestions yet.</p>
        </div>
      ) : (
        (foodLogs || []).map(log => (
          <div key={log.id} className="group p-4 bg-white rounded-2xl border border-gray-50 hover:shadow-md transition-all flex justify-between items-center">
            <p className="font-black text-[#1C1C1E] truncate text-sm">{log.name}</p>
            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="sm" onClick={() => onFoodLogEdit(log)} className="px-2 py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </Button>
              <Button variant="danger" size="sm" onClick={() => onFoodLogDelete(log.id)} className="px-2 py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </Button>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Pagination Controls */}
    {foodLogTotal > 10 && (
      <div className="mt-6 flex items-center justify-between bg-gray-50 p-2 rounded-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFoodLogPage(Math.max(1, foodLogPage - 1))}
          disabled={foodLogPage <= 1}
          className="px-3"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          Prev
        </Button>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page {foodLogPage} of {foodLogLastPage}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFoodLogPage(foodLogPage + 1)}
          disabled={foodLogPage >= foodLogLastPage}
          className="px-3"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
        </Button>
      </div>
    )}
  </section>
);
