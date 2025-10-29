"use client";

import { useEffect, useState } from "react";
import { InMemoryStorageProvider, FHEVMProvider } from "@fhevm/sdk/react";
import type { FHEVMConfig, FHEVMEvents } from "@fhevm/sdk";

interface ClientFHEVMProviderProps {
  children: React.ReactNode;
  config: FHEVMConfig;
  events?: FHEVMEvents;
}

/**
 * Client-side FHEVM Provider that only renders on the client
 * This prevents server-side rendering issues with the RelayerSDKLoader
 */
export function ClientFHEVMProvider({ children, config, events }: ClientFHEVMProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a loading state during SSR
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FHEVM SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <FHEVMProvider config={config} events={events}>
      <InMemoryStorageProvider>
        {children}
      </InMemoryStorageProvider>
    </FHEVMProvider>
  );
}
