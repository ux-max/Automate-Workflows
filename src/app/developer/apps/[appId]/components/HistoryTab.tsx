"use client"

import React, { useState, useEffect, useMemo } from "react"
import { DeveloperApp, AppAuditLog, AppExecutionLog } from "@/lib/developer-types"
import { getAppAuditLogs, getAppExecutionLogs } from "@/lib/developer-data"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"
import {
  History,
  Activity,
  Zap,
  Layers,
  Sparkles,
  Lock,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Copy,
  Check,
  Code2,
  GitCommit,
  User,
  ExternalLink,
  ChevronDown
} from "lucide-react"

interface HistoryTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

export function HistoryTab({ app, onChange }: HistoryTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"executions" | "audit">("executions")
  const [executionLogs, setExecutionLogs] = useState<AppExecutionLog[]>([])
  const [auditLogs, setAuditLogs] = useState<AppAuditLog[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all")
  const [componentFilter, setComponentFilter] = useState<"all" | "action" | "trigger" | "inbuilt_action" | "auth_test">("all")

  // Selected Execution Log for Detailed Payload Inspector Dialog
  const [selectedExecLog, setSelectedExecLog] = useState<AppExecutionLog | null>(null)
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [replayingId, setReplayingId] = useState<string | null>(null)

  useEffect(() => {
    setExecutionLogs(getAppExecutionLogs(app.id))
    setAuditLogs(getAppAuditLogs(app.id))
  }, [app.id])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered Execution Logs
  const filteredExecLogs = useMemo(() => {
    return executionLogs.filter((log) => {
      const matchesSearch =
        log.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.requestUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" ? true : log.status === statusFilter
      const matchesComponent = componentFilter === "all" ? true : log.componentType === componentFilter
      return matchesSearch && matchesStatus && matchesComponent
    })
  }, [executionLogs, searchQuery, statusFilter, componentFilter])

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      return (
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [auditLogs, searchQuery])

  const handleReplayStep = (log: AppExecutionLog) => {
    setReplayingId(log.id)
    setTimeout(() => {
      setReplayingId(null)
      const newExec: AppExecutionLog = {
        ...log,
        id: `exec_${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: "Just now",
        status: "success",
        statusCode: 200,
        latencyMs: Math.floor(80 + Math.random() * 100)
      }
      setExecutionLogs([newExec, ...executionLogs])
      showToast(`Replayed ${log.componentName} — 200 OK (${newExec.latencyMs}ms)`)
    }, 800)
  }

  const copyPayloadJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const successCount = executionLogs.filter((l) => l.status === "success").length
  const errorCount = executionLogs.filter((l) => l.status === "error").length

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <Badge variant="success" className="fixed top-20 right-6 z-50 space-x-1.5 py-2 px-4 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium text-xs">{toastMessage}</span>
        </Badge>
      )}

      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Logs & Audit History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time execution traces and configuration audit trail.
          </p>
        </div>

        {/* Sub-Tab Switcher Buttons */}
        <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab("executions")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === "executions"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Executions</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 font-normal ml-1">
              {executionLogs.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("audit")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === "audit"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 font-normal ml-1">
              {auditLogs.length}
            </Badge>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Invocations
            </span>
            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1.5 block">
            {executionLogs.length}
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Success (2xx)
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 block">
            {successCount}
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Errors (4xx/5xx)
            </span>
            <div className="h-6 w-6 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <XCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-lg font-semibold text-red-600 dark:text-red-400 mt-1.5 block">
            {errorCount}
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Audit Events
            </span>
            <div className="h-6 w-6 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <GitCommit className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1.5 block">
            {auditLogs.length}
          </span>
        </Card>
      </div>

      {/* Unified Search Control Bar */}
      <SearchControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={activeSubTab === "executions" ? "Search executions by component or URL..." : "Search audit logs by action or member..."}
        showFiltersButton={false}
      >
        {activeSubTab === "executions" && (
          <div className="flex items-center space-x-2">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 p-0.5 rounded-md bg-slate-50 dark:bg-slate-800 shrink-0">
              {(["all", "success", "error"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer capitalize ${
                    statusFilter === st
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Component Filter */}
            <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 p-0.5 rounded-md bg-slate-50 dark:bg-slate-800 shrink-0">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "action", label: "Actions" },
                  { id: "trigger", label: "Triggers" },
                  { id: "inbuilt_action", label: "In-built" }
                ] as const
              ).map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => setComponentFilter(cp.id)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    componentFilter === cp.id
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {cp.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </SearchControlBar>

      {/* VIEW 1: EXECUTION TRACE LOGS */}
      {activeSubTab === "executions" && (
        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="w-[80px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Status</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400">Component</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400">Request</TableHead>
                  <TableHead className="w-[90px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Latency</TableHead>
                  <TableHead className="w-[110px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Time</TableHead>
                  <TableHead className="w-[120px] text-right whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                      No execution logs found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExecLogs.map((log) => {
                    const isSuccess = log.status === "success"

                    return (
                      <TableRow key={log.id} className="border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        {/* Status */}
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant={isSuccess ? "success" : "destructive"}
                            className="text-[10px] font-medium space-x-1"
                          >
                            <span>{log.statusCode}</span>
                          </Badge>
                        </TableCell>

                        {/* Component */}
                        <TableCell>
                          <div>
                            <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">
                              {log.componentName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              {log.componentKey} • {log.environment}
                            </span>
                          </div>
                        </TableCell>

                        {/* Request URL */}
                        <TableCell>
                          <div className="flex items-center space-x-1.5 font-mono text-xs">
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">
                              {log.requestMethod}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[260px]">
                              {log.requestUrl}
                            </span>
                          </div>
                        </TableCell>

                        {/* Latency */}
                        <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {log.latencyMs}ms
                        </TableCell>

                        {/* Timestamp */}
                        <TableCell className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedExecLog(log)}
                              className="h-6 px-2 text-xs font-normal border-slate-200 dark:border-slate-700"
                            >
                              <Eye className="h-3 w-3 mr-1 text-slate-500" />
                              <span>Inspect</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReplayStep(log)}
                              disabled={replayingId === log.id}
                              className="h-6 px-1.5 text-xs text-blue-600 dark:text-blue-400 font-normal"
                              title="Replay"
                            >
                              <RotateCw className={`h-3 w-3 ${replayingId === log.id ? "animate-spin" : ""}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* VIEW 2: CONFIGURATION AUDIT LOG */}
      {activeSubTab === "audit" && (
        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No configuration audit events found.
                </div>
              ) : (
                filteredAuditLogs.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-700 text-white font-medium text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {item.actorName[0]}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{item.actorName}</span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{item.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-normal">
                            {item.action}
                          </p>

                          {/* Diff Details */}
                          {item.diffDetails && item.diffDetails.length > 0 && (
                            <div className="mt-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-2 space-y-0.5 max-w-xl">
                              {item.diffDetails.map((diff, i) => (
                                <div key={i} className="text-xs font-mono flex items-center space-x-2">
                                  <span className="text-slate-400">{diff.field}:</span>
                                  <span className="line-through text-red-500">{diff.from}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-emerald-600 dark:text-emerald-400">{diff.to}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] font-normal text-slate-500">
                        {item.target}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DETAILED EXECUTION PAYLOAD INSPECTOR DIALOG */}
      {selectedExecLog && (
        <Dialog open={!!selectedExecLog} onOpenChange={(open) => !open && setSelectedExecLog(null)}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
              <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Execution Trace: {selectedExecLog.componentName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Trace ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedExecLog.id}</span> • Latency: {selectedExecLog.latencyMs}ms • Status: {selectedExecLog.statusCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Request Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  HTTP Request Payload ({selectedExecLog.requestMethod})
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyPayloadJson(selectedExecLog.requestPayload)}
                  className="h-6 px-2 text-[10px] space-x-1"
                >
                  {copiedPayload ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedPayload ? "Copied" : "Copy"}</span>
                </Button>
              </div>
              <pre className="p-3 text-[11px] font-mono bg-slate-900 text-slate-100 rounded-xl max-h-44 overflow-y-auto border border-slate-800">
                {JSON.stringify(selectedExecLog.requestPayload || {}, null, 2)}
              </pre>
            </div>

            {/* Response Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  HTTP Response Body ({selectedExecLog.statusCode})
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyPayloadJson(selectedExecLog.responsePayload)}
                  className="h-6 px-2 text-[10px] space-x-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </Button>
              </div>
              <pre className="p-3 text-[11px] font-mono bg-slate-900 text-slate-100 rounded-xl max-h-48 overflow-y-auto border border-slate-800">
                {JSON.stringify(selectedExecLog.responsePayload || {}, null, 2)}
              </pre>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedExecLog(null)}
              className="text-xs"
            >
              Close Inspector
            </Button>
            <Button
              type="button"
              onClick={() => {
                const target = selectedExecLog
                setSelectedExecLog(null)
                handleReplayStep(target)
              }}
              className="text-xs font-medium space-x-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Replay This Step</span>
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  )
}
