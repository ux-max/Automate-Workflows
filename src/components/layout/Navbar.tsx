"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  HelpCircle,
  Sun,
  Moon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/context/ThemeContext"

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [globalSearch, setGlobalSearch] = useState("")

  // Hide top app header completely on Canvas Editor screen or Auth/Onboarding pages
  const isAuthOrEditor =
    pathname.startsWith("/workflows/editor") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-email")

  if (isAuthOrEditor) {
    return null
  }

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-transparent dark:border-slate-800 z-10 px-6 flex items-center justify-between transition-colors">
      {/* Search Input */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            type="text"
            placeholder="Search Workflow by Name or Webhook URL..."
            className="pl-9 pr-4 text-xs bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 transition-all h-9"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center space-x-4 ml-auto">
        <Link href="/billing">
          <Button size="sm" className="font-bold text-xs space-x-1.5 px-4 shadow-xs">
            <span>Upgrade</span>
          </Button>
        </Link>

        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <Link
            href="/templates"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Get Help & Templates"
          >
            <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Link>

          {/* Theme Switcher Toggle - Positioned immediately adjacent to Profile Avatar */}
          <button
            type="button"
            onClick={(e) => toggleTheme(e)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Profile Avatar */}
          <Link
            href="/settings"
            className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700 text-white font-bold text-xs border border-slate-300 dark:border-slate-600 shadow-2xs hover:opacity-90 transition-opacity"
            title="Profile & Settings"
          >
            H
          </Link>
        </div>
      </div>
    </header>
  )
}
