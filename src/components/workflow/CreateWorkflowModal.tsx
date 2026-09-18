"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

export interface CreateWorkflowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders?: string[]
  defaultFolder?: string
  onSubmit?: (workflowName: string, folder: string) => void
}

const DEFAULT_FOLDERS = [
  "Himanshu Pundir (Personal)",
  "Client Automations",
  "Marketing Campaigns",
  "E-Commerce Sync"
]

export function CreateWorkflowModal({
  open,
  onOpenChange,
  folders = DEFAULT_FOLDERS,
  defaultFolder,
  onSubmit
}: CreateWorkflowModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [folder, setFolder] = useState(
    defaultFolder && folders.includes(defaultFolder) ? defaultFolder : ""
  )

  useEffect(() => {
    if (open) {
      setTitle("")
      setFolder(
        defaultFolder && folders.includes(defaultFolder)
          ? defaultFolder
          : ""
      )
    }
  }, [open, defaultFolder, folders])

  const folderOptions = [
    { value: "", label: "None (No Folder)" },
    ...folders.map((f) => ({ value: f, label: f }))
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim() || "Untitled Workflow"
    onOpenChange(false)
    if (onSubmit) {
      onSubmit(trimmedTitle, folder)
    } else {
      router.push(`/workflows/editor?new=true&name=${encodeURIComponent(trimmedTitle)}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="text-left space-y-1 mb-4">
        <DialogTitle className="text-base font-semibold text-slate-800">
          Create Workflow
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          Enter a name for your workflow to start connecting applications.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            Workflow Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            autoFocus
            placeholder="e.g. Stripe Payment to Google Sheets"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            Select Folder (Optional)
          </label>
          <Select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            options={folderOptions}
            placeholder="None (No Folder)"
            className="text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>

        <DialogFooter className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create</span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
