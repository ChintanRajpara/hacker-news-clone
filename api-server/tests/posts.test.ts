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
    server = app.listen(port, () => done());
  });
});

afterAll((done) => {
  server.close(done);
});

describe("Posts API", () => {
  let cookie: string;
  let postId: string;
  const user = {
    name: "Poster",
    email: `poster_${Math.random().toFixed(6)}@example.com`,
    password: "testpass",
  };

  beforeAll(async () => {
    await request(app).post("/api/users/signup").send(user);
    const res = await request(app).post("/api/users/login").send({
      email: user.email,
      password: user.password,
    });
    const rawCookies = res.headers["set-cookie"] as unknown as
      | string[]
      | undefined;
    if (!rawCookies) throw new Error("No set-cookie header found");
    const tokenCookie = rawCookies.find((c) => c.startsWith("token="));
    if (!tokenCookie) throw new Error("Auth token cookie not found");
    cookie = tokenCookie;
  });

  it("should create a new post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Cookie", [cookie])
      .send({ title: "Test Post", text: "Hello world" });

    expect(res.statusCode).toBe(201);
    expect(res.body.post.title).toBe("Test Post");
    postId = res.body.post.id;
  });

  it("should not allow unauthenticated post creation", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({ title: "No Auth", text: "Nope" });

    expect(res.statusCode).toBe(401);
  });

  it("should fetch paginated posts", async () => {
    const res = await request(app).get("/api/posts?limit=1");
    expect(res.statusCode).toBe(200);
    expect(res.body.posts.length).toBeLessThanOrEqual(1);
    expect(res.body.pageInfo).toHaveProperty("nextCursor");
  });

  it("should fetch a single post by ID", async () => {
    const res = await request(app).get(`/api/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.post.id).toBe(postId);
  });

  it("should update a post", async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Cookie", [cookie])
      .send({ title: "Updated Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.post.title).toBe("Updated Title");
  });

  it("should not allow non-owner to update post", async () => {
    const otherUser = {
      name: "Other",
      email: `other_${Math.random().toFixed(6)}@example.com`,
      password: "testpass",
    };

    await request(app).post("/api/users/signup").send(otherUser);
    const login = await request(app).post("/api/users/login").send({
      email: otherUser.email,
      password: otherUser.password,
    });

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Cookie", [extractAuthCookie(login)])
      .send({ title: "Hacked" });

    expect(res.statusCode).toBe(401);
  });

  it("should delete a post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Cookie", [cookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Post deleted successfully");
  });

  it("should not allow non-owner to delete post", async () => {
    // Recreate post
    const create = await request(app)
      .post("/api/posts")
      .set("Cookie", [cookie])
      .send({ title: "Recreated Post", text: "test" });
    const newPostId = create.body.post.id;

    // New user
    const otherUser = {
      name: "Other",
      email: `other_${Math.random().toFixed(6)}@example.com`,
      password: "testpass",
    };
    await request(app).post("/api/users/signup").send(otherUser);
    const login = await request(app).post("/api/users/login").send({
      email: otherUser.email,
      password: otherUser.password,
    });

    const res = await request(app)
      .delete(`/api/posts/${newPostId}`)
      .set("Cookie", [extractAuthCookie(login)]);

    expect(res.statusCode).toBe(401);
  });

  it("should upvote a post", async () => {
    const postRes = await request(app)
      .post("/api/posts")
      .set("Cookie", [cookie])
      .send({ title: "Vote Post", text: "Vote me" });
    const votePostId = postRes.body.post.id;

    const res = await request(app)
      .put(`/api/posts/${votePostId}/vote`)
      .set("Cookie", [cookie])
      .send({ voteValue: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.post.votes).toBe(1);
  });

  it("should not allow multiple identical votes by same user", async () => {
    const postRes = await request(app)
      .post("/api/posts")
      .set("Cookie", [cookie])
      .send({ title: "Idempotent Vote", text: "Please vote" });
    const postId = postRes.body.post.id;

    await request(app)
      .put(`/api/posts/${postId}/vote`)
      .set("Cookie", [cookie])
      .send({ voteValue: 1 });

    const res = await request(app)
      .put(`/api/posts/${postId}/vote`)
      .set("Cookie", [cookie])
      .send({ voteValue: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Vote is already the same");
  });
});
