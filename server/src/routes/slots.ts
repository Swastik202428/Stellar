import { Router, Request, Response } from "express";
import { query } from "../models/db.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const locationId = req.query.location_id;
    let sql = `
      SELECT s.*, l.name as location_name
      FROM parking_slots s
      JOIN parking_locations l ON s.location_id = l.id
    `;
    const params: any[] = [];
    if (locationId) {
      sql += " WHERE s.location_id = $1";
      params.push(locationId);
    }
    sql += " ORDER BY s.slot_number";
    const result = await query(sql, params);
    res.json({ slots: result.rows });
  } catch (err) {
    console.error("Slots error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { locationId, slotNumber, hourlyRate } = req.body;
    if (!locationId || !slotNumber) {
      res.status(400).json({ error: "locationId and slotNumber required" });
      return;
    }
    const result = await query(
      "INSERT INTO parking_slots (location_id, slot_number, hourly_rate) VALUES ($1, $2, $3) RETURNING *",
      [locationId, slotNumber, hourlyRate || 5.0]
    );
    res.status(201).json({ slot: result.rows[0] });
  } catch (err) {
    console.error("Create slot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { slotNumber, status, hourlyRate } = req.body;
    const result = await query(
      "UPDATE parking_slots SET slot_number = COALESCE($1, slot_number), status = COALESCE($2, status), hourly_rate = COALESCE($3, hourly_rate) WHERE id = $4 RETURNING *",
      [slotNumber, status, hourlyRate, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Slot not found" });
      return;
    }
    res.json({ slot: result.rows[0] });
  } catch (err) {
    console.error("Update slot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM parking_slots WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Slot not found" });
      return;
    }
    res.json({ message: "Slot deleted" });
  } catch (err) {
    console.error("Delete slot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
