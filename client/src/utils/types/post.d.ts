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

export type GetPostsResponse = {
  posts: PostInfo[];
  pageInfo: { nextCursor?: string };
};

export type GetPostDetailResponse = {
  post: PostInfo;
};
