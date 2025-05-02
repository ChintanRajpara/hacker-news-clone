import { createContext, useContext } from "react";
import { IUser } from "../../types/user";

type AppContextData = {
  auth: { user: IUser | null };
  setAuth: React.Dispatch<React.SetStateAction<{ user: IUser | null }>>;
  resetAuth: () => Promise<void>;

  loginDialogOpen: boolean;
  setLoginDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  signupDialogOpen: boolean;
  setSignupDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logoutDialogOpen: boolean;
  setLogoutDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createPostDialogOpen: boolean;
  setCreatePostDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppContext = createContext<AppContextData>({
  auth: { user: null },
  setAuth: () => {},
  resetAuth: async () => {},
  loginDialogOpen: false,
  signupDialogOpen: false,
  logoutDialogOpen: false,
  createPostDialogOpen: false,
  setLoginDialogOpen: () => {},
  setSignupDialogOpen: () => {},
  setLogoutDialogOpen: () => {},
  setCreatePostDialogOpen: () => {},
});

export const useAppContext = () => useContext(AppContext);
