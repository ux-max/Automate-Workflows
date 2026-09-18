import type { Metadata } from "next"
import "./globals.css"
import { AppShell } from "@/components/layout/AppShell"
import { ThemeProvider } from "@/context/ThemeContext"

export const metadata: Metadata = {
  title: "Automate Workflows — Visual Automation Platform",
  description: "A visual workflow-automation platform for the Automate product suite.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const path = window.location.pathname;
                const isAuth = /^\\/(login|signup|onboarding|forgot-password|verify-email)/.test(path);
                if (!isAuth) {
                  const storedTheme = localStorage.getItem('automate_theme');
                  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
