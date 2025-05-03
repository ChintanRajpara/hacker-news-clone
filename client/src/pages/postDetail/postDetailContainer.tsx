import { useParams } from "react-router-dom";
import { usePostDetail } from "../../utils/queries/usePostDetail";
import { LoadingBars } from "../../components/loadingBars";
import { PostInfo } from "../../types/post";
import { AppHeader } from "../../components/appHeader";
import { HeadingContainer } from "./headingContainer";
import { useComments } from "../../utils/queries/useComments";
import { CommentInfo } from "../../types/comment";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { useAddComment } from "../../utils/mutations/useAddComment";
import { EditableParagraph } from "../../components/editableParagraph";
import { useAppContext } from "../../utils/appContext/context";
import { useEditComment } from "../../utils/mutations/useEditComment";

const CommentReplyContainer = ({
  comment,
  topLevelParentId,
}: {
  comment: CommentInfo;
  topLevelParentId?: string;
}) => {
  const { auth } = useAppContext();

  const [replying, setReplying] = useState(false);

  const [hideComment, setHideComment] = useState(false);

  const [replyText, setReplyText] = useState("");

  const { mutate: editCommentMutate } = useEditComment(
    comment.id,
    topLevelParentId,
    comment.postId
  );
  const { mutate: addCommentMutate } = useAddComment();

  const isAuthor = useMemo(
    () => comment.author.id === auth.user?.id,
    [comment.author.id, auth.user?.id]
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <div className="text-sm text-base-content/65 text-light flex gap-3">
          <p>
            <span className="font-medium">{comment.author.name}</span>
            {` commented ${formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}`}
          </p>

          <div>|</div>

          <p
            className="link link-base text-sm text-base-content/65 text-light"
            onClick={() => {
              setHideComment((s) => !s);
            }}
          >
            {hideComment
              ? "show comment and replies"
              : "hide comment and replies"}
          </p>
        </div>

        {hideComment ? (
          <></>
        ) : (
          <>
            {isAuthor ? (
              <EditableParagraph
                {...{
                  onChange: (text) => editCommentMutate({ text }),
                  value: comment.text,
                  className: "text-md font-medium text-base-content",
                }}
              />
            ) : (
              <p className="text-md font-medium text-base-content">
                {comment.text}
              </p>
            )}

            <div>
              {replying ? (
                <div className="flex flex-col gap-2 items-start">
                  <textarea
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                    }}
                    placeholder="share your thoughts..."
                    className="textarea w-full "
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReplyText("");
                        setReplying(false);
                      }}
                      className="btn btn-error text-error-content btn-xs"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        const text = replyText;

                        addCommentMutate({
                          topLevelParentId,
                          newComment: {
                            text,
                            parentId: comment.id,
                            postId: comment.postId,
                          },
                        });

                        setReplyText("");
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
                    onClick={() => setReplying(true)}
                    className="link text-sm font-normal text-base-content"
                  >
                    Reply
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {hideComment ? (
        <></>
      ) : (
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
      )}
    </div>
  );
};

const PostCommentsContainer = ({ post }: { post: PostInfo }) => {
  const [newCommentText, setNewCommentText] = useState("");

  const { comments } = useComments(post.id);

  const { mutate } = useAddComment();

  return comments?.length ? (
    <div>
      <div className="flex flex-col gap-2 items-start">
        <textarea
          value={newCommentText}
          placeholder="share your thoughts..."
          className="textarea w-full "
          onChange={(e) => {
            setNewCommentText(e.target.value);
          }}
        ></textarea>

        <button
          onClick={() => {
            const text = newCommentText;

            mutate({ newComment: { postId: post.id, text } });

            setNewCommentText("");
          }}
          className="btn btn-secondary btn-soft btn-sm"
        >
          Comment
        </button>
      </div>
      <div className="mt-5">
        {comments.map((comment) => (
          <CommentReplyContainer
            {...{ comment, topLevelParentId: comment.id }}
            key={comment.id}
          />
        ))}
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
