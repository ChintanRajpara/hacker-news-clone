import CommentsModel, {
  CommentDoc,
  CommentInfo,
  CommentWithRepliesDoc,
  ICommentWithReplies,
} from "./comments.model";
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

  async getTopLevelComments(postId: string, limit = 10, cursor?: string) {
    const query: any = { postId, parentId: null };
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const comments = (
      await CommentsModel.find(query)
        .sort({ id: -1 })
        .limit(limit + 1)
        .populate("author", "name")
        .lean<ICommentWithReplies[]>()
    ).map(this.mapCommentResponse);

    let nextCursor: string | null = null;
    if (comments.length > limit) {
      const nextItem = comments[limit];
      nextCursor = nextItem.id.toString();
      comments.pop(); // Remove the extra item
    }

    return { comments, nextCursor };
  }

  async getReplies(commentId: string) {
    const replies = (
      await CommentsModel.find({ parentId: commentId })
        .sort({ createdAt: 1 })
        .populate("author", "name")
        .lean<ICommentWithReplies[]>()
    ).map(this.mapCommentResponse);

    for (const reply of replies) {
      reply["replies"] = await this.getReplies(reply.id.toString());
    }

    return replies;
  }

  sortCommentsNewestFirst(comments: CommentInfo[]): CommentInfo[] {
    const sorted = [...comments];

    sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const comment of sorted) {
      if (comment.replies?.length) {
        comment.replies = this.sortCommentsNewestFirst(comment.replies);
      }
    }

    return sorted;
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

    // Delete comment and all its nested replies
    await this.deleteCommentAndReplies(commentId);

    return comment;
  }

  private async deleteCommentAndReplies(commentId: string) {
    // Delete the target comment
    await CommentsModel.deleteOne({ _id: commentId });

    // Find child comments
    const childComments = await CommentsModel.find({ parentId: commentId });

    for (const child of childComments) {
      // Recursively delete each child
      await this.deleteCommentAndReplies(child._id.toString());
    }
  }

  mapCommentResponse(comment: ICommentWithReplies): CommentInfo {
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

export default CommentsService.getInstance();
