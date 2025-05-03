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
exports.postService = void 0;
const userPostVote_model_1 = __importDefault(require("./userPostVote.model"));
class PostService {
    constructor() {
        this.mapPostResponse = this.mapPostResponse.bind(this);
        this.mapPostsResponse = this.mapPostsResponse.bind(this);
    }
    static getInstance() {
        if (!PostService.instance) {
            PostService.instance = new PostService();
        }
        return PostService.instance;
    }
    mapPostResponse(post, authUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const selfVote = yield userPostVote_model_1.default.findOne({
                postId: post._id,
                userId: authUserId,
            });
            return {
                author: {
                    id: post.author._id.toString(),
                    name: post.author.name,
                },
                comments_count: post.comments_count,
                createdAt: post.createdAt,
                text: post.text,
                title: post.title,
                url: post.url,
                votes: post.votes,
                id: post._id.toString(),
                selfVoteValue: ((_a = selfVote === null || selfVote === void 0 ? void 0 : selfVote.voteValue) !== null && _a !== void 0 ? _a : 0),
            };
        });
    }
    mapPostsResponse(posts, authUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = [];
            for (const post of posts) {
                const mappedPost = yield this.mapPostResponse(post, authUserId);
                res.push(mappedPost);
            }
            return res;
        });
    }
}
exports.postService = PostService.getInstance();
