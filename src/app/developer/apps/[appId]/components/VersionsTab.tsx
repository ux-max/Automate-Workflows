"use client"

import React, { useState, useEffect } from "react"
import { DeveloperApp, AppVersion, AppVersionStatus } from "@/lib/developer-types"
import { getAppVersions, saveAppVersions } from "@/lib/developer-data"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"
import {
  GitBranch,
  Tag,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Layers,
  Zap,
  ShieldCheck,
  Check,
  Trash2
} from "lucide-react"

interface VersionsTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

export function VersionsTab({ app, onChange }: VersionsTabProps) {
  const [versions, setVersions] = useState<AppVersion[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Confirm Actions Modal State (Promote / Rollback / Delete)
  const [confirmModalState, setConfirmModalState] = useState<{
    open: boolean
    type: "promote" | "rollback" | "delete"
    version?: AppVersion
    title: string
    description: string
  }>({ open: false, type: "promote", title: "", description: "" })

  // Load versions on mount
  useEffect(() => {
    const loaded = getAppVersions(app.id)
    setVersions(loaded)
  }, [app.id])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handlePromoteToLive = (v: AppVersion) => {
    setConfirmModalState({
      open: true,
      type: "promote",
      version: v,
      title: `Promote v${v.version} to Production Live?`,
      description: `This will make v${v.version} the active release for all installing workspaces and workflow runs.`
    })
  }

  const handleRollback = (v: AppVersion) => {
    setConfirmModalState({
      open: true,
      type: "rollback",
      version: v,
      title: `Rollback to Stable Release v${v.version}?`,
      description: `Workflows will execute against schema definition v${v.version}. Any uncommitted draft changes will remain in draft.`
    })
  }

  const handleDeleteVersion = (v: AppVersion) => {
    setConfirmModalState({
      open: true,
      type: "delete",
      version: v,
      title: `Delete Version v${v.version}?`,
      description: `Are you sure you want to permanently remove draft version v${v.version}? This action cannot be undone.`
    })
  }

  const handleConfirmAction = () => {
    const v = confirmModalState.version
    if (!v) return

    if (confirmModalState.type === "promote") {
      const updated = versions.map((item) => {
        if (item.id === v.id) {
          return { ...item, status: "live" as AppVersionStatus, publishedAt: new Date().toISOString().split("T")[0] }
        }
        if (item.status === "live") {
          return { ...item, status: "archived" as AppVersionStatus }
        }
        return item
      })
      setVersions(updated)
      saveAppVersions(app.id, updated)
      onChange({ ...app, version: v.version, status: "published" })
      showToast(`v${v.version} is now Live in Production!`)
    } else if (confirmModalState.type === "rollback") {
      const updated = versions.map((item) => {
        if (item.id === v.id) {
          return { ...item, status: "live" as AppVersionStatus }
        }
        if (item.status === "live") {
          return { ...item, status: "archived" as AppVersionStatus }
        }
        return item
      })
      setVersions(updated)
      saveAppVersions(app.id, updated)
      onChange({ ...app, version: v.version })
      showToast(`Rolled back active production release to v${v.version}`)
    } else if (confirmModalState.type === "delete") {
      const updated = versions.filter((item) => item.id !== v.id)
      setVersions(updated)
      saveAppVersions(app.id, updated)
      showToast(`Deleted version v${v.version}`)
    }
  }

  const liveVersion = versions.find((v) => v.status === "live") || versions[0]
  const draftVersion = versions.find((v) => v.status === "draft")

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <Badge variant="success" className="fixed top-20 right-6 z-50 space-x-1.5 py-2 px-4 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium text-xs">{toastMessage}</span>
        </Badge>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Version History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-recorded revisions and release snapshots for {app.name}.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Active Draft */}
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Draft
            </span>
            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GitBranch className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center space-x-2">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              v{draftVersion ? draftVersion.version : app.version}
            </span>
            <Badge variant="blue" className="text-[10px] px-1.5 py-0 font-medium">
              {draftVersion ? "Draft" : "Current"}
            </Badge>
          </div>
        </Card>

        {/* Card 2: Live Release */}
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Live Release
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center space-x-2">
            <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              v{liveVersion?.version || "1.0.0"}
            </span>
            <Badge variant="success" className="text-[10px] px-1.5 py-0 font-medium">
              Live
            </Badge>
          </div>
        </Card>

        {/* Card 3: Total Versions */}
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Versions
            </span>
            <div className="h-6 w-6 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Tag className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center space-x-2">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {versions.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({versions.filter((v) => v.status === "archived").length} archived)
            </span>
          </div>
        </Card>
      </div>

      {/* Version History Table */}
      <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="w-[110px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                  Version
                </TableHead>
                <TableHead className="w-[90px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[240px]">
                  Changelog
                </TableHead>
                <TableHead className="w-[200px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                  Capabilities
                </TableHead>
                <TableHead className="w-[110px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                  Date
                </TableHead>
                <TableHead className="w-[110px] text-right whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => {
                const isLive = v.status === "live"
                const isDraft = v.status === "draft"

                return (
                  <TableRow
                    key={v.id}
                    className="border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    {/* Version Tag */}
                    <TableCell className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 whitespace-nowrap">
                        <Tag className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>v{v.version}</span>
                        {v.isBreaking && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 font-normal">
                            Breaking
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="whitespace-nowrap">
                      {isLive ? (
                        <Badge variant="success" className="text-[10px] font-medium space-x-1">
                          <Check className="h-2.5 w-2.5" />
                          <span>Live</span>
                        </Badge>
                      ) : isDraft ? (
                        <Badge variant="blue" className="text-[10px] font-medium">
                          Draft
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] font-medium text-slate-500">
                          Archived
                        </Badge>
                      )}
                    </TableCell>

                    {/* Changelog */}
                    <TableCell>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-normal line-clamp-1">
                        {v.changelog}
                      </p>
                    </TableCell>

                    {/* Capabilities */}
                    <TableCell className="whitespace-nowrap">
                      <div className="inline-flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-normal whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 shrink-0 whitespace-nowrap">
                          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{v.triggerCount} Triggers</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="inline-flex items-center space-x-1 shrink-0 whitespace-nowrap">
                          <Layers className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>{v.actionCount} Actions</span>
                        </span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500 font-normal whitespace-nowrap">
                      {v.publishedAt || v.createdAt}
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
                        {isDraft && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handlePromoteToLive(v)}
                            className="h-6 px-2 text-xs font-medium space-x-1"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            <span>Promote</span>
                          </Button>
                        )}

                        {!isLive && !isDraft && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRollback(v)}
                            className="h-6 px-2 text-xs font-normal border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                          >
                            <RotateCcw className="h-2.5 w-2.5 mr-1" />
                            <span>Rollback</span>
                          </Button>
                        )}

                        {isDraft && versions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVersion(v)}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                            title="Delete Draft Version"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        open={confirmModalState.open}
        onOpenChange={(open) => setConfirmModalState({ ...confirmModalState, open })}
        onConfirm={handleConfirmAction}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmText={
          confirmModalState.type === "promote"
            ? "Promote to Live"
            : confirmModalState.type === "rollback"
            ? "Confirm Rollback"
            : "Delete Version"
        }
        variant={confirmModalState.type === "delete" ? "danger" : "info"}
      />
    </div>
  )
}
