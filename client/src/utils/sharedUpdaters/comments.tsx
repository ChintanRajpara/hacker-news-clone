import { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";
import nanoclone from "nanoclone";
import { CommentInfo, GetCommentsResponse } from "../../types/comment";

const commentsQueryKey = (postId: string) => ["comments", postId] as QueryKey;

export const sharedCommentUpdater = async ({
  queryClient,
  commentId,
  topLevelParentId,
  postId,
  commentUpdates,
  op,
  parentId, // parentId can be null for top-level comment
  clientMutationId,
}: {
  queryClient: QueryClient;
  commentId: string;
  topLevelParentId: string | undefined;
  postId: string;
  commentUpdates: Partial<CommentInfo>;
  op: "E" | "D" | "A";
  parentId?: string | null;
  clientMutationId?: string;
}) => {
  await queryClient.cancelQueries({ queryKey: commentsQueryKey(postId) });

  const commentsQueryPreviousData = queryClient.getQueryData<
    InfiniteData<GetCommentsResponse>
  >(commentsQueryKey(postId));

  queryClient.setQueryData<InfiniteData<GetCommentsResponse>>(
    commentsQueryKey(postId),
    (_oldData) => {
      const oldData = nanoclone(_oldData) as
        | InfiniteData<GetCommentsResponse, unknown>
        | undefined;

      if (!oldData) {
        if (op === "A" && !parentId) {
          return {
            pageParams: [null],
            pages: [
              { comments: [commentUpdates as CommentInfo], pageInfo: {} },
            ],
          };
        }

        return oldData;
      }

      // Handle top-level add directly
      if (op === "A" && !parentId) {
        oldData.pages[0].comments.unshift(commentUpdates as CommentInfo);
        return oldData;
      }

      // Locate the top-level comment page & index
      let pageIndex = -1;
      let commentIndex = -1;

      for (let i = 0; i < oldData.pages.length; i++) {
        const page = oldData.pages[i];
        for (let j = 0; j < page.comments.length; j++) {
          const comment = page.comments[j];
          if (comment.id === topLevelParentId) {
            pageIndex = i;
            commentIndex = j;
            break;
          }
        }
        if (pageIndex !== -1) break;
      }

      if (pageIndex !== -1 && commentIndex !== -1) {
        const comment = oldData.pages[pageIndex].comments[commentIndex];

        const updateRecursive = (node: CommentInfo): boolean => {
          if (op === "D" && node.id === commentId) {
            return true;
          }

          if (op === "E" && node.id === commentId) {
            Object.assign(node, commentUpdates);

            return false;
          }

          if (op === "A" && node.id === parentId) {
            node.replies = [
              commentUpdates as CommentInfo,
              ...(node.replies || []),
            ];
            return false;
          }

          node.replies = (node.replies || []).filter((child) => {
            return !updateRecursive(child);
          });

          return false;
        };

        const shouldDelete = updateRecursive(comment);

        if (op === "D" && shouldDelete) {
          oldData.pages[pageIndex].comments.splice(commentIndex, 1);
        }

        return oldData;
      }

      return oldData;
    }
  );

  return { commentsQueryPreviousData, clientMutationId };
};

export const sharedCommentFallbackUpdater = (
  queryClient: QueryClient,
  postId: string,
  context?: Awaited<ReturnType<typeof sharedCommentUpdater>>
) => {
  if (context?.commentsQueryPreviousData) {
    queryClient.setQueryData<InfiniteData<GetCommentsResponse>>(
      commentsQueryKey(postId),
      context.commentsQueryPreviousData
    );
  }
};
