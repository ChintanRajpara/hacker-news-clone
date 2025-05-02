import { Dispatch, Fragment, SetStateAction, useEffect, useMemo } from "react";
import { PostInfo } from "../../types/post";
import { useAppContext } from "../../utils/appContext/context";
import { useEditPost } from "../../utils/mutations/useEditPost";
import { useDeletePost } from "../../utils/mutations/useDeletePost";
import { Link } from "react-router-dom";
import { FaCheck, FaEllipsisVertical, FaXmark } from "react-icons/fa6";
import { PostPointsContainer } from "./postPointsContainer";
import { PostCreatedAtContainer } from "./postCreatedAtContainer";

export const PostItem = ({
  post,
  isEditingPostId,
  setIsEditingPostId,
  editTitle,
  setEditTitle,
  editText,
  setEditText,
}: {
  post: PostInfo;
  isEditingPostId: string | undefined;
  setIsEditingPostId: Dispatch<SetStateAction<string | undefined>>;
  editTitle: string;
  setEditTitle: Dispatch<SetStateAction<string>>;
  editText: string;
  setEditText: Dispatch<SetStateAction<string>>;
}) => {
  const { auth } = useAppContext();
  const { id, title, text, author, comments_count, url } = post;

  const isEditing = useMemo(
    () => isEditingPostId === id,
    [isEditingPostId, id]
  );

  useEffect(() => {
    if (isEditing) {
      setEditTitle(title);
    }
  }, [title, setEditTitle, isEditing]);

  useEffect(() => {
    if (isEditing) {
      setEditText(text || "");
    }
  }, [text, setEditText, isEditing]);

  const isAuthor = useMemo(
    () => auth.user?.id === author.id,
    [auth.user?.id, author.id]
  );

  const { mutate: editPostMutate } = useEditPost(id);

  const { mutate: deletePostMutate } = useDeletePost(id);

  const { WrapperComponent, props } = useMemo(() => {
    return url && !isEditing
      ? {
          WrapperComponent: Link,
          props: {
            target: "_blank",
            to: url,
            className: "flex flex-1",
          } as { target: string; to: string; className: string },
        }
      : {
          WrapperComponent: Fragment,
          props: {} as {
            target: string;
            to: string;
            className: string;
          },
        };
  }, [url, isEditing]);

  const _handleCloseEdit = () => {
    setIsEditingPostId("");
    setEditTitle("");
    setEditText("");
  };

  return (
    <div
      className={`pt-3 py-1 px-1 rounded-xl flex flex-col ${
        isEditing ? "bg-base-300" : "hover:bg-base-300"
      } `}
    >
      <div className="flex gap-3">
        <WrapperComponent {...props}>
          <div
            className={`[&>*]:px-2 [&>*]:h-[36px] [&>*]:w-full gap-2 flex flex-1 flex-col ${
              isEditing
                ? "[&>*]:border-0 [&>*]:outline-neutral [&>*]:outline"
                : "[&>*]:flex [&>*]:items-center"
            }`}
          >
            {isEditing ? (
              <input
                autoFocus
                className="input font-bold text-xl"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                }}
              />
            ) : (
              <p className="font-bold text-xl">{title}</p>
            )}

            {isEditing ? (
              <input
                className="input text-lg"
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                }}
              />
            ) : (
              <p className="text-lg">{text}</p>
            )}
          </div>
        </WrapperComponent>

        {isAuthor ? (
          <div
            className="flex items-start justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {isEditing ? (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const update = { text: editText, title: editTitle };
                    editPostMutate(update);
                    _handleCloseEdit();
                  }}
                  className="btn btn-success text-success-content btn-circle btn-sm"
                >
                  <FaCheck />
                </button>

                <button
                  onClick={() => _handleCloseEdit()}
                  className="btn btn-error text-error-content btn-circle btn-sm"
                >
                  <FaXmark />
                </button>
              </div>
            ) : (
              <div className="dropdown dropdown-bottom dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-secondary btn-sm btn-circle"
                >
                  <FaEllipsisVertical />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-200 text-base-content rounded-box z-1 w-52 p-2 shadow-sm"
                >
                  <li onClick={() => setIsEditingPostId(id)}>
                    <a>Edit</a>
                  </li>
                  <li
                    onClick={() => {
                      deletePostMutate();
                    }}
                  >
                    <a>Delete</a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>

      <Link to={`/post/${id}`}>
        <div className="p-2 flex flex-col sm:flex-row gap-1 text-info-content fill-info-content sm:justify-between sm:items-center">
          <div className="flex items-center justify-start gap-2 text-sm">
            <PostPointsContainer {...{ post }} />

            <div>|</div>

            <div className="hover:underline underline-offset-2">{`${comments_count} comments`}</div>
          </div>

          <PostCreatedAtContainer {...{ post }} />
        </div>
      </Link>
    </div>
  );
};
