import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { GetPostsResponse } from "../../types/post";

export const usePostList = ({
  search,
  sort,
}: {
  sort: string;
  search: string;
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isPending,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => {
      const url = `${
        import.meta.env.VITE_API_SERVER_ENDPOINT
      }/api/posts?search=${search}&sort=${sort}&limit=10&cursor=${
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
    [data]
  );

  return {
    posts,
    fetchNextPage,
    hasNextPage,
    isPending,
    refetch,
    isFetchingNextPage,
  };
};
