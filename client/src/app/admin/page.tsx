"use client";

import { useState, useEffect } from "react";
import {
  getLocations,
  getSlots,
  getBookings,
  createLocation,
  createSlot,
  updateSlot,
  deleteSlot,
} from "@/hooks/useApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ToastType = "success" | "error" | "info";

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const colors = { success: "bg-green-100 border-green-500", error: "bg-red-100 border-red-500", info: "bg-blue-100 border-blue-500" };
  return (
    <div className={`fixed top-20 right-4 z-50 brutal-border ${colors[type]} px-4 py-3 animate-slide-up`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 font-bold text-lg leading-none">&times;</button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "slots" | "bookings" | "locations">("overview");

  // Forms
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddr, setNewLocationAddr] = useState("");
  const [newSlotLocation, setNewSlotLocation] = useState("");
  const [newSlotNumber, setNewSlotNumber] = useState("");
  const [newSlotRate, setNewSlotRate] = useState("5");

  const showToast = (msg: string, t: ToastType) => setToast({ message: msg, type: t });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [locRes, slotRes, bookRes] = await Promise.all([
        getLocations(),
        getSlots(),
        getBookings(),
      ]);
      setLocations(locRes.locations);
      setSlots(slotRes.slots);
      setBookings(bookRes.bookings);
    } catch (err: any) {
      showToast(err.message || "Failed to load", "error");
    }
    setLoading(false);
  }

  const totalSlots = slots.length;
  const occupiedSlots = slots.filter((s) => s.status === "occupied" || s.status === "reserved").length;
  const availableSlots = slots.filter((s) => s.status === "available").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + parseFloat(b.amount || "0"), 0);

  const pieData = [
    { name: "Available", value: availableSlots, color: "#22C55E" },
    { name: "Occupied", value: occupiedSlots, color: "#EF4444" },
    { name: "Reserved", value: slots.filter((s) => s.status === "reserved").length, color: "#FFD93D" },
  ];

  const locationChartData = locations.map((l: any) => ({
    name: l.name.split(" ")[0],
    total: parseInt(l.total_slots) || 0,
    available: parseInt(l.available_slots) || 0,
  }));

  async function handleCreateLocation() {
    if (!newLocationName || !newLocationAddr) return;
    try {
      await createLocation(newLocationName, newLocationAddr);
      showToast("Location created!", "success");
      setNewLocationName("");
      setNewLocationAddr("");
      loadData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  async function handleCreateSlot() {
    if (!newSlotLocation || !newSlotNumber) return;
    try {
      await createSlot(Number(newSlotLocation), newSlotNumber, Number(newSlotRate));
      showToast("Slot created!", "success");
      setNewSlotNumber("");
      loadData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  async function handleToggleSlot(slot: any) {
    const newStatus = slot.status === "available" ? "maintenance" : "available";
    try {
      await updateSlot(slot.id, { status: newStatus });
      showToast(`Slot ${slot.slot_number} set to ${newStatus}`, "success");
      loadData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  async function handleDeleteSlot(id: number) {
    if (!confirm("Delete this slot?")) return;
    try {
      await deleteSlot(id);
      showToast("Slot deleted", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  const StatCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
    <div className="brutal-card">
      <p className="text-sm font-bold text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold`} style={{ color }}>{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-park-yellow border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="text-gray-600 font-medium">Manage parking locations, slots, and bookings</p>
        </div>
        <button onClick={loadData} className="brutal-btn brutal-btn-white text-sm">
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Slots" value={totalSlots} color="#1A1A1A" />
        <StatCard label="Available" value={availableSlots} color="#22C55E" />
        <StatCard label="Occupied" value={occupiedSlots} color="#EF4444" />
        <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} color="#FFD93D" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="brutal-card">
          <h3 className="font-extrabold mb-4">Slot Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="#1A1A1A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="brutal-card">
          <h3 className="font-extrabold mb-4">Slots by Location</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={locationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="name" stroke="#1A1A1A" />
              <YAxis stroke="#1A1A1A" />
              <Tooltip />
              <Bar dataKey="total" fill="#FFD93D" stroke="#1A1A1A" strokeWidth={2} name="Total" />
              <Bar dataKey="available" fill="#22C55E" stroke="#1A1A1A" strokeWidth={2} name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-3 border-black pb-2 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Overview" },
          { id: "slots" as const, label: "Slot Management" },
          { id: "locations" as const, label: "Locations" },
          { id: "bookings" as const, label: "Bookings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold text-sm rounded-t-xl border-3 border-b-0 border-black transition-colors ${
              activeTab === tab.id ? "bg-park-yellow" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="brutal-card">
          <h3 className="font-extrabold text-lg mb-4">Recent Bookings</h3>
          {bookings.length === 0 ? (
            <p className="text-gray-500 font-medium">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-3 border-black">
                    <th className="text-left py-2 font-extrabold">ID</th>
                    <th className="text-left py-2 font-extrabold">Slot</th>
                    <th className="text-left py-2 font-extrabold">Status</th>
                    <th className="text-left py-2 font-extrabold">Amount</th>
                    <th className="text-left py-2 font-extrabold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="border-b-2 border-gray-200">
                      <td className="py-2 font-medium">#{b.id}</td>
                      <td className="py-2 font-medium">{b.slot_number}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 border-2 border-black rounded-lg text-xs font-bold ${
                          b.status === "paid" ? "bg-green-100" : b.status === "active" ? "bg-park-yellow-light" : "bg-gray-100"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 font-medium">${b.amount || "0.00"}</td>
                      <td className="py-2 text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <div className="space-y-6">
          <div className="brutal-card">
            <h3 className="font-extrabold text-lg mb-4">Add Location</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                placeholder="Location name"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="brutal-input"
              />
              <input
                placeholder="Address"
                value={newLocationAddr}
                onChange={(e) => setNewLocationAddr(e.target.value)}
                className="brutal-input"
              />
              <button onClick={handleCreateLocation} className="brutal-btn brutal-btn-yellow">
                + Add Location
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="brutal-card">
                <h4 className="font-extrabold">{loc.name}</h4>
                <p className="text-sm text-gray-500 font-medium">{loc.address}</p>
                <div className="flex gap-4 mt-3 text-sm font-bold">
                  <span>Total: {loc.total_slots}</span>
                  <span className="text-green-600">Free: {loc.available_slots}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === "slots" && (
        <div className="space-y-6">
          <div className="brutal-card">
            <h3 className="font-extrabold text-lg mb-4">Add Slot</h3>
            <div className="grid sm:grid-cols-4 gap-3">
              <select
                value={newSlotLocation}
                onChange={(e) => setNewSlotLocation(e.target.value)}
                className="brutal-input"
              >
                <option value="">Select location</option>
                {locations.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <input
                placeholder="Slot number (e.g. A01)"
                value={newSlotNumber}
                onChange={(e) => setNewSlotNumber(e.target.value)}
                className="brutal-input"
              />
              <input
                type="number"
                step="0.5"
                placeholder="Hourly rate"
                value={newSlotRate}
                onChange={(e) => setNewSlotRate(e.target.value)}
                className="brutal-input"
              />
              <button onClick={handleCreateSlot} className="brutal-btn brutal-btn-yellow">
                + Add Slot
              </button>
            </div>
          </div>
          <div className="brutal-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-3 border-black">
                  <th className="text-left py-2 font-extrabold">Slot</th>
                  <th className="text-left py-2 font-extrabold">Location</th>
                  <th className="text-left py-2 font-extrabold">Status</th>
                  <th className="text-left py-2 font-extrabold">Rate</th>
                  <th className="text-right py-2 font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id} className="border-b-2 border-gray-200">
                    <td className="py-2 font-bold">{slot.slot_number}</td>
                    <td className="py-2 font-medium">{slot.location_name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 border-2 border-black rounded-lg text-xs font-bold ${
                        slot.status === "available" ? "bg-green-100" :
                        slot.status === "occupied" ? "bg-red-100" :
                        slot.status === "reserved" ? "bg-park-yellow-light" : "bg-gray-100"
                      }`}>
                        {slot.status}
                      </span>
                    </td>
                    <td className="py-2 font-medium">${slot.hourly_rate}/hr</td>
                    <td className="py-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleSlot(slot)}
                          className="px-3 py-1 border-2 border-black rounded-lg text-xs font-bold bg-white hover:bg-gray-100"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="px-3 py-1 border-2 border-red-500 text-red-600 rounded-lg text-xs font-bold bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="brutal-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-3 border-black">
                <th className="text-left py-2 font-extrabold">ID</th>
                <th className="text-left py-2 font-extrabold">User</th>
                <th className="text-left py-2 font-extrabold">Slot</th>
                <th className="text-left py-2 font-extrabold">Status</th>
                <th className="text-left py-2 font-extrabold">Amount</th>
                <th className="text-left py-2 font-extrabold">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b-2 border-gray-200">
                    <td className="py-2 font-medium">#{b.id}</td>
                    <td className="py-2 font-medium">{b.user_id}</td>
                    <td className="py-2 font-medium">{b.slot_number}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 border-2 border-black rounded-lg text-xs font-bold ${
                        b.status === "paid" ? "bg-green-100" :
                        b.status === "active" ? "bg-park-yellow-light" : "bg-gray-100"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2 font-medium">${b.amount || "0.00"}</td>
                    <td className="py-2">
                      <span className="text-xs font-mono text-gray-500">
                        {b.transaction_hash ? `${b.transaction_hash.slice(0, 10)}...` : "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
