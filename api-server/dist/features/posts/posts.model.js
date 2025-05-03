"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
// src/features/posts/posts.model.ts
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: false, default: null },
    text: { type: String, required: false, default: null },
    author: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Users" },
    votes: { type: Number, default: 0 }, // Total number of votes
    comments_count: { type: Number, required: true, default: 0 },
    keywords: { type: [String], index: true },
}, { timestamps: true });
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
exports.Post = (0, mongoose_1.model)("Post", postSchema);
