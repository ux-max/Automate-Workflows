"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Zap, Check, ArrowRight, Sparkles, ExternalLink, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CustomActionItem } from "@/lib/custom-action-types"

interface PrivateActionsTabProps {
  actions: CustomActionItem[]
  selectedEventId?: string
  selectedAppId?: string
  onSelectAction: (action: CustomActionItem) => void
  onSwitchToSetup?: () => void
  hideTitle?: boolean
}

export function PrivateActionsTab({
  actions,
  selectedEventId,
  onSelectAction,
  hideTitle = false
}: PrivateActionsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Only LIVE private actions can be used in workflows
  const liveActions = useMemo(() => {
    return actions.filter((a) => a.status === "live")
  }, [actions])

  // Filtered list by search query (action name and description)
  const filteredActions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return liveActions.filter((a) => {
      if (!q) return true
      return (
        a.actionName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      )
    })
  }, [liveActions, searchQuery])

  if (liveActions.length === 0) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900 flex items-center justify-center mx-auto shadow-2xs">
            <Zap className="h-6 w-6 stroke-[2]" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No Live Private Actions Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Build custom API actions with AI in the <strong>Action Builder</strong>. Once you deploy an action live, it will appear here ready to connect to any step in your workflow.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/custom-actions">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs space-x-1.5 shadow-2xs cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open Action Builder</span>
                <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner & Search */}
      <div className="space-y-3">
        {!hideTitle && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>Private Actions</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {liveActions.length} Live
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Custom integrations built and deployed via Action Builder
              </p>
            </div>

            <Link href="/custom-actions">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold h-8 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 space-x-1 hover:text-blue-600 cursor-pointer"
              >
                <span>Action Builder</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}

        {/* Search Bar & Quick Action Builder Link */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live private actions..."
              className="text-xs pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white text-slate-800 dark:text-slate-200"
            />
          </div>
          {hideTitle && (
            <Link href="/custom-actions">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold h-9 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 space-x-1.5 hover:text-blue-600 cursor-pointer shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Action Builder</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3 pt-1">
        {filteredActions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-2">
            <SlidersHorizontal className="h-6 w-6 mx-auto stroke-[1.5] text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching private actions</p>
            <p className="text-[11px]">Try adjusting your search query.</p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const isCurrentlySelected = selectedEventId === action.actionId

            return (
              <div
                key={action.id}
                onClick={() => onSelectAction(action)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative bg-white dark:bg-slate-900 ${
                  isCurrentlySelected
                    ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-100 dark:ring-blue-950 shadow-xs"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs"
                }`}
              >
                {/* Header: Action Name & Live Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-500/20" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {action.actionName}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {action.description || "Custom integration action generated via AI prompts"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live</span>
                  </span>
                </div>

                {/* Specs / Metadata Pill Row */}
                <div className="flex items-center space-x-2 pt-2.5 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    {action.fields.length} parameter{action.fields.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px]">TypeScript</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px]">{action.authType ? action.authType.replace(/_/g, " ") : "API Auth"}</span>

                  <div className="ml-auto flex items-center">
                    {isCurrentlySelected ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Active on Step</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                        <span>Use Action</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
