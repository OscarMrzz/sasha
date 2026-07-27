import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type OverleyModalProps = {
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

const OverleyModalFormulario = ({ open, onClose, children }: OverleyModalProps) => {
  const [Animar, setAnimar] = React.useState(false);
  const modalRef = React.useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) {
      setAnimar(false);
      setTimeout(() => {
        setAnimar(true);
        modalRef.current?.showModal();
      }, 10);
    } else {
      setAnimar(false); // Reinicia la animación al cerrar
      modalRef.current?.close();
    }
  }, [open]);

  const dialogNode =
    open && typeof document !== "undefined" ? (
      <dialog
        ref={modalRef}
        closedby="any"
        onClose={onClose}
        className="fixed z-[100] inset-0 m-auto flex border-0 outline-none backdrop:bg-black/50 backdrop:backdrop-blur-xs animate-zoom-in duration-500  "
      >
        <div onDoubleClick={(e) => e.stopPropagation()} className={`modal-scroll w-2xl  h-[90vh]  bg-slate-600 `}>
          <div className="p-6 pb-28 text-white ">{children}</div>
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

export default OverleyModalFormulario;
