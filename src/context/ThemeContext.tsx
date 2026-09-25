"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { flushSync } from "react-dom"
import { usePathname } from "next/navigation"

import gsap from "gsap"

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  useEffect(() => {
    // Read stored preference: default to dark unless explicitly saved as light
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initialTheme: Theme = stored === "light" ? "light" : "dark"
    setThemeState(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  // Whenever navigating between routes or theme changes, ensure root class matches current active theme
  useEffect(() => {
    if (!mounted) return
    applyTheme(theme)
  }, [pathname, theme, mounted])

  const switchThemeWithShutter = (newTheme: Theme, event?: ThemeToggleEvent) => {
    if (newTheme === theme) return

    const root = document.documentElement

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

    // Check if View Transition API is supported and user does not prefer reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const hasViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !prefersReducedMotion

    if (!hasViewTransition) {
      flushSync(() => {
        setThemeState(newTheme)
        localStorage.setItem(STORAGE_KEY, newTheme)
        applyTheme(newTheme)
      })
      if (typeof document !== "undefined") {
        gsap.fromTo(document.body, { opacity: 0.85 }, { opacity: 1, duration: 0.25, ease: "power1.out" })
      }
      return
    }

    // Temporarily disable element CSS transitions so snapshot captures 100% final colors instantly
    root.classList.add("disable-theme-transitions")

    // Set initial coordinate variables for CSS fallback
    root.style.setProperty("--aperture-x", `${x}px`)
    root.style.setProperty("--aperture-y", `${y}px`)

    // Start View Transition with flushSync to guarantee React has committed the new DOM before the snapshot is taken
    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setThemeState(newTheme)
        localStorage.setItem(STORAGE_KEY, newTheme)
        applyTheme(newTheme)
      })
    })

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${Math.ceil(endRadius) + 40}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)"
        }
      )
    })

    transition.finished.finally(() => {
      root.classList.remove("disable-theme-transitions")
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
