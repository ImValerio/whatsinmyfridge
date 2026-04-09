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

  // Determine API URL on mount
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
    }
  }, []);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Form State
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
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
          const res = await fetch(`${apiBaseUrl}/food/autocomplete?q=${encodeURIComponent(foodName.trim())}`);
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

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to your fridge server.");
    } finally {
      setLoading(false);
    }
  }, [selectedContainerId, apiBaseUrl]);

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
        body: JSON.stringify({ name: userName.trim(), email: userEmail.trim() }),
      });

      if (!res.ok) throw new Error("Failed to save user");

      setUserName("");
      setUserEmail("");
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
      acc + (c.foods?.filter(f => getStatus(f.expiration_date)?.isExpired).length || 0), 0);
    return { totalItems, expiredItems };
  }, [containers]);

  const filteredContainers = useMemo(() => {
    if (selectedContainerId === "") return containers;
    return containers.filter(c => c.id === selectedContainerId);
  }, [containers, selectedContainerId]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2C2C2E] font-sans selection:bg-emerald-100 relative overflow-x-hidden pb-20 sm:pb-0">

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        users={users}
        userName={userName}
        userEmail={userEmail}
        setUserName={setUserName}
        setUserEmail={setUserEmail}
        onUserSubmit={handleUserSubmit}
        onUserEdit={(u) => { setEditingUser(u); setUserName(u.name); setUserEmail(u.email); }}
        onUserDelete={handleUserDelete}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        isSubmitting={isSubmittingUser}
        newContainerName={newContainerName}
        setNewContainerName={setNewContainerName}
        onContainerSubmit={handleCreateContainer}
        isCreatingContainer={isCreatingContainer}
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
        setFoodLogPage={(page) => {
          setFoodLogPage(page);
          fetchFoodLogs(page);
        }}
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                {containers.length > 1 ? (
                  <select
                    value={selectedContainerId}
                    onChange={(e) => setSelectedContainerId(Number(e.target.value))}
                    className="text-3xl font-black text-[#1C1C1E] bg-transparent border-none focus:ring-0 outline-none p-0 appearance-none"
                  >
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
              ) : containers.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium text-sm">Add a container in Settings!</p>
                </div>
              ) : (
                <InventoryList
                  containers={filteredContainers}
                  onFoodOpen={handleFoodOpen}
                  onFoodEdit={handleFoodEdit}
                  onFoodDelete={handleFoodDelete}
                  onContainerDelete={handleContainerDelete}
                  hideHeader={true}
                />
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-8">
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
            <div className="space-y-8">
              <h1 className="text-3xl font-black text-[#1C1C1E]">Settings</h1>

              <Card>
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Family Management
                </h2>
                <p className="text-sm text-gray-500 mb-6">Manage members who will receive notification.</p>
                <Button onClick={() => setIsFamilyModalOpen(true)} className="w-full">
                  Handle familiy members
                </Button>
              </Card>

              <Card>
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Food Suggestions
                </h2>
                <p className="text-sm text-gray-500 mb-6">Manage the list of common food names for autocomplete.</p>
                <Button onClick={() => setIsSuggestionsModalOpen(true)} variant="secondary" className="w-full">
                  Handle food suggestions
                </Button>
              </Card>

              <Card>
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  Containers
                </h2>
                <p className="text-sm text-gray-500 mb-6">Manage your fridge storage spaces.</p>
                <Button onClick={() => setIsContainersModalOpen(true)} variant="secondary" className="w-full">
                  Handle containers
                </Button>
              </Card>
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
                  className="w-full px-4 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white appearance-none text-sm"
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
            <div className="flex justify-between items-end px-2">
              <h2 className="text-4xl font-black text-[#1C1C1E] tracking-tight">Your Inventory</h2>
              <Button variant="secondary" size="sm" onClick={fetchData} className="rounded-full">
                Refresh Sync
              </Button>
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
            ) : containers.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                <span className="text-5xl mb-6 block grayscale opacity-50">🧊</span>
                <p className="text-gray-400 font-medium text-sm">Your fridge is looking a bit lonely.<br />Add a container to get started!</p>
              </div>
            ) : (
              <InventoryList
                containers={containers}
                onFoodOpen={handleFoodOpen}
                onFoodEdit={handleFoodEdit}
                onFoodDelete={handleFoodDelete}
                onContainerDelete={handleContainerDelete}
              />
            )}
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-100 text-center hidden sm:block">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Keep it fresh • Reduce waste • Save money</p>
        </footer>
      </div>

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
      {isFoodFormOpen && (
        <div className="fixed inset-0 bg-[#1C1C1E]/60 backdrop-blur-md z-[60] flex items-end sm:hidden">
          <div className="w-full bg-white rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-[#1C1C1E]">{editingFood ? "Edit Food" : "Add Food"}</h2>
              <button onClick={() => setIsFoodFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFoodSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Storage</label>
                <select
                  value={selectedContainerId}
                  onChange={(e) => setSelectedContainerId(Number(e.target.value))}
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold appearance-none"
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
          </div>
        </div>
      )}

      <BottomModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        title="Family Members"
      >
        <FamilyManager
          users={users}
          userName={userName}
          userEmail={userEmail}
          setUserName={setUserName}
          setUserEmail={setUserEmail}
          onUserSubmit={handleUserSubmit}
          onUserEdit={(u) => { setEditingUser(u); setUserName(u.name); setUserEmail(u.email); }}
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
