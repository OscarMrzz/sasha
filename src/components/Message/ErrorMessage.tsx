import { dialog } from "framer-motion/client";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import Lottie from "lottie-react";
import ErrorIcon from "../../../public/animacionesJson/errorIcon.json";

type OverleyModalProps = {
  open: boolean;
  onClose: () => void;
  titulo?: string;
  texto?: string;
}; 

export default function ErrorMessage({ open, onClose, titulo, texto }: OverleyModalProps) {
  const [Animar, setAnimar] = React.useState(false);
  const modalRef = React.useRef<HTMLDialogElement>(null);

  const cerrarYRecetiar = () => {
    setAnimar(false);
    onClose();
  };
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.close();
    }
  }, []);

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



  return (
    <>
      {open
        ? ReactDOM.createPortal(
            <dialog
              ref={modalRef}
              closedby="any"
              onClose={cerrarYRecetiar}
              className={` z-[9999] fixed flex   w-120 h-90 inset-0 m-auto rounded-2xl justify-center items-center backdrop:bg-black/50 backdrop:backdrop-blur-xs animate-zoom-in duration-500        `}
            >
              <div className={`flex flex-col text-red-400 rounded-2xl bg-white gap-4 justify-center items-center`}>
                <div className="w-60 overflow-hidden flex  justify-center items-center">
                  <Lottie animationData={ErrorIcon} loop={false} className="w-45 h-45 " />
                </div>
                <div className="text-center flex flex-col justify-center items-center gap-4">
                  <h2 className="text-xl font-bold">{titulo}</h2>
                  <p>{texto}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="bg-pink-400 text-30 text-red-100 p-2.5 rounded-2xl border-none outline-none"
                >
                  Aceptar
                </button>
              </div>
            </dialog>,
            document.body
          )
        : null}
    </>
  );
}
