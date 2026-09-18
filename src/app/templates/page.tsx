"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Search,
  ArrowRight,
  Workflow,
  Sparkles,
  Layers,
  Grid,
  List,
  ArrowUpDown,
  Star,
  MoreVertical,
  CheckCircle2,
  Copy,
  Eye,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AppIcon } from "@/components/ui/app-icon"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useTableSelection, TableCheckbox } from "@/components/ui/table-bulk-actions"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { SEED_TEMPLATES, Template, MVP_APPS } from "@/lib/data"

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>(SEED_TEMPLATES)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [starredRows, setStarredRows] = useState<Record<string, boolean>>({})
  const [activeMenuTplId, setActiveMenuTplId] = useState<string | null>(null)

  // Screen 10 State: Template Preview Modal
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleOpenPreview = (tpl: Template) => {
    setSelectedTemplate(tpl)
    setPreviewOpen(true)
  }

  const handleUseTemplate = (tplId: string) => {
    router.push(`/workflows/editor?template=${tplId}`)
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || tpl.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const templateIds = useMemo(
    () => filteredTemplates.map((t) => t.id),
    [filteredTemplates]
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
  } = useTableSelection(templateIds)

  // Delete Template Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean
    mode: "single" | "bulk"
    tplId?: string
    tplTitle?: string
    count?: number
  }>({ open: false, mode: "single" })

  const requestBulkDelete = () => {
    if (selectedCount === 0) return
    setDeleteModalState({
      open: true,
      mode: "bulk",
      count: selectedCount
    })
  }

  const handleConfirmDelete = () => {
    if (deleteModalState.mode === "bulk") {
      setTemplates((prev) => prev.filter((t) => !selectedIds.includes(t.id)))
      clearSelection()
    } else if (deleteModalState.tplId) {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteModalState.tplId))
    }
  }

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Premium Floating Pure White Main Canvas Container */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Pre-built Workflow Templates</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Browse and clone production-ready automation workflows for your business stack.
            </p>
          </div>

          {selectedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={requestBulkDelete}
              className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-300 font-bold text-xs space-x-1.5 shadow-none h-9 px-3.5 cursor-pointer animate-in fade-in"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Delete ({selectedCount})</span>
            </Button>
          )}
        </div>

        {/* Search, Filter & View Toggle Controls (Unified SearchControlBar) */}
        <SearchControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search templates by title or app..."
          showFiltersButton={false}
        >
          <div className="w-44">
            <Select
              className="text-xs font-semibold h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Lead Capture">Lead Capture</option>
              <option value="CRM Sync">CRM Sync</option>
              <option value="Notifications">Notifications</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Customer Support">Customer Support</option>
            </Select>
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

        {/* Templates Content Area */}
        {viewMode === "grid" ? (
          /* Grid View (Matching Dashboard Recommended Template Cards Design System) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => (
              <Card
                key={tpl.id}
                className="w-full border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between space-y-4 group rounded-xl shadow-2xs relative overflow-visible hover:z-20"
                onClick={() => handleOpenPreview(tpl)}
              >
                {/* Header Title + Category Badge */}
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-2 leading-relaxed">
                    {tpl.title}
                  </h4>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {tpl.category}
                  </Badge>
                </div>

                {/* Body: Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                  {tpl.description}
                </p>

                {/* Works Great With Apps Section */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 relative overflow-visible">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">
                    Works great with:
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs overflow-visible">
                    {tpl.apps.slice(0, 2).map((appId, i) => (
                      <div key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-2xs text-[11px] shrink-0">
                        <AppIcon appId={appId} appName={appId} size={14} />
                        <span className="truncate max-w-[100px] capitalize">{appId.replace("-", " ")}</span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      </div>
                    ))}

                    {tpl.apps.length > 2 && (
                      <div className="relative group/tplMore shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800 text-[11px] cursor-pointer transition-colors shadow-2xs">
                          +{tpl.apps.length - 2}
                        </div>

                        {/* Floating Tooltip Popover on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tplMore:flex flex-col space-y-1.5 bg-slate-900 dark:bg-slate-800 text-white p-2.5 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-none w-max border border-slate-700">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                            Remaining Apps ({tpl.apps.length - 2}):
                          </div>
                          {tpl.apps.slice(2).map((appId, idx) => (
                            <div key={idx} className="flex items-center space-x-1.5 bg-slate-800 dark:bg-slate-700 px-2.5 py-1 rounded-lg text-[11px] text-slate-200 border border-slate-700/80 capitalize">
                              <AppIcon appId={appId} appName={appId} size={14} />
                              <span>{appId.replace("-", " ")}</span>
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
        ) : (
          /* Table View (100% Identical Dashboard Data Table Layout) */
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-visible rounded-xl relative z-10 space-y-3">
            {filteredTemplates.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No templates found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No pre-built templates match your search query or category filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-visible min-h-[360px] pb-10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <TableCheckbox
                          checked={isAllSelected}
                          indeterminate={isPartiallySelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all templates"
                        />
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          <span>Template Title</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Apps Chain</th>
                      <th className="py-3 px-4">Configured Steps</th>
                      <th className="py-3 px-4 w-10 text-center">⭐</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 relative">
                    {filteredTemplates.map((tpl, rowIdx) => {
                      const openUpward = rowIdx === filteredTemplates.length - 1 && filteredTemplates.length > 3

                      return (
                        <tr
                          key={tpl.id}
                          className={`transition-colors cursor-pointer group relative ${
                            isSelected(tpl.id) ? "bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                          }`}
                          onClick={() => handleOpenPreview(tpl)}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <TableCheckbox
                              checked={isSelected(tpl.id)}
                              onChange={() => toggleSelect(tpl.id)}
                              aria-label={`Select ${tpl.title}`}
                            />
                          </td>

                          {/* Title with Icon & Hover Accent */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-7 w-7 rounded-lg bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                                <Workflow className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs tracking-tight block">
                                  {tpl.title}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1">
                                  {tpl.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">
                            <Badge variant="secondary" className="text-[10px]">
                              {tpl.category}
                            </Badge>
                          </td>

                          {/* Apps Chain with Brand Logos + (+N) Hover Popover */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center space-x-1.5">
                              {tpl.apps.slice(0, 3).map((appId, idx) => (
                                <div key={idx} className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center p-1 shadow-2xs shrink-0" title={appId}>
                                  <AppIcon appId={appId} appName={appId} size={16} />
                                </div>
                              ))}

                              {tpl.apps.length > 3 && (
                                <div className="relative group/tplTblChainMore shrink-0">
                                  <div className="h-7 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
                                    +{tpl.apps.length - 3}
                                  </div>

                                  {/* Floating Tooltip Popover on Hover */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tplTblChainMore:flex flex-col space-y-1.5 bg-slate-900 dark:bg-slate-800 text-white p-2 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none w-max border border-slate-700">
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                                      Remaining Apps ({tpl.apps.length - 3}):
                                    </div>
                                    {tpl.apps.slice(3).map((appId, idx) => (
                                      <div key={idx} className="flex items-center space-x-1.5 bg-slate-800 dark:bg-slate-700 px-2.5 py-1 rounded-lg text-[11px] text-slate-200 border border-slate-700/80 capitalize">
                                        <AppIcon appId={appId} appName={appId} size={14} />
                                        <span>{appId.replace("-", " ")}</span>
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

                          {/* Configured Steps */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium text-xs">
                            {tpl.stepCount} steps
                          </td>

                          {/* Star Favorite */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => handleToggleStar(tpl.id, e)}>
                            <Star className={`h-4 w-4 cursor-pointer transition-colors ${starredRows[tpl.id] ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"}`} />
                          </td>

                          {/* Actions Column with Auto-Upward Popover Menu */}
                          <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-semibold h-7 px-2.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => handleUseTemplate(tpl.id)}
                              >
                                Use Template
                              </Button>

                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => setActiveMenuTplId(activeMenuTplId === tpl.id ? null : tpl.id)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>

                                {activeMenuTplId === tpl.id && (
                                  <div className={`absolute right-0 z-[100] w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 text-xs text-left animate-in fade-in zoom-in-95 ${openUpward ? "bottom-full mb-1" : "top-8"}`}>
                                    <button
                                      onClick={() => {
                                        setActiveMenuTplId(null)
                                        handleUseTemplate(tpl.id)
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                      <Copy className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                      <span>Use Template</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setActiveMenuTplId(null)
                                        handleOpenPreview(tpl)
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>Preview Details</span>
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
              <span className="font-normal">Showing 1–{filteredTemplates.length} of {filteredTemplates.length} templates</span>

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

        {/* Screen 10: Template Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 my-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Category & Complexity:
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="blue">{selectedTemplate.category}</Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">• {selectedTemplate.stepCount} configured steps</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/40 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Workflow Architecture Overview</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Trigger:</span> {selectedTemplate.triggerSummary}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Action:</span> {selectedTemplate.actionSummary}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            {/* Primary Blue Button */}
            <Button onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate.id)}>
              Clone & Build Workflow
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Reusable Alert Confirmation Modal for Template Deletion */}
        <ConfirmModal
          open={deleteModalState.open}
          onOpenChange={(open) => setDeleteModalState((prev) => ({ ...prev, open }))}
          title={deleteModalState.mode === "bulk" ? `Delete ${deleteModalState.count} Templates?` : "Delete Template?"}
          description={
            deleteModalState.mode === "bulk"
              ? `Are you sure you want to remove ${deleteModalState.count} selected templates from your pre-built library?`
              : "Are you sure you want to delete this template?"
          }
          itemCount={deleteModalState.mode === "bulk" ? deleteModalState.count : undefined}
          confirmText={deleteModalState.mode === "bulk" ? `Delete ${deleteModalState.count} Templates` : "Delete Template"}
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  )
}
