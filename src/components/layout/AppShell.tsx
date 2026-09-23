"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { FoldersProvider } from "@/context/FoldersContext"

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/onboarding",
  "/forgot-password",
  "/verify-email"
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""

  // Check if current route is an Auth or Onboarding page
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current route is the full-bleed Workflow Canvas Editor
  const isWorkflowEditor = pathname.startsWith("/workflows/editor")

  // For Auth & Onboarding: Render standalone, full-screen canvas without App Sidebar or Navbar
  if (isAuthRoute) {
    return (
      <div className="flex-1 h-full w-full overflow-y-auto bg-slate-50 text-slate-900 transition-colors">
        {children}
      </div>
    )
  }

  // For Canvas Editor: Render full-bleed workspace without App Sidebar or Navbar
  if (isWorkflowEditor) {
    return (
      <FoldersProvider>
        <div className="flex-1 h-full w-full overflow-hidden bg-white dark:bg-slate-900 transition-colors">
          {children}
        </div>
      </FoldersProvider>
    )
  }

  // Standard In-App Shell (Dashboard, Workflows, Connections, History, Settings, Billing, Templates)
  return (
    <FoldersProvider>
      {/* Static Left Sidebar - Stays fixed on left (Unified with Navbar) */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white dark:bg-slate-900 transition-colors">
        {/* Static Top Navbar - Stays fixed at top (Unified with Sidebar) */}
        <Navbar />

        {/* Middle Content Area with Inside Corner Radius */}
        <main
          className={`flex-1 ${
            pathname === "/chat" ? "overflow-hidden flex flex-col" : "overflow-y-auto"
          } no-scrollbar min-h-0 bg-slate-100/70 dark:bg-slate-950 rounded-tl-[24px] border-t border-l border-slate-200/90 dark:border-slate-800/80 shadow-2xs transition-colors`}
        >
          <div
            key={pathname}
            className={`w-full min-h-0 animate-tab-fade ${
              pathname === "/chat" ? "h-full flex flex-col flex-1" : "min-h-full flex flex-col flex-1"
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </FoldersProvider>
  )
}
