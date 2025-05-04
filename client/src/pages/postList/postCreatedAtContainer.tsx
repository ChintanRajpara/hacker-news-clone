import { useMemo } from "react";
import { PostInfo } from "../../types/post";
import { useAppContext } from "../../utils/appContext/context";
import { formatDistanceToNow } from "date-fns";

export const PostCreatedAtContainer = ({ post }: { post: PostInfo }) => {
  const { auth } = useAppContext();
  const { author, createdAt } = post;

  const isAuthor = useMemo(
    () => auth.user?.id === author.id,
    [auth.user?.id, author.id]
  );

  return (
    <div className="underline underline-offset-2 text-xs">
      <p>
        <span className="font-bold text-sm">{`${
          isAuthor ? "You" : `${post.author.name}`
        }`}</span>
        {` created ${formatDistanceToNow(new Date(createdAt), {
          addSuffix: true,
        })}`}
      </p>
    </div>
  );
};
