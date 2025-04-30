import { useMutation } from "@tanstack/react-query";
import { PostInfo } from "../types/post";

export const useVotePost = (id: string) => {
  return useMutation({
    mutationFn: async (voteValue: -1 | 0 | 1) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${id}/vote`,
        {
          method: "PUT",
          body: JSON.stringify({ voteValue }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return (await res.json()) as { post: PostInfo };
    },
  });
};
