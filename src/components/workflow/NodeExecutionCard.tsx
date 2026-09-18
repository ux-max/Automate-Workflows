"use client"

import React, { useState } from "react"
import {
  Check,
  Copy,
  RotateCcw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Table as TableIcon,
  Search,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppIcon } from "@/components/ui/app-icon"

export interface StepExecutionLog {
  stepId: string
  stepName: string
  appName: string
  appId?: string
  status: "success" | "error" | "skipped" | "running"
  duration?: string
  inputPayload: any
  outputPayload: any
  errorDetails?: string
}

interface NodeExecutionCardProps {
  step: StepExecutionLog
  stepIndex: number
  totalSteps: number
  isTrigger?: boolean
  onRetry?: (stepIndex: number) => void
  isRetrying?: boolean
}

export function NodeExecutionCard({
  step,
  stepIndex,
  totalSteps,
  isTrigger = false,
  onRetry,
  isRetrying = false
}: NodeExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<"input" | "output">("output")
  const [viewFormat, setViewFormat] = useState<"simple" | "json">("simple")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState("")

  const activePayload = activeTab === "input" ? step.inputPayload : step.outputPayload

  // Flatten nested objects for the Simple Table view
  const flattenedEntries = React.useMemo(() => {
    if (!activePayload || typeof activePayload !== "object") return []
    const entries: { key: string; value: any; variableToken: string }[] = []

    const flatten = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([k, v]) => {
        const fullKey = prefix ? `${prefix}.${k}` : k
        const variableToken = `{{step_${stepIndex + 1}.${fullKey}}}`
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
          flatten(v, fullKey)
        } else {
          entries.push({ key: fullKey, value: v, variableToken })
        }
      })
    }

    flatten(activePayload)
    return entries
  }, [activePayload, stepIndex])

  const filteredEntries = React.useMemo(() => {
    if (!searchFilter.trim()) return flattenedEntries
    const q = searchFilter.toLowerCase()
    return flattenedEntries.filter(
      (e) =>
        e.key.toLowerCase().includes(q) ||
        String(e.value).toLowerCase().includes(q)
    )
  }, [flattenedEntries, searchFilter])

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 1800)
  }

  const isFailed = step.status === "error"
  const isSuccess = step.status === "success"

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
        isFailed
          ? "bg-white dark:bg-slate-900 border-red-200/90 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-700"
          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {/* 1. NODE HEADER (Accordion Bar) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
          isFailed ? "bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/70 dark:hover:bg-red-950/40" : "bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80"
        }`}
      >
        <div className="flex items-center space-x-3.5 min-w-0 pr-3">
          {/* App Brand Icon with Rounded Squircle */}
          <div className="relative shrink-0">
            <AppIcon appId={step.appId} appName={step.appName} size={36} />
            {isSuccess && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
            )}
            {isFailed && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                <XCircle className="h-2.5 w-2.5 stroke-[3]" />
              </div>
            )}
          </div>

          {/* Step Metadata & Titles */}
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                Step {stepIndex + 1} • {isTrigger || stepIndex === 0 ? "Trigger" : "Action"}
              </span>
              {step.duration && (
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-slate-400" />
                  {step.duration}
                </span>
              )}
            </div>

            <div className="flex items-baseline space-x-2 mt-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {step.appName}
              </h4>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                {step.stepName}
              </p>
            </div>
          </div>
        </div>

        {/* Right Status Badge & Collapse Toggle */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <Badge
            variant={isSuccess ? "success" : isFailed ? "destructive" : "secondary"}
            className="text-[10px] font-semibold capitalize"
          >
            {step.status}
          </Badge>

          <div className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* 2. EXPANDED NODE CONTENT */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
          {/* FAILED ERROR TRACE & RETRY BUTTON */}
          {isFailed && (
            <div className="p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200/90 dark:border-red-900/50 rounded-xl space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2.5 text-red-900 dark:text-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-red-900 dark:text-red-200">Execution Error</h5>
                    <p className="text-red-700 dark:text-red-300 mt-0.5 leading-relaxed font-mono text-[11px]">
                      {step.errorDetails || "An unexpected error occurred during execution."}
                    </p>
                  </div>
                </div>

                {onRetry && (
                  <Button
                    size="sm"
                    onClick={() => onRetry(stepIndex)}
                    disabled={isRetrying}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs space-x-1.5 shrink-0 shadow-none cursor-pointer h-8 px-3"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                    <span>{isRetrying ? "Retrying..." : "Retry Node"}</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* SUB-TABS: DATA IN VS DATA OUT */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
            {/* Left Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab("input")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === "input"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>Data In (Input Data)</span>
                {step.inputPayload && (
                  <span className="text-[10px] font-mono text-slate-400">
                    ({Object.keys(step.inputPayload || {}).length})
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("output")}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === "output"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>Data Out (Response Data)</span>
                {step.outputPayload && (
                  <span className="text-[10px] font-mono text-slate-400">
                    ({Object.keys(step.outputPayload || {}).length})
                  </span>
                )}
              </button>
            </div>

            {/* Right Controls: View Switcher (Simple Table vs JSON) + Copy All */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 p-0.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setViewFormat("simple")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                    viewFormat === "simple"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  title="Simple Key-Value View"
                >
                  <TableIcon className="h-3 w-3" />
                  <span>Simple</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewFormat("json")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                    viewFormat === "json"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  title="Raw JSON View"
                >
                  <Code2 className="h-3 w-3" />
                  <span>JSON</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(JSON.stringify(activePayload, null, 2), "all_json")}
                className="text-xs font-semibold h-7 px-2.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 space-x-1 cursor-pointer shadow-none"
                title="Copy entire payload to clipboard"
              >
                {copiedKey === "all_json" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* VIEW FORMAT 1: SIMPLE KEY-VALUE TABLE */}
          {viewFormat === "simple" ? (
            <div className="space-y-2.5">
              {/* Quick Filter Search Bar */}
              {flattenedEntries.length > 4 && (
                <div className="relative flex items-center max-w-xs">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5" />
                  <input
                    type="text"
                    placeholder="Filter properties..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                  />
                </div>
              )}

              {filteredEntries.length > 0 ? (
                <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredEntries.map(({ key, value, variableToken }) => {
                    const stringVal = typeof value === "object" ? JSON.stringify(value) : String(value)
                    const isCopied = copiedKey === `field_${key}`

                    return (
                      <div
                        key={key}
                        className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Property Name & Variable Mapping Tag */}
                        <div className="min-w-0 pr-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {key}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                              {variableToken}
                            </span>
                          </div>
                        </div>

                        {/* Value & 1-Click Copy */}
                        <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0 max-w-full sm:max-w-md">
                          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 truncate max-w-[280px]">
                            {stringVal}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopyText(stringVal, `field_${key}`)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                            title="Copy value"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                  {searchFilter ? `No fields matched "${searchFilter}"` : "No payload data recorded for this tab."}
                </div>
              )}
            </div>
          ) : (
            /* VIEW FORMAT 2: RAW SYNTAX-HIGHLIGHTED JSON VIEW */
            <div className="relative rounded-xl overflow-hidden border border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-950 p-4 shadow-inner">
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed scrollbar-none">
                {JSON.stringify(activePayload || {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
