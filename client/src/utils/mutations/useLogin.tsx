import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (authPayload: { email: string; password: string }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/users/login`,
        {
          method: "POST",
          body: JSON.stringify(authPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return res.json();
    },
  });
};
