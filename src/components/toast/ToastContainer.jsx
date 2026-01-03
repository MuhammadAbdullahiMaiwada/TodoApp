import Toast from "./Toast";
import "./toast.css";
export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.message}</span>

          {t.action && (
            <button
              className="toast-action"
              onClick={() => {
                t.action.onClick();
                removeToast(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
