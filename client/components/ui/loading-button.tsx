import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    { children, loading = false, loadingText, disabled, className, ...props },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          loading && "cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "flex items-center justify-center gap-2 transition-all duration-300",
            loading && "opacity-0",
          )}
        >
          {children}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-current opacity-10 animate-pulse" />
        )}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
