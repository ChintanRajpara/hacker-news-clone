import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const PostComments = () => {
  const { id } = useParams();

  const { data } = useQuery({
    queryKey: ["post-comments", id],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/comments/${id}`,
        { credentials: "include" }
      );
      return await res.json();
    },
  });

  console.log(data, "PostComments");

  return <div>PostComments</div>;
};

export const PostDetail = () => {
  const { id } = useParams();

  const { data } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/posts/${id}`,
        { credentials: "include" }
      );
      return await res.json();
    },
  });

  console.log(data, "PostDetail");

  return (
    <div>
      <PostComments />
    </div>
  );
};
