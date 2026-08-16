import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

const mockQuery = jest.fn();

jest.unstable_mockModule("../db.js", () => ({
  default: { query: mockQuery },
}));

const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

beforeEach(() => {
  mockQuery.mockReset();
});

// ── Middleware auth ──────────────────────────────────────────────────────
describe("Middleware auth", () => {
  it("retourne 401 si aucun header Authorization", async () => {
    const res = await request(app).get("/admin/builds");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Token manquant");
  });

  it("retourne 401 si header sans préfixe Bearer", async () => {
    const res = await request(app)
      .get("/admin/builds")
      .set("Authorization", "Basic abc123");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Token manquant");
  });

  it("retourne 403 si token invalide (mauvaise signature)", async () => {
    const res = await request(app)
      .get("/admin/builds")
      .set("Authorization", "Bearer token.invalide.ici");
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Token invalide");
  });

  it("retourne 403 si token expiré", async () => {
  const expiredToken = jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET, { expiresIn: -1 });

    const res = await request(app)
      .get("/admin/builds")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Token invalide");
  });

  it("laisse passer un token valide admin", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

  const token = jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const res = await request(app)
      .get("/admin/builds")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

// ── Middleware isAdmin ───────────────────────────────────────────────────
describe("Middleware isAdmin", () => {
  it("retourne 403 si rôle = user", async () => {
    const token = jwt.sign({ id: 2, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/admin/builds")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Accès refusé : admin requis");
  });

  it("retourne 403 si rôle = moderator", async () => {
    const token = jwt.sign({ id: 3, role: "moderator" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/admin/builds")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Accès refusé : admin requis");
  });

  it("laisse passer un utilisateur admin", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const token = jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/admin/builds")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

// ── Route /health ────────────────────────────────────────────────────────
describe("GET /health", () => {
  it("retourne 200 avec status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

// ── Route inexistante ────────────────────────────────────────────────────
describe("Route inexistante", () => {
  it("retourne 404 pour une route inconnue", async () => {
    const res = await request(app).get("/route-inconnue-xyz");
    expect(res.status).toBe(404);
  });
});