import { useEffect, useRef } from "react";

export const useLoadMore = ({
  fetchNextPage,
  hasNextPage,
}: {
  hasNextPage: boolean;
  fetchNextPage: () => void;
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return {
    LoadMoreObserverComponent: () => <div ref={loadMoreRef} className="h-10" />,
  };
};
