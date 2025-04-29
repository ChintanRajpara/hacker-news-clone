import { Request, Response } from "express";
import { IPost, Post } from "./posts.model";
import PostVote from "./userPostVote.model";
import { postService } from "./posts.service";
import { extractPostKeywords } from "../../utils/extractKeywords";
import mongoose from "mongoose";

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
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access. Please log in." });
      return;
    }

    const { title, url, text } = req.body;

    const newPost: IPost = {
      title,
      url,
      text,
      author: req.user.id,
      votes: 0,
      comments_count: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      keywords: extractPostKeywords({ title, text, url }),
    };

    const post = new Post(newPost);
    await post.save();

    res.status(201).json({
      post: postService.mapPostResponse(post),
      message: "Post created successfully!",
    });
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query?.cursor;
    const sort = req.query.sort ?? "new";
    const search = req.query.search ?? "";

    const cursorObjectId = cursor
      ? new mongoose.Types.ObjectId(cursor as string)
      : null;
    const searchTerm = String(search).trim().toLowerCase();

    // Base filter
    const filter: any = {};

    // Add search filter if search term is provided
    if (searchTerm) {
      filter.keywords = { $in: [searchTerm] }; // You can tokenize the searchTerm further if needed
    }

    // Add cursor-based filter
    if (cursorObjectId) {
      filter._id = { $lt: cursorObjectId };
    }

    // Set sort logic
    let sortOptions: any = {};
    if (sort === "new") {
      sortOptions = { createdAt: -1 };
    } else if (sort === "top") {
      sortOptions = { votes: -1, comments_count: -1 };
    } else if (sort === "best") {
      sortOptions = { votes: -1, comments_count: -1, createdAt: -1 };
    }

    // Fetch posts
    const posts = await Post.find(filter)
      .sort(sortOptions)
      .limit(limit + 1)
      .exec();

    // Set next cursor if there are more posts
    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts[limit]; // The extra one
      nextCursor = nextItem._id.toString(); // or createdAt, depending on sort
      posts.pop(); // Remove the extra item
    }

    res.json({
      posts: posts.map(postService.mapPostResponse),
      pageInfo: { nextCursor },
    });
  }

  // Get a post by ID
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id }).exec();

    if (!post) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.json({
        post: postService.mapPostResponse(post),
      });
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

    const post = await Post.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user.id) {
      throw new Error("You are not authorized to edit this post");
    }

    // Update the post fields
    post.title = postData.title || post.title;
    post.url = postData.url || post.url;
    post.text = postData.text || post.text;

    await post.save();

    if (!post) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.json({
        post: postService.mapPostResponse(post),
        message: "Post updated successfully",
      });
    }
  }

  // Delete a post
  async delete(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access. Please log in." });

      return;
    }

    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user.id) {
      throw new Error("You are not authorized to delete this post");
    }

    await Post.deleteOne({ _id: id }).exec();

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

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user has already voted
    const existingVote = await PostVote.findOne({ userId, postId });

    // If the user has already voted
    if (existingVote) {
      if (voteValue === 0) {
        // If vote value is 0, remove the vote
        post.votes -= existingVote.voteValue; // Remove the old vote value
        await post.save(); // Save the updated post

        // Remove the user's vote from the PostVote collection
        await PostVote.deleteOne({ _id: existingVote._id });

        res.status(200).json({
          post: postService.mapPostResponse(post),
          message: "Vote removed successfully",
        });

        return;
      }

      // If the user is updating their vote (change from upvote to downvote or vice versa)
      if (existingVote.voteValue === voteValue) {
        // If the vote value is the same, don't update anything

        res.status(200).json({
          post: postService.mapPostResponse(post),
          message: "Vote is already the same",
        });

        return;
      }

      post.votes -= existingVote.voteValue; // Remove the old vote value
      post.votes += voteValue; // Add the new vote value
      await post.save(); // Save the updated post

      // Update the user's vote record with the new vote value
      existingVote.voteValue = voteValue;
      await existingVote.save();

      res.status(200).json({
        post: postService.mapPostResponse(post),
        message: "Vote added successfully",
      });

      return;
    }

    // If the user hasn't voted yet, add the new vote
    const newVote = new PostVote({ userId, postId, voteValue });
    await newVote.save(); // Save the vote

    post.votes += voteValue; // Increment or decrement the vote count
    await post.save(); // Save the updated post

    res.status(200).json({
      post: postService.mapPostResponse(post),
      message: "Vote added successfully",
    });

    return;
  }
}

export const postController = PostController.getInstance();
