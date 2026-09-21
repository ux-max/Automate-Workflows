"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  DeveloperApp,
  ValidationItem,
} from "@/lib/developer-types"
import { validateAppPreFlight, submitAppForReview } from "@/lib/developer-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  Check,
  AlertCircle,
  Clock,
  Send,
  ShieldCheck,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Lock,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  Eye,
  HelpCircle,
  Code,
  Copy,
  Info,
} from "lucide-react"

interface PublishTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

export function PublishTab({ app, onChange }: PublishTabProps) {
  const [activeStep, setActiveStep] = useState<string | null>("checklist")
  const [showReviewHelpModal, setShowReviewHelpModal] = useState(false)
  const [previewMarketplaceModal, setPreviewMarketplaceModal] = useState(false)
  const validationItems = validateAppPreFlight(app)
  const failedCount = validationItems.filter((v) => v.status === "fail").length
  const isAllPassed = failedCount === 0

  const toggleStep = (stepId: string) => {
    setActiveStep((prev) => (prev === stepId ? null : stepId))
  }

  // Review form state
  const [reviewerEmail, setReviewerEmail] = useState(
    app.reviewSubmission?.reviewerTestAccount?.usernameOrEmail || ""
  )
  const [reviewerKey, setReviewerKey] = useState(
    app.reviewSubmission?.reviewerTestAccount?.passwordOrKey || ""
  )
  const [environmentUrl, setEnvironmentUrl] = useState(
    app.reviewSubmission?.reviewerTestAccount?.environmentUrl || ""
  )
  const [reviewerNotes, setReviewerNotes] = useState(
    app.reviewSubmission?.reviewerNotes || ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAllPassed) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      const submissionData = {
        submittedAt: new Date().toISOString(),
        reviewerTestAccount: {
          usernameOrEmail: reviewerEmail || "sandbox@reviewer.com",
          passwordOrKey: reviewerKey || "sec_sandbox_reviewer_key",
          environmentUrl: environmentUrl || app.baseApiUrl,
        },
        reviewerNotes,
      }

      submitAppForReview(app.id, submissionData)
      onChange({
        ...app,
        status: "in_review",
        reviewSubmission: submissionData,
      })
    }, 1000)
  }

  return (
    <div className="space-y-8 w-full">
      {/* Current App Status Banner */}
      {app.status === "in_review" && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              App Submission Is Currently In Review
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Submitted on{" "}
              {app.reviewSubmission?.submittedAt
                ? new Date(app.reviewSubmission.submittedAt).toLocaleDateString()
                : "recently"}
              . Our DevRel and Security team will execute automated test suites using your provided sandbox credentials.
            </p>
          </div>
        </div>
      )}

      {app.status === "changes_requested" && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Changes Requested by Reviewer
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              {app.reviewSubmission?.feedbackNotes ||
                "Please ensure all endpoints return proper HTTP 200 responses and update input field descriptions."}
            </p>
          </div>
        </div>
      )}

      {(app.status === "public_beta" || app.status === "published") && (
        <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-semibold shadow-xs">
              <Check className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                Official Connector Published in Global Directory!
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This connector is live in the official App Catalog (`/apps`) and accessible to all platform users.
              </p>
            </div>
          </div>

          <Link href="/apps">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shrink-0 shadow-xs font-medium">
              View in App Directory
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Section 1: Pre-Flight Automated Linter Checklist (Accordion Step 1 - Default Open) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden relative z-20">
        <div
          onClick={() => toggleStep("checklist")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Pre-Flight Automated Quality Checklist
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowReviewHelpModal(true)
                  }}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Marketplace Review Guidelines Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Automated checks required before submitting this connector to the public directory.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewMarketplaceModal(true)
              }}
              className="h-7 px-2.5 text-xs gap-1 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs font-medium"
              title="Preview Marketplace Card"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Card Preview</span>
            </Button>
            <Badge variant="outline" className="text-[10px] font-medium">Step 1</Badge>
            <Badge
              className={`text-xs font-medium px-2.5 py-1 ${
                isAllPassed
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
              }`}
            >
              {isAllPassed ? "All 6 Checks Passed" : `${failedCount} Action Required`}
            </Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "checklist" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "checklist" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="space-y-3 p-5 pt-4">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {validationItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex items-start justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {item.status === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                    {item.status === "fail" && item.remediation && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                        Fix: {item.remediation}
                      </p>
                    )}
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono font-medium uppercase shrink-0 ${
                    item.status === "pass"
                      ? "text-blue-700 border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                      : "text-rose-700 border-rose-200 bg-rose-50 dark:bg-rose-950/40"
                  }`}
                >
                  {item.status === "pass" ? "Passed" : "Blocker"}
                </Badge>
              </div>
            ))}
          </div>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Section 2: Review Submission Form (Accordion Step 2) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden relative z-10">
        <div
          onClick={() => toggleStep("submit")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Submit App for Platform Review
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowReviewHelpModal(true)
                  }}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="App Review & Submission Standards Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Provide reviewer sandbox credentials so platform auditors can verify live executions.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] font-medium">Step 2</Badge>
            <Badge
              variant="outline"
              className={`text-[10px] font-medium ${
                isAllPassed
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {isAllPassed ? "Ready to Submit" : "Resolve Blockers"}
            </Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "submit" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "submit" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="space-y-4 p-5 pt-4">
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Reviewer Sandbox Username / Email <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={reviewerEmail}
                      onChange={(e) => setReviewerEmail(e.target.value)}
                      placeholder="reviewer.test@acme.com"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Reviewer Sandbox Password / API Key <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="password"
                      value={reviewerKey}
                      onChange={(e) => setReviewerKey(e.target.value)}
                      placeholder="sandbox_key_••••••••"
                      className="text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Sandbox Host URL (Optional)
                    </label>
                    <Input
                      value={environmentUrl}
                      onChange={(e) => setEnvironmentUrl(e.target.value)}
                      placeholder="https://sandbox-api.acme.com"
                      className="text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Privacy Policy URL
                    </label>
                    <Input
                      value={app.privacyPolicyUrl || ""}
                      onChange={(e) => onChange({ ...app, privacyPolicyUrl: e.target.value })}
                      placeholder="https://acme.com/privacy"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Notes for Reviewers
                  </label>
                  <textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    rows={3}
                    placeholder="Include instructions on test data, rate limits, or pre-configured test accounts..."
                    className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-500">
                    {isAllPassed
                      ? "✓ All quality checks passed. Ready to submit."
                      : "Resolve blockers above to enable submission."}
                  </p>

                  <Button
                    type="submit"
                    disabled={!isAllPassed || isSubmitting || app.status === "in_review"}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs font-medium"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                    {isSubmitting
                      ? "Submitting..."
                      : app.status === "in_review"
                      ? "Under Active Review"
                      : "Submit App for Review"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Public Marketplace Directory Card Preview Modal */}
      <Dialog
        open={previewMarketplaceModal}
        onOpenChange={setPreviewMarketplaceModal}
        className="max-w-md"
      >
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Public Directory Card Preview</span>
            </DialogTitle>
            <DialogDescription>
              Live rendering of how your connector appears to hundreds of thousands of users in the App Directory.
            </DialogDescription>
          </DialogHeader>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-semibold text-lg flex items-center justify-center shadow-xs">
                  {app.name ? app.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {app.name || "Custom App"}
                    </h4>
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-medium" title="Verified Integration">
                      ✓
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {app.category || "Productivity"} • v{app.version}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-medium text-emerald-600 border-emerald-200 dark:border-emerald-800">
                Official
              </Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {app.description || "Integrate and automate actions with your application seamlessly."}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <div>
                <strong className="text-slate-800 dark:text-slate-200">{app.triggers.length}</strong> Triggers
              </div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">{app.actions.length}</strong> Actions
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 shadow-xs cursor-pointer">
              Connect App & Automate →
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => setPreviewMarketplaceModal(false)}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
            >
              Close Preview
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Review Guidelines Helping Modal */}
      <Dialog open={showReviewHelpModal} onOpenChange={setShowReviewHelpModal}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            How to Submit: Marketplace Review &amp; Verification Checklist
          </DialogTitle>
          <DialogDescription>
            Guide for developers to prepare and submit custom integrations for public directory approval.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-lg text-blue-800 dark:text-blue-300">
            <strong>What this does:</strong> Submits your custom integration to the global Automate Workflows App Directory so all users across the platform can discover, connect, and automate with your service.
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">How Developer Prepares &amp; Submits:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Complete Schema &amp; Auth:</strong> Ensure all Auth, Triggers, and Actions have valid HTTPS endpoints, helpful field labels, and response mappings.</li>
              <li><strong>Run Sandbox Tests:</strong> Perform live test executions in the Sandbox tab to confirm clean 2xx responses and correct error handling.</li>
              <li><strong>Provide Test Credentials:</strong> Provide temporary sandbox/demo credentials in the reviewer notes so the review team can test real API calls.</li>
              <li><strong>Submit &amp; Track:</strong> Click <em>&ldquo;Submit App for Review&rdquo;</em>. Integrations are typically audited and approved within 2&ndash;3 business days.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How End-Users Experience It:</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Once approved, your integration appears with a verified badge in the global App Directory. Hundreds of thousands of users can search for your app, connect their accounts, and create automated workflows without needing invite links.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowReviewHelpModal(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
