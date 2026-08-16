import fetch from "node-fetch";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "teyvat-db",
  database: "teyvat",
  password: "postgres",
  port: 5432,
});

async function seed() {
  const res = await fetch(
    "https://genshin-center.com/_next/data/RGFMLahh0T1b4znjvJakh/fr/characters.json"
  );
  const data = await res.json();

  const characters = Object.values(data.pageProps.characters);

  for (const c of characters) {
    const slug = c.img.toLowerCase();

    await pool.query(
      `INSERT INTO characters (name, slug, element, weapon, rarity, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO NOTHING`,
      [c.name, slug, c.element, c.weapon, c.stars, c.img]
    );
  }

  console.log("✅ Seed terminé");
  process.exit();
}

seed();