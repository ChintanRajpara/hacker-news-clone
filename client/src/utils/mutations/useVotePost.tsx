import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostInfo, VoteValue } from "../../types/post";
import {
  sharedPostFallbackUpdater,
  sharedPostUpdater,
} from "../sharedUpdaters/posts";

export const useVotePost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      selfVoteValue,
    }: {
      selfVoteValue: VoteValue;
      votes: number;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${postId}/vote`,
        {
          method: "PUT",
          body: JSON.stringify({ voteValue: selfVoteValue }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return (await res.json()) as { post: PostInfo };
    },
    onMutate: ({ selfVoteValue, votes }) =>
      sharedPostUpdater({
        queryClient,
        postId,
        postUpdates: { votes, selfVoteValue },
        op: "E",
      }),
    onError: (_, __, context) => {
      sharedPostFallbackUpdater(queryClient, postId, context);
    },
  });
};
