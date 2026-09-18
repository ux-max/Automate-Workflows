"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  DeveloperApp,
  DeveloperAppStatus,
} from "@/lib/developer-types"
import {
  getDeveloperAppById,
  saveDeveloperApp,
  INITIAL_DEVELOPER_APPS,
} from "@/lib/developer-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Workflow,
  Save,
  Check,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { OverviewTab } from "./components/OverviewTab"
import { AuthTab } from "./components/AuthTab"
import { TriggersTab } from "./components/TriggersTab"
import { ActionsTab } from "./components/ActionsTab"
import { InbuiltActionsTab } from "./components/InbuiltActionsTab"
import { SandboxTab } from "./components/SandboxTab"
import { SharingTab } from "./components/SharingTab"
import { PublishTab } from "./components/PublishTab"

type TabType = "overview" | "auth" | "triggers" | "actions" | "inbuilt_actions" | "sandbox" | "sharing" | "publish"

export default function DeveloperAppBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const appId = (params?.appId as string) || ""

  const tabFromUrl = (searchParams?.get("tab") as TabType) || "overview"
  const [app, setApp] = useState<DeveloperApp | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [saveNotification, setSaveNotification] = useState<string | null>(null)

  // Sync activeTab with URL search params
  useEffect(() => {
    const t = searchParams?.get("tab") as TabType
    if (t && ["overview", "auth", "triggers", "actions", "inbuilt_actions", "sandbox", "sharing", "publish"].includes(t)) {
      setActiveTab(t)
    }
  }, [searchParams])

  // Load app on mount
  useEffect(() => {
    if (!appId) return
    const loaded = getDeveloperAppById(appId)
    if (loaded) {
      setApp(loaded)
    } else {
      const fallback = INITIAL_DEVELOPER_APPS[0]
      if (fallback) {
        setApp({
          ...fallback,
          id: appId,
          name: appId.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          slug: appId.toLowerCase(),
        })
      }
    }
  }, [appId])

  const handleAppChange = (updated: DeveloperApp) => {
    setApp(updated)
    saveDeveloperApp(updated)
  }

  const handleManualSave = () => {
    if (!app) return
    setSaveStatus("saving")
    saveDeveloperApp(app)
    setTimeout(() => {
      setSaveStatus("saved")
      setSaveNotification("Changes saved successfully!")
      setTimeout(() => {
        setSaveStatus("idle")
        setSaveNotification(null)
      }, 2500)
    }, 300)
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const getStatusBadge = (status: DeveloperAppStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="text-[10px] uppercase font-bold">Draft</Badge>
      case "private":
        return <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">Private (Dev)</Badge>
      case "in_review":
        return <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">In Review</Badge>
      case "changes_requested":
        return <Badge variant="outline" className="text-[10px] uppercase font-bold text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">Changes Requested</Badge>
      case "public_beta":
        return <Badge variant="blue" className="text-[10px] uppercase font-bold">Public Beta</Badge>
      case "published":
        return <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">Verified</Badge>
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>
    }
  }

  const TAB_NAMES: Record<TabType, string> = {
    overview: "Overview & Secrets",
    auth: "Authentication",
    triggers: "Triggers",
    actions: "Actions",
    inbuilt_actions: "In-built Actions",
    sandbox: "Testing & Sandbox",
    sharing: "Sharing & Testers",
    publish: "Publish & Review"
  }

  return (
    <div className="p-3 sm:p-4 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <Link
              href="/developer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Developer Hub"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            {/* App Logo Display */}
            <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {app.logoIcon?.startsWith("data:") || app.logoIcon?.startsWith("http") ? (
                <img src={app.logoIcon} alt={app.name} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {app.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {app.name || "Untitled Connector"}
                </h1>
                {getStatusBadge(app.status)}
                <Badge variant="outline" className="text-[10px] font-mono">
                  v{app.version}
                </Badge>
                <Badge variant="blue" className="text-[10px] font-bold">
                  {TAB_NAMES[activeTab]}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                slug: <code className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{app.slug}</code> • ID: <code className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{app.id}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              size="sm"
              onClick={handleManualSave}
              disabled={saveStatus === "saving"}
              className={cn(
                "h-9 px-4 gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 shadow-xs",
                saveStatus === "saved"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {saveStatus === "saving" ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>

            <Link href={`/workflows/editor?app=${app.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Workflow className="h-3.5 w-3.5 text-blue-600" />
                <span>Preview in Canvas</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Tab Viewport - Displays only the fields for the currently selected step */}
        <div>
          {activeTab === "overview" && <OverviewTab app={app} onChange={handleAppChange} onSave={handleManualSave} />}
          {activeTab === "auth" && <AuthTab app={app} onChange={handleAppChange} onSave={handleManualSave} />}
          {activeTab === "triggers" && <TriggersTab app={app} onChange={handleAppChange} />}
          {activeTab === "actions" && <ActionsTab app={app} onChange={handleAppChange} />}
          {activeTab === "inbuilt_actions" && <InbuiltActionsTab app={app} onChange={handleAppChange} />}
          {activeTab === "sandbox" && <SandboxTab app={app} onChange={handleAppChange} />}
          {activeTab === "sharing" && <SharingTab app={app} onChange={handleAppChange} />}
          {activeTab === "publish" && <PublishTab app={app} onChange={handleAppChange} />}
        </div>

        {/* Save Confirmation Notification Toast */}
        {saveNotification && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveNotification}</span>
          </div>
        )}
      </div>
    </div>
  )
}
