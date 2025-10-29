"use client";

import React, { useEffect, useState } from "react";

interface FHEVMErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export function FHEVMErrorBoundary({ children, fallback }: FHEVMErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("FHEVM Error Boundary caught an error:", event.error);
      setHasError(true);
      setError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("FHEVM Error Boundary caught an unhandled rejection:", event.reason);
      setHasError(true);
      setError(new Error(event.reason));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const retry = () => {
    setHasError(false);
    setError(undefined);
  };

  if (hasError) {
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent error={error} retry={retry} />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            FHEVM SDK Error
          </h2>
          <p className="text-gray-600 mb-4">
            There was an issue loading the FHEVM SDK. This might be due to:
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
            <li>• Network connectivity issues</li>
            <li>• RelayerSDK loading problems</li>
            <li>• Browser compatibility issues</li>
          </ul>
          <div className="space-y-2">
            <button
              onClick={retry}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
          {error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
