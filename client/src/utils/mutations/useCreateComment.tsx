import { useMutation } from "@tanstack/react-query";
import { CommentInfo } from "../types/comments";

export const useCreateComment = () => {
  return useMutation({
    mutationFn: async (newComment: {
      postId: string;
      text: string;
      parentId?: string;
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
  });
};
