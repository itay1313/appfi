import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level safety net. Catches render-time crashes that slip past
 * normal error handling and shows a recoverable full-page fallback
 * instead of the dreaded white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    if (error instanceof Error) return { error };
    return { error: new Error(String(error)) };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // Surface the error to the devtools console in dev; in a real app
    // this would also forward to Sentry / Datadog / etc.
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-7 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight">
              Something broke
            </h1>
            <p className="text-sm text-muted-foreground">
              {this.state.error.message ||
                "An unexpected error occurred while rendering."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" onClick={this.handleReset}>
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
