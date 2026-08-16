import express from "express";
import { auth } from "../../middleware/auth.js";
import { isAdmin } from "../../middleware/isAdmin.js";

import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacter,
  getAllCharacters
} from "../../controllers/admin/characters.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Characters
 *   description: Gestion des personnages (admin)
 */

/**
 * @swagger
 * /admin/characters:
 *   get:
 *     summary: Récupère tous les personnages
 *     tags: [Admin Characters]
 *     responses:
 *       200:
 *         description: Liste des personnages
 *   post:
 *     summary: Crée un nouveau personnage
 *     tags: [Admin Characters]
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
 *               element:
 *                 type: string
 *               weapon:
 *                 type: string
 *               rarity:
 *                 type: integer
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Personnage créé
 */

/**
 * @swagger
 * /admin/characters/{slug}:
 *   get:
 *     summary: Récupère un personnage via son slug
 *     tags: [Admin Characters]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personnage trouvé
 *       404:
 *         description: Personnage introuvable
 *
 *   put:
 *     summary: Met à jour un personnage
 *     tags: [Admin Characters]
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
 *         description: Personnage mis à jour
 *       404:
 *         description: Personnage introuvable
 *
 *   delete:
 *     summary: Supprime un personnage
 *     tags: [Admin Characters]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personnage supprimé
 *       404:
 *         description: Personnage introuvable
 */

router.get("/", auth, isAdmin, getAllCharacters);

router.get("/:slug", auth, isAdmin, getCharacter);

router.post("/", auth, isAdmin, createCharacter);

router.put("/:slug", auth, isAdmin, updateCharacter);

router.delete("/:slug", auth, isAdmin, deleteCharacter);

export default router;