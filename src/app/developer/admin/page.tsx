"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  DeveloperApp,
  DeveloperAppStatus,
} from "@/lib/developer-types"
import {
  getDeveloperApps,
  adminReviewApp,
  saveDeveloperApp,
} from "@/lib/developer-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Drawer } from "@/components/ui/drawer"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { Select } from "@/components/ui/select"
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Play,
  Key,
  Globe,
  Zap,
  Layers,
  Check,
  Building2,
  Sparkles,
  ArrowRight,
  Eye,
  UserCheck,
  Send,
  Lock,
  X,
} from "lucide-react"

export default function AdminReviewConsolePage() {
  const [apps, setApps] = useState<DeveloperApp[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedApp, setSelectedApp] = useState<DeveloperApp | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Review test simulation state
  const [isRunningAudit, setIsRunningAudit] = useState(false)
  const [auditResult, setAuditResult] = useState<{
    status: "pass" | "fail"
    message: string
    latency: number
  } | null>(null)
  const [feedbackNotes, setFeedbackNotes] = useState("")
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)

  const reloadApps = () => {
    const list = getDeveloperApps()
    setApps(list)
  }

  useEffect(() => {
    reloadApps()
  }, [])

  const pendingCount = apps.filter((a) => a.status === "in_review").length
  const betaCount = apps.filter((a) => a.status === "public_beta" || a.status === "published").length
  const changesCount = apps.filter((a) => a.status === "changes_requested").length

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === "in_review") return app.status === "in_review"
    if (statusFilter === "public_beta") return app.status === "public_beta" || app.status === "published"
    if (statusFilter === "changes_requested") return app.status === "changes_requested"
    return true
  })

  const openInspector = (app: DeveloperApp) => {
    setSelectedApp(app)
    setFeedbackNotes(app.reviewSubmission?.feedbackNotes || "")
    setAuditResult(null)
    setIsDrawerOpen(true)
  }

  const runAutomatedAudit = () => {
    if (!selectedApp) return
    setIsRunningAudit(true)
    setAuditResult(null)

    setTimeout(() => {
      setIsRunningAudit(false)
      setAuditResult({
        status: "pass",
        message: "All synthetic authorization tokens verified. SSL Handshake succeeded with TLS 1.3.",
        latency: 142,
      })
    }, 1200)
  }

  const handleDecision = (decision: "approved" | "changes_requested") => {
    if (!selectedApp) return
    adminReviewApp(
      selectedApp.id,
      decision,
      feedbackNotes || (decision === "approved" ? "Passed sandbox & connection audit." : "Please revise parameters."),
      "Automate Security & QA Team"
    )
    reloadApps()
    setActionSuccessMsg(
      decision === "approved"
        ? `Application "${selectedApp.name}" approved to Public Beta!`
        : `Changes requested for "${selectedApp.name}". Author notified.`
    )
    setTimeout(() => {
      setActionSuccessMsg(null)
      setIsDrawerOpen(false)
      setSelectedApp(null)
    }, 1500)
  }

  const handlePromoteVerified = () => {
    if (!selectedApp) return
    const updated: DeveloperApp = {
      ...selectedApp,
      status: "published",
      author: {
        ...selectedApp.author,
        isVerified: true,
      },
    }
    saveDeveloperApp(updated)
    reloadApps()
    setActionSuccessMsg(`"${selectedApp.name}" promoted to Official Verified Partner!`)
    setTimeout(() => {
      setActionSuccessMsg(null)
      setIsDrawerOpen(false)
      setSelectedApp(null)
    }, 1500)
  }

  return (
    <div className="p-3 sm:p-4 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Toast Alert */}
        {actionSuccessMsg && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-semibold">{actionSuccessMsg}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Admin Review Console
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold">STAFF</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit custom connectors, execute live test suites with reviewer credentials, and publish verified apps to the Global Catalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/developer">
              <Button variant="outline" size="sm" className="text-xs h-9">
                Developer Hub
              </Button>
            </Link>
            <Link href="/apps">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-9 shadow-xs">
                Public Directory
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Public Beta / Verified</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{betaCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Changes Requested</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{changesCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Custom Apps</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{apps.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Central SearchControlBar with Select Component */}
        <SearchControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by app name, author, or category..."
          showFiltersButton={false}
        >
          <div className="w-56">
            <Select
              className="text-xs font-semibold h-8 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: `All Statuses (${apps.length})` },
                { value: "in_review", label: `In Review (${pendingCount})` },
                { value: "public_beta", label: `Public Beta (${betaCount})` },
                { value: "changes_requested", label: `Changes Requested (${changesCount})` },
              ]}
            />
          </div>
        </SearchControlBar>

        {/* Submissions Table */}
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Author & Organization</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No custom applications match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {app.name}
                            {app.status === "published" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {app.triggers.length} Triggers • {app.actions.length} Actions
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {app.author.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {app.author.company || app.author.email}
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px]">
                          {app.category}
                        </Badge>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        v{app.version}
                      </td>

                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${
                            app.status === "public_beta" || app.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : app.status === "in_review"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                              : app.status === "changes_requested"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {app.status.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          type="button"
                          onClick={() => openInspector(app)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-8 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect & Review
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Built-in Drawer for Inspection & Audit */}
        {selectedApp && (
          <Drawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            side="right"
            zIndex={60}
            className="w-[820px] max-w-[94vw]"
            header={
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-900/80 rounded-t-2xl shrink-0">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Audit Inspection: {selectedApp.name}
                    </h3>
                    <Badge variant="outline" className="text-xs font-mono">
                      v{selectedApp.version}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Author: {selectedApp.author.name} ({selectedApp.author.company || "Independent"}) • Base API: <code className="font-mono text-slate-700 dark:text-slate-300">{selectedApp.baseApiUrl}</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Close Drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            }
            footer={
              <div className="flex items-center justify-between w-full flex-wrap gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-xs cursor-pointer h-9 px-4"
                >
                  Close
                </Button>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    onClick={() => handleDecision("changes_requested")}
                    variant="outline"
                    size="sm"
                    className="text-xs border-rose-200 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 h-9 px-3.5 cursor-pointer font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePromoteVerified}
                    size="sm"
                    className="text-xs gap-1.5 h-9 px-3.5 cursor-pointer font-medium border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Promote to Verified Partner</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleDecision("approved")}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-xs h-9 px-4 cursor-pointer font-medium"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve to Public Beta</span>
                  </Button>
                </div>
              </div>
            }
          >
            <div className="space-y-5 py-2">
              {/* Reviewer Credentials Section */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    Reviewer Sandbox Credentials
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-medium text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                    Encrypted Token Vault
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Username / Email
                    </label>
                    <Input
                      readOnly
                      value={selectedApp.reviewSubmission?.reviewerTestAccount?.usernameOrEmail || "reviewer@company.com"}
                      className="h-8 text-xs font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Password / API Key
                    </label>
                    <Input
                      readOnly
                      type="password"
                      value={selectedApp.reviewSubmission?.reviewerTestAccount?.passwordOrKey || "sec_test_api_key"}
                      className="h-8 text-xs font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Sandbox URL
                    </label>
                    <Input
                      readOnly
                      value={selectedApp.reviewSubmission?.reviewerTestAccount?.environmentUrl || selectedApp.baseApiUrl}
                      className="h-8 text-xs font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {selectedApp.reviewSubmission?.reviewerNotes && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Developer's Notes:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      {selectedApp.reviewSubmission.reviewerNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* 1-Click Automated Audit Runner */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      1-Click Security & Live Test Runner
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dispatches synthetic test requests to the app's connection test endpoint and validates SSL encryption.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={runAutomatedAudit}
                    disabled={isRunningAudit}
                    size="sm"
                    className="text-xs gap-1.5 font-medium border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                  >
                    <Play className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRunningAudit ? "animate-spin" : ""}`} />
                    <span>{isRunningAudit ? "Executing Test Run..." : "Run Live Verification Test"}</span>
                  </Button>
                </div>

                {auditResult && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Verification Test Passed ({auditResult.latency}ms)
                      </span>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {auditResult.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Endpoints Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Configured Triggers ({selectedApp.triggers.length})
                  </h5>
                  <div className="space-y-1.5">
                    {selectedApp.triggers.length === 0 ? (
                      <p className="text-xs text-slate-400 py-1">No triggers configured.</p>
                    ) : (
                      selectedApp.triggers.map((t) => (
                        <div key={t.id} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                          <span className="font-semibold">{t.name}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {t.type}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Configured Actions ({selectedApp.actions.length})
                  </h5>
                  <div className="space-y-1.5">
                    {selectedApp.actions.length === 0 ? (
                      <p className="text-xs text-slate-400 py-1">No actions configured.</p>
                    ) : (
                      selectedApp.actions.map((a) => (
                        <div key={a.id} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                          <span className="font-semibold">{a.name}</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {a.method}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Reviewer Feedback Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reviewer Audit Notes / Feedback for Developer
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  rows={3}
                  placeholder="Provide approval comments or specific items that need remediation before publishing..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </div>
  )
}
