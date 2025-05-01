import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sharedPostFallbackUpdater,
  sharedPostUpdater,
} from "../sharedUpdaters/posts";

export const useDeletePost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${postId}`,
        { method: "DELETE", credentials: "include" }
      );

      return (await res.json()) as { message: string };
    },
    onMutate: () =>
      sharedPostUpdater({ queryClient, postId, postUpdates: {}, op: "D" }),
    onError: (_, __, context) =>
      sharedPostFallbackUpdater(queryClient, postId, context),
  });
};
