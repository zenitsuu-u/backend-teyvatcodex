import express from "express";
import pool from "../../db.js";
import multer from "multer";
import path from "path";

import { auth } from "../../middleware/auth.js";
import { isAdmin } from "../../middleware/isAdmin.js";
import { updateBuild } from "../../controllers/admin/builds.controller.js";

const router = express.Router();

const uploadPath = "src/uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Public Builds
 *   description: Accès public aux builds des personnages
 */

/**
 * @swagger
 * /builds/{slug}:
 *   get:
 *     summary: Récupère le build d'un personnage via son slug
 *     tags: [Public Builds]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: "Slug du personnage (ex: kamisatoayaka)"
 *     responses:
 *       200:
 *         description: "Build trouvé"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 character_slug:
 *                   type: string
 *                 weapon_slug:
 *                   type: string
 *                 artifacts:
 *                   type: array
 *                   items:
 *                     type: string
 *                 stats_priority:
 *                   type: array
 *                   items:
 *                     type: string
 *                 description:
 *                   type: string
 *                 sands:
 *                   type: string
 *                 goblet:
 *                   type: string
 *                 circlet:
 *                   type: string
 *                 substats:
 *                   type: array
 *                   items:
 *                     type: string
 *                 talents:
 *                   type: array
 *                   items:
 *                     type: string
 *                 synergies:
 *                   type: array
 *                   items:
 *                     type: string
 *                 image:
 *                   type: string
 *       404:
 *         description: "Aucun build trouvé pour ce slug"
 *       500:
 *         description: "Erreur serveur"
 */

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM builds WHERE character_slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Build introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getBuildBySlug:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", auth, isAdmin, upload.single("image"), updateBuild);

export default router;