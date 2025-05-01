import { useState } from "react";
import { useAppContext } from "../utils/appContext/context";
import { Dialog } from "./dialog";
import { useCreatePost } from "../utils/mutations/useCreatePost";

export const CreatePostDialog = () => {
  const { createPostDialogOpen, setCreatePostDialogOpen } = useAppContext();

  const [title, settitle] = useState("");
  const [url, seturl] = useState("");
  const [text, settext] = useState("");

  const { mutate } = useCreatePost();

  return (
    <Dialog
      modalClassName="flex items-center justify-center"
      open={createPostDialogOpen}
      requestClose={() => {
        setCreatePostDialogOpen(false);
      }}
    >
      <div>
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
    </Dialog>
  );
};
