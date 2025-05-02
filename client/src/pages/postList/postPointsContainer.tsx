import { useCallback } from "react";
import { useVotePost } from "../../utils/mutations/useVotePost";
import { PostInfo, VoteValue } from "../../types/post";
import { useAuthenticatedClick } from "../../utils/hooks/useAuthenticatedClick";
import { FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa6";

export const PostPointsContainer = ({ post }: { post: PostInfo }) => {
  const { id, votes, selfVoteValue } = post;

  const { mutate: votePostMutate } = useVotePost(id);

  const onUpvoteClick = useCallback(() => {
    const previous = selfVoteValue; // -1, 0, or 1
    const next = previous === 1 ? 0 : 1; // toggle between 1 and 0

    const delta = next - previous; // this handles all cases properly

    votePostMutate({
      selfVoteValue: next as VoteValue,
      votes: votes + delta,
    });
  }, [selfVoteValue, votes, votePostMutate]);

  const onDownvoteClick = useCallback(() => {
    const previous = selfVoteValue;
    const next = previous === -1 ? 0 : -1;

    const delta = next - previous;

    votePostMutate({
      selfVoteValue: next as VoteValue,
      votes: votes + delta,
    });
  }, [selfVoteValue, votes, votePostMutate]);

  const { authenticatedClick } = useAuthenticatedClick();

  return (
    <div className="flex gap-1 items-center justify-center">
      <div
        className="flex"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          onClick={() => authenticatedClick(() => onUpvoteClick())}
          className={`btn btn-ghost btn-xs btn-circle btn-success hover:text-success-content/75 ${
            selfVoteValue === 1 ? "hover:text-success-content text-success" : ""
          }`}
        >
          <FaRegThumbsUp size={16} />
        </button>

        <button
          onClick={() => authenticatedClick(() => onDownvoteClick())}
          className={`btn btn-ghost btn-xs btn-circle btn-error hover:text-success-content/75 ${
            selfVoteValue === -1 ? "hover:text-error-content text-error" : ""
          }`}
        >
          <FaRegThumbsDown size={16} />
        </button>
      </div>

      <div className="relative hover:underline underline-offset-2">
        <p>{votes} points</p>
      </div>
    </div>
  );
};
