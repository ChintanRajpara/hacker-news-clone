import { useEditPost } from "../utils/mutations/useEditPost";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebounce } from "../utils/hooks/useDebounce";
import { usePostList } from "../utils/queries/usePostList";
import { PostInfo, voteValue } from "../utils/types/post";
import { useVotePost } from "../utils/mutations/useVotePost";
import { useDeletePost } from "../utils/mutations/useDeletePost";
import { AppHeader } from "../components/appHeader";
import {
  FaMagnifyingGlass,
  FaRegThumbsDown,
  FaRegThumbsUp,
} from "react-icons/fa6";
import { useLoadMore } from "../utils/hooks/useLoadMore";
import { useAppContext } from "../utils/appContext/context";
import { useAuthenticatedClick } from "../utils/hooks/useAuthenticatedClick";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const PostItem = ({ post }: { post: PostInfo }) => {
  const { auth } = useAppContext();
  const {
    id,
    title,
    text,
    votes,
    selfVoteValue,
    author,
    comments_count,
    createdAt,
    url,
  } = post;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editText, setEditText] = useState(post.text || "");

  const isAuthor = useMemo(
    () => auth.user?.id === post.author.id,
    [auth.user?.id, post.author.id]
  );

  const { mutate: editPostMutate } = useEditPost(id);
  const { mutate: votePostMutate } = useVotePost(id);
  const { mutate: deletePostMutate } = useDeletePost(id);

  const onUpvoteClick = useCallback(() => {
    const previous = post.selfVoteValue; // -1, 0, or 1
    const next = previous === 1 ? 0 : 1; // toggle between 1 and 0

    const delta = next - previous; // this handles all cases properly

    votePostMutate({
      selfVoteValue: next as voteValue,
      votes: post.votes + delta,
    });
  }, [post.selfVoteValue, post.votes, votePostMutate]);

  const onDownvoteClick = useCallback(() => {
    const previous = post.selfVoteValue;
    const next = previous === -1 ? 0 : -1;

    const delta = next - previous;

    votePostMutate({
      selfVoteValue: next as voteValue,
      votes: post.votes + delta,
    });
  }, [post.selfVoteValue, post.votes, votePostMutate]);

  const { authenticatedClick } = useAuthenticatedClick();

  const { WrapperComponent, props } = useMemo(() => {
    return url
      ? { WrapperComponent: "a", props: { target: "_blank", href: url } }
      : { WrapperComponent: Fragment, props: {} };
  }, [url]);

  return (
    <WrapperComponent {...props}>
      <div className="pt-3 py-1 px-1 rounded-xl flex flex-col hover:bg-base-300">
        <div className="gap-2 px-2">
          <p className="font-bold text-xl">{title}</p>

          <p className="text-lg">{text}</p>
        </div>

        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Link to={`/post/${id}`}>
            <div className="p-2 flex flex-col sm:flex-row gap-1 text-info-content fill-info-content sm:justify-between sm:items-center">
              <div className="flex items-center justify-start gap-2 text-sm">
                <div className="flex gap-1 items-center justify-center">
                  <div
                    className="flex"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <button
                      onClick={() => authenticatedClick(() => onUpvoteClick())}
                      className={`btn btn-ghost btn-xs btn-circle btn-success ${
                        selfVoteValue === 1
                          ? "hover:text-success-content text-success"
                          : ""
                      }`}
                    >
                      <FaRegThumbsUp />
                    </button>

                    <button
                      onClick={() =>
                        authenticatedClick(() => onDownvoteClick())
                      }
                      className={`btn btn-ghost btn-xs btn-circle btn-error ${
                        selfVoteValue === -1
                          ? "hover:text-error-content text-error"
                          : ""
                      }`}
                    >
                      <FaRegThumbsDown />
                    </button>
                  </div>

                  <div className="relative hover:underline underline-offset-2">
                    <p>{votes} points</p>
                  </div>
                </div>

                <div>|</div>

                <div className="hover:underline underline-offset-2">{`${comments_count} comments`}</div>
              </div>

              <div className="hover:underline underline-offset-2 text-xs">
                {`Created ${formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                })}`}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </WrapperComponent>
  );
};

enum SortType {
  "new" = "new",
  "top" = "top",
  "best" = "best",
}
const heading = {
  [SortType.new]: "Latest Buzz & Threads",
  [SortType.top]: "Community Favorites",
  [SortType.best]: "Smart & Trending",
};

const HeadingContainer = ({
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

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
      <div>
        <p className="font-extrabold text-5xl">{heading[sort]}</p>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div>
          <label className="input">
            <FaMagnifyingGlass size={24} className="opacity-50 h-[1em]" />
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

export const PostList = () => {
  const [search, setSearch] = useState("");

  const searchRef = useRef(search);

  const debouncedSearch = useDebounce(search, 500);

  const [sort, setSort] = useState<SortType>(SortType.new);

  const {
    fetchNextPage,
    hasNextPage,
    isPending,
    posts,
    refetch,
    isFetchingNextPage,
  } = usePostList({ search: debouncedSearch, sort });

  useEffect(() => {
    refetch();
  }, [refetch, sort, debouncedSearch]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const { LoadMoreObserverComponent } = useLoadMore({
    fetchNextPage,
    hasNextPage,
  });

  return (
    <div>
      <AppHeader />

      <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-20 xl:mx-40 my-4 sm:my-6 md:my-10">
        <HeadingContainer {...{ search, setSearch, sort, setSort }} />

        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10">
          {isPending ? (
            <div className="flex items-center justify-center">
              <span className="loading loading-bars loading-xl"></span>
            </div>
          ) : posts?.length ? (
            <div>
              <div className="flex gap-3 flex-col">
                <hr className="border-1 border-base-300" />
                {posts.map((post) => (
                  <Fragment key={post.id}>
                    <PostItem post={post} />
                    <hr className="border-1 border-base-300" />
                  </Fragment>
                ))}
              </div>
              <LoadMoreObserverComponent />

              {isFetchingNextPage ? (
                <div className="flex items-center justify-center">
                  <span className="loading loading-bars loading-xl"></span>
                </div>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <div>no data found</div>
          )}
        </div>
      </div>
    </div>
  );
};
