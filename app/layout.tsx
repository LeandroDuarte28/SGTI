import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import "@/styles/globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "SGTI — Sistema de Gestão de Tecnologia da Informação",
    template: "%s | SGTI",
  },
  description:
    "Plataforma corporativa de Gestão de TI baseada em ITIL v4. " +
    "Gerenciamento de incidentes, requisições, ativos, identidades e compliance.",
  keywords: ["ITIL", "ITSM", "TI", "Incidentes", "Service Desk", "Compliance", "SGTI"],
  authors: [{ name: "Arquitetura Corporativa de TI" }],
  robots: {
    // SGTI is an internal corporate system — never index it.
    index: false,
    follow: false,
  },
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 5000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
