"use client";

import Link from "next/link";
import { useState } from "react";

function ParkingIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto animate-float">
      {/* Car outline */}
      <svg viewBox="0 0 400 300" className="w-full" fill="none">
        {/* Parking lot lines */}
        <rect x="30" y="60" width="340" height="180" rx="12" stroke="#1A1A1A" strokeWidth="4" fill="#FFF3C4" />
        <line x1="200" y1="60" x2="200" y2="240" stroke="#1A1A1A" strokeWidth="3" strokeDasharray="8 8" />
        <line x1="115" y1="60" x2="115" y2="240" stroke="#1A1A1A" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="285" y1="60" x2="285" y2="240" stroke="#1A1A1A" strokeWidth="2" strokeDasharray="6 6" />
        {/* Car */}
        <g transform="translate(80, 100)">
          <rect x="10" y="20" width="100" height="50" rx="10" fill="#FFD93D" stroke="#1A1A1A" strokeWidth="4" />
          <rect x="0" y="35" width="10" height="20" rx="3" fill="#1A1A1A" />
          <rect x="110" y="35" width="10" height="20" rx="3" fill="#1A1A1A" />
          <rect x="25" y="10" width="30" height="15" rx="8" fill="#1A1A1A" />
          <rect x="65" y="10" width="30" height="15" rx="8" fill="#1A1A1A" />
          <circle cx="30" cy="75" r="12" fill="#333" stroke="#1A1A1A" strokeWidth="3" />
          <circle cx="90" cy="75" r="12" fill="#333" stroke="#1A1A1A" strokeWidth="3" />
          {/* Checkmark */}
          <circle cx="140" cy="30" r="18" fill="#22C55E" stroke="#1A1A1A" strokeWidth="3" />
          <path d="M133 30 L138 35 L147 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Another car */}
        <g transform="translate(220, 130)">
          <rect x="10" y="20" width="80" height="40" rx="8" fill="#E5E5E5" stroke="#1A1A1A" strokeWidth="3" />
          <rect x="2" y="30" width="8" height="18" rx="2" fill="#1A1A1A" />
          <rect x="90" y="30" width="8" height="18" rx="2" fill="#1A1A1A" />
          <rect x="22" y="10" width="25" height="13" rx="6" fill="#1A1A1A" />
          <rect x="55" y="10" width="25" height="13" rx="6" fill="#1A1A1A" />
          <circle cx="30" cy="65" r="10" fill="#333" stroke="#1A1A1A" strokeWidth="2" />
          <circle cx="72" cy="65" r="10" fill="#333" stroke="#1A1A1A" strokeWidth="2" />
        </g>
        {/* Stellar logo */}
        <text x="200" y="270" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A1A1A">
          ✦ Powered by Stellar ✦
        </text>
      </svg>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="brutal-card text-center p-6">
      <div className="text-3xl sm:text-4xl font-extrabold text-park-yellow-dark">{value}</div>
      <div className="text-sm font-bold mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="brutal-card p-6 hover:-translate-y-1 transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-extrabold mb-2">{title}</h3>
      <p className="text-sm font-medium text-gray-600">{desc}</p>
    </div>
  );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-12 h-12 bg-park-yellow border-3 border-black rounded-xl flex items-center justify-center text-xl font-extrabold shrink-0">
        {num}
      </div>
      <div>
        <h3 className="text-lg font-extrabold mb-1">{title}</h3>
        <p className="text-sm font-medium text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="brutal-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left font-bold text-sm sm:text-base"
      >
        {q}
        <span className={`text-xl transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm font-medium text-gray-600 border-t-3 border-black pt-3 animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-park-yellow-light border-3 border-black rounded-xl text-sm font-bold animate-fade-in">
              🚗 Built on Stellar Testnet
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight animate-slide-up stagger-1">
              Smart Parking{" "}
              <span className="text-park-yellow-dark block">On The Blockchain</span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-gray-600 animate-slide-up stagger-2">
              Find, reserve, and pay for parking slots using Stellar blockchain transactions.
              No more hunting for spots — ParkChain has you covered.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up stagger-3">
              <Link
                href="/dashboard"
                className="brutal-btn brutal-btn-yellow text-base flex items-center gap-2"
              >
                Get Started
                <span>→</span>
              </Link>
              <Link
                href="/admin"
                className="brutal-btn brutal-btn-white text-base"
              >
                Admin Panel
              </Link>
            </div>
          </div>
          <div className="animate-slide-up stagger-4">
            <ParkingIllustration />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y-3 border-black bg-park-yellow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="1K+" label="Parking Slots" />
            <StatCard value="500+" label="Happy Users" />
            <StatCard value="10K+" label="Transactions" />
            <StatCard value="5+" label="Locations" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4">
          Why ParkChain?
        </h2>
        <p className="text-center text-gray-600 font-medium mb-12 max-w-xl mx-auto">
          Built for modern cities with blockchain reliability
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="🔗"
            title="Blockchain Powered"
            desc="All bookings and payments are recorded on Stellar Testnet for transparency and security."
          />
          <FeatureCard
            icon="⚡"
            title="Instant Booking"
            desc="Find and reserve available parking slots in seconds with real-time availability."
          />
          <FeatureCard
            icon="💳"
            title="Crypto Payments"
            desc="Pay for parking using Stellar tokens directly from your Freighter wallet."
          />
          <FeatureCard
            icon="📱"
            title="Mobile First"
            desc="Fully responsive design that works seamlessly on your phone."
          />
          <FeatureCard
            icon="🛡️"
            title="Secure & Transparent"
            desc="Smart contract ensures fair pricing and secure transactions on-chain."
          />
          <FeatureCard
            icon="📊"
            title="Admin Analytics"
            desc="Real-time dashboard with revenue tracking, occupancy rates, and insights."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y-3 border-black bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 font-medium mb-12">
            Three simple steps to park with blockchain
          </p>
          <div className="max-w-2xl mx-auto space-y-8">
            <StepCard
              num="1"
              title="Connect Your Wallet"
              desc="Connect your Freighter wallet to authenticate and start booking."
            />
            <StepCard
              num="2"
              title="Find & Reserve"
              desc="Browse available parking slots near you and reserve one instantly."
            />
            <StepCard
              num="3"
              title="Park & Pay"
              desc="Check in when you arrive, check out when you leave, and pay via Stellar."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-gray-600 font-medium mb-12">
          Everything you need to know about ParkChain
        </p>
        <div className="max-w-2xl mx-auto space-y-4">
          <FAQItem
            q="What is ParkChain?"
            a="ParkChain is a decentralized smart parking management system built on Stellar Testnet. It allows users to find, reserve, and pay for parking slots using cryptocurrency."
          />
          <FAQItem
            q="Do I need a crypto wallet?"
            a="Yes, you need the Freighter wallet extension to interact with ParkChain. It's free and easy to install."
          />
          <FAQItem
            q="What blockchain does it use?"
            a="ParkChain runs on Stellar Testnet, a fast and low-cost blockchain network perfect for micropayments."
          />
          <FAQItem
            q="How do I pay for parking?"
            a="You pay using Stellar Testnet tokens through your Freighter wallet. The smart contract handles the transaction securely."
          />
          <FAQItem
            q="Can I cancel my booking?"
            a="Yes, you can cancel your booking before checking in. Any applicable fees will be handled by the system."
          />
        </div>
      </section>
    </div>
  );
}
