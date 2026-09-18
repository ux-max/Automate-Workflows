"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Settings,
  Lock,
  Zap,
  Layers,
  Sparkles,
  Play,
  Share2,
  Send,
  Search,
  ChevronLeft,
  X,
  Code2,
  Workflow,
  ArrowLeft
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getDeveloperAppById } from "@/lib/developer-data"
import { DeveloperApp } from "@/lib/developer-types"

interface AppBuilderSubSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AppBuilderSubSidebar({ isOpen, onClose }: AppBuilderSubSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [app, setApp] = useState<DeveloperApp | null>(null)

  // Extract appId from pathname: /developer/apps/[appId]
  const match = pathname.match(/^\/developer\/apps\/([^/?#]+)/)
  const appId = match ? match[1] : null

  useEffect(() => {
    if (appId && appId !== "new") {
      const loaded = getDeveloperAppById(appId)
      if (loaded) {
        setApp(loaded)
      }
    } else {
      setApp(null)
    }
  }, [appId, pathname])

  if (!isOpen || !appId || appId === "new") return null

  const currentTab = searchParams.get("tab") || "overview"

  const builderSteps = [
    {
      tab: "overview",
      label: "Overview & Secrets",
      icon: Settings,
      count: app?.secrets?.length,
      animClass: "group-hover:scale-115 group-hover:rotate-45"
    },
    {
      tab: "auth",
      label: "Authentication",
      icon: Lock,
      badge: app?.authentication?.type ? app.authentication.type.replace("_", " ").toUpperCase() : undefined,
      animClass: "group-hover:scale-115 group-hover:rotate-6"
    },
    {
      tab: "triggers",
      label: "Triggers",
      icon: Zap,
      count: app?.triggers?.length ?? 0,
      animClass: "group-hover:scale-125 group-hover:rotate-12"
    },
    {
      tab: "actions",
      label: "Actions",
      icon: Layers,
      count: app?.actions?.length ?? 0,
      animClass: "group-hover:scale-115 group-hover:-translate-y-0.5"
    },
    {
      tab: "inbuilt_actions",
      label: "In-built Actions",
      icon: Sparkles,
      count: app?.inbuiltActions?.length ?? 0,
      animClass: "group-hover:scale-115 group-hover:rotate-12"
    },
    {
      tab: "sandbox",
      label: "Testing & Sandbox",
      icon: Play,
      animClass: "group-hover:scale-115 group-hover:translate-x-0.5"
    },
    {
      tab: "sharing",
      label: "Sharing & Testers",
      icon: Share2,
      count: app?.distribution?.activeInstalls ?? 0,
      animClass: "group-hover:scale-115 group-hover:rotate-12"
    },
    {
      tab: "publish",
      label: "Publish & Review",
      icon: Send,
      badge: app?.status ? app.status.replace("_", " ") : undefined,
      animClass: "group-hover:scale-115 group-hover:-translate-y-0.5"
    }
  ]

  const filteredSteps = builderSteps.filter((step) =>
    step.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectStep = (tab: string) => {
    router.push(`/developer/apps/${appId}?tab=${tab}`)
  }

  return (
    <aside
      className="w-64 border-l border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 select-none h-full relative z-10 transition-all duration-200 ease-in-out animate-in slide-in-from-left-3"
      aria-label="App Builder Steps Sub-Sidebar"
    >
      {/* Sub-Sidebar Top Header (Aligned with Main Sidebar & Navbar: h-16) */}
      <div className="h-16 flex items-center justify-between px-3.5 bg-white dark:bg-slate-900 shrink-0 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100/90 dark:border-blue-900/60 shrink-0 shadow-2xs">
            <Code2 className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col truncate">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate">
                {app?.name || "App Builder"}
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                v{app?.version || "1.0.0"}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                {app?.status ? app.status.replace("_", " ") : "dev"}
              </span>
            </div>
          </div>
        </div>

        {/* Close Sub-Sidebar / Back to Developer Hub */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Collapse Steps Sub-Sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Steps Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Action Toolbar: Search Filter */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search steps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-7.5 pl-8 pr-7 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Steps Options List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Section Header */}
          <div className="px-2 pt-2 pb-1 text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Builder Steps</span>
            <span>{builderSteps.length}</span>
          </div>

          {filteredSteps.length === 0 ? (
            <div className="p-4 text-center space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No steps found</p>
              <p className="text-[10px] text-slate-400">
                Try a different search query
              </p>
            </div>
          ) : (
            filteredSteps.map((step) => {
              const Icon = step.icon
              const isActive = currentTab === step.tab

              return (
                <button
                  key={step.tab}
                  type="button"
                  onClick={() => handleSelectStep(step.tab)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent"
                  }`}
                  title={step.label}
                >
                  {/* Left Active Accent Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${step.animClass} ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400 scale-105"
                          : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                      }`}
                    />
                    <span className="truncate">{step.label}</span>
                  </div>

                  {step.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ml-1.5 ${
                        isActive
                          ? "bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium"
                      }`}
                    >
                      {step.count}
                    </span>
                  )}

                  {step.badge && step.count === undefined && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase shrink-0 ml-1.5 ${
                        isActive
                          ? "bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium"
                      }`}
                    >
                      {step.badge}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Bottom Shortcut to Developer Hub */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <Link
            href="/developer"
            className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Custom Apps</span>
            </div>
            <Code2 className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
