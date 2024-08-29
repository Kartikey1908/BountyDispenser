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
  description: "A dynamic Next.js app enabling GitHub bounty management with secure Solana payments, intuitive UI, and real-time issue tracking.",
  icons: "/favicon1.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon1.ico" type="image/jpg" />
        <meta property="og:image" content="/image.png" />
        <meta property="og:url" content="https://bounty-dispenser.vercel.app" />
        <meta property="og:type" content="website" />
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
