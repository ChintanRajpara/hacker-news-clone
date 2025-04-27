import { Schema, model } from "mongoose";

interface IUserPostVote {
  userId: string;
  postId: string;
  voteValue: number; // +1 for upvote, -1 for downvote
}

const userPostVoteSchema = new Schema<IUserPostVote>({
  userId: { type: String, required: true },
  postId: { type: String, required: true },
  voteValue: { type: Number, required: true, enum: [-1, 1] }, // Either -1 or 1
});

const PostVote = model<IUserPostVote>("UserPostVote", userPostVoteSchema);

export default PostVote;
