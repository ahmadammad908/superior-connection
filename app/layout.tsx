import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

import { VotingTicker } from "./components/VotingTicker";
// import FallingLeavesEffect from "./components/FallingLeaves";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Superior Connection",
  description: "Vote for your favorite student profiles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={spaceGrotesk.variable}>
        <body className="bg-white font-sans text-gray-900 antialiased">
          {/* <FallingLeavesEffect /> */}

          <VotingTicker />

          {children}

          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}