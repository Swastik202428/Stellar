import { Router, Request, Response } from "express";
import { query } from "../models/db.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT l.*, 
        (SELECT COUNT(*) FROM parking_slots WHERE location_id = l.id) as total_slots,
        (SELECT COUNT(*) FROM parking_slots WHERE location_id = l.id AND status = 'available') as available_slots
      FROM parking_locations l
      ORDER BY l.created_at DESC
    `);
    res.json({ locations: result.rows });
  } catch (err) {
    console.error("Locations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) {
      res.status(400).json({ error: "name and address required" });
      return;
    }
    const result = await query(
      "INSERT INTO parking_locations (name, address) VALUES ($1, $2) RETURNING *",
      [name, address]
    );
    res.status(201).json({ location: result.rows[0] });
  } catch (err) {
    console.error("Create location error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
