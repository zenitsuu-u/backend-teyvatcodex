import express from "express";
import { auth } from "../../middleware/auth.js";
import { isAdmin } from "../../middleware/isAdmin.js";

import {
  createWeapon,
  updateWeapon,
  deleteWeapon,
  getWeapon,
  getAllWeapons
} from "../../controllers/admin/weapons.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Weapons
 *   description: Gestion des armes (admin)
 */

/**
 * @swagger
 * /admin/weapons:
 *   get:
 *     summary: Récupère toutes les armes
 *     tags: [Admin Weapons]
 *     responses:
 *       200:
 *         description: Liste des armes
 *   post:
 *     summary: Crée une nouvelle arme
 *     tags: [Admin Weapons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               type:
 *                 type: string
 *               rarity:
 *                 type: integer
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Arme créée
 */

/**
 * @swagger
 * /admin/weapons/{slug}:
 *   get:
 *     summary: Récupère une arme via son slug
 *     tags: [Admin Weapons]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arme trouvée
 *       404:
 *         description: Arme introuvable
 *
 *   put:
 *     summary: Met à jour une arme
 *     tags: [Admin Weapons]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Arme mise à jour
 *       404:
 *         description: Arme introuvable
 *
 *   delete:
 *     summary: Supprime une arme
 *     tags: [Admin Weapons]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arme supprimée
 *       404:
 *         description: Arme introuvable
 */

router.get("/", auth, isAdmin, getAllWeapons);

router.get("/:slug", auth, isAdmin, getWeapon);

router.post("/", auth, isAdmin, createWeapon);

router.put("/:slug", auth, isAdmin, updateWeapon);

router.delete("/:slug", auth, isAdmin, deleteWeapon);

export default router;