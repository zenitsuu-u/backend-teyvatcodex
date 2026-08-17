import pool from "../../db.js";

export async function getAllCharacters(req, res) {
  try {
    const result = await pool.query(`SELECT * FROM character_details ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getAllCharacters:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getCharacter(req, res) {
  const { slug } = req.params;
  try {
    const charResult = await pool.query(`SELECT * FROM character_details WHERE slug = $1`, [slug]);
    if (charResult.rows.length === 0) return res.status(404).json({ error: "Personnage introuvable" });

    const [statsResult, talentsResult, constellationsResult, ascensionResult, talentMaterialsResult] =
      await Promise.all([
        pool.query(`SELECT * FROM stats WHERE character_slug = $1 ORDER BY level ASC`, [slug]),
        pool.query(`SELECT * FROM talents WHERE character_slug = $1`, [slug]),
        pool.query(`SELECT * FROM constellations WHERE character_slug = $1 ORDER BY level ASC`, [slug]),
        pool.query(`SELECT * FROM ascension_materials WHERE character_slug = $1`, [slug]),
        pool.query(`SELECT * FROM talent_materials WHERE character_slug = $1`, [slug]),
      ]);

    res.json({
      ...charResult.rows[0],
      stats: statsResult.rows,
      talents: talentsResult.rows,
      constellations: constellationsResult.rows,
      materials: {
        ascension: ascensionResult.rows,
        talent: talentMaterialsResult.rows,
      },
    });
  } catch (err) {
    console.error("Erreur getCharacter:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function createCharacter(req, res) {
  try {
    const { name, slug, element, weapon, rarity, region, description, icon, image,
            stats, talents, constellations, ascensionMaterials, talentMaterials } = req.body;

    await pool.query(
      `INSERT INTO character_details (name, slug, element, weapon, rarity, region, description, icon, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [name, slug, element, weapon, rarity, region, description, icon, image]
    );

    if (Array.isArray(stats)) {
      for (const s of stats) {
        await pool.query(
          `INSERT INTO stats (character_slug, level, hp, atk, def, ascension_stat, ascension_value)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [slug, s.level || 0, s.hp || 0, s.atk || 0, s.def || 0, s.ascensionStat?.name || null, s.ascensionStat?.value || null]
        );
      }
    }

    const talentTypes = ["normal", "skill", "burst", "passive1", "passive2"];
    if (Array.isArray(talents)) {
      for (let i = 0; i < talents.length; i++) {
        await pool.query(
          `INSERT INTO talents (character_slug, talent_type, name, description) VALUES ($1,$2,$3,$4)`,
          [slug, talentTypes[i], talents[i].name, talents[i].description]
        );
      }
    }

    if (Array.isArray(constellations)) {
      for (let i = 0; i < constellations.length; i++) {
        await pool.query(
          `INSERT INTO constellations (character_slug, level, name, description) VALUES ($1,$2,$3,$4)`,
          [slug, i + 1, constellations[i].name, constellations[i].description]
        );
      }
    }

    if (Array.isArray(ascensionMaterials)) {
      for (const m of ascensionMaterials) {
        await pool.query(`INSERT INTO ascension_materials (character_slug, item, quantity) VALUES ($1,$2,$3)`, [slug, m.item, m.quantity]);
      }
    }

    if (Array.isArray(talentMaterials)) {
      for (const m of talentMaterials) {
        await pool.query(`INSERT INTO talent_materials (character_slug, item, quantity) VALUES ($1,$2,$3)`, [slug, m.item, m.quantity]);
      }
    }

    res.json({ message: "Personnage créé avec succès" });
  } catch (err) {
    console.error("Erreur createCharacter:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function updateCharacter(req, res) {
  const { slug } = req.params;
  try {
    const { name, element, weapon, rarity, region, description, icon, image,
            stats, talents, constellations, ascensionMaterials, talentMaterials } = req.body;

    // Mise à jour des infos de base
    await pool.query(
      `UPDATE character_details SET name=$1, element=$2, weapon=$3, rarity=$4, region=$5,
       description=$6, icon=$7, image=$8 WHERE slug=$9`,
      [name, element, weapon, rarity, region, description, icon, image, slug]
    );

    // Stats : supprime et réinsère
    if (Array.isArray(stats)) {
      await pool.query(`DELETE FROM stats WHERE character_slug = $1`, [slug]);
      for (const s of stats) {
        await pool.query(
          `INSERT INTO stats (character_slug, level, hp, atk, def, ascension_stat, ascension_value)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [slug, s.level || 0, s.hp || 0, s.atk || 0, s.def || 0, s.ascension_stat || null, s.ascension_value || null]
        );
      }
    }

    // Talents : supprime et réinsère
    if (Array.isArray(talents)) {
      await pool.query(`DELETE FROM talents WHERE character_slug = $1`, [slug]);
      const talentTypes = ["normal", "skill", "burst", "passive1", "passive2"];
      for (let i = 0; i < talents.length; i++) {
        const t = talents[i];
        await pool.query(
          `INSERT INTO talents (character_slug, talent_type, name, description) VALUES ($1,$2,$3,$4)`,
          [slug, t.talent_type || talentTypes[i], t.name, t.description]
        );
      }
    }

    // Constellations : supprime et réinsère
    if (Array.isArray(constellations)) {
      await pool.query(`DELETE FROM constellations WHERE character_slug = $1`, [slug]);
      for (let i = 0; i < constellations.length; i++) {
        const c = constellations[i];
        await pool.query(
          `INSERT INTO constellations (character_slug, level, name, description) VALUES ($1,$2,$3,$4)`,
          [slug, c.level || i + 1, c.name, c.description]
        );
      }
    }

    // Matériaux ascension : supprime et réinsère
    if (Array.isArray(ascensionMaterials)) {
      await pool.query(`DELETE FROM ascension_materials WHERE character_slug = $1`, [slug]);
      for (const m of ascensionMaterials) {
        await pool.query(`INSERT INTO ascension_materials (character_slug, item, quantity) VALUES ($1,$2,$3)`, [slug, m.item, m.quantity]);
      }
    }

    // Matériaux talents : supprime et réinsère
    if (Array.isArray(talentMaterials)) {
      await pool.query(`DELETE FROM talent_materials WHERE character_slug = $1`, [slug]);
      for (const m of talentMaterials) {
        await pool.query(`INSERT INTO talent_materials (character_slug, item, quantity) VALUES ($1,$2,$3)`, [slug, m.item, m.quantity]);
      }
    }

    res.json({ message: "Personnage mis à jour" });
  } catch (err) {
    console.error("Erreur updateCharacter:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCharacter(req, res) {
  const { slug } = req.params;
  try {
    await Promise.all([
      pool.query(`DELETE FROM stats WHERE character_slug = $1`, [slug]),
      pool.query(`DELETE FROM talents WHERE character_slug = $1`, [slug]),
      pool.query(`DELETE FROM constellations WHERE character_slug = $1`, [slug]),
      pool.query(`DELETE FROM ascension_materials WHERE character_slug = $1`, [slug]),
      pool.query(`DELETE FROM talent_materials WHERE character_slug = $1`, [slug]),
    ]);
    await pool.query(`DELETE FROM character_details WHERE slug = $1`, [slug]);
    res.json({ message: "Personnage supprimé" });
  } catch (err) {
    console.error("Erreur deleteCharacter:", err);
    res.status(500).json({ error: err.message });
  }
}