import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";

export const metadata: Metadata = {
  title: "Timework",
  description: "Protocol-Driven Project Management",
};

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { OnboardingCheckWrapper } from "@/components/auth/OnboardingCheckWrapper";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StackProvider app={stackServerApp}>
            <StackTheme theme={{
              light: {
                primary: '#4f46e5',
                foreground: '#0f172a', // slate-900
                background: '#f8fafc', // slate-50
                card: '#ffffff',
                cardForeground: '#0f172a',
                muted: '#f1f5f9',
                mutedForeground: '#64748b',
              },
              dark: {
                primary: '#4f46e5',
                foreground: '#ffffff', // Pure White
                background: '#0f172a',
                card: '#0f172a',
                cardForeground: '#ffffff', // Pure White
                muted: '#1e293b',
                mutedForeground: '#ffffff', // Pure White (Force visibility)
                popover: '#0f172a',
                popoverForeground: '#ffffff', // Pure White
                secondary: '#1e293b',
                secondaryForeground: '#ffffff', // Pure White
                accent: '#1e293b',
                accentForeground: '#ffffff', // Pure White
                destructive: '#ef4444',
                destructiveForeground: '#ffffff',
                border: '#1e293b',
                input: '#1e293b',
                ring: '#4f46e5',
              },
              radius: '0.75rem',
            }}>
              <TooltipProvider>
                <OnboardingCheckWrapper />
                <Navbar />
                <main className="min-h-screen">
                  {children}
                </main>
                <Toaster />
              </TooltipProvider>
            </StackTheme>
          </StackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
