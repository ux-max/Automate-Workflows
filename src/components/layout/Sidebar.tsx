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
  ChevronsUpDown,
  Folder
} from "lucide-react"
import { useFolders } from "@/context/FoldersContext"
import { FoldersSubSidebar } from "@/components/layout/FoldersSubSidebar"
import { SettingsSubSidebar } from "@/components/layout/SettingsSubSidebar"
import { AppBuilderSubSidebar } from "@/components/layout/AppBuilderSubSidebar"

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
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
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
            href="/dashboard"
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
                src="/icon.png"
                alt="Automate Business"
                className="h-8.5 w-8.5 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <img
                src="/logo.png"
                alt="Automate Business"
                className="h-8.5 w-auto max-w-[155px] object-contain transition-transform duration-300 group-hover:scale-102"
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
              className="absolute -right-3 top-5 z-30 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer group hover:scale-110"
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
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                    } rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                    title={isCollapsed ? `Folders (${folders.length})` : undefined}
                  >
                    {/* Left Active Accent Indicator */}
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                    )}

                    {/* Animated Icon on Hover */}
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${item.animClass} ${
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                    
                    {!isCollapsed && (
                      <div className="ml-3 flex items-center justify-between flex-1 truncate">
                        <span className="truncate">{item.label}</span>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                              isActive
                                ? "bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/80 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800"
                            }`}
                          >
                            {folders.length}
                          </span>
                          <ChevronRight
                            className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                              isActive ? "rotate-90 text-blue-600 dark:text-blue-400 font-bold" : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tooltip in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
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
                  } rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {/* Left Active Accent Indicator */}
                  {isActive && !isCollapsed && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  {/* Animated Icon on Hover */}
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${item.animClass} ${
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  
                  {!isCollapsed && (
                    <div className="ml-3 flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {"badge" in item && item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
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
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                  } rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  title={isCollapsed ? "Settings (3)" : undefined}
                >
                  {/* Left Active Accent Indicator */}
                  {isActive && !isCollapsed && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  {/* Animated Gear Spinning Icon on Hover */}
                  <Settings
                    className={`h-4 w-4 shrink-0 transition-transform duration-500 ease-in-out group-hover:rotate-180 ${
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="ml-3 flex items-center justify-between flex-1 truncate">
                      <span className="truncate">Settings</span>
                      <div className="flex items-center space-x-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                              isActive
                                ? "bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/80 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800"
                            }`}
                          >
                            5
                          </span>
                          <ChevronRight
                            className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                              isSettingsSubSidebarOpen ? "rotate-90 text-blue-600 dark:text-blue-400 font-bold" : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            }`}
                          />
                      </div>
                    </div>
                  )}

                  {/* Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
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
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                  } rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {/* Left Active Accent Indicator */}
                  {isActive && !isCollapsed && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  {/* Animated Icon on Hover */}
                  <Code2
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 ${
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="ml-3 truncate">Create Custom App</span>
                  )}

                  {/* Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                      Create Custom App
                    </div>
                  )}
                </Link>
              )
            })()}

            <Link
              href="/templates"
              onClick={() => {
                if (isFoldersSubSidebarOpen) {
                  setIsFoldersSubSidebarOpen(false)
                }
                if (isSettingsSubSidebarOpen) {
                  setIsSettingsSubSidebarOpen(false)
                }
              }}
              className={`group relative flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
              } rounded-lg text-xs font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60`}
            >
              {/* Animated Help Icon on Hover */}
              <HelpCircle className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-transform duration-300 ease-out group-hover:scale-120 group-hover:rotate-12" />
              {!isCollapsed && <span className="ml-3 truncate">Get Help & Templates</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                  Get Help & Templates
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom User Workspace Profile Card */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
        {!isCollapsed ? (
          <Link
            href="/settings?tab=account"
            onClick={() => {
              if (isFoldersSubSidebarOpen) {
                setIsFoldersSubSidebarOpen(false)
              }
              setIsSettingsSubSidebarOpen(true)
            }}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-slate-300 dark:border-slate-600 transition-transform duration-300 group-hover:scale-105">
                  H
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Himanshu Pundir
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Product Lead (Pro)</p>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-300 group-hover:scale-110" />
          </Link>
        ) : (
          <div className="flex justify-center py-1">
            <Link
              href="/settings?tab=account"
              onClick={() => {
                if (isFoldersSubSidebarOpen) {
                  setIsFoldersSubSidebarOpen(false)
                }
                setIsSettingsSubSidebarOpen(true)
              }}
              className="relative group"
            >
              <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-slate-300 transition-transform duration-300 group-hover:scale-110">
                H
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                Himanshu Pundir (Product Lead)
              </div>
            </Link>
          </div>
        )}
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
