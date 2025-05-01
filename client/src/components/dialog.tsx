import {
  createRef,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const transitionDurationInMS = 200;

export type DialogProps = {
  open: boolean;
  children: ReactNode;
  requestClose: () => void;
  modalClassName?: string;
  disableClickAway?: boolean;
};

export const Dialog = ({
  open,
  children,
  requestClose,
  modalClassName,
  disableClickAway = false,
}: DialogProps) => {
  const [transitionOpen, setTransitionOpen] = useState(open);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = createRef<HTMLDialogElement>();

  useEffect(() => {
    if (!dialogRef.current) {
      return;
    }

    if (open) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [open, dialogRef]);

  const childrenWithBackdrop = useMemo(
    () => (
      <div
        role="dialog"
        style={{
          transitionProperty: "opacity",
          transitionDuration: `${transitionDurationInMS}ms`,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !disableClickAway) {
            requestClose?.();
          }
        }}
        aria-modal
        className={`${
          !open ? "opacity-0" : transitionOpen ? "opacity-100" : "opacity-0"
        } z-50 bg-black/50 h-screen w-screen overflow-hidden fixed top-0 left-0  ${modalClassName}`}
      >
        {children}
      </div>
    ),
    [
      children,
      modalClassName,
      open,
      transitionOpen,
      requestClose,
      disableClickAway,
    ]
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setTransitionOpen(open);
    }, transitionDurationInMS);
  }, [open]);

  return transitionOpen || open ? (
    createPortal(childrenWithBackdrop, document.body)
  ) : (
    <></>
  );
};
