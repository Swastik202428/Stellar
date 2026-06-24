"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function authWallet(walletAddress: string) {
  return fetchApi("/auth/wallet", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
}

export async function getLocations() {
  return fetchApi("/locations");
}

export async function createLocation(name: string, address: string) {
  return fetchApi("/locations", {
    method: "POST",
    body: JSON.stringify({ name, address }),
  });
}

export async function getSlots(locationId?: number) {
  const params = locationId ? `?location_id=${locationId}` : "";
  return fetchApi(`/slots${params}`);
}

export async function createSlot(locationId: number, slotNumber: string, hourlyRate: number) {
  return fetchApi("/slots", {
    method: "POST",
    body: JSON.stringify({ locationId, slotNumber, hourlyRate }),
  });
}

export async function updateSlot(id: number, data: Record<string, any>) {
  return fetchApi(`/slots/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSlot(id: number) {
  return fetchApi(`/slots/${id}`, { method: "DELETE" });
}

export async function createBooking(userId: number, slotId: number, startTime: string, endTime: string) {
  return fetchApi("/bookings", {
    method: "POST",
    body: JSON.stringify({ userId, slotId, startTime, endTime }),
  });
}

export async function getBookings(userId?: number) {
  const params = userId ? `?user_id=${userId}` : "";
  return fetchApi(`/bookings${params}`);
}

export async function checkInBooking(bookingId: number) {
  return fetchApi("/bookings/checkin", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function checkOutBooking(bookingId: number) {
  return fetchApi("/bookings/checkout", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function initiatePayment(bookingId: number) {
  return fetchApi("/payments/initiate", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function verifyPayment(bookingId: number, transactionHash: string, contractBookingId?: number) {
  return fetchApi("/payments/verify", {
    method: "POST",
    body: JSON.stringify({ bookingId, transactionHash, contractBookingId }),
  });
}
