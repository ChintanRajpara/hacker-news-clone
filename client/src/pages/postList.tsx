import { useEditPost } from "../utils/mutations/useEditPost";
import { useEffect, useRef, useState } from "react";
import { UIDialog } from "../components/dialog";
import { CreatePostModal } from "./createPost";
import { useDebounce } from "../utils/hooks/useDebounce";
import { usePostList } from "../utils/queries/usePostList";
import { PostInfo } from "../utils/types/post";

const PostInfoContainer = ({ post }: { post: PostInfo }) => {
  const { mutate } = useEditPost(post.id);

  return (
    <div className="border-b">
      <p>id: {post.id}</p>
      <p>title: {post.title}</p>
      <p>url: {post.url}</p>
      <p>text: {post.text}</p>
      <p>comments_count: {post.comments_count}</p>
      <p>votes: {post.votes}</p>
      <p>
        author: {post.author.id}- {post.author.name}
      </p>
      <p>createdAt: {post.createdAt.toString()}</p>

      <button
        onClick={() => {
          mutate({ text: `new-eraff-${Math.random() * 10000}` });
        }}
      >
        Edit Post
      </button>
    </div>
  );
};

export const PostList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [sort, setSort] = useState<"new" | "top" | "best">("new");

  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const { fetchNextPage, hasNextPage, isPending, posts, refetch } = usePostList(
    { search: debouncedSearch, sort }
  );

  useEffect(() => {
    refetch();
  }, [refetch, sort, debouncedSearch]);

  return (
    <div>
      <div>
        <button
          onClick={() => {
            setCreatePostModalOpen(true);
          }}
        >
          Create Post
        </button>
      </div>

      <div>
        <input
          placeholder="search.."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />

        <button onClick={() => setSearch("")} disabled={!search}>
          clear search
        </button>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as typeof sort);
          }}
        >
          <option value="new">new</option>
          <option value="top">top</option>
          <option value="best">best</option>
        </select>
      </div>

      <hr />

      {isPending ? (
        <p>loading...</p>
      ) : posts?.length ? (
        <div>
          {posts.map((post) => (
            <PostInfoContainer post={post} key={post.id} />
          ))}

          {hasNextPage ? (
            <div
              onClick={() => {
                fetchNextPage();
              }}
            >
              <button>load more posts</button>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div>no data found</div>
      )}

      <UIDialog
        modalClassName="flex items-center justify-center"
        open={createPostModalOpen}
        requestClose={() => {
          setCreatePostModalOpen(false);
        }}
      >
        <CreatePostModal />
      </UIDialog>
    </div>
  );
};
