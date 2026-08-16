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