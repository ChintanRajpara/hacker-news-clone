import { useMutation } from "@tanstack/react-query";

export const useEditComment = (commentId: string) => {
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
  });
};
