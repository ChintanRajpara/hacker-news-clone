import request from "supertest";
import app from "../src/app";
import { connectDB } from "../src/config/db";
import http from "http";
import { Response } from "supertest";

function extractAuthCookie(res: Response): string {
  const rawCookies = res.headers["set-cookie"] as unknown as
    | string[]
    | undefined;

  if (!rawCookies) {
    throw new Error("No set-cookie header found");
  }

  const tokenCookie = rawCookies.find((c) => c.startsWith("token="));

  if (!tokenCookie) {
    throw new Error("Auth token cookie not found");
  }

  return tokenCookie;
}

let server: http.Server;

beforeAll((done) => {
  const port = process.env.PORT;

  connectDB.then(() => {
    server = app.listen(port, () => {
      done();
    });
  });
});

afterAll((done) => {
  server.close(done);
});

describe("User API", () => {
  let cookie: string;
  const user = {
    name: "User2",
    email: `user2_${Math.random().toFixed(6)}@example.com`,
    password: "testpass",
  };

  beforeAll(async () => {
    await request(app).post("/api/users/signup").send(user);
    const res = await request(app).post("/api/users/login").send({
      email: user.email,
      password: user.password,
    });

    cookie = extractAuthCookie(res);
  });

  it("should return user info for authenticated user", async () => {
    const res = await request(app).get("/api/users/me").set("Cookie", [cookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toMatchObject({
      email: user.email,
      name: user.name,
      id: expect.any(String),
    });
  });

  it("should return 401 for unauthenticated user", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.statusCode).toBe(401);
  });
});
