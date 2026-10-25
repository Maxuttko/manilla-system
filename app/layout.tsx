import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600"],
  fallback: ["Consolas", "Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: "MANILLA | Dāvanu Iesaiņošanas Pasūtījumu Sistēma",
  description: "Boutique dāvanu iesaiņošanas un meistara darba pārvaldības sistēma planšetēm un kasei.",
  icons: {
    icon: "/manilla-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lv"
      className={`${outfit.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F9F6F0] text-[#2A2624] font-sans flex flex-col selection:bg-[#B85D3E]/20 selection:text-[#B85D3E]">
        <Suspense fallback={null}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
