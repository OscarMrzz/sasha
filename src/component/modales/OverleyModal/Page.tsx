import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type OverleyModalProps = {
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

const OverleyModal = ({ open, onClose, children }: OverleyModalProps) => {
  const [Animar, setAnimar] = React.useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) {
      setAnimar(false);
      setTimeout(() => {
        setAnimar(true);
        modalRef.current?.showModal();
      }, 10);
    } else {
      setAnimar(false);
      modalRef.current?.close();
    }
  }, [open]);

  const dialogNode =
    open && typeof document !== "undefined" ? (
      <dialog
        ref={modalRef}
        closedby="any"
        onClose={onClose}
        className="fixed z-[100] inset-0 m-auto flex border-0 outline-none bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs animate-zoom-in duration-500  "
      >
        <div className="bg-slate-700  rounded-2xl max-h-120  w-xl flex flex-col overflow-hidden">
          <div className="overflow-hidden scrollbar-estetica p-6">{children}</div>
          <div className=" flex justify-end p-4">
            <button type="button" onClick={onClose} className="border-2 px-4 py-2 text-white cursor-pointer hover:bg-gray-200/20">
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    ) : null;

  return (
    <>
      {dialogNode && typeof document !== "undefined"
        ? createPortal(dialogNode, document.body)
        : null}
    </>
  );
};

export default OverleyModal;
