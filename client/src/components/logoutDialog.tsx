import { FaXmark } from "react-icons/fa6";
import { useAppContext } from "../utils/appContext/context";
import { useLogout } from "../utils/mutations/useLogout";
import { Dialog } from "./dialog";
import { useCallback } from "react";

export const LogoutDialog = () => {
  const { logoutDialogOpen, setLogoutDialogOpen, resetAuth } = useAppContext();

  const { mutate } = useLogout({
    onSuccess: () => {
      setLogoutDialogOpen(false);
      resetAuth();
    },
  });

  const _handleClose = useCallback(() => {
    setLogoutDialogOpen(false);
  }, [setLogoutDialogOpen]);

  return (
    <Dialog
      modalClassName="flex items-center justify-center"
      open={logoutDialogOpen}
      requestClose={() => {
        setLogoutDialogOpen(false);
      }}
    >
      <div className="bg-neutral rounded-3xl px-6 py-8 text-neutral-content w-[95vw] sm:w-[24rem] md:w-[32rem] lg:w-[36rem] max-w-[100vw]">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-primary-content text-2xl">
            Are you sure you want to log out?
          </p>

          <div>
            <button onClick={_handleClose} className="btn btn-circle">
              <FaXmark size={20} />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => mutate()}
            type="submit"
            className="btn w-full btn-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </Dialog>
  );
};
