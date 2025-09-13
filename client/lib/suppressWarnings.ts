// Utility to suppress React defaultProps warnings from third-party libraries (specifically recharts)
// This is a temporary fix until libraries fully migrate to JavaScript default parameters

const originalConsoleWarn = console.warn;

export const suppressDefaultPropsWarnings = () => {
  // Only apply in development mode
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.warn = (...args) => {
    const message = args[0];

    // Suppress specific defaultProps warnings from recharts components only
    if (
      typeof message === "string" &&
      message.includes(
        "Support for defaultProps will be removed from function components",
      ) &&
      // Check for recharts-specific components
      (message.includes("XAxis") ||
        message.includes("YAxis") ||
        message.includes("CartesianGrid") ||
        message.includes("Tooltip") ||
        message.includes("Legend") ||
        message.includes("Bar") ||
        message.includes("Line") ||
        message.includes("Pie") ||
        message.includes("Cell") ||
        message.includes("ResponsiveContainer"))
    ) {
      // Suppress only recharts defaultProps warnings
      return;
    }

    // Let all other warnings through unchanged
    originalConsoleWarn.apply(console, args);
  };
};

export const restoreConsoleWarn = () => {
  console.warn = originalConsoleWarn;
};

// Suppress noisy browser ResizeObserver loop errors that occur during layout thrashing
export const suppressResizeObserverErrors = () => {
  if (typeof window === "undefined") return;

  const onError = (e: ErrorEvent) => {
    const msg = String(e?.message || "");
    if (
      msg.includes("ResizeObserver loop") ||
      msg.includes(
        "ResizeObserver loop completed with undelivered notifications",
      ) ||
      msg.includes("ResizeObserver loop limit exceeded")
    ) {
      e.stopImmediatePropagation();
    }
  };
  const onRejection = (e: PromiseRejectionEvent) => {
    const reason: any = e?.reason;
    const msg = reason?.message ? String(reason.message) : String(reason || "");
    if (msg.includes("ResizeObserver")) {
      e.preventDefault();
    }
  };

  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args: any[]) => {
    const first = args[0];
    if (typeof first === "string" && first.includes("ResizeObserver")) return;
    originalError.apply(console, args);
  };
  console.warn = (...args: any[]) => {
    const first = args[0];
    if (typeof first === "string" && first.includes("ResizeObserver")) return;
    originalWarn.apply(console, args);
  };

  // Additional safeguard: patch ResizeObserver prototype methods to avoid browser console errors
  try {
    const RO: any = (window as any).ResizeObserver;
    if (RO && RO.prototype) {
      const origObserve = RO.prototype.observe;
      const origUnobserve = RO.prototype.unobserve;
      const origDisconnect = RO.prototype.disconnect;

      RO.prototype.observe = function (...args: any[]) {
        try {
          return origObserve.apply(this, args);
        } catch (err) {
          // Silently ignore errors originating from ResizeObserver loop issues
          return;
        }
      };

      RO.prototype.unobserve = function (...args: any[]) {
        try {
          return origUnobserve.apply(this, args);
        } catch (err) {
          return;
        }
      };

      RO.prototype.disconnect = function (...args: any[]) {
        try {
          return origDisconnect.apply(this, args);
        } catch (err) {
          return;
        }
      };
    }
  } catch (e) {
    // ignore
  }

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
};
