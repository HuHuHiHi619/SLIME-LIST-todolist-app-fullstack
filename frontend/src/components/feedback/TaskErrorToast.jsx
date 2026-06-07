import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearTaskError } from "../../redux/taskSlice";

// Surfaces task mutation failures (#21 / P4 #2). Reads state.tasks.error — which the
// rejected matcher in taskSlice sets — and auto-dismisses. Mounted once at App level.
// Self-rolled (no toast dependency); reuses the bg-purpleMain styling idiom.
const AUTO_DISMISS_MS = 4000;

const TaskErrorToast = () => {
  const error = useSelector((state) => state.tasks.error);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => dispatch(clearTaskError()), AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [error, dispatch]);

  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-purpleMain text-white shadow-lg p-4 flex items-start gap-3"
    >
      <svg
        className="h-6 w-6 flex-shrink-0 text-amber-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-sm flex-1">{String(error)}</p>
      <button
        type="button"
        onClick={() => dispatch(clearTaskError())}
        aria-label="Dismiss"
        className="text-gray-300 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

export default TaskErrorToast;

