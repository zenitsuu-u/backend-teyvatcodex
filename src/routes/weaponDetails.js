import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM weapons WHERE slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Arme introuvable" });
    }

    const weapon = result.rows[0];

    const materialsResult = await pool.query(
      `SELECT * FROM ascension_materials WHERE weapon_slug = $1`,
      [slug]
    );

    weapon.ascensionMaterials = materialsResult.rows;

    res.json(weapon);

  } catch (error) {
    console.error("Erreur récupération arme :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;