import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { GetPostsResponse, PostInfo } from "../types/post";

export const useCreatePost = () => {
  const postsQueryKey: QueryKey = ["posts"];

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: {
      title: string;
      url?: string;
      text?: string;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts`,
        {
          method: "POST",
          body: JSON.stringify(newPost),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return (await res.json()) as { post: PostInfo };
    },
    onMutate: async (newPost) => {
      const mutationId = `clientMutationId:${nanoid()}`;

      await queryClient.cancelQueries({ queryKey: postsQueryKey });

      const optimisticPost: PostInfo = {
        ...newPost,
        id: mutationId,
        comments_count: 0,
        createdAt: new Date(),
        votes: 0,
        author: { id: "", name: "" }, // TODO:
      };

      const postsQueryPreviousData =
        queryClient.getQueryData<InfiniteData<GetPostsResponse>>(postsQueryKey);

      // Update the cache with our optimistic comment
      queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
        postsQueryKey,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              ...oldData,
              pages: [
                {
                  ...firstPage,
                  posts: [optimisticPost, ...firstPage.posts],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }

          return oldData;
        }
      );

      return { postsQueryPreviousData, mutationId };
    },
    onError: (_, __, context) => {
      if (context?.postsQueryPreviousData) {
        queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
          postsQueryKey,
          context.postsQueryPreviousData
        );
      }
    },
    onSuccess(data, _, context) {
      queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
        postsQueryKey,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            const index = firstPage.posts.findIndex(
              ({ id }) => id === context.mutationId
            );

            if (typeof index === "number" && index > -1) {
              const posts = [...firstPage.posts];

              posts[index] = data.post;

              return {
                ...oldData,
                pages: [{ ...firstPage, posts }, ...oldData.pages.slice(1)],
              };
            }
          }

          return oldData;
        }
      );
    },
  });
};
