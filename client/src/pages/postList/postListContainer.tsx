import { useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useRef, useState } from "react";
import { usePostList } from "../../utils/queries/usePostList";
import { useDebouncedEffect } from "../../utils/hooks/useDebouncedEffect";
import { postsQueryKey } from "../../utils/sharedUpdaters/posts";
import { AppHeader } from "../../components/appHeader";
import { LoadingBars } from "../../components/loadingBars";
import { HeadingContainer } from "./headingContainer";
import { PostItem } from "./postItem";

enum SortType {
  "new" = "new",
  "top" = "top",
  "best" = "best",
}

export const PostListContainer = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortType>(SortType.new);

  const [isEditingPostId, setIsEditingPostId] = useState<string | undefined>(
    undefined
  );
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { fetchNextPage, hasNextPage, isPending, posts, isFetchingNextPage } =
    usePostList({ search: debouncedSearch, sort });

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage]);

  useDebouncedEffect(
    ([search]) => {
      if (typeof search === "string") {
        setDebouncedSearch(search);
        setTimeout(() => {
          queryClient.resetQueries({
            queryKey: postsQueryKey(),
            exact: true,
            stale: true,
            type: "all",
          });
        }, 200);
      }
    },
    [search],
    500
  );

  return (
    <div>
      <AppHeader />

      <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-20 xl:mx-40 my-4 sm:my-6 md:my-10">
        <HeadingContainer {...{ search, setSearch, sort, setSort }} />

        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10">
          {isPending ? (
            <LoadingBars />
          ) : posts?.length ? (
            <div>
              <div className="flex gap-3 flex-col">
                <hr className="border-1 border-base-300" />
                {posts.map((post) => (
                  <Fragment key={post.id}>
                    <PostItem
                      {...{
                        post,
                        isEditingPostId,
                        setIsEditingPostId,
                        editTitle,
                        setEditTitle,
                        editText,
                        setEditText,
                      }}
                    />
                    <hr className="border-1 border-base-300" />
                  </Fragment>
                ))}
              </div>

              <div ref={loadMoreRef} className="h-20" />

              {isFetchingNextPage ? <LoadingBars /> : <></>}
            </div>
          ) : (
            <div>no data found</div>
          )}
        </div>
      </div>
    </div>
  );
};
