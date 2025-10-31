import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Navbar }  from "@/components/user-compo/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flow Earn",
  description:
    "Decentralized Task Hub on Flow Blockchain - Earn Crypto by Completing Tasks and Bounties",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThirdwebProvider>
          <Navbar />
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
