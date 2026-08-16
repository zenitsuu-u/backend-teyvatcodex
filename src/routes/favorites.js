import express from "express";
import pool from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Gestion des favoris utilisateur
 */

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Ajoute un favori pour l'utilisateur connecté
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - target_id
 *             properties:
 *               type:
 *                 type: string
 *                 example: character
 *                 description: "Type du favori (ex: 'character' ou 'build')"
 *               target_id:
 *                 type: string
 *                 example: ayaka
 *     responses:
 *       200:
 *         description: Favori ajouté
 *       400:
 *         description: Champs manquants
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Récupère les favoris de l'utilisateur connecté
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des favoris
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: character
 *                   target_id:
 *                     type: string
 *                     example: ayaka
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /favorites/{target_id}:
 *   delete:
 *     summary: Supprime un favori de l'utilisateur connecté
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: target_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du favori à supprimer
 *     responses:
 *       200:
 *         description: Favori supprimé
 *       401:
 *         description: Non authentifié
 */

router.post("/", auth, async (req, res) => {
  const { type, target_id } = req.body;

  if (!type || !target_id) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  await pool.query(
    "INSERT INTO favorites (user_id, type, target_id) VALUES ($1, $2, $3)",
    [req.user.id, type, target_id]
  );

  res.json({ message: "Favori ajouté" });
});

router.get("/", auth, async (req, res) => {
  const result = await pool.query(
    "SELECT type, target_id FROM favorites WHERE user_id = $1",
    [req.user.id]
  );

  res.json(result.rows);
});

router.delete("/:target_id", auth, async (req, res) => {
  await pool.query(
    "DELETE FROM favorites WHERE user_id = $1 AND target_id = $2",
    [req.user.id, req.params.target_id]
  );

  res.json({ message: "Favori supprimé" });
});

export default router;