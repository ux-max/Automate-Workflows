"use client"

import React, { useState, useRef, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
  Folder,
  FolderPlus,
  CheckCircle2,
  Workflow,
  X,
  ArrowUpDown,
  Check,
  Edit2,
  Copy,
  Play,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AppIcon } from "@/components/ui/app-icon"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { CreateWorkflowModal } from "@/components/workflow/CreateWorkflowModal"
import { useTableSelection, TableCheckbox } from "@/components/ui/table-bulk-actions"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { useFolders } from "@/context/FoldersContext"
import { INITIAL_WORKFLOWS, Workflow as WorkflowType } from "@/lib/data"

export default function DashboardPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    folders,
    addFolder,
    workflowLocations,
    moveWorkflow,
    selectFolderAndNavigate,
    selectedFolder,
    setSelectedFolder
  } = useFolders()
  const [workflows, setWorkflows] = useState<WorkflowType[]>(INITIAL_WORKFLOWS)
  const [searchQuery, setSearchQuery] = useState("")
  const [showOwnerFilter, setShowOwnerFilter] = useState(true)
  const [showRecommended, setShowRecommended] = useState(true)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [starredRows, setStarredRows] = useState<Record<string, boolean>>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Continuous 60fps smooth linear infinite glide, pausing on user hover
  React.useEffect(() => {
    let animId: number

    const step = () => {
      if (!isCarouselPaused && showRecommended && scrollRef.current) {
        const el = scrollRef.current
        const thirdWidth = el.scrollWidth / 3
        if (thirdWidth > 0 && el.scrollLeft >= thirdWidth * 2) {
          el.scrollLeft -= thirdWidth
        } else {
          el.scrollLeft += 0.8
        }
      }
      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [isCarouselPaused, showRecommended])

  // Create Folder Modal State
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [activeMoveWfId, setActiveMoveWfId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleToggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: w.status === "On" ? "Off" : "On" } : w))
    )
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    const folderName = newFolderName.trim()
    addFolder(folderName)
    setNewFolderName("")
    setCreateFolderOpen(false)
    selectFolderAndNavigate(folderName)
  }

  const handleMoveWorkflow = (wfId: string, targetFolder: string) => {
    moveWorkflow(wfId, targetFolder)
    setActiveMoveWfId(null)
    showToast(targetFolder ? `Moved workflow to '${targetFolder}'` : "Removed workflow from folder")
  }

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
    router.push(`/workflows/editor?id=${newId}&name=${encodeURIComponent(title)}`)
  }

  const [activeMenuWfId, setActiveMenuWfId] = useState<string | null>(null)

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

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: "smooth" })
    }
  }

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: "smooth" })
    }
  }

  const recommendedCards = [
    {
      id: "rec_1",
      title: "Log reaction-tagged messages into a centralized tracking sheet",
      apps: [
        { name: "Google Sheets", appId: "google-sheets" },
        { name: "Slack", appId: "slack" }
      ]
    },
    {
      id: "rec_2",
      title: "Save reaction notes to a central project sheet",
      apps: [
        { name: "Slack", appId: "slack" },
        { name: "Google Sheets", appId: "google-sheets" }
      ]
    },
    {
      id: "rec_3",
      title: "Create daily channel message summary row for project reports",
      apps: [
        { name: "Google Sheets", appId: "google-sheets" },
        { name: "Slack", appId: "slack" }
      ]
    },
    {
      id: "rec_4",
      title: "Create threaded customer support records in Google Sheets",
      apps: [
        { name: "Google Sheets", appId: "google-sheets" },
        { name: "Shopify", appId: "shopify" }
      ]
    },
    {
      id: "rec_5",
      title: "Send WhatsApp template notification on payment completion",
      apps: [
        { name: "Razorpay", appId: "razorpay" },
        { name: "Automate Chats", appId: "automate-chats" }
      ]
    },
    {
      id: "rec_6",
      title: "Schedule Google Calendar events from new Typeform entries",
      apps: [
        { name: "Typeform", appId: "typeform" },
        { name: "Google Calendar", appId: "google-calendar" }
      ]
    }
  ]

  // Status Filter State
  const [filterStatus, setFilterStatus] = useState<"all" | "On" | "Off" | "Draft">("all")

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || w.status === filterStatus
    const location = workflowLocations[w.id] || "No Folder"
    const matchesFolder =
      selectedFolder === "All Folders" || location === selectedFolder

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
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Premium Floating Pure White Main Canvas Container (Full width, tight outer margin frame) */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 md:space-y-7 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Workflows</h1>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {filteredWorkflows.length} {filteredWorkflows.length === 1 ? "workflow" : "workflows"}
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            size="sm"
            className="font-bold text-xs space-x-1.5 px-4 shadow-xs cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Create Workflow</span>
          </Button>
        </div>
      </div>

      {/* HERO SECTION WITH DISTINCT LIGHT BLUE TINT & SOFT SUBTLE DOTTED GRID BACKGROUND */}
      <div
        className="py-8 px-6 md:px-8 rounded-3xl border border-blue-100/90 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/60 via-slate-50/70 to-blue-50/40 dark:from-blue-950/30 dark:via-slate-900/60 dark:to-blue-950/20 relative overflow-hidden space-y-6 shadow-2xs"
        style={{
          backgroundImage: "radial-gradient(rgba(147, 197, 253, 0.4) 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px"
        }}
      >
        {/* Floating App Icon Badges on Left and Right of Title (Static Badges, No Hover Effects) */}
        <div
          className="absolute left-6 md:left-10 top-3 hidden md:flex items-center justify-center h-14 w-14 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-2xs select-none z-10 p-2.5"
          title="Slack"
        >
          <AppIcon appId="slack" appName="Slack" size={34} />
        </div>

        <div
          className="absolute left-44 md:left-52 top-7 hidden xl:flex items-center justify-center h-14 w-14 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-2xs select-none z-10 p-2.5"
          title="Google Sheets"
        >
          <AppIcon appId="google-sheets" appName="Google Sheets" size={34} />
        </div>

        <div
          className="absolute right-44 md:right-52 top-7 hidden xl:flex items-center justify-center h-14 w-14 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-2xs select-none z-10 p-2.5"
          title="Shopify"
        >
          <AppIcon appId="shopify" appName="Shopify" size={34} />
        </div>

        <div
          className="absolute right-6 md:right-10 top-3 hidden md:flex items-center justify-center h-14 w-14 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-2xs select-none z-10 p-2.5"
          title="WhatsApp"
        >
          <AppIcon appId="whatsapp" appName="WhatsApp" size={34} />
        </div>

        {/* Hero Greeting Text */}
        <div className="text-center space-y-1 py-2 relative z-20">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            Welcome back, Himanshu! What will you automate today?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
            Automate tasks between your favorite apps using pre-built templates or build custom workflows.
          </p>
        </div>

        {/* Recommended for You Carousel Container */}
        <div className="space-y-4 relative">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Recommended for you</h3>
            </div>
            <button
              onClick={() => setShowRecommended(!showRecommended)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors z-30 bg-white/90 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-2xs cursor-pointer"
            >
              {showRecommended ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showRecommended && (
            <div
              className="relative"
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {/* Left Smooth Multi-Stop Pure White Gradient Fade Overlay + Left Chevron Button */}
              <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-slate-900 dark:via-slate-900/85 dark:to-transparent pointer-events-none z-20 rounded-l-xl flex items-center justify-start pl-1">
                <button
                  onClick={handleScrollLeft}
                  className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all pointer-events-auto cursor-pointer"
                  title="Scroll Left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Horizontal Scroll Cards Track */}
              <div
                ref={scrollRef}
                className="flex items-stretch space-x-4 overflow-x-auto scrollbar-none py-2 px-4 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {[...recommendedCards, ...recommendedCards, ...recommendedCards].map((card, idx) => (
                  <Card
                    key={`${card.id}_${idx}`}
                    className="w-[320px] sm:w-[360px] shrink-0 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between space-y-4 group rounded-xl shadow-2xs"
                    onClick={() => router.push("/workflows/editor?new=true")}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-2 leading-relaxed">
                        {card.title}
                      </h4>
                      <MoreVertical className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold uppercase tracking-wider">Works great with:</span>
                      <div className="flex items-center space-x-2 text-xs">
                        {card.apps.map((app, i) => (
                          <div key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-200 font-medium bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-600/60 shadow-2xs text-[11px]">
                            <AppIcon appId={app.appId} appName={app.name} size={14} />
                            <span>{app.name}</span>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Right Smooth Multi-Stop Pure White Gradient Fade Overlay + Right Chevron Button */}
              <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-white via-white/85 to-transparent dark:from-slate-900 dark:via-slate-900/85 dark:to-transparent pointer-events-none z-20 rounded-r-xl flex items-center justify-end pr-1">
                <button
                  onClick={handleScrollRight}
                  className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all pointer-events-auto cursor-pointer"
                  title="Scroll Right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Folder/Status Filter Control Bar (Unified SearchControlBar) */}
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
        {selectedCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={requestBulkDelete}
            className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 font-bold text-xs space-x-1.5 shadow-none h-8 px-3 cursor-pointer animate-in fade-in"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
            <span>Delete ({selectedCount})</span>
          </Button>
        )}

        {/* Status Filter Dropdown (like Workflows page) */}
        <div className="w-36">
          <Select
            className="text-xs font-semibold h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "On", label: "Live (On)" },
              { value: "Off", label: "Paused (Off)" },
              { value: "Draft", label: "Drafts" }
            ]}
          />
        </div>

        <div className="w-56">
          <Select
            value={selectedFolder}
            onChange={(e) => {
              const fName = e.target.value
              if (fName === "All Folders") {
                router.push("/workflows")
              } else {
                selectFolderAndNavigate(fName)
              }
            }}
            options={[
              { value: "All Folders", label: `📁 All Folders (${workflows.length})` },
              ...folders.map((fName) => ({
                value: fName,
                label: `📁 ${fName} (${workflows.filter((w) => (workflowLocations[w.id] || "") === fName).length})`
              }))
            ]}
            className="h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100"
          />
        </div>
      </SearchControlBar>

      {/* Workflows Data Table with Clean Minimal Titles */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-visible rounded-xl relative z-10 space-y-3">
        {filteredWorkflows.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
              <Folder className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {searchQuery ? `No workflows match "${searchQuery}"` : "No workflows found"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {searchQuery
                  ? "Try searching with a different keyword or clear your query."
                  : "Get started by creating your first automation workflow."}
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              {searchQuery ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              ) : null}
              <Button
                size="sm"
                className="font-bold text-xs space-x-1.5 cursor-pointer"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Create Workflow</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible min-h-[360px] pb-10">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
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
                  <th className="py-3 px-4">Apps Chain</th>
                  <th className="py-3 px-4">Location Folder</th>
                  <th className="py-3 px-4">
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                      <span>Last Modified</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Last Run</th>
                  <th className="py-3 px-4 w-10 text-center">⭐</th>
                  <th className="py-3 px-4 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 relative">
                {filteredWorkflows.map((wf, rowIdx) => {
                  const currentLocation = workflowLocations[wf.id] || ""
                  const isMoveOpen = activeMoveWfId === wf.id
                  const openUpward = rowIdx === filteredWorkflows.length - 1 && filteredWorkflows.length > 3

                  return (
                    <tr
                      key={wf.id}
                      className={`transition-colors cursor-pointer group relative ${
                        isSelected(wf.id) ? "bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-50/70 dark:hover:bg-blue-950/60" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
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

                      {/* Icon & Name with CLEAN MINIMAL SEMIBOLD TYPOGRAPHY + ACCENT HOVER */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-7 w-7 rounded-lg bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                            <Workflow className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs tracking-tight">
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
                          <span className={`text-[11px] font-medium ${wf.status === "On" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400"}`}>
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
                              <div className="h-7 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
                                +{wf.steps.length - 3}
                              </div>

                              {/* Floating Tooltip Popover on Hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/chainMore:flex flex-col space-y-1.5 bg-slate-900 dark:bg-slate-950 text-white p-2 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none w-max border border-slate-800">
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                                  Remaining Apps ({wf.steps.length - 3}):
                                </div>
                                {wf.steps.slice(3).map((step, idx) => (
                                  <div key={idx} className="flex items-center space-x-1.5 bg-slate-800 dark:bg-slate-900 px-2.5 py-1 rounded-lg text-[11px] text-slate-200 border border-slate-700/80">
                                    <AppIcon appId={step.appId} appName={step.appName} size={14} />
                                    <span>{step.appName}</span>
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  </div>
                                ))}
                                {/* Tooltip Down Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-950" />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* LOCATION Column */}
                      <td className="py-3.5 px-4 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMoveWfId(isMoveOpen ? null : wf.id)}
                          className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-200 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 transition-colors"
                        >
                          <Folder className={`h-3.5 w-3.5 ${currentLocation ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} shrink-0`} />
                          <span className={`truncate max-w-[140px] ${!currentLocation ? "text-slate-400 dark:text-slate-500 font-normal italic" : ""}`}>
                            {currentLocation || "No Folder"}
                          </span>
                          <ChevronDown className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                        </button>

                        {isMoveOpen && (
                          <div className={`absolute left-2 z-[100] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 text-slate-700 dark:text-slate-200 ${openUpward ? "bottom-full mb-1" : "top-12"}`}>
                            <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                              Move Workflow To:
                            </div>

                            <button
                              onClick={() => handleMoveWorkflow(wf.id, "")}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                !currentLocation ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/50" : "text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <Folder className="h-3.5 w-3.5 text-slate-400" />
                                <span className="truncate text-slate-500 dark:text-slate-400 italic">None (No Folder)</span>
                              </div>
                              {!currentLocation && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                            </button>

                            {folders.map((fName) => (
                              <button
                                key={fName}
                                onClick={() => handleMoveWorkflow(wf.id, fName)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                  currentLocation === fName ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/50" : "text-slate-700 dark:text-slate-200"
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
                        <Star className={`h-4 w-4 cursor-pointer transition-colors ${starredRows[wf.id] ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-500"}`} />
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
                              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Edit Workflow</span>
                            </button>

                            <button
                              onClick={() => handleCloneWorkflow(wf)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                            >
                              <Copy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Clone Workflow</span>
                            </button>

                            <button
                              onClick={() => handleRunNowWorkflow(wf)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                            >
                              <Play className="h-3.5 w-3.5 text-amber-500" />
                              <span>Run Now</span>
                            </button>

                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                            <button
                              onClick={() => requestDeleteWorkflow(wf.id, wf.name)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors font-semibold cursor-pointer"
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
        <div className="py-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-normal">Showing 1–{filteredWorkflows.length} of {filteredWorkflows.length} workflows</span>

          <div className="flex items-center space-x-2 w-36">
            <Select
              value="25"
              options={[
                { value: "25", label: "25 per page" },
                { value: "50", label: "50 per page" },
                { value: "100", label: "100 per page" }
              ]}
              className="text-xs h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>
        </div>
      </Card>

      {/* Create Folder Modal */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogHeader>
          <div className="flex items-center space-x-2 text-blue-600">
            <FolderPlus className="h-5 w-5" />
            <DialogTitle>Create New Folder</DialogTitle>
          </div>
          <DialogDescription>
            Organize your workflows into named folders to manage client accounts and team projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateFolderSubmit} className="space-y-4 my-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Folder Name</label>
            <Input
              type="text"
              placeholder="e.g. Client Accounts, Marketing Campaigns, E-Commerce"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="font-bold">
              Create & View Folder
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

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

      {/* Create Workflow Modal (Matching Workflow Tab) */}
      <CreateWorkflowModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        folders={folders}
        defaultFolder=""
        onSubmit={handleCreateWorkflow}
      />
      </div>
    </div>
  )
}
