import pool from "../../db.js";

export async function getAdminStats(req, res) {
  try {
    const characters = await pool.query("SELECT COUNT(*) FROM characters");
    const weapons = await pool.query("SELECT COUNT(*) FROM weapons");
    const builds = await pool.query("SELECT COUNT(*) FROM builds");

    res.json({
      characters: Number(characters.rows[0].count),
      weapons: Number(weapons.rows[0].count),
      builds: Number(builds.rows[0].count),
    });
  } catch (err) {
    console.error("Erreur getAdminStats:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}