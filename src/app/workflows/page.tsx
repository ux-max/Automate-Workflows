"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Workflow,
  Plus,
  Search,
  Grid,
  List,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Star,
  Folder,
  ChevronDown,
  ArrowUpDown,
  Check,
  Edit2,
  Copy,
  Play,
  Trash2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AppIcon } from "@/components/ui/app-icon"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { CreateWorkflowModal } from "@/components/workflow/CreateWorkflowModal"
import { useTableSelection, TableCheckbox } from "@/components/ui/table-bulk-actions"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { useFolders } from "@/context/FoldersContext"
import { INITIAL_WORKFLOWS, Workflow as WorkflowType } from "@/lib/data"

export default function WorkflowsPage() {
  const router = useRouter()
  const {
    folders,
    workflowLocations,
    moveWorkflow,
    selectedFolder: selectedFolderFilter,
    setSelectedFolder: setSelectedFolderFilter
  } = useFolders()
  const [workflows, setWorkflows] = useState<WorkflowType[]>(INITIAL_WORKFLOWS)
  const [searchQuery, setSearchQuery] = useState("")
  const [showOwnerFilter, setShowOwnerFilter] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [starredRows, setStarredRows] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeMenuWfId, setActiveMenuWfId] = useState<string | null>(null)

  // Create Workflow Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newWorkflowTitle, setNewWorkflowTitle] = useState("")
  const [newWorkflowFolder, setNewWorkflowFolder] = useState("")

  const handleCreateWorkflow = (title: string, selectedFolder: string) => {
    const newId = `wf_${Date.now()}`
    const newWf: WorkflowType = {
      id: newId,
      name: title,
      status: "Draft",
      lastRunStatus: "never",
      lastRunDate: "Never",
      updatedAt: "Just now",
      taskCountThisMonth: 0,
      steps: []
    }
    setWorkflows((prev) => [newWf, ...prev])
    if (selectedFolder) {
      moveWorkflow(newId, selectedFolder)
    }
    showToast(
      selectedFolder
        ? `Created "${title}" in "${selectedFolder}"`
        : `Created "${title}" (No Folder)`
    )
    router.push(`/workflows/editor?id=${newId}&name=${encodeURIComponent(title)}&new=true`)
  }

  const [activeMoveWfId, setActiveMoveWfId] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleToggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === "On" ? "Off" : "On" } : w
      )
    )
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleMoveWorkflow = (wfId: string, targetFolder: string) => {
    moveWorkflow(wfId, targetFolder)
    setActiveMoveWfId(null)
    showToast(targetFolder ? `Moved workflow to '${targetFolder}'` : "Removed workflow from folder")
  }

  const handleCloneWorkflow = (wf: WorkflowType) => {
    const clonedWf: WorkflowType = {
      ...wf,
      id: `wf_${Date.now()}`,
      name: `${wf.name} (Copy)`,
      updatedAt: "Just now",
      status: "Off"
    }
    setWorkflows([clonedWf, ...workflows])
    setActiveMenuWfId(null)
    showToast(`Cloned "${wf.name}" successfully!`)
  }

  const handleRunNowWorkflow = (wf: WorkflowType) => {
    setActiveMenuWfId(null)
    showToast(`Triggered instant run for "${wf.name}"!`)
  }

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean
    mode: "single" | "bulk"
    wfId?: string
    wfName?: string
    count?: number
  }>({ open: false, mode: "single" })

  const requestDeleteWorkflow = (wfId: string, wfName: string) => {
    setActiveMenuWfId(null)
    setDeleteModalState({ open: true, mode: "single", wfId, wfName })
  }

  const requestBulkDelete = () => {
    if (selectedCount === 0) return
    setActiveMenuWfId(null)
    setDeleteModalState({
      open: true,
      mode: "bulk",
      count: selectedCount
    })
  }

  const handleConfirmDeleteWorkflow = () => {
    if (deleteModalState.mode === "bulk") {
      const count = selectedIds.length
      setWorkflows((prev) => prev.filter((w) => !selectedIds.includes(w.id)))
      clearSelection()
      showToast(`Deleted ${count} selected workflow${count === 1 ? "" : "s"}`)
    } else if (deleteModalState.wfId) {
      setWorkflows((prev) => prev.filter((w) => w.id !== deleteModalState.wfId))
      showToast(`Deleted workflow "${deleteModalState.wfName}"`)
    }
  }

  // Filter Popover & Criteria State
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "on" && w.status === "On") ||
      (statusFilter === "off" && w.status === "Off") ||
      (statusFilter === "draft" && w.status === "Draft")
    const location = workflowLocations[w.id] || ""
    const matchesFolder =
      selectedFolderFilter === "All Folders" || location === selectedFolderFilter

    return matchesSearch && matchesStatus && matchesFolder
  })

  const workflowIds = useMemo(
    () => filteredWorkflows.map((w) => w.id),
    [filteredWorkflows]
  )

  const {
    selectedIds,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    selectedCount
  } = useTableSelection(workflowIds)

  return (
    <div className="p-3 sm:p-4 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Premium Floating Pure White Main Canvas Container (Full width, tight outer margin frame) */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 border border-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Workflows Manager</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Create, configure, and monitor automated multi-step app workflows.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={requestBulkDelete}
                className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-300 font-medium text-xs space-x-1.5 shadow-none h-9 px-3.5 cursor-pointer animate-in fade-in"
              >
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span>Delete ({selectedCount})</span>
              </Button>
            )}

            <Button
              size="default"
              className="space-x-2 cursor-pointer"
              onClick={() => {
                setNewWorkflowTitle("")
                setNewWorkflowFolder(selectedFolderFilter !== "All Folders" ? selectedFolderFilter : "")
                setIsCreateModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Create Workflow</span>
            </Button>
          </div>
        </div>

        {/* Search & Filter Control Bar (Unified SearchControlBar) */}
        <SearchControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by workflow name, ID, or webhook..."
          chip={
            showOwnerFilter
              ? {
                  label: "Owner is",
                  value: "Me",
                  onRemove: () => setShowOwnerFilter(false)
                }
              : null
          }
          showFiltersButton={false}
        >
          {/* Folder Filter Selector (Matching Dashboard) */}
          <div className="w-48">
            <Select
              value={selectedFolderFilter}
              onChange={(e) => setSelectedFolderFilter(e.target.value)}
              options={[
                { value: "All Folders", label: `📁 All Folders (${workflows.length})` },
                ...folders.map((fName) => ({
                  value: fName,
                  label: `📁 ${fName} (${workflows.filter((w) => (workflowLocations[w.id] || "") === fName).length})`
                }))
              ]}
              className="h-8 bg-slate-50 dark:bg-slate-800 font-semibold text-xs border-slate-200 dark:border-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <Select
              className="text-xs font-semibold h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="on">Live (On)</option>
              <option value="off">Paused (Off)</option>
              <option value="draft">Drafts</option>
            </Select>
          </div>

          {/* View Toggle (Grid vs Table) */}
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

        {/* Workflows Content Area */}
        {viewMode === "grid" ? (
          filteredWorkflows.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-xl p-12 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Folder className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {selectedFolderFilter !== "All Folders"
                    ? `No workflows in '${selectedFolderFilter}'`
                    : "No workflows found"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedFolderFilter !== "All Folders"
                    ? "This folder is currently empty. You can create a new workflow or move existing workflows into this folder."
                    : "No workflows match your search query or filter criteria."}
                </p>
              </div>
              {selectedFolderFilter !== "All Folders" && (
                <div className="flex justify-center space-x-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={() => setSelectedFolderFilter("All Folders")}
                  >
                    View All Workflows
                  </Button>
                  <Button
                    size="sm"
                    className="font-medium text-xs space-x-1.5"
                    onClick={() => {
                      setNewWorkflowFolder(selectedFolderFilter !== "All Folders" ? selectedFolderFilter : "")
                      setIsCreateModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Workflow</span>
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkflows.map((wf) => (
                <Card
                  key={wf.id}
                  className="w-full border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between space-y-4 group rounded-xl shadow-2xs relative overflow-visible hover:z-30"
                  onClick={() => router.push(`/workflows/editor?id=${wf.id}`)}
                >
                {/* Header Title & Status Controls */}
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-2 leading-relaxed">
                    {wf.name}
                  </h4>
                  <div className="flex items-center space-x-2 shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={wf.status === "On"}
                      onCheckedChange={() => handleToggleStatus(wf.id)}
                    />
                    
                    {/* Interactive Options Menu */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setActiveMenuWfId(activeMenuWfId === wf.id ? null : wf.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeMenuWfId === wf.id && (
                        <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 text-xs text-left animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setActiveMenuWfId(null)
                              router.push(`/workflows/editor?id=${wf.id}`)
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Edit Workflow</span>
                          </button>

                          <button
                            onClick={() => handleCloneWorkflow(wf)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                          >
                            <Copy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Clone Workflow</span>
                          </button>

                          <button
                            onClick={() => handleRunNowWorkflow(wf)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                          >
                            <Play className="h-3.5 w-3.5 text-amber-500" />
                            <span>Run Now</span>
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                          <button
                            onClick={() => requestDeleteWorkflow(wf.id, wf.name)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            <span>Delete Workflow</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Works Great With Apps Section (Max 2 Badges + Badge count for overflow) */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 relative overflow-visible">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">
                    Works great with:
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs overflow-visible">
                    {wf.steps.slice(0, 2).map((step, i) => (
                      <div key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-2xs text-[11px] shrink-0">
                        <AppIcon appId={step.appId} appName={step.appName} size={14} />
                        <span className="truncate max-w-[100px]">{step.appName}</span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      </div>
                    ))}

                    {wf.steps.length > 2 && (
                      <div className="relative group shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800 text-[11px] cursor-pointer transition-colors shadow-2xs">
                          +{wf.steps.length - 2}
                        </div>

                        {/* Floating Tooltip Popover on Hover revealing remaining apps */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col space-y-1.5 bg-slate-900 dark:bg-slate-800 text-white p-2.5 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-none w-max border border-slate-700">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                            Remaining Apps ({wf.steps.length - 2}):
                          </div>
                          {wf.steps.slice(2).map((step, idx) => (
                            <div key={idx} className="flex items-center space-x-1.5 bg-slate-800 dark:bg-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] text-slate-200 border border-slate-700/80">
                              <AppIcon appId={step.appId} appName={step.appName} size={14} />
                              <span className="font-medium">{step.appName}</span>
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            </div>
                          ))}
                          {/* Tooltip Down Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Workflows List Table (100% Identical to Dashboard Table) */
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-visible rounded-xl relative z-10 space-y-3">
          {filteredWorkflows.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Folder className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {selectedFolderFilter !== "All Folders"
                      ? `No workflows in '${selectedFolderFilter}'`
                      : "No workflows found"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedFolderFilter !== "All Folders"
                      ? "This folder is currently empty. You can create a new workflow or move existing workflows into this folder."
                      : "No workflows match your search query or filter criteria."}
                  </p>
                </div>
                {selectedFolderFilter !== "All Folders" && (
                  <div className="flex justify-center space-x-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold"
                      onClick={() => setSelectedFolderFilter("All Folders")}
                    >
                      View All Workflows
                    </Button>
                    <Button
                      size="sm"
                      className="font-medium text-xs space-x-1.5"
                      onClick={() => {
                        setNewWorkflowFolder(selectedFolderFilter !== "All Folders" ? selectedFolderFilter : "")
                        setIsCreateModalOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Workflow</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-visible min-h-[360px] pb-10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <TableCheckbox
                          checked={isAllSelected}
                          indeterminate={isPartiallySelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all workflows"
                        />
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                          <span>Workflow Name</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Apps Chain</th>
                      <th className="py-3 px-4">Location Folder</th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                          <span>Last Modified</span>
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Last Run</th>
                      <th className="py-3 px-4 w-10 text-center">⭐</th>
                      <th className="py-3 px-4 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 relative">
                    {filteredWorkflows.map((wf, rowIdx) => {
                      const currentLocation = workflowLocations[wf.id] || ""
                      const isMoveOpen = activeMoveWfId === wf.id
                      const openUpward = rowIdx === filteredWorkflows.length - 1 && filteredWorkflows.length > 3

                      return (
                        <tr
                          key={wf.id}
                          className={`transition-colors cursor-pointer group relative ${
                            isSelected(wf.id) ? "bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                          }`}
                          onClick={() => router.push(`/workflows/editor?id=${wf.id}`)}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <TableCheckbox
                              checked={isSelected(wf.id)}
                              onChange={() => toggleSelect(wf.id)}
                              aria-label={`Select ${wf.name}`}
                            />
                          </td>

                          {/* Icon & Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-7 w-7 rounded-lg bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                                <Workflow className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs tracking-tight">
                                {wf.name}
                              </span>
                            </div>
                          </td>

                          {/* Status Toggle Switch */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={wf.status === "On"}
                                onCheckedChange={() => handleToggleStatus(wf.id)}
                              />
                              <span className={`text-[11px] font-medium ${wf.status === "On" ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                                {wf.status}
                              </span>
                            </div>
                          </td>

                          {/* Apps Icons Chain with Max 3 icons + (+N) Hover Popover Badge */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center space-x-1.5">
                              {wf.steps.slice(0, 3).map((s, idx) => (
                                <div key={idx} className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center p-1 shadow-2xs shrink-0" title={s.appName}>
                                  <AppIcon appId={s.appId} appName={s.appName} size={16} />
                                </div>
                              ))}

                              {wf.steps.length > 3 && (
                                <div className="relative group/chainMore shrink-0">
                                  <div className="h-7 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium text-[11px] flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
                                    +{wf.steps.length - 3}
                                  </div>

                                  {/* Floating Tooltip Popover on Hover */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/chainMore:flex flex-col space-y-1.5 bg-slate-900 dark:bg-slate-800 text-white p-2 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none w-max border border-slate-700">
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                                      Remaining Apps ({wf.steps.length - 3}):
                                    </div>
                                    {wf.steps.slice(3).map((step, idx) => (
                                      <div key={idx} className="flex items-center space-x-1.5 bg-slate-800 dark:bg-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] text-slate-200 border border-slate-700/80">
                                        <AppIcon appId={step.appId} appName={step.appName} size={14} />
                                        <span>{step.appName}</span>
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                      </div>
                                    ))}
                                    {/* Tooltip Down Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* LOCATION Column */}
                          <td className="py-3.5 px-4 relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveMoveWfId(isMoveOpen ? null : wf.id)}
                              className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 transition-colors"
                            >
                              <Folder className={`h-3.5 w-3.5 ${currentLocation ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} shrink-0`} />
                              <span className={`truncate max-w-[140px] ${!currentLocation ? "text-slate-400 dark:text-slate-500 font-normal italic" : ""}`}>
                                {currentLocation || "No Folder"}
                              </span>
                              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                            </button>

                            {isMoveOpen && (
                              <div className={`absolute left-2 z-[100] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 ${openUpward ? "bottom-full mb-1" : "top-12"}`}>
                                <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                  Move Workflow To:
                                </div>

                                <button
                                  onClick={() => handleMoveWorkflow(wf.id, "")}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                    !currentLocation ? "font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30" : "text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 truncate">
                                    <Folder className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="truncate text-slate-500 italic">None (No Folder)</span>
                                  </div>
                                  {!currentLocation && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                                </button>

                                {folders.map((fName) => (
                                  <button
                                    key={fName}
                                    onClick={() => handleMoveWorkflow(wf.id, fName)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                      currentLocation === fName ? "font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30" : "text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 truncate">
                                      <Folder className="h-3.5 w-3.5 text-slate-400" />
                                      <span className="truncate">{fName}</span>
                                    </div>
                                    {currentLocation === fName && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Last Modified */}
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-normal text-[11px]">
                            {wf.updatedAt || "Aug 19, 2026"}
                          </td>

                          {/* Last Run */}
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-normal text-[11px]">
                            {wf.lastRunDate || "Aug 19, 2026"}
                          </td>

                          {/* Star Favorite */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => handleToggleStar(wf.id, e)}>
                            <Star className={`h-4 w-4 cursor-pointer transition-colors ${starredRows[wf.id] ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"}`} />
                          </td>

                          {/* Options Menu with Upward/Downward Auto-Positioning & z-[100] */}
                          <td className="py-3.5 px-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => setActiveMenuWfId(activeMenuWfId === wf.id ? null : wf.id)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            {activeMenuWfId === wf.id && (
                              <div className={`absolute right-4 z-[100] w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 text-xs text-left animate-in fade-in zoom-in-95 ${openUpward ? "bottom-full mb-1" : "top-10"}`}>
                                <button
                                  onClick={() => {
                                    setActiveMenuWfId(null)
                                    router.push(`/workflows/editor?id=${wf.id}`)
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                  <span>Edit Workflow</span>
                                </button>

                                <button
                                  onClick={() => handleCloneWorkflow(wf)}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                >
                                  <Copy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Clone Workflow</span>
                                </button>

                                <button
                                  onClick={() => handleRunNowWorkflow(wf)}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                >
                                  <Play className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Run Now</span>
                                </button>

                                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                <button
                                  onClick={() => requestDeleteWorkflow(wf.id, wf.name)}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                  <span>Delete Workflow</span>
                                </button>
                              </div>
                            )}
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
              <span className="font-normal">Showing 1–{filteredWorkflows.length} of {filteredWorkflows.length} workflows</span>

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

        {/* Create Workflow Modal */}
        <CreateWorkflowModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          folders={folders}
          defaultFolder={newWorkflowFolder}
          onSubmit={handleCreateWorkflow}
        />

        {/* Reusable Alert Confirmation Modal for Workflow Deletion */}
        <ConfirmModal
          open={deleteModalState.open}
          onOpenChange={(open) => setDeleteModalState((prev) => ({ ...prev, open }))}
          title={deleteModalState.mode === "bulk" ? `Delete ${deleteModalState.count} Workflows?` : "Delete Workflow?"}
          description={
            deleteModalState.mode === "bulk"
              ? `Are you sure you want to delete ${deleteModalState.count} selected workflows? All connected triggers, action steps, mapping data, and automated executions will be permanently removed.`
              : "Are you sure you want to delete this workflow? All connected triggers, action steps, mapping data, and automated executions will be permanently removed."
          }
          itemName={deleteModalState.mode === "bulk" ? undefined : deleteModalState.wfName}
          itemCount={deleteModalState.mode === "bulk" ? deleteModalState.count : undefined}
          confirmText={deleteModalState.mode === "bulk" ? `Delete ${deleteModalState.count} Workflows` : "Delete Workflow"}
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDeleteWorkflow}
        />
      </div>
    </div>
  )
}
