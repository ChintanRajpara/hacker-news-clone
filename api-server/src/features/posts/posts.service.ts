import { Document, Types } from "mongoose";
import { IPost, PostDoc } from "./posts.model";

class PostService {
  private static instance: PostService;

  private constructor() {
    this.mapPostResponse = this.mapPostResponse.bind(this);
  }

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  mapPostResponse(post: PostDoc) {
    return {
      author: post.author,
      comments_count: post.comments_count,
      createdAt: post.createdAt,
      text: post.text,
      title: post.title,
      url: post.url,
      votes: post.votes,
      id: post.id,
    };
  }
}

export const postService = PostService.getInstance();
