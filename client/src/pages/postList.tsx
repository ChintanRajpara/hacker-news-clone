import { useEditPost } from "../utils/mutations/useEditPost";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../utils/hooks/useDebounce";
import { usePostList } from "../utils/queries/usePostList";
import { PostInfo, voteValue } from "../utils/types/post";
import { useVotePost } from "../utils/mutations/useVotePost";
import { useDeletePost } from "../utils/mutations/useDeletePost";

const PostInfoContainer = ({ post }: { post: PostInfo }) => {
  const { mutate: editPostMutate } = useEditPost(post.id);
  const { mutate: votePostMutate } = useVotePost(post.id);
  const { mutate: deletePostMutate } = useDeletePost(post.id);
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
      <p>selfVoteValue: {post.selfVoteValue}</p>
      <p>createdAt: {post.createdAt.toString()}</p>

      <div className="flex gap-2">
        <button
          onClick={() => {
            deletePostMutate();
          }}
          className="btn"
        >
          Delete Post
        </button>

        <button
          className="btn"
          onClick={() => {
            const previous = post.selfVoteValue; // -1, 0, or 1
            const next = previous === 1 ? 0 : 1; // toggle between 1 and 0

            const delta = next - previous; // this handles all cases properly

            votePostMutate({
              selfVoteValue: next as voteValue,
              votes: post.votes + delta,
            });
          }}
        >
          {post.selfVoteValue === 1 ? "Unvote" : "Upvote"}
        </button>

        <button
          className="btn"
          onClick={() => {
            const previous = post.selfVoteValue;
            const next = previous === -1 ? 0 : -1;

            const delta = next - previous;

            votePostMutate({
              selfVoteValue: next as voteValue,
              votes: post.votes + delta,
            });
          }}
        >
          {post.selfVoteValue === -1 ? "Unvote" : "downvote"}
        </button>

        <button
          className="btn"
          onClick={() => {
            editPostMutate({ text: `new-eraff-${Math.random() * 10000}` });
          }}
        >
          Edit Post
        </button>
      </div>
    </div>
  );
};

export const PostList = () => {
  const [search, setSearch] = useState("");
  const searchRef = useRef(search);
  const debouncedSearch = useDebounce(search, 500);

  const [sort, setSort] = useState<"new" | "top" | "best">("new");

  const { fetchNextPage, hasNextPage, isPending, posts, refetch } = usePostList(
    { search: debouncedSearch, sort }
  );

  useEffect(() => {
    refetch();
  }, [refetch, sort, debouncedSearch]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  return (
    <div>
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
    </div>
  );
};
