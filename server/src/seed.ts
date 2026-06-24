import { initDb, query } from "./models/db.js";

async function seed() {
  console.log("Initializing database...");
  await initDb();

  console.log("Clearing existing data...");
  await query("DELETE FROM bookings");
  await query("DELETE FROM parking_slots");
  await query("DELETE FROM parking_locations");
  await query("DELETE FROM vehicles");
  await query("DELETE FROM users");

  console.log("Seeding users...");
  await query(
    `INSERT INTO users (wallet_address, role) VALUES
     ('GAXD3XK7QRJ7YOY3Y7Q7XV7XK7QRJ7YOY3Y7Q7XV7XK7QRJ7YOY3Y7QA', 'user'),
     ('GBXD4L8RSK8ZPZ4Z8Q8XW8XK8RSK8ZPZ4Z8Q8XW8XK8RSK8ZPZ4Z8QB', 'admin')`
  );

  console.log("Seeding parking locations...");
  await query(
    `INSERT INTO parking_locations (name, address) VALUES
     ('Downtown Garage', '123 Main St, Downtown'),
     ('City Center Parking', '456 Oak Ave, City Center'),
     ('Airport Long Stay', '789 Airport Blvd, Terminal 3')`
  );

  console.log("Seeding parking slots...");
  for (let locationId = 1; locationId <= 3; locationId++) {
    for (let i = 1; i <= 10; i++) {
      const slotNumber = `A${String(i).padStart(2, "0")}`;
      const rate = (5 + Math.floor(Math.random() * 5)).toFixed(2);
      const statuses = ["available", "available", "available", "reserved", "occupied"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await query(
        "INSERT INTO parking_slots (location_id, slot_number, status, hourly_rate) VALUES ($1, $2, $3, $4)",
        [locationId, slotNumber, status, rate]
      );
    }
  }

  console.log("Seeding vehicles...");
  await query(
    `INSERT INTO vehicles (user_id, vehicle_number) VALUES
     (1, 'ABC-1234'),
     (1, 'XYZ-5678')`
  );

  console.log("Seeding sample bookings...");
  await query(
    `INSERT INTO bookings (user_id, slot_id, start_time, end_time, amount, status, transaction_hash)
     VALUES
     (1, 1, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 10.00, 'paid', 'tx_stellar_sample_001'),
     (1, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 5.00, 'paid', 'tx_stellar_sample_002'),
     (1, 10, NOW(), NOW() + INTERVAL '2 hours', 15.00, 'active', NULL)`
  );

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
