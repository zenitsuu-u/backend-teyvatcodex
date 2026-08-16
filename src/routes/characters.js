import express from "express";
import pool from "../db.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Characters
 *   description: Endpoints publics des personnages
 */

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Récupère la liste des personnages
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: Liste des personnages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   element:
 *                     type: string
 *                   weapon:
 *                     type: string
 *                   rarity:
 *                     type: integer
 *                   icon:
 *                     type: string
 */

/**
 * @swagger
 * /characters/{slug}:
 *   get:
 *     summary: Récupère les informations d'un personnage via son slug
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: "Slug du personnage (ex: kamisatoayaka)"
 *     responses:
 *       200:
 *         description: Informations du personnage
 *       404:
 *         description: Personnage non trouvé
 */

/**
 * @swagger
 * /characters/{slug}/details:
 *   get:
 *     summary: Récupère les détails complets d'un personnage
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails complets du personnage (talents, constellations, stats, matériaux)
 *       404:
 *         description: Personnage non trouvé
 */
/**
 * @swagger
 * /characters/{slug}/builds:
 *   get:
 *     summary: Récupère les builds associés à un personnage
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des builds du personnage
 *       404:
 *         description: Aucun build trouvé
 */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, slug, element, weapon, rarity, icon
      FROM character_details
      ORDER BY name ASC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération personnages" });
  }
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM character_details WHERE slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Personnage non trouvé" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/builds/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM builds WHERE character_slug = $1",
      [slug]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération builds" });
  }
});


router.get("/:slug/details", async (req, res) => {
  const { slug } = req.params;

  try {
    const character = await pool.query(
      "SELECT * FROM character_details WHERE slug = $1",
      [slug]
    );

    if (character.rows.length === 0) {
      return res.status(404).json({ error: "Personnage non trouvé" });
    }

    const talents = await pool.query(
      `SELECT talent_type AS type, name, description
       FROM talents
       WHERE character_slug = $1
       ORDER BY id`,
      [slug]
    );

    const constellations = await pool.query(
      `SELECT level, name, description
       FROM constellations
       WHERE character_slug = $1
       ORDER BY level`,
      [slug]
    );

    const ascension = await pool.query(
      "SELECT item, quantity FROM ascension_materials WHERE character_slug = $1",
      [slug]
    );

    const talent = await pool.query(
      "SELECT item, quantity FROM talent_materials WHERE character_slug = $1",
      [slug]
    );

    const stats = await pool.query(
      `SELECT level, hp, atk, def, ascension_stat, ascension_value
       FROM stats
       WHERE character_slug = $1
       ORDER BY level`,
      [slug]
    );

    res.json({
      ...character.rows[0],
      talents: talents.rows,
      constellations: constellations.rows,
      stats: stats.rows,
      materials: {
        ascension: ascension.rows,
        talent: talent.rows
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;