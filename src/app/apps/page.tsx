"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Grid,
  Search,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { MVP_APPS, AppConnection } from "@/lib/data"
import { getDeveloperApps } from "@/lib/developer-data"

export default function AppsDirectoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const allApps: AppConnection[] = useMemo(() => {
    const devApps = getDeveloperApps()
      .filter((a) => a.status === "public_beta" || a.status === "published")
      .map((da) => ({
        id: da.id,
        name: da.name,
        icon: da.logoIcon || "Sparkles",
        category: da.category,
        authType: (da.authentication.type === "oauth2"
          ? "OAuth 2.0"
          : da.authentication.type === "api_key"
          ? "API Key"
          : da.authentication.type === "bearer_token"
          ? "Private App Token"
          : "None") as any,
        triggers: da.triggers.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          type: (t.type === "webhook" ? "instant" : "polling") as any,
        })),
        actions: da.actions.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
        })),
        syncMode: (da.triggers.some((t) => t.type === "webhook") ? "Webhook" : "Polling") as any,
        notes: `Custom Developer App v${da.version} by ${da.author.name}`,
      }))

    return [...MVP_APPS, ...devApps]
  }, [])

  const allCategories = useMemo(
    () => Array.from(new Set(allApps.map((a) => a.category))),
    [allApps]
  )

  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || app.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [allApps, searchQuery, categoryFilter])

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Premium Floating Pure White Main Canvas Container */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Apps Integration Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Browse launch connector catalog, custom developer integrations, trigger events, and actions.
          </p>
        </div>
        <Link href="/developer">
          <Button className="space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Build a Custom App</span>
          </Button>
        </Link>
      </div>

      {/* Filter Bar (Unified SearchControlBar) */}
      <SearchControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search apps by name or category..."
        showFiltersButton={false}
      >
        <div className="w-56">
          <Select
            className="text-xs font-semibold h-8 bg-slate-50 border-slate-200"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories ({MVP_APPS.length})</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </SearchControlBar>

      {/* Screen 18: Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => (
          <Card key={app.id} className="border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={app.category === "Native Suite" ? "blue" : "secondary"} className="text-[10px] uppercase font-bold">
                  {app.category}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {app.authType}
                </Badge>
              </div>

              <CardTitle className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>{app.name}</span>
              </CardTitle>

              <p className="text-xs text-slate-500 italic">
                Sync Mode: {app.syncMode}
              </p>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">Triggers ({app.triggers.length}):</span>
                  <ul className="list-disc pl-4 text-slate-600 mt-1 space-y-0.5">
                    {app.triggers.length > 0 ? (
                      app.triggers.map((t) => <li key={t.id}>{t.name}</li>)
                    ) : (
                      <li className="text-slate-400 italic list-none -pl-4">Action-only connector</li>
                    )}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-700 block">Actions ({app.actions.length}):</span>
                  <ul className="list-disc pl-4 text-slate-600 mt-1 space-y-0.5">
                    {app.actions.length > 0 ? (
                      app.actions.map((a) => <li key={a.id}>{a.name}</li>)
                    ) : (
                      <li className="text-slate-400 italic list-none -pl-4">Trigger-only connector</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Primary Blue Action Button */}
              <Button
                size="sm"
                className="w-full space-x-1.5"
                onClick={() => router.push(`/workflows/editor?new=true&app=${app.id}`)}
              >
                <span>Build with {app.name}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  )
}
