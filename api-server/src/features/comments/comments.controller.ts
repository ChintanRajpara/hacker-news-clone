import { Request, Response, NextFunction } from "express";
import CommentsService from "./comments.service";

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

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");

      const { postId, text, parentId } = req.body;
      const comment = await CommentsService.createComment(
        postId,
        req.user.id,
        text,
        parentId
      );

      res.status(201).json({ comment });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const topLevelComments = await CommentsService.getTopLevelComments(
        postId,
        page,
        limit
      );

      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (comment) => {
          comment.replies = await CommentsService.getReplies(
            comment._id.toString()
          );
          return comment;
        })
      );

      res.status(200).json({ comments: commentsWithReplies });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");

      const { commentId } = req.params;
      const { text } = req.body;

      await CommentsService.updateComment(commentId, req.user.id, text);

      res.status(200).json({ message: "Comment updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");

      const { commentId } = req.params;

      await CommentsService.deleteComment(commentId, req.user.id);

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentsController.getInstance();
