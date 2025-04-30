import { IPostWithAuthor } from "./posts.model";

export type PostInfo = {
  author: {
    id: string;
    name: string;
  };
  comments_count: number;
  createdAt: Date;
  text?: string | null;
  title: string;
  url?: string | null;
  votes: number;
  id: string;
};

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

  mapPostResponse(post: IPostWithAuthor): PostInfo {
    return {
      author: {
        id: post.author._id.toString(),
        name: post.author.name,
      },
      comments_count: post.comments_count,
      createdAt: post.createdAt,
      text: post.text,
      title: post.title,
      url: post.url,
      votes: post.votes,
      id: post._id.toString(),
    };
  }
}

export const postService = PostService.getInstance();
