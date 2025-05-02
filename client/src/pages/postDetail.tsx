import { usePostDetail } from "../utils/queries/usePostDetail";
import { useAddComment } from "../utils/mutations/useAddComment";
import { useComments } from "../utils/queries/useComments";
import { CommentInfo } from "../types/comment";
import { useParams } from "react-router-dom";
import { useEditComment } from "../utils/mutations/useEditComment";
import { useDeleteComment } from "../utils/mutations/useDeleteComment";

const PostItem = ({
  comment,
  topLevelParentId,
}: {
  comment: CommentInfo;
  topLevelParentId: string;
}) => {
  const { mutate } = useAddComment();

  const { mutate: editMutate } = useEditComment(
    comment.id,
    topLevelParentId,
    comment.postId
  );

  const { mutate: deleteMutate } = useDeleteComment(
    comment.id,
    topLevelParentId,
    comment.postId
  );

  return (
    <div>
      <p>{comment.text}</p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            mutate({
              newComment: {
                postId: comment.postId,
                text: "hello world",
                parentId: comment.id,
              },
              topLevelParentId,
            });
          }}
        >
          Comment
        </button>

        <button
          onClick={() => {
            deleteMutate();
          }}
        >
          Delete
        </button>

        <button
          onClick={() => {
            editMutate({ text: `edited-${Math.random() * 10000}` });
          }}
        >
          Edit
        </button>
      </div>
      <div className="pl-10 flex flex-col">
        {comment.replies.map((reply) => {
          return (
            <PostItem
              key={reply.id}
              {...{ comment: reply, topLevelParentId }}
            />
          );
        })}
      </div>
    </div>
  );
};

const PostComments = ({ id }: { id: string }) => {
  const { comments } = useComments(id);

  const { mutate } = useAddComment();

  return (
    <div>
      <div>
        {comments?.map((comment) => {
          return (
            <PostItem
              key={comment.id}
              {...{ comment, topLevelParentId: comment.id }}
            />
          );
        })}
      </div>

      <div>
        <button
          onClick={() => {
            mutate({
              newComment: {
                postId: id,
                text: `hello world-${Math.random() * 10000}`,
              },
            });
          }}
        >
          Comment
        </button>
      </div>
    </div>
  );
};

const Post = ({ id }: { id: string }) => {
  const { post } = usePostDetail(id);

  return (
    <div>
      <p>{post?.title}</p>
      <p>{post?.author.name}</p>
      <p>{post?.text}</p>
      <p>{post?.url}</p>
      <p>{post?.id}</p>
      <PostComments {...{ id }} />
    </div>
  );
};

export const PostDetail = () => {
  const { id } = useParams();

  return id ? <Post {...{ id }} /> : <></>;
};
