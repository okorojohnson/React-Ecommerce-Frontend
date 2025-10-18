import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a Toastprovider");
  }

  return context;
};

export const Toastprovider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [key, setKey] = useState(0);

  const show = useCallback((msg, ms = 2500) => {
    setMessage(msg);
    setKey((k) => k + 1);
    if (ms > 0) {
      setTimeout(() => setMessage(null), ms);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast Ui */}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-50">
        {message && (
          <div
            key={key}
            className="bg-swBlack text-white px-4 py-5 rounded shadow-lg animate-fade-in"
          >
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};
