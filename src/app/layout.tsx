import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logistiq - Soluții Inteligente de Logistică",
  description: "Platformă modernă pentru gestionarea eficientă a operațiunilor logistice. Automatizare, tracking în timp real și optimizare a fluxurilor.",
  keywords: ["logistică", "management", "transport", "automatizare", "tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
