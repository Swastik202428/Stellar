import { Router, Request, Response } from "express";
import { query } from "../models/db.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, slotId, startTime, endTime } = req.body;
    if (!userId || !slotId || !startTime || !endTime) {
      res.status(400).json({ error: "userId, slotId, startTime, endTime required" });
      return;
    }

    // Check slot availability
    const slotResult = await query("SELECT * FROM parking_slots WHERE id = $1", [slotId]);
    if (slotResult.rows.length === 0) {
      res.status(404).json({ error: "Slot not found" });
      return;
    }
    if (slotResult.rows[0].status !== "available") {
      res.status(400).json({ error: "Slot not available" });
      return;
    }

    // Create booking
    const result = await query(
      `INSERT INTO bookings (user_id, slot_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [userId, slotId, startTime, endTime]
    );

    // Mark slot as reserved
    await query("UPDATE parking_slots SET status = 'reserved' WHERE id = $1", [slotId]);

    res.status(201).json({ booking: result.rows[0] });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id;
    let sql = `
      SELECT b.*, s.slot_number, l.name as location_name, v.vehicle_number
      FROM bookings b
      JOIN parking_slots s ON b.slot_id = s.id
      JOIN parking_locations l ON s.location_id = l.id
      LEFT JOIN vehicles v ON v.user_id = b.user_id
    `;
    const params: any[] = [];
    if (userId) {
      sql += " WHERE b.user_id = $1";
      params.push(userId);
    }
    sql += " ORDER BY b.created_at DESC";
    const result = await query(sql, params);
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/checkin", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      res.status(400).json({ error: "bookingId required" });
      return;
    }
    const result = await query(
      "UPDATE bookings SET status = 'active' WHERE id = $1 AND status = 'pending' RETURNING *",
      [bookingId]
    );
    if (result.rows.length === 0) {
      res.status(400).json({ error: "Booking not found or already checked in" });
      return;
    }
    // Mark slot as occupied
    const booking = result.rows[0];
    await query("UPDATE parking_slots SET status = 'occupied' WHERE id = $1", [booking.slot_id]);
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error("Checkin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      res.status(400).json({ error: "bookingId required" });
      return;
    }
    const result = await query(
      "UPDATE bookings SET status = 'completed' WHERE id = $1 AND status = 'active' RETURNING *",
      [bookingId]
    );
    if (result.rows.length === 0) {
      res.status(400).json({ error: "Booking not found or not checked in" });
      return;
    }
    // Mark slot as available
    const booking = result.rows[0];
    await query("UPDATE parking_slots SET status = 'available' WHERE id = $1", [booking.slot_id]);
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
