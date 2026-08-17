import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "../../middleware/auth.js";
import { isAdmin } from "../../middleware/isAdmin.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Format non supporté"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.post("/", auth, isAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "teyvatcodex" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      message: "Upload réussi",
      filename: result.public_id,
      url: result.secure_url, // URL Cloudinary directe
    });
  } catch (err) {
    console.error("Erreur Cloudinary :", err);
    res.status(500).json({ error: "Erreur lors de l'upload" });
  }
});

export default router;