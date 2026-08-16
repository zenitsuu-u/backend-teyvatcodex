import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, slug, type, rarity, icon FROM weapons ORDER BY rarity DESC, name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /weapons :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM weapons WHERE slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Arme introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur GET /weapons/:slug :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;