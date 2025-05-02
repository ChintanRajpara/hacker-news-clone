import { IPostWithAuthor } from "./posts.model";
import PostVote from "./userPostVote.model";

type VoteValue = 0 | -1 | 1;

export type PostInfo = {
  author: { id: string; name: string };
  comments_count: number;
  createdAt: Date;
  text?: string | null;
  title: string;
  url?: string | null;
  votes: number;
  id: string;
  selfVoteValue: VoteValue;
};

class PostService {
  private static instance: PostService;

  private constructor() {
    this.mapPostResponse = this.mapPostResponse.bind(this);
    this.mapPostsResponse = this.mapPostsResponse.bind(this);
  }

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  async mapPostResponse(
    post: IPostWithAuthor,
    authUserId?: string
  ): Promise<PostInfo> {
    const selfVote = await PostVote.findOne({
      postId: post._id,
      userId: authUserId,
    });

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
      selfVoteValue: (selfVote?.voteValue ?? 0) as VoteValue,
    };
  }

  async mapPostsResponse(
    posts: IPostWithAuthor[],
    authUserId?: string
  ): Promise<PostInfo[]> {
    const res: PostInfo[] = [];

    for (const post of posts) {
      const mappedPost = await this.mapPostResponse(post, authUserId);

      res.push(mappedPost);
    }

    return res;
  }
}

export const postService = PostService.getInstance();
