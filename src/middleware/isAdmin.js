export function isAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé : admin requis" });
    }

    next();
  } catch (err) {
    console.error("Erreur isAdmin:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}