import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppBar from "@/components/Appbar";
import AppWalletProvider from "@/components/AppWalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { Provider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bounty Dispenser",
  description: "An app to dispense and assign bounties on issues on your github.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon2.ico" type="image/jpg" />
      </head>
      <body className={inter.className}>
        <Provider>
          <AppWalletProvider>
            <AppBar />
            {children}
            <Toaster />
          </AppWalletProvider>
        </Provider>
      </body>
    </html>
  );
}
