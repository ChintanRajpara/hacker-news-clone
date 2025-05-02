import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { PostInfo } from "../../types/post";
import { useEditPost } from "../../utils/mutations/useEditPost";
import { PostPointsContainer } from "../postList/postPointsContainer";
import { PostCreatedAtContainer } from "../postList/postCreatedAtContainer";
import { useAppContext } from "../../utils/appContext/context";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

export const HeadingContainer = ({ post }: { post: PostInfo }) => {
  const { auth } = useAppContext();
  const [editTitle, setEditTitle] = useState(post.title);
  const [editText, setEditText] = useState(post.text ?? "");

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);

  const { mutate } = useEditPost(post.id);

  useEffect(() => {
    setEditTitle(post.title);
  }, [setEditTitle, post.title]);

  useEffect(() => {
    setEditText(post.text ?? "");
  }, [setEditText, post.text]);

  const handleSubmit = useCallback(() => {
    mutate({ title: editTitle });

    setIsEditing(false);
  }, [editTitle, mutate, setIsEditing]);

  const handleSubmitText = useCallback(() => {
    mutate({ text: editText as string });

    setIsEditingText(false);
  }, [editText, mutate, setIsEditingText]);

  const isAuthor = useMemo(
    () => auth.user?.id === post.author.id,
    [auth.user?.id, post.author.id]
  );

  const { ExternalLinkWrapperComponent, props } = useMemo(() => {
    return post.url
      ? {
          ExternalLinkWrapperComponent: Link,
          props: {
            target: "_blank",
            to: post.url,
          } as { target: string; to: string; className: string },
        }
      : {
          ExternalLinkWrapperComponent: Fragment,
          props: {} as {
            target: string;
            to: string;
          },
        };
  }, [post.url]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full [&>*]:w-full [&>*]:px-2">
        {isEditing ? (
          <input
            autoFocus
            onBlur={() => {
              handleSubmit();
            }}
            value={editTitle}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setEditTitle(post.title);
                setIsEditing(false);
              } else if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            onChange={(e) => {
              setEditTitle(e.target.value);
            }}
            className="input font-extrabold text-4xl border-0 outline-neutral outline"
          />
        ) : (
          <p
            onClick={() => {
              if (isAuthor) {
                setIsEditing(true);
              }
            }}
            className={`font-extrabold text-4xl ${
              isAuthor ? "cursor-pointer" : ""
            }`}
          >
            {post.title}
          </p>
        )}
      </div>

      <div className="flex w-full [&>*]:w-full [&>*]:px-2 ">
        {isEditingText ? (
          <input
            autoFocus
            onBlur={() => {
              handleSubmitText();
            }}
            value={editText}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setEditText(post.text ?? "");
                setIsEditingText(false);
              } else if (e.key === "Enter") {
                handleSubmitText();
              }
            }}
            onChange={(e) => {
              setEditText(e.target.value);
            }}
            className="input font-medium text-xl border-0 outline-neutral outline"
          />
        ) : (
          <p
            onClick={() => {
              if (isAuthor) {
                setIsEditingText(true);
              }
            }}
            className={`font-medium text-xl ${
              isAuthor ? "cursor-pointer" : ""
            } py-1.5 `}
          >
            {post.text}
          </p>
        )}
      </div>

      <div className="px-2 flex flex-col sm:flex-row gap-1 text-info-content fill-info-content sm:justify-between sm:items-center">
        <div className="flex items-center justify-start gap-2 text-md">
          <PostPointsContainer {...{ post }} />

          <div>|</div>

          <div className="hover:underline underline-offset-2">{`${post.comments_count} comments`}</div>

          <div>|</div>

          <div>
            <ExternalLinkWrapperComponent {...props}>
              <button className="btn btn-sm btn-secondary text-secondary-content btn-circle">
                <FaExternalLinkAlt />
              </button>
            </ExternalLinkWrapperComponent>
          </div>
        </div>

        <PostCreatedAtContainer {...{ post }} />
      </div>
    </div>
  );
};
