"use client"

import React, { useState, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Code2,
  ArrowUpDown,
  ChevronDown,
  Star,
  MoreVertical,
  Grid,
  List,
  Trash2,
  Check,
  Play,
  X,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Drawer } from "@/components/ui/drawer"
import { AppIcon } from "@/components/ui/app-icon"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { TableCheckbox } from "@/components/ui/table-bulk-actions"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { NodeExecutionCard } from "@/components/workflow/NodeExecutionCard"
import { INITIAL_RUN_HISTORY, RunHistoryItem } from "@/lib/data"

function RunHistoryContent() {
  const searchParams = useSearchParams()
  const filterWfId = searchParams.get("wfId")

  const [runs, setRuns] = useState<RunHistoryItem[]>(INITIAL_RUN_HISTORY)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [starredRows, setStarredRows] = useState<Record<string, boolean>>({})
  const [activeMenuRunId, setActiveMenuRunId] = useState<string | null>(null)

  // Multi-selection for bulk re-execution
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([])

  // Run Detail Drawer State
  const [selectedRun, setSelectedRun] = useState<RunHistoryItem | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [retryingStepIndex, setRetryingStepIndex] = useState<number | null>(null)
  const [isReexecutingWorkflow, setIsReexecutingWorkflow] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null)

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean
    mode: "single" | "bulk"
    runId?: string
    runName?: string
    count?: number
  }>({ open: false, mode: "single" })

  // Open confirm modal before deleting a single run
  const requestDeleteRun = (runId: string, runName: string) => {
    setActiveMenuRunId(null)
    setDeleteModalState({
      open: true,
      mode: "single",
      runId,
      runName
    })
  }

  // Open confirm modal before bulk delete
  const requestBulkDelete = () => {
    if (selectedRunIds.length === 0) return
    setDeleteModalState({
      open: true,
      mode: "bulk",
      count: selectedRunIds.length
    })
  }

  // Final confirmed deletion
  const handleConfirmDelete = () => {
    if (deleteModalState.mode === "bulk") {
      const count = selectedRunIds.length
      setRuns((prev) => prev.filter((r) => !selectedRunIds.includes(r.id)))
      setSelectedRunIds([])
      showToast(`Deleted ${count} selected workflow logs.`, "info")
    } else if (deleteModalState.runId) {
      const targetId = deleteModalState.runId
      setRuns((prev) => prev.filter((r) => r.id !== targetId))
      setSelectedRunIds((prev) => prev.filter((id) => id !== targetId))
      showToast(`Workflow execution log deleted.`, "info")
    }
  }

  const handleOpenDetail = (run: RunHistoryItem) => {
    setSelectedRun(run)
    setDetailDrawerOpen(true)
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Live Re-execute Entire Workflow
  const handleReexecuteRun = (runId: string) => {
    setIsReexecutingWorkflow(true)
    setTimeout(() => {
      const now = new Date()
      const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

      setRuns((prev) =>
        prev.map((r) => {
          if (r.id === runId) {
            const healedSteps = r.stepLogs.map((s) => ({
              ...s,
              status: "success" as const,
              duration: s.duration || "240ms",
              errorDetails: undefined
            }))
            return {
              ...r,
              status: "success" as const,
              timestamp: `${timestampStr} (Re-executed)`,
              duration: "1.1s",
              failedStepIndex: undefined,
              errorMessage: undefined,
              stepLogs: healedSteps
            }
          }
          return r
        })
      )

      setSelectedRun((prev) => {
        if (prev && prev.id === runId) {
          const healedSteps = prev.stepLogs.map((s) => ({
            ...s,
            status: "success" as const,
            duration: s.duration || "240ms",
            errorDetails: undefined
          }))
          return {
            ...prev,
            status: "success",
            timestamp: `${timestampStr} (Re-executed)`,
            duration: "1.1s",
            failedStepIndex: undefined,
            errorMessage: undefined,
            stepLogs: healedSteps
          }
        }
        return prev
      })

      setIsReexecutingWorkflow(false)
      showToast(`Workflow ${runId} re-executed successfully! All steps passed.`)
    }, 650)
  }

  // Live Retry Single Step
  const handleRetryStep = (runId: string, stepIndex: number) => {
    setRetryingStepIndex(stepIndex)
    setTimeout(() => {
      let runNowHealed = false

      setRuns((prev) =>
        prev.map((r) => {
          if (r.id === runId) {
            const updatedSteps = r.stepLogs.map((s, idx) => {
              if (idx === stepIndex) {
                return {
                  ...s,
                  status: "success" as const,
                  duration: "310ms",
                  errorDetails: undefined,
                  outputPayload: s.appId === "hubspot"
                    ? { vid: 541092, isNew: false, message: "Contact updated successfully via re-execution" }
                    : s.appId === "pipedrive"
                    ? { success: true, lead_id: "lead_89124", title: "Recovered Lead via Retry" }
                    : { status: "success", reExecutedAt: new Date().toISOString() }
                }
              }
              return s
            })

            const hasRemainingErrors = updatedSteps.some((s) => s.status === "error")
            runNowHealed = !hasRemainingErrors

            return {
              ...r,
              status: hasRemainingErrors ? "error" : ("success" as const),
              errorMessage: hasRemainingErrors ? r.errorMessage : undefined,
              failedStepIndex: hasRemainingErrors ? r.failedStepIndex : undefined,
              stepLogs: updatedSteps
            }
          }
          return r
        })
      )

      setSelectedRun((prev) => {
        if (prev && prev.id === runId) {
          const updatedSteps = prev.stepLogs.map((s, idx) => {
            if (idx === stepIndex) {
              return {
                ...s,
                status: "success" as const,
                duration: "310ms",
                errorDetails: undefined,
                outputPayload: s.appId === "hubspot"
                  ? { vid: 541092, isNew: false, message: "Contact updated successfully via re-execution" }
                  : s.appId === "pipedrive"
                  ? { success: true, lead_id: "lead_89124", title: "Recovered Lead via Retry" }
                  : { status: "success", reExecutedAt: new Date().toISOString() }
              }
            }
            return s
          })

          const hasRemainingErrors = updatedSteps.some((s) => s.status === "error")

          return {
            ...prev,
            status: hasRemainingErrors ? "error" : "success",
            errorMessage: hasRemainingErrors ? prev.errorMessage : undefined,
            failedStepIndex: hasRemainingErrors ? prev.failedStepIndex : undefined,
            stepLogs: updatedSteps
          }
        }
        return prev
      })

      setRetryingStepIndex(null)
      showToast(
        runNowHealed
          ? `Step ${stepIndex + 1} retried successfully! Entire workflow status is now Success.`
          : `Step ${stepIndex + 1} retried successfully!`
      )
    }, 600)
  }

  // Bulk Re-execute Selected Workflows
  const handleBulkReexecute = () => {
    if (selectedRunIds.length === 0) return
    const count = selectedRunIds.length

    setRuns((prev) =>
      prev.map((r) => {
        if (selectedRunIds.includes(r.id)) {
          return {
            ...r,
            status: "success" as const,
            timestamp: `Just now (Re-executed)`,
            duration: "1.1s",
            failedStepIndex: undefined,
            errorMessage: undefined,
            stepLogs: r.stepLogs.map((s) => ({
              ...s,
              status: "success" as const,
              duration: s.duration || "220ms",
              errorDetails: undefined
            }))
          }
        }
        return r
      })
    )

    showToast(`Successfully re-executed ${count} selected workflows!`)
    setSelectedRunIds([])
  }


  const filteredRuns = runs.filter((r) => {
    const matchesWf = !filterWfId || r.workflowId === filterWfId
    const matchesSearch =
      r.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.errorMessage && r.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesWf && matchesSearch && matchesStatus
  })

  // Select all handler
  const allFilteredSelected = filteredRuns.length > 0 && filteredRuns.every((r) => selectedRunIds.includes(r.id))
  const someFilteredSelected = filteredRuns.some((r) => selectedRunIds.includes(r.id)) && !allFilteredSelected
  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedRunIds([])
    } else {
      setSelectedRunIds(filteredRuns.map((r) => r.id))
    }
  }

  const handleToggleSelectRun = (runId: string) => {
    setSelectedRunIds((prev) =>
      prev.includes(runId) ? prev.filter((id) => id !== runId) : [...prev, runId]
    )
  }

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main White Container */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              Workflow Run History & Debugger
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Per-step execution payload inspector, failure alerts, and manual retry controls.
            </p>
          </div>

          {selectedRunIds.length > 0 && (
            <div className="flex items-center space-x-2 animate-in fade-in duration-150">
              <Button
                size="sm"
                onClick={handleBulkReexecute}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs space-x-1.5 shadow-none h-8 px-3 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Re-execute ({selectedRunIds.length})</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={requestBulkDelete}
                className="border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 font-semibold text-xs space-x-1.5 shadow-none h-8 px-3 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                <span>Delete ({selectedRunIds.length})</span>
              </Button>
            </div>
          )}
        </div>

        {/* Search & Filter Control Bar (Unified SearchControlBar) */}
        <SearchControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by workflow name, run ID, or error..."
          showFiltersButton={false}
        >
          <div className="w-44">
            <Select
              className="text-xs font-semibold h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Execution Statuses" },
                { value: "success", label: "Success" },
                { value: "error", label: "Failed / Error" },
                { value: "queued", label: "Queued" }
              ]}
            />
          </div>

          {/* Grid vs Table View Mode Switcher */}
          <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
              title="List Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </SearchControlBar>

        {/* Run History Content */}
        {viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRuns.map((run) => {
              const triggerAppId =
                run.stepLogs[0]?.appId ||
                (run.triggerSource.toLowerCase().includes("shopify")
                  ? "shopify"
                  : run.triggerSource.toLowerCase().includes("typeform")
                  ? "typeform"
                  : run.triggerSource.toLowerCase().includes("whatsapp")
                  ? "automate-chats"
                  : run.triggerSource.toLowerCase().includes("razorpay")
                  ? "razorpay"
                  : "automate-forms")
              const triggerAppName = run.stepLogs[0]?.appName || run.triggerSource

              return (
                <Card
                  key={run.id}
                  className="w-full border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between space-y-4 group rounded-xl shadow-2xs relative overflow-visible hover:z-20"
                  onClick={() => handleOpenDetail(run)}
                >
                  {/* Header: App Brand Icon + Title + Status Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 pr-2">
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                        <AppIcon appId={triggerAppId} appName={triggerAppName} size={28} />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {run.workflowName}
                      </h4>
                    </div>

                    <Badge variant={run.status === "success" ? "success" : "destructive"} className="text-[10px] font-semibold">
                      {run.status === "success" ? "Success" : "Failed"}
                    </Badge>
                  </div>

                  {/* Steps App Icons Sequence & Progress */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Step Trajectory ({run.stepLogs.length} nodes)</span>
                      <span className="font-mono text-[11px]">{run.duration}</span>
                    </div>

                    {/* Node Progress Bar Segments */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {run.stepLogs.map((s, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 flex-1 rounded-full ${
                            s.status === "error" ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          title={`${s.appName}: ${s.stepName} (${s.status})`}
                        />
                      ))}
                    </div>

                    {/* App Brand Icons Trajectory Flow */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pt-0.5 pb-0.5">
                      {run.stepLogs.map((s, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <ArrowRight className="h-2.5 w-2.5 text-slate-300 dark:text-slate-600 shrink-0" />}
                          <div
                            className={`h-6 w-6 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center p-0.5 shadow-2xs shrink-0 ${
                              s.status === "error"
                                ? "border-red-300 dark:border-red-800 ring-1 ring-red-200 dark:ring-red-900/50"
                                : "border-slate-200/90 dark:border-slate-700"
                            }`}
                            title={`${s.appName}: ${s.stepName} (${s.status})`}
                          >
                            <AppIcon appId={s.appId} appName={s.appName} size={15} />
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Footer Controls using App's Signature Theme */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-[11px]">{run.timestamp}</span>

                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReexecuteRun(run.id)}
                        className="h-7 px-2.5 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 shadow-none cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3 mr-1 text-slate-500 dark:text-slate-400" />
                        <span>Re-run</span>
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-none cursor-pointer"
                        onClick={() => handleOpenDetail(run)}
                      >
                        Inspect
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Table View */
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-2xs rounded-xl overflow-hidden bg-white dark:bg-slate-900 space-y-3">
            {filteredRuns.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">No execution logs found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No workflow run logs match your search filters or status criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-visible min-h-[360px] pb-10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <TableCheckbox
                          checked={allFilteredSelected}
                          indeterminate={someFilteredSelected}
                          onChange={handleToggleSelectAll}
                          aria-label="Select all execution logs"
                        />
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          <span>Workflow Name</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Trigger Source</th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          <span>Execution Timestamp</span>
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 w-10 text-center">⭐</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 relative">
                    {filteredRuns.map((run, rowIdx) => {
                      const openUpward = rowIdx === filteredRuns.length - 1 && filteredRuns.length > 3
                      const isSelected = selectedRunIds.includes(run.id)

                      return (
                        <tr
                          key={run.id}
                          className={`transition-colors cursor-pointer group relative ${
                            isSelected ? "bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                          }`}
                          onClick={() => handleOpenDetail(run)}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <TableCheckbox
                              checked={isSelected}
                              onChange={() => handleToggleSelectRun(run.id)}
                              aria-label={`Select run ${run.workflowName}`}
                            />
                          </td>

                          {/* Workflow Name with App Brand Icon & Hover Accent */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 shadow-2xs">
                                <AppIcon
                                  appId={
                                    run.stepLogs[0]?.appId ||
                                    (run.triggerSource.toLowerCase().includes("shopify")
                                      ? "shopify"
                                      : run.triggerSource.toLowerCase().includes("typeform")
                                      ? "typeform"
                                      : run.triggerSource.toLowerCase().includes("whatsapp")
                                      ? "automate-chats"
                                      : "automate-forms")
                                  }
                                  appName={run.stepLogs[0]?.appName || run.triggerSource}
                                  size={18}
                                />
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs tracking-tight">
                                {run.workflowName}
                              </span>
                            </div>
                          </td>

                          {/* Status Pill Badge */}
                          <td className="py-3.5 px-4">
                            <Badge variant={run.status === "success" ? "success" : "destructive"} className="text-[10px] font-semibold">
                              {run.status === "success" ? "Success" : "Failed"}
                            </Badge>
                          </td>

                          {/* Trigger Source with App Brand Icon */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
                              <div className="h-6 w-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center p-0.5 shadow-2xs shrink-0">
                                <AppIcon
                                  appId={
                                    run.triggerSource.toLowerCase().includes("shopify")
                                      ? "shopify"
                                      : run.triggerSource.toLowerCase().includes("typeform")
                                      ? "typeform"
                                      : run.triggerSource.toLowerCase().includes("whatsapp")
                                      ? "automate-chats"
                                      : "automate-forms"
                                  }
                                  appName={run.triggerSource}
                                  size={14}
                                />
                              </div>
                              <span className="text-xs">{run.triggerSource}</span>
                            </div>
                          </td>

                          {/* Execution Timestamp */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {run.timestamp}
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {run.duration}
                          </td>

                          {/* Star Favorite */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => handleToggleStar(run.id, e)}>
                            <Star
                              className={`h-4 w-4 cursor-pointer transition-colors ${
                                starredRows[run.id]
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
                              }`}
                            />
                          </td>

                          {/* Actions Column with Direct Re-run & Inspect Run */}
                          <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-semibold h-7 px-2.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 space-x-1"
                                onClick={() => handleReexecuteRun(run.id)}
                                title="Re-run this workflow execution"
                              >
                                <RotateCcw className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                <span>Re-run</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-semibold h-7 px-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                                onClick={() => handleOpenDetail(run)}
                              >
                                Inspect
                              </Button>

                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => setActiveMenuRunId(activeMenuRunId === run.id ? null : run.id)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>

                                {activeMenuRunId === run.id && (
                                  <div
                                    className={`absolute right-0 z-[100] w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 text-xs text-left animate-in fade-in zoom-in-95 ${
                                      openUpward ? "bottom-full mb-1" : "top-8"
                                    }`}
                                  >
                                    <button
                                      onClick={() => {
                                        setActiveMenuRunId(null)
                                        handleOpenDetail(run)
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                      <Code2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                      <span>Inspect Details</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setActiveMenuRunId(null)
                                        handleReexecuteRun(run.id)
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                                      <span>Re-execute Workflow</span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                    <button
                                      onClick={() => requestDeleteRun(run.id, run.workflowName)}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                      <span>Delete Log</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div className="py-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-normal">
                Showing 1–{filteredRuns.length} of {filteredRuns.length} run logs
              </span>

              <div className="flex items-center space-x-2 w-36">
                <Select
                  value="25"
                  options={[
                    { value: "25", label: "25 per page" },
                    { value: "50", label: "50 per page" },
                    { value: "100", label: "100 per page" }
                  ]}
                  className="text-xs h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200 font-medium"
                />
              </div>
            </div>
          </Card>
        )}

        {/* RUN DETAIL DRAWER */}
        <Drawer
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
          side="right"
          className="w-[760px] max-w-[95vw]"
          header={
            selectedRun ? (
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20 select-none">
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                    <AppIcon
                      appId={
                        selectedRun.stepLogs[0]?.appId ||
                        (selectedRun.triggerSource.toLowerCase().includes("shopify")
                          ? "shopify"
                          : selectedRun.triggerSource.toLowerCase().includes("typeform")
                          ? "typeform"
                          : selectedRun.triggerSource.toLowerCase().includes("whatsapp")
                          ? "automate-chats"
                          : "automate-forms")
                      }
                      appName={selectedRun.stepLogs[0]?.appName || selectedRun.triggerSource}
                      size={24}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {selectedRun.workflowName}
                      </h3>
                      <Badge
                        variant={selectedRun.status === "success" ? "success" : "destructive"}
                        className="text-[10px] font-semibold capitalize"
                      >
                        {selectedRun.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Task ID: {selectedRun.id} • {selectedRun.timestamp}
                    </p>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleReexecuteRun(selectedRun.id)}
                    disabled={isReexecutingWorkflow}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs space-x-1.5 shadow-xs cursor-pointer h-8 px-3"
                    title="Re-run entire workflow execution"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${isReexecutingWorkflow ? "animate-spin" : ""}`} />
                    <span>{isReexecutingWorkflow ? "Re-running..." : "Re-execute Workflow"}</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => setDetailDrawerOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close Drawer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null
          }
        >
          {selectedRun && (
            <div className="space-y-6">
              {/* Execution Summary KPI Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-2xs text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Status</span>
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    {selectedRun.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedRun.status}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Duration</span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 pt-0.5 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    {selectedRun.duration}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Steps Completed</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 pt-0.5">
                    {selectedRun.stepLogs.filter((s) => s.status === "success").length} / {selectedRun.stepLogs.length} Steps
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Trigger Source</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 pt-0.5 truncate" title={selectedRun.triggerSource}>
                    {selectedRun.triggerSource}
                  </p>
                </div>
              </div>

              {/* Overall Failure Warning if present */}
              {selectedRun.errorMessage && (
                <div className="p-4 bg-red-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start space-x-3 text-xs text-red-900 dark:text-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-semibold text-red-900 dark:text-red-200">Workflow Execution Stopped</h5>
                    <p className="text-red-700 dark:text-red-300 leading-relaxed font-mono text-[11px]">{selectedRun.errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Node-by-Node Execution Trajectory List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-0.5">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      Node-by-Node Execution Trajectory
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Inspect live payloads sent (Data In) and received (Data Out) at each node
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    {selectedRun.stepLogs.length} Nodes
                  </span>
                </div>

                <div className="space-y-3.5 relative">
                  {selectedRun.stepLogs.map((step, idx) => (
                    <div key={step.stepId || idx} className="relative">
                      {/* Step Connector Line */}
                      {idx > 0 && (
                        <div className="absolute -top-3.5 left-8 h-3.5 w-0.5 bg-slate-200 dark:bg-slate-800 -z-1" />
                      )}
                      <NodeExecutionCard
                        step={step}
                        stepIndex={idx}
                        totalSteps={selectedRun.stepLogs.length}
                        isTrigger={idx === 0}
                        onRetry={() => handleRetryStep(selectedRun.id, idx)}
                        isRetrying={retryingStepIndex === idx}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Drawer>

        {/* Reusable Alert Confirmation Modal for Delete Actions */}
        <ConfirmModal
          open={deleteModalState.open}
          onOpenChange={(open) => setDeleteModalState((prev) => ({ ...prev, open }))}
          title={
            deleteModalState.mode === "bulk"
              ? `Delete ${deleteModalState.count} Execution Logs?`
              : "Delete Execution Log?"
          }
          description={
            deleteModalState.mode === "bulk"
              ? `Are you sure you want to permanently delete these ${deleteModalState.count} execution logs? Step input and response payloads will be permanently removed.`
              : `Are you sure you want to delete this execution log? Step input and response payloads for this run will be permanently removed.`
          }
          itemName={deleteModalState.mode === "single" ? deleteModalState.runName : undefined}
          itemCount={deleteModalState.mode === "bulk" ? deleteModalState.count : undefined}
          confirmText={
            deleteModalState.mode === "bulk"
              ? `Delete ${deleteModalState.count} Logs`
              : "Delete Log"
          }
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  )
}

export default function RunHistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading run history...</div>}>
      <RunHistoryContent />
    </Suspense>
  )
}
