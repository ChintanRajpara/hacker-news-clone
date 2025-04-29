import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEditPost } from "../utils/mutations/useEditPost";
import { useState } from "react";
import { UIDialog } from "../components/dialog";
import { CreatePostModal } from "./createPost";

export type PostInfo = {
  author: string;
  comments_count: number;
  createdAt: string;
  text?: string;
  title: string;
  url?: string;
  votes: number;
  id: string;
};

export type GetPostsResponse = {
  posts: PostInfo[];
  pageInfo: {
    totalPages: number;
    totalPosts: number;
  };
};

const PostInfoContainer = ({ post }: { post: PostInfo }) => {
  const { mutate } = useEditPost(post.id);

  return (
    <div className="border border-blue-300">
      <p>id: {post.id}</p>
      <p>title: {post.title}</p>
      <p>url: {post.url}</p>
      <p>text: {post.text}</p>
      <p>comments_count: {post.comments_count}</p>
      <p>votes: {post.votes}</p>
      <p>author: {post.author}</p>
      <p>createdAt: {post.createdAt}</p>

      <button
        onClick={() => {
          mutate({ text: "new-eraff" });
        }}
      >
        Edit Post
      </button>
    </div>
  );
};

export const PostList = () => {
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  //   limit
  // cursor
  // sort
  // search

  // // TODO:
  // useInfiniteQuery({
  //   queryKey: ["posts"],
  // })

  const { data, isPending } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts`,
        { credentials: "include" }
      );
      return (await res.json()) as GetPostsResponse;
    },
  });

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
      {isPending ? (
        <p>loading...</p>
      ) : data?.posts?.length ? (
        <div>
          {data.posts.map((post) => (
            <PostInfoContainer post={post} key={post.id} />
          ))}
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
