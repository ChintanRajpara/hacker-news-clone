import { useAppContext } from "../utils/appContext/context";
import { useLogout } from "../utils/mutations/useLogout";
import { Dialog } from "./dialog";

export const LogoutDialog = () => {
  const { logoutDialogOpen, setLogoutDialogOpen, resetAuth } = useAppContext();

  const { mutate } = useLogout({
    onSuccess: () => {
      setLogoutDialogOpen(false);

      resetAuth();
    },
  });

  return (
    <Dialog
      modalClassName="flex items-center justify-center"
      open={logoutDialogOpen}
      requestClose={() => {
        setLogoutDialogOpen(false);
      }}
    >
      <div>
        <p>are you sure you want to logout ? </p>
        <button
          className="btn"
          onClick={() => {
            mutate();
          }}
        >
          Logout
        </button>
      </div>
    </Dialog>
  );
};
