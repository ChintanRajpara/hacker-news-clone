import {
  InfiniteData,
  QueryClient,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import clone from "nanoclone";
import {
  GetPostDetailResponse,
  GetPostsResponse,
  PostInfo,
} from "../types/post";

const postsQueryKey = () => ["posts"] as QueryKey;
const postDetailQueryKey = (id: string) => ["posts", id] as QueryKey;

export const sharedPostUpdater = async (
  queryClient: QueryClient,
  id: string,
  postUpdates: Partial<PostInfo>
) => {
  await queryClient.cancelQueries({ queryKey: postsQueryKey() });

  const postsQueryPreviousData = queryClient.getQueryData<
    InfiniteData<GetPostsResponse>
  >(postsQueryKey());

  queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
    postsQueryKey(),
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
    queryClient.getQueryData<GetPostDetailResponse>(postDetailQueryKey(id));

  if (postDetailQueryPreviousData) {
    queryClient.setQueryData<GetPostDetailResponse>(postDetailQueryKey(id), {
      ...postDetailQueryPreviousData,
      ...postUpdates,
    });
  }

  return { postsQueryPreviousData, postDetailQueryPreviousData };
};

export const sharedPostFallbackUpdater = (
  queryClient: QueryClient,
  id: string,
  context?: Awaited<ReturnType<typeof sharedPostUpdater>>
) => {
  if (context?.postsQueryPreviousData) {
    queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
      postsQueryKey(),
      context.postsQueryPreviousData
    );
  }

  if (context?.postDetailQueryPreviousData) {
    queryClient.setQueryData<GetPostDetailResponse>(
      postDetailQueryKey(id),
      context.postDetailQueryPreviousData
    );
  }
};

export const useEditPost = (id: string) => {
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

      return (await res.json()) as { post: PostInfo };
    },
    onMutate: (postUpdates) => sharedPostUpdater(queryClient, id, postUpdates),
    onError: (_, __, context) =>
      sharedPostFallbackUpdater(queryClient, id, context),
    onSuccess: () => {},
  });
};
