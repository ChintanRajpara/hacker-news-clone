import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { postsQueryKey } from "../../utils/sharedUpdaters/posts";
// import { SortType } from "../../types/posts";

enum SortType {
  "new" = "new",
  "top" = "top",
  "best" = "best",
}

const postPageHeading = {
  [SortType.new]: "Latest Buzz & Threads",
  [SortType.top]: "Community Favorites",
  [SortType.best]: "Smart & Trending",
};

export const HeadingContainer = ({
  search,
  setSearch,
  sort,
  setSort,
}: {
  search: string;
  sort: SortType;
  setSort: Dispatch<SetStateAction<SortType>>;
  setSearch: Dispatch<SetStateAction<string>>;
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isK = e.key.toLowerCase() === "k";
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && isK) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.title = `Hacker News - ${postPageHeading[sort]}`;
  }, [sort]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
      <div>
        <p className="font-extrabold text-4xl">{postPageHeading[sort]}</p>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div>
          <label className="input">
            <FaMagnifyingGlass className="opacity-50 h-[1em]" />
            <input
              ref={searchInputRef}
              type="search"
              className="grow"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <kbd className="kbd kbd-sm">⌘</kbd>
            <kbd className="kbd kbd-sm">K</kbd>
          </label>
        </div>

        <div>
          <select
            className="select w-24"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortType);
              setTimeout(() => {
                queryClient.resetQueries({
                  queryKey: postsQueryKey(),
                  exact: true,
                  stale: true,
                  type: "all",
                });
              }, 200);
            }}
          >
            <option value={SortType.new}>New</option>
            <option value={SortType.top}>Top</option>
            <option value={SortType.best}>Best</option>
          </select>
        </div>
      </div>
    </div>
  );
};
