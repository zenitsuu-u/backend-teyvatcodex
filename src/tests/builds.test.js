import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

const mockQuery = jest.fn();

jest.unstable_mockModule("../db.js", () => ({
  default: { query: mockQuery },
}));

const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

// ── Helpers ───────────────────────────────────────────────────────────────
const makeToken = (role = "admin") =>
  jwt.sign({ id: 1, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

const authHeader = (role = "admin") => ({
  Authorization: `Bearer ${makeToken(role)}`,
});

const fakeBuild = {
  id: 1,
  character_slug: "ayaka",
  weapon_slug: "mistsplitter",
  artifacts: ["Blizzard Strayer"],
  stats_priority: ["Cryo DMG", "Crit Rate"],
  description: null,
  sands: "ATK%",
  goblet: "Cryo DMG",
  circlet: "Crit Rate",
  substats: ["Crit DMG", "ATK%"],
  talents: ["Burst", "Skill"],
  synergies: ["Shenhe"],
  image: "/uploads/ayaka.webp",
};

beforeEach(() => {
  mockQuery.mockReset();
});

// ── GET /admin/builds ────────────────────────────────────────────────────
describe("GET /admin/builds", () => {
  it("retourne 401 sans token", async () => {
    const res = await request(app).get("/admin/builds");
    expect(res.status).toBe(401);
  });

  it("retourne 403 si rôle non admin", async () => {
    const res = await request(app)
      .get("/admin/builds")
      .set(authHeader("user"));
    expect(res.status).toBe(403);
  });

  it("retourne la liste des builds", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [fakeBuild] });

    const res = await request(app)
      .get("/admin/builds")
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeBuild]);
  });

  it("retourne 500 si erreur DB", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .get("/admin/builds")
      .set(authHeader());

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});

// ── GET /admin/builds/:id ────────────────────────────────────────────────
describe("GET /admin/builds/:id", () => {
  it("retourne le build si trouvé", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [fakeBuild] });

    const res = await request(app)
      .get("/admin/builds/1")
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.character_slug).toBe("ayaka");
  });

  it("retourne 404 si build inexistant", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/admin/builds/999")
      .set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Build introuvable");
  });

  it("retourne 500 si erreur DB", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .get("/admin/builds/1")
      .set(authHeader());

    expect(res.status).toBe(500);
  });
});

// ── POST /admin/builds ───────────────────────────────────────────────────
describe("POST /admin/builds", () => {
  it("crée un build avec tableaux natifs", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/admin/builds")
      .set(authHeader())
      .send({
        character_slug: "ayaka",
        weapon_slug: "mistsplitter",
        artifacts: ["Blizzard Strayer"],
        stats_priority: ["Cryo DMG"],
        sands: "ATK%",
        goblet: "Cryo DMG",
        circlet: "Crit Rate",
        substats: ["Crit DMG"],
        talents: ["Burst"],
        synergies: ["Shenhe"],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Build créé avec succès");
  });

  it("accepte les champs tableaux sous forme de string JSON", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/admin/builds")
      .set(authHeader())
      .send({
        character_slug: "hutao",
        weapon_slug: "staff-of-homa",
        artifacts: JSON.stringify(["Crimson Witch"]),
        stats_priority: JSON.stringify(["Pyro DMG"]),
        substats: JSON.stringify(["Crit Rate"]),
        talents: JSON.stringify(["Burst"]),
        synergies: JSON.stringify(["Yelan"]),
      });

    expect(res.status).toBe(200);
  });

  it("retourne 401 sans token", async () => {
    const res = await request(app).post("/admin/builds").send({});
    expect(res.status).toBe(401);
  });

  it("retourne 500 si erreur DB", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .post("/admin/builds")
      .set(authHeader())
      .send({ character_slug: "ayaka" });

    expect(res.status).toBe(500);
  });
});

// ── PUT /admin/builds/:id ────────────────────────────────────────────────
describe("PUT /admin/builds/:id", () => {
  it("met à jour un build", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put("/admin/builds/1")
      .set(authHeader())
      .send({
        character_slug: "ayaka",
        weapon_slug: "mistsplitter",
        artifacts: ["Blizzard Strayer"],
        stats_priority: ["Cryo DMG"],
        sands: "ATK%",
        goblet: "Cryo DMG",
        circlet: "Crit Rate",
        substats: ["Crit DMG"],
        talents: ["Burst"],
        synergies: ["Shenhe"],
        image: "/uploads/ayaka.webp",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Build mis à jour avec succès");
  });

  it("utilise l'image existante si pas de fichier uploadé", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put("/admin/builds/1")
      .set(authHeader())
      .send({ image: "/uploads/existing.webp" });

    expect(res.status).toBe(200);
  });

  it("retourne 401 sans token", async () => {
    const res = await request(app).put("/admin/builds/1").send({});
    expect(res.status).toBe(401);
  });

  it("retourne 500 si erreur DB", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .put("/admin/builds/1")
      .set(authHeader())
      .send({ character_slug: "ayaka" });

    expect(res.status).toBe(500);
  });
});

// ── DELETE /admin/builds/:id ─────────────────────────────────────────────
describe("DELETE /admin/builds/:id", () => {
  it("supprime un build", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete("/admin/builds/1")
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Build supprimé");
  });

  it("retourne 401 sans token", async () => {
    const res = await request(app).delete("/admin/builds/1");
    expect(res.status).toBe(401);
  });

  it("retourne 403 si rôle non admin", async () => {
    const res = await request(app)
      .delete("/admin/builds/1")
      .set(authHeader("user"));
    expect(res.status).toBe(403);
  });

  it("retourne 500 si erreur DB", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .delete("/admin/builds/1")
      .set(authHeader());

    expect(res.status).toBe(500);
  });
});