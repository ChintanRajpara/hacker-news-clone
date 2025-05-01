import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostInfo, voteValue } from "../types/post";
import { sharedPostFallbackUpdater, sharedPostUpdater } from "./useEditPost";

export const useVotePost = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      selfVoteValue,
    }: {
      selfVoteValue: voteValue;
      votes: number;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${id}/vote`,
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
      sharedPostUpdater(queryClient, id, { votes, selfVoteValue }),
    onError: (_, __, context) => {
      sharedPostFallbackUpdater(queryClient, id, context);
    },
  });
};
