import { FaBars, FaPlus, FaRegBell } from "react-icons/fa6";
import { useAppContext } from "../utils/appContext/context";
import { useAuthenticatedClick } from "../utils/hooks/useAuthenticatedClick";
import { Link } from "react-router-dom";

const CreateButton = () => {
  const { setCreatePostDialogOpen } = useAppContext();

  const { authenticatedClick } = useAuthenticatedClick();

  return (
    <button
      onClick={() => authenticatedClick(() => setCreatePostDialogOpen(true))}
      className="btn btn-primary btn-sm sm:btn-md"
    >
      <FaPlus />
      Create Post
    </button>
  );
};

const NotificationButton = () => {
  return <></>;

  return (
    <button className="btn btn-ghost btn-circle">
      <div className="indicator">
        <FaRegBell size={20} />

        <span className="badge badge-xs badge-primary indicator-item"></span>
      </div>
    </button>
  );
};

const LoginSignup = () => {
  const { setLoginDialogOpen, setSignupDialogOpen } = useAppContext();

  return (
    <ul className="menu  w-full sm:w-auto menu-vertical sm:menu-horizontal gap-1 items-stretch sm:items-center justify-center">
      <li onClick={() => setLoginDialogOpen(true)}>
        <a className="link link-secondary">Login</a>
      </li>

      <li onClick={() => setSignupDialogOpen(true)}>
        <a className="link link-secondary">Signup</a>
      </li>
    </ul>
  );
};

export const AppHeader = () => {
  const { auth, setLogoutDialogOpen } = useAppContext();

  return (
    <div className="navbar bg-neutral text-neutral-content sticky top-0 z-10">
      <div className="navbar-start">
        <div className="dropdown inline-flex sm:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle btn-md"
          >
            <FaBars size={20} />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {auth.user ? (
              <ul className="menu menu-vertical gap-1 items-stretch justify-center">
                <li>
                  <a className="link">{auth.user.email}</a>
                </li>
                <li onClick={() => setLogoutDialogOpen(true)}>
                  <a className="link link-error">Logout</a>
                </li>
              </ul>
            ) : (
              <LoginSignup />
            )}
          </ul>
        </div>

        <Link to={"/"} className="btn btn-ghost text-lg">
          Hacker News clone
        </Link>
      </div>

      <div className="navbar-center hidden sm:inline-flex">
        <CreateButton />
      </div>

      <div className="navbar-end inline-flex sm:hidden">
        <ul className="menu menu-horizontal gap-1 items-center justify-center">
          <li>
            <NotificationButton />
          </li>
          <li>
            <CreateButton />
          </li>
        </ul>
      </div>

      <div className="navbar-end hidden sm:inline-flex">
        {auth.user ? (
          <ul className="menu menu-horizontal gap-1 items-center justify-center">
            <li>
              <NotificationButton />
            </li>
            <li>
              <details>
                <summary className="link ">{auth.user.email}</summary>
                <ul>
                  <li
                    onClick={() => {
                      setLogoutDialogOpen(true);
                    }}
                  >
                    <a className="btn-error btn btn-soft">Logout</a>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        ) : (
          <LoginSignup />
        )}
      </div>
    </div>
  );
};
