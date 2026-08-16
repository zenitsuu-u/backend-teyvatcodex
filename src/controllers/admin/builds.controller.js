import pool from "../../db.js";

export async function getAllBuilds(req, res) {
  try {
    const result = await pool.query("SELECT * FROM builds ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getAllBuilds:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getBuild(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM builds WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Build introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getBuild:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function createBuild(req, res) {
  try {
    const {
      character_slug,
      weapon_slug,
      artifacts,
      stats_priority,
      description,
      sands,
      goblet,
      circlet,
      substats,
      talents,
      synergies,
      image
    } = req.body;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : image || null;

        const artifactsParsed  = JSON.stringify(Array.isArray(artifacts)  ? artifacts  : typeof artifacts  === "string" ? JSON.parse(artifacts)  : []);
        const statsParsed      = JSON.stringify(Array.isArray(stats_priority) ? stats_priority : typeof stats_priority === "string" ? JSON.parse(stats_priority) : []);
        const substatsParsed   = JSON.stringify(Array.isArray(substats)   ? substats   : typeof substats   === "string" ? JSON.parse(substats)   : []);
        const talentsParsed    = JSON.stringify(Array.isArray(talents)    ? talents    : typeof talents    === "string" ? JSON.parse(talents)    : []);
        const synergiesParsed  = JSON.stringify(Array.isArray(synergies)  ? synergies  : typeof synergies  === "string" ? JSON.parse(synergies)  : []);

        await pool.query(
      `INSERT INTO builds
      (character_slug, weapon_slug, artifacts, stats_priority, description,
       sands, goblet, circlet, substats, talents, synergies, image)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        character_slug,
        weapon_slug,
        artifactsParsed,
        statsParsed,
        description,
        sands,
        goblet,
        circlet,
        substatsParsed,
        talentsParsed,
        synergiesParsed,
        imageUrl
      ]
    );

    res.json({ message: "Build créé avec succès" });
  } catch (err) {
    console.error("Erreur createBuild:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function updateBuild(req, res) {
  const { id } = req.params;

  try {
      console.log("=== UPDATE BUILD DEBUG ===");
      console.log("BODY REÇU :", req.body);
      console.log("ARTIFACTS EXACT :", JSON.stringify(req.body.artifacts));
      console.log("FILE REÇU :", req.file);
    const {
      character_slug,
      weapon_slug,
      artifacts,
      stats_priority,
      description,
      sands,
      goblet,
      circlet,
      substats,
      talents,
      synergies,
      image
    } = req.body;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : image || null;

const artifactsParsed  = JSON.stringify(Array.isArray(artifacts)       ? artifacts       : typeof artifacts       === "string" ? JSON.parse(artifacts)       : []);
const statsParsed      = JSON.stringify(Array.isArray(stats_priority)  ? stats_priority  : typeof stats_priority  === "string" ? JSON.parse(stats_priority)  : []);
const substatsParsed   = JSON.stringify(Array.isArray(substats)        ? substats        : typeof substats        === "string" ? JSON.parse(substats)        : []);
const talentsParsed    = JSON.stringify(Array.isArray(talents)         ? talents         : typeof talents         === "string" ? JSON.parse(talents)         : []);
const synergiesParsed  = JSON.stringify(Array.isArray(synergies)       ? synergies       : typeof synergies       === "string" ? JSON.parse(synergies)       : []);

console.log("ARTIFACTS PARSED :", artifactsParsed);
    console.log("WEAPON_SLUG :", weapon_slug);
    console.log("IMAGE URL :", imageUrl);

    await pool.query(
      `UPDATE builds
       SET character_slug=$1,
           weapon_slug=$2,
           artifacts=$3,
           stats_priority=$4,
           description=$5,
           sands=$6,
           goblet=$7,
           circlet=$8,
           substats=$9,
           talents=$10,
           synergies=$11,
           image=$12
       WHERE id=$13`,
      [
        character_slug,
        weapon_slug,
        artifactsParsed,
        statsParsed,
        description,
        sands,
        goblet,
        circlet,
        substatsParsed,
        talentsParsed,
        synergiesParsed,
        imageUrl,
        id
      ]
    );

    res.json({ message: "Build mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur updateBuild:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function deleteBuild(req, res) {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM builds WHERE id = $1", [id]);
    res.json({ message: "Build supprimé" });
  } catch (err) {
    console.error("Erreur deleteBuild:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}