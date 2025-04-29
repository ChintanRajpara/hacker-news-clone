// src/features/posts/posts.model.ts
import { Document, Schema, Types, model } from "mongoose";

export interface IPost {
  title: string;
  url: string | null;
  text: string | null;
  author: string;
  votes: number;
  comments_count: number;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type PostDoc = Document<unknown, {}, IPost, {}> &
  IPost & {
    _id: Types.ObjectId;
  } & {
    __v: number;
  };

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    url: { type: String, required: false, default: null },
    text: { type: String, required: false, default: null },
    author: { type: String, required: true },
    votes: { type: Number, default: 0 }, // Total number of votes
    comments_count: { type: Number, required: true, default: 0 },
    keywords: { type: [String], index: true },
  },
  { timestamps: true }
);

// "new" sorted keyword searches (with _id for cursor)
postSchema.index({ keywords: 1, createdAt: -1, _id: -1 });

// "top" sorted keyword searches (with _id)
postSchema.index({ keywords: 1, votes: -1, comments_count: -1, _id: -1 });

// "best" sorted keyword searches (with _id)
postSchema.index({
  keywords: 1,
  votes: -1,
  comments_count: -1,
  createdAt: -1,
  _id: -1,
});

// "Top" prioritizes highly voted and heavily discussed posts.
// "Best" factors in votes, comments, and recency — making it ideal for trending content.

export const Post = model<IPost>("Post", postSchema);
