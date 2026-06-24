"use client";

import { useState, useEffect, useCallback } from "react";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
  });

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const freighter = await import("@stellar/freighter-api");
      const { address } = await freighter.getAddress();
      if (address) {
        setState({ address, isConnected: true, isConnecting: false });
      }
    } catch {
      // Not connected
    }
  }

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true }));
    try {
      const freighter = await import("@stellar/freighter-api");
      const { address } = await freighter.getAddress();
      if (address) {
        setState({ address, isConnected: true, isConnecting: false });
        return address;
      }
      const { address: newAddr } = await freighter.requestAccess();
      if (newAddr) {
        setState({ address: newAddr, isConnected: true, isConnecting: false });
        return newAddr;
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
    setState((s) => ({ ...s, isConnecting: false }));
    return null;
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, isConnected: false, isConnecting: false });
  }, []);

  return { ...state, connect, disconnect };
}
