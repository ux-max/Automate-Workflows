"use client"

import React, { useState } from "react"
import {
  DeveloperApp,
  DeveloperTrigger,
  TriggerType,
} from "@/lib/developer-types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Drawer } from "@/components/ui/drawer"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Zap,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Radio,
  Clock,
  CheckCircle2,
  Table,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  Send,
  Layers,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Play,
  Eye,
  Code,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TriggersTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

type TriggerDrawerTab = "detail" | "inbuilt" | "multistep"

export function TriggersTab({ app, onChange }: TriggersTabProps) {
  const [editingTrigger, setEditingTrigger] = useState<DeveloperTrigger | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<TriggerDrawerTab>("detail")
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [noInbuiltActionsModal, setNoInbuiltActionsModal] = useState(false)
  const [isSimulatingMultiStep, setIsSimulatingMultiStep] = useState(false)
  const [multiStepSimulationResult, setMultiStepSimulationResult] = useState<string | null>(null)
  const [showLearnMoreDialog, setShowLearnMoreDialog] = useState(false)
  const [previewTriggerJson, setPreviewTriggerJson] = useState<DeveloperTrigger | null>(null)

  // Webhook Capture Simulator state
  const [isListening, setIsListening] = useState(false)
  const [capturedSuccess, setCapturedSuccess] = useState(false)

  // Send Test Request Simulator state
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: number
    statusText: string
    success: boolean
    data: any
  } | null>(null)

  const openNewTrigger = () => {
    const newTrg: DeveloperTrigger = {
      id: `trg_${Date.now()}`,
      key: `trigger_${app.triggers.length + 1}`,
      name: "New Event Trigger",
      description: "Triggers when a specific event occurs in your application.",
      status: "private",
      tutorialUrl: "",
      type: "webhook",
      webhookConfig: {
        setupType: "instant_catch",
      },
      inbuiltActionSteps: [],
      isMultiStep: false,
      multiStepConfig: {
        enabled: false,
        steps: [],
      },
      sampleFields: [
        { key: "event_id", label: "Event ID", type: "string", sampleValue: "evt_98120" },
        { key: "created_at", label: "Created Timestamp", type: "string", sampleValue: new Date().toISOString() },
      ],
    }
    setEditingTrigger(newTrg)
    setDrawerTab("detail")
    setIsModalOpen(true)
    setIsListening(false)
    setCapturedSuccess(false)
    setIsTesting(false)
    setTestResult(null)
  }

  const openEditTrigger = (trg: DeveloperTrigger) => {
    const cloned: DeveloperTrigger = JSON.parse(JSON.stringify(trg))
    if (!cloned.inbuiltActionSteps) cloned.inbuiltActionSteps = []
    if (!cloned.multiStepConfig) cloned.multiStepConfig = { enabled: false, steps: [] }
    setEditingTrigger(cloned)
    setDrawerTab("detail")
    setIsModalOpen(true)
    setIsListening(false)
    setCapturedSuccess(false)
    setIsTesting(false)
    setTestResult(null)
  }

  // Handlers for Inbuilt Actions attached to Trigger
  const handleAddInbuiltStep = () => {
    if (!editingTrigger) return
    const currentInbuilts = app.inbuiltActions || []
    if (currentInbuilts.length === 0) {
      setNoInbuiltActionsModal(true)
      return
    }
    const currentSteps = editingTrigger.inbuiltActionSteps || []
    const newStep = {
      id: `inb_step_${Date.now()}_${currentSteps.length + 1}`,
      inbuiltActionId: currentInbuilts[0].id,
      purpose: "dynamic_dropdown",
      saved: false,
    }
    setEditingTrigger({
      ...editingTrigger,
      inbuiltActionSteps: [...currentSteps, newStep],
    })
  }

  const handleUpdateInbuiltStep = (stepId: string, updates: Partial<{ inbuiltActionId: string; purpose: string; saved: boolean }>) => {
    if (!editingTrigger) return
    const updated = (editingTrigger.inbuiltActionSteps || []).map((s) =>
      s.id === stepId ? { ...s, ...updates } : s
    )
    setEditingTrigger({
      ...editingTrigger,
      inbuiltActionSteps: updated,
    })
  }

  const handleDeleteInbuiltStep = (stepId: string) => {
    if (!editingTrigger) return
    setEditingTrigger({
      ...editingTrigger,
      inbuiltActionSteps: (editingTrigger.inbuiltActionSteps || []).filter((s) => s.id !== stepId),
    })
  }

  // Handlers for Multi-Step in Trigger
  const handleAddMultiStep = () => {
    if (!editingTrigger) return
    const currentConfig = editingTrigger.multiStepConfig || { enabled: true, steps: [] }
    const currentSteps = currentConfig.steps || []
    const firstInbuilt = (app.inbuiltActions || [])[0]
    const newStep = {
      id: `mstep_${Date.now()}_${currentSteps.length + 1}`,
      name: `Multi-Step Action ${currentSteps.length + 1}`,
      type: "inbuilt_action" as const,
      inbuiltActionId: firstInbuilt ? firstInbuilt.id : "",
      targetId: firstInbuilt ? firstInbuilt.id : "",
      considerStatusCode: false,
    }
    setEditingTrigger({
      ...editingTrigger,
      isMultiStep: true,
      multiStepConfig: {
        enabled: true,
        steps: [...currentSteps, newStep],
      },
    })
  }

  const handleUpdateMultiStep = (stepId: string, updates: any) => {
    if (!editingTrigger) return
    const currentConfig = editingTrigger.multiStepConfig || { enabled: true, steps: [] }
    const updatedSteps = (currentConfig.steps || []).map((s) =>
      s.id === stepId ? { ...s, ...updates } : s
    )
    setEditingTrigger({
      ...editingTrigger,
      multiStepConfig: {
        ...currentConfig,
        steps: updatedSteps,
      },
    })
  }

  const handleDeleteMultiStep = (stepId: string) => {
    if (!editingTrigger) return
    const currentConfig = editingTrigger.multiStepConfig || { enabled: true, steps: [] }
    setEditingTrigger({
      ...editingTrigger,
      multiStepConfig: {
        ...currentConfig,
        steps: (currentConfig.steps || []).filter((s) => s.id !== stepId),
      },
    })
  }

  const saveTriggerModal = () => {
    if (!editingTrigger) return
    const exists = app.triggers.some((t) => t.id === editingTrigger.id)
    let updatedList: DeveloperTrigger[]
    if (exists) {
      updatedList = app.triggers.map((t) => (t.id === editingTrigger.id ? editingTrigger : t))
    } else {
      updatedList = [...app.triggers, editingTrigger]
    }
    onChange({
      ...app,
      triggers: updatedList,
    })
    setIsModalOpen(false)
    setEditingTrigger(null)
  }

  const deleteTrigger = (id: string) => {
    onChange({
      ...app,
      triggers: app.triggers.filter((t) => t.id !== id),
    })
  }

  const addSampleField = () => {
    if (!editingTrigger) return
    const newField = {
      key: `field_${editingTrigger.sampleFields.length + 1}`,
      label: "Custom Field",
      type: "string",
      sampleValue: "Sample value",
    }
    setEditingTrigger({
      ...editingTrigger,
      sampleFields: [...editingTrigger.sampleFields, newField],
    })
  }

  const updateSampleField = (idx: number, fieldKey: string, val: string) => {
    if (!editingTrigger) return
    const updated = [...editingTrigger.sampleFields]
    updated[idx] = { ...updated[idx], [fieldKey]: val }
    setEditingTrigger({
      ...editingTrigger,
      sampleFields: updated,
    })
  }

  const deleteSampleField = (idx: number) => {
    if (!editingTrigger) return
    setEditingTrigger({
      ...editingTrigger,
      sampleFields: editingTrigger.sampleFields.filter((_, i) => i !== idx),
    })
  }

  // Trigger Category Helper (3 options)
  const getTriggerCategory = (trg: DeveloperTrigger): "webhook_instructions" | "webhook_api" | "polling" => {
    if (trg.type === "polling") return "polling"
    if (trg.webhookConfig?.setupType === "rest_hook") return "webhook_api"
    return "webhook_instructions"
  }

  const handleTriggerTypeChange = (val: string) => {
    if (!editingTrigger) return
    if (val === "webhook_instructions") {
      setDrawerTab("detail")
      setEditingTrigger({
        ...editingTrigger,
        type: "webhook",
        webhookConfig: {
          ...editingTrigger.webhookConfig,
          setupType: "instant_catch",
        },
      })
    } else if (val === "webhook_api") {
      setEditingTrigger({
        ...editingTrigger,
        type: "webhook",
        webhookConfig: {
          ...editingTrigger.webhookConfig,
          setupType: "rest_hook",
          subscribeMethod: editingTrigger.webhookConfig?.subscribeMethod || "GET",
          subscribeUrl: editingTrigger.webhookConfig?.subscribeUrl || "https://api.yourdomain.com/v1/webhooks",
        },
      })
    } else if (val === "polling") {
      setEditingTrigger({
        ...editingTrigger,
        type: "polling",
        pollingConfig: editingTrigger.pollingConfig || {
          endpointUrl: "https://api.acme.com/v1/records",
          deduplicationField: "id",
          frequencyMinutes: 5,
        },
      })
    }
  }

  // Live Webhook Capture Simulator
  const startListening = () => {
    setIsListening(true)
    setCapturedSuccess(false)
  }

  const simulateIncomingWebhook = () => {
    if (!editingTrigger) return
    setIsListening(false)
    setCapturedSuccess(true)

    const mockCaptured = [
      { key: "event_type", label: "Event Type", type: "string", sampleValue: "lead.created" },
      { key: "record_id", label: "Record ID", type: "number", sampleValue: "94021" },
      { key: "email", label: "Contact Email", type: "string", sampleValue: "alex.hunter@company.com" },
      { key: "status", label: "Pipeline Status", type: "string", sampleValue: "Qualified Lead" },
      { key: "deal_value", label: "Deal Value ($)", type: "number", sampleValue: "18500" },
      { key: "timestamp", label: "Triggered At", type: "string", sampleValue: new Date().toISOString() },
    ]

    setEditingTrigger({
      ...editingTrigger,
      sampleFields: mockCaptured,
    })
  }

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  // Send Test Request Handler (tests subscribe API or polling endpoint and auto-generates output fields)
  const handleSendTriggerTestRequest = async () => {
    if (!editingTrigger) return
    setIsTesting(true)
    setTestResult(null)

    const category = getTriggerCategory(editingTrigger)
    let url = ""
    let method = "GET"
    let body: any = undefined

    if (category === "webhook_api") {
      url = editingTrigger.webhookConfig?.subscribeUrl || "https://api.acme.com/v1/webhooks"
      method = editingTrigger.webhookConfig?.subscribeMethod || "POST"
      body = JSON.stringify({
        webhook_url: webhookUrl,
        event: editingTrigger.key || "event.created",
      })
    } else if (category === "polling") {
      url = editingTrigger.pollingConfig?.endpointUrl || "https://api.acme.com/v1/records"
      method = "GET"
    }

    try {
      const isDummy = url.includes("example.com") || url.includes("acme.com") || !url.startsWith("http")
      let resData: any = null
      let statusCode = 200
      let statusText = "OK"

      if (!isDummy) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 4000)
          const resp = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: ["GET", "HEAD"].includes(method) ? undefined : body,
            signal: controller.signal,
          })
          clearTimeout(timeoutId)
          statusCode = resp.status
          statusText = resp.statusText || "OK"
          resData = await resp.json().catch(() => ({ message: "Success", status: "ok" }))
        } catch {
          statusCode = 200
          statusText = "OK (Simulated Test)"
          if (category === "webhook_api") {
            resData = {
              webhook_id: `wh_${Date.now().toString().slice(-6)}`,
              status: "active",
              target_url: webhookUrl,
              event: editingTrigger.key || "order.created",
              created_at: new Date().toISOString(),
            }
          } else {
            resData = {
              id: `rec_${Date.now().toString().slice(-6)}`,
              title: "New Item Record",
              status: "published",
              timestamp: new Date().toISOString(),
            }
          }
        }
      } else {
        await new Promise((r) => setTimeout(r, 600))
        statusCode = 200
        statusText = "OK"
        if (category === "webhook_api") {
          resData = {
            webhook_id: `wh_${Date.now().toString().slice(-6)}`,
            status: "active",
            target_url: webhookUrl,
            event: editingTrigger.key || "order.created",
            created_at: new Date().toISOString(),
          }
        } else {
          resData = {
            id: `rec_${Date.now().toString().slice(-6)}`,
            title: "New Item Record",
            status: "published",
            timestamp: new Date().toISOString(),
          }
        }
      }

      setTestResult({
        status: statusCode,
        statusText,
        success: statusCode >= 200 && statusCode < 300,
        data: resData,
      })

      // Extract sample fields from JSON response
      const sampleItem = Array.isArray(resData) ? resData[0] : resData
      if (sampleItem && typeof sampleItem === "object") {
        const extracted = Object.keys(sampleItem).map((k) => {
          const val = sampleItem[k]
          let type: "string" | "number" | "boolean" | "date" = "string"
          if (typeof val === "number") type = "number"
          else if (typeof val === "boolean") type = "boolean"
          else if (typeof val === "string" && !isNaN(Date.parse(val)) && val.includes("-")) type = "date"

          const formattedLabel = k
            .split(/[_.-]/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")

          return {
            key: k,
            label: formattedLabel,
            type,
            sampleValue: typeof val === "object" ? JSON.stringify(val) : String(val),
          }
        })

        setEditingTrigger((prev) =>
          prev
            ? {
                ...prev,
                sampleFields: extracted,
              }
            : null
        )
      }
    } catch {
      setTestResult({
        status: 500,
        statusText: "Error sending test request",
        success: false,
        data: { error: "Failed to connect to endpoint" },
      })
    } finally {
      setIsTesting(false)
    }
  }

  const webhookUrl = `https://automate.app/api/webhooks/catch/${app.slug || "custom-app"}/${editingTrigger?.key || "trigger"}`

  const renderTriggerExecutionConfig = () => {
    if (!editingTrigger) return null
    return (
      <div className="space-y-4 pt-1">
        {/* Trigger Type Dropdown (3 options) */}
        <div className={cn("space-y-1.5", drawerTab === "detail" && "pt-2 border-t border-slate-100 dark:border-slate-800")}>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Trigger Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={getTriggerCategory(editingTrigger)}
            onChange={(e) => handleTriggerTypeChange(e.target.value)}
            options={[
              {
                value: "webhook_instructions",
                label: "Webhooks Setup by Instructions (Highly Recommended)",
              },
              {
                value: "webhook_api",
                label: "Webhooks Setup by API Request (Recommended)",
              },
              {
                value: "polling",
                label: "Polling to Check New Data (Not Recommended)",
              },
            ]}
            className="h-10 text-xs font-medium"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-0.5">
            {getTriggerCategory(editingTrigger) === "webhook_instructions" &&
              "Description based instant notification."}
            {getTriggerCategory(editingTrigger) === "webhook_api" &&
              "API based instant notification."}
            {getTriggerCategory(editingTrigger) === "polling" &&
              "Fetch new data at a specific interval."}
          </p>
        </div>

        {/* Mode 1: Webhooks Setup by Instructions */}
        {getTriggerCategory(editingTrigger) === "webhook_instructions" && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            {/* Live Webhook Capture Listener */}
            <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/80 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Live Webhook Capture Listener
                </h5>
                <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                  Instant Catch
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="font-mono text-xs bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                />
                <Button
                  type="button"
                  onClick={() => copyWebhookUrl(webhookUrl)}
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 text-xs shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "Copied" : "Copy URL"}</span>
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {!isListening && !capturedSuccess && (
                  <Button
                    type="button"
                    onClick={startListening}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Capture Webhook Response</span>
                  </Button>
                )}

                {isListening && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Waiting for Webhook Response...
                    </span>
                    <Button
                      type="button"
                      onClick={simulateIncomingWebhook}
                      size="sm"
                      variant="outline"
                      className="text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      Send Test Ping Now
                    </Button>
                  </div>
                )}

                {capturedSuccess && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Sample Webhook Captured! Output fields updated below.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Webhooks Setup by API Request (single unified form) */}
        {getTriggerCategory(editingTrigger) === "webhook_api" && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  HTTP Method <span className="text-red-500">*</span>
                </label>
                <Select
                  value={editingTrigger.webhookConfig?.subscribeMethod || "GET"}
                  onChange={(e) =>
                    setEditingTrigger({
                      ...editingTrigger,
                      webhookConfig: {
                        ...editingTrigger.webhookConfig,
                        setupType: "rest_hook",
                        subscribeMethod: e.target.value as any,
                      },
                    })
                  }
                  options={[
                    { value: "POST", label: "POST" },
                    { value: "GET", label: "GET" },
                    { value: "PUT", label: "PUT" },
                    { value: "DELETE", label: "DELETE" },
                    { value: "PATCH", label: "PATCH" },
                  ]}
                  className="h-10 text-xs font-medium"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-0.5 leading-relaxed">
                  Authentication is a process that verifies the user trying to access the third-party application is a legitimate user of that application.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Endpoint URL <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editingTrigger.webhookConfig?.subscribeUrl || ""}
                  onChange={(e) =>
                    setEditingTrigger({
                      ...editingTrigger,
                      webhookConfig: {
                        ...editingTrigger.webhookConfig,
                        setupType: "rest_hook",
                        subscribeUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://api.yourdomain.com/v1/webhooks"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Send Test Request Action Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/80">
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Test API Request
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send a test call to verify your endpoint and auto-generate the Trigger Output Variables below.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleSendTriggerTestRequest}
                disabled={isTesting}
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 shrink-0"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{isTesting ? "Testing API..." : "Send Test Request"}</span>
              </Button>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] font-mono ${
                        testResult.success
                          ? "bg-blue-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {testResult.status} {testResult.statusText}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {testResult.success
                        ? "✓ Output fields auto-detected from response"
                        : "Connection failed"}
                    </span>
                  </div>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[10px] overflow-x-auto max-h-32">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Mode 3: Polling to Check New Data */}
        {getTriggerCategory(editingTrigger) === "polling" && (
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Polling Query Configuration
              </h5>
              <Button
                type="button"
                onClick={handleSendTriggerTestRequest}
                disabled={isTesting}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 shrink-0"
              >
                {isTesting ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                ) : (
                  <Send className="w-3 h-3 text-blue-600" />
                )}
                <span>{isTesting ? "Testing..." : "Send Test Request"}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Polling Query URL <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editingTrigger.pollingConfig?.endpointUrl || ""}
                  onChange={(e) =>
                    setEditingTrigger({
                      ...editingTrigger,
                      pollingConfig: {
                        endpointUrl: e.target.value,
                        deduplicationField: editingTrigger.pollingConfig?.deduplicationField || "id",
                        frequencyMinutes: editingTrigger.pollingConfig?.frequencyMinutes || 5,
                      },
                    })
                  }
                  placeholder="https://api.acme.com/v1/records"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Polling Frequency
                </label>
                <Select
                  value={String(editingTrigger.pollingConfig?.frequencyMinutes || 5)}
                  onChange={(e) =>
                    setEditingTrigger({
                      ...editingTrigger,
                      pollingConfig: {
                        endpointUrl: editingTrigger.pollingConfig?.endpointUrl || "",
                        deduplicationField: editingTrigger.pollingConfig?.deduplicationField || "id",
                        frequencyMinutes: Number(e.target.value),
                      },
                    })
                  }
                  options={[
                    { value: "5", label: "Every 5 minutes (Recommended)" },
                    { value: "10", label: "Every 10 minutes" },
                    { value: "15", label: "Every 15 minutes" },
                  ]}
                  className="h-10 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deduplication Field Key
              </label>
              <Input
                value={editingTrigger.pollingConfig?.deduplicationField || "id"}
                onChange={(e) =>
                  setEditingTrigger({
                    ...editingTrigger,
                    pollingConfig: {
                      endpointUrl: editingTrigger.pollingConfig?.endpointUrl || "",
                      deduplicationField: e.target.value,
                      frequencyMinutes: editingTrigger.pollingConfig?.frequencyMinutes || 5,
                    },
                  })
                }
                placeholder="e.g. id or updated_at"
                className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] font-mono ${
                        testResult.success
                          ? "bg-blue-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {testResult.status} {testResult.statusText}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {testResult.success
                        ? "✓ Output fields auto-detected from polling response"
                        : "Polling query failed"}
                    </span>
                  </div>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[10px] overflow-x-auto max-h-32">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Output Variables Table */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-blue-600" />
                Trigger Output Variables
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                These fields become selectable variables in subsequent workflow action steps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {getTriggerCategory(editingTrigger) !== "webhook_instructions" && (
                <Button
                  type="button"
                  onClick={handleSendTriggerTestRequest}
                  disabled={isTesting}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                  ) : (
                    <Send className="w-3 h-3 text-blue-600" />
                  )}
                  <span>{isTesting ? "Testing..." : "Send Test Request"}</span>
                </Button>
              )}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Field Key</th>
                  <th className="py-2.5 px-3">Display Label</th>
                  <th className="py-2.5 px-3">Sample Value</th>
                  <th className="py-2.5 px-2 text-right w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {editingTrigger.sampleFields.map((field, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2">
                      <Input
                        value={field.key}
                        onChange={(e) => updateSampleField(idx, "key", e.target.value)}
                        className="h-8 text-sm font-medium text-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={field.label}
                        onChange={(e) => updateSampleField(idx, "label", e.target.value)}
                        className="h-8 text-sm font-medium text-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={field.sampleValue}
                        onChange={(e) => updateSampleField(idx, "sampleValue", e.target.value)}
                        className="h-8 text-sm font-medium text-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        type="button"
                        onClick={() => deleteSampleField(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Custom Output Field Button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSampleField}
              className="h-8 text-xs gap-1 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Output Field</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Configured Triggers ({app.triggers.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Triggers start workflows when events happen in your app via Webhooks or Scheduled Polling.
          </p>
        </div>

        <Button
          type="button"
          onClick={openNewTrigger}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trigger</span>
        </Button>
      </div>

      {/* Triggers List */}
      {app.triggers.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
          <Zap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No triggers configured yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Add an Instant Webhook or Polling trigger so users can trigger automations when records change in your service.
          </p>
          <Button
            type="button"
            onClick={openNewTrigger}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Trigger</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {app.triggers.map((trigger) => (
            <Card
              key={trigger.id}
              className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs rounded-xl"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {trigger.type === "webhook" ? <Radio className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{trigger.name}</h4>
                        <Badge
                          variant="blue"
                          className="text-[10px] font-medium"
                        >
                          {trigger.type === "webhook" ? "Instant Webhook" : "Polling"}
                        </Badge>
                        <span className="font-mono text-[11px] text-slate-400">key: {trigger.key}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{trigger.description}</p>

                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          <strong className="font-semibold">{trigger.sampleFields.length}</strong> output fields mapped
                        </span>
                        {trigger.type === "polling" && trigger.pollingConfig && (
                          <span>
                            • Polling interval: <strong className="font-semibold">{trigger.pollingConfig.frequencyMinutes}m</strong>
                          </span>
                        )}
                        {trigger.type === "webhook" && trigger.webhookConfig && (
                          <span>
                            • Setup: <strong className="font-semibold">{trigger.webhookConfig.setupType === "rest_hook" ? "REST Hook" : "Catch URL"}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      onClick={() => setPreviewTriggerJson(trigger)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      title="Preview Trigger Output & JSON Schema"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => openEditTrigger(trigger)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      title="Configure Trigger"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => deleteTrigger(trigger.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      title="Delete Trigger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trigger Builder Drawer using built-in Drawer component */}
      {isModalOpen && editingTrigger && (
        <Drawer
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          side="right"
          className="w-[780px] max-w-[94vw]"
          header={
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 rounded-t-2xl shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold shadow-2xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Trigger Configuration
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowLearnMoreDialog(true)}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Learn more about Trigger Configuration"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pt-1 -mb-5 px-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setDrawerTab("detail")}
                  className={cn(
                    "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer",
                    drawerTab === "detail"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  Trigger Details
                </button>
                {getTriggerCategory(editingTrigger) !== "webhook_instructions" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDrawerTab("inbuilt")}
                      className={cn(
                        "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                        drawerTab === "inbuilt"
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      <span>Setup Inbuilt Actions</span>
                      {editingTrigger.inbuiltActionSteps && editingTrigger.inbuiltActionSteps.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                          {editingTrigger.inbuiltActionSteps.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerTab("multistep")}
                      className={cn(
                        "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                        drawerTab === "multistep"
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      <span>Setup Multi-Step Action</span>
                      {editingTrigger.isMultiStep && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                          Active
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                {getTriggerCategory(editingTrigger) !== "webhook_instructions" && (
                  <>
                    {drawerTab === "inbuilt" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDrawerTab("detail")}
                        className="text-xs gap-1.5 font-medium"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back: Trigger Details</span>
                      </Button>
                    )}
                    {drawerTab === "multistep" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDrawerTab("inbuilt")}
                        className="text-xs gap-1.5 font-medium"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back: Setup Inbuilt Actions</span>
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getTriggerCategory(editingTrigger) === "webhook_instructions" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveTriggerModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Trigger</span>
                  </Button>
                ) : (
                  <>
                    {drawerTab === "detail" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setDrawerTab("inbuilt")}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                      >
                        <span>Next: Setup Inbuilt Actions</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {drawerTab === "inbuilt" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setDrawerTab("multistep")}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                      >
                        <span>Next: Setup Multi-Step Action</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {drawerTab === "multistep" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveTriggerModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Trigger</span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 pr-1">
            {/* Tab 1: Trigger Details */}
            {drawerTab === "detail" && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Trigger Display Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={editingTrigger.name}
                      onChange={(e) =>
                        setEditingTrigger({
                          ...editingTrigger,
                          name: e.target.value,
                          key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                        })
                      }
                      placeholder="e.g. New Contact Created"
                      className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Trigger Key
                    </label>
                    <Input
                      value={editingTrigger.key}
                      onChange={(e) => setEditingTrigger({ ...editingTrigger, key: e.target.value })}
                      placeholder="e.g. new_contact_created"
                      className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trigger Description
                  </label>
                  <Input
                    value={editingTrigger.description}
                    onChange={(e) => setEditingTrigger({ ...editingTrigger, description: e.target.value })}
                    placeholder="Enter a brief description of your trigger event here e.g. Triggers when a new subscriber is created."
                    className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                  />
                </div>



                {/* Trigger Execution & Output Details in Trigger Details Tab */}
                {renderTriggerExecutionConfig()}


              </div>
            )}

            {/* Tab 2: Setup Inbuilt Actions */}
        {drawerTab === "inbuilt" && (
          <div className="space-y-5 pt-1">
            {/* Yellow Notice Banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              <div className="flex-1">
                After creating the inbuilt action, make sure to add it to the trigger where you want its dynamic dropdown options or custom fields to appear.{" "}
                <button
                  type="button"
                  onClick={() => setShowLearnMoreDialog(true)}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Learn more
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add other inbuilt actions to execute as nested steps or dynamic option providers within this trigger.
            </p>

            {/* Steps List */}
            <div className="space-y-4">
              {(!editingTrigger.inbuiltActionSteps || editingTrigger.inbuiltActionSteps.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No Inbuilt Actions Attached Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Attach an In-built Action to populate dynamic dropdowns or resolve cascading field choices for this trigger event.
                  </p>
                </div>
              ) : (
                editingTrigger.inbuiltActionSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Inbuilt Action Step {idx + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteInbuiltStep(step.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Select Inbuilt Action
                      </label>
                      <select
                        value={step.inbuiltActionId}
                        onChange={(e) =>
                          handleUpdateInbuiltStep(step.id, { inbuiltActionId: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {(app.inbuiltActions || []).map((inb) => (
                          <option key={inb.id} value={inb.id}>
                            {inb.name} ({inb.key})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUpdateInbuiltStep(step.id, { saved: true })}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 font-semibold"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {/* Add Step Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddInbuiltStep}
                className="w-full py-2.5 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Inbuilt Action Step</span>
              </Button>
            </div>


          </div>
        )}

        {/* Tab 3: Setup Multi-Step Action */}
        {drawerTab === "multistep" && (
          <div className="space-y-4 pt-1 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <p>
                In this section, you can setup the multi step action.{" "}
                <button
                  type="button"
                  onClick={() => setShowLearnMoreDialog(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                >
                  Learn more
                </button>
              </p>
            </div>

            {/* Notice when no inbuilt actions exist */}
            {(app.inbuiltActions || []).length === 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>First you need to create an In-built Action before you can chain it as a multi-step action.</span>
              </div>
            )}

            {/* Steps List */}
            <div className="space-y-4">
              {(!editingTrigger.multiStepConfig?.steps || editingTrigger.multiStepConfig.steps.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No Multi-Step Actions Attached Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Add a multi-step inbuilt action step to chain with this trigger event.
                  </p>
                </div>
              ) : (
                editingTrigger.multiStepConfig.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4"
                  >
                    {/* Card Top Row: Title & Remove '✕' */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Multi-Step Action {idx + 1}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Select a multi-step inbuilt action to chain with this action.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMultiStep(step.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                        title="Remove step"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dotted / Dashed Separator Line */}
                    <div className="border-t border-dashed border-slate-200 dark:border-slate-800 -mx-5 px-5" />

                    {/* Select Inbuilt Action Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Multi-Step Inbuilt Action
                      </label>
                      <Select
                        value={step.inbuiltActionId || step.targetId || ""}
                        onChange={(e) =>
                          handleUpdateMultiStep(step.id, {
                            inbuiltActionId: e.target.value,
                            targetId: e.target.value,
                          })
                        }
                        options={[
                          { value: "", label: "Select Multi-Step Inbuilt Action" },
                          ...(app.inbuiltActions || []).map((inb) => ({
                            value: inb.id,
                            label: `${inb.name} (${inb.key})`,
                          })),
                        ]}
                        className="h-10 text-xs font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    {/* Checkbox: Consider this multi-step response for HTTP status code determination */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id={`status_code_check_trigger_${step.id}`}
                        checked={Boolean(step.considerStatusCode)}
                        onChange={(e) =>
                          handleUpdateMultiStep(step.id, {
                            considerStatusCode: e.target.checked,
                          })
                        }
                        className="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`status_code_check_trigger_${step.id}`}
                        className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-relaxed"
                      >
                        Consider this multi-step response for HTTP status code determination
                      </label>
                    </div>
                  </div>
                ))
              )}

              {/* Bottom '+ Add Multi-Step Action Step' Button */}
              <button
                type="button"
                onClick={handleAddMultiStep}
                className="w-full py-3 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Multi-Step Action Step</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )}

  {/* Warning Modal when 0 Inbuilt Actions exist */}
  <Dialog
    open={noInbuiltActionsModal}
    onOpenChange={setNoInbuiltActionsModal}
    className="max-w-sm"
  >
    <div className="flex flex-col items-center text-center space-y-4 pt-1">
      {/* Amber Warning Icon Pill */}
      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Warning
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          First you need to create an In-built action.
        </p>
      </div>

      <div className="pt-1 flex justify-center w-full">
        <Button
          type="button"
          onClick={() => setNoInbuiltActionsModal(false)}
          className="h-8.5 px-7 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
        >
          OK
        </Button>
      </div>
    </div>
  </Dialog>

  {/* Learn More Dialog */}
  <Dialog open={showLearnMoreDialog} onOpenChange={setShowLearnMoreDialog}>
    <DialogHeader>
      <DialogTitle className="text-base font-semibold flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-600" />
        How to Use: Triggers & In-built Actions
      </DialogTitle>
      <DialogDescription>
        Step-by-step guide to setting up event triggers and attaching helper dropdown actions.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
        <strong className="font-semibold">What this does:</strong> Listens for incoming real-time webhooks or polls your service on a schedule to initiate automated user workflows.
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
          How Developer Configures It:
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
          <li>
            <strong className="font-semibold">Choose Trigger Type:</strong> Select <strong>Instant Webhook</strong> (real-time push) or <strong>Polling</strong> (fetch updates every 5-15 mins).
          </li>
          <li>
            <strong className="font-semibold">Attach In-built Actions:</strong> Link internal helper actions to dynamically populate user dropdowns (e.g. List of Boards or Channels).
          </li>
          <li>
            <strong className="font-semibold">Sample Output Fields:</strong> Define the JSON keys emitted when the trigger fires so downstream action steps can use them.
          </li>
        </ol>
      </div>

      <div className="space-y-1.5">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
          How End-Users Experience It:
        </h4>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Users select this trigger in the canvas as Step 1 of their workflow. When an event happens in your application, the workflow starts immediately and processes the incoming payload.
        </p>
      </div>
    </div>
    <DialogFooter>
      <Button
        type="button"
        size="sm"
        onClick={() => setShowLearnMoreDialog(false)}
        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
      >
        Got it
      </Button>
    </DialogFooter>
  </Dialog>

  {/* Trigger JSON Schema & Output Payload Modal */}
  <Dialog
    open={Boolean(previewTriggerJson)}
    onOpenChange={(open) => {
      if (!open) setPreviewTriggerJson(null)
    }}
    className="max-w-2xl"
  >
    {previewTriggerJson && (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Trigger Output Schema & Payload Definition</span>
          </DialogTitle>
          <DialogDescription>
            Raw technical JSON definition and sample payload fields for <code className="font-mono font-semibold text-slate-900 dark:text-slate-100">{previewTriggerJson.name}</code> ({previewTriggerJson.key}).
          </DialogDescription>
        </DialogHeader>

        <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{JSON.stringify(previewTriggerJson, null, 2)}</pre>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(previewTriggerJson, null, 2))
            }}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy JSON
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setPreviewTriggerJson(null)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </div>
    )}
  </Dialog>
    </div>
  )
}
