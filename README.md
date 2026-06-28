# ParkChain 🅿️✨

> Smart Parking Management System powered by Stellar Blockchain

ParkChain is a decentralized smart parking management MVP built on Stellar Testnet. Users can find, reserve, check-in, check-out, and pay for parking slots using Stellar blockchain transactions via their Freighter wallet.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Recharts |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL |
| **Blockchain** | Stellar Testnet, Soroban Smart Contract (Rust) |
| **Wallet** | Freighter Browser Extension |

## Project Structure

```
parkchain/
├── contract/                    # Soroban Smart Contract
│   ├── Cargo.toml              # Rust workspace
│   └── contracts/contract/
│       ├── Cargo.toml          # Contract package
│       └── src/
│           ├── lib.rs          # Contract logic
│           └── test.rs         # Contract tests
├── server/                     # Express API Server
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── index.ts            # Server entry
│       ├── seed.ts             # Database seeder
│       ├── models/db.ts        # Database connection
│       └── routes/
│           ├── auth.ts
│           ├── locations.ts
│           ├── slots.ts
│           ├── bookings.ts
│           └── payments.ts
├── client/                     # Next.js Frontend
│   ├── package.json
│   ├── .env.local
│   └── src/
│       ├── app/
│       │   ├── layout.tsx      # Root layout with Navbar
│       │   ├── page.tsx        # Landing page
│       │   ├── dashboard/page.tsx  # User dashboard
│       │   └── admin/page.tsx  # Admin dashboard
│       ├── components/
│       │   ├── Navbar.tsx
│       │   └── Footer.tsx
│       └── hooks/
│           ├── useWallet.ts    # Freighter wallet integration
│           ├── useApi.ts       # API client
│           └── useTheme.tsx    # Dark mode toggle
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+ and Bun (`npm install -g bun`)
- Rust (for contract compilation)
- PostgreSQL running locally
- Freighter Wallet browser extension
- Stellar CLI tools (`stellar --version`)

### 1. Database Setup

```bash
# Create the database
createdb parkchain

# Or via psql
psql -U postgres -c "CREATE DATABASE parkchain;"
```

### 2. Backend Setup

```bash
cd server
cp .env .env.local  # Edit if your DB credentials differ
bun install
bun run seed        # Seed database with dummy data
bun run dev         # Start API server on :4000
```

### 3. Frontend Setup

```bash
cd client
bun install
bun run dev         # Start Next.js on :3000
```

### 4. Wallet Setup

1. Install [Freighter Wallet](https://freighter.app/) browser extension
2. Create a wallet or import existing
3. Fund your testnet account using the [Stellar Testnet Faucet](https://laboratory.stellar.org/#account-creator?network=testnet)

### 5. Open the App

Visit **http://localhost:3000** and connect your Freighter wallet!

## Smart Contract

The Soroban contract manages the on-chain booking lifecycle:

### Functions

| Function | Description |
|---|---|
| `init` | Initialize contract state |
| `create_booking` | Create a new booking record on-chain |
| `check_in` | Mark a booking as checked in |
| `check_out` | Calculate fee and mark as checked out |
| `calculate_fee` | Compute parking fee based on time |
| `make_payment` | Record payment with transaction hash |
| `get_booking` | Retrieve booking details |

### Contract Architecture

- **Booking lifecycle**: 0=created → 1=checked in → 2=checked out → 3=paid
- **Storage**: Persistent storage with per-booking TTL
- **Auth**: Every state-changing function requires `require_auth()`
- **Fees**: Rounded up to nearest hour, minimum 1 hour charge

### Deploy Contract

```bash
cd contract
stellar contract build
stellar keys generate dev --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/parkchain.wasm \
  --source-account dev --network testnet
```

Then set the contract address in `client/.env.local`:
```
NEXT_PUBLIC_CONTRACT_ID=C...
```

### Run Contract Tests

```bash
cd contract && cargo test
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/wallet` | Register/login with wallet address |
| GET | `/locations` | List parking locations |
| POST | `/locations` | Create location (admin) |
| GET | `/slots` | List parking slots |
| POST | `/slots` | Create slot (admin) |
| PUT | `/slots/:id` | Update slot (admin) |
| DELETE | `/slots/:id` | Delete slot (admin) |
| POST | `/bookings` | Create booking |
| GET | `/bookings` | List bookings |
| POST | `/bookings/checkin` | Check in to booking |
| POST | `/bookings/checkout` | Check out from booking |
| POST | `/payments/initiate` | Initiate payment |
| POST | `/payments/verify` | Verify payment |

## Features

### User Features
- Connect Freighter Wallet
- Browse available parking slots
- Reserve slots with duration picker
- Check-in / Check-out
- Pay using Stellar Testnet
- View booking history

### Admin Features
- Dashboard with revenue analytics
- Pie and bar charts for slot status
- Manage parking locations
- CRUD operations on parking slots
- View all bookings and payments

### Design
- Light Brutalism UI with thick black borders
- Yellow (#FFD93D) primary color
- Animated parking lot illustration
- Dark mode toggle
- Mobile-first responsive
- Loading states & toast notifications

## Environment Variables

### Server (`server/.env`)
```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parkchain
DB_USER=postgres
DB_PASSWORD=postgres
```

### Client (`client/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CONTRACT_ID=
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

## Deployment Guide

### Contract (Stellar Testnet)
```bash
cd contract
stellar contract build
stellar keys generate dev --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/parkchain.wasm \
  --source-account dev --network testnet
```

### Backend (Any Node.js host)
```bash
cd server
# Set production environment variables
DATABASE_URL=postgres://user:pass@host:5432/parkchain
bun install
bun run build
bun run start
```

### Frontend (Vercel recommended)
```bash
cd client
# Set Vercel env vars from .env.local
bun install
bun run build  # Test production build locally
vercel --prod   # Deploy to Vercel
```

## License

MIT


---
### Stellar Smart Contract Address
`CD23VEYGDMG4PSLMY5ZT46K6UZ6RL4BV7AU5ATHSKLFB5AKR4LZTK2LQ`
