import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Component as ReactComponent } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends ReactComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /* eslint-disable no-restricted-syntax */
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError = () => ({ hasError: true });

  // eslint-disable-next-line class-methods-use-this
  public override componentDidCatch = (error: unknown, errorInfo: unknown) => {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught this:", error, errorInfo);
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public override render() {
    if (!this.state.hasError) {
      return <>{this.props.children}</>;
    }

    return this.props.fallback ? (
      this.props.fallback
    ) : (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="flex content-start items-center
            animate-[wiggle_0.15s_ease-in] border-t-2 border-b-2 border-red-200"
        >
          <FontAwesomeIcon
            className="text-6xl text-red-400 p-10"
            icon={faTriangleExclamation}
          />
          <div className="text-gray-800 p-20 leading-loose text-2xl">
            We are unable to display this page at the moment.
            <br />
            Please try again later.
          </div>
        </div>
      </div>
    );
  }
  /* eslint-enable no-restricted-syntax */
}
