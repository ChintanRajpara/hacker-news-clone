import { Schema, model, Types } from "mongoose";

interface IComment {
  postId: Types.ObjectId;
  parentId?: Types.ObjectId | null;
  author: Types.ObjectId;
  text: string;
}

export interface ICommentWithReplies extends Omit<IComment, "author"> {
  _id: Types.ObjectId;
  author: {
    _id: Types.ObjectId;
    name: string;
  };
  replies?: ICommentWithReplies[];
}

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
