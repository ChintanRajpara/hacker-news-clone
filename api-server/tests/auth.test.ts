import request from "supertest";
import app from "../src/app";
import http from "http";
import { connectDB } from "../src/config/db";

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

describe("Authentication API", () => {
  const user = {
    name: "Test",
    email: `test${Math.random() * 10000000}@example.com`,
    password: "testpass",
  };

  it("should sign up a new user", async () => {
    const res = await request(app).post("/api/users/signup").send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created successfully.");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should not allow duplicate signup", async () => {
    const res = await request(app).post("/api/users/signup").send(user);
    expect(res.statusCode).toBe(400); // or your app's error code
  });

  it("should sign in an existing user", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged in successfully.");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should reject invalid credentials", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: user.email,
      password: "wrongpass",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should logout the user", async () => {
    const login = await request(app).post("/api/users/login").send({
      email: user.email,
      password: user.password,
    });

    const res = await request(app)
      .post("/api/users/logout")
      .set("Cookie", [extractAuthCookie(login)]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully.");
  });
});
