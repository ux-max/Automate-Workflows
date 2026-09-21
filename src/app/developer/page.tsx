"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Code2,
  Plus,
  Search,
  Users,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Trash2,
  Share2,
  Check,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Grid,
  List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { CreateAppDrawer } from "./components/CreateAppDrawer"
import { getDeveloperApps, deleteDeveloperApp } from "@/lib/developer-data"
import { DeveloperApp, DeveloperAppStatus } from "@/lib/developer-types"

export default function DeveloperHubPage() {
  const router = useRouter()
  const [apps, setApps] = useState<DeveloperApp[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; appId: string; appName: string }>({
    open: false,
    appId: "",
    appName: ""
  })

  useEffect(() => {
    setApps(getDeveloperApps())

    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("automate_developer_view_mode")
      if (savedMode === "grid" || savedMode === "table") {
        setViewMode(savedMode)
      } else {
        setViewMode("table")
      }

      // Auto-open drawer if ?create=true in query
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("create") === "true") {
        setIsCreateDrawerOpen(true)
      }
    }
  }, [])

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode)
    if (typeof window !== "undefined") {
      localStorage.setItem("automate_developer_view_mode", mode)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.tagline && app.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [apps, searchQuery, statusFilter])

  const stats = useMemo(() => {
    return {
      total: apps.length,
      private: apps.filter((a) => a.status === "private" || a.status === "draft").length,
      inReview: apps.filter((a) => a.status === "in_review").length,
      publicBeta: apps.filter((a) => a.status === "public_beta" || a.status === "published").length,
    }
  }, [apps])

  const confirmDelete = () => {
    if (deleteModal.appId) {
      deleteDeveloperApp(deleteModal.appId)
      setApps(getDeveloperApps())
      showToast(`Deleted custom app "${deleteModal.appName}"`)
      setDeleteModal({ open: false, appId: "", appName: "" })
    }
  }

  const handleCopyInvite = (app: DeveloperApp) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/developer/invite/${app.distribution.inviteToken}`
        : app.distribution.inviteUrl
    navigator.clipboard.writeText(url)
    setCopiedAppId(app.id)
    showToast(`Copied private invite link for ${app.name}!`)
    setTimeout(() => setCopiedAppId(null), 2000)
  }

  const getStatusBadge = (status: DeveloperAppStatus) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="text-[10px] font-medium">
            Draft
          </Badge>
        )
      case "private":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            Private (Dev)
          </Badge>
        )
      case "in_review":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
            In Review
          </Badge>
        )
      case "changes_requested":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
            Changes Requested
          </Badge>
        )
      case "public_beta":
        return (
          <Badge variant="blue" className="text-[10px] font-medium">
            Public Beta
          </Badge>
        )
      case "published":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50">
            Verified
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="text-[10px] font-medium">{status}</Badge>
    }
  }

  return (
    <div className="p-3 sm:p-4 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Floating Main White Canvas Container */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 border border-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={deleteModal.open}
          onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
          title="Delete Custom Application"
          description={`Are you sure you want to permanently delete "${deleteModal.appName}"? This will remove all associated triggers and actions.`}
          confirmText="Delete App"
          variant="danger"
          onConfirm={confirmDelete}
        />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                Developer Platform
              </h1>
              <Badge variant="blue" className="text-[10px] font-medium">
                Dev Hub
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Build, configure, and publish custom application connectors and API webhooks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/developer/admin">
              <Button variant="outline" size="sm" className="space-x-1.5 text-xs font-semibold h-9">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Admin Review Console</span>
                {stats.inReview > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                    {stats.inReview}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              size="default"
              onClick={() => setIsCreateDrawerOpen(true)}
              className="space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs h-9 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Build Custom App</span>
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Custom Apps</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Code2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Private / Dev Sandbox</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{stats.private}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Review</p>
                <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1">{stats.inReview}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Public Beta / Verified</p>
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{stats.publicBeta}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Central SearchControlBar with Select Component & View Mode Switcher */}
        <SearchControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search custom apps by name, category, or tagline..."
          showFiltersButton={false}
        >
          <div className="w-56">
            <Select
              className="text-xs font-semibold h-8 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: `All Statuses (${apps.length})` },
                { value: "private", label: `Private Dev (${stats.private})` },
                { value: "in_review", label: `In Review (${stats.inReview})` },
                { value: "public_beta", label: `Public Beta / Verified (${stats.publicBeta})` },
              ]}
            />
          </div>

          {/* Grid vs Table View Mode Switcher */}
          <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
              title="Grid Card View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewModeChange("table")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
              title="List Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </SearchControlBar>

        {/* Content Area: Empty State or Grid/Table Views */}
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Code2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No custom apps found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Create your first custom connector with visual form fields."}
            </p>
            <Button
              size="sm"
              onClick={() => setIsCreateDrawerOpen(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Build New App</span>
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* Card View (Matching Dashboard Card Design System) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApps.map((app) => (
              <Card
                key={app.id}
                className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-2xs rounded-xl"
              >
                <CardHeader className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* App Logo Display */}
                      <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {app.logoIcon?.startsWith("data:") || app.logoIcon?.startsWith("http") ? (
                          <img src={app.logoIcon} alt={app.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center text-sm">
                            {app.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
                          <span className="truncate">{app.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal shrink-0">
                            v{app.version}
                          </span>
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {app.category} • by {app.author.name}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">{getStatusBadge(app.status)}</div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {app.tagline || app.description}
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Capabilities bar */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span>{app.triggers.length} {app.triggers.length === 1 ? "Trigger" : "Triggers"}</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="h-3.5 w-3.5 text-blue-500" />
                      <span>{app.actions.length} {app.actions.length === 1 ? "Action" : "Actions"}</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="h-3.5 w-3.5 text-blue-500" />
                      <span>{app.distribution.activeInstalls} Users</span>
                    </span>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyInvite(app)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Copy Private Beta Invite Link"
                      >
                        {copiedAppId === app.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteModal({ open: true, appId: app.id, appName: app.name })}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 cursor-pointer"
                        title="Delete Custom App"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Link href={`/developer/apps/${app.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8 px-3 space-x-1.5 shadow-xs">
                        <span>Open Builder</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View (Matching Platform Data Table Design System) */
          <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs">
                  <tr>
                    <th className="py-3 px-4">Application</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Capabilities</th>
                    <th className="py-3 px-4">Active Users</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Application Name & Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {app.logoIcon?.startsWith("data:") || app.logoIcon?.startsWith("http") ? (
                              <img src={app.logoIcon} alt={app.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center text-xs">
                                {app.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                              <span className="truncate">{app.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-normal shrink-0">
                                v{app.version}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
                              {app.tagline || app.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px]">
                          {app.category}
                        </Badge>
                      </td>

                      {/* Author */}
                      <td className="p-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {app.author.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {app.author.company || "Independent"}
                        </div>
                      </td>

                      {/* Capabilities */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-xs">
                          <span className="flex items-center gap-1 font-medium">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            <span>{app.triggers.length} {app.triggers.length === 1 ? "Trigger" : "Triggers"}</span>
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Layers className="h-3.5 w-3.5 text-blue-500" />
                            <span>{app.actions.length} {app.actions.length === 1 ? "Action" : "Actions"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Active Users */}
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          <span>{app.distribution.activeInstalls} Users</span>
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyInvite(app)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copy Private Beta Invite Link"
                          >
                            {copiedAppId === app.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModal({ open: true, appId: app.id, appName: app.name })}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 cursor-pointer"
                            title="Delete Custom App"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <Link href={`/developer/apps/${app.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3 space-x-1.5 shadow-xs">
                              <span>Open Builder</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create Custom App Step-by-Step Drawer */}
        <CreateAppDrawer
          open={isCreateDrawerOpen}
          onOpenChange={setIsCreateDrawerOpen}
          onAppCreated={() => setApps(getDeveloperApps())}
        />
      </div>
    </div>
  )
}
