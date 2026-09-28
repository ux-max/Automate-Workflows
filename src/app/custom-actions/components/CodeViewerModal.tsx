"use client"

import React, { useState } from "react"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, Code2 } from "lucide-react"
import { ActionCodeViewer } from "./ActionCodeViewer"

interface CodeViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionName: string
  code: string
  lineCount?: number
}

export function CodeViewerModal({
  open,
  onOpenChange,
  actionName,
  code,
  lineCount
}: CodeViewerModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split("\n")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="p-5 border-b border-slate-200/90 dark:border-slate-800 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {actionName} • Execution Handler Code
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  TypeScript runtime function ({lines.length} lines) executed during workflow runs
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs font-semibold space-x-1.5 h-8 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </DialogHeader>

          {/* Code Body with Image 2 styling */}
          <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <ActionCodeViewer
              code={code}
              actionName={actionName}
              showCopy={false}
              maxHeight="max-h-[60vh]"
            />
          </div>

          <DialogFooter className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/90 dark:border-slate-800 flex justify-end shrink-0">
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-4"
            >
              Done
            </Button>
          </DialogFooter>
        </div>
      </div>
    </Dialog>
  )
}
