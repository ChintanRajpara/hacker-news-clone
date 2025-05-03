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
exports.postController = void 0;
const posts_model_1 = require("./posts.model");
const userPostVote_model_1 = __importDefault(require("./userPostVote.model"));
const posts_service_1 = require("./posts.service");
const extractKeywords_1 = require("../../utils/extractKeywords");
const comments_model_1 = __importDefault(require("../comments/comments.model"));
const pagination_1 = require("../../utils/pagination");
class PostController {
    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.vote = this.vote.bind(this);
    }
    static getInstance() {
        if (!PostController.instance) {
            PostController.instance = new PostController();
        }
        return PostController.instance;
    }
    // Create a new post
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized access. Please log in." });
                return;
            }
            const { title, url, text } = req.body;
            const newPost = {
                title,
                url,
                text,
                author: req.user.id,
                votes: 0,
                comments_count: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                keywords: (0, extractKeywords_1.extractPostKeywords)({ title, text, url }),
            };
            const post = new posts_model_1.Post(newPost);
            yield post.save();
            const savedPost = yield posts_model_1.Post.findById(post.id)
                .populate("author", "name")
                .lean();
            if (savedPost) {
                const mappedPost = yield posts_service_1.postService.mapPostResponse(savedPost, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                res.status(201).json({
                    post: mappedPost,
                    message: "Post created successfully!",
                });
            }
            else {
                throw new Error("unable to create post");
            }
        });
    }
    // async getAll(req: Request, res: Response): Promise<void> {
    //   const limit = Number(req.query.limit) || 10;
    //   const cursor = req.query?.cursor;
    //   const sort = req.query.sort ?? "new";
    //   const search = req.query.search ?? "";
    //   const cursorObjectId = cursor
    //     ? new mongoose.Types.ObjectId(cursor as string)
    //     : null;
    //   const searchTerm = String(search).trim().toLowerCase();
    //   // Base filter
    //   const filter: any = {};
    //   // Add search filter if search term is provided
    //   if (searchTerm) {
    //     filter.keywords = { $in: [searchTerm] }; // You can tokenize the searchTerm further if needed
    //   }
    //   // Add cursor-based filter
    //   if (cursorObjectId) {
    //     filter._id = { $lt: cursorObjectId };
    //   }
    //   // Set sort logic
    //   let sortOptions: any = {};
    //   if (sort === "new") {
    //     sortOptions = { createdAt: -1 };
    //   } else if (sort === "top") {
    //     sortOptions = { votes: -1, comments_count: -1 };
    //   } else if (sort === "best") {
    //     sortOptions = { votes: -1, comments_count: -1, createdAt: -1 };
    //   }
    //   // Fetch posts
    //   const posts = await Post.find(filter)
    //     .sort(sortOptions)
    //     .limit(limit + 1)
    //     .populate("author", "name")
    //     .lean<IPostWithAuthor[]>();
    //   // Set next cursor if there are more posts
    //   let nextCursor: string | null = null;
    //   if (posts.length > limit) {
    //     const nextItem = posts[limit]; // The extra one
    //     nextCursor = nextItem._id.toString(); // or createdAt, depending on sort
    //     posts.pop(); // Remove the extra item
    //   }
    //   const mappedPosts = await postService.mapPostsResponse(posts, req.user?.id);
    //   res.json({
    //     posts: mappedPosts,
    //     pageInfo: { nextCursor },
    //   });
    // }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const limit = Number(req.query.limit) || 10;
            const sort = (_a = req.query.sort) !== null && _a !== void 0 ? _a : "new";
            const search = String((_b = req.query.search) !== null && _b !== void 0 ? _b : "")
                .trim()
                .toLowerCase();
            const cursorRaw = req.query.cursor;
            const cursor = cursorRaw ? (0, pagination_1.decodeCursor)(cursorRaw) : null;
            const filter = {};
            if (search) {
                filter.keywords = { $in: [search] };
            }
            // Cursor logic based on sort type
            const sortOptions = {};
            if (sort === "new") {
                sortOptions.createdAt = -1;
                sortOptions._id = -1;
                // sortOptions = { createdAt: -1, _id: -1 };
                if (cursor) {
                    filter._id = { $lt: cursor };
                }
            }
            else if (sort === "top") {
                sortOptions.votes = -1;
                sortOptions.comments_count = -1;
                sortOptions._id = -1;
                if (cursor) {
                    filter.$or = [
                        { votes: { $lt: cursor.votes } },
                        {
                            votes: cursor.votes,
                            comments_count: { $lt: cursor.comments_count },
                        },
                        {
                            votes: cursor.votes,
                            comments_count: cursor.comments_count,
                            _id: { $lt: cursor._id },
                        },
                    ];
                }
            }
            else if (sort === "best") {
                sortOptions.votes = -1;
                sortOptions.comments_count = -1;
                sortOptions.createdAt = -1;
                sortOptions._id = -1;
                if (cursor) {
                    filter.$or = [
                        { votes: { $lt: cursor.votes } },
                        {
                            votes: cursor.votes,
                            comments_count: { $lt: cursor.comments_count },
                        },
                        {
                            votes: cursor.votes,
                            comments_count: cursor.comments_count,
                            createdAt: { $lt: new Date(cursor.createdAt) },
                        },
                        {
                            votes: cursor.votes,
                            comments_count: cursor.comments_count,
                            createdAt: new Date(cursor.createdAt),
                            _id: { $lt: cursor._id },
                        },
                    ];
                }
            }
            const posts = yield posts_model_1.Post.find(filter)
                .sort(sortOptions)
                .limit(limit + 1)
                .populate("author", "name")
                .lean();
            let nextCursor = null;
            if (posts.length > limit) {
                const lastPost = posts[limit];
                posts.pop();
                if (sort === "new") {
                    nextCursor = (0, pagination_1.encodeCursor)({
                        createdAt: lastPost.createdAt,
                        _id: lastPost._id,
                    });
                }
                else if (sort === "top") {
                    nextCursor = (0, pagination_1.encodeCursor)({
                        votes: lastPost.votes,
                        comments_count: lastPost.comments_count,
                        _id: lastPost._id,
                    });
                }
                else if (sort === "best") {
                    nextCursor = (0, pagination_1.encodeCursor)({
                        votes: lastPost.votes,
                        comments_count: lastPost.comments_count,
                        createdAt: lastPost.createdAt,
                        _id: lastPost._id,
                    });
                }
            }
            const mappedPosts = yield posts_service_1.postService.mapPostsResponse(posts, (_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
            res.json({
                posts: mappedPosts,
                pageInfo: { nextCursor },
            });
        });
    }
    // Get a post by ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const post = yield posts_model_1.Post.findOne({ _id: id })
                .populate("author", "name")
                .lean();
            if (!post) {
                res.status(404).json({ message: "Post not found" });
            }
            else {
                const mappedPost = yield posts_service_1.postService.mapPostResponse(post, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                res.json({ post: mappedPost });
            }
        });
    }
    // Update a post
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized access. Please log in." });
                return;
            }
            const { id } = req.params;
            const postData = req.body;
            const post = yield posts_model_1.Post.findById(id)
                .populate("author", "name")
                .lean();
            if (!post) {
                throw new Error("Post not found");
            }
            // Check if the user is the author of the post
            if (post.author._id.toString() !== req.user.id) {
                throw new Error("You are not authorized to edit this post");
            }
            // Update the post fields
            post.title = postData.title || post.title;
            post.url = postData.url || post.url;
            post.text = postData.text || post.text;
            yield posts_model_1.Post.updateOne({ _id: id }, {
                title: post.title,
                url: post.url,
                text: post.text,
            });
            if (!post) {
                res.status(404).json({ message: "Post not found" });
            }
            else {
                const mappedPost = yield posts_service_1.postService.mapPostResponse(post, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                res.json({ post: mappedPost, message: "Post updated successfully" });
            }
        });
    }
    // Delete a post
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized access. Please log in." });
                return;
            }
            const { id } = req.params;
            const post = yield posts_model_1.Post.findById(id);
            if (!post) {
                throw new Error("Post not found");
            }
            // Check if the user is the author of the post
            if (post.author.toString() !== req.user.id) {
                throw new Error("You are not authorized to delete this post");
            }
            yield posts_model_1.Post.deleteOne({ _id: id }).exec();
            yield comments_model_1.default.deleteMany({ postId: id });
            res.status(200).json({ message: "Post deleted successfully" });
        });
    }
    vote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized access. Please log in." });
                return;
            }
            const { id } = req.params; // Get postId from URL
            const userId = req.user.id; // Get userId from the authenticated user
            const { voteValue } = req.body; // The vote value (+1 or -1 or 0 to remove)
            // Check if the post exists
            const post = yield posts_model_1.Post.findById(id)
                .populate("author", "name")
                .lean();
            if (!post) {
                throw new Error("Post not found");
            }
            // Check if the user has already voted
            const existingVote = yield userPostVote_model_1.default.findOne({ userId, postId: id });
            // If the user has already voted
            if (existingVote) {
                if (voteValue === 0) {
                    // If vote value is 0, remove the vote
                    post.votes -= existingVote.voteValue; // Remove the old vote value
                    yield posts_model_1.Post.updateOne({ _id: post._id }, { votes: post.votes }); // Save the updated post
                    // Remove the user's vote from the PostVote collection
                    yield userPostVote_model_1.default.deleteOne({ _id: existingVote._id });
                    const mappedPost = yield posts_service_1.postService.mapPostResponse(post, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                    res
                        .status(200)
                        .json({ post: mappedPost, message: "Vote removed successfully" });
                    return;
                }
                // If the user is updating their vote (change from upvote to downvote or vice versa)
                if (existingVote.voteValue === voteValue) {
                    // If the vote value is the same, don't update anything
                    const mappedPost = yield posts_service_1.postService.mapPostResponse(post, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                    res
                        .status(200)
                        .json({ post: mappedPost, message: "Vote is already the same" });
                    return;
                }
                post.votes -= existingVote.voteValue; // Remove the old vote value
                post.votes += voteValue; // Add the new vote value
                // await post.save(); // Save the updated post
                yield posts_model_1.Post.updateOne({ _id: post._id }, { votes: post.votes }); // Save the updated post
                // Update the user's vote record with the new vote value
                existingVote.voteValue = voteValue;
                yield existingVote.save();
                const mappedPost = yield posts_service_1.postService.mapPostResponse(post, (_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
                res
                    .status(200)
                    .json({ post: mappedPost, message: "Vote added successfully" });
                return;
            }
            // If the user hasn't voted yet, add the new vote
            const newVote = new userPostVote_model_1.default({ userId, postId: id, voteValue });
            yield newVote.save(); // Save the vote
            post.votes += voteValue; // Increment or decrement the vote count
            // await post.save(); // Save the updated post
            yield posts_model_1.Post.updateOne({ _id: post._id }, { votes: post.votes }); // Save the updated post
            const mappedPost = yield posts_service_1.postService.mapPostResponse(post, (_d = req.user) === null || _d === void 0 ? void 0 : _d.id);
            res
                .status(200)
                .json({ post: mappedPost, message: "Vote added successfully" });
            return;
        });
    }
}
exports.postController = PostController.getInstance();
