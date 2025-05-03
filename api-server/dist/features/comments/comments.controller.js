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
const comments_service_1 = __importDefault(require("./comments.service"));
const comments_model_1 = __importDefault(require("./comments.model"));
const posts_model_1 = require("../posts/posts.model");
class CommentsController {
    constructor() {
        this.createComment = this.createComment.bind(this);
        this.getComments = this.getComments.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }
    static getInstance() {
        if (!CommentsController.instance) {
            CommentsController.instance = new CommentsController();
        }
        return CommentsController.instance;
    }
    createComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                throw new Error("Unauthorized");
            const { postId, text, parentId } = req.body;
            const comment = yield comments_service_1.default.createComment(postId, req.user.id, text, parentId);
            yield posts_model_1.Post.findByIdAndUpdate(postId, {
                $inc: { comments_count: 1 },
            }).exec();
            const savedComment = yield comments_model_1.default
                .findById(comment.id)
                .populate("author", "name")
                .lean();
            if (savedComment) {
                res
                    .status(201)
                    .json({ comment: comments_service_1.default.mapCommentResponse(savedComment) });
            }
            else {
                throw new Error("unable to add comment");
            }
        });
    }
    getComments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { postId } = req.params;
            const limit = parseInt(req.query.limit) || 10;
            const cursor = (_a = req.query) === null || _a === void 0 ? void 0 : _a.cursor;
            const { comments, nextCursor } = yield comments_service_1.default.getTopLevelComments(postId, limit, cursor);
            const commentsWithReplies = [];
            for (const comment of comments) {
                comment["replies"] = yield comments_service_1.default.getReplies(comment.id);
                commentsWithReplies.push(comment);
            }
            res.status(200).json({
                comments: comments_service_1.default.sortCommentsNewestFirst(commentsWithReplies),
                pageInfo: { nextCursor },
            });
        });
    }
    updateComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                throw new Error("Unauthorized");
            const { commentId } = req.params;
            const { text } = req.body;
            yield comments_service_1.default.updateComment(commentId, req.user.id, text);
            res.status(200).json({ message: "Comment updated successfully" });
        });
    }
    deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                throw new Error("Unauthorized");
            const { commentId } = req.params;
            const deletedComment = yield comments_service_1.default.deleteComment(commentId, req.user.id);
            yield posts_model_1.Post.findByIdAndUpdate(deletedComment.postId, {
                $inc: { comments_count: -1 },
            }).exec();
            res.status(200).json({ message: "Comment deleted successfully" });
        });
    }
}
exports.default = CommentsController.getInstance();
