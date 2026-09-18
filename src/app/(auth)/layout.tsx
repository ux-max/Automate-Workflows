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
    <div className="min-h-full w-full bg-slate-50 text-slate-900 flex flex-col justify-center selection:bg-blue-100 selection:text-blue-900">
      {children}
    </div>
  )
}