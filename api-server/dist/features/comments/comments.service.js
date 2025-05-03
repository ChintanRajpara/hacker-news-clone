"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comments_model_1 = __importDefault(require("./comments.model"));
const mongoose_1 = require("mongoose");
class CommentsService {
    constructor() { }
    static getInstance() {
        if (!CommentsService.instance) {
            CommentsService.instance = new CommentsService();
        }
        return CommentsService.instance;
    }
    createComment(postId, userId, text, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newComment = yield comments_model_1.default.create({
                postId,
                author: userId,
                text,
                parentId: parentId || null,
            });
            return newComment;
        });
    }
    getTopLevelComments(postId_1) {
        return __awaiter(this, arguments, void 0, function* (postId, limit = 10, cursor) {
            const query = { postId, parentId: null };
            if (cursor) {
                query._id = { $lt: new mongoose_1.Types.ObjectId(cursor) };
            }
            const comments = (yield comments_model_1.default.find(query)
                .sort({ id: -1 })
                .limit(limit + 1)
                .populate("author", "name")
                .lean()).map(this.mapCommentResponse);
            let nextCursor = null;
            if (comments.length > limit) {
                const nextItem = comments[limit];
                nextCursor = nextItem.id.toString();
                comments.pop(); // Remove the extra item
            }
            return { comments, nextCursor };
        });
    }
    getReplies(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const replies = (yield comments_model_1.default.find({ parentId: commentId })
                .sort({ createdAt: 1 })
                .populate("author", "name")
                .lean()).map(this.mapCommentResponse);
            for (const reply of replies) {
                reply["replies"] = yield this.getReplies(reply.id.toString());
            }
            return replies;
        });
    }
    sortCommentsNewestFirst(comments) {
        var _a;
        const sorted = [...comments];
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        for (const comment of sorted) {
            if ((_a = comment.replies) === null || _a === void 0 ? void 0 : _a.length) {
                comment.replies = this.sortCommentsNewestFirst(comment.replies);
            }
        }
        return sorted;
    }
    updateComment(commentId, userId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield comments_model_1.default.findById(commentId);
            if (!comment)
                throw new Error("Comment not found");
            if (comment.author.toString() !== userId) {
                throw new Error("Unauthorized to edit this comment");
            }
            comment.text = text;
            yield comment.save();
        });
    }
    deleteComment(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield comments_model_1.default.findById(commentId);
            if (!comment)
                throw new Error("Comment not found");
            if (comment.author.toString() !== userId) {
                throw new Error("Unauthorized to delete this comment");
            }
            // Delete comment and all its nested replies
            yield this.deleteCommentAndReplies(commentId);
            return comment;
        });
    }
    deleteCommentAndReplies(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Delete the target comment
            yield comments_model_1.default.deleteOne({ _id: commentId });
            // Find child comments
            const childComments = yield comments_model_1.default.find({ parentId: commentId });
            for (const child of childComments) {
                // Recursively delete each child
                yield this.deleteCommentAndReplies(child._id.toString());
            }
        });
    }
    mapCommentResponse(comment) {
        return {
            author: {
                id: comment.author._id.toString(),
                name: comment.author.name,
            },
            createdAt: comment.createdAt,
            parentId: comment.parentId,
            replies: [],
            postId: comment.postId,
            text: comment.text,
            updatedAt: comment.updatedAt,
            id: comment._id.toString(),
        };
    }
}
exports.default = CommentsService.getInstance();
