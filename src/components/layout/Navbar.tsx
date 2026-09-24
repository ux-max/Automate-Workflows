"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  HelpCircle,
  Settings,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [globalSearch, setGlobalSearch] = useState("")

  // Profile Dropdown & Logout Modal State
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync avatar picture from localStorage if present
  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem("user_profile_avatar")
      if (savedAvatar) {
        setAvatarImage(savedAvatar)
      }
    } catch {
      // ignore
    }
  }, [])

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!dropdownOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [dropdownOpen])

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false)
    try {
      localStorage.removeItem("auth_token")
      sessionStorage.clear()
    } catch {
      // ignore
    }
    router.push("/login")
  }

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
    <>
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
            <Button size="sm" className="font-medium text-xs space-x-1.5 px-4 shadow-xs">
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
            <ThemeToggle
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300"
              iconClassName="h-5 w-5"
            />

            {/* Profile Avatar with Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700 text-white font-semibold text-xs border border-slate-300 dark:border-slate-600 shadow-2xs hover:opacity-90 transition-all cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                title="User profile & options"
              >
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt="Himanshu Pundir"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "H"
                )}
              </button>

              {/* Dropdown Menu Container */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100 select-none text-xs">
                  {/* User Profile Mini Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Himanshu Pundir
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      himanshupundir506@gmail.com
                    </p>
                  </div>

                  {/* Menu Options: Settings & Logout */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        router.push("/settings?tab=account")
                      }}
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        setLogoutModalOpen(true)
                      }}
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-500 dark:text-red-400" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <div className="flex items-start space-x-4">
          <div className="h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/60">
            <LogOut className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <DialogHeader className="text-left space-y-1 mb-2">
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                Log out of your account?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to log out? Any unsaved changes in workflows or configurations may be lost. You will need to sign back in to access your account.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-5 flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLogoutModalOpen(false)}
                className="text-xs font-semibold h-8 px-3.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-none cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmLogout}
                className="text-xs font-semibold h-8 px-4 shadow-none cursor-pointer text-white bg-red-600 hover:bg-red-700 active:bg-red-800"
              >
                Log out
              </Button>
            </DialogFooter>
          </div>
        </div>
      </Dialog>
    </>
  )
}
