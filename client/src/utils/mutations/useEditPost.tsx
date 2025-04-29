import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetPostsResponse } from "../../pages/postList";

export const useEditPost = (id: string) => {
  const postsQueryKey: QueryKey = ["posts"];
  const postDetailQueryKey: QueryKey = ["posts", id];

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postUpdates: {
      title?: string;
      url?: string;
      text?: string;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(postUpdates),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      return res.json();
    },
    onMutate: async (postUpdates) => {
      await queryClient.cancelQueries({ queryKey: postsQueryKey });

      const postsQueryPreviousData =
        queryClient.getQueryData<GetPostsResponse>(postsQueryKey);

      if (postsQueryPreviousData) {
        const index = postsQueryPreviousData.posts.findIndex(
          ({ id: _id }) => id === _id
        );

        if (typeof index === "number" && index > -1) {
          const posts = [...postsQueryPreviousData.posts];

          posts[index] = {
            ...posts[index],
            ...postUpdates,
          };

          queryClient.setQueryData(postsQueryKey, {
            ...postsQueryPreviousData,
            posts,
          });
        }
      }

      const postDetailQueryPreviousData =
        queryClient.getQueryData(postDetailQueryKey);

      if (postDetailQueryPreviousData) {
        queryClient.setQueryData(postDetailQueryKey, {
          ...postDetailQueryPreviousData,
          postUpdates,
        });
      }

      return { postsQueryPreviousData, postDetailQueryPreviousData };
    },
    onError: (_, __, context) => {
      if (context?.postsQueryPreviousData) {
        queryClient.setQueryData(postsQueryKey, context.postsQueryPreviousData);
      }

      if (context?.postDetailQueryPreviousData) {
        queryClient.setQueryData(
          postDetailQueryKey,
          context.postDetailQueryPreviousData
        );
      }
    },
    onSuccess: () => {},
  });
};
