import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sharedCommentFallbackUpdater,
  sharedCommentUpdater,
} from "../sharedUpdaters/comments";

export const useEditComment = (
  commentId: string,
  topLevelParentId: string | undefined,
  postId: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/comments/${commentId}`,
        {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({ text }),
          headers: { "Content-Type": "application/json" },
        }
      );

      return (await res.json()) as { message: string };
    },
    onMutate: ({ text }) =>
      sharedCommentUpdater({
        queryClient,
        commentId,
        topLevelParentId,
        postId,
        commentUpdates: { text },
        op: "E",
      }),
    onError: (_, __, context) =>
      sharedCommentFallbackUpdater(queryClient, postId, context),
  });
};
