import { Request, Response } from "express";
import CommentsService from "./comments.service";
import commentsModel, {
  CommentInfo,
  ICommentWithReplies,
} from "./comments.model";
import { Post } from "../posts/posts.model";

class CommentsController {
  private static instance: CommentsController;

  private constructor() {
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

  async createComment(req: Request, res: Response) {
    if (!req.user) throw new Error("Unauthorized");

    const { postId, text, parentId } = req.body;
    const comment = await CommentsService.createComment(
      postId,
      req.user.id,
      text,
      parentId
    );

    await Post.findByIdAndUpdate(postId, {
      $inc: { comments_count: 1 },
    }).exec();

    const savedComment = await commentsModel
      .findById(comment.id)
      .populate("author", "name")
      .lean<ICommentWithReplies>();

    if (savedComment) {
      res
        .status(201)
        .json({ comment: CommentsService.mapCommentResponse(savedComment) });
    } else {
      throw new Error("unable to add comment");
    }
  }

  async getComments(req: Request, res: Response) {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const cursor = req.query?.cursor as string | undefined;

    const { comments, nextCursor } = await CommentsService.getTopLevelComments(
      postId,
      limit,
      cursor
    );

    const commentsWithReplies: CommentInfo[] = [];

    for (const comment of comments) {
      comment["replies"] = await CommentsService.getReplies(comment.id);
      commentsWithReplies.push(comment);
    }

    res.status(200).json({
      comments: CommentsService.sortCommentsNewestFirst(commentsWithReplies),
      pageInfo: { nextCursor },
    });
  }

  async updateComment(req: Request, res: Response) {
    if (!req.user) throw new Error("Unauthorized");

    const { commentId } = req.params;
    const { text } = req.body;

    await CommentsService.updateComment(commentId, req.user.id, text);

    res.status(200).json({ message: "Comment updated successfully" });
  }

  async deleteComment(req: Request, res: Response) {
    if (!req.user) throw new Error("Unauthorized");

    const { commentId } = req.params;

    const deletedComment = await CommentsService.deleteComment(
      commentId,
      req.user.id
    );

    await Post.findByIdAndUpdate(deletedComment.postId, {
      $inc: { comments_count: -1 },
    }).exec();

    res.status(200).json({ message: "Comment deleted successfully" });
  }
}

export default CommentsController.getInstance();
