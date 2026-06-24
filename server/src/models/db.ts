import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "parkchain",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      wallet_address VARCHAR(64) UNIQUE NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      vehicle_number VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS parking_locations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS parking_slots (
      id SERIAL PRIMARY KEY,
      location_id INTEGER REFERENCES parking_locations(id) ON DELETE CASCADE,
      slot_number VARCHAR(10) NOT NULL,
      status VARCHAR(20) DEFAULT 'available',
      hourly_rate NUMERIC(10, 2) DEFAULT 5.00,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      slot_id INTEGER REFERENCES parking_slots(id) ON DELETE CASCADE,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      amount NUMERIC(10, 2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending',
      transaction_hash VARCHAR(128),
      contract_booking_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
