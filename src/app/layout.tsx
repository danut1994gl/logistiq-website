import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logistiq - Platforma pentru Managementul Depozitelor",
  description: "Logistiq digitalizează operațiunile din depozit. Check-in QR pentru șoferi, management rampe în timp real, comunicare instantanee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
