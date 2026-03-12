"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  expiration_date: string | null;
  container_id: number;
  created_at?: string;
  updated_at?: string;
}

interface Container {
  id: number;
  name: string;
  foods: FoodItem[];
  created_at?: string;
  updated_at?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// --- Resilience Helpers ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch (e) {
    return "Invalid date";
  }
};

const getStatus = (expirationDate: string | null) => {
  if (!expirationDate) return null;
  const now = new Date();
  const exp = new Date(expirationDate);
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Expired", color: "text-rose-600 bg-rose-50 border-rose-100", isExpired: true };
  if (diffDays <= 3) return { label: `Expires in ${diffDays}d`, color: "text-amber-600 bg-amber-50 border-amber-100", isWarning: true };
  return null;
};

export default function FridgeApp() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<number | "">("");
  
  // Container Form State
  const [newContainerName, setNewContainerName] = useState("");
  const [isCreatingContainer, setIsCreatingContainer] = useState(false);
  
  // Food Form State
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [expirationDate, setExpirationDate] = useState("");
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isSubmittingFood, setIsSubmittingFood] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/containers`);
      if (!res.ok) throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setContainers(data || []);
      
      // Select first container if none selected
      if (data && data.length > 0 && selectedContainerId === "") {
        setSelectedContainerId(data[0].id);
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to your fridge server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [selectedContainerId]);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContainerName.trim()) return;

    setIsCreatingContainer(true);
    try {
      const res = await fetch(`${API_BASE_URL}/containers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newContainerName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create container");
      
      const newContainer = await res.json();
      setNewContainerName("");
      setContainers(prev => [...prev, { ...newContainer, foods: [] }]);
      setSelectedContainerId(newContainer.id);
    } catch (err) {
      alert("Something went wrong while creating the container. Please try again.");
    } finally {
      setIsCreatingContainer(false);
    }
  };

  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !selectedContainerId) return;

    setIsSubmittingFood(true);
    const method = editingFood ? "PUT" : "POST";
    const url = editingFood 
      ? `${API_BASE_URL}/food/${editingFood.id}` 
      : `${API_BASE_URL}/food`;

    const isoDate = expirationDate ? new Date(expirationDate).toISOString() : null;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: foodName.trim(), 
          quantity: Math.max(1, Number(quantity)),
          expiration_date: isoDate,
          container_id: Number(selectedContainerId)
        }),
      });

      if (!res.ok) throw new Error("Failed to save food item");

      setFoodName("");
      setQuantity(1);
      setExpirationDate("");
      setEditingFood(null);
      await fetchContainers();
    } catch (err) {
      alert("Could not save your food item. Please check your inputs.");
    } finally {
      setIsSubmittingFood(false);
    }
  };

  const handleFoodOpen = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/food/${id}/open`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to open food item");
      fetchContainers();
    } catch (err) {
      alert("Error opening item. Please try again.");
    }
  };

  const handleFoodDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/food/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete food item");
      fetchContainers();
    } catch (err) {
      alert("Error deleting item. Please try again.");
    }
  };

  const handleFoodEdit = (item: FoodItem) => {
    setEditingFood(item);
    setFoodName(item.name);
    setQuantity(item.quantity);
    setExpirationDate(item.expiration_date ? item.expiration_date.split("T")[0] : "");
    setSelectedContainerId(item.container_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelFoodEdit = () => {
    setEditingFood(null);
    setFoodName("");
    setQuantity(1);
    setExpirationDate("");
  };

  const handleContainerDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this container and all its contents? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/containers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete container");
      fetchContainers();
    } catch (err) {
      alert("Could not delete container.");
    }
  };

  const inventoryStats = useMemo(() => {
    const totalItems = containers.reduce((acc, c) => acc + (c.foods?.length || 0), 0);
    const expiredItems = containers.reduce((acc, c) => 
      acc + (c.foods?.filter(f => f.expiration_date && new Date(f.expiration_date) < new Date()).length || 0), 0);
    return { totalItems, expiredItems };
  }, [containers]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2C2C2E] py-16 px-6 sm:px-8 font-sans selection:bg-emerald-100">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white text-2xl">🥦</span>
             </div>
             <span className="text-sm font-bold tracking-widest uppercase text-emerald-600/80">Inventory Tracker</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-[#1C1C1E] tracking-tight leading-[0.9] mb-4">
            What&apos;s in <br/><span className="text-emerald-500">my fridge?</span>
          </h1>
          <p className="text-xl text-gray-500/80 font-medium">
            Reduce waste, stay fresh, and know exactly what you have.
          </p>
          
          <div className="mt-8 flex gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex-1">
              <span className="block text-3xl font-black text-[#1C1C1E]">{inventoryStats.totalItems}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Items</span>
            </div>
            <div className={`px-6 py-4 rounded-3xl shadow-sm border flex-1 transition-colors ${inventoryStats.expiredItems > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-gray-100'}`}>
              <span className={`block text-3xl font-black ${inventoryStats.expiredItems > 0 ? 'text-rose-600' : 'text-[#1C1C1E]'}`}>{inventoryStats.expiredItems}</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${inventoryStats.expiredItems > 0 ? 'text-rose-400' : 'text-gray-400'}`}>Expired</span>
            </div>
          </div>
        </header>

        <div className="grid gap-10">
          
          {/* Main Controls - Bento Style */}
          <div className="grid sm:grid-cols-2 gap-6 items-start">
            
            {/* Create Container Form */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                New Space
              </h2>
              <form onSubmit={handleCreateContainer} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={newContainerName}
                    onChange={(e) => setNewContainerName(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="e.g. Kitchen Fridge"
                    required
                    maxLength={30}
                    disabled={isCreatingContainer}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingContainer || !newContainerName.trim()}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isCreatingContainer ? "Creating..." : "Add Container"}
                </button>
              </form>
            </section>

            {/* Add/Edit Food Form */}
            <section className="bg-[#1C1C1E] p-8 rounded-[2rem] shadow-xl text-white">
              <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {editingFood ? "Edit Item" : "Quick Add"}
              </h2>
              <form onSubmit={handleFoodSubmit} className="space-y-4">
                <select
                  value={selectedContainerId}
                  onChange={(e) => setSelectedContainerId(Number(e.target.value))}
                  className="w-full px-4 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white appearance-none"
                  required
                  disabled={isSubmittingFood}
                >
                  <option value="" disabled className="text-gray-900">Choose storage...</option>
                  {containers.map(c => (
                    <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="flex-[3] px-4 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-gray-500"
                    placeholder="What is it?"
                    required
                    maxLength={50}
                    disabled={isSubmittingFood}
                  />
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="flex-1 px-4 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                    disabled={isSubmittingFood}
                  />
                </div>
                
                <div className="relative">
                   <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-4 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white [color-scheme:dark]"
                    disabled={isSubmittingFood}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 pointer-events-none uppercase tracking-tighter">Expires</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingFood || !selectedContainerId || !foodName.trim()}
                    className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmittingFood ? "Saving..." : editingFood ? "Update" : "Add Food"}
                  </button>
                  {editingFood && (
                    <button
                      type="button"
                      onClick={cancelFoodEdit}
                      className="px-6 py-4 bg-white/5 text-gray-400 rounded-2xl font-bold hover:bg-white/10 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>
            </section>
          </div>

          {/* Inventory Display */}
          <section className="space-y-8 mt-4">
            <div className="flex justify-between items-end px-2">
              <h2 className="text-4xl font-black text-[#1C1C1E] tracking-tight">Your Inventory</h2>
              <button 
                onClick={fetchContainers}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full transition-all active:scale-95"
              >
                Refresh List
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold animate-pulse">Checking your shelves...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center bg-rose-50 rounded-[2rem] border border-rose-100">
                <span className="text-4xl mb-4 block">🔌</span>
                <p className="text-rose-600 font-bold mb-4">{error}</p>
                <button onClick={fetchContainers} className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold">Try Again</button>
              </div>
            ) : containers.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                <span className="text-5xl mb-6 block grayscale opacity-50">🧊</span>
                <p className="text-gray-400 font-medium text-lg">Your fridge is looking a bit lonely.<br/>Add a container to get started!</p>
              </div>
            ) : (
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
                      <button
                        onClick={() => handleContainerDelete(container.id)}
                        className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                        title="Delete Container"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    
                    {container.foods && container.foods.length > 0 ? (
                      <ul className="divide-y divide-gray-50">
                        {container.foods.map((item) => {
                          const status = getStatus(item.expiration_date);
                          return (
                            <li key={item.id} className="group px-8 py-6 hover:bg-[#FDFCF9] transition-all flex justify-between items-center">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="text-lg font-black text-[#2C2C2E] truncate group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                                  <span className="text-xs font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg">
                                    ×{item.quantity}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {status && (
                                    <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md border ${status.color}`}>
                                      {status.label}
                                    </span>
                                  )}
                                  {item.expiration_date && (
                                    <p className="text-xs font-bold text-gray-400">
                                      {formatDate(item.expiration_date)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity translate-x-0 sm:translate-x-4 sm:group-hover:translate-x-0">
                                <button
                                  onClick={() => handleFoodOpen(item.id)}
                                  className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Open Product"
                                >
                                  <span className="text-sm font-bold whitespace-nowrap">🥫 Open</span>
                                </button>
                                <button
                                  onClick={() => handleFoodEdit(item)}
                                  className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Edit"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button
                                  onClick={() => handleFoodDelete(item.id)}
                                  className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Remove"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="p-12 text-center text-gray-300 font-bold italic tracking-tight">
                        Empty Space
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        
        <footer className="mt-20 pt-8 border-t border-gray-100 text-center">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Keep it fresh • Reduce waste • Save money</p>
        </footer>
      </div>
    </div>
  );
}
