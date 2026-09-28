"use client"

import React, { useState, useEffect } from "react"
import { Rocket } from "lucide-react"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DeployConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentActionName: string
  appName?: string
  onConfirmDeploy: (confirmedName: string) => void
}

export function DeployConfirmModal({
  open,
  onOpenChange,
  currentActionName,
  onConfirmDeploy
}: DeployConfirmModalProps) {
  const [actionName, setActionName] = useState(currentActionName)

  // Sync state whenever modal opens or action changes
  useEffect(() => {
    if (open) {
      setActionName(currentActionName)
    }
  }, [open, currentActionName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = actionName.trim()
    if (!trimmed) return
    onConfirmDeploy(trimmed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Rocket className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <DialogHeader className="text-left space-y-1 mb-0">
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                Deploy Custom Action
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Confirm or update the action name before publishing live to Workflow Canvas.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-1.5 mt-5">
          <label
            htmlFor="deploy_action_name"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Action Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="deploy_action_name"
            autoFocus
            type="text"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            placeholder="e.g. Delete Sheet, Send Slack Alert..."
            className="text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            This name will be displayed when selecting actions inside Workflow Canvas.
          </p>
        </div>

        <DialogFooter className="mt-5 flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold h-8 px-3.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-none cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!actionName.trim()}
            className="text-xs font-semibold h-8 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-none cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>Deploy</span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
