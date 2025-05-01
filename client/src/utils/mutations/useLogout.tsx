import { useMutation } from "@tanstack/react-query";

export const useLogout = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/users/logout`,
        { method: "POST", credentials: "include" }
      );

      return (await res.json()) as { message: string };
    },
    onSuccess,
  });
};
