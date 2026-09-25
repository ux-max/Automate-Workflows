import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Automate Workflows — Authentication and Onboarding",
  description: "Sign in, register, or onboard with Automate Workflows.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {children}
    </div>
  )
}