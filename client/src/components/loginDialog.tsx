import { useCallback, useState } from "react";
import { useAppContext } from "../utils/appContext/context";
import { Dialog } from "./dialog";
import { useLogin } from "../utils/mutations/useLogin";

export const LoginDialog = () => {
  const { loginDialogOpen, setLoginDialogOpen, resetAuth } = useAppContext();
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
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            mutate({ email, password });
          }}
        >
          <div>
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

            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
