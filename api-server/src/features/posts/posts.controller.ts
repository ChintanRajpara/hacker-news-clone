// src/features/posts/posts.controller.ts
import { NextFunction, Request, Response } from "express";
import { postService } from "./posts.service";
import { IPost, Post } from "./posts.model";

class PostController {
  // Singleton pattern
  private static instance: PostController;

  private constructor() {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.vote = this.vote.bind(this);
  }

  public static getInstance(): PostController {
    if (!PostController.instance) {
      PostController.instance = new PostController();
    }
    return PostController.instance;
  }

  // Create a new post
  async create(req: Request, res: Response): Promise<void> {
    const { title, url, text, author } = req.body;

    const newPost: IPost = {
      title,
      url,
      text,
      author,
      votes: 0,
      comments_count: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const post = await postService.createPost(newPost);
    res.status(201).json(post);
  }

  // Get all posts with pagination and sorting
  async getAll(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10, sort = "new" } = req.query;

    const paginationOptions = {
      page: Number(page),
      limit: Number(limit),
      sort: String(sort),
    };

    const posts = await postService.getPosts(paginationOptions);
    res.json(posts);
  }

  // Get a post by ID
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const post = await postService.getPostById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.json(post);
    }
  }

  // Update a post
  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access. Please log in." });
      return;
    }

    const { id } = req.params;
    const postData = req.body;

    const post = await postService.updatePost(id, req.user.id, postData);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.json(post);
    }
  }

  // Delete a post
  async delete(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access. Please log in." });
      return;
    }

    const { id } = req.params;

    await postService.deletePost(id, req.user.id);
    res.status(204).send();
  }

  async vote(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access. Please log in." });
      return;
    }

    const { postId } = req.params; // Get postId from URL
    const userId = req.user.id; // Get userId from the authenticated user
    const { voteValue } = req.body; // The vote value (+1 or -1 or 0 to remove)

    const { post, message } = await postService.vote(postId, userId, voteValue);

    return res.status(200).json({ message, post });
  }
}

export const postController = PostController.getInstance();
