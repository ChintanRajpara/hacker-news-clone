import { Schema, model, Types, Document } from "mongoose";

interface IComment {
  postId: Types.ObjectId;
  parentId?: Types.ObjectId | null;
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentWithReplies extends Omit<IComment, "author"> {
  _id: Types.ObjectId;
  author: {
    _id: Types.ObjectId;
    name: string;
  };
  replies?: ICommentWithReplies[];
}

export type CommentDoc = Document<unknown, {}, IComment, {}> &
  IComment & {
    _id: Types.ObjectId;
  } & {
    __v: number;
  };

export type CommentWithRepliesDoc = Document<
  unknown,
  {},
  ICommentWithReplies,
  {}
> &
  ICommentWithReplies & {
    _id: Types.ObjectId;
  } & {
    __v: number;
  };

export type CommentInfo = {
  author: {
    id: string;
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

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, required: true, ref: "Posts" },
    parentId: { type: Schema.Types.ObjectId, ref: "Comments", default: null },
    author: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IComment>("Comments", commentSchema);
