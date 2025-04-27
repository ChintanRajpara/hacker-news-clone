// src/features/posts/posts.model.ts
import { Schema, model } from "mongoose";

export interface IPost {
  title: string;
  url: string | null;
  text: string | null;
  author: string;
  votes: number;
  comments_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    url: { type: String, required: false, default: null },
    text: { type: String, required: false, default: null },
    author: { type: String, required: true },
    votes: { type: Number, default: 0 }, // Total number of votes
    comments_count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Post = model<IPost>("Post", postSchema);
