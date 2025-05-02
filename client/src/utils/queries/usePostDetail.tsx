import { useQuery } from "@tanstack/react-query";
import { GetPostDetailResponse } from "../../types/post";

export const usePostDetail = (id?: string) => {
  const { data, isPending } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${id}`,
        { credentials: "include" }
      );
      return (await res.json()) as GetPostDetailResponse;
    },
  });

  return { post: data?.post, isPending };
};
