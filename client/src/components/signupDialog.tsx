import { useCallback, useState } from "react";
import { useAppContext } from "../utils/appContext/context";
import { Dialog } from "./dialog";
import { useSignup } from "../utils/mutations/useSignup";

export const SignupDialog = () => {
  const { signupDialogOpen, setSignupDialogOpen, resetAuth } = useAppContext();

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
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            mutate({ email, name, password });
          }}
        >
          <div>
            <div>
              <input
                required
                placeholder="Name"
                onChange={(e) => {
                  const name = e.target.value;
                  setName(name);
                }}
                value={name}
              />
            </div>

            <div>
              <input
                required
                type={"email"}
                placeholder="Email"
                onChange={(e) => {
                  const email = e.target.value;
                  setEmail(email);
                }}
                value={email}
              />
            </div>

            <div>
              <input
                required
                type={"password"}
                placeholder="Password"
                onChange={(e) => {
                  const password = e.target.value;
                  setPassword(password);
                }}
                value={password}
              />
            </div>

            <button type="submit">Signup</button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
