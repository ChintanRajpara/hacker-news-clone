import request from "supertest";
import app from "../src/app";
import http from "http";
import { connectDB } from "../src/config/db";
import { Response } from "supertest";

function extractAuthCookie(res: Response): string {
  const rawCookies = res.headers["set-cookie"] as unknown as
    | string[]
    | undefined;
  if (!rawCookies) throw new Error("No set-cookie header found");
  const tokenCookie = rawCookies.find((c) => c.startsWith("token="));
  if (!tokenCookie) throw new Error("Auth token cookie not found");
  return tokenCookie;
}

let server: http.Server;

beforeAll((done) => {
  const port = process.env.PORT || 3000;
  connectDB.then(() => {
    server = app.listen(port, () => done());
  });
});

afterAll((done) => {
  server.close(done);
});

describe("Comments API", () => {
  let cookie: string;
  let postId: string;
  let commentId: string;

  const user = {
    name: "Commenter",
    email: `commenter_${Math.random().toFixed(6)}@example.com`,
    password: "testpass",
  };

  beforeAll(async () => {
    await request(app).post("/api/users/signup").send(user);
    const loginRes = await request(app).post("/api/users/login").send({
      email: user.email,
      password: user.password,
    });
    cookie = extractAuthCookie(loginRes);

    const postRes = await request(app)
      .post("/api/posts")
      .set("Cookie", [cookie])
      .send({ title: "Post for comments", text: "..." });

    postId = postRes.body.post.id;
  });

  it("should create a new comment", async () => {
    const res = await request(app)
      .post("/api/comments")
      .set("Cookie", [cookie])
      .send({ postId, text: "First comment" });

    expect(res.statusCode).toBe(201);
    expect(res.body.comment.text).toBe("First comment");
    commentId = res.body.comment.id;
  });

  it("should allow nested comments", async () => {
    const res = await request(app)
      .post("/api/comments")
      .set("Cookie", [cookie])
      .send({ postId, text: "Reply", parentId: commentId });

    expect(res.statusCode).toBe(201);
    expect(res.body.comment.parentId).toBe(commentId);
  });

  it("should update a comment", async () => {
    const res = await request(app)
      .put(`/api/comments/${commentId}`)
      .set("Cookie", [cookie])
      .send({ text: "Updated comment" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Comment updated successfully");
  });

  it("should delete a comment", async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set("Cookie", [cookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Comment deleted successfully");
  });

  it("should fetch paginated comments", async () => {
    const res = await request(app).get(`/api/comments/${postId}?limit=1`);

    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBeLessThanOrEqual(1);
    expect(res.body.pageInfo).toHaveProperty("nextCursor");
  });
});
