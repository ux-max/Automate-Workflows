"use client"

import React, { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Settings,
  User,
  Code2,
  Bell,
  Lock,
  Users,
  Search,
  ChevronLeft,
  X
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SettingsSubSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsSubSidebar({ isOpen, onClose }: SettingsSubSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")

  if (!isOpen) return null

  const currentTab = searchParams.get("tab") || "variables"

  const settingsOptions = [
    {
      tab: "account",
      href: "/settings?tab=account",
      label: "Profile & Account",
      icon: User,
      animClass: "group-hover:scale-115 group-hover:-translate-y-0.5"
    },
    {
      tab: "security",
      href: "/settings?tab=security",
      label: "Security",
      icon: Lock,
      animClass: "group-hover:scale-115 group-hover:rotate-6"
    },
    {
      tab: "team",
      href: "/settings?tab=team",
      label: "Roles and Permission",
      icon: Users,
      animClass: "group-hover:scale-115 group-hover:rotate-6"
    },
    {
      tab: "variables",
      href: "/settings?tab=variables",
      label: "Variables",
      icon: Code2,
      animClass: "group-hover:scale-115 group-hover:rotate-6"
    },
    {
      tab: "notifications",
      href: "/settings?tab=notifications",
      label: "Notifications",
      icon: Bell,
      animClass: "group-hover:rotate-12 group-hover:scale-115"
    }
  ]

  const filteredOptions = settingsOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectOption = (href: string) => {
    router.push(href)
  }

  return (
    <aside
      className="w-64 border-l border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 select-none h-full relative z-10 transition-all duration-200 ease-in-out animate-in slide-in-from-left-3"
      aria-label="Settings Sub-Sidebar"
    >
      {/* Sub-Sidebar Top Header (Aligned with Main Sidebar & Navbar: h-16) */}
      <div className="h-16 flex items-center justify-between px-4 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100/90 dark:border-blue-900/60 shrink-0 shadow-2xs">
            <Settings className="h-4.5 w-4.5 transition-transform duration-500 hover:rotate-180" />
          </div>
          <div className="flex flex-col truncate">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                Settings
              </span>
              <Badge variant="blue" className="text-[9px] font-medium px-1.5 py-0">
                {settingsOptions.length}
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-0.5">
              Preferences & config
            </span>
          </div>
        </div>

        {/* Close Sub-Sidebar Button (Returns back to expanded main sidebar) */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Close Settings Panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Settings Options Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Action Toolbar: Search Filter */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-7.5 pl-8 pr-7 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Settings Options List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Section Header */}
          <div className="px-2 pt-2 pb-1 text-[9px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Preferences</span>
            <span>{settingsOptions.length}</span>
          </div>

          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No options found</p>
              <p className="text-[10px] text-slate-400">
                Try a different search query
              </p>
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const Icon = opt.icon
              const isActive = pathname.startsWith("/settings") && currentTab === opt.tab

              return (
                <button
                  key={opt.tab}
                  type="button"
                  onClick={() => handleSelectOption(opt.href)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent"
                  }`}
                  title={opt.label}
                >
                  {/* Left Active Accent Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${opt.animClass} ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400 scale-105"
                          : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                      }`}
                    />
                    <span className="truncate">{opt.label}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>

      </div>
    </aside>
  )
}
