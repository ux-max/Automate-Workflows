"use client"

import React from "react"
import { Clock, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppIcon } from "@/components/ui/app-icon"
import { cn } from "@/lib/utils"

export interface WorkflowTemplateCardItem {
  id: string
  title: string
  description: string
  timeSaved?: string // e.g. "8 hrs/week", "5 hrs/week"
  savings?: string   // legacy fallback
  apps: string[]     // e.g. ["stripe", "googlesheets", "hubspot", "notion", "gmail"]
  category?: string
  tintColor?: "purple" | "blue" | "sky" | "indigo" | "emerald" | "rose" | "cyan" | "red" | "teal" | "amber" | "slate"
  templateId?: string
}

export interface WorkflowTemplateCardProps {
  template: WorkflowTemplateCardItem
  onClick?: (template: WorkflowTemplateCardItem) => void
  className?: string
}

const TINT_COLOR_MAP: Record<string, string> = {
  purple: "bg-purple-50/70 dark:bg-purple-950/20 border-t border-purple-100/80 dark:border-purple-900/30",
  blue: "bg-blue-50/70 dark:bg-blue-950/20 border-t border-blue-100/80 dark:border-blue-900/30",
  sky: "bg-sky-50/70 dark:bg-sky-950/20 border-t border-sky-100/80 dark:border-sky-900/30",
  indigo: "bg-indigo-50/70 dark:bg-indigo-950/20 border-t border-indigo-100/80 dark:border-indigo-900/30",
  emerald: "bg-emerald-50/70 dark:bg-emerald-950/20 border-t border-emerald-100/80 dark:border-emerald-900/30",
  rose: "bg-rose-50/70 dark:bg-rose-950/20 border-t border-rose-100/80 dark:border-rose-900/30",
  cyan: "bg-cyan-50/70 dark:bg-cyan-950/20 border-t border-cyan-100/80 dark:border-cyan-900/30",
  red: "bg-red-50/70 dark:bg-red-950/20 border-t border-red-100/80 dark:border-red-900/30",
  teal: "bg-teal-50/70 dark:bg-teal-950/20 border-t border-teal-100/80 dark:border-teal-900/30",
  amber: "bg-amber-50/70 dark:bg-amber-950/20 border-t border-amber-100/80 dark:border-amber-900/30",
  slate: "bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800"
}

export function WorkflowTemplateCard({
  template,
  onClick,
  className = ""
}: WorkflowTemplateCardProps) {
  const tintClass =
    TINT_COLOR_MAP[template.tintColor || "slate"] || TINT_COLOR_MAP.slate

  const maxVisibleApps = 4
  const visibleApps = template.apps.slice(0, maxVisibleApps)
  const remainingCount = template.apps.length - maxVisibleApps
  const displayTimeSaved = template.timeSaved || (template.savings && !template.savings.includes("$") ? template.savings : "5 hrs/week")

  return (
    <Card
      onClick={() => onClick && onClick(template)}
      className={cn(
        "w-[260px] sm:w-[276px] shrink-0 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group select-none text-left p-0",
        className
      )}
    >
      {/* Top Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[15px] text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 min-h-[42px]">
          {template.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mt-2 flex-1 min-h-[50px]">
          {template.description}
        </p>

        {/* Time Saved Badge */}
        <Badge
          variant="success"
          className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold self-start"
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>
            Save <strong className="font-bold">{displayTimeSaved}</strong>
          </span>
        </Badge>
      </div>

      {/* Bottom Tinted Apps Banner */}
      <div className={cn("px-4 py-3 rounded-b-2xl flex items-center justify-between", tintClass)}>
        <div className="flex items-center space-x-1.5">
          {visibleApps.map((appId, idx) => (
            <div
              key={idx}
              className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center justify-center p-1.5 shrink-0 transition-transform group-hover:scale-105"
              title={appId}
            >
              <AppIcon appId={appId} appName={appId} size={18} />
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="h-8 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              +{remainingCount}
            </div>
          )}
        </div>

        <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
      </div>
    </Card>
  )
}
