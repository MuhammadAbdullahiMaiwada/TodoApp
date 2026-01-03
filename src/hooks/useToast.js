import { useState } from "react";

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, options = {}) => {
    const id = Date.now();

    const toast = {
      id,
      message,
      type: options.type || "info",
      action: options.action || null,
      duration: options.duration || 3000,
    };

    setToasts((prev) => [...prev, toast]);

    if (!toast.action) {
      setTimeout(() => removeToast(id), toast.duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}
