import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { GetMeResponse, IUser } from "../utils/types/user";
import { AppContext } from "../utils/appContext/context";

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<{ user: IUser | null }>({ user: null });
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);

  const resetAuth = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_SERVER_ENDPOINT}/api/users/me`,
        { credentials: "include" }
      );

      if (res.status === 200) {
        const { user } = (await res.json()) as GetMeResponse;

        if (user) {
          setAuth({ user });
          queryClient.invalidateQueries();
        }
      } else {
        setAuth({ user: null });
        queryClient.invalidateQueries();
      }
    } catch (err) {
      console.error(err, "fetch-me");
      //
    }
  }, [queryClient]);

  const resetAuthRef = useRef(resetAuth);
  useEffect(() => {
    resetAuthRef.current = resetAuth;
  }, [resetAuth]);
  useEffect(() => {
    void resetAuthRef.current();
  }, []);

  return (
    <AppContext.Provider
      value={{
        auth,
        setAuth,
        resetAuth,

        loginDialogOpen,
        setLoginDialogOpen,
        signupDialogOpen,
        setSignupDialogOpen,
        logoutDialogOpen,
        setLogoutDialogOpen,
        createPostDialogOpen,
        setCreatePostDialogOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
