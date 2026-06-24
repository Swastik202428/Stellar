import express from "express";
import cors from "cors";
import { initDb } from "./models/db.js";
import authRoutes from "./routes/auth.js";
import locationRoutes from "./routes/locations.js";
import slotRoutes from "./routes/slots.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/locations", locationRoutes);
app.use("/slots", slotRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await initDb();
    console.log("Database initialized");
    app.listen(PORT, () => {
      console.log(`ParkChain server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
