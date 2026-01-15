import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logistiq - Platforma #1 pentru Managementul Depozitelor",
  description: "Logistiq digitalizeaza operatiunile din depozit. Check-in QR pentru soferi, management rampe in timp real, comunicare instantanee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
