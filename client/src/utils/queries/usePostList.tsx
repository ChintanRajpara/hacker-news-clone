import { useInfiniteQuery } from "@tanstack/react-query";
import { GetPostsResponse } from "../../pages/postList";
import { useMemo } from "react";

export const usePostList = ({
  search,
  sort,
}: {
  sort: string;
  search: string;
}) => {
  const { data, fetchNextPage, hasNextPage, isPending, refetch } =
    useInfiniteQuery({
      networkMode: "always",
      queryKey: ["posts"],
      queryFn: async ({ pageParam }) => {
        const url = `${
          import.meta.env.VITE_API_SERVER_ENDPOINT
        }/api/posts?search=${search}&sort=${sort}&limit=3&cursor=${
          pageParam ?? ""
        }`;

        const res = await fetch(url, { credentials: "include" });

        return (await res.json()) as GetPostsResponse;
      },
      initialPageParam: undefined as undefined | string,
      getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor,
    });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts),
    [data?.pages]
  );

  return { posts, fetchNextPage, hasNextPage, isPending, refetch };
};
