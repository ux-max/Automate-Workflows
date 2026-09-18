"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export type Theme = "light" | "dark"

export type ThemeToggleEvent =
  | React.MouseEvent<HTMLElement>
  | MouseEvent
  | { clientX?: number; clientY?: number }
  | undefined

interface ThemeContextType {
  theme: Theme
  toggleTheme: (event?: ThemeToggleEvent) => void
  setTheme: (theme: Theme, event?: ThemeToggleEvent) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "automate_theme"

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/onboarding",
  "/forgot-password",
  "/verify-email"
]

function isAuthPath(pathname?: string | null): boolean {
  if (!pathname) return false
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const isAuth = isAuthPath(pathname)

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname
    // If currently on any Auth or Onboarding route, NEVER apply dark theme
    if (isAuthPath(currentPath)) {
      root.classList.remove("dark")
      return
    }

    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  useEffect(() => {
    // Read stored preference or fall back to system dark mode preference
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    let initialTheme: Theme = "light"
    if (stored === "light" || stored === "dark") {
      initialTheme = stored
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      initialTheme = "dark"
    } else {
      initialTheme = "light"
    }
    setThemeState(initialTheme)

    if (isAuth) {
      document.documentElement.classList.remove("dark")
    } else {
      applyTheme(initialTheme)
    }
    setMounted(true)
  }, [])

  // Whenever navigating between routes:
  // - If entering Login/Signup/Onboarding: ensure light mode is strictly enforced
  // - If exiting back to dashboard/editor/workflows: automatically restore the user's active theme
  useEffect(() => {
    if (!mounted) return

    if (isAuth) {
      document.documentElement.classList.remove("dark")
    } else {
      applyTheme(theme)
    }
  }, [pathname, isAuth, theme, mounted])

  const switchThemeWithShutter = (newTheme: Theme, event?: ThemeToggleEvent) => {
    if (newTheme === theme) return

    const root = document.documentElement

    // Check if View Transition API is supported and user does not prefer reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const hasViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !prefersReducedMotion

    if (!hasViewTransition) {
      // Direct switch without view transition animation
      setThemeState(newTheme)
      localStorage.setItem(STORAGE_KEY, newTheme)
      applyTheme(newTheme)
      return
    }

    // Determine click/event coordinates for shutter aperture center
    let x = window.innerWidth - 75
    let y = 30

    if (
      event &&
      "currentTarget" in event &&
      event.currentTarget instanceof HTMLElement
    ) {
      const rect = event.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    } else if (
      event &&
      "clientX" in event &&
      typeof event.clientX === "number" &&
      typeof event.clientY === "number" &&
      (event.clientX > 0 || event.clientY > 0)
    ) {
      x = event.clientX
      y = event.clientY
    }

    // Compute maximum distance from click origin to the farthest corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Add temporary class to suppress conflicting component transitions and flickering
    root.classList.add("theme-transitioning")

    // Start View Transition
    const transition = (document as any).startViewTransition(() => {
      setThemeState(newTheme)
      localStorage.setItem(STORAGE_KEY, newTheme)
      applyTheme(newTheme)
    })

    transition.ready
      .then(() => {
        // Animate circular aperture clip-path on the new theme layer with relaxed, silky smooth timing
        const animation = root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 750,
            easing: "cubic-bezier(0.25, 0.9, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)"
          }
        )

        animation.onfinish = () => {
          root.classList.remove("theme-transitioning")
        }
      })
      .catch(() => {
        root.classList.remove("theme-transitioning")
      })

    transition.finished.finally(() => {
      root.classList.remove("theme-transitioning")
    })
  }

  const setTheme = (newTheme: Theme, event?: ThemeToggleEvent) => {
    switchThemeWithShutter(newTheme, event)
  }

  const toggleTheme = (event?: ThemeToggleEvent) => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark"
    switchThemeWithShutter(nextTheme, event)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
