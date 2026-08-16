import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

const mockQuery = jest.fn();

jest.unstable_mockModule("../db.js", () => ({
  default: { query: mockQuery },
}));

const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

const makeToken = (role = "admin") =>
  jwt.sign({ id: 1, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

const authHeader = (role = "admin") => ({
  Authorization: `Bearer ${makeToken(role)}`,
});

beforeEach(() => {
  mockQuery.mockReset();
});

// ── POST /admin/uploads ──────────────────────────────────────────────────
describe("POST /admin/uploads", () => {
  it("retourne 401 sans token", async () => {
    const res = await request(app).post("/admin/uploads");
    expect(res.status).toBe(401);
  });

  it("retourne 403 si rôle non admin", async () => {
    const res = await request(app)
      .post("/admin/uploads")
      .set(authHeader("user"));
    expect(res.status).toBe(403);
  });

  it("upload une image PNG avec succès", async () => {
    const res = await request(app)
      .post("/admin/uploads")
      .set(authHeader())
      .attach("file", Buffer.from("fake png content"), {
        filename: "ayaka.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Upload réussi");
    expect(res.body).toHaveProperty("filename");
    expect(res.body).toHaveProperty("url");
    expect(res.body.url).toMatch(/^\/uploads\//);
  });

  it("upload une image WEBP avec succès", async () => {
    const res = await request(app)
      .post("/admin/uploads")
      .set(authHeader())
      .attach("file", Buffer.from("fake webp content"), {
        filename: "raiden.webp",
        contentType: "image/webp",
      });

    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/^\/uploads\//);
  });

  it("upload une image JPEG avec succès", async () => {
    const res = await request(app)
      .post("/admin/uploads")
      .set(authHeader())
      .attach("file", Buffer.from("fake jpeg content"), {
        filename: "hutao.jpeg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
  });

  it("filename et url sont cohérents", async () => {
    const res = await request(app)
      .post("/admin/uploads")
      .set(authHeader())
      .attach("file", Buffer.from("fake"), {
        filename: "test.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.url).toBe(`/uploads/${res.body.filename}`);
  });

  it("retourne 400 si aucun fichier envoyé", async () => {
    const res = await request(app)
      .post("/admin/uploads")
      .set(authHeader());

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Aucun fichier reçu");
  });

  it("retourne 400 ou 500 pour un format non supporté (txt)", async () => {
    const res = await request(app)
      .post("/admin/uploads")
      .set(authHeader())
      .attach("file", Buffer.from("not an image"), {
        filename: "document.txt",
        contentType: "text/plain",
      });

    expect([400, 500]).toContain(res.status);
  });
});