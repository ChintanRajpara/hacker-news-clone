import { usePostDetail } from "../utils/queries/usePostDetail";
import { useCreateComment } from "../utils/mutations/useCreateComment";
import { useComments } from "../utils/queries/useComments";
import { CommentInfo } from "../utils/types/comments";
import { useParams } from "react-router-dom";
import { useEditComment } from "../utils/mutations/useEditComment";
import { useDeleteComment } from "../utils/mutations/useDeleteComment";

const PostItem = ({ comment }: { comment: CommentInfo }) => {
  const { mutate } = useCreateComment();

  const { mutate: editMutate } = useEditComment(comment.id);

  const { mutate: deleteMutate } = useDeleteComment(comment.id);

  return (
    <div>
      <p>{comment.text}</p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            mutate({
              postId: comment.postId,
              text: "hello world",
              parentId: comment.id,
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
            editMutate({ text: "edited" });
          }}
        >
          Edit
        </button>
      </div>
      <div className="pl-10 flex flex-col">
        {comment.replies.map((reply) => {
          return <PostItem key={reply.id} {...{ comment: reply }} />;
        })}
      </div>
    </div>
  );
};

const PostComments = ({ id }: { id: string }) => {
  const { comments } = useComments(id);

  const { mutate } = useCreateComment();

  return (
    <div>
      <div>
        {comments?.map((comment) => {
          return <PostItem key={comment.id} {...{ comment }} />;
        })}
      </div>

      <div>
        <button
          onClick={() => {
            mutate({ postId: id, text: "hello world" });
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
      <PostComments {...{ id }} />
    </div>
  );
};

export const PostDetail = () => {
  const { id } = useParams();

  return id ? <Post {...{ id }} /> : <></>;
};
