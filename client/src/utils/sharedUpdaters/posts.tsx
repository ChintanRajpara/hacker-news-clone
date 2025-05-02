import { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";
import {
  GetPostDetailResponse,
  GetPostsResponse,
  PostInfo,
} from "../../types/post";
import nanoclone from "nanoclone";

export const postsQueryKey = () => ["posts"] as QueryKey;
const postDetailQueryKey = (id: string) => ["post-detail", id] as QueryKey;

export const sharedPostUpdater = async ({
  queryClient,
  postId,
  postUpdates,
  op,
  clientMutationId,
}: {
  queryClient: QueryClient;
  postId: string;
  postUpdates: Partial<PostInfo>;
  op: "A" | "E" | "D";
  clientMutationId?: string;
}) => {
  await queryClient.cancelQueries({ queryKey: postsQueryKey() });

  const postsQueryPreviousData = queryClient.getQueryData<
    InfiniteData<GetPostsResponse>
  >(postsQueryKey());

  queryClient.setQueryData<InfiniteData<GetPostsResponse>>(
    postsQueryKey(),
    (_oldData) => {
      const oldData = nanoclone(_oldData) as typeof _oldData;

      if (!oldData) return oldData;

      if (op === "A") {
        oldData.pages[0].posts.unshift(postUpdates as PostInfo);
        return oldData;
      }

      for (let i = 0; i < oldData.pages.length; i++) {
        const page = oldData.pages[i];
        const index = page.posts.findIndex((p) =>
          clientMutationId ? p.id === clientMutationId : p.id === postId
        );

        if (index !== -1) {
          if (op === "E") {
            page.posts[index] = {
              ...page.posts[index],
              ...postUpdates,
            } as PostInfo;
          } else if (op === "D") {
            page.posts.splice(index, 1);
          }
          oldData.pages[i] = { ...page };

          break;
        }
      }

      return nanoclone(oldData) as typeof _oldData;
    }
  );

  const postDetailQueryPreviousData =
    queryClient.getQueryData<GetPostDetailResponse>(postDetailQueryKey(postId));

  if (postDetailQueryPreviousData && op === "E") {
    queryClient.setQueryData<GetPostDetailResponse>(
      postDetailQueryKey(postId),
      {
        ...postDetailQueryPreviousData,
        post: {
          ...postDetailQueryPreviousData.post,
          ...postUpdates,
        },
      }
    );
  }

  if (op === "D") {
    queryClient.removeQueries({ queryKey: postDetailQueryKey(postId) });
  }

  return {
    postsQueryPreviousData,
    postDetailQueryPreviousData,
    clientMutationId,
  };
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
