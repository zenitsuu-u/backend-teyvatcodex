import  express from "express";
import { auth } from "../../middleware/auth.js";
import { isAdmin } from "../../middleware/isAdmin.js";
import { getAdminStats } from "../../controllers/admin/stats.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Stats
 *   description: Statistiques globales du panneau admin
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Récupère les statistiques globales (nombre de personnages, armes, builds)
 *     tags: [Admin Stats]
 *     responses:
 *       200:
 *         description: Statistiques globales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 characters:
 *                   type: integer
 *                   example: 42
 *                 weapons:
 *                   type: integer
 *                   example: 58
 *                 builds:
 *                   type: integer
 *                   example: 12
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin requis)
 */

router.get("/", auth, isAdmin, getAdminStats);

export default router;