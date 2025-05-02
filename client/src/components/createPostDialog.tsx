import { useCallback, useState } from "react";
import { useAppContext } from "../utils/appContext/context";
import { Dialog } from "./dialog";
import { useCreatePost } from "../utils/mutations/useCreatePost";
import { FaXmark } from "react-icons/fa6";

export const CreatePostDialog = () => {
  const { createPostDialogOpen, setCreatePostDialogOpen } = useAppContext();

  const [title, settitle] = useState("");
  const [url, seturl] = useState("");
  const [text, settext] = useState("");

  const { mutate } = useCreatePost({
    onSuccess: () => {
      setCreatePostDialogOpen(false);
    },
  });

  const _handleClose = useCallback(() => {
    settitle("");
    seturl("");
    settext("");

    setCreatePostDialogOpen(false);
  }, [settitle, seturl, settext, setCreatePostDialogOpen]);

  return (
    <Dialog
      modalClassName="flex items-center justify-center"
      open={createPostDialogOpen}
      requestClose={_handleClose}
    >
      <div className="bg-neutral rounded-3xl px-6 py-8 text-neutral-content w-[95vw] sm:w-[24rem] md:w-[32rem] lg:w-[36rem] max-w-[100vw]">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-primary-content text-2xl">
            Create a new Post
          </p>

          <div>
            <button onClick={_handleClose} className="btn btn-circle">
              <FaXmark size={20} />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();

              mutate({ title, url, text });
            }}
          >
            <div className="flex flex-col gap-3">
              <div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-base-300">
                    Title
                  </legend>
                  <input
                    className="input input-base-100 text-base-content w-full"
                    required
                    placeholder="hacker"
                    onChange={(e) => {
                      const title = e.target.value;
                      settitle(title);
                    }}
                    value={title}
                  />
                  <p className="label">Required*</p>
                </fieldset>
              </div>

              <div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-base-300">URL</legend>
                  <input
                    className="input input-base-100 text-base-content w-full"
                    placeholder="hackernews.clone"
                    onChange={(e) => {
                      const url = e.target.value;
                      seturl(url);
                    }}
                    value={url}
                  />
                  <p className="label">Optional</p>
                </fieldset>
              </div>

              <div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-base-300">
                    Text
                  </legend>
                  <input
                    className="input input-base-100 text-base-content w-full"
                    required
                    placeholder="hacker"
                    onChange={(e) => {
                      const text = e.target.value;
                      settext(text);
                    }}
                    value={text}
                  />
                  <p className="label">Optional</p>
                </fieldset>
              </div>

              <button type="submit" className="btn w-full btn-primary">
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
