"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  authWallet,
  getLocations,
  getSlots,
  getBookings,
  createBooking,
  checkInBooking,
  checkOutBooking,
  initiatePayment,
  verifyPayment,
} from "@/hooks/useApi";

type ToastType = "success" | "error" | "info";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-100 border-green-500 text-green-800",
    error: "bg-red-100 border-red-500 text-red-800",
    info: "bg-blue-100 border-blue-500 text-blue-800",
  };

  return (
    <div className={`fixed top-20 right-4 z-50 brutal-border ${colors[type]} px-4 py-3 animate-slide-up`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 font-bold text-lg leading-none">&times;</button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected, connect, isConnecting } = useWallet();
  const [user, setUser] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingHours, setBookingHours] = useState(1);

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  useEffect(() => {
    if (isConnected && address) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  async function loadData() {
    setLoading(true);
    try {
      if (address) {
        const { user: u } = await authWallet(address);
        setUser(u);
        const [locRes, slotRes, bookRes] = await Promise.all([
          getLocations(),
          getSlots(),
          getBookings(u.id),
        ]);
        setLocations(locRes.locations);
        setSlots(slotRes.slots);
        setBookings(bookRes.bookings);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load data", "error");
    }
    setLoading(false);
  }

  async function handleCreateBooking(slotId: number) {
    if (!user) return;
    try {
      const now = new Date();
      const end = new Date(now.getTime() + bookingHours * 3600000);
      await createBooking(user.id, slotId, now.toISOString(), end.toISOString());
      showToast("Booking created successfully!", "success");
      setSelectedSlot(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to create booking", "error");
    }
  }

  async function handleCheckIn(bookingId: number) {
    try {
      await checkInBooking(bookingId);
      showToast("Checked in! Enjoy your parking.", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Check-in failed", "error");
    }
  }

  async function handleCheckOut(bookingId: number) {
    try {
      await checkOutBooking(bookingId);
      const payRes = await initiatePayment(bookingId);
      showToast(`Checked out! Amount due: ${payRes.amount} XLM`, "info");
      loadData();

      // Simulate Stellar payment verification
      const txHash = `tx_stellar_${Date.now()}`;
      await verifyPayment(bookingId, txHash, bookingId);
      showToast("Payment recorded on Stellar Testnet!", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Checkout failed", "error");
    }
  }

  const availableSlots = slots.filter((s) => s.status === "available");
  const activeBooking = bookings.find((b) => b.status === "active" || b.status === "pending");
  const pastBookings = bookings.filter((b) => b.status === "paid" || b.status === "completed");

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="brutal-card text-center max-w-md p-8">
          <div className="text-5xl mb-4">🔌</div>
          <h2 className="text-2xl font-extrabold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 font-medium mb-6">
            Connect your Freighter wallet to access the ParkChain dashboard.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="brutal-btn brutal-btn-yellow"
          >
            {isConnecting ? "Connecting..." : "Connect Freighter Wallet"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-park-yellow border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Active Booking */}
      {activeBooking && (
        <div className="brutal-card bg-park-yellow-light mb-8 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-green-700 uppercase">Active Booking</span>
              </div>
              <h3 className="text-xl font-extrabold">
                Slot {activeBooking.slot_number} - {activeBooking.location_name}
              </h3>
              <p className="text-sm font-medium text-gray-600">
                {new Date(activeBooking.start_time).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              {activeBooking.status === "pending" && (
                <button
                  onClick={() => handleCheckIn(activeBooking.id)}
                  className="brutal-btn brutal-btn-yellow text-sm"
                >
                  🚗 Check In
                </button>
              )}
              {activeBooking.status === "active" && (
                <button
                  onClick={() => handleCheckOut(activeBooking.id)}
                  className="brutal-btn brutal-btn-black text-sm"
                >
                  🏁 Check Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Available Slots */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-extrabold">Available Parking Slots</h2>

          {/* Locations */}
          {locations.map((loc) => {
            const locSlots = availableSlots.filter(
              (s) => s.location_id === loc.id
            );
            if (locSlots.length === 0) return null;
            return (
              <div key={loc.id} className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  📍 {loc.name}
                  <span className="text-sm font-medium text-gray-500">
                    ({locSlots.length} available)
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {locSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="brutal-border p-4 cursor-pointer hover:bg-park-yellow-light transition-colors"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-lg">
                          Slot {slot.slot_number}
                        </span>
                        <span className="bg-park-yellow px-3 py-1 border-2 border-black rounded-lg text-sm font-bold">
                          ${slot.hourly_rate}/hr
                        </span>
                      </div>
                      <p className="text-sm font-medium text-green-600">● Available</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {availableSlots.length === 0 && (
            <div className="brutal-card text-center py-12">
              <div className="text-4xl mb-3">🅿️</div>
              <h3 className="text-xl font-extrabold mb-2">No Slots Available</h3>
              <p className="text-gray-600 font-medium">All parking slots are currently occupied. Check back later!</p>
            </div>
          )}
        </div>

        {/* Booking Modal / Sidebar */}
        <div className="space-y-6">
          {selectedSlot ? (
            <div className="brutal-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold">Reserve Slot</h3>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="w-8 h-8 brutal-border flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <p className="font-bold">
                  Slot {selectedSlot.slot_number}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedSlot.location_name}
                </p>
                <p className="text-sm font-bold">
                  Rate: ${selectedSlot.hourly_rate}/hour
                </p>
                <div>
                  <label className="text-sm font-bold block mb-1">Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={bookingHours}
                    onChange={(e) => setBookingHours(Number(e.target.value))}
                    className="brutal-input w-full"
                  />
                </div>
                <div className="border-t-3 border-black pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(bookingHours * Number(selectedSlot.hourly_rate)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCreateBooking(selectedSlot.id)}
                className="brutal-btn brutal-btn-yellow w-full"
              >
                Reserve Now
              </button>
            </div>
          ) : (
            <div className="brutal-card">
              <h3 className="text-lg font-extrabold mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between font-bold">
                  <span>Available Slots</span>
                  <span className="text-green-600">{availableSlots.length}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Your Bookings</span>
                  <span>{bookings.length}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Active</span>
                  <span className="text-green-600">{activeBooking ? 1 : 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking History */}
          <div className="brutal-card">
            <h3 className="text-lg font-extrabold mb-3">Booking History</h3>
            {pastBookings.length === 0 ? (
              <p className="text-sm text-gray-500 font-medium">No past bookings yet.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pastBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 border-2 border-black rounded-xl bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm">
                          Slot {b.slot_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(b.start_time).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 border-2 border-black rounded-lg ${
                          b.status === "paid" ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    {b.amount > 0 && (
                      <p className="text-sm font-bold mt-1">
                        ${b.amount}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
