import { useMutation } from "@tanstack/react-query";

export const useDeleteComment = (commentId: string) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      return (await res.json()) as { message: string };
    },
  });
};
