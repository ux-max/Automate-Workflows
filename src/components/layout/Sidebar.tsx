"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  Layers,
  Zap,
  Link2,
  Settings,
  HelpCircle,
  Workflow,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Code2,
  Bell,
  Folder,
  SquarePen,
  Plus,
  ExternalLink
} from "lucide-react"
import { useFolders } from "@/context/FoldersContext"
import { FoldersSubSidebar } from "@/components/layout/FoldersSubSidebar"
import { SettingsSubSidebar } from "@/components/layout/SettingsSubSidebar"
import { AppBuilderSubSidebar } from "@/components/layout/AppBuilderSubSidebar"
import { motion } from "framer-motion"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSettingsSubSidebarOpen, setIsSettingsSubSidebarOpen] = useState(false)
  const [isAppBuilderSubSidebarOpen, setIsAppBuilderSubSidebarOpen] = useState(false)
  const {
    folders,
    isFoldersSubSidebarOpen,
    setIsFoldersSubSidebarOpen,
    toggleFoldersSubSidebar,
    selectedFolder,
    setSelectedFolder
  } = useFolders()

  // Sync settings sub-sidebar state with route
  useEffect(() => {
    if (pathname.startsWith("/settings")) {
      setIsSettingsSubSidebarOpen(true)
    } else {
      setIsSettingsSubSidebarOpen(false)
    }
  }, [pathname])

  // Sync App Builder sub-sidebar state with custom app builder route
  const isAppBuilderRoute = pathname.startsWith("/developer/apps/") && !pathname.endsWith("/new")
  useEffect(() => {
    if (isAppBuilderRoute) {
      setIsAppBuilderSubSidebarOpen(true)
    } else {
      setIsAppBuilderSubSidebarOpen(false)
    }
  }, [pathname, isAppBuilderRoute])

  // When Folder, Settings, or App Builder Sub-sidebar is active, collapse the Primary sidebar automatically
  // When all are closed, expand the Primary sidebar
  useEffect(() => {
    if (isFoldersSubSidebarOpen || isSettingsSubSidebarOpen || isAppBuilderSubSidebarOpen) {
      setIsCollapsed(true)
    } else {
      setIsCollapsed(false)
    }
  }, [isFoldersSubSidebarOpen, isSettingsSubSidebarOpen, isAppBuilderSubSidebarOpen])

  // Hide sidebar completely on Canvas Editor full-bleed screen or Auth/Onboarding pages
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

  interface MainNavItem {
    href: string
    label: string
    icon: any
    animClass: string
    isFoldersToggle?: boolean
    badge?: string
  }

  const mainNavItems: MainNavItem[] = [
    {
      href: "/chat",
      label: "Chat",
      icon: SquarePen,
      animClass: "group-hover:scale-110 group-hover:rotate-6"
    },
    {
      href: "/workflows",
      label: "Workflow",
      icon: Layers,
      animClass: "group-hover:-translate-y-0.5 group-hover:scale-110"
    },
    {
      href: "#folders",
      label: "Folders",
      icon: Folder,
      isFoldersToggle: true,
      animClass: "group-hover:scale-110 group-hover:rotate-6"
    },
    {
      href: "/history",
      label: "History",
      icon: Zap,
      animClass: "group-hover:scale-125 group-hover:rotate-12"
    },
    {
      href: "/connections",
      label: "Connections",
      icon: Link2,
      animClass: "group-hover:rotate-45 group-hover:scale-110"
    },
  ]

  const isSettingsActive = !isFoldersSubSidebarOpen && pathname.startsWith("/settings")

  return (
    <div className="flex shrink-0 h-full select-none relative z-10">
      <aside
        className={`bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-16" : "w-56"
        }`}
      >
      <div className="flex flex-col">
        {/* Top Brand Header + Toggle Button (Unified with Navbar) */}
        <div
          className={`h-16 flex items-center ${
            isCollapsed ? "justify-center px-2" : "justify-between px-3.5"
          }`}
        >
          <Link
            href="/chat"
            onClick={() => {
              if (isFoldersSubSidebarOpen) {
                setIsFoldersSubSidebarOpen(false)
              }
              if (isSettingsSubSidebarOpen) {
                setIsSettingsSubSidebarOpen(false)
              }
            }}
            className="flex items-center overflow-hidden group py-1"
          >
            {isCollapsed ? (
              <img
                src="/a-logo.png"
                alt="Automate Business"
                className="h-7.5 w-7.5 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <img
                src="/logo.png"
                alt="Automate Business"
                className="h-7 w-auto max-w-[135px] object-contain transition-transform duration-300 group-hover:scale-102"
              />
            )}
          </Link>

          {/* Collapse / Expand Toggle Button */}
          {!isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsCollapsed(false)
                setIsFoldersSubSidebarOpen(false)
                setIsSettingsSubSidebarOpen(false)
                setIsAppBuilderSubSidebarOpen(false)
              }}
              className="absolute -right-3 top-5 z-30 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer group hover:scale-110"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Navigation Items with Clear Section Headers */}
        <div className="p-2 space-y-4 mt-1">
          {/* SECTION 1: PLATFORM MAIN */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Platform
              </div>
            )}

            {mainNavItems.map((item) => {
              const Icon = item.icon

              if (item.isFoldersToggle) {
                const isActive = isFoldersSubSidebarOpen
                return (
                  <button
                    key="nav-folders"
                    type="button"
                    onClick={() => {
                      if (isSettingsSubSidebarOpen) {
                        setIsSettingsSubSidebarOpen(false)
                      }
                      if (!pathname.startsWith("/workflows")) {
                        setIsFoldersSubSidebarOpen(true)
                        const targetQuery = selectedFolder && selectedFolder !== "All Folders"
                          ? `?folder=${encodeURIComponent(selectedFolder)}`
                          : ""
                        router.push(`/workflows${targetQuery}`)
                      } else {
                        toggleFoldersSubSidebar()
                      }
                    }}
                    className={`w-full group relative flex items-center cursor-pointer ${
                      isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                    } rounded-lg text-xs font-medium transition-colors duration-200 active:scale-[0.98] ${
                      isActive
                        ? "text-blue-600 dark:text-white font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                    title={isCollapsed ? `Folders (${folders.length})` : undefined}
                  >
                    {/* Sliding Active Pill Background */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-lg bg-blue-50/90 dark:bg-white/[0.08] border border-blue-100 dark:border-white/[0.12] shadow-2xs pointer-events-none"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}

                    {/* Left Active Accent Indicator */}
                    {isActive && !isCollapsed && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-white rounded-r-full z-10 pointer-events-none"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}

                    {/* Animated Icon on Hover */}
                    <Icon
                      className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${item.animClass} ${
                        isActive ? "text-blue-600 dark:text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                      }`}
                    />
                    
                    {!isCollapsed && (
                      <div className="relative z-10 ml-3 flex items-center justify-between flex-1 truncate">
                        <span className="truncate">{item.label}</span>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full border transition-colors ${
                              isActive
                                ? "bg-blue-100/80 dark:bg-white/10 text-blue-700 dark:text-white border-blue-200 dark:border-white/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/80 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-slate-800/80 group-hover:text-blue-600 dark:group-hover:text-white group-hover:border-blue-200 dark:group-hover:border-slate-700"
                            }`}
                          >
                            {folders.length}
                          </span>
                          <ChevronRight
                            className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                              isActive ? "rotate-90 text-blue-600 dark:text-white font-semibold" : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tooltip in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                        {item.label} ({folders.length})
                      </div>
                    )}
                  </button>
                )
              }

              const isActive =
                (!isFoldersSubSidebarOpen && !isSettingsSubSidebarOpen && !isAppBuilderSubSidebarOpen && pathname.startsWith(item.href)) ||
                (item.href === "/developer" && isAppBuilderSubSidebarOpen)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsFoldersSubSidebarOpen(false)
                    setIsSettingsSubSidebarOpen(false)
                    if (item.href !== "/developer") {
                      setIsAppBuilderSubSidebarOpen(false)
                    }
                    if (item.href === "/workflows") {
                      setSelectedFolder("All Folders")
                    }
                  }}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                  } rounded-lg text-xs font-medium transition-colors duration-200 active:scale-[0.98] ${
                    isActive
                      ? "text-blue-600 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {/* Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-lg bg-blue-50/90 dark:bg-white/[0.08] border border-blue-100 dark:border-white/[0.12] shadow-2xs pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Left Active Accent Indicator */}
                  {isActive && !isCollapsed && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-white rounded-r-full z-10 pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Animated Icon on Hover */}
                  <Icon
                    className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${item.animClass} ${
                      isActive ? "text-blue-600 dark:text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                    }`}
                  />
                  
                  {!isCollapsed && (
                    <div className="relative z-10 ml-3 flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {"badge" in item && item.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* SECTION 2: PREFERENCES & SETTINGS */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Preferences
              </div>
            )}

            {/* Settings Sub-Sidebar Toggle Button */}
            {(() => {
              const isActive = isSettingsSubSidebarOpen || (pathname.startsWith("/settings") && !isFoldersSubSidebarOpen)

              return (
                <button
                  key="nav-settings"
                  type="button"
                  onClick={() => {
                    if (isFoldersSubSidebarOpen) {
                      setIsFoldersSubSidebarOpen(false)
                    }
                    if (!pathname.startsWith("/settings")) {
                      setIsSettingsSubSidebarOpen(true)
                      const currentTab = searchParams.get("tab") || "account"
                      router.push(`/settings?tab=${currentTab}`)
                    } else {
                      setIsSettingsSubSidebarOpen(!isSettingsSubSidebarOpen)
                    }
                  }}
                  className={`w-full group relative flex items-center cursor-pointer ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                  } rounded-lg text-xs font-medium transition-colors duration-200 active:scale-[0.98] ${
                    isActive
                      ? "text-blue-600 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  title={isCollapsed ? "Settings (3)" : undefined}
                >
                  {/* Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-lg bg-blue-50/90 dark:bg-white/[0.08] border border-blue-100 dark:border-white/[0.12] shadow-2xs pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Left Active Accent Indicator */}
                  {isActive && !isCollapsed && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-white rounded-r-full z-10 pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Animated Gear Spinning Icon on Hover */}
                  <Settings
                    className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-500 ease-in-out group-hover:rotate-180 ${
                      isActive ? "text-blue-600 dark:text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="relative z-10 ml-3 flex items-center justify-between flex-1 truncate">
                      <span className="truncate">Settings</span>
                      <div className="flex items-center space-x-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full border transition-colors ${
                              isActive
                                ? "bg-blue-100/80 dark:bg-white/10 text-blue-700 dark:text-white border-blue-200 dark:border-white/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/80 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-slate-800/80 group-hover:text-blue-600 dark:group-hover:text-white group-hover:border-blue-200 dark:group-hover:border-slate-700"
                            }`}
                          >
                            5
                          </span>
                          <ChevronRight
                            className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                              isSettingsSubSidebarOpen ? "rotate-90 text-blue-600 dark:text-white font-semibold" : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            }`}
                          />
                      </div>
                    </div>
                  )}

                  {/* Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                      Settings (5)
                    </div>
                  )}
                </button>
              )
            })()}
          </div>

          {/* SECTION 3: HELP & SUPPORT */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Support
              </div>
            )}

            {/* Create Custom App (Developer route) */}
            {(() => {
              const isActive =
                (!isFoldersSubSidebarOpen && !isSettingsSubSidebarOpen && pathname.startsWith("/developer")) ||
                isAppBuilderSubSidebarOpen

              return (
                <Link
                  href="/developer"
                  onClick={() => {
                    setIsFoldersSubSidebarOpen(false)
                    setIsSettingsSubSidebarOpen(false)
                  }}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                  } rounded-lg text-xs font-medium transition-colors duration-200 active:scale-[0.98] ${
                    isActive
                      ? "text-blue-600 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {/* Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-lg bg-blue-50/90 dark:bg-white/[0.08] border border-blue-100 dark:border-white/[0.12] shadow-2xs pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Left Active Accent Indicator */}
                  {isActive && !isCollapsed && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-white rounded-r-full z-10 pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Animated Icon on Hover */}
                  <Code2
                    className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 ${
                      isActive ? "text-blue-600 dark:text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="relative z-10 ml-3 truncate">
                      Create Custom App
                    </span>
                  )}

                  {/* Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                      Create Custom App
                    </div>
                  )}
                </Link>
              )
            })()}

            {/* Documentation & Help Link */}
            {(() => {
              const isActive =
                !isFoldersSubSidebarOpen && !isSettingsSubSidebarOpen && !isAppBuilderSubSidebarOpen && pathname.startsWith("/templates")

              return (
                <Link
                  href="/templates"
                  onClick={() => {
                    setIsFoldersSubSidebarOpen(false)
                    setIsSettingsSubSidebarOpen(false)
                    setIsAppBuilderSubSidebarOpen(false)
                  }}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                  } rounded-lg text-xs font-medium transition-colors duration-200 active:scale-[0.98] ${
                    isActive
                      ? "text-blue-600 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {/* Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-lg bg-blue-50/90 dark:bg-white/[0.08] border border-blue-100 dark:border-white/[0.12] shadow-2xs pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {/* Left Active Accent Indicator */}
                  {isActive && !isCollapsed && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-white rounded-r-full z-10 pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  <HelpCircle
                    className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:scale-120 group-hover:rotate-12 ${
                      isActive ? "text-blue-600 dark:text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && <span className="relative z-10 ml-3 truncate">Get Help & Templates</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                      Get Help & Templates
                    </div>
                  )}
                </Link>
              )
            })()}
          </div>
        </div>
      </div>
    </aside>

    {/* Sub-Sidebar for Folders */}
    <FoldersSubSidebar />

    {/* Sub-Sidebar for Settings */}
    <SettingsSubSidebar
      isOpen={isSettingsSubSidebarOpen}
      onClose={() => setIsSettingsSubSidebarOpen(false)}
    />

    {/* Sub-Sidebar for Developer App Builder Steps */}
    <AppBuilderSubSidebar
      isOpen={isAppBuilderSubSidebarOpen}
      onClose={() => setIsAppBuilderSubSidebarOpen(false)}
    />
  </div>
  )
}
