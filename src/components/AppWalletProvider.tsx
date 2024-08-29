"use client";
 
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
 
// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

// imports here
 
export default function AppWalletProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const mainnetUrl = "https://mainnet.helius-rpc.com/?api-key=817a7a0c-dca4-4a57-b275-fdae1ab6121c";
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => network === WalletAdapterNetwork.Devnet ? "https://devnet.helius-rpc.com/?api-key=817a7a0c-dca4-4a57-b275-fdae1ab6121c" : mainnetUrl, []);
    const wallets = useMemo(
      () => [
        // manually add any legacy wallet adapters here
        // new UnsafeBurnerWalletAdapter(),
      ],
      [network],
    );
   
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }
