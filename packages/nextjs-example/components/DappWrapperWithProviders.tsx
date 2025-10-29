"use client";

import { useEffect, useState } from "react";
import { ClientFHEVMProvider } from "./ClientFHEVMProvider";
import { FHEVMErrorBoundary } from "./FHEVMErrorBoundary";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ProgressBar height="3px" color="#2299dd" />
          <div className={`flex flex-col min-h-screen`}>
            <Header />
            <main className="relative flex flex-col flex-1">
              <FHEVMErrorBoundary>
                <ClientFHEVMProvider config={{
                  rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY 
                    ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
                    : `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
                  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111,
                  mockChains: {
                    31337: "http://localhost:8545"
                  }
                }}>
                  {children}
                </ClientFHEVMProvider>
              </FHEVMErrorBoundary>
            </main>
          </div>
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
