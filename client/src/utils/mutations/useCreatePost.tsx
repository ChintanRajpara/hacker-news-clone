import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetPostsResponse, PostInfo } from "../../pages/postList";
import { nanoid } from "nanoid";

export const useCreatePost = () => {
  const postsQueryKey: QueryKey = ["posts"];

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: {
      title: string;
      url?: string;
      text?: string;
    }) => {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts`,
        {
          method: "POST",
          body: JSON.stringify(newPost),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return res.json();
    },
    onMutate: async (newPost) => {
      const mutationId = `clientMutationId:${nanoid()}`;

      await queryClient.cancelQueries({ queryKey: postsQueryKey });

      const postsQueryPreviousData =
        queryClient.getQueryData<GetPostsResponse>(postsQueryKey);

      if (postsQueryPreviousData) {
        const posts: PostInfo[] = [
          {
            ...newPost,
            id: mutationId,
            comments_count: 0,
            createdAt: new Date().getTime().toString(),
            votes: 0,
            author: "", // TODO:
          },
          ...postsQueryPreviousData.posts,
        ];

        queryClient.setQueryData(postsQueryKey, {
          ...postsQueryPreviousData,
          posts,
        });
      }

      return { postsQueryPreviousData, mutationId };
    },
    onError: (_, __, context) => {
      if (context?.postsQueryPreviousData) {
        queryClient.setQueryData(postsQueryKey, context.postsQueryPreviousData);
      }
    },
    onSuccess(data, _, context) {
      const postsQueryPreviousData =
        queryClient.getQueryData<GetPostsResponse>(postsQueryKey);

      if (postsQueryPreviousData) {
        const index = postsQueryPreviousData?.posts.findIndex(
          ({ id }) => id === context.mutationId
        );

        if (typeof index === "number" && index > -1) {
          const posts = [...postsQueryPreviousData.posts];

          posts[index] = data.post;

          queryClient.setQueryData(postsQueryKey, {
            ...postsQueryPreviousData,
            posts,
          });
        }
      }
    },
  });
};
