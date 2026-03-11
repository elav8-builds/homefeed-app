"use client";

import { useState, useEffect, useCallback } from "react";

interface Property {
  id: string;
  address: string;
  city: string;
  price: number;
  status: string;
  beds: number;
  baths: number;
  sqft: number;
  images: string[];
  created_at: string;
}

interface Stats {
  properties: number;
  agents: number;
  users: number;
  comments: number;
}

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<Stats>({ properties: 0, agents: 0, users: 0, comments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Property>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/properties?limit=100");
      if (!res.ok) throw new Error("Failed to load properties");
      const data = await res.json();
      setProperties(data.properties || []);
      setStats(prev => ({ ...prev, properties: data.pagination?.total || 0 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      setSeedResult(data.results?.join(", ") || "Seeded successfully");
      showToast("Database seeded successfully!");
      loadData();
    } catch (err) {
      setSeedResult(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProperties(prev => prev.filter(p => p.id !== id));
      showToast("Listing deleted");
    } catch {
      showToast("Failed to delete listing");
    }
  };

  const handleEdit = (property: Property) => {
    setEditingId(property.id);
    setEditForm({
      address: property.address,
      city: property.city,
      price: property.price,
      status: property.status,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/properties/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setProperties(prev => prev.map(p => p.id === editingId ? { ...p, ...updated } : p));
      setEditingId(null);
      showToast("Listing updated!");
    } catch {
      showToast("Failed to update listing");
    }
  };

  const formatPrice = (p: number) => `$${p.toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Home<span className="text-indigo-400">Feed</span> Admin
            </h1>
            <p className="text-xs text-slate-500">Manage listings, agents, and settings</p>
          </div>
          <a href="/" className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 glass rounded-lg">
            ← Back to App
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Properties", value: stats.properties, icon: "🏠" },
            { label: "Active", value: properties.filter(p => p.status === "active").length, icon: "✅" },
            { label: "Pending", value: properties.filter(p => p.status === "pending").length, icon: "⏳" },
            { label: "Sold", value: properties.filter(p => p.status === "sold").length, icon: "🎉" },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span>{stat.icon}</span>
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Seed button */}
        <div className="mb-6 glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Database Seeding</h3>
              <p className="text-xs text-slate-500">Populate the database with demo properties, agents, and neighborhoods</p>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 rounded-lg text-sm font-medium transition-all"
            >
              {seeding ? "Seeding..." : "Seed Database"}
            </button>
          </div>
          {seedResult && (
            <p className="mt-2 text-xs text-slate-400">{seedResult}</p>
          )}
        </div>

        {/* Properties table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-bold">Listings ({properties.length})</h2>
          </div>

          {properties.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm">No properties found. Seed the database or create listings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs">
                    <th className="text-left px-4 py-3 font-medium">Property</th>
                    <th className="text-left px-4 py-3 font-medium">Price</th>
                    <th className="text-left px-4 py-3 font-medium">Beds/Bath</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => (
                    <tr key={property.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {property.images?.[0] && (
                            <img src={property.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            {editingId === property.id ? (
                              <input
                                value={editForm.address || ""}
                                onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white w-full"
                              />
                            ) : (
                              <p className="text-white font-medium text-xs">{property.address}</p>
                            )}
                            <p className="text-slate-500 text-[10px]">{property.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === property.id ? (
                          <input
                            type="number"
                            value={editForm.price || 0}
                            onChange={e => setEditForm(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white w-24"
                          />
                        ) : (
                          <span className="text-indigo-300">{formatPrice(property.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {editingId === property.id ? (
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={editForm.beds || 0}
                              onChange={e => setEditForm(prev => ({ ...prev, beds: parseInt(e.target.value) }))}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white w-12"
                            />
                            <input
                              type="number"
                              value={editForm.baths || 0}
                              onChange={e => setEditForm(prev => ({ ...prev, baths: parseInt(e.target.value) }))}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white w-12"
                            />
                          </div>
                        ) : (
                          <span className="text-xs">{property.beds}bd / {property.baths}ba</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === property.id ? (
                          <select
                            value={editForm.status || "active"}
                            onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            property.status === "active" ? "bg-emerald-500/20 text-emerald-300" :
                            property.status === "pending" ? "bg-amber-500/20 text-amber-300" :
                            "bg-slate-500/20 text-slate-300"
                          }`}>
                            {property.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId === property.id ? (
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={handleSave}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 rounded text-xs transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleEdit(property)}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-full shadow-lg animate-fade-in z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
