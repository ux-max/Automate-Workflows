"use client"

import React, { useState } from "react"
import {
  DeveloperApp,
  DeveloperAction,
  ActionInputField,
  ActionParameterMapping,
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
  Layers,
  Plus,
  Trash2,
  Edit2,
  Copy,
  CopyPlus,
  Table,
  Check,
  ChevronDown,
  Sparkles,
  Play,
  Tag,
  ListFilter,
  CheckCircle2,
  X,
  Send,
  RefreshCw,
  Settings,
  Settings2,
  SlidersHorizontal,
  GripVertical,
  PlusCircle,
  Link2,
  ExternalLink,
  List,
  Database,
  HelpCircle,
  Info,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  Code,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionsTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

type ActionDrawerTab = "detail" | "inbuilt" | "api" | "multistep"

export function ActionsTab({ app, onChange }: ActionsTabProps) {
  const [editingAction, setEditingAction] = useState<DeveloperAction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<ActionDrawerTab>("detail")
  const [noInbuiltActionsModal, setNoInbuiltActionsModal] = useState(false)
  const [isSimulatingMultiStep, setIsSimulatingMultiStep] = useState(false)
  const [multiStepSimulationResult, setMultiStepSimulationResult] = useState<string | null>(null)
  const [previewDropdownOpen, setPreviewDropdownOpen] = useState<string | null>(null)
  const [showHeaders, setShowHeaders] = useState(false)
  const [showParameters, setShowParameters] = useState(true)
  const [openFieldSettingsId, setOpenFieldSettingsId] = useState<string | null>(null)
  const [openHeaderSettingsId, setOpenHeaderSettingsId] = useState<string | null>(null)
  const [showLearnMoreDialog, setShowLearnMoreDialog] = useState(false)
  const [showHeadersLearnMore, setShowHeadersLearnMore] = useState(false)
  const [previewActionJson, setPreviewActionJson] = useState<DeveloperAction | null>(null)
  const [previewFormModal, setPreviewFormModal] = useState<boolean>(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedHeaderIndex, setDraggedHeaderIndex] = useState<number | null>(null)
  const [draggedOptionIndex, setDraggedOptionIndex] = useState<number | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: number
    statusText: string
    success: boolean
    data: any
  } | null>(null)

  const openNewAction = () => {
    const newAct: DeveloperAction = {
      id: `act_${Date.now()}`,
      key: `action_${app.actions.length + 1}`,
      name: "Create Record",
      description: "Creates a new record in your service.",
      status: "private",
      tutorialUrl: "",
      method: "POST",
      endpointUrl: "https://api.example.com/v1/records",
      headers: [],
      inbuiltActionSteps: [],
      isMultiStep: false,
      multiStepConfig: {
        enabled: false,
        steps: [],
      },
      inputFields: [
        {
          id: `f_${Date.now()}_1`,
          key: "title",
          label: "Record Title",
          type: "string",
          required: true,
          placeholder: "e.g. New Project Task",
        },
      ],
      bodyParameters: [
        { id: `b_${Date.now()}_1`, paramName: "title", mappedFieldOrToken: "{{input.title}}" },
      ],
      sampleResponseFields: [
        { key: "id", label: "Record ID", type: "string", sampleValue: "rec_98102" },
        { key: "status", label: "Status", type: "string", sampleValue: "created" },
      ],
      enableHeaders: false,
      enableBodyParams: true,
    }
    setEditingAction(newAct)
    setDrawerTab("detail")
    setShowHeaders(false)
    setShowParameters(true)
    setOpenFieldSettingsId(null)
    setOpenHeaderSettingsId(null)
    setTestResult(null)
    setIsTesting(false)
    setIsModalOpen(true)
  }

  const openEditAction = (act: DeveloperAction) => {
    const cloned: DeveloperAction = JSON.parse(JSON.stringify(act))
    if (!cloned.inbuiltActionSteps) cloned.inbuiltActionSteps = []
    if (!cloned.multiStepConfig) cloned.multiStepConfig = { enabled: false, steps: [] }
    setEditingAction(cloned)
    setDrawerTab("detail")
    setShowHeaders(Boolean(cloned.enableHeaders))
    setShowParameters(cloned.enableBodyParams !== false)
    setOpenFieldSettingsId(null)
    setOpenHeaderSettingsId(null)
    setTestResult(null)
    setIsTesting(false)
    setIsModalOpen(true)
  }

  const handleAddInbuiltStep = () => {
    if (!editingAction) return
    const available = app.inbuiltActions || []
    if (available.length === 0) {
      setNoInbuiltActionsModal(true)
      return
    }
    const newStep = {
      id: `inb_step_${Date.now()}`,
      inbuiltActionId: available[0]?.id || "",
      purpose: "dynamic_dropdown",
      saved: true,
    }
    setEditingAction({
      ...editingAction,
      inbuiltActionSteps: [...(editingAction.inbuiltActionSteps || []), newStep],
    })
  }

  const handleUpdateInbuiltStep = (
    stepId: string,
    updates: Partial<{ inbuiltActionId: string; purpose: string; saved: boolean }>
  ) => {
    if (!editingAction) return
    setEditingAction({
      ...editingAction,
      inbuiltActionSteps: (editingAction.inbuiltActionSteps || []).map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      ),
    })
  }

  const handleDeleteInbuiltStep = (stepId: string) => {
    if (!editingAction) return
    setEditingAction({
      ...editingAction,
      inbuiltActionSteps: (editingAction.inbuiltActionSteps || []).filter((s) => s.id !== stepId),
    })
  }

  const handleAddMultiStep = () => {
    if (!editingAction) return
    const currentSteps = editingAction.multiStepConfig?.steps || []
    const firstInbuilt = (app.inbuiltActions || [])[0]
    const newStep = {
      id: `mstep_${Date.now()}_${currentSteps.length + 1}`,
      name: `Multi-Step Action ${currentSteps.length + 1}`,
      type: "inbuilt_action" as const,
      inbuiltActionId: firstInbuilt ? firstInbuilt.id : "",
      targetId: firstInbuilt ? firstInbuilt.id : "",
      considerStatusCode: false,
    }
    setEditingAction({
      ...editingAction,
      isMultiStep: true,
      multiStepConfig: {
        enabled: true,
        steps: [...currentSteps, newStep],
      },
    })
  }

  const handleUpdateMultiStep = (stepId: string, updates: any) => {
    if (!editingAction) return
    const currentSteps = editingAction.multiStepConfig?.steps || []
    setEditingAction({
      ...editingAction,
      multiStepConfig: {
        ...editingAction.multiStepConfig,
        enabled: true,
        steps: currentSteps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
      },
    })
  }

  const handleDeleteMultiStep = (stepId: string) => {
    if (!editingAction) return
    const currentSteps = editingAction.multiStepConfig?.steps || []
    setEditingAction({
      ...editingAction,
      multiStepConfig: {
        ...editingAction.multiStepConfig,
        steps: currentSteps.filter((s) => s.id !== stepId),
      },
    })
  }

  const toggleHeaders = (enabled: boolean) => {
    setShowHeaders(enabled)
    if (editingAction) {
      setEditingAction({
        ...editingAction,
        enableHeaders: enabled,
        headers: enabled && editingAction.headers.length === 0
          ? [{ id: `h_${Date.now()}`, key: "", value: "" }]
          : editingAction.headers,
      })
    }
  }

  const toggleParameters = (enabled: boolean) => {
    setShowParameters(enabled)
    if (editingAction) {
      setEditingAction({
        ...editingAction,
        enableBodyParams: enabled,
        inputFields:
          enabled && editingAction.inputFields.length === 0
            ? [
                {
                  id: `f_${Date.now()}`,
                  key: "",
                  label: "Field 1",
                  type: "string",
                  required: false,
                },
              ]
            : editingAction.inputFields,
      })
    }
  }

  const saveActionModal = () => {
    if (!editingAction) return
    const exists = app.actions.some((a) => a.id === editingAction.id)
    let updatedList: DeveloperAction[]
    if (exists) {
      updatedList = app.actions.map((a) => (a.id === editingAction.id ? editingAction : a))
    } else {
      updatedList = [...app.actions, editingAction]
    }
    onChange({
      ...app,
      actions: updatedList,
    })
    setIsModalOpen(false)
    setEditingAction(null)
  }

  const deleteAction = (id: string) => {
    onChange({
      ...app,
      actions: app.actions.filter((a) => a.id !== id),
    })
  }

  // Header Handlers
  const addHeader = () => {
    if (!editingAction) return
    const newId = `h_${Date.now()}`
    setEditingAction({
      ...editingAction,
      headers: [...editingAction.headers, { id: newId, key: "", value: "" }],
    })
  }

  const updateHeader = (id: string, field: "key" | "value" | "description", val: string) => {
    if (!editingAction) return
    setEditingAction({
      ...editingAction,
      headers: editingAction.headers.map((h) => (h.id === id ? { ...h, [field]: val } : h)),
    })
  }

  const deleteHeader = (id: string) => {
    if (!editingAction) return
    setEditingAction({
      ...editingAction,
      headers: editingAction.headers.filter((h) => h.id !== id),
    })
  }

  const duplicateHeader = (id: string) => {
    if (!editingAction) return
    const headerToDup = editingAction.headers.find((h) => h.id === id)
    if (!headerToDup) return
    const newId = `h_${Date.now()}`
    const baseKey = headerToDup.key || "header"
    const newHeader = {
      ...headerToDup,
      id: newId,
      key: `${baseKey}_copy`,
    }
    const idx = editingAction.headers.findIndex((h) => h.id === id)
    const updated = [...editingAction.headers]
    updated.splice(idx + 1, 0, newHeader)
    setEditingAction({
      ...editingAction,
      headers: updated,
    })
  }

  const handleHeaderDrop = (targetIdx: number) => {
    if (draggedHeaderIndex === null || draggedHeaderIndex === targetIdx || !editingAction) return
    const updated = [...editingAction.headers]
    const [moved] = updated.splice(draggedHeaderIndex, 1)
    updated.splice(targetIdx, 0, moved)
    setEditingAction({
      ...editingAction,
      headers: updated,
    })
    setDraggedHeaderIndex(null)
  }

  // Parameters Handlers (automatically mapped to request body)
  const addInputField = () => {
    if (!editingAction) return
    const newId = `f_${Date.now()}`
    const count = editingAction.inputFields.length + 1
    const newField: ActionInputField = {
      id: newId,
      key: "",
      label: `Field ${count}`,
      type: "string",
      required: false,
    }
    const updated = [...editingAction.inputFields, newField]
    const autoBodyParams = updated.map((f, i) => ({
      id: `b_${f.id}`,
      paramName: f.key || `field_${i + 1}`,
      mappedFieldOrToken: `{{input.${f.key || `field_${i + 1}`}}}`,
    }))
    setEditingAction({
      ...editingAction,
      inputFields: updated,
      bodyParameters: autoBodyParams,
    })
  }

  const updateInputField = (id: string, key: keyof ActionInputField, val: any) => {
    setEditingAction((prev) => {
      if (!prev) return null
      const updated = prev.inputFields.map((f) => {
        if (f.id === id) {
          const next = { ...f, [key]: val }
          // Auto-generate label from key if label matches default or is empty
          if (key === "key" && (!f.label || f.label.startsWith("Parameter") || f.label.startsWith("Field") || f.label === f.key)) {
            next.label = val ? val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, " ") : ""
          }
          return next
        }
        return f
      })
      const autoBodyParams = updated.map((f, i) => ({
        id: `b_${f.id}`,
        paramName: f.key || `field_${i + 1}`,
        mappedFieldOrToken: `{{input.${f.key || `field_${i + 1}`}}}`,
      }))
      return {
        ...prev,
        inputFields: updated,
        bodyParameters: autoBodyParams,
      }
    })
  }

  const updateInputFieldMultiple = (id: string, updates: Partial<ActionInputField>) => {
    setEditingAction((prev) => {
      if (!prev) return null
      const updated = prev.inputFields.map((f) => {
        if (f.id === id) {
          const next = { ...f, ...updates }
          if (updates.key && (!f.label || f.label.startsWith("Parameter") || f.label.startsWith("Field") || f.label === f.key)) {
            next.label = updates.key ? updates.key.charAt(0).toUpperCase() + updates.key.slice(1).replace(/_/g, " ") : ""
          }
          return next
        }
        return f
      })
      const autoBodyParams = updated.map((f, i) => ({
        id: `b_${f.id}`,
        paramName: f.key || `field_${i + 1}`,
        mappedFieldOrToken: `{{input.${f.key || `field_${i + 1}`}}}`,
      }))
      return {
        ...prev,
        inputFields: updated,
        bodyParameters: autoBodyParams,
      }
    })
  }

  const deleteInputField = (id: string) => {
    if (!editingAction) return
    const updated = editingAction.inputFields.filter((f) => f.id !== id)
    const autoBodyParams = updated.map((f, i) => ({
      id: `b_${f.id}`,
      paramName: f.key || `field_${i + 1}`,
      mappedFieldOrToken: `{{input.${f.key || `field_${i + 1}`}}}`,
    }))
    setEditingAction({
      ...editingAction,
      inputFields: updated,
      bodyParameters: autoBodyParams,
    })
  }

  const duplicateInputField = (id: string) => {
    if (!editingAction) return
    const fieldToDup = editingAction.inputFields.find((f) => f.id === id)
    if (!fieldToDup) return
    const newId = `f_${Date.now()}`
    const baseKey = fieldToDup.key || "field"
    const newField: ActionInputField = {
      ...fieldToDup,
      id: newId,
      key: `${baseKey}_copy`,
      label: fieldToDup.label ? `${fieldToDup.label} (Copy)` : "Field (Copy)",
    }
    const idx = editingAction.inputFields.findIndex((f) => f.id === id)
    const updated = [...editingAction.inputFields]
    updated.splice(idx + 1, 0, newField)
    const autoBodyParams = updated.map((f, i) => ({
      id: `b_${f.id}`,
      paramName: f.key || `field_${i + 1}`,
      mappedFieldOrToken: `{{input.${f.key || `field_${i + 1}`}}}`,
    }))
    setEditingAction({
      ...editingAction,
      inputFields: updated,
      bodyParameters: autoBodyParams,
    })
  }

  const moveInputField = (idx: number, direction: "up" | "down") => {
    if (!editingAction) return
    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= editingAction.inputFields.length) return
    const updated = [...editingAction.inputFields]
    const [moved] = updated.splice(idx, 1)
    updated.splice(targetIdx, 0, moved)
    const autoBodyParams = updated.map((f, i) => ({
      id: `b_${f.id}`,
      paramName: f.key || `field_${i + 1}`,
      mappedFieldOrToken: `{{input.${f.key || `field_${i + 1}`}}}`,
    }))
    setEditingAction({
      ...editingAction,
      inputFields: updated,
      bodyParameters: autoBodyParams,
    })
  }

  const handleDrop = (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx || !editingAction) return
    const updated = [...editingAction.inputFields]
    const [moved] = updated.splice(draggedIndex, 1)
    updated.splice(targetIdx, 0, moved)
    const autoBodyParams = updated.map((f, i) => ({
      id: `b_${f.id}`,
      paramName: f.key || `field_${i + 1}`,
      mappedFieldOrToken: `{{input.${f.key || `field_${i + 1}`}}}`,
    }))
    setEditingAction({
      ...editingAction,
      inputFields: updated,
      bodyParameters: autoBodyParams,
    })
    setDraggedIndex(null)
  }

  // Sample Response Fields Handlers
  const addSampleResponseField = () => {
    if (!editingAction) return
    setEditingAction({
      ...editingAction,
      sampleResponseFields: [
        ...editingAction.sampleResponseFields,
        { key: `res_${editingAction.sampleResponseFields.length + 1}`, label: "Response Key", type: "string", sampleValue: "value" },
      ],
    })
  }

  const updateSampleResponseField = (idx: number, key: string, val: string) => {
    if (!editingAction) return
    const updated = [...editingAction.sampleResponseFields]
    updated[idx] = { ...updated[idx], [key]: val }
    setEditingAction({ ...editingAction, sampleResponseFields: updated })
  }

  const deleteSampleResponseField = (idx: number) => {
    if (!editingAction) return
    setEditingAction({
      ...editingAction,
      sampleResponseFields: editingAction.sampleResponseFields.filter((_, i) => i !== idx),
    })
  }

  // Send Test Request Handler (tests endpoint and auto-generates output fields)
  const handleSendTestRequest = async () => {
    if (!editingAction) return
    setIsTesting(true)
    setTestResult(null)

    // Build payload from configured parameters
    const payload: Record<string, any> = {}
    editingAction.inputFields.forEach((field) => {
      payload[field.key] = field.type === "number" ? 100 : field.type === "boolean" ? true : `sample_${field.key}`
    })

    // Prepare headers
    const headersObj: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    if (editingAction.enableHeaders) {
      editingAction.headers.forEach((h) => {
        if (h.key) headersObj[h.key] = h.value
      })
    }

    try {
      const isDummy = editingAction.endpointUrl.includes("example.com") || !editingAction.endpointUrl.startsWith("http")
      let resData: any = null
      let statusCode = 200
      let statusText = "OK"

      if (!isDummy) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 4000)
          const resp = await fetch(editingAction.endpointUrl, {
            method: editingAction.method || "POST",
            headers: headersObj,
            body: ["GET", "HEAD"].includes(editingAction.method) ? undefined : JSON.stringify(payload),
            signal: controller.signal,
          })
          clearTimeout(timeoutId)
          statusCode = resp.status
          statusText = resp.statusText || "OK"
          resData = await resp.json().catch(() => ({ message: "Success", status: "completed" }))
        } catch {
          // Simulated response fallback if network/CORS restrictions apply in browser
          statusCode = 200
          statusText = "OK (Simulated Test)"
          resData = {
            id: `rec_${Date.now().toString().slice(-6)}`,
            status: "success",
            ...payload,
            created_at: new Date().toISOString(),
          }
        }
      } else {
        // Realistic simulated response for dummy endpoints e.g. api.example.com
        await new Promise((r) => setTimeout(r, 600))
        statusCode = 200
        statusText = "OK"
        resData = {
          id: `rec_${Date.now().toString().slice(-6)}`,
          status: "success",
          ...payload,
          created_at: new Date().toISOString(),
        }
      }

      setTestResult({
        status: statusCode,
        statusText,
        success: statusCode >= 200 && statusCode < 300,
        data: resData,
      })

      // Automatically extract output fields from JSON response keys
      if (resData && typeof resData === "object" && !Array.isArray(resData)) {
        const extractedFields = Object.keys(resData).map((k) => {
          const val = resData[k]
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

        setEditingAction((prev) =>
          prev
            ? {
                ...prev,
                sampleResponseFields: extractedFields,
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

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Configured Actions ({app.actions.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Actions execute operations (create, update, fetch) in your app using 100% field-based parameter mappings.
          </p>
        </div>

        <Button
          type="button"
          onClick={openNewAction}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Action</span>
        </Button>
      </div>

      {/* Actions List */}
      {app.actions.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No actions configured yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Build outbound operations like "Create Contact", "Send Message", or "Update Status" with visual parameter rows.
          </p>
          <Button
            type="button"
            onClick={openNewAction}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Action</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {app.actions.map((action) => (
            <Card
              key={action.id}
              className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs rounded-xl"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={action.method === "POST" ? "success" : action.method === "GET" ? "blue" : "warning"}
                      className="text-[10px] font-mono font-medium uppercase shrink-0"
                    >
                      {action.method}
                    </Badge>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{action.name}</h4>
                        <span className="font-mono text-[11px] text-slate-400">key: {action.key}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{action.description}</p>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded inline-block border border-slate-100 dark:border-slate-800">
                        {action.endpointUrl}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          <strong>{action.inputFields.length}</strong> user input fields
                        </span>
                        <span>
                          • <strong>{action.bodyParameters.length}</strong> body parameter mappings
                        </span>
                        <span>
                          • <strong>{action.headers.length}</strong> headers
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      onClick={() => setPreviewActionJson(action)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      title="Preview Action Output & JSON Schema"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => openEditAction(action)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      title="Configure Action"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => deleteAction(action.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      title="Delete Action"
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

      {/* Action Builder Drawer using built-in Drawer component */}
      {isModalOpen && editingAction && (
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
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Action Configuration
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowLearnMoreDialog(true)}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Learn more about Action Configuration"
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

              {/* 4 Navigation Tabs */}
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
                  Action Detail
                </button>
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
                  {editingAction.inbuiltActionSteps && editingAction.inbuiltActionSteps.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                      {editingAction.inbuiltActionSteps.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("api")}
                  className={cn(
                    "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer",
                    drawerTab === "api"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  Action Event API Configuration
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
                  {editingAction.isMultiStep && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                      Active
                    </span>
                  )}
                </button>
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
                {drawerTab === "inbuilt" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDrawerTab("detail")}
                    className="text-xs gap-1.5 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back: Action Detail</span>
                  </Button>
                )}
                {drawerTab === "api" && (
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
                {drawerTab === "multistep" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDrawerTab("api")}
                    className="text-xs gap-1.5 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back: Action Event API Configuration</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                    onClick={() => setDrawerTab("api")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <span>Next: Action Event API Configuration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
                {drawerTab === "api" && (
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
                    onClick={saveActionModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Action</span>
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5 pr-1">
            {/* Tab 1: Action Detail */}
            {drawerTab === "detail" && (
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Action Event Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editingAction.name}
                    onChange={(e) =>
                      setEditingAction({
                        ...editingAction,
                        name: e.target.value,
                        key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                      })
                    }
                    placeholder="e.g. Create Contact"
                    className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter a unique and descriptive action event name.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Action Key
                  </label>
                  <Input
                    value={editingAction.key}
                    onChange={(e) => setEditingAction({ ...editingAction, key: e.target.value })}
                    placeholder="e.g. create_contact"
                    className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Machine identifier used in expressions and automation execution.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Action Event Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editingAction.description}
                    onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                    rows={4}
                    placeholder="Write a short description of the action event..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter a brief description of your action event here e.g. Triggers when a new contact is created.
                  </p>
                </div>




              </div>
            )}

            {/* Tab 2: Setup Inbuilt Actions */}
            {drawerTab === "inbuilt" && (
              <div className="space-y-5 pt-1">
                {/* Yellow Notice Banner */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    After creating the inbuilt action, make sure to add it to the main action where you want its dynamic dropdown options or custom fields to appear.{" "}
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
                  Add other inbuilt actions to execute as nested steps or dynamic option providers within this action.
                </p>

                {/* Steps List */}
                <div className="space-y-4">
                  {(!editingAction.inbuiltActionSteps || editingAction.inbuiltActionSteps.length === 0) ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No Inbuilt Actions Attached Yet
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Attach an In-built Action to populate dynamic dropdowns or resolve cascading field choices for this action event.
                      </p>
                    </div>
                  ) : (
                    editingAction.inbuiltActionSteps.map((step, idx) => (
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

            {/* Tab 3: Action Event API Configuration (100% Preserved in its Own Place) */}
            {drawerTab === "api" && (
              <div className="space-y-5">
                {/* HTTP Method & Endpoint URL */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HTTP Method
                  </label>
                  <Select
                    value={editingAction.method}
                    onChange={(e) => setEditingAction({ ...editingAction, method: e.target.value as any })}
                    options={[
                      { value: "POST", label: "POST" },
                      { value: "GET", label: "GET" },
                      { value: "PUT", label: "PUT" },
                      { value: "PATCH", label: "PATCH" },
                      { value: "DELETE", label: "DELETE" },
                    ]}
                    className="h-10 text-sm font-medium"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Endpoint URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editingAction.endpointUrl}
                    onChange={(e) => setEditingAction({ ...editingAction, endpointUrl: e.target.value })}
                    placeholder="https://api.acme.com/v1/contacts"
                    className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

            {/* HTTP Headers (Exact Reference UI) */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showHeaders}
                  onChange={(e) => toggleHeaders(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    HTTP Headers
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable this option to define custom HTTP headers that will be sent with API requests.{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowHeadersLearnMore(true)
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              </label>

              {showHeaders && (
                <div className="space-y-2.5 pt-1">
                  {editingAction.headers.map((hdr, idx) => (
                    <div
                      key={hdr.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleHeaderDrop(idx)}
                      className={cn(
                        "flex items-center gap-3 group transition-opacity",
                        draggedHeaderIndex === idx && "opacity-50"
                      )}
                    >
                      {/* Header Key Input with gear icon inside on the right */}
                      <div className="relative flex-1">
                        <Input
                          value={hdr.key}
                          onChange={(e) => updateHeader(hdr.id, "key", e.target.value)}
                          placeholder={`Enter header key e.g. ${idx === 0 ? "authorization" : `header_${idx + 1}`}`}
                          className="h-10 pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() => setOpenHeaderSettingsId(hdr.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                          title="Configure header settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right-side Action Icons */}
                      <div className="flex items-center gap-2.5 text-slate-400 shrink-0">
                        <div
                          draggable
                          onDragStart={() => setDraggedHeaderIndex(idx)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 select-none"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => duplicateHeader(hdr.id)}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 cursor-pointer"
                          title="Duplicate header"
                        >
                          <CopyPlus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHeader(hdr.id)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                          title="Delete header"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Header Button */}
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHeader}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/40 h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Add Header</span>
                    </Button>
                  </div>

                  {/* Dotted border separator matching reference UI */}
                  <div className="border-b border-dotted border-slate-200 dark:border-slate-800 pt-3" />
                </div>
              )}
            </div>

            {/* Set Body/Query/Path Parameters (Exact Reference UI) */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showParameters}
                  onChange={(e) => toggleParameters(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Set Body/Query/Path Parameters
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable this option to define custom parameters that will be passed in API requests.{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowLearnMoreDialog(true)
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              </label>

              {showParameters && (
                <div className="space-y-2.5 pt-1">
                  {editingAction.inputFields.map((field, idx) => (
                    <div
                      key={field.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(idx)}
                      className={cn(
                        "flex items-center gap-3 group transition-opacity",
                        draggedIndex === idx && "opacity-50"
                      )}
                    >
                      {/* Parameter Key Input with gear icon inside on the right */}
                      <div className="relative flex-1">
                        <Input
                          value={field.key}
                          onChange={(e) => updateInputField(field.id, "key", e.target.value)}
                          placeholder={`Enter parameter key e.g. field_${idx + 1}`}
                          className="h-10 pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() => setOpenFieldSettingsId(field.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                          title="Configure parameter settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right-side Action Icons */}
                      <div className="flex items-center gap-2.5 text-slate-400 shrink-0">
                        <div
                          draggable
                          onDragStart={() => setDraggedIndex(idx)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 select-none"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => duplicateInputField(field.id)}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 cursor-pointer"
                          title="Duplicate parameter"
                        >
                          <CopyPlus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInputField(field.id)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                          title="Delete parameter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Parameter & Preview Form Buttons */}
                  <div className="pt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addInputField}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/40 h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Add Parameter</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewFormModal(true)}
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                      title="Preview Rendered Form"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview Form</span>
                    </Button>
                  </div>

                  {/* Dotted border separator matching reference UI */}
                  <div className="border-b border-dotted border-slate-200 dark:border-slate-800 pt-3" />
                </div>
              )}
            </div>

            {/* Sample Response Fields */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Sample Action Output Fields (Zero JSON)
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Outputs returned by this action available as variables for subsequent steps.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleSendTestRequest}
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
                </div>
              </div>

              {/* Test Response Result Banner (if tested) */}
              {testResult && (
                <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${testResult.success ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Test Response ({testResult.status} {testResult.statusText})
                      </span>
                      <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        {editingAction.sampleResponseFields.length} output fields auto-detected
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestResult(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
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
                    {editingAction.sampleResponseFields.map((field, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-2">
                          <Input
                            value={field.key}
                            onChange={(e) => updateSampleResponseField(idx, "key", e.target.value)}
                            className="h-8 text-sm font-medium text-slate-900 dark:text-slate-100"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={field.label}
                            onChange={(e) => updateSampleResponseField(idx, "label", e.target.value)}
                            className="h-8 text-sm font-medium text-slate-900 dark:text-slate-100"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={field.sampleValue}
                            onChange={(e) => updateSampleResponseField(idx, "sampleValue", e.target.value)}
                            className="h-8 text-sm font-medium text-slate-900 dark:text-slate-100"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <Button
                            type="button"
                            onClick={() => deleteSampleResponseField(idx)}
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
            </div>


          </div>
        )}

        {/* Tab 4: Setup Multi-Step Action */}
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
              {(!editingAction.multiStepConfig?.steps || editingAction.multiStepConfig.steps.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No Multi-Step Actions Attached Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Add a multi-step inbuilt action step to chain with this action event.
                  </p>
                </div>
              ) : (
                editingAction.multiStepConfig.steps.map((step, idx) => (
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
                        id={`status_code_check_action_${step.id}`}
                        checked={Boolean(step.considerStatusCode)}
                        onChange={(e) =>
                          handleUpdateMultiStep(step.id, {
                            considerStatusCode: e.target.checked,
                          })
                        }
                        className="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`status_code_check_action_${step.id}`}
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

      {/* Parameter Settings Drawer (Built-in Drawer Component) */}
      {editingAction && openFieldSettingsId && (() => {
        const activeField = editingAction.inputFields.find((f) => f.id === openFieldSettingsId)
        if (!activeField) return null

        return (
          <Drawer
            open={Boolean(openFieldSettingsId)}
            onOpenChange={(open) => !open && setOpenFieldSettingsId(null)}
            side="right"
            zIndex={60}
            className="w-[780px] max-w-[94vw]"
            title={`Parameter Settings for ${activeField.key || "Parameter"}`}
            description="Configure display label, data type, and validation rules for this parameter."
            footer={
              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenFieldSettingsId(null)}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenFieldSettingsId(null)}
                  className="h-9 px-5 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Parameter Identification Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                    Parameter Key
                  </span>
                  <code className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {activeField.key || "unnamed_field"}
                  </code>
                </div>
                <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-mono">
                  &#123;&#123;input.{activeField.key || "key"}&#125;&#125;
                </Badge>
              </div>

              {/* Display Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Display Label</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={activeField.label}
                  onChange={(e) => updateInputField(activeField.id, "label", e.target.value)}
                  placeholder="e.g. User ID / Distinct ID"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Label displayed to users when setting up this action in workflow steps.
                </p>
              </div>

              {/* Dynamic & Static Dropdown Configuration */}
              {(() => {
                const isDynamic = activeField.type === "dropdown" && activeField.dropdownConfig?.mode === "dynamic"
                const isStatic = activeField.type === "dropdown" && activeField.dropdownConfig?.mode !== "dynamic"

                const dynamicLabelOptions = (() => {
                  const fields = new Set<string>()
                  ;(app.inbuiltActions || []).forEach((inb) => {
                    if (inb.labelKey) fields.add(inb.labelKey)
                    ;(inb.parameters || []).forEach((p) => {
                      if (p.key) fields.add(p.key)
                    })
                  })
                  ;["name", "title", "label", "display_name", "email", "status"].forEach((f) => fields.add(f))
                  if (activeField.dropdownConfig?.dynamicConfig?.labelKey) {
                    fields.add(activeField.dropdownConfig.dynamicConfig.labelKey)
                  }
                  return Array.from(fields).map((f) => ({ value: f, label: f }))
                })()

                const dynamicValueOptions = (() => {
                  const fields = new Set<string>()
                  ;(app.inbuiltActions || []).forEach((inb) => {
                    if (inb.valueKey) fields.add(inb.valueKey)
                    ;(inb.parameters || []).forEach((p) => {
                      if (p.key) fields.add(p.key)
                    })
                  })
                  ;["id", "value", "key", "slug", "uuid", "code"].forEach((f) => fields.add(f))
                  if (activeField.dropdownConfig?.dynamicConfig?.valueKey) {
                    fields.add(activeField.dropdownConfig.dynamicConfig.valueKey)
                  }
                  return Array.from(fields).map((f) => ({ value: f, label: f }))
                })()

                return (
                  <div className="space-y-4 pt-1">
                    {/* Dynamic Dropdown (Optional) Section */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isDynamic}
                            onClick={() => {
                              if (isDynamic) {
                                updateInputFieldMultiple(activeField.id, {
                                  type: "string",
                                  dropdownConfig: undefined,
                                })
                              } else {
                                const linkedInb =
                                  (app.inbuiltActions || []).find(
                                    (a) => a.id === activeField.dropdownConfig?.dynamicConfig?.inbuiltActionId
                                  ) || (app.inbuiltActions || [])[0]

                                updateInputFieldMultiple(activeField.id, {
                                  type: "dropdown",
                                  dropdownConfig: {
                                    mode: "dynamic",
                                    dynamicConfig: {
                                      inbuiltActionId: linkedInb?.id || "",
                                      endpointUrl: linkedInb?.endpointUrl || "",
                                      labelKey: activeField.dropdownConfig?.dynamicConfig?.labelKey || linkedInb?.labelKey || "name",
                                      valueKey: activeField.dropdownConfig?.dynamicConfig?.valueKey || linkedInb?.valueKey || "id",
                                      parentDependencyKey: linkedInb?.parentDependencyKey || "",
                                    },
                                  },
                                })
                              }
                            }}
                            className="flex items-center gap-2.5 cursor-pointer select-none group text-left"
                          >
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                isDynamic
                                  ? "border-blue-600 bg-white dark:bg-slate-900"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400"
                              )}
                            >
                              {isDynamic && (
                                <div className="h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                              Dynamic Dropdown (Optional)
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 ml-6.5 mt-0.5">
                          Dynamic Dropdown shows a list of options generated through an inbuilt action event.{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowLearnMoreDialog(true)
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline"
                          >
                            Learn more
                          </button>
                        </p>
                      </div>

                      {/* When Dynamic Dropdown is active (Screenshot 2) */}
                      {isDynamic && (
                        <div className="ml-6.5 space-y-3.5 pt-1">
                          {/* Amber alert banner matching Screenshot 2 */}
                          <div className="p-3.5 rounded-lg bg-[#FEF7E0] dark:bg-amber-950/40 border border-[#FDE68A]/60 dark:border-amber-800/50 text-xs text-[#7A4B04] dark:text-amber-300 font-normal leading-relaxed">
                            To show the dynamic dropdown, make sure you have created the inbuilt action and added it to this action.{" "}
                            <button
                              type="button"
                              onClick={() => setShowLearnMoreDialog(true)}
                              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline font-normal"
                            >
                              Learn more
                            </button>
                          </div>

                          {/* Option Label & Option Value Selects */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                                Option Label
                              </label>
                              <Select
                                value={activeField.dropdownConfig?.dynamicConfig?.labelKey || ""}
                                onChange={(e) => {
                                  const currentConfig = activeField.dropdownConfig || { mode: "dynamic" }
                                  updateInputField(activeField.id, "dropdownConfig", {
                                    ...currentConfig,
                                    mode: "dynamic",
                                    dynamicConfig: {
                                      ...currentConfig.dynamicConfig,
                                      labelKey: e.target.value,
                                    },
                                  })
                                }}
                                placeholder="Select label field"
                                options={dynamicLabelOptions}
                                className="h-10 text-sm font-normal rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                                Option Value
                              </label>
                              <Select
                                value={activeField.dropdownConfig?.dynamicConfig?.valueKey || ""}
                                onChange={(e) => {
                                  const currentConfig = activeField.dropdownConfig || { mode: "dynamic" }
                                  updateInputField(activeField.id, "dropdownConfig", {
                                    ...currentConfig,
                                    mode: "dynamic",
                                    dynamicConfig: {
                                      ...currentConfig.dynamicConfig,
                                      valueKey: e.target.value,
                                    },
                                  })
                                }}
                                placeholder="Select value field"
                                options={dynamicValueOptions}
                                className="h-10 text-sm font-normal rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Select response fields from configured inbuilt actions.
                          </p>

                          {/* Dotted border separator */}
                          <div className="border-b border-dashed border-slate-200 dark:border-slate-800 pt-2" />
                        </div>
                      )}
                    </div>

                    {/* Static Dropdown (Optional) Section */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isStatic}
                            onClick={() => {
                              if (isStatic) {
                                updateInputFieldMultiple(activeField.id, {
                                  type: "string",
                                  dropdownConfig: undefined,
                                })
                              } else {
                                updateInputFieldMultiple(activeField.id, {
                                  type: "dropdown",
                                  dropdownConfig: {
                                    mode: "static",
                                    staticOptions:
                                      (activeField.dropdownConfig?.staticOptions && activeField.dropdownConfig.staticOptions.length > 0)
                                        ? activeField.dropdownConfig.staticOptions
                                        : [{ label: "", value: "" }],
                                  },
                                })
                              }
                            }}
                            className="flex items-center gap-2.5 cursor-pointer select-none group text-left"
                          >
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                isStatic
                                  ? "border-blue-600 bg-white dark:bg-slate-900"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400"
                              )}
                            >
                              {isStatic && (
                                <div className="h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                              Static Dropdown (Optional)
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 ml-6.5 mt-0.5">
                          Static Dropdown shows a list of pre-configured options.{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowLearnMoreDialog(true)
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline"
                          >
                            Learn more
                          </button>
                        </p>
                      </div>

                      {/* When Static Dropdown is active (Screenshot 1) */}
                      {isStatic && (
                        <div className="ml-6.5 space-y-2.5 pt-1">
                          {/* Column Headers */}
                          <div className="grid grid-cols-2 gap-4 pr-16">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Option Label
                            </label>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Option Value
                            </label>
                          </div>

                          {/* Options Rows */}
                          <div className="space-y-2">
                            {(activeField.dropdownConfig?.staticOptions || [{ label: "", value: "" }]).map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                draggable
                                onDragStart={() => setDraggedOptionIndex(optIdx)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (draggedOptionIndex === null || draggedOptionIndex === optIdx) return
                                  const currentOptions = [...(activeField.dropdownConfig?.staticOptions || [])]
                                  const [moved] = currentOptions.splice(draggedOptionIndex, 1)
                                  currentOptions.splice(optIdx, 0, moved)
                                  updateInputField(activeField.id, "dropdownConfig", {
                                    ...activeField.dropdownConfig,
                                    mode: "static",
                                    staticOptions: currentOptions,
                                  })
                                  setDraggedOptionIndex(null)
                                }}
                                className={cn(
                                  "flex items-center gap-3 group transition-opacity",
                                  draggedOptionIndex === optIdx && "opacity-40"
                                )}
                              >
                                <Input
                                  value={opt.label}
                                  onChange={(e) => {
                                    const currentOptions = [...(activeField.dropdownConfig?.staticOptions || [])]
                                    currentOptions[optIdx] = { ...currentOptions[optIdx], label: e.target.value }
                                    updateInputField(activeField.id, "dropdownConfig", {
                                      ...activeField.dropdownConfig,
                                      mode: "static",
                                      staticOptions: currentOptions,
                                    })
                                  }}
                                  placeholder=""
                                  className="h-10 text-sm font-normal rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex-1"
                                />
                                <Input
                                  value={opt.value}
                                  onChange={(e) => {
                                    const currentOptions = [...(activeField.dropdownConfig?.staticOptions || [])]
                                    currentOptions[optIdx] = { ...currentOptions[optIdx], value: e.target.value }
                                    updateInputField(activeField.id, "dropdownConfig", {
                                      ...activeField.dropdownConfig,
                                      mode: "static",
                                      staticOptions: currentOptions,
                                    })
                                  }}
                                  placeholder=""
                                  className="h-10 text-sm font-normal rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex-1"
                                />
                                <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-1 hover:text-slate-600 dark:hover:text-slate-200"
                                    title="Drag to reorder"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOptions = [...(activeField.dropdownConfig?.staticOptions || [])]
                                      currentOptions.splice(optIdx, 1)
                                      updateInputField(activeField.id, "dropdownConfig", {
                                        ...activeField.dropdownConfig,
                                        mode: "static",
                                        staticOptions: currentOptions.length > 0 ? currentOptions : [{ label: "", value: "" }],
                                      })
                                    }}
                                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                                    title="Delete option"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Option Button (matches Screenshot 1) */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentOptions = [...(activeField.dropdownConfig?.staticOptions || [])]
                                currentOptions.push({ label: "", value: "" })
                                updateInputField(activeField.id, "dropdownConfig", {
                                  ...activeField.dropdownConfig,
                                  mode: "static",
                                  staticOptions: currentOptions,
                                })
                              }}
                              className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold text-xs h-9 px-3.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4 fill-blue-600 text-white dark:fill-blue-500" />
                              <span>Add Option</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Placeholder */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Placeholder Text
                </label>
                <Input
                  value={activeField.placeholder || ""}
                  onChange={(e) => updateInputField(activeField.id, "placeholder", e.target.value)}
                  placeholder="e.g. usr_12345"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hint text shown inside the input box when empty.
                </p>
              </div>

              {/* Help Instruction / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Help Instruction / Description
                </label>
                <Input
                  value={activeField.helpText || ""}
                  onChange={(e) => updateInputField(activeField.id, "helpText", e.target.value)}
                  placeholder="e.g. Enter a valid customer ID"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Helpful description or instruction shown beneath the field in the workflow.
                </p>
              </div>

              {/* Required Field Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                    Required Field
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Must be provided when running or testing this action
                  </span>
                </div>
                <Switch
                  checked={activeField.required}
                  onCheckedChange={(checked) =>
                    updateInputField(activeField.id, "required", checked)
                  }
                />
              </div>
            </div>
          </Drawer>
        )
      })()}

      {/* Learn More Dialog (Parameters Guide) */}
      <Dialog open={showLearnMoreDialog} onOpenChange={setShowLearnMoreDialog}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            How to Use: Action Parameters & Mappings
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to mapping user input fields to REST API request payloads.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
            <strong className="font-semibold">What this does:</strong> Transforms inputs entered by workflow users into the exact JSON format or query string required by your API.
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
              How Developer Sets It Up:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong className="font-semibold">Step 1 (User Inputs):</strong> Create fields users fill out (e.g. Customer Email, Message Body, Status).
              </li>
              <li>
                <strong className="font-semibold">Step 2 (API Body Parameters):</strong> Map those inputs to the JSON request payload using tags like <code>&#123;&#123;input.customer_email&#125;&#125;</code>.
              </li>
              <li>
                <strong className="font-semibold">Step 3 (Field Settings ⚙):</strong> Configure dropdown option sources, placeholder hints, and required validation.
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              In the workflow editor canvas, users see clean, intuitive form fields. When the step runs, the platform renders the JSON payload automatically and dispatches the API request.
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
      {/* Header Settings Drawer (Built-in Drawer Component) */}
      {editingAction && openHeaderSettingsId && (() => {
        const activeHeader = editingAction.headers.find((h) => h.id === openHeaderSettingsId)
        if (!activeHeader) return null

        return (
          <Drawer
            open={Boolean(openHeaderSettingsId)}
            onOpenChange={(open) => !open && setOpenHeaderSettingsId(null)}
            side="right"
            zIndex={60}
            className="w-[780px] max-w-[94vw]"
            title={`Header Settings for ${activeHeader.key || "Header"}`}
            description="Configure header key name, value mapping, and instructions."
            footer={
              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenHeaderSettingsId(null)}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenHeaderSettingsId(null)}
                  className="h-9 px-5 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Header Identification Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                    HTTP Header
                  </span>
                  <code className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {activeHeader.key || "unnamed_header"}
                  </code>
                </div>
                <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-mono">
                  Header Mapping
                </Badge>
              </div>

              {/* Header Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>Header Name / Key</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={activeHeader.key}
                  onChange={(e) => updateHeader(activeHeader.id, "key", e.target.value)}
                  placeholder="e.g. Authorization, X-API-Key, Content-Type"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Standard or custom HTTP header name passed with requests.
                </p>
              </div>

              {/* Header Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>Header Value</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={activeHeader.value}
                  onChange={(e) => updateHeader(activeHeader.id, "value", e.target.value)}
                  placeholder="e.g. application/json"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Default or static value sent with this header in API requests.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Description / Documentation
                </label>
                <Input
                  value={activeHeader.description || ""}
                  onChange={(e) => updateHeader(activeHeader.id, "description", e.target.value)}
                  placeholder="e.g. Custom API secret header required for v2 endpoints"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Optional note explaining what this header is used for.
                </p>
              </div>
            </div>
          </Drawer>
        )
      })()}

      {/* HTTP Headers Learn More Dialog */}
      <Dialog open={showHeadersLearnMore} onOpenChange={setShowHeadersLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            How to Use: HTTP Request Headers
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to defining headers for authentication, content negotiation, and API versions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
            <strong className="font-semibold">What this does:</strong> Injects necessary HTTP headers (like <code>Content-Type</code> or <code>X-Version</code>) into every outbound request.
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
              How Developer Sets It Up:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong className="font-semibold">Header Key:</strong> Enter standard names (e.g. <code>Content-Type</code>, <code>Accept</code>, <code>Idempotency-Key</code>).
              </li>
              <li>
                <strong className="font-semibold">Header Value:</strong> Enter static values (e.g. <code>application/json</code>) or dynamic connection variables (e.g. <code>Bearer &#123;&#123;connection.apiKey&#125;&#125;</code>).
              </li>
              <li>
                <strong className="font-semibold">Header Settings (⚙):</strong> Add documentation notes for team collaboration.
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Headers operate completely in the background without cluttering the end-user workflow canvas, ensuring consistent API execution.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowHeadersLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>

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

      {/* Action JSON Schema & Definition Modal */}
      <Dialog
        open={Boolean(previewActionJson)}
        onOpenChange={(open) => {
          if (!open) setPreviewActionJson(null)
        }}
        className="max-w-2xl"
      >
        {previewActionJson && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                <span>Action Event Schema & Technical Definition</span>
              </DialogTitle>
              <DialogDescription>
                Raw technical JSON definition for <code className="font-mono font-semibold text-slate-900 dark:text-slate-100">{previewActionJson.name}</code> ({previewActionJson.key}).
              </DialogDescription>
            </DialogHeader>

            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(previewActionJson, null, 2)}</pre>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(previewActionJson, null, 2))
                }}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy JSON
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setPreviewActionJson(null)}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>

      {/* Action Live Form Simulation Preview Modal */}
      <Dialog
        open={previewFormModal}
        onOpenChange={setPreviewFormModal}
        className="max-w-lg"
      >
        {editingAction && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Simulated User Input Form</span>
              </DialogTitle>
              <DialogDescription>
                Live preview of how end-users will experience configuring this action in the Workflow Builder.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 max-h-[60vh] overflow-y-auto">
              {editingAction.inputFields && editingAction.inputFields.length > 0 ? (
                editingAction.inputFields.map((field) => (
                  <div key={field.id} className="space-y-1.5 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <label className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>{field.label || field.key}</span>
                        {field.required && <span className="text-red-500">*</span>}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono capitalize">
                        {field.type}
                      </Badge>
                    </label>

                    {field.type === "dropdown" ? (
                      <select className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-2.5 text-slate-700 dark:text-slate-200">
                        <option value="">{field.placeholder || "Select an option..."}</option>
                        {(field.dropdownConfig?.staticOptions || []).map((opt, optIdx) => (
                          <option key={optIdx} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500">{field.helpText || "Toggle to enable/disable"}</span>
                        <Switch checked={false} onCheckedChange={() => {}} />
                      </div>
                    ) : (
                      <Input
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder || `Enter ${field.label || field.key}...`}
                        className="h-9 text-xs"
                      />
                    )}

                    {field.helpText && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No input parameters defined yet. Click &quot;+ Add Parameter&quot; to create fields.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                size="sm"
                onClick={() => setPreviewFormModal(false)}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Close Preview
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  )
}
