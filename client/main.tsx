import "./global.css";
import "./lib/i18n";

import { createRoot } from "react-dom/client";
import App from "./App";
import { suppressResizeObserverErrors } from "./lib/suppressWarnings";
import { installAuthFetchInterceptor } from "./lib/api";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

// Create root only once and handle potential re-renders
let root: ReturnType<typeof createRoot>;

// Suppress noisy ResizeObserver logs early
suppressResizeObserverErrors();

function render() {
  if (!root) {
    root = createRoot(container);
  }
  root.render(<App />);
}

// Install global auth/refresh fetch interceptor, then render
installAuthFetchInterceptor();

// Initial render
render();

// Handle hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept("./App", () => {
    render();
  });
}
