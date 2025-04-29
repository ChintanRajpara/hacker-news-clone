import { useMutation } from "@tanstack/react-query";

export const useSignup = () => {
  return useMutation({
    mutationFn: async (authPayload: {
      name: string;
      email: string;
      password: string;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/users/signup`,
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
