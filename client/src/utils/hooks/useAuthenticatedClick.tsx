import { useCallback } from "react";
import { useAppContext } from "../appContext/context";

export const useAuthenticatedClick = () => {
  const { auth, setLoginDialogOpen } = useAppContext();

  const authenticatedClick = useCallback(
    (onAuthenticatedClick: () => void) => {
      if (auth.user) {
        onAuthenticatedClick();
      } else {
        setLoginDialogOpen(true);
      }
    },
    [auth, setLoginDialogOpen]
  );

  return { authenticatedClick };
};
