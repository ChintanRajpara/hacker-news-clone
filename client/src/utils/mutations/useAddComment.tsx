import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentInfo } from "../types/comments";

import { nanoid } from "nanoid";
import {
  sharedCommentFallbackUpdater,
  sharedCommentUpdater,
} from "../sharedUpdaters/comments";

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      newComment,
    }: {
      newComment: {
        postId: string;
        text: string;
        parentId?: string;
      };
      topLevelParentId?: string;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/comments`,
        {
          method: "POST",
          body: JSON.stringify(newComment),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return (await res.json()) as { comment: CommentInfo };
    },
    onMutate: ({ newComment, topLevelParentId }) => {
      const { postId, text, parentId } = newComment;
      const clientMutationId = `clientMutationId:${nanoid()}`;

      const optimisticComment: CommentInfo = {
        text,
        id: clientMutationId,
        author: {
          id: "",
          name: "",
        },
        createdAt: new Date(),
        parentId,
        postId,
        replies: [],
        updatedAt: new Date(),
      };

      return sharedCommentUpdater({
        queryClient,
        parentId,
        commentUpdates: optimisticComment,
        commentId: clientMutationId,
        op: "A",
        postId,
        topLevelParentId,
        clientMutationId,
      });
    },
    onError: (_, { newComment }, context) =>
      sharedCommentFallbackUpdater(queryClient, newComment.postId, context),
    onSuccess: async (
      { comment },
      { topLevelParentId },
      { clientMutationId }
    ) => {
      if (clientMutationId) {
        return sharedCommentUpdater({
          queryClient,
          parentId: comment.parentId,
          commentUpdates: comment,
          commentId: clientMutationId,
          op: "E",
          postId: comment.postId,
          topLevelParentId,
        });
      }
    },
  });
};
