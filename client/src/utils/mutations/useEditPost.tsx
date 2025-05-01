import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostInfo } from "../types/post";
import {
  sharedPostFallbackUpdater,
  sharedPostUpdater,
} from "../sharedUpdaters/posts";

export const useEditPost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postUpdates: {
      title?: string;
      url?: string;
      text?: string;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${postId}`,
        {
          method: "PUT",
          body: JSON.stringify(postUpdates),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return (await res.json()) as { post: PostInfo };
    },
    onMutate: (postUpdates) =>
      sharedPostUpdater({ queryClient, postId, postUpdates, op: "E" }),
    onError: (_, __, context) =>
      sharedPostFallbackUpdater(queryClient, postId, context),
  });
};
