import { Router, Request, Response } from "express";
import { query } from "../models/db.js";

const router = Router();

router.post("/wallet", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      res.status(400).json({ error: "walletAddress required" });
      return;
    }

    let result = await query("SELECT * FROM users WHERE wallet_address = $1", [walletAddress]);
    let user = result.rows[0];

    if (!user) {
      result = await query(
        "INSERT INTO users (wallet_address) VALUES ($1) RETURNING *",
        [walletAddress]
      );
      user = result.rows[0];
    }

    res.json({ user });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
