"use client"

import React, { useState } from "react"
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Layers,
  Search,
  ChevronLeft,
  X
} from "lucide-react"
import { useFolders } from "@/context/FoldersContext"
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

export function FoldersSubSidebar() {
  const {
    folders,
    addFolder,
    isFoldersSubSidebarOpen,
    setIsFoldersSubSidebarOpen,
    selectedFolder,
    selectFolderAndNavigate,
    getFolderWorkflowCount
  } = useFolders()

  const [searchQuery, setSearchQuery] = useState("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [errorText, setErrorText] = useState("")

  if (!isFoldersSubSidebarOpen) return null

  const filteredFolders = folders.filter((f) =>
    f.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorText("")
    const trimmed = newFolderName.trim()
    if (!trimmed) {
      setErrorText("Folder name cannot be empty")
      return
    }
    const success = addFolder(trimmed)
    if (!success) {
      setErrorText("A folder with this name already exists")
      return
    }
    setNewFolderName("")
    setCreateModalOpen(false)
    selectFolderAndNavigate(trimmed)
  }

  return (
    <aside
      className="w-64 border-l border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 select-none h-full relative z-10 transition-all duration-200 ease-in-out animate-in slide-in-from-left-3"
      aria-label="Folders Sub-Sidebar"
    >
      {/* Sub-Sidebar Top Header (Aligned with Main Sidebar & Navbar: h-16) */}
      <div className="h-16 flex items-center justify-between px-4 bg-white dark:bg-slate-900 shrink-0 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100/90 dark:border-blue-900/60 shrink-0 shadow-2xs">
            <Folder className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col truncate">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
                Folders
              </span>
              <Badge variant="blue" className="text-[9px] font-medium px-1.5 py-0">
                {folders.length}
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              Browse & organize
            </span>
          </div>
        </div>

        {/* Close Sub-Sidebar Button */}
        <button
          type="button"
          onClick={() => setIsFoldersSubSidebarOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Close Folders Panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Folders List Container (Seamless white body unified with header and navbar) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Action Toolbar: + New Folder & Clean Search Filter */}
        <div className="p-3 space-y-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-800 shadow-2xs space-x-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 cursor-pointer h-8"
            onClick={() => {
              setNewFolderName("")
              setErrorText("")
              setCreateModalOpen(true)
            }}
          >
            <FolderPlus className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span>New Folder</span>
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-7.5 pl-8 pr-7 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Folders List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* ALL WORKFLOWS ROOT OPTION */}
          <button
            type="button"
            onClick={() => selectFolderAndNavigate("All Folders")}
            className={`w-full group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedFolder === "All Folders"
                ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            {/* Left Active Accent Indicator */}
            {selectedFolder === "All Folders" && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
            )}

            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <Layers
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  selectedFolder === "All Folders"
                    ? "text-blue-600 scale-105"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                }`}
              />
              <span className="truncate">All Folders</span>
            </div>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                selectedFolder === "All Folders"
                  ? "bg-blue-100/70 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              {getFolderWorkflowCount("All Folders")}
            </span>
          </button>

          {/* Section Header */}
          <div className="px-2 pt-3 pb-1 text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Your Folders</span>
            <span>{folders.length}</span>
          </div>

          {/* Custom Folders */}
          {filteredFolders.length === 0 ? (
            <div className="p-4 text-center space-y-1">
              <p className="text-xs text-slate-500 font-medium">No folders found</p>
              <p className="text-[10px] text-slate-400">
                {searchQuery ? "Try a different search query" : "Create your first folder above"}
              </p>
            </div>
          ) : (
            filteredFolders.map((fName) => {
              const isActive = selectedFolder === fName
              const count = getFolderWorkflowCount(fName)
              const IconComponent = isActive ? FolderOpen : Folder

              return (
                <button
                  key={fName}
                  type="button"
                  onClick={() => selectFolderAndNavigate(fName)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  title={fName}
                >
                  {/* Left Active Accent Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                    <IconComponent
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isActive
                          ? "text-blue-600 scale-105"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span className="truncate">{fName}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive
                        ? "bg-blue-100/70 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Create Folder Reusable Modal */}
      {createModalOpen && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogHeader className="text-left space-y-1 mb-3">
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <FolderPlus className="h-5 w-5" />
              <DialogTitle className="text-base font-semibold text-slate-800">
                Create New Folder
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Organize your workflows into named folders to manage client accounts and team projects.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Folder Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                autoFocus
                placeholder="e.g. Client Accounts, Marketing, E-Commerce"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value)
                  if (errorText) setErrorText("")
                }}
                className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
              />
              {errorText && (
                <p className="text-[11px] text-red-500 font-medium">{errorText}</p>
              )}
            </div>

            <DialogFooter className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white space-x-1.5"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Create & View Folder</span>
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </aside>
  )
}
