export type CommentInfo = {
  author: {
    id: Types.ObjectId;
    name: string;
  };
  createdAt: Date;
  parentId: Types.ObjectId | null | undefined;
  replies: CommentInfo[];
  postId: Types.ObjectId;
  text: string;
  updatedAt: Date;
  id: string;
};

export type GetCommentsResponse = {
  comments: CommentInfo[];
  pageInfo: { nextCursor?: string };
};
