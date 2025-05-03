"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    postId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Posts" },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comments", default: null },
    author: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Users" },
    text: { type: String, required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Comments", commentSchema);
