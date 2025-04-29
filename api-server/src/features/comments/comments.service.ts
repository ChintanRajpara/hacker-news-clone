import CommentsModel, { ICommentWithReplies } from "./comments.model";
import UsersModel from "../users/users.model";
import { Types } from "mongoose";

class CommentsService {
  private static instance: CommentsService;

  private constructor() {}

  static getInstance() {
    if (!CommentsService.instance) {
      CommentsService.instance = new CommentsService();
    }
    return CommentsService.instance;
  }

  async createComment(
    postId: string,
    userId: string,
    text: string,
    parentId?: string
  ) {
    const newComment = await CommentsModel.create({
      postId,
      author: userId,
      text,
      parentId: parentId || null,
    });
    return newComment;
  }

  async getTopLevelComments(postId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const comments = await CommentsModel.find({ postId, parentId: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name") // only fetch user's name
      .lean<ICommentWithReplies[]>();

    return comments;
  }

  async getReplies(commentId: string) {
    const replies = await CommentsModel.find({ parentId: commentId })
      .sort({ createdAt: 1 })
      .populate("author", "name")
      .lean<ICommentWithReplies[]>();

    for (const reply of replies) {
      reply.replies = await this.getReplies(reply._id.toString());
    }

    return replies;
  }

  async updateComment(commentId: string, userId: string, text: string) {
    const comment = await CommentsModel.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.author.toString() !== userId) {
      throw new Error("Unauthorized to edit this comment");
    }

    comment.text = text;
    await comment.save();
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await CommentsModel.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.author.toString() !== userId) {
      throw new Error("Unauthorized to delete this comment");
    }

    await CommentsModel.deleteOne({ _id: commentId });
  }
}

export default CommentsService.getInstance();
