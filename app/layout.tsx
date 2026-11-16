import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Superior - Campus Life & Student Discussion Platform",
  description:
    "A university-only social media platform for Superior students to discuss campus life, voice student problems, and stay connected.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={spaceGrotesk.variable}>
        <body className="bg-white font-sans text-gray-900 antialiased min-h-screen flex flex-col selection:bg-[#6C1C74] selection:text-white">
          <div className="flex-1 flex flex-col">{children}</div>

          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
