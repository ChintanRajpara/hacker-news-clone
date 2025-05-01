import { CreatePostDialog } from "./createPostDialog";
import { LoginDialog } from "./loginDialog";
import { LogoutDialog } from "./logoutDialog";
import { SignupDialog } from "./signupDialog";

export const AppDialogsContainer = () => {
  return (
    <>
      <LoginDialog />
      <LogoutDialog />
      <SignupDialog />
      <CreatePostDialog />
    </>
  );
};
