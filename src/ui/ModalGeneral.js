import React from "react";

const ModalGeneral = ({ children, state, changeState }) => {
  return (
    <>
      {state && (
        <div className="w-screen h-screen flex items-center justify-center fixed top-0 left-0 backdrop-blur-sm z-10">
          <main className="mx-0 min-h-fit min-w-fit max-h-100 w-2/5 h-auto relative rounded-3xl shadow bg-white p-4">
            <button
              className="absolute top-0 pt-3 pr-3 right-0 cursor-pointer"
              onClick={() => changeState(!state)}
            >
              <img
                src="/closeIcon.png"
                alt="cerrar"
              />
            </button>
            <div className="h-full w-full p-4">{children}</div>
          </main>
        </div>
      )}
    </>
  );
};

export default ModalGeneral;