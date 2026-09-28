"use client"

import React, { useState } from "react"
import {
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Copy,
  Check,
  X,
  History,
  Code2,
  Maximize2,
  Minimize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CustomActionItem, CustomActionTestRun } from "@/lib/custom-action-types"
import { ActionCodeViewer } from "./ActionCodeViewer"

interface ActionSandboxDrawerProps {
  action: CustomActionItem
  onClose?: () => void
  onSaveTestRun: (run: CustomActionTestRun) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  activeTab?: string
  onActiveTabChange?: (tab: string) => void
  width?: number
  isDragging?: boolean
  onStartResize?: (e: React.MouseEvent) => void
  onToggleWide?: () => void
  isWide?: boolean
}

export function ActionSandboxDrawer({
  action,
  onClose,
  onSaveTestRun,
  isCollapsed = false,
  onToggleCollapse,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  width = 460,
  isDragging = false,
  onStartResize,
  onToggleWide,
  isWide = false
}: ActionSandboxDrawerProps) {
  const [internalTab, setInternalTab] = useState("test_action")
  const currentTab = controlledActiveTab ?? internalTab

  const handleTabChange = (val: string) => {
    setInternalTab(val)
    if (onActiveTabChange) {
      onActiveTabChange(val)
    }
  }

  const [authToken, setAuthToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    action.fields.forEach((f) => {
      init[f.id] = f.placeholder && !f.placeholder.startsWith("e.g.") ? f.placeholder : ""
    })
    return init
  })
  const [isTesting, setIsTesting] = useState(false)
  const [latestResult, setLatestResult] = useState<CustomActionTestRun | null>(
    action.testHistory[0] || null
  )
  const [copiedJson, setCopiedJson] = useState(false)

  const handleFieldChange = (fieldId: string, val: string) => {
    setParamValues((prev) => ({ ...prev, [fieldId]: val }))
  }

  const handleRunTest = () => {
    setIsTesting(true)
    setTimeout(() => {
      setIsTesting(false)
      const mockResult: CustomActionTestRun = {
        id: `test_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: 200,
        statusText: "OK",
        latencyMs: Math.floor(Math.random() * 90) + 140,
        requestPayload: { ...paramValues },
        responsePayload: {
          success: true,
          app: action.appName,
          action: action.actionName,
          spreadsheetId: paramValues["spreadsheet_id"] || "1BuMvX0XRA5nFMdKv8cIR7grmUUqntbx74QgVF2upmx",
          sheetId: paramValues["sheet_id"] || "0",
          status: "SUCCESS",
          executedAt: new Date().toISOString()
        }
      }
      setLatestResult(mockResult)
      onSaveTestRun(mockResult)
    }, 600)
  }

  const handleCopyResult = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  return (
    <aside
      style={{
        width: isCollapsed ? 0 : `${width}px`,
        minWidth: isCollapsed ? 0 : undefined,
        maxWidth: isCollapsed ? 0 : undefined
      }}
      className={`relative shrink-0 border-l border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full select-none transition-[width] ${
        isDragging ? "transition-none select-none" : "duration-200 ease-out"
      } overflow-hidden ${
        isCollapsed
          ? "border-l-0 opacity-0 pointer-events-none"
          : "opacity-100"
      }`}
    >
      {/* Draggable Left Edge Resizer Handle */}
      {!isCollapsed && onStartResize && (
        <div
          onMouseDown={onStartResize}
          className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-40 group flex items-center justify-center hover:bg-blue-500/10 active:bg-blue-500/20 transition-colors"
          title="Drag to resize drawer width"
        >
          <div className="w-1 h-9 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-500 group-hover:h-12 group-active:bg-blue-600 transition-all shadow-xs" />
        </div>
      )}

      <div style={{ width: `${width}px` }} className="h-full flex flex-col">
        {/* Top Drawer Header with Tabs & Close button */}
        <div className="h-14 px-4 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-auto">
            <TabsList className="h-8 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <TabsTrigger
                value="test_action"
                className="text-xs font-bold px-3 h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-2xs cursor-pointer"
              >
                Test Action
              </TabsTrigger>
              <TabsTrigger
                value="test_history"
                className="text-xs font-bold px-3 h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-2xs flex items-center space-x-1 cursor-pointer"
              >
                <span>Test History</span>
                {action.testHistory.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {action.testHistory.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="view_code"
                className="text-xs font-bold px-3 h-7 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-2xs flex items-center space-x-1 cursor-pointer"
              >
                <span>View Code</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-1">
            {onToggleWide && (
              <button
                type="button"
                onClick={onToggleWide}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isWide ? "Restore standard drawer width (460px)" : "Increase drawer width (Wide Mode)"}
              >
                {isWide ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            {(onClose || onToggleCollapse) && (
              <button
                type="button"
                onClick={onClose || onToggleCollapse}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Test Action Form */}
        {currentTab === "test_action" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Action Event Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Action *
              </label>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-xs text-slate-800 dark:text-slate-200">
                1. {action.actionName}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
            </div>

            {/* Authentication Section */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Authentication</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {action.authLabel} *
                </label>

                <div className="relative flex items-center">
                  <Input
                    type={showToken ? "text" : "password"}
                    name="api_credential_token_secret"
                    id="api_credential_token_secret"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder={action.authPlaceholder}
                    className="text-xs font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md transition-colors cursor-pointer"
                    title={showToken ? "Hide token" : "Show token"}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {action.authHelpUrl && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter your OAuth 2.0 access token or API credentials.{" "}
                    <a
                      href={action.authHelpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center"
                    >
                      <span>Developer documentation</span>
                      <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Dynamic Parameters Section */}
            <div className="space-y-3.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Parameters</span>
              </div>

              {action.fields.map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>
                      {f.id} {f.required && <strong className="text-red-500">*</strong>}
                    </span>
                  </label>
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    value={paramValues[f.id] || ""}
                    onChange={(e) => handleFieldChange(f.id, e.target.value)}
                    placeholder={f.placeholder || `Enter ${f.label}`}
                    className="text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                  {f.helperText && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {f.helperText}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Send Test Request Action Button */}
            <div className="pt-2">
              <Button
                size="default"
                onClick={handleRunTest}
                disabled={isTesting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 space-x-2 shadow-2xs cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Send Test Request</span>
                  </>
                )}
              </Button>
            </div>

            {/* Live Response Result Card */}
            {latestResult && (
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {latestResult.status} {latestResult.statusText}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {latestResult.latencyMs}ms
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyResult(latestResult.responsePayload)}
                    className="h-6 px-2 text-[10px] font-semibold space-x-1"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-400" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* JSON tree viewer */}
                <div className="p-3 bg-slate-950 rounded-xl text-slate-200 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed selection:bg-blue-600">
                  <pre>{JSON.stringify(latestResult.responsePayload, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Test History Logs */}
        {currentTab === "test_history" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {action.testHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <History className="h-8 w-8 mx-auto stroke-[1.5] text-slate-300 dark:text-slate-700" />
                <p>No sandbox test executions yet.</p>
                <p className="text-[11px]">Run a test in the &quot;Test Action&quot; tab to record logs.</p>
              </div>
            ) : (
              action.testHistory.map((run, i) => (
                <div
                  key={run.id}
                  className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                        {run.status} {run.statusText}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {run.latencyMs}ms
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {run.timestamp}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg text-slate-200 font-mono text-[10px] overflow-x-auto max-h-24 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <pre>{JSON.stringify(run.responsePayload, null, 2)}</pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: View Code matching Image 2 */}
        {currentTab === "view_code" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between pb-0.5">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Code2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{action.actionName}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  TypeScript execution handler code
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900 font-mono">
                {action.generatedCode.split("\n").length} lines
              </span>
            </div>

            <ActionCodeViewer
              code={action.generatedCode}
              actionName={action.actionName}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
