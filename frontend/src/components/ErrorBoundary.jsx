import { Component } from "react";

// App-level error boundary (P8). React has no default boundary — any throw in
// render unmounts the whole tree (the #21 bad-selector crash white-screened every
// user). A class component is the only way to catch render errors; there is no hook
// equivalent. Self-rolled (no react-error-boundary dep) to match the TaskErrorToast
// choice and the "keep core simple" product direction.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Recovery is a hard reload, so just record what happened.
    // Telemetry hook: forward (error, info) to a logger here when one exists.
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purpleMain text-white"
      >
        <div className="max-w-sm text-center flex flex-col items-center gap-4">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-200">
            The app hit an unexpected error. Reloading should get you back on track.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-white text-purpleMain font-medium px-4 py-2 hover:bg-gray-100"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

ErrorBoundary.displayName = "ErrorBoundary";
export default ErrorBoundary;
