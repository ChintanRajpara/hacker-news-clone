import { useState } from "react";
import { useCreatePost } from "../utils/mutations/useCreatePost";

export const CreatePostModal = () => {
  const [title, settitle] = useState("");
  const [url, seturl] = useState("");
  const [text, settext] = useState("");

  const { mutate } = useCreatePost();

  return (
    <div className="bg-orange-500">
      <h3>CreatePost</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          mutate({ title, url, text });
        }}
      >
        <div>
          title :
          <input
            required
            placeholder="title"
            value={title}
            onChange={(e) => {
              settitle(e.target.value);
            }}
          />
        </div>

        <div>
          url :
          <input
            placeholder="url"
            value={url}
            onChange={(e) => {
              seturl(e.target.value);
            }}
          />
        </div>

        <div>
          text :
          <input
            placeholder="text"
            value={text}
            onChange={(e) => {
              settext(e.target.value);
            }}
          />
        </div>

        <div>
          <button type={"submit"}>Create Post</button>
        </div>
      </form>
    </div>
  );
};
