import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "ClosetAI – Your Wardrobe, Now Sentient",
  description: "Daily color-perfect athletic fits engineered for your exact drip. Powered by AI + perceptual color science.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#0a0a0a] text-[#f0f0f0] min-h-screen`}>
        <div className="hex-grid-bg" />
        <Navigation />
        <main className="relative z-10 min-h-screen pt-16">
          {children}
        </main>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161616',
              border: '1px solid #222',
              color: '#f0f0f0',
            },
          }}
        />
      </body>
    </html>
  );
}
