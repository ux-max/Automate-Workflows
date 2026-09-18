"use client"

import React, { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Send,
  Check,
  X,
  Laptop,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Loader2
} from "lucide-react"

export interface EmailApprovalPreviewModalProps {
  open: boolean
  onClose: () => void
  approverEmail?: string
  approvalSubject?: string
  approvalNotes?: string
  approveButtonLabel?: string
  rejectButtonLabel?: string
  timeoutDuration?: string
  onSendPreview?: (targetEmail: string) => void
}

/**
 * Resolves standard template variables like {{step_1.amount}} into realistic sample text
 */
function resolveTemplateVariables(text: string): string {
  if (!text) return ""
  return text
    .replace(/\{\{step_\d+\.name\}\}/gi, "Acme Logistics")
    .replace(/\{\{step_\d+\.amount\}\}/gi, "$1,450.00")
    .replace(/\{\{step_\d+\.order_id\}\}/gi, "ORD-89214")
    .replace(/\{\{step_\d+\.manager_email\}\}/gi, "approvals@company.com")
    .replace(/\{\{step_\d+\.customer\}\}/gi, "Sarah Jenkins")
    .replace(/\{\{step_\d+\.quote_id\}\}/gi, "QT-2026-09")
    .replace(/\{\{[^}]+\}\}/g, "Sample Value")
}

export const EmailApprovalPreviewModal: React.FC<EmailApprovalPreviewModalProps> = ({
  open,
  onClose,
  approverEmail = "",
  approvalSubject = "",
  approvalNotes = "",
  approveButtonLabel = "Approve",
  rejectButtonLabel = "Reject",
  timeoutDuration = "24_hours",
  onSendPreview
}) => {
  const [targetEmail, setTargetEmail] = useState(approverEmail || "manager@company.com")
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")
  const [isSending, setIsSending] = useState(false)
  const [simulatedClick, setSimulatedClick] = useState<"approved" | "rejected" | null>(null)

  useEffect(() => {
    if (open) {
      setTargetEmail(approverEmail || "manager@company.com")
      setSimulatedClick(null)
      setIsSending(false)
    }
  }, [open, approverEmail])

  const resolvedSubject = resolveTemplateVariables(approvalSubject) || "Action Required: Please Review & Approve Request"
  const resolvedNotes =
    resolveTemplateVariables(approvalNotes) ||
    "A workflow execution is currently paused and awaiting your approval to proceed. Please review the details and make a decision."
  const resolvedApproveLabel = resolveTemplateVariables(approveButtonLabel) || "Approve"
  const resolvedRejectLabel = resolveTemplateVariables(rejectButtonLabel) || "Reject"

  const timeoutDisplay =
    timeoutDuration === "1_hour"
      ? "1 hour"
      : timeoutDuration === "7_days"
      ? "7 days"
      : timeoutDuration === "3_days"
      ? "3 days"
      : "24 hours"

  const handleSend = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      if (onSendPreview) {
        onSendPreview(targetEmail || "manager@company.com")
      }
      onClose()
    }, 600)
  }

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">Request Email Approval Preview</span>
          <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
            Live Preview
          </span>
        </div>
      }
      description="Inspect how your approval email and custom decision buttons look before sending to assignees."
      icon={<Mail className="h-5 w-5" />}
      standardWidthClassName="max-w-2xl"
      expandedWidthClassName="max-w-4xl"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          {/* Test Send Input Box */}
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">Send test to:</span>
            <Input
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="recipient@company.com"
              className="h-8 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center space-x-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSend}
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm min-w-[170px]"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span>Sending Preview...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  <span>Send Preview Message</span>
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-5 space-y-4">
        {/* Device Viewport Toggle & Help */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Preview Device:</span>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("desktop")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "desktop"
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "mobile"
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Expires after: <strong className="text-slate-700 dark:text-slate-200">{timeoutDisplay}</strong></span>
          </div>
        </div>

        {/* Simulated Decision Notice */}
        {simulatedClick && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
              simulatedClick === "approved"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  simulatedClick === "approved" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              />
              <span>
                <strong>Simulated Button Response:</strong> Decision recorded as{" "}
                <span className="underline font-bold">
                  {simulatedClick === "approved" ? resolvedApproveLabel : resolvedRejectLabel}
                </span>
                . Workflow will resume with <code>decision: &ldquo;{simulatedClick.toUpperCase()}&rdquo;</code>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSimulatedClick(null)}
              className="text-[11px] font-bold underline hover:opacity-75 cursor-pointer ml-3"
            >
              Reset
            </button>
          </div>
        )}

        {/* Email Client Container */}
        <div
          className={`mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200 ${
            viewMode === "mobile" ? "max-w-sm" : "w-full"
          }`}
        >
          {/* Email Client Header Bar */}
          <div className="bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Automate Workflow Mailer</span>
            </span>
          </div>

          {/* Email Metadata */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-start">
              <span className="text-slate-400 dark:text-slate-500 font-semibold w-16 shrink-0">From:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                Automate Workflows &lt;notifications@automate-workflows.app&gt;
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-slate-400 dark:text-slate-500 font-semibold w-16 shrink-0">To:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                {targetEmail || approverEmail || "recipient@company.com"}
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-slate-400 dark:text-slate-500 font-semibold w-16 shrink-0">Subject:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{resolvedSubject}</span>
            </div>
          </div>

          {/* Email Body Content */}
          <div className="p-5 space-y-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
            {/* Header Brand */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  AW
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">Automate Workflows</span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Decision Required</span>
            </div>

            {/* Main Message */}
            <div className="space-y-2">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Hello,</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs">
                {resolvedNotes}
              </p>
            </div>

            {/* Approval Callout Box */}
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-1">
              <div className="text-[11px] font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Workflow Request Information</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300/90">
                Please click one of the buttons below to record your official decision. Your response will automatically proceed the next automated step.
              </p>
            </div>

            {/* Interactive Decision Buttons (User's Custom Labels) */}
            <div className="pt-2 pb-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Review Decision Buttons (Click to test):
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Positive Approve Button with Custom Label */}
                <button
                  type="button"
                  onClick={() => setSimulatedClick("approved")}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md"
                  title="Click to simulate Approve action"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>{resolvedApproveLabel}</span>
                </button>

                {/* Negative Reject Button with Custom Label */}
                <button
                  type="button"
                  onClick={() => setSimulatedClick("rejected")}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer hover:border-rose-400"
                  title="Click to simulate Reject action"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                  <span>{resolvedRejectLabel}</span>
                </button>
              </div>
            </div>

            {/* Email Footer Note */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center space-y-1">
              <p>This request was generated automatically by your organization&apos;s workflow.</p>
              <p className="text-[10px] text-slate-400">
                Timeout expiration: within {timeoutDisplay} • Decision link will expire automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EmailApprovalPreviewModal
