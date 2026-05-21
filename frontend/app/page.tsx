"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { User, FoodItem, Container, FoodLog } from "../types";
import { Button, Input, Card } from "../components/ui";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { InventoryList } from "../components/layout/InventoryList";
import { BottomNavbar, TabType } from "../components/layout/BottomNavbar";
import { getStatus } from "../lib/utils";
import { FamilyManager } from "../components/settings/FamilyManager";
import { SuggestionsManager } from "../components/settings/SuggestionsManager";
import { ContainerManager } from "../components/settings/ContainerManager";
import { SettingsMenu } from "../components/settings/SettingsMenu";
import { BottomModal } from "../components/ui/BottomModal";

export default function FridgeApp() {
  const [apiBaseUrl, setApiBaseUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api");
  const [containers, setContainers] = useState<Container[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<number | "">("");
  const [activeTab, setActiveTab] = useState<TabType>("food");
  const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);

  // Mobile settings modal states
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isContainersModalOpen, setIsContainersModalOpen] = useState(false);

  // FoodLog State
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [foodLogName, setFoodLogName] = useState("");
  const [editingFoodLog, setEditingFoodLog] = useState<FoodLog | null>(null);
  const [isSubmittingFoodLog, setIsSubmittingFoodLog] = useState(false);
  const [foodLogPage, setFoodLogPage] = useState(1);
  const [foodLogLastPage, setFoodLogLastPage] = useState(1);
  const [foodLogTotal, setFoodLogTotal] = useState(0);

  // Food State (Paginated)
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodPage, setFoodPage] = useState(1);
  const [foodLastPage, setFoodLastPage] = useState(1);
  const [foodTotal, setFoodTotal] = useState(0);
  const [pageSize, setPageSize] = useState(3);

  // Determine API URL on mount and set pageSize
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const currentConfig = process.env.NEXT_PUBLIC_API_URL || "";

      // If we're not on localhost, but our API is currently set to localhost (or empty),
      // we must adapt to the current network IP so mobile devices can connect.
      if (hostname !== "localhost" && (currentConfig.includes("localhost") || !currentConfig)) {
        // Use relative path if we are on port 80 (Nginx), otherwise specify the default backend port.
        const port = window.location.port;
        if (!port || port === "80") {
          setApiBaseUrl("/api");
        } else {
          setApiBaseUrl(`http://${hostname}:8080/api`);
        }
      }

      // Set pageSize based on screen width
      setPageSize(window.innerWidth < 640 ? 3 : 5);
    }
  }, []);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Form State
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userTelegramId, setUserTelegramId] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Container Form State
  const [newContainerName, setNewContainerName] = useState("");
  const [isCreatingContainer, setIsCreatingContainer] = useState(false);

  // Food Form State
  const [foodName, setFoodName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [expirationDate, setExpirationDate] = useState("");
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isSubmittingFood, setIsSubmittingFood] = useState(false);

  // Autocomplete Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (foodName.trim().length >= 2 && !editingFood) {
        try {
          setIsSearching(true);
          const res = await fetch(`${apiBaseUrl}/food-logs/autocomplete?q=${encodeURIComponent(foodName.trim())}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data || []);
          }
        } catch (err) {
          console.error("Autocomplete error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [foodName, apiBaseUrl, editingFood]);

  const fetchFoods = useCallback(async (page: number) => {
    try {
      const res = await fetch(`${apiBaseUrl}/food?page=${page}&pageSize=${pageSize}`);
      if (res.ok) {
        const result = await res.json();
        setFoods(result.data || []);
        setFoodTotal(result.total || 0);
        setFoodLastPage(result.last_page || 1);
      }
    } catch (err) {
      console.error("Error fetching foods:", err);
    }
  }, [apiBaseUrl, pageSize]);

  useEffect(() => {
    fetchFoods(foodPage);
  }, [foodPage, fetchFoods]);

  const fetchFoodLogs = useCallback(async (page: number) => {
    try {
      const res = await fetch(`${apiBaseUrl}/food-logs?page=${page}`);
      if (res.ok) {
        const result = await res.json();
        // Extract data array, total and lastPage from the response format
        setFoodLogs(result.data || []);
        setFoodLogTotal(result.total || 0);
        setFoodLogLastPage(result.lastPage || 1);
      }
    } catch (err) {
      console.error("Error fetching food logs:", err);
    }
  }, [apiBaseUrl]);

  // Handle page changes independently
  useEffect(() => {
    fetchFoodLogs(foodLogPage);
  }, [foodLogPage, fetchFoodLogs]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contRes, userRes] = await Promise.all([
        fetch(`${apiBaseUrl}/containers`),
        fetch(`${apiBaseUrl}/users`)
      ]);

      if (!contRes.ok || !userRes.ok) throw new Error("Failed to sync with server");

      const contData = await contRes.json();
      const userData = await userRes.json();

      setContainers(contData || []);
      setUsers(userData || []);

      if (contData && contData.length > 0 && selectedContainerId === "") {
        setSelectedContainerId(contData[0].id);
      }

      await fetchFoods(foodPage);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to your fridge server.");
    } finally {
      setLoading(false);
    }
  }, [selectedContainerId, apiBaseUrl, fetchFoods, foodPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- User Handlers ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    setIsSubmittingUser(true);
    const method = editingUser ? "PUT" : "POST";
    const url = editingUser ? `${apiBaseUrl}/users/${editingUser.id}` : `${apiBaseUrl}/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: userName.trim(), 
          email: userEmail.trim(),
          telegram_chat_id: userTelegramId ? Number(userTelegramId) : 0
        }),
      });

      if (!res.ok) throw new Error("Failed to save user");

      setUserName("");
      setUserEmail("");
      setUserTelegramId("");
      setEditingUser(null);
      fetchData();
    } catch (err) {
      alert("Error saving user. Ensure the email is unique.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleUserDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchData();
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  // --- Food Handlers ---
  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !selectedContainerId) return;

    setIsSubmittingFood(true);
    const method = editingFood ? "PUT" : "POST";
    const url = editingFood ? `${apiBaseUrl}/food/${editingFood.id}` : `${apiBaseUrl}/food`;
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

      if (!res.ok) throw new Error("Failed to save food");
      setFoodName("");
      setQuantity(1);
      setExpirationDate("");
      setEditingFood(null);
      setIsFoodFormOpen(false);
      fetchData();
    } catch (err) {
      alert("Could not save food item.");
    } finally {
      setIsSubmittingFood(false);
    }
  };

  const handleFoodOpen = async (id: number, expirationDays: number = 2) => {
    try {
      const res = await fetch(`${apiBaseUrl}/food/${id}/open?expirationDays=${expirationDays}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to open item");
      fetchData();
    } catch (err) {
      alert("Error opening item.");
    }
  };

  const handleFoodDelete = async (id: number) => {
    if (!confirm("Remove this item?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/food/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch (err) {
      alert("Error deleting item.");
    }
  };

  const handleFoodFreeze = async (id: number) => {
    try {
      const res = await fetch(`${apiBaseUrl}/food/${id}/frozen`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to toggle frozen state");
      fetchData();
    } catch (err) {
      alert("Error toggling frozen state.");
    }
  };

  const handleFoodEdit = (item: FoodItem) => {
    setEditingFood(item);
    setFoodName(item.name);
    setQuantity(item.quantity);
    setExpirationDate(item.expiration_date ? item.expiration_date.split("T")[0] : "");
    setSelectedContainerId(item.container_id);
    setIsFoodFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Container Handlers ---
  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContainerName.trim()) return;
    setIsCreatingContainer(true);
    try {
      const res = await fetch(`${apiBaseUrl}/containers`, {
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
      alert("Error creating container.");
    } finally {
      setIsCreatingContainer(false);
    }
  };

  const handleContainerDelete = async (id: number) => {
    if (!confirm("Delete this container and all its contents?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/containers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchData();
    } catch (err) {
      alert("Could not delete container.");
    }
  };

  // --- FoodLog Handlers ---
  const handleFoodLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodLogName.trim()) return;

    setIsSubmittingFoodLog(true);
    const method = editingFoodLog ? "PUT" : "POST";
    const url = editingFoodLog ? `${apiBaseUrl}/food-logs/${editingFoodLog.id}` : `${apiBaseUrl}/food-logs`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: foodLogName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to save food suggestion");

      setFoodLogName("");
      setEditingFoodLog(null);
      fetchFoodLogs(foodLogPage);
    } catch (err) {
      alert("Error saving food suggestion.");
    } finally {
      setIsSubmittingFoodLog(false);
    }
  };

  const handleFoodLogDelete = async (id: number) => {
    if (!confirm("Delete this food suggestion?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/food-logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchFoodLogs(foodLogPage);
    } catch (err) {
      alert("Error deleting food suggestion.");
    }
  };

  const inventoryStats = useMemo(() => {
    const totalItems = containers.reduce((acc, c) => acc + (c.foods?.length || 0), 0);
    const expiredItems = containers.reduce((acc, c) =>
      acc + (c.foods?.filter(f => !f.is_frozen && getStatus(f.expiration_date)?.isExpired).length || 0), 0);
    return { totalItems, expiredItems };
  }, [containers]);

  const containersWithPaginatedFoods = useMemo(() => {
    const grouped: { [key: number]: FoodItem[] } = {};
    foods.forEach(f => {
      if (!grouped[f.container_id]) grouped[f.container_id] = [];
      grouped[f.container_id].push(f);
    });

    return containers.map(c => ({
      ...c,
      foods: grouped[c.id] || []
    })).filter(c => c.foods.length > 0);
  }, [containers, foods]);

  const filteredContainers = useMemo(() => {
    if (selectedContainerId === "") return containersWithPaginatedFoods;
    return containersWithPaginatedFoods.filter(c => c.id === selectedContainerId);
  }, [containersWithPaginatedFoods, selectedContainerId]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2C2C2E] font-sans selection:bg-emerald-100 relative overflow-x-hidden pb-20 sm:pb-0">

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenFamily={() => { setIsFamilyModalOpen(true); setIsSidebarOpen(false); }}
        onOpenSuggestions={() => { setIsSuggestionsModalOpen(true); setIsSidebarOpen(false); }}
        onOpenContainers={() => { setIsContainersModalOpen(true); setIsSidebarOpen(false); }}
      />

      <div className={`py-8 sm:py-16 px-4 sm:px-8 max-w-2xl mx-auto transition-all duration-500 ${isSidebarOpen ? 'sm:translate-x-40 blur-sm pointer-events-none' : ''}`}>

        {/* Desktop Header */}
        <div className="hidden sm:block">
          <Header
            users={users}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            totalItems={inventoryStats.totalItems}
            expiredItems={inventoryStats.expiredItems}
          />
        </div>

        {/* Mobile Views */}
        <div className="sm:hidden">
          {activeTab === "food" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out-quint">
              <div className="flex justify-between items-center">
                {containers.length > 1 ? (
                  <select
                    value={selectedContainerId}
                    onChange={(e) => setSelectedContainerId(Number(e.target.value))}
                    className="text-3xl font-black text-[#1C1C1E] bg-transparent border-none focus:ring-0 outline-none p-0 appearance-none"
                  >
                    <option value="">All Fridges</option>
                    {containers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <h1 className="text-3xl font-black text-[#1C1C1E]">
                    {containers.find(c => c.id === selectedContainerId)?.name || "Fridge"}
                  </h1>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
              ) : foods.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium text-sm">Add a container or food in Settings!</p>
                </div>
              ) : (
                <InventoryList
                  containers={filteredContainers}
                  onFoodOpen={handleFoodOpen}
                  onFoodEdit={handleFoodEdit}
                  onFoodDelete={handleFoodDelete}
                  onFoodFreeze={handleFoodFreeze}
                  onContainerDelete={handleContainerDelete}
                  hideHeader={true}
                />
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out-quint">
              <h1 className="text-3xl font-black text-[#1C1C1E]">Statistics</h1>
              <div className="grid gap-4">
                <div className="bg-white px-6 py-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
                  <span className="block text-5xl font-black text-[#1C1C1E] mb-2">{inventoryStats.totalItems}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Items tracked</span>
                </div>
                <div className={`px-6 py-8 rounded-[2rem] shadow-sm border text-center transition-colors ${inventoryStats.expiredItems > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-gray-100'}`}>
                  <span className={`block text-5xl font-black mb-2 ${inventoryStats.expiredItems > 0 ? 'text-rose-600' : 'text-[#1C1C1E]'}`}>{inventoryStats.expiredItems}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${inventoryStats.expiredItems > 0 ? 'text-rose-400' : 'text-gray-400'}`}>Expired Items</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out-quint">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-[#1C1C1E] tracking-tight">Settings</h1>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Personalize your fridge experience</p>
              </div>

              <SettingsMenu
                onOpenFamily={() => setIsFamilyModalOpen(true)}
                onOpenSuggestions={() => setIsSuggestionsModalOpen(true)}
                onOpenContainers={() => setIsContainersModalOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Desktop Main Content */}
        <div className="hidden sm:grid gap-10">
          <div className="max-w-md mx-auto w-full">
            <Card variant="dark">
              <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {editingFood ? "Edit Item" : "Quick Add"}
              </h2>
              <form onSubmit={handleFoodSubmit} className="space-y-4">
                <select
                  value={selectedContainerId}
                  onChange={(e) => setSelectedContainerId(Number(e.target.value))}
                  className="w-full px-4 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white appearance-none text-base"
                  required
                  disabled={isSubmittingFood}
                >
                  <option value="" disabled className="text-gray-900">Choose storage...</option>
                  {containers.map(c => (
                    <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>
                  ))}
                </select>

                <div className="flex gap-2 relative">
                  <div className="flex-[3] relative">
                    <Input
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                      className="bg-white/10 text-white placeholder:text-gray-500"
                      placeholder="What is it?"
                      required
                      maxLength={50}
                      disabled={isSubmittingFood}
                    />

                    {/* Autocomplete Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFoodName(suggestion);
                              setSuggestions([]);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-gray-50 last:border-none"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="flex-1 bg-white/10 text-white [appearance:textfield]"
                    required
                    disabled={isSubmittingFood}
                  />
                </div>

                <div className="relative">
                  <Input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-white/10 text-white [color-scheme:dark]"
                    disabled={isSubmittingFood}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 pointer-events-none uppercase tracking-tighter">Expires</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" isLoading={isSubmittingFood} className="flex-1">
                    {editingFood ? "Update" : "Add Food"}
                  </Button>
                  {editingFood && (
                    <Button variant="dark" onClick={() => { setEditingFood(null); setFoodName(""); setQuantity(1); setExpirationDate(""); }}>
                      ✕
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          <section className="space-y-8 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <h2 className="text-4xl font-black text-[#1C1C1E] tracking-tight">Your Inventory</h2>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={fetchData} className="rounded-full px-6 py-5">
                  Refresh Sync
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold animate-pulse text-sm">Syncing shelves...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center bg-rose-50 rounded-[2rem] border border-rose-100">
                <span className="text-4xl mb-4 block">🔌</span>
                <p className="text-rose-600 font-bold mb-4 text-sm">{error}</p>
                <Button variant="danger" onClick={fetchData}>Retry Sync</Button>
              </div>
            ) : foods.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                <span className="text-5xl mb-6 block grayscale opacity-50">🧊</span>
                <p className="text-gray-400 font-medium text-sm">Your fridge is looking a bit lonely.<br />Add a container to get started!</p>
              </div>
            ) : (
              <InventoryList
                containers={containersWithPaginatedFoods}
                onFoodOpen={handleFoodOpen}
                onFoodEdit={handleFoodEdit}
                onFoodDelete={handleFoodDelete}
                onFoodFreeze={handleFoodFreeze}
                onContainerDelete={handleContainerDelete}
              />
            )}
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-100 text-center hidden sm:block">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Keep it fresh • Reduce waste • Save money</p>
        </footer>
      </div>

      {/* Floating Side Pagination */}
      {foodTotal > pageSize && (activeTab === "food" || (typeof window !== "undefined" && window.innerWidth >= 640)) && (
        <>
          <button
            onClick={() => setFoodPage(Math.max(1, foodPage - 1))}
            disabled={foodPage <= 1}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-emerald-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90 hover:bg-white animate-in fade-in slide-in-from-left-4 duration-500"
            title="Previous Page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setFoodPage(foodPage + 1)}
            disabled={foodPage >= foodLastPage}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-emerald-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90 hover:bg-white animate-in fade-in slide-in-from-right-4 duration-500"
            title="Next Page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Floating Page Indicator */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-gray-100 shadow-xl text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-500 sm:bottom-8">
            Page {foodPage} <span className="text-emerald-300 mx-1">/</span> {foodLastPage}
          </div>
        </>
      )}

      {/* Mobile FAB */}
      {activeTab === "food" && (
        <button
          onClick={() => { setEditingFood(null); setFoodName(""); setQuantity(1); setExpirationDate(""); setIsFoodFormOpen(true); }}
          className="fixed bottom-24 right-6 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center z-30 sm:hidden active:scale-90 transition-transform"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Mobile Food Form Modal */}
      <BottomModal
        isOpen={isFoodFormOpen}
        onClose={() => setIsFoodFormOpen(false)}
        title={editingFood ? "Edit Food" : "Add Food"}
      >
        <form onSubmit={handleFoodSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Storage</label>
            <select
              value={selectedContainerId}
              onChange={(e) => setSelectedContainerId(Number(e.target.value))}
              className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500 outline-none text-base font-bold appearance-none"
              required
            >
              <option value="" disabled>Choose storage...</option>
              {containers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Item Name</label>
            <div className="relative">
              <Input
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="bg-gray-50 border-none rounded-[1.5rem] py-5 px-6"
                placeholder="e.g. Greek Yogurt"
                required
              />
              {suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setFoodName(suggestion); setSuggestions([]); }}
                      className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-emerald-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                className="bg-gray-50 border-none rounded-[1.5rem] py-5 px-6"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Expires</label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="bg-gray-50 border-none rounded-[1.5rem] py-5 px-6"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isSubmittingFood} className="w-full py-6 rounded-[1.5rem] text-lg">
            {editingFood ? "Save Changes" : "Add to Fridge"}
          </Button>
        </form>
      </BottomModal>


      <BottomModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        title="Family Members"
      >
        <FamilyManager
          users={users}
          userName={userName}
          userEmail={userEmail}
          userTelegramId={userTelegramId}
          setUserName={setUserName}
          setUserEmail={setUserEmail}
          setUserTelegramId={setUserTelegramId}
          onUserSubmit={handleUserSubmit}
          onUserEdit={(u) => { 
            setEditingUser(u); 
            setUserName(u.name); 
            setUserEmail(u.email);
            setUserTelegramId(u.telegram_chat_id ? String(u.telegram_chat_id) : "");
          }}
          onUserDelete={handleUserDelete}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          isSubmitting={isSubmittingUser}
        />
      </BottomModal>

      <BottomModal
        isOpen={isSuggestionsModalOpen}
        onClose={() => setIsSuggestionsModalOpen(false)}
        title="Food Suggestions"
      >
        <SuggestionsManager
          foodLogs={foodLogs}
          foodLogName={foodLogName}
          setFoodLogName={setFoodLogName}
          onFoodLogSubmit={handleFoodLogSubmit}
          onFoodLogEdit={(log) => { setEditingFoodLog(log); setFoodLogName(log.name); }}
          onFoodLogDelete={handleFoodLogDelete}
          editingFoodLog={editingFoodLog}
          setEditingFoodLog={setEditingFoodLog}
          isSubmittingFoodLog={isSubmittingFoodLog}
          foodLogPage={foodLogPage}
          foodLogLastPage={foodLogLastPage}
          foodLogTotal={foodLogTotal}
          setFoodLogPage={(page) => {
            setFoodLogPage(page);
            fetchFoodLogs(page);
          }}
        />
      </BottomModal>

      <BottomModal
        isOpen={isContainersModalOpen}
        onClose={() => setIsContainersModalOpen(false)}
        title="Containers"
      >
        <ContainerManager
          newContainerName={newContainerName}
          setNewContainerName={setNewContainerName}
          onContainerSubmit={handleCreateContainer}
          isCreatingContainer={isCreatingContainer}
        />
      </BottomModal>

      <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
