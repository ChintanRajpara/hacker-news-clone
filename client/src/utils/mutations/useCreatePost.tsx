import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { PostInfo } from "../types/post";
import {
  sharedPostFallbackUpdater,
  sharedPostUpdater,
} from "../sharedUpdaters/posts";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: {
      title: string;
      url?: string;
      text?: string;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts`,
        {
          method: "POST",
          body: JSON.stringify(newPost),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return (await res.json()) as { post: PostInfo };
    },

    onMutate: (newPost) => {
      const clientMutationId = `clientMutationId:${nanoid()}`;

      const optimisticPost: PostInfo = {
        ...newPost,
        id: clientMutationId,
        comments_count: 0,
        createdAt: new Date(),
        votes: 0,
        author: { id: "", name: "" }, // TODO:
        selfVoteValue: 0,
      };

      return sharedPostUpdater({
        queryClient,
        postUpdates: optimisticPost,
        postId: clientMutationId,
        op: "A",
        clientMutationId,
      });
    },
    onError: (_, __, context) => {
      if (context?.clientMutationId) {
        sharedPostFallbackUpdater(
          queryClient,
          context?.clientMutationId,
          context
        );
      }
    },
    onSuccess: async ({ post }, _, { clientMutationId }) => {
      if (clientMutationId) {
        return sharedPostUpdater({
          queryClient,
          postUpdates: post,
          postId: clientMutationId,
          op: "E",
          clientMutationId,
        });
      }
    },
  });
};
