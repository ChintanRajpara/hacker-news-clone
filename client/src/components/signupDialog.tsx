import { useCallback, useState } from "react";
import { useAppContext } from "../utils/appContext/context";
import { Dialog } from "./dialog";
import { useSignup } from "../utils/mutations/useSignup";
import { FaXmark } from "react-icons/fa6";

export const SignupDialog = () => {
  const {
    signupDialogOpen,
    setSignupDialogOpen,
    resetAuth,
    setLoginDialogOpen,
  } = useAppContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const _handleClose = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setSignupDialogOpen(false);
  }, [setName, setEmail, setPassword, setSignupDialogOpen]);

  const { mutate } = useSignup({
    onSuccess: () => {
      _handleClose();
      resetAuth();
    },
  });

  return (
    <Dialog
      modalClassName="flex items-center justify-center"
      open={signupDialogOpen}
      requestClose={_handleClose}
    >
      <div className="bg-neutral rounded-3xl px-6 py-8 text-neutral-content w-[95vw] sm:w-[24rem] md:w-[32rem] lg:w-[36rem] max-w-[100vw]">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-primary-content text-2xl">
            Get Started
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

              mutate({ email, name, password });
            }}
          >
            <div className="flex flex-col gap-3">
              <div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-base-300">
                    Name
                  </legend>
                  <input
                    className="input input-base-100 text-base-content w-full"
                    required
                    placeholder="hacker"
                    onChange={(e) => {
                      const name = e.target.value;
                      setName(name);
                    }}
                    value={name}
                  />
                  <p className="label">Required*</p>
                </fieldset>
              </div>

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
                  setLoginDialogOpen(true);
                  setSignupDialogOpen(false);
                }}
                className="link text-primary-content underline underline-offset-2 font-light text-sm cursor-pointer"
              >
                I already have an account
              </p>

              <button type="submit" className="btn w-full btn-primary">
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
