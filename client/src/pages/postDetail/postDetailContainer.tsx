import { useParams } from "react-router-dom";
import { usePostDetail } from "../../utils/queries/usePostDetail";
import { LoadingBars } from "../../components/loadingBars";
import { PostInfo } from "../../types/post";
import { AppHeader } from "../../components/appHeader";
import { HeadingContainer } from "./headingContainer";
import { useComments } from "../../utils/queries/useComments";
import { CommentInfo } from "../../types/comment";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const CommentReplyContainer = ({
  comment,
  topLevelParentId,
}: {
  comment: CommentInfo;
  topLevelParentId?: string;
}) => {
  const [replying, setReplying] = useState(false);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <div>
          <p className="text-sm text-base-content/55 text-light">
            <span className="font-medium">{comment.author.name}</span>
            {` commented ${formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}`}
          </p>
        </div>

        <p className="text-md font-medium text-base-content">
          {/* {comment.text} */}
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>

        <div>
          {replying ? (
            <div className="flex flex-col gap-2 items-start">
              <textarea
                placeholder="share your thoughts..."
                className="textarea w-full "
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setReplying(false);
                  }}
                  className="btn btn-error text-error-content btn-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setReplying(false);
                  }}
                  className="btn btn-success text-success-content btn-xs"
                >
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p
                onClick={() => {
                  setReplying(true);
                }}
                className="link text-sm font-normal text-base-content"
              >
                Reply
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="pl-10 flex flex-col gap-4">
        {comment.replies.map((reply) => {
          return (
            <CommentReplyContainer
              key={reply.id}
              {...{
                comment: reply,
                topLevelParentId: topLevelParentId ?? comment.id,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const PostCommentsContainer = ({ post }: { post: PostInfo }) => {
  const { comments } = useComments(post.id);

  return comments?.length ? (
    <div>
      <div className="flex flex-col gap-2 items-start">
        <textarea
          placeholder="share your thoughts..."
          className="textarea w-full "
        ></textarea>

        <button className="btn btn-secondary btn-soft btn-sm">Comment</button>
      </div>
      <div className="mt-5">
        {comments.map((comment) => {
          return <CommentReplyContainer {...{ comment }} key={comment.id} />;
        })}
      </div>
    </div>
  ) : (
    <div>No comments</div>
  );
};

const PostQueryContainer = ({ id }: { id: string }) => {
  const { post, isPending } = usePostDetail(id);

  return (
    <div>
      <AppHeader />

      <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-20 xl:mx-40 my-4 sm:my-6 md:my-10">
        {isPending ? (
          <div>
            <LoadingBars />
          </div>
        ) : post ? (
          <div className="flex flex-col gap-6">
            <HeadingContainer {...{ post }} />
            <hr className="border-1 border-base-300" />
            <PostCommentsContainer {...{ post }} />
          </div>
        ) : (
          <div>post not found</div>
        )}
      </div>
    </div>
  );
};

const PostParamsValidator = () => {
  const { id } = useParams();

  return id ? <PostQueryContainer id={id} /> : <></>;
};

export default PostParamsValidator;
