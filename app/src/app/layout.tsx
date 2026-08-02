import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduPay — Gestion des inscriptions et paiements scolaires",
  description:
    "Simplifiez les inscriptions, mensualités et paiements de votre école. Les parents paient via Wave, suivent leur solde en un clic. Aucune configuration compliquée.",
  keywords: [
    "inscription scolaire",
    "paiement école",
    "Wave",
    "mensualité",
    "gestion école",
    "FCFA",
  ],
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
