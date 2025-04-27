// src/features/posts/posts.service.ts
import { IPost, Post } from "./posts.model";
import mongoose from "mongoose";
import PostVote from "./userPostVote.model";

class PostService {
  // Singleton pattern
  private static instance: PostService;

  private constructor() {
    this.createPost = this.createPost.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.getPostById = this.getPostById.bind(this);
    this.updatePost = this.updatePost.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.vote = this.vote.bind(this);
  }

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  // Create a new post
  async createPost(postData: IPost): Promise<IPost> {
    const post = new Post(postData);
    return await post.save();
  }

  // Get all posts with pagination and sorting
  async getPosts({
    page,
    limit,
    sort,
  }: {
    page: number;
    limit: number;
    sort: string;
  }) {
    const skip = (page - 1) * limit;

    let sortOptions = {};
    if (sort === "new") {
      sortOptions = { createdAt: -1 };
    } else if (sort === "top") {
      sortOptions = { votes: -1 };
    } else if (sort === "best") {
      sortOptions = { votes: -1, createdAt: -1 };
    }

    const posts = await Post.find()
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .exec();

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    return { posts, totalPages, totalPosts };
  }

  // Get a post by its ID
  async getPostById(postId: string): Promise<IPost | null> {
    return await Post.findById(postId).exec();
  }

  // Update a post
  async updatePost(
    postId: string,
    userId: string,
    updatedData: Partial<IPost>
  ) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== userId) {
      throw new Error("You are not authorized to edit this post");
    }

    // Update the post fields
    post.title = updatedData.title || post.title;
    post.url = updatedData.url || post.url;
    post.text = updatedData.text || post.text;

    await post.save();

    return { post, message: "Post updated successfully" };
  }

  // Delete a post
  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== userId) {
      throw new Error("You are not authorized to delete this post");
    }

    await Post.deleteOne({ _id: postId }).exec();
  }

  async vote(postId: string, userId: string, voteValue: number) {
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
        return { post, message: "Vote removed successfully" };
      }

      // If the user is updating their vote (change from upvote to downvote or vice versa)
      if (existingVote.voteValue === voteValue) {
        // If the vote value is the same, don't update anything
        return { post, message: "Vote is already the same" };
      }

      post.votes -= existingVote.voteValue; // Remove the old vote value
      post.votes += voteValue; // Add the new vote value
      await post.save(); // Save the updated post

      // Update the user's vote record with the new vote value
      existingVote.voteValue = voteValue;
      await existingVote.save();
      return { post, message: "Vote updated successfully" };
    }

    // If the user hasn't voted yet, add the new vote
    const newVote = new PostVote({ userId, postId, voteValue });
    await newVote.save(); // Save the vote

    post.votes += voteValue; // Increment or decrement the vote count
    await post.save(); // Save the updated post

    return { post, message: "Vote added successfully" };
  }
}

export const postService = PostService.getInstance();
