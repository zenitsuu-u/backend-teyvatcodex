import pool from "../../db.js";

export async function getAllWeapons(req, res) {
  try {
    const result = await pool.query("SELECT * FROM weapons ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getAllWeapons:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getWeapon(req, res) {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM weapons WHERE slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Arme introuvable" });
    }

    const materialsResult = await pool.query(
      "SELECT * FROM ascension_materials WHERE weapon_slug = $1",
      [slug]
    );

    res.json({
      ...result.rows[0],
      ascensionMaterials: materialsResult.rows
    });
  } catch (err) {
    console.error("Erreur getWeapon:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function createWeapon(req, res) {
  try {
    const {
      name,
      slug,
      type,
      rarity,
      atk,
      secondary,
      description,
      icon,
      image,
      effect,
      ascensionMaterials
    } = req.body;

    const exists = await pool.query(
      "SELECT slug FROM weapons WHERE slug = $1",
      [slug]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Ce slug existe déjà" });
    }

    const result = await pool.query(
      `INSERT INTO weapons 
      (name, slug, type, rarity, atk, secondary, description, icon, image, effect)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [name, slug, type, rarity, atk, secondary, description, icon, image, effect]
    );

    if (ascensionMaterials && Array.isArray(ascensionMaterials)) {
      for (const m of ascensionMaterials) {
        await pool.query(
          "INSERT INTO ascension_materials (weapon_slug, item, quantity) VALUES ($1,$2,$3)",
          [slug, m.item, m.quantity]
        );
      }
    }

    res.json({
      message: "Arme créée avec succès",
      weapon: result.rows[0]
    });
  } catch (err) {
    console.error("Erreur createWeapon:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function updateWeapon(req, res) {
  const { slug } = req.params;

  try {
    const {
      name,
      type,
      rarity,
      atk,
      secondary,
      description,
      icon,
      image,
      effect,
      ascensionMaterials
    } = req.body;

    const result = await pool.query(
      `UPDATE weapons
       SET name=$1, type=$2, rarity=$3, atk=$4, secondary=$5, description=$6, icon=$7, image=$8, effect=$9
       WHERE slug=$10
       RETURNING *`,
      [name, type, rarity, atk, secondary, description, icon, image, effect, slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Arme introuvable" });
    }

    if (ascensionMaterials && Array.isArray(ascensionMaterials)) {
      await pool.query(
        "DELETE FROM ascension_materials WHERE weapon_slug = $1",
        [slug]
      );

      for (const m of ascensionMaterials) {
        await pool.query(
          "INSERT INTO ascension_materials (weapon_slug, item, quantity) VALUES ($1,$2,$3)",
          [slug, m.item, m.quantity]
        );
      }
    }

    res.json({
      message: "Arme mise à jour",
      weapon: result.rows[0]
    });
  } catch (err) {
    console.error("Erreur updateWeapon:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function deleteWeapon(req, res) {
  const { slug } = req.params;

  try {
    await pool.query(
      "DELETE FROM ascension_materials WHERE weapon_slug = $1",
      [slug]
    );

    const result = await pool.query(
      "DELETE FROM weapons WHERE slug = $1 RETURNING *",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Arme introuvable" });
    }

    res.json({
      message: "Arme supprimée",
      deleted: result.rows[0]
    });
  } catch (err) {
    console.error("Erreur deleteWeapon:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}