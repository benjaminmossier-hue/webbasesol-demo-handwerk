import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Schrift wird beim Bauen heruntergeladen und selbst ausgeliefert (keine Verbindung zu Google beim Besucher)
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Kessler Haustechnik – Heizung & Sanitär (Demo)",
  description:
    "Demo-Seite von Web Base Solution: fiktiver Heizungs- und Sanitärbetrieb mit Anfrage-Assistent.",
  // Fiktiver Betrieb: nicht in Suchmaschinen auftauchen
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${archivo.variable} antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
