import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../db.js", () => ({
  default: { query: mockQuery },
}));

const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

describe("API Root", () => {
  it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});