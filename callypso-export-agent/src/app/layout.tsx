import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/source-serif-4";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { DemoProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Callypso Export Agent",
  description: "İhracat operasyonları için ajan paneli — demo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
