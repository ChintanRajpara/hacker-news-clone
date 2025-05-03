"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userPostVoteSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    postId: { type: String, required: true },
    voteValue: { type: Number, required: true, enum: [-1, 1] }, // Either -1 or 1
});
const PostVote = (0, mongoose_1.model)("UserPostVote", userPostVoteSchema);
exports.default = PostVote;
