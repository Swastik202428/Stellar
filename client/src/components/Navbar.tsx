"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useTheme } from "@/hooks/useTheme";

export default function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { theme, toggle } = useTheme();

  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-3 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-park-yellow border-3 border-black rounded-xl flex items-center justify-center font-extrabold text-lg group-hover:rotate-12 transition-transform">
              P
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Park<span className="text-park-yellow-dark">Chain</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:block text-sm font-bold px-4 py-2 brutal-border hover:no-underline"
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="hidden sm:block text-sm font-bold px-4 py-2 brutal-border hover:no-underline"
            >
              Admin
            </Link>

            <button
              onClick={toggle}
              className="w-10 h-10 brutal-border flex items-center justify-center text-lg hover:no-underline"
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-park-yellow-light border-3 border-black rounded-xl text-sm font-bold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {shortAddress}
                </div>
                <button
                  onClick={disconnect}
                  className="px-3 py-2 text-sm font-bold brutal-border bg-white hover:bg-gray-100"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="brutal-btn brutal-btn-yellow text-sm flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Connecting
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
