"use client"

import React from "react"
import { WorkflowBuilderShowcase } from "./WorkflowBuilderShowcase"

interface AuthSplitLayoutProps {
  children: React.ReactNode
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="w-full min-h-screen lg:h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 overflow-x-hidden relative">
      {/* LEFT COLUMN: Animated Workflow Builder Showcase (50% Split) */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden border-r border-y border-slate-200 dark:border-zinc-800/90 rounded-r-3xl lg:rounded-r-[32px] bg-slate-100/90 dark:bg-[#151518] shadow-sm">
        <WorkflowBuilderShowcase />
      </div>

      {/* RIGHT COLUMN: Authentication Form (50% Split) */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[440px] my-auto py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
