import { Request, Response } from "express";
import { IPost, IPostWithAuthor, Post } from "./posts.model";
import PostVote from "./userPostVote.model";
import { postService } from "./posts.service";
import { extractPostKeywords } from "../../utils/extractKeywords";
import mongoose from "mongoose";
import commentsModel from "../comments/comments.model";
import { decodeCursor, encodeCursor } from "../../utils/pagination";

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

    const savedPost = await Post.findById(post.id)
      .populate("author", "name")
      .lean<IPostWithAuthor>();

    if (savedPost) {
      const mappedPost = await postService.mapPostResponse(
        savedPost,
        req.user?.id
      );

      res.status(201).json({
        post: mappedPost,
        message: "Post created successfully!",
      });
    } else {
      throw new Error("unable to create post");
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 10;
    const sort = req.query.sort ?? "new";
    const search = String(req.query.search ?? "")
      .trim()
      .toLowerCase();
    const cursorRaw = req.query.cursor;
    const cursor = cursorRaw ? decodeCursor(cursorRaw as string) : null;

    const filter: any = {};

    if (search) {
      filter.keywords = { $in: [search] };
    }

    // Cursor logic based on sort type
    const sortOptions: any = {};
    if (sort === "new") {
      sortOptions.createdAt = -1;
      sortOptions._id = -1;

      // sortOptions = { createdAt: -1, _id: -1 };

      if (cursor) {
        filter._id = { $lt: cursor };
      }
    } else if (sort === "top") {
      sortOptions.votes = -1;
      sortOptions.comments_count = -1;
      sortOptions._id = -1;

      if (cursor) {
        filter.$or = [
          { votes: { $lt: cursor.votes } },
          {
            votes: cursor.votes,
            comments_count: { $lt: cursor.comments_count },
          },
          {
            votes: cursor.votes,
            comments_count: cursor.comments_count,
            _id: { $lt: cursor._id },
          },
        ];
      }
    } else if (sort === "best") {
      sortOptions.votes = -1;
      sortOptions.comments_count = -1;
      sortOptions.createdAt = -1;
      sortOptions._id = -1;

      if (cursor) {
        filter.$or = [
          { votes: { $lt: cursor.votes } },
          {
            votes: cursor.votes,
            comments_count: { $lt: cursor.comments_count },
          },
          {
            votes: cursor.votes,
            comments_count: cursor.comments_count,
            createdAt: { $lt: new Date(cursor.createdAt) },
          },
          {
            votes: cursor.votes,
            comments_count: cursor.comments_count,
            createdAt: new Date(cursor.createdAt),
            _id: { $lt: cursor._id },
          },
        ];
      }
    }

    const posts = await Post.find(filter)
      .sort(sortOptions)
      .limit(limit + 1)
      .populate("author", "name")
      .lean<IPostWithAuthor[]>();

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const lastPost = posts[limit];
      posts.pop();

      if (sort === "new") {
        nextCursor = encodeCursor({
          createdAt: lastPost.createdAt,
          _id: lastPost._id,
        });
      } else if (sort === "top") {
        nextCursor = encodeCursor({
          votes: lastPost.votes,
          comments_count: lastPost.comments_count,
          _id: lastPost._id,
        });
      } else if (sort === "best") {
        nextCursor = encodeCursor({
          votes: lastPost.votes,
          comments_count: lastPost.comments_count,
          createdAt: lastPost.createdAt,
          _id: lastPost._id,
        });
      }
    }

    const mappedPosts = await postService.mapPostsResponse(posts, req.user?.id);

    res.json({
      posts: mappedPosts,
      pageInfo: { nextCursor },
    });
  }

  // Get a post by ID
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id })
      .populate("author", "name")
      .lean<IPostWithAuthor>();

    if (!post) {
      res.status(404).json({ message: "Post not found" });
    } else {
      const mappedPost = await postService.mapPostResponse(post, req.user?.id);

      res.json({ post: mappedPost });
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

    const post = await Post.findById(id)
      .populate("author", "name")
      .lean<IPostWithAuthor>();
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user is the author of the post
    if (post.author._id.toString() !== req.user.id) {
      throw new Error("You are not authorized to edit this post");
    }

    // Update the post fields
    post.title = postData.title || post.title;
    post.url = postData.url || post.url;
    post.text = postData.text || post.text;

    await Post.updateOne(
      { _id: id },
      {
        title: post.title,
        url: post.url,
        text: post.text,
      }
    );

    if (!post) {
      res.status(404).json({ message: "Post not found" });
    } else {
      const mappedPost = await postService.mapPostResponse(post, req.user?.id);

      res.json({ post: mappedPost, message: "Post updated successfully" });
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

    await commentsModel.deleteMany({ postId: id });

    res.status(200).json({ message: "Post deleted successfully" });
  }

  async vote(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access. Please log in." });
      return;
    }

    const { id } = req.params; // Get postId from URL
    const userId = req.user.id; // Get userId from the authenticated user
    const { voteValue } = req.body; // The vote value (+1 or -1 or 0 to remove)

    // Check if the post exists
    const post = await Post.findById(id)
      .populate("author", "name")
      .lean<IPostWithAuthor>();
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user has already voted
    const existingVote = await PostVote.findOne({ userId, postId: id });

    // If the user has already voted
    if (existingVote) {
      if (voteValue === 0) {
        // If vote value is 0, remove the vote
        post.votes -= existingVote.voteValue; // Remove the old vote value

        await Post.updateOne({ _id: post._id }, { votes: post.votes }); // Save the updated post

        // Remove the user's vote from the PostVote collection
        await PostVote.deleteOne({ _id: existingVote._id });

        const mappedPost = await postService.mapPostResponse(
          post,
          req.user?.id
        );

        res
          .status(200)
          .json({ post: mappedPost, message: "Vote removed successfully" });

        return;
      }

      // If the user is updating their vote (change from upvote to downvote or vice versa)
      if (existingVote.voteValue === voteValue) {
        // If the vote value is the same, don't update anything

        const mappedPost = await postService.mapPostResponse(
          post,
          req.user?.id
        );

        res
          .status(200)
          .json({ post: mappedPost, message: "Vote is already the same" });

        return;
      }

      post.votes -= existingVote.voteValue; // Remove the old vote value
      post.votes += voteValue; // Add the new vote value
      // await post.save(); // Save the updated post

      await Post.updateOne({ _id: post._id }, { votes: post.votes }); // Save the updated post

      // Update the user's vote record with the new vote value
      existingVote.voteValue = voteValue;
      await existingVote.save();

      const mappedPost = await postService.mapPostResponse(post, req.user?.id);

      res
        .status(200)
        .json({ post: mappedPost, message: "Vote added successfully" });

      return;
    }

    // If the user hasn't voted yet, add the new vote
    const newVote = new PostVote({ userId, postId: id, voteValue });
    await newVote.save(); // Save the vote

    post.votes += voteValue; // Increment or decrement the vote count

    // await post.save(); // Save the updated post
    await Post.updateOne({ _id: post._id }, { votes: post.votes }); // Save the updated post

    const mappedPost = await postService.mapPostResponse(post, req.user?.id);

    res
      .status(200)
      .json({ post: mappedPost, message: "Vote added successfully" });

    return;
  }
}

export const postController = PostController.getInstance();
