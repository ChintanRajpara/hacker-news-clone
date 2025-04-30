import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { GetPostsResponse } from "../../pages/postList";
import clone from "nanoclone";

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
        queryClient.getQueryData<InfiniteData<GetPostsResponse>>(postsQueryKey);

      queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
        postsQueryKey,
        (_oldData) => {
          const oldData = clone(_oldData) as
            | InfiniteData<GetPostsResponse, unknown>
            | undefined;

          if (oldData) {
            let pageIndex = -1;
            let postIndex = -1;

            for (let i = 0; i < oldData.pages.length; i++) {
              const page = oldData.pages[i];
              for (let j = 0; j < page.posts.length; j++) {
                const post = page.posts[j];

                if (post.id == id) {
                  pageIndex = i;
                  postIndex = j;
                  break;
                }
              }

              if (pageIndex !== -1) break; // Break outer loop if match found
            }

            if (pageIndex !== -1 && postIndex !== -1) {
              const pagePost = oldData.pages?.[pageIndex].posts;

              if (pagePost) {
                const posts = [...pagePost];

                posts[postIndex] = { ...posts[postIndex], ...postUpdates };

                oldData.pages[pageIndex] = {
                  ...oldData.pages[pageIndex],
                  posts,
                };

                return oldData;
              }
            }
          }

          return oldData;
        }
      );

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
        queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
          postsQueryKey,
          context.postsQueryPreviousData
        );
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
