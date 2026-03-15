import React, { useState } from "react";
import { Container, FoodItem } from "../../types";
import { formatDate, getStatus } from "../../lib/utils";
import { Button, Badge, Input } from "../ui";

interface InventoryListProps {
  containers: Container[];
  onFoodOpen: (id: number, days?: number) => void;
  onFoodEdit: (item: FoodItem) => void;
  onFoodDelete: (id: number) => void;
  onContainerDelete: (id: number) => void;
}

const FoodItemRow = ({ 
  item, onFoodOpen, onFoodEdit, onFoodDelete 
}: { 
  item: FoodItem, 
  onFoodOpen: (id: number, days?: number) => void,
  onFoodEdit: (item: FoodItem) => void,
  onFoodDelete: (id: number) => void
}) => {
  const [openDays, setOpenDays] = useState(2);
  const status = getStatus(item.expiration_date);

  return (
    <li className="group px-8 py-6 hover:bg-[#FDFCF9] transition-all flex flex-col sm:flex-row justify-between sm:items-center">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-lg font-black text-[#2C2C2E] truncate group-hover:text-emerald-600 transition-colors">{item.name}</h4>
          <span className="text-xs font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg">×{item.quantity}</span>
        </div>
        <div className="flex items-center gap-3">
          {status && <Badge colorStyles={status.color}>{status.label}</Badge>}
          {item.expiration_date && <p className="text-xs font-bold text-gray-400">{formatDate(item.expiration_date)}</p>}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all translate-x-0 sm:translate-x-4 sm:group-hover:translate-x-0 items-center">
        <div className="flex items-center bg-emerald-50 rounded-xl overflow-hidden border border-emerald-100/50">
          <input 
            type="number" 
            value={openDays}
            onChange={(e) => setOpenDays(Number(e.target.value))}
            min="1"
            className="w-12 px-2 py-2 bg-transparent border-none focus:ring-0 text-emerald-700 text-sm font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            title="Days until expiration"
          />
          <button 
            onClick={() => onFoodOpen(item.id, openDays)}
            className="px-3 py-3 bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1"
            title="Open Product"
          >
            <span>🥫</span>
            <span className="hidden lg:inline">Open</span>
          </button>
        </div>
        <Button variant="secondary" size="icon" onClick={() => onFoodEdit(item)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </Button>
        <Button variant="danger" size="icon" onClick={() => onFoodDelete(item.id)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </Button>
      </div>
    </li>
  );
};

export const InventoryList = ({
  containers, onFoodOpen, onFoodEdit, onFoodDelete, onContainerDelete
}: InventoryListProps) => (
  <div className="grid gap-8">
    {containers.map((container, idx) => (
      <div 
        key={container.id} 
        className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
        style={{ animationDelay: `${idx * 100}ms` }}
      >
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-[#FDFCF9]/50">
          <h3 className="text-2xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-3">
             {container.name}
             <span className="text-sm font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
               {container.foods?.length || 0}
             </span>
          </h3>
          <Button variant="ghost" size="icon" onClick={() => onContainerDelete(container.id)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </Button>
        </div>
        
        {container.foods && container.foods.length > 0 ? (
          <ul className="divide-y divide-gray-50">
            {container.foods.map((item) => (
              <FoodItemRow 
                key={item.id} 
                item={item} 
                onFoodOpen={onFoodOpen} 
                onFoodEdit={onFoodEdit} 
                onFoodDelete={onFoodDelete} 
              />
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-300 font-bold italic tracking-tight text-sm">Empty Space</div>
        )}
      </div>
    ))}
  </div>
);
