import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const SECRET = process.env.JWT_SECRET || "SECRET_KEY";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification des utilisateurs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: monmotdepasse123
 *     responses:
 *       200:
 *         description: Utilisateur créé + token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Email déjà utilisé ou données manquantes
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: monmotdepasse123
 *     responses:
 *       200:
 *         description: Connexion réussie + token JWT
 *       400:
 *         description: Données manquantes
 *       401:
 *         description: Mot de passe invalide
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupère les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Utilisateur introuvable
 */

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email et mot de passe requis" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING id, email, role",
      [email, hashed]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email et mot de passe requis" });

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Mot de passe invalide" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur login" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;