import { Router, Request, Response } from "express";
import { query } from "../models/db.js";

const router = Router();

router.post("/initiate", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      res.status(400).json({ error: "bookingId required" });
      return;
    }
    const result = await query(
      `SELECT b.*, s.hourly_rate, s.slot_number
       FROM bookings b
       JOIN parking_slots s ON b.slot_id = s.id
       WHERE b.id = $1`,
      [bookingId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    const booking = result.rows[0];
    const start = new Date(booking.start_time).getTime();
    const end = new Date(booking.end_time).getTime();
    const hours = Math.max(1, Math.ceil((end - start) / 3600000));
    const amount = hours * parseFloat(booking.hourly_rate);

    res.json({
      amount,
      bookingId: booking.id,
      slotNumber: booking.slot_number,
      hours,
    });
  } catch (err) {
    console.error("Payment initiate error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { bookingId, transactionHash, contractBookingId } = req.body;
    if (!bookingId || !transactionHash) {
      res.status(400).json({ error: "bookingId and transactionHash required" });
      return;
    }
    const result = await query(
      `UPDATE bookings SET status = 'paid', transaction_hash = $1, contract_booking_id = $2
       WHERE id = $3 AND status = 'completed' RETURNING *`,
      [transactionHash, contractBookingId || null, bookingId]
    );
    if (result.rows.length === 0) {
      res.status(400).json({ error: "Booking not found or not ready for payment" });
      return;
    }
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
