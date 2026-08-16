    import express from "express";
    import multer from "multer";
    import path from "path";
    import { auth } from "../../middleware/auth.js";
    import { isAdmin } from "../../middleware/isAdmin.js";

    const router = express.Router();

    const uploadPath = "src/uploads";

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },

filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    const sanitized = Buffer.from(base, "latin1")
        .toString("utf8")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")   // supprime les accents
        .replace(/[^a-zA-Z0-9._-]/g, "_"); // remplace les caractères spéciaux

    cb(null, `${sanitized}-${Date.now()}${ext}`);
}
    });

    const fileFilter = (req, file, cb) => {
      const allowed = ["image/png", "image/jpeg", "image/webp"];

      if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Format non supporté"), false);
      }

      cb(null, true);
    };

    const upload = multer({ storage, fileFilter });
    /**
     * @swagger
     * tags:
     *   name: Admin Uploads
     *   description: Upload de fichiers (images) pour l'administration
     */

    /**
     * @swagger
     * /admin/uploads:
     *   post:
     *     summary: Upload une image (PNG, JPG, WEBP)
     *     tags: [Admin Uploads]
     *     consumes:
     *       - multipart/form-data
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Image à uploader
     *     responses:
     *       200:
     *         description: Upload réussi
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Upload réussi
     *                 filename:
     *                   type: string
     *                   example: raiden-1715790000000.png
     *                 url:
     *                   type: string
     *                   example: /uploads/raiden-1715790000000.png
     *       400:
     *         description: Aucun fichier reçu ou format non supporté
     *       401:
     *         description: Non authentifié
     *       403:
     *         description: Accès refusé (admin requis)
     */

    router.post("/", auth, isAdmin, upload.single("file"), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier reçu" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      res.json({
        message: "Upload réussi",
        filename: req.file.filename,
        url: fileUrl
      });
    });

    export default router;