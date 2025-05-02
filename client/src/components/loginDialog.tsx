import { useCallback, useState } from "react";
import { useAppContext } from "../utils/appContext/context";
import { Dialog } from "./dialog";
import { useLogin } from "../utils/mutations/useLogin";
import { FaXmark } from "react-icons/fa6";

export const LoginDialog = () => {
  const {
    loginDialogOpen,
    setLoginDialogOpen,
    resetAuth,
    setSignupDialogOpen,
  } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const _handleClose = useCallback(() => {
    setEmail("");
    setPassword("");
    setLoginDialogOpen(false);
  }, [setEmail, setPassword, setLoginDialogOpen]);

  const { mutate } = useLogin({
    onSuccess: () => {
      _handleClose();
      resetAuth();
    },
  });

  return (
    <Dialog
      modalClassName="flex items-center justify-center"
      open={loginDialogOpen}
      requestClose={_handleClose}
    >
      <div className="bg-neutral rounded-3xl px-6 py-8 text-neutral-content w-[95vw] sm:w-[24rem] md:w-[32rem] lg:w-[36rem] max-w-[100vw]">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-primary-content text-2xl">
            Access Account
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

              mutate({ email, password });
            }}
          >
            <div className="flex flex-col gap-3">
              <div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-base-300">
                    E-mail
                  </legend>
                  <input
                    className="input input-base-100 text-base-content w-full"
                    required
                    type={"email"}
                    placeholder="hacker@news.clone"
                    onChange={(e) => {
                      const email = e.target.value;
                      setEmail(email);
                    }}
                    value={email}
                  />
                  <p className="label">Required*</p>
                </fieldset>
              </div>

              <div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-base-300">
                    Password
                  </legend>

                  <input
                    className="input input-base-100 text-base-content w-full"
                    required
                    type={"password"}
                    placeholder="Password"
                    onChange={(e) => {
                      const password = e.target.value;
                      setPassword(password);
                    }}
                    value={password}
                  />

                  <p className="label">Required*</p>
                </fieldset>
              </div>

              <p
                onClick={() => {
                  setSignupDialogOpen(true);
                  setLoginDialogOpen(false);
                }}
                className="link text-primary-content underline underline-offset-2 font-light text-sm cursor-pointer"
              >
                I don't have an account
              </p>

              <button type="submit" className="btn w-full btn-primary">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
