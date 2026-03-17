"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { User, FoodItem, Container } from "../types";
import { Button, Input, Card } from "../components/ui";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { InventoryList } from "../components/layout/InventoryList";

export default function FridgeApp() {
  const [apiBaseUrl, setApiBaseUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api");
  const [containers, setContainers] = useState<Container[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<number | "">("");

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

  const inventoryStats = useMemo(() => {
    const totalItems = containers.reduce((acc, c) => acc + (c.foods?.length || 0), 0);
    const expiredItems = containers.reduce((acc, c) =>
      acc + (c.foods?.filter(f => f.expiration_date && new Date(f.expiration_date) < new Date()).length || 0), 0);
    return { totalItems, expiredItems };
  }, [containers]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2C2C2E] font-sans selection:bg-emerald-100 relative overflow-x-hidden">

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
      />

      <div className={`py-16 px-6 sm:px-8 max-w-2xl mx-auto transition-all duration-500 ${isSidebarOpen ? 'sm:translate-x-40 blur-sm pointer-events-none' : ''}`}>

        <Header
          users={users}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          totalItems={inventoryStats.totalItems}
          expiredItems={inventoryStats.expiredItems}
        />

        <div className="grid gap-10">
          <div className="grid sm:grid-cols-2 gap-6 items-start">

            <Card>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                New Space
              </h2>
              <form onSubmit={handleCreateContainer} className="space-y-4">
                <Input
                  value={newContainerName}
                  onChange={(e) => setNewContainerName(e.target.value)}
                  placeholder="e.g. Kitchen Fridge"
                  required
                  maxLength={30}
                  disabled={isCreatingContainer}
                />
                <Button type="submit" isLoading={isCreatingContainer} className="w-full">
                  Add Container
                </Button>
              </form>
            </Card>

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

        <footer className="mt-20 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Keep it fresh • Reduce waste • Save money</p>
        </footer>
      </div>
    </div>
  );
}
