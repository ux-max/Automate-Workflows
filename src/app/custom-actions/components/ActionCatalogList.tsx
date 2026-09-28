"use client"

import React, { useState, useEffect } from "react"
import {
  Search,
  Plus,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Layers,
  Clock,
  Sparkles,
  PanelLeftClose,
  Pencil,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { CustomActionItem, CustomActionStatus } from "@/lib/custom-action-types"

interface ActionCatalogListProps {
  actions: CustomActionItem[]
  selectedActionId: string | null
  onSelectAction: (id: string) => void
  onNewAction: () => void
  onDeleteAction: (id: string) => void
  onPublishAction?: (id: string) => void
  onRenameAction?: (id: string, newName: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  width?: number
  isDragging?: boolean
  onStartResize?: (e: React.MouseEvent) => void
}

export function ActionCatalogList({
  actions,
  selectedActionId,
  onSelectAction,
  onNewAction,
  onDeleteAction,
  onPublishAction,
  onRenameAction,
  isCollapsed = false,
  onToggleCollapse,
  width = 300,
  isDragging = false,
  onStartResize
}: ActionCatalogListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Defense against browser credential autofill injecting user email into search query
  useEffect(() => {
    if (searchQuery && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery.trim())) {
      setSearchQuery("")
    }
  }, [searchQuery])
  const [renameModal, setRenameModal] = useState<{
    open: boolean
    actionId: string
    name: string
  }>({
    open: false,
    actionId: "",
    name: ""
  })

  const filtered = actions.filter((act) => {
    const q = searchQuery.toLowerCase()
    return (
      act.actionName.toLowerCase().includes(q) ||
      act.appName.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q)
    )
  })

  const handleConfirmRename = () => {
    if (!renameModal.name.trim()) return
    onRenameAction?.(renameModal.actionId, renameModal.name.trim())
    setRenameModal({ open: false, actionId: "", name: "" })
  }

  const getStatusBadge = (status: CustomActionStatus) => {
    switch (status) {
      case "live":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Live
          </span>
        )
      case "published":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Live
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700">
            Draft
          </span>
        )
    }
  }

  return (
    <aside
      style={{
        width: isCollapsed ? 0 : `${width}px`,
        minWidth: isCollapsed ? 0 : undefined,
        maxWidth: isCollapsed ? 0 : undefined
      }}
      className={`relative shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full select-none transition-[width] ${
        isDragging ? "transition-none select-none" : "duration-200 ease-out"
      } overflow-hidden ${
        isCollapsed
          ? "border-r-0 opacity-0 pointer-events-none"
          : "opacity-100"
      }`}
    >
      {/* Draggable Right Edge Resizer Handle */}
      {!isCollapsed && onStartResize && (
        <div
          onMouseDown={onStartResize}
          className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-40 group flex items-center justify-center hover:bg-blue-500/10 active:bg-blue-500/20 transition-colors"
          title="Drag to resize catalog width"
        >
          <div className="w-1 h-9 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-500 group-hover:h-12 group-active:bg-blue-600 transition-all shadow-xs" />
        </div>
      )}

      <div style={{ width: `${width}px` }} className="h-full flex flex-col">
        {/* Top Header Bar (Matching /chat History Drawer Header Style) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recents
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {actions.length} Custom Actions
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={onNewAction}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Create New Action"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New</span>
            </button>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Collapse Catalog"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="px-3.5 py-2.5 border-b border-slate-200/60 dark:border-slate-800">
          <div className="relative flex items-center">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="search"
              name="catalog_search_filter_query_prevent_autofill"
              id="catalog_search_filter_query_prevent_autofill"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-autocomplete="none"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 h-8 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Actions List (Matching /chat's interactive cards style) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
              <Layers className="h-8 w-8 mx-auto stroke-[1.5] text-slate-300 dark:text-slate-700" />
              <p className="font-medium">No actions found</p>
            </div>
          ) : (
            filtered.map((act) => {
              const isSelected = act.id === selectedActionId

              return (
                <div
                  key={act.id}
                  onClick={() => onSelectAction(act.id)}
                  className={`group relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-2xs ring-1 ring-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5 pr-2">
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      }`}
                    >
                      {act.appName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {act.actionName}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                    {getStatusBadge(act.status)}

                    {/* Three-Dot Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuId(activeMenuId === act.id ? null : act.id)
                        }}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          activeMenuId === act.id
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 opacity-100"
                            : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title="Action options"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {/* Dropdown Menu Popup */}
                      {activeMenuId === act.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuId(null)
                            }}
                          />
                          <div
                            className="absolute right-0 top-7 z-50 w-44 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs text-left animate-in fade-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Rename Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                setRenameModal({
                                  open: true,
                                  actionId: act.id,
                                  name: act.actionName
                                })
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-xs text-left cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Rename</span>
                            </button>

                            <div className="my-0.5 border-t border-slate-100 dark:border-slate-800" />

                            {/* Delete Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                onDeleteAction(act.id)
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors font-medium text-xs text-left cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Rename Action Modal */}
      <Dialog
        open={renameModal.open}
        onOpenChange={(open) => setRenameModal((prev) => ({ ...prev, open }))}
      >
        <DialogHeader>
          <DialogTitle>Rename Custom Action</DialogTitle>
          <DialogDescription>
            Enter a new name for this integration action.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <Input
            value={renameModal.name}
            onChange={(e) =>
              setRenameModal((prev) => ({ ...prev, name: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleConfirmRename()
              }
            }}
            placeholder="e.g. Cancel Order, Delete Sheet..."
            className="text-xs"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRenameModal({ open: false, actionId: "", name: "" })}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmRename}
            disabled={!renameModal.name.trim()}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </aside>
  )
}
