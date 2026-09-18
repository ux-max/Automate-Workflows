"use client"

import React, { useState, useMemo } from "react"
import {
  Link2,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Key,
  ShieldCheck,
  Search,
  ChevronDown,
  Check,
  Grid,
  List,
  ArrowUpDown,
  Star,
  MoreVertical,
  Edit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AppIcon } from "@/components/ui/app-icon"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useTableSelection, TableCheckbox } from "@/components/ui/table-bulk-actions"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import { INITIAL_USER_CONNECTIONS, CONNECTABLE_APPS, UserConnection } from "@/lib/data"

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<UserConnection[]>(INITIAL_USER_CONNECTIONS)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [starredRows, setStarredRows] = useState<Record<string, boolean>>({})
  const [activeMenuConnId, setActiveMenuConnId] = useState<string | null>(null)

  // Screen 15 State: Add Connection Modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [appSelectOpen, setAppSelectOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState(CONNECTABLE_APPS[0]?.id || "google-sheets")
  const [accountLabel, setAccountLabel] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [testingConnection, setTestingConnection] = useState(false)

  const selectedAppObj = CONNECTABLE_APPS.find((a) => a.id === selectedAppId) || CONNECTABLE_APPS[0]

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault()
    setTestingConnection(true)
    setTimeout(() => {
      setTestingConnection(false)
      const defaultLabel = selectedAppObj?.id === "automate-chats"
        ? `Automate Chats #${connections.filter(c => c.appId === "automate-chats").length + 1}`
        : selectedAppObj?.id === "automate-forms"
        ? `Automate Forms #${connections.filter(c => c.appId === "automate-forms").length + 1}`
        : "New Account Connection"
      const newConn: UserConnection = {
        id: `conn_${Date.now()}`,
        appId: selectedAppId,
        appName: selectedAppObj?.name || "App",
        accountLabel: accountLabel.trim() || defaultLabel,
        status: "Active",
        lastUsed: "Just now",
        authType: selectedAppObj?.authType || "API Key"
      }
      setConnections([...connections, newConn])
      setAddModalOpen(false)
      setAccountLabel("")
      setApiKey("")
    }, 800)
  }

  // Disconnect Confirmation Modal State
  const [disconnectModalState, setDisconnectModalState] = useState<{
    open: boolean
    mode: "single" | "bulk"
    connId?: string
    connName?: string
    count?: number
  }>({ open: false, mode: "single" })

  const requestDisconnect = (connId: string, connName: string) => {
    setActiveMenuConnId(null)
    setDisconnectModalState({ open: true, mode: "single", connId, connName })
  }

  const requestBulkDisconnect = () => {
    if (selectedCount === 0) return
    setActiveMenuConnId(null)
    setDisconnectModalState({
      open: true,
      mode: "bulk",
      count: selectedCount
    })
  }

  const handleConfirmDisconnect = () => {
    if (disconnectModalState.mode === "bulk") {
      const count = selectedIds.length
      setConnections((prev) => prev.filter((c) => !selectedIds.includes(c.id)))
      clearSelection()
    } else if (disconnectModalState.connId) {
      setConnections((prev) => prev.filter((c) => c.id !== disconnectModalState.connId))
    }
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Status Filter State
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredConnections = connections.filter((c) => {
    const isConnectable = CONNECTABLE_APPS.some((app) => app.id === c.appId)
    if (!isConnectable) return false
    const matchesSearch =
      c.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.accountLabel.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const connectionIds = useMemo(
    () => filteredConnections.map((c) => c.id),
    [filteredConnections]
  )

  const {
    selectedIds,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    selectedCount
  } = useTableSelection(connectionIds)

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Premium Floating Pure White Main Canvas Container */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Connections Manager</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Central place to authenticate, store, and manage reusable app account credentials.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {selectedCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={requestBulkDisconnect}
                className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-300 font-bold text-xs space-x-1.5 shadow-none h-9 px-3.5 cursor-pointer animate-in fade-in"
              >
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span>Delete ({selectedCount})</span>
              </Button>
            )}

            {/* Primary Blue Add Connection Button */}
            <Button size="default" className="space-x-2" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Connection</span>
            </Button>
          </div>
        </div>

        {/* Search & View Switch Controls (Unified SearchControlBar) */}
        <SearchControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search connections by app or account name..."
          showFiltersButton={false}
        >
          {/* Status Filter */}
          <div className="w-36">
            <Select
              className="text-xs font-semibold h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Needs reauthorization", label: "Needs Re-auth" },
                { value: "Disconnected", label: "Disconnected" }
              ]}
            />
          </div>

          {/* Grid vs Table View Mode Switcher */}
          <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
              title="List Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </SearchControlBar>

        {/* Connections Content */}
        {viewMode === "grid" ? (
          /* Grid View (Matching Dashboard Card Design System) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredConnections.map((conn) => (
              <Card
                key={conn.id}
                className="w-full border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group rounded-xl shadow-2xs relative overflow-visible hover:z-20"
              >
                {/* Header: Authentic Brand Logo + App Name + Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center justify-center p-1.5 shrink-0">
                      <AppIcon appId={conn.appId} appName={conn.appName} size={22} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {conn.appName}
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{conn.authType}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      conn.status === "Active"
                        ? "success"
                        : conn.status === "Needs reauthorization"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {conn.status}
                  </Badge>
                </div>

                {/* Account Details Box */}
                <div className="p-3 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg space-y-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {conn.accountLabel}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">
                    Last used: {conn.lastUsed}
                  </span>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-600 dark:text-slate-400 space-x-1.5 font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reauthorize</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 space-x-1.5 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    onClick={() => requestDisconnect(conn.id, conn.accountLabel || conn.appName)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Disconnect</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View (100% Identical Dashboard Data Table Layout) */
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-visible rounded-xl relative z-10">
            {filteredConnections.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Link2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No connections found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No app connections match your search query.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-visible min-h-[360px] pb-10 space-y-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <TableCheckbox
                          checked={isAllSelected}
                          indeterminate={isPartiallySelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all connections"
                        />
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                          <span>App Name</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Account Label</th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Auth Mode</th>
                      <th className="py-3 px-4">Last Used</th>
                      <th className="py-3 px-4 w-10 text-center">⭐</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 relative">
                    {filteredConnections.map((conn, rowIdx) => {
                      const openUpward = rowIdx === filteredConnections.length - 1 && filteredConnections.length > 3

                      return (
                        <tr
                          key={conn.id}
                          className={`transition-colors group relative ${
                            isSelected(conn.id) ? "bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <TableCheckbox
                              checked={isSelected(conn.id)}
                              onChange={() => toggleSelect(conn.id)}
                              aria-label={`Select ${conn.appName}`}
                            />
                          </td>

                          {/* App Icon + App Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center p-1 shadow-2xs shrink-0">
                                <AppIcon appId={conn.appId} appName={conn.appName} size={16} />
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs tracking-tight">
                                {conn.appName}
                              </span>
                            </div>
                          </td>

                          {/* Account Label */}
                          <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                            {conn.accountLabel}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                conn.status === "Active"
                                  ? "success"
                                  : conn.status === "Needs reauthorization"
                                  ? "warning"
                                  : "destructive"
                              }
                            >
                              {conn.status}
                            </Badge>
                          </td>

                          {/* Auth Mode */}
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                            {conn.authType}
                          </td>

                          {/* Last Used */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {conn.lastUsed}
                          </td>

                          {/* Star Favorite */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => handleToggleStar(conn.id, e)}>
                            <Star className={`h-4 w-4 cursor-pointer transition-colors ${starredRows[conn.id] ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"}`} />
                          </td>

                          {/* Actions Column with Auto-Upward Popover Menu */}
                          <td className="py-3.5 px-4 text-right relative">
                            <div className="flex items-center justify-end space-x-1">
                              <Button variant="ghost" size="sm" className="text-xs text-slate-600 dark:text-slate-400 space-x-1 h-7 px-2 font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                                <RefreshCw className="h-3 w-3" />
                                <span>Reauthorize</span>
                              </Button>

                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => setActiveMenuConnId(activeMenuConnId === conn.id ? null : conn.id)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>

                                {activeMenuConnId === conn.id && (
                                  <div className={`absolute right-0 z-[100] w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 text-xs text-left animate-in fade-in zoom-in-95 ${openUpward ? "bottom-full mb-1" : "top-8"}`}>
                                    <button
                                      onClick={() => {
                                        setActiveMenuConnId(null)
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                      <span>Reauthorize</span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                    <button
                                      onClick={() => requestDisconnect(conn.id, conn.accountLabel || conn.appName)}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                      <span>Disconnect</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div className="py-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-normal">Showing 1–{filteredConnections.length} of {filteredConnections.length} connections</span>

              <div className="flex items-center space-x-2 w-36">
                <Select
                  value="25"
                  options={[
                    { value: "25", label: "25 per page" },
                    { value: "50", label: "50 per page" },
                    { value: "100", label: "100 per page" }
                  ]}
                  className="text-xs h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200 font-medium"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Screen 15: Add Connection Modal */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogHeader>
            <DialogTitle>Connect New Application Account</DialogTitle>
            <DialogDescription>
              Select an app to authenticate and store secure, encrypted credentials for workflow steps.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveConnection} className="space-y-4 my-2">
            {/* Custom Rich App Selector with REAL BRAND LOGOS */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choose App</label>
              <button
                type="button"
                onClick={() => setAppSelectOpen(!appSelectOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="h-6 w-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200/90 dark:border-slate-600 flex items-center justify-center p-0.5 shadow-2xs shrink-0">
                    <AppIcon appId={selectedAppObj?.id || "google-sheets"} appName={selectedAppObj?.name || "App"} size={16} />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAppObj?.name}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">({selectedAppObj?.authType})</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${appSelectOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""}`} />
              </button>

              {appSelectOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1 animate-in fade-in zoom-in-95">
                  {CONNECTABLE_APPS.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setSelectedAppId(app.id)
                        setAppSelectOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-blue-50/60 dark:hover:bg-slate-700/60 ${
                        selectedAppId === app.id ? "bg-blue-50/80 dark:bg-blue-950/50 font-semibold text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="h-6 w-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200/90 dark:border-slate-600 flex items-center justify-center p-0.5 shadow-2xs shrink-0">
                          <AppIcon appId={app.id} appName={app.name} size={16} />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({app.authType})</span>
                      </div>
                      {selectedAppId === app.id && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {selectedAppObj?.id === "automate-chats" || selectedAppObj?.id === "automate-forms"
                  ? "New Connection Name *"
                  : "Account Label / Identifier"}
              </label>
              <Input
                type="text"
                placeholder={
                  selectedAppObj?.id === "automate-chats"
                    ? `Automate Chats #${connections.filter(c => c.appId === "automate-chats").length + 1}`
                    : selectedAppObj?.id === "automate-forms"
                    ? `Automate Forms #${connections.filter(c => c.appId === "automate-forms").length + 1}`
                    : "e.g. Sales Team Account or workspace email"
                }
                value={accountLabel}
                onChange={(e) => setAccountLabel(e.target.value)}
              />
              {(selectedAppObj?.id === "automate-chats" || selectedAppObj?.id === "automate-forms") && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Name your connection with {selectedAppObj.name}
                </p>
              )}
            </div>

            {/* Adaptive Auth Fields based on App Auth Type */}
            {selectedAppObj?.id === "automate-chats" || selectedAppObj?.id === "automate-forms" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Token*</label>
                <Input
                  type="password"
                  placeholder="Paste API token here..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter the API token here. Login to your <span className="text-blue-600 dark:text-blue-400 underline font-medium">{selectedAppObj.name} account</span>. Navigate to &quot;Settings,&quot; then select &quot;API and Webhooks&quot; and copy the API token.
                </p>
              </div>
            ) : selectedAppObj?.authType === "OAuth 2.0" ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>OAuth 2.0 Authorization</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clicking continue will redirect you to {selectedAppObj.name} to grant permission scope.
                </p>
                {selectedAppObj.id === "hubspot" && (
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 block">HubSpot Permission Scopes:</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">crm.objects.contacts.write</span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">crm.objects.deals.write</span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">crm.objects.companies.write</span>
                    </div>
                  </div>
                )}
                {selectedAppObj.id === "typeform" && (
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 block">Typeform Permission Scopes:</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">forms:read</span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">webhooks:write</span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">responses:read</span>
                    </div>
                  </div>
                )}
              </div>
            ) : selectedAppObj?.authType === "Internal SSO" ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-900 dark:text-emerald-300">
                <span className="font-semibold">Automate Suite SSO Detected</span>
                <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">Shares your active user session. No extra API key required!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">API Key / Token</label>
                <Input
                  type="password"
                  placeholder="Paste bearer token or secret key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              {/* Primary Blue Button */}
              <Button type="submit" disabled={testingConnection}>
                {testingConnection ? "Testing Connection..." : "Test & Save Connection"}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>

        {/* Reusable Alert Confirmation Modal for Disconnecting Accounts */}
        <ConfirmModal
          open={disconnectModalState.open}
          onOpenChange={(open) => setDisconnectModalState((prev) => ({ ...prev, open }))}
          title={disconnectModalState.mode === "bulk" ? `Delete ${disconnectModalState.count} Connections?` : "Disconnect Account?"}
          description={
            disconnectModalState.mode === "bulk"
              ? `Are you sure you want to disconnect and delete ${disconnectModalState.count} selected app connections? Active workflows using these accounts may fail.`
              : `Are you sure you want to disconnect and delete the connection for "${disconnectModalState.connName}"? Active workflows using this account will fail.`
          }
          itemName={disconnectModalState.mode === "bulk" ? undefined : disconnectModalState.connName}
          itemCount={disconnectModalState.mode === "bulk" ? disconnectModalState.count : undefined}
          confirmText={disconnectModalState.mode === "bulk" ? `Delete ${disconnectModalState.count} Connections` : "Disconnect Account"}
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDisconnect}
        />
      </div>
    </div>
  )
}
