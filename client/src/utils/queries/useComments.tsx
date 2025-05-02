import { useInfiniteQuery } from "@tanstack/react-query";
import { GetCommentsResponse } from "../types/comments";
import { useMemo } from "react";

export const useComments = (postId: string) => {
  const { data, fetchNextPage, hasNextPage, isPending, refetch } =
    useInfiniteQuery({
      queryKey: ["comments", postId],
      queryFn: async ({ pageParam }) => {
        const url = `${
          import.meta.env.VITE_API_SERVER_ENDPOINT
        }/api/comments/${postId}?&limit=10&cursor=${pageParam ?? ""}`;

        const res = await fetch(url, { credentials: "include" });

        return (await res.json()) as GetCommentsResponse;
      },
      initialPageParam: undefined as undefined | string,
      getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor,
    });

  const comments = useMemo(
    () => data?.pages.flatMap((page) => page.comments),
    [data?.pages]
  );

  return { comments, fetchNextPage, hasNextPage, isPending, refetch };
};
