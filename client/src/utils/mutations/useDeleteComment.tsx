import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sharedCommentFallbackUpdater,
  sharedCommentUpdater,
} from "../sharedUpdaters/comments";

export const useDeleteComment = (
  commentId: string,
  topLevelParentId: string | undefined,
  postId: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/comments/${commentId}`,
        { method: "DELETE", credentials: "include" }
      );

      return (await res.json()) as { message: string };
    },
    onMutate: () =>
      sharedCommentUpdater({
        queryClient,
        commentId,
        topLevelParentId,
        postId,
        commentUpdates: {},
        op: "D",
      }),
    onError: (_, __, context) =>
      sharedCommentFallbackUpdater(queryClient, postId, context),
  });
};
