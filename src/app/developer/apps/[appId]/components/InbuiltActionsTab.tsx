"use client"

import React, { useState, useMemo } from "react"
import {
  DeveloperApp,
  DeveloperInbuiltAction,
  InbuiltActionType,
  MultiStepExecutionTiming,
} from "@/lib/developer-types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Drawer } from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Copy,
  CopyPlus,
  Eye,
  Check,
  ChevronDown,
  Layers,
  Send,
  RefreshCw,
  X,
  ShieldCheck,
  Zap,
  Info,
  Key,
  Link2,
  ArrowRight,
  ArrowLeft,
  Database,
  LayoutGrid,
  Code,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  ExternalLink,
  GripVertical,
  Settings,
  PlusCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InbuiltActionsTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

type InbuiltDrawerTab = "detail" | "setup" | "api"

const INBUILT_ACTION_TYPES: { value: InbuiltActionType; label: string }[] = [
  { value: "dropdown_and_custom_fields", label: "Dropdown & Custom Fields (Default)" },
  { value: "multi_step", label: "Multi-Step" },
  { value: "app_auth_validator", label: "App Auth Validator" },
  { value: "webhook_validator", label: "Webhook Validator" },
  { value: "delete_webhook", label: "Delete Webhook" },
  { value: "delete_connection", label: "Delete Connection" },
]

interface InbuiltActionLearningInfo {
  bannerText: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  bullets: { label: string; text: string }[]
  tip?: string
}

const INBUILT_ACTION_LEARNING_CONTENT: Record<InbuiltActionType, InbuiltActionLearningInfo> = {
  dropdown_and_custom_fields: {
    bannerText:
      "After creating the inbuilt action, make sure to add it to the main action where you want its dynamic dropdown options or custom fields to appear.",
    title: "Dropdown & Custom Fields In-Built Actions",
    icon: LayoutGrid,
    description:
      "Populate dynamic dropdowns and custom field schemas across workflow triggers and actions without consuming task credits.",
    bullets: [
      {
        label: "Dynamic Dropdowns",
        text: "Fetches live resource lists from your API (such as Folders, Channels, Projects, or Roles) and feeds them into workflow input fields.",
      },
      {
        label: "Custom Fields",
        text: "Dynamically returns forms or fields specific to a user's account or tenant (e.g. custom CRM attributes or Jira issue types).",
      },
      {
        label: "Zero Task Consumption",
        text: "In-built actions execute internally during workflow configuration and dropdown opening; they consume 0 user workflow task credits.",
      },
    ],
    tip: "Go to Actions tab -> open your Action -> click an input field -> select 'Dropdown' & 'Dynamic' -> choose this In-built Action.",
  },
  multi_step: {
    bannerText:
      "After creating the inbuilt action, make sure to add it to the main action where you want its value to appear.",
    title: "Multi-Step Inbuilt Actions & Execution Timings",
    icon: Sparkles,
    description:
      "Chain multiple micro-API requests together sequentially to prepare tokens, configure webhooks, or hydrate incoming data payloads.",
    bullets: [
      {
        label: "Each Execution (Default)",
        text: "Runs every time the parent action/trigger executes (e.g. fetching short-lived session tokens, cascading multi-level lookups, pre-uploads).",
      },
      {
        label: "Post Webhook Setup",
        text: "Runs only once immediately after registering a webhook with the external service (e.g. subscribing to topics or handshake challenges).",
      },
      {
        label: "Post Webhook Trigger Event",
        text: "Runs when an incoming webhook arrives for Payload Enrichment / Hydration (e.g. fetching full order details when webhook only sends { id: 123 }).",
      },
    ],
    tip: "Attach this multi-step inside your Action or Trigger to make its step outputs available as mapping variables.",
  },
  app_auth_validator: {
    bannerText:
      "This inbuilt action validates user credentials when connecting an account. It executes automatically during connection testing and token refreshes.",
    title: "App Auth Validator Architecture",
    icon: ShieldCheck,
    description:
      "Ensures user credentials (API Key, Basic Auth, OAuth tokens) are valid before saving a connection.",
    bullets: [
      {
        label: "Connection Testing",
        text: "Called when the user clicks 'Save & Test Connection' to verify credentials against an endpoint like GET /v1/me or GET /v1/user.",
      },
      {
        label: "Automated Token Refresh",
        text: "Can test renewed OAuth tokens to confirm the connection remains active and healthy.",
      },
      {
        label: "Zero-Task Handshake",
        text: "Runs securely in the background without affecting user quota or workflow execution counters.",
      },
    ],
    tip: "Set endpoint URL to a fast, lightweight authentication test route that returns HTTP 200 on valid credentials.",
  },
  webhook_validator: {
    bannerText:
      "This inbuilt action validates incoming webhook subscription handshakes and challenges. Make sure to link it to your webhook trigger.",
    title: "Webhook Validator Architecture",
    icon: Zap,
    description:
      "Handles verification challenges and signature handshakes required by external webhook providers.",
    bullets: [
      {
        label: "Challenge Handshakes",
        text: "Responds to echo challenges required by platforms like WhatsApp Cloud API (hub.challenge), Slack (url_verification), or Zoom.",
      },
      {
        label: "HMAC Signature Verification",
        text: "Verifies cryptographic HMAC signatures (e.g. Shopify, GitHub, Stripe) to reject spoofed requests.",
      },
      {
        label: "Instant Verification",
        text: "Runs automatically on the initial setup verification request so the trigger activates seamlessly.",
      },
    ],
    tip: "Link this validator inside your Webhook Trigger's Verification settings.",
  },
  delete_webhook: {
    bannerText:
      "This inbuilt action automatically executes when a workflow or trigger is deactivated or deleted to remove the webhook subscription from the external service.",
    title: "Delete Webhook Lifecycle Action",
    icon: Trash2,
    description:
      "Cleans up webhook subscriptions when an automation is deleted or deactivated to prevent orphaned webhook delivery.",
    bullets: [
      {
        label: "Lifecycle Cleanup",
        text: "When a user deletes a workflow or turns off a webhook trigger, Automate Workflows calls this endpoint (e.g. DELETE /v1/webhooks/{{webhook_id}}).",
      },
      {
        label: "No Orphaned Events",
        text: "Prevents third-party apps from continually pinging unused webhook endpoints and degrading performance.",
      },
      {
        label: "Dynamic Webhook ID",
        text: "Passes the webhook ID stored during subscription setup into the delete URL path or query params.",
      },
    ],
    tip: "Configure method as DELETE (or POST) with the target endpoint URL incorporating the {{webhook_id}} parameter.",
  },
  delete_connection: {
    bannerText:
      "This inbuilt action executes when a user disconnects their account to revoke access tokens or clear active sessions from the external provider.",
    title: "Delete Connection Lifecycle Action",
    icon: Key,
    description:
      "Revokes tokens and terminates active sessions on the external provider when a user deletes a connection.",
    bullets: [
      {
        label: "Token Revocation",
        text: "Calls the provider's token revocation endpoint (e.g. POST /oauth/revoke) to immediately invalidate access and refresh tokens.",
      },
      {
        label: "Security & Compliance",
        text: "Complies with GDPR and provider security policies by guaranteeing tokens are destroyed upon disconnection.",
      },
      {
        label: "Automatic Trigger",
        text: "Fires in the background as soon as a user clicks 'Delete Connection' in the Connections dashboard.",
      },
    ],
    tip: "Ensure request headers or body pass the client credentials and the active {{connection.accessToken}}.",
  },
}

export function InbuiltActionsTab({ app, onChange }: InbuiltActionsTabProps) {
  const [editingAction, setEditingAction] = useState<DeveloperInbuiltAction | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [inbuiltDrawerTab, setInbuiltDrawerTab] = useState<InbuiltDrawerTab>("detail")
  const [searchQuery, setSearchQuery] = useState("")
  const [showHeadersLearnMore, setShowHeadersLearnMore] = useState(false)
  const [showNestedStepsLearnMore, setShowNestedStepsLearnMore] = useState(false)
  const [activeLearnMoreType, setActiveLearnMoreType] = useState<InbuiltActionType | null>(null)
  const [stepSaveMessage, setStepSaveMessage] = useState<string | null>(null)

  // Drag & drop and settings state for headers & parameters
  const [draggedHeaderIndex, setDraggedHeaderIndex] = useState<number | null>(null)
  const [draggedParamIndex, setDraggedParamIndex] = useState<number | null>(null)
  const [openParamSettingsId, setOpenParamSettingsId] = useState<string | null>(null)

  // Testing state
  const [isTesting, setIsTesting] = useState(false)
  const [testVariables, setTestVariables] = useState<Record<string, string>>({})
  const [selectedSimulatedOption, setSelectedSimulatedOption] = useState<string>("")
  const [testResult, setTestResult] = useState<{
    status: number
    statusText: string
    latencyMs: number
    success: boolean
    headers?: Record<string, string>
    data: any
    itemsCount?: number
    parsedOptions?: { label: string; value: string }[]
  } | null>(null)

  const [apiLearnMoreTopic, setApiLearnMoreTopic] = useState<
    "api_endpoint" | "http_headers" | "parameters" | "config" | "dynamic_param" | "static_param" | null
  >(null)
  const [previewActionJson, setPreviewActionJson] = useState<DeveloperInbuiltAction | null>(null)
  const [previewRequestModal, setPreviewRequestModal] = useState<boolean>(false)

  const openNewInbuiltAction = () => {
    const newAction: DeveloperInbuiltAction = {
      id: `inb_${Date.now()}`,
      key: `inbuilt_${(app.inbuiltActions?.length || 0) + 1}`,
      name: "Fetch Resources",
      description: "Internal helper endpoint to populate dynamic options.",
      type: "dropdown_and_custom_fields",
      multiStepExecutesAt: "each_execution",
      receiveHeaders: false,
      method: "GET",
      endpointUrl: "https://api.example.com/v1/resources",
      authType: "no_auth",
      enableHeaders: false,
      enableParameters: false,
      parameters: [
        {
          id: `param_${Date.now()}_1`,
          type: "query",
          key: "workspace_id",
          value: "{{connection.workspace_id}}",
          label: "Workspace ID",
          dataType: "string",
          required: true,
          description: "Unique identifier for the workspace.",
        },
      ],
      enableRawJson: false,
      rawJsonBody: "{\n  \"key\": \"{{input.value}}\"\n}",
      enableSelectTransform: false,
      selectTransformConfig: {
        mode: "pick",
        expression: "",
      },
      enableObjectToArray: false,
      objectToArrayConfig: {
        responseKey: "data.items",
        labelKey: "name",
        valueKey: "id",
        parentDependencyKey: "",
      },
      responseArrayPath: "data.items",
      labelKey: "name",
      valueKey: "id",
      nestedSteps: [],
      headers: [
        { id: `hdr_${Date.now()}_1`, key: "Authorization", value: "Bearer {{connection.access_token}}" },
        { id: `hdr_${Date.now()}_2`, key: "Accept", value: "application/json" },
      ],
      queryParams: [],
      bodyType: "none",
      bodyParameters: [],
      usedInActionIds: [],
    }
    setEditingAction(newAction)
    setInbuiltDrawerTab("detail")
    setTestResult(null)
    setIsTesting(false)
    setTestVariables({})
    setSelectedSimulatedOption("")
    setIsDrawerOpen(true)
  }

  const openEditInbuiltAction = (action: DeveloperInbuiltAction, initialTab: InbuiltDrawerTab = "detail") => {
    const cloned: DeveloperInbuiltAction = JSON.parse(JSON.stringify(action))
    if (!cloned.authType) cloned.authType = "no_auth"
    if (!cloned.headers) {
      cloned.headers = [
        { id: `hdr_${Date.now()}_1`, key: "Authorization", value: "Bearer {{connection.access_token}}" },
        { id: `hdr_${Date.now()}_2`, key: "Accept", value: "application/json" },
      ]
    } else {
      cloned.headers = cloned.headers.map((h, i) => ({
        id: (h as any).id || `hdr_${Date.now()}_${i}`,
        key: h.key,
        value: h.value,
      }))
    }
    if (cloned.enableHeaders === undefined) {
      cloned.enableHeaders = Boolean(cloned.headers && cloned.headers.length > 0)
    }
    if (!cloned.queryParams) cloned.queryParams = []
    if (!cloned.bodyType) cloned.bodyType = cloned.method === "GET" || cloned.method === "DELETE" ? "none" : "json"
    if (!cloned.bodyParameters) cloned.bodyParameters = []

    if (cloned.enableParameters === undefined) {
      cloned.enableParameters = Boolean(
        (cloned.parameters && cloned.parameters.length > 0) ||
        (cloned.queryParams && cloned.queryParams.length > 0) ||
        (cloned.bodyParameters && cloned.bodyParameters.length > 0)
      )
    }

    if (!cloned.parameters || cloned.parameters.length === 0) {
      const existingParams: {
        id: string
        type: "query" | "body" | "path" | "header"
        key: string
        value: string
        label?: string
        dataType?: "string" | "number" | "boolean" | "dropdown"
        required?: boolean
        description?: string
        defaultValue?: string
      }[] = []
      if (cloned.queryParams) {
        cloned.queryParams.forEach((q, i) =>
          existingParams.push({
            id: `p_q_${i}`,
            type: "query",
            key: q.key,
            value: q.value,
            dataType: "string",
          })
        )
      }
      if (cloned.bodyParameters) {
        cloned.bodyParameters.forEach((b, i) =>
          existingParams.push({
            id: `p_b_${i}`,
            type: "body",
            key: b.key,
            value: b.value,
            dataType: "string",
          })
        )
      }
      cloned.parameters = existingParams
    } else {
      cloned.parameters = cloned.parameters.map((p, i) => ({
        id: p.id || `param_${Date.now()}_${i}`,
        type: p.type || "query",
        key: p.key || "",
        value: p.value || "",
        label: p.label || "",
        dataType: p.dataType || "string",
        required: p.required || false,
        description: p.description || "",
        defaultValue: p.defaultValue || "",
        paramSourceType: p.paramSourceType || (p.dynamicKeyField ? "dynamic" : "static"),
        dynamicKeyField: p.dynamicKeyField || "",
        responseParamKey: p.responseParamKey || p.key || "",
        testValue: p.testValue || "",
        fieldType: p.fieldType || (p.dataType ? p.dataType.charAt(0).toUpperCase() + p.dataType.slice(1) : "String"),
      }))
    }

    if (cloned.enableRawJson === undefined) {
      cloned.enableRawJson = cloned.bodyType === "raw"
    }
    if (!cloned.rawJsonBody) {
      cloned.rawJsonBody = "{\n  \"key\": \"{{input.value}}\"\n}"
    }

    if (cloned.enableSelectTransform === undefined) {
      cloned.enableSelectTransform = false
    }
    if (!cloned.selectTransformConfig) {
      cloned.selectTransformConfig = { mode: "pick", expression: "" }
    }

    if (cloned.enableObjectToArray === undefined) {
      cloned.enableObjectToArray = Boolean(cloned.responseArrayPath)
    }
    if (!cloned.objectToArrayConfig) {
      cloned.objectToArrayConfig = {
        responseKey: cloned.responseArrayPath || "data.items",
        labelKey: cloned.labelKey || "name",
        valueKey: cloned.valueKey || "id",
        parentDependencyKey: cloned.parentDependencyKey || "",
      }
    }

    // Ensure nestedSteps is an array (defaults to empty if not configured)
    if (!cloned.nestedSteps) {
      cloned.nestedSteps = []
    }

    setEditingAction(cloned)
    setInbuiltDrawerTab(initialTab)
    setTestResult(null)
    setIsTesting(false)
    setTestVariables({})
    setSelectedSimulatedOption("")
    setIsDrawerOpen(true)
  }

  const [noInbuiltActionsModal, setNoInbuiltActionsModal] = useState(false)

  const duplicateInbuiltAction = (action: DeveloperInbuiltAction) => {
    const duplicated: DeveloperInbuiltAction = {
      ...JSON.parse(JSON.stringify(action)),
      id: `inb_${Date.now()}`,
      key: `${action.key}_copy`,
      name: `${action.name} (Copy)`,
      usedInActionIds: [],
    }
    const updatedList = [...(app.inbuiltActions || []), duplicated]
    onChange({
      ...app,
      inbuiltActions: updatedList,
    })
  }

  const [deleteWarningModal, setDeleteWarningModal] = useState<{
    open: boolean
    actionName: string
    usages: { type: string; name: string; detail?: string }[]
  } | null>(null)

  const checkActionUsage = (actionId: string) => {
    const usages: { type: string; name: string; detail?: string }[] = []
    const action = (app.inbuiltActions || []).find((a) => a.id === actionId)
    if (!action) return usages

    // 1. App Auth Validator check
    if (action.type === "app_auth_validator" || app.authentication?.connectionTest?.url === action.endpointUrl) {
      usages.push({
        type: "auth",
        name: "App Authentication Validator",
        detail: "Designated connection test endpoint for validating user credentials",
      })
    }

    // 2. Action Input Fields dropdown check
    app.actions.forEach((act) => {
      const matchingFields = act.inputFields.filter(
        (f) => f.type === "dropdown" && f.dropdownConfig?.dynamicConfig?.inbuiltActionId === actionId
      )
      matchingFields.forEach((f) => {
        usages.push({
          type: "action",
          name: act.name,
          detail: `Used in dropdown parameter "${f.label || f.key}"`,
        })
      })
    })

    // 3. Trigger check
    app.triggers.forEach((trg) => {
      if (action.linkedTriggerId === trg.id || action.key.includes(trg.key)) {
        usages.push({
          type: "trigger",
          name: trg.name,
          detail: "Linked webhook teardown / validation handler",
        })
      }
    })

    // 4. Nested in other Inbuilt Actions
    ;(app.inbuiltActions || []).forEach((inb) => {
      if (inb.id !== actionId && inb.nestedSteps?.some((s) => s.inbuiltActionId === actionId)) {
        usages.push({
          type: "inbuilt",
          name: inb.name,
          detail: "Referenced as a nested execution step",
        })
      }
    })

    return usages
  }

  const handleDeleteAttempt = (actionId: string) => {
    const action = (app.inbuiltActions || []).find((a) => a.id === actionId)
    if (!action) return

    const usages = checkActionUsage(actionId)

    if (usages.length > 0) {
      // Show Warning Modal
      setDeleteWarningModal({
        open: true,
        actionName: action.name,
        usages,
      })
      return
    }

    // Otherwise delete cleanly
    deleteInbuiltAction(actionId)
  }

  const deleteInbuiltAction = (id: string) => {
    const updatedList = (app.inbuiltActions || []).filter((a) => a.id !== id)
    onChange({
      ...app,
      inbuiltActions: updatedList,
    })
    setIsDrawerOpen(false)
    setEditingAction(null)
  }

  const saveInbuiltAction = () => {
    if (!editingAction) return
    const currentList = app.inbuiltActions || []
    const exists = currentList.some((a) => a.id === editingAction.id)
    let updatedList: DeveloperInbuiltAction[]
    if (exists) {
      updatedList = currentList.map((a) =>
        a.id === editingAction.id ? editingAction : a
      )
    } else {
      updatedList = [...currentList, editingAction]
    }
    onChange({
      ...app,
      inbuiltActions: updatedList,
    })
    setIsDrawerOpen(false)
    setEditingAction(null)
  }

  // Nested Steps Handlers for Tab 2 (Setup Inbuilt Action)
  const addNestedStep = () => {
    if (!editingAction) return
    const availableActions = (app.inbuiltActions || []).filter(
      (a) => a.id !== editingAction.id
    )
    if (availableActions.length === 0) {
      setNoInbuiltActionsModal(true)
      return
    }
    const currentSteps = editingAction.nestedSteps || []
    const newStep = {
      id: `step_${Date.now()}_${currentSteps.length + 1}`,
      inbuiltActionId: "",
      saved: false,
    }
    setEditingAction({
      ...editingAction,
      nestedSteps: [...currentSteps, newStep],
    })
  }

  const insertNestedStep = (index: number) => {
    if (!editingAction) return
    const availableActions = (app.inbuiltActions || []).filter(
      (a) => a.id !== editingAction.id
    )
    if (availableActions.length === 0) {
      setNoInbuiltActionsModal(true)
      return
    }
    const currentSteps = [...(editingAction.nestedSteps || [])]
    const newStep = {
      id: `step_${Date.now()}_${index}`,
      inbuiltActionId: "",
      saved: false,
    }
    currentSteps.splice(index, 0, newStep)
    setEditingAction({
      ...editingAction,
      nestedSteps: currentSteps,
    })
  }

  const removeNestedStep = (index: number) => {
    if (!editingAction) return
    const currentSteps = [...(editingAction.nestedSteps || [])]
    currentSteps.splice(index, 1)
    setEditingAction({
      ...editingAction,
      nestedSteps: currentSteps,
    })
  }

  const updateNestedStepAction = (index: number, selectedId: string) => {
    if (!editingAction) return
    const currentSteps = [...(editingAction.nestedSteps || [])]
    if (currentSteps[index]) {
      currentSteps[index] = {
        ...currentSteps[index],
        inbuiltActionId: selectedId,
        saved: false,
      }
      setEditingAction({
        ...editingAction,
        nestedSteps: currentSteps,
      })
    }
  }

  const handleSaveStep = (index: number) => {
    if (!editingAction) return
    const currentSteps = [...(editingAction.nestedSteps || [])]
    if (currentSteps[index]) {
      currentSteps[index] = {
        ...currentSteps[index],
        saved: true,
      }
      setEditingAction({
        ...editingAction,
        nestedSteps: currentSteps,
      })
      setStepSaveMessage(`Step ${index + 1} configuration saved successfully!`)
      setTimeout(() => setStepSaveMessage(null), 3000)
    }
  }

  const handleEditNestedAction = (nestedActionId: string) => {
    const found = (app.inbuiltActions || []).find((a) => a.id === nestedActionId)
    if (found) {
      openEditInbuiltAction(found, "detail")
    }
  }

  // Header Handlers for Tab 3 (HTTP Headers)
  const addHeader = () => {
    if (!editingAction) return
    const current = editingAction.headers || []
    const newHeader = {
      id: `hdr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: "",
      value: "",
    }
    setEditingAction({
      ...editingAction,
      headers: [...current, newHeader],
    })
  }

  const updateHeader = (idOrIndex: string | number, field: "key" | "value", val: string) => {
    if (!editingAction) return
    const current = [...(editingAction.headers || [])]
    if (typeof idOrIndex === "number") {
      if (current[idOrIndex]) {
        current[idOrIndex] = { ...current[idOrIndex], [field]: val }
      }
    } else {
      const idx = current.findIndex((h) => (h as any).id === idOrIndex)
      if (idx !== -1) {
        current[idx] = { ...current[idx], [field]: val }
      }
    }
    setEditingAction({ ...editingAction, headers: current })
  }

  const duplicateHeader = (index: number) => {
    if (!editingAction) return
    const current = [...(editingAction.headers || [])]
    const item = current[index]
    if (!item) return
    const duplicated = {
      id: `hdr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: item.key ? `${item.key}_copy` : "",
      value: item.value || "",
    }
    current.splice(index + 1, 0, duplicated)
    setEditingAction({ ...editingAction, headers: current })
  }

  const deleteHeader = (index: number) => {
    if (!editingAction) return
    const current = [...(editingAction.headers || [])]
    current.splice(index, 1)
    setEditingAction({ ...editingAction, headers: current })
  }

  const handleHeaderDrop = (targetIndex: number) => {
    if (!editingAction || draggedHeaderIndex === null || draggedHeaderIndex === targetIndex) return
    const current = [...(editingAction.headers || [])]
    const [removed] = current.splice(draggedHeaderIndex, 1)
    current.splice(targetIndex, 0, removed)
    setEditingAction({ ...editingAction, headers: current })
    setDraggedHeaderIndex(null)
  }

  // Parameter Handlers for Tab 3 (Body / Query / Path / Header)
  const addParameter = () => {
    if (!editingAction) return
    const current = editingAction.parameters || []
    const newParam = {
      id: `param_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: "query" as const,
      key: "",
      value: "",
      label: "",
      dataType: "string" as const,
      required: false,
      description: "",
      defaultValue: "",
      paramSourceType: "static" as const,
      dynamicKeyField: "",
      responseParamKey: "",
      testValue: "",
      fieldType: "String",
    }
    setEditingAction({
      ...editingAction,
      parameters: [...current, newParam],
    })
  }

  const updateParameter = (idOrIndex: string | number, field: string, val: any) => {
    if (!editingAction) return
    const current = [...(editingAction.parameters || [])]
    if (typeof idOrIndex === "number") {
      if (current[idOrIndex]) {
        current[idOrIndex] = { ...current[idOrIndex], [field]: val }
      }
    } else {
      const idx = current.findIndex((p) => p.id === idOrIndex)
      if (idx !== -1) {
        current[idx] = { ...current[idx], [field]: val }
      }
    }
    setEditingAction({
      ...editingAction,
      parameters: current,
    })
  }

  const updateParameterMultiple = (idOrIndex: string | number, updates: Record<string, any>) => {
    if (!editingAction) return
    const current = [...(editingAction.parameters || [])]
    const idx =
      typeof idOrIndex === "number"
        ? idOrIndex
        : current.findIndex((p) => p.id === idOrIndex)
    if (idx !== -1 && current[idx]) {
      current[idx] = { ...current[idx], ...updates }
      setEditingAction({
        ...editingAction,
        parameters: current,
      })
    }
  }

  const duplicateParameter = (index: number) => {
    if (!editingAction) return
    const current = [...(editingAction.parameters || [])]
    const item = current[index]
    if (!item) return
    const duplicated = {
      ...item,
      id: `param_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: item.key ? `${item.key}_copy` : "",
    }
    current.splice(index + 1, 0, duplicated)
    setEditingAction({ ...editingAction, parameters: current })
  }

  const removeParameter = (index: number) => {
    if (!editingAction) return
    const current = [...(editingAction.parameters || [])]
    current.splice(index, 1)
    setEditingAction({
      ...editingAction,
      parameters: current,
    })
  }

  const handleParamDrop = (targetIndex: number) => {
    if (!editingAction || draggedParamIndex === null || draggedParamIndex === targetIndex) return
    const current = [...(editingAction.parameters || [])]
    const [removed] = current.splice(draggedParamIndex, 1)
    current.splice(targetIndex, 0, removed)
    setEditingAction({ ...editingAction, parameters: current })
    setDraggedParamIndex(null)
  }

  // Detect dynamic interpolation variables like {{workspace_id}} in endpoint, headers, and query params
  const detectedPlaceholders = useMemo(() => {
    if (!editingAction) return []
    const regex = /\{\{([^}]+)\}\}/g
    const found = new Set<string>()

    let match: RegExpExecArray | null
    while ((match = regex.exec(editingAction.endpointUrl)) !== null) {
      const varName = match[1].trim()
      if (!varName.startsWith("connection.") && !varName.startsWith("common.")) {
        found.add(varName)
      }
    }

    if (editingAction.headers) {
      for (const h of editingAction.headers) {
        while ((match = regex.exec(h.value)) !== null) {
          const varName = match[1].trim()
          if (!varName.startsWith("connection.") && !varName.startsWith("common.")) {
            found.add(varName)
          }
        }
      }
    }

    if (editingAction.parentDependencyKey) {
      found.add(editingAction.parentDependencyKey)
    }

    return Array.from(found)
  }, [editingAction])

  // Dynamic key field options for Inbuilt Action parameter modal ("Set Response Parameter Details")
  const dynamicKeyFieldOptions = useMemo(() => {
    const options: { value: string; label: string }[] = []
    const otherActions = (app.inbuiltActions || []).filter(
      (a) => !editingAction || a.id !== editingAction.id
    )

    otherActions.forEach((action) => {
      if (action.valueKey) {
        options.push({
          value: `${action.key}.${action.valueKey}`,
          label: `${action.name || action.key} (${action.valueKey})`,
        })
      }
      if (action.labelKey && action.labelKey !== action.valueKey) {
        options.push({
          value: `${action.key}.${action.labelKey}`,
          label: `${action.name || action.key} (${action.labelKey})`,
        })
      }
      ;(action.parameters || []).forEach((p) => {
        if (p.key) {
          options.push({
            value: p.key,
            label: `${action.name || action.key} -> ${p.key}`,
          })
        }
      })
    })

    const commonKeys = [
      "workspace_id",
      "project_id",
      "organization_id",
      "folder_id",
      "user_id",
      "account_id",
      "team_id",
      "channel_id",
    ]
    commonKeys.forEach((key) => {
      if (!options.some((o) => o.value === key)) {
        options.push({ value: key, label: key })
      }
    })

    return options
  }, [app.inbuiltActions, editingAction])

  const handleSendTestRequest = async () => {
    if (!editingAction) return
    setIsTesting(true)
    setTestResult(null)

    const startTime = Date.now()
    await new Promise((resolve) => setTimeout(resolve, 550))
    const latency = Date.now() - startTime

    let mockData: any = {}
    let itemsCount = 0
    let parsedOptions: { label: string; value: string }[] = []

    switch (editingAction.type) {
      case "dropdown_and_custom_fields":
        if (editingAction.key.includes("pipeline") || editingAction.name.toLowerCase().includes("pipeline")) {
          mockData = {
            status: "success",
            workspace_id: testVariables.workspace_id || "ws_prod_9921",
            data: {
              pipelines: [
                { pipeline_id: "pipe_sales", title: "Standard Sales Pipeline", stages: 5, active: true },
                { pipeline_id: "pipe_enterprise", title: "Enterprise High-Value Pipeline", stages: 7, active: true },
                { pipeline_id: "pipe_renewals", title: "Customer Success Renewals", stages: 4, active: true },
                { pipeline_id: "pipe_inbound", title: "Inbound Marketing Leads", stages: 3, active: true },
              ],
            },
          }
          itemsCount = 4
          parsedOptions = mockData.data.pipelines.map((p: any) => ({
            label: p[editingAction.labelKey || "title"] || p.title,
            value: p[editingAction.valueKey || "pipeline_id"] || p.pipeline_id,
          }))
        } else {
          mockData = {
            status: "success",
            data: {
              workspaces: [
                { id: "ws_prod_01", name: "Acme Production HQ", plan: "Enterprise", region: "us-east-1" },
                { id: "ws_dev_02", name: "Staging / QA Sandbox", plan: "Developer", region: "us-east-1" },
                { id: "ws_eu_03", name: "Acme EMEA Operations", plan: "Enterprise", region: "eu-west-1" },
                { id: "ws_apac_04", name: "APAC Sales Branch", plan: "Pro", region: "ap-southeast-1" },
              ],
              items: [
                { id: "res_101", name: "Production Environment", status: "active" },
                { id: "res_102", name: "Staging Testing Branch", status: "active" },
                { id: "res_103", name: "Development Sandbox", status: "active" },
              ],
            },
          }
          const arrayPath = editingAction.responseArrayPath || "data.workspaces"
          const list = arrayPath === "data.workspaces" ? mockData.data.workspaces : mockData.data.items
          itemsCount = list.length
          parsedOptions = list.map((item: any) => ({
            label: item[editingAction.labelKey || "name"] || item.name || item.id,
            value: item[editingAction.valueKey || "id"] || item.id,
          }))
        }
        break

      case "multi_step":
        mockData = {
          step1: { datacenter_url: "https://eu-west.api.service.com", region: "eu-west-1" },
          step2: {
            properties: [
              { property_name: "vat_number", label: "European VAT Number", type: "string" },
              { property_name: "contract_renewal", label: "Contract Renewal Date", type: "date" },
              { property_name: "enterprise_sla", label: "Enterprise SLA Tier", type: "dropdown" },
            ],
          },
        }
        itemsCount = 3
        parsedOptions = mockData.step2.properties.map((p: any) => ({
          label: p[editingAction.labelKey || "label"] || p.label,
          value: p[editingAction.valueKey || "property_name"] || p.property_name,
        }))
        break

      case "app_auth_validator":
        mockData = {
          status: "authenticated",
          user: {
            id: "usr_9921",
            email: "admin@enterprise.com",
            account_name: "Acme Production Org",
            plan: "Enterprise Plus",
          },
        }
        break

      case "webhook_validator":
        mockData = {
          verified: true,
          challenge_received: testVariables["hub.challenge"] || "challenge_token_889210",
          echoed_response: testVariables["hub.challenge"] || "challenge_token_889210",
        }
        break

      case "delete_webhook":
        mockData = {
          success: true,
          message: `Webhook subscription ${testVariables.webhook_id || "wh_live_987654"} deleted successfully.`,
        }
        break

      case "delete_connection":
        mockData = {
          revoked: true,
          client_id: "acme_client_live_891230",
          token_revocation: "RFC 7009 compliant token invalidation complete.",
        }
        break
    }

    const mockHeaders: Record<string, string> = editingAction.receiveHeaders
      ? {
          "content-type": "application/json; charset=utf-8",
          "x-total-count": String(itemsCount || 4),
          "x-ratelimit-remaining": "4982",
          "x-request-id": `req_${Date.now().toString(36)}`,
          link: '<https://api.acmecrm.io/v2/workspaces?page=2>; rel="next"',
          location: "https://api.acmecrm.io/v2/workspaces/ws_prod_01",
        }
      : {
          "content-type": "application/json; charset=utf-8",
        }

    setTestResult({
      status: 200,
      statusText: "OK",
      latencyMs: latency,
      success: true,
      headers: mockHeaders,
      data: mockData,
      itemsCount: itemsCount || undefined,
      parsedOptions: parsedOptions.length > 0 ? parsedOptions : undefined,
    })
    setIsTesting(false)
  }

  const getTypeBadge = (type: InbuiltActionType) => {
    switch (type) {
      case "dropdown_and_custom_fields":
        return <Badge variant="blue" className="text-[10px] font-medium">Dropdown & Fields</Badge>
      case "multi_step":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-purple-700 dark:text-purple-300 border-purple-300 bg-purple-50 dark:bg-purple-950/40">
            Multi-Step
          </Badge>
        )
      case "app_auth_validator":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">
            Auth Validator
          </Badge>
        )
      case "webhook_validator":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-cyan-700 dark:text-cyan-300 border-cyan-300 bg-cyan-50 dark:bg-cyan-950/40">
            Webhook Validator
          </Badge>
        )
      case "delete_webhook":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-amber-700 dark:text-amber-300 border-amber-300 bg-amber-50 dark:bg-amber-950/40">
            Delete Webhook
          </Badge>
        )
      case "delete_connection":
        return (
          <Badge variant="outline" className="text-[10px] font-medium text-rose-700 dark:text-rose-300 border-rose-300 bg-rose-50 dark:bg-rose-950/40">
            Delete Connection
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="text-[10px] font-medium">{type}</Badge>
    }
  }

  // Filter actions
  const filteredActions = (app.inbuiltActions || []).filter((action) => {
    if (!searchQuery.trim()) return true
    return (
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.endpointUrl.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            In-Built Actions ({app.inbuiltActions?.length || 0})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal helper endpoints that power dynamic dropdowns, multi-step cascades, authentication pings, and webhook lifecycles (0 task credits).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {(app.inbuiltActions || []).length > 0 && (
            <div className="w-48 sm:w-60">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search inbuilt actions..."
              />
            </div>
          )}

          <Button
            type="button"
            onClick={openNewInbuiltAction}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs font-medium cursor-pointer h-9 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add In-built Action</span>
          </Button>
        </div>
      </div>

      {/* Actions Listing: Table View */}
      {filteredActions.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
          <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {searchQuery ? "No matching inbuilt actions found" : "No In-built Actions configured yet"}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Create internal helper actions to fetch dropdown options, resolve dynamic custom fields, or validate connections.
          </p>
          <Button
            type="button"
            onClick={openNewInbuiltAction}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create In-built Action</span>
          </Button>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-3 px-4 w-[28%] font-medium">Action Name & Key</th>
                  <th className="py-3 px-3 w-[20%] font-medium">Type</th>
                  <th className="py-3 px-3 w-[37%] font-medium">Endpoint</th>
                  <th className="py-3 px-4 text-right w-[15%] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredActions.map((action) => {
                  return (
                    <tr
                      key={action.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {action.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {action.key}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getTypeBadge(action.type)}
                          {action.type === "multi_step" && action.nestedSteps && action.nestedSteps.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/60 font-mono">
                              <Layers className="w-2.5 h-2.5" />
                              <span>{action.nestedSteps.filter(s => s.inbuiltActionId).length || action.nestedSteps.length} Steps</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={action.method === "POST" ? "blue" : action.method === "DELETE" ? "destructive" : "secondary"}
                            className="text-[9px] font-mono font-medium uppercase shrink-0"
                          >
                            {action.method}
                          </Badge>
                          <code className="font-mono text-xs text-slate-700 dark:text-slate-300 select-all break-all" title={action.endpointUrl}>
                            {action.endpointUrl}
                          </code>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewActionJson(action)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            title="Preview Schema & Payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditInbuiltAction(action, "detail")}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            title="Edit Inbuilt Action"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateInbuiltAction(action)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            title="Duplicate"
                          >
                            <CopyPlus className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttempt(action.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: 3-TAB FLOW                                                        */}
      {/* ========================================================================= */}
      {editingAction && (
        <Drawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
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
                      Inbuilt Action Configuration
                    </h3>
                    <button
                      type="button"
                      onClick={() => setApiLearnMoreTopic("config")}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Configuration Guide"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pt-1 -mb-5 px-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setInbuiltDrawerTab("detail")}
                  className={cn(
                    "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer",
                    inbuiltDrawerTab === "detail"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  Inbuilt Action Detail
                </button>
                <button
                  type="button"
                  onClick={() => setInbuiltDrawerTab("setup")}
                  className={cn(
                    "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                    inbuiltDrawerTab === "setup"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <span>Setup Inbuilt Action</span>
                  {editingAction.nestedSteps && editingAction.nestedSteps.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                      {editingAction.nestedSteps.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setInbuiltDrawerTab("api")}
                  className={cn(
                    "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                    inbuiltDrawerTab === "api"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <span>API Configuration</span>
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
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                {inbuiltDrawerTab === "setup" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInbuiltDrawerTab("detail")}
                    className="text-xs gap-1.5 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back: Inbuilt Action Detail</span>
                  </Button>
                )}
                {inbuiltDrawerTab === "api" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInbuiltDrawerTab("setup")}
                    className="text-xs gap-1.5 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back: Setup Inbuilt Action</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {inbuiltDrawerTab === "detail" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setInbuiltDrawerTab("setup")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <span>Next: Setup Inbuilt Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
                {inbuiltDrawerTab === "setup" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setInbuiltDrawerTab("api")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <span>Next: API Configuration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
                {inbuiltDrawerTab === "api" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveInbuiltAction}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save In-built Action</span>
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5 pr-1">

            {/* ============================================================= */}
            {/* TAB 1: INBUILT ACTION DETAIL                                  */}
            {/* ============================================================= */}
            {inbuiltDrawerTab === "detail" && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                {/* Name and Key */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>Inbuilt Action Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={editingAction.name}
                      onChange={(e) => setEditingAction({ ...editingAction, name: e.target.value })}
                      placeholder="e.g. Fetch All Workspaces"
                      className="h-10 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>Inbuilt Action Key / Slug</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={editingAction.key}
                      onChange={(e) => setEditingAction({ ...editingAction, key: e.target.value })}
                      placeholder="e.g. fetch_workspaces"
                      className="h-10 text-sm font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Inbuilt Action Description
                  </label>
                  <Input
                    value={editingAction.description || ""}
                    onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                    placeholder="e.g. Internal action to populate workspace dropdown options"
                    className="h-10 text-sm"
                  />
                  <p className="text-[11px] text-slate-500">
                    Helpful description explaining what dynamic options or validator role this internal action performs.
                  </p>
                </div>

                {/* Inbuilt Action Type Dropdown */}
                <div className="space-y-2.5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <span>Inbuilt Action Type</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={editingAction.type}
                      onChange={(e) => {
                        const newType = e.target.value as InbuiltActionType
                        setEditingAction({
                          ...editingAction,
                          type: newType,
                          multiStepExecutesAt:
                            newType === "multi_step"
                              ? editingAction.multiStepExecutesAt || "each_execution"
                              : editingAction.multiStepExecutesAt,
                        })
                      }}
                      options={INBUILT_ACTION_TYPES}
                      className="h-10 text-sm font-medium bg-white dark:bg-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Select the type of inbuilt action to configure its behaviour.
                    </p>
                  </div>

                  {/* Yellow Learning Notice Banner - Appears for ALL Inbuilt Action Types */}
                  {(() => {
                    const info =
                      INBUILT_ACTION_LEARNING_CONTENT[editingAction.type] ||
                      INBUILT_ACTION_LEARNING_CONTENT.dropdown_and_custom_fields
                    return (
                      <div className="p-3.5 rounded-lg bg-[#fffbe6] dark:bg-amber-950/40 border border-[#ffe58f] dark:border-amber-800/60 text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in-50 duration-150">
                        <div className="w-2 h-2 rounded-full bg-[#faad14] shrink-0 mt-1.5" />
                        <div className="text-slate-700 dark:text-amber-200 font-medium">
                          {info.bannerText}{" "}
                          <button
                            type="button"
                            onClick={() => setActiveLearnMoreType(editingAction.type)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                          >
                            Learn more
                          </button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Multi Step Executes At Dropdown with Rich Descriptions (Only for Multi-Step) */}
                  {editingAction.type === "multi_step" && (
                    <div className="pt-1 space-y-1.5 animate-in fade-in-50 duration-150">
                      <label className="text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <span>Multi Step Executes At</span>
                      </label>
                      <Select
                        value={editingAction.multiStepExecutesAt || "each_execution"}
                        onChange={(e) =>
                          setEditingAction({
                            ...editingAction,
                            multiStepExecutesAt: e.target.value as MultiStepExecutionTiming,
                          })
                        }
                        options={[
                          {
                            value: "each_execution",
                            label: "Each Execution (Default)",
                            description: "The multi-step process will run consistently with every action/trigger.",
                          },
                          {
                            value: "post_webhook_setup",
                            label: "Post Webhook Setup",
                            description: "The multi-step process will execute only at the time of post-webhook setup.",
                          },
                          {
                            value: "post_webhook_trigger",
                            label: "Post Webhook Trigger Event",
                            description: "The multi-step process will only execute when the webhook is triggered in automation.",
                          },
                        ]}
                        className="h-10 text-xs font-semibold bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}

                  {/* Checkbox: Receive Headers Along with Response */}
                  <div className="pt-2 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="receive_headers_check"
                      checked={Boolean(editingAction.receiveHeaders)}
                      onChange={(e) =>
                        setEditingAction({
                          ...editingAction,
                          receiveHeaders: e.target.checked,
                        })
                      }
                      className="h-4 w-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor="receive_headers_check"
                      className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-relaxed"
                    >
                      Check the box to receive headers along with the response from this inbuilt action.{" "}
                      <button
                        type="button"
                        onClick={() => setShowHeadersLearnMore(true)}
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer font-semibold"
                      >
                        Learn more
                      </button>
                    </label>
                  </div>
                </div>

                {/* Usage & Dependent Actions Section */}
                {(() => {
                  const currentId = editingAction.id
                  const dependentActions: { actionName: string; paramLabel: string; paramKey: string }[] = []

                  app.actions.forEach((act) => {
                    act.inputFields.forEach((field) => {
                      if (
                        field.type === "dropdown" &&
                        field.dropdownConfig?.dynamicConfig?.inbuiltActionId === currentId
                      ) {
                        dependentActions.push({
                          actionName: act.name,
                          paramLabel: field.label || field.key,
                          paramKey: field.key,
                        })
                      }
                    })
                  })

                  if (dependentActions.length === 0) return null

                  return (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 animate-in fade-in-50 duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Usage & Dependent Actions ({dependentActions.length})</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        The following standard actions use this In-built Action to populate fields:
                      </p>
                      <div className="space-y-1.5">
                        {dependentActions.map((dep, depIdx) => (
                          <div
                            key={depIdx}
                            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {dep.actionName}
                              </span>
                              <span className="text-slate-400 dark:text-slate-500">—</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                Parameter: <code className="font-mono text-slate-700 dark:text-slate-300">{dep.paramLabel}</code> (<code className="font-mono">{dep.paramKey}</code>)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[10px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>
                          Changes to the Array Path, Label Key, or Value Key will affect all {dependentActions.length} dependent action{dependentActions.length > 1 ? "s" : ""} listed above.
                        </span>
                      </div>
                    </div>
                  )
                })()}

                {/* Info Notice */}
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Internal Helper Action
                    </span>
                    In-built actions are executed internally during workflow configuration (e.g. dropdown loading) and connection handshakes. They consume 0 user task credits.
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: SETUP INBUILT ACTION (NESTED STEPS FLOW)               */}
            {/* ============================================================= */}
            {inbuiltDrawerTab === "setup" && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                {/* Subtitle with Learn more */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    Add other inbuilt actions to execute as nested steps within this inbuilt action.{" "}
                    <button
                      type="button"
                      onClick={() => setShowNestedStepsLearnMore(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                    >
                      Learn more
                    </button>
                  </p>
                </div>

                {/* Notice when no other inbuilt actions exist in the app */}
                {(app.inbuiltActions || []).filter((a) => a.id !== editingAction.id).length === 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>First you need to create other In-built Actions before you can add them as nested steps.</span>
                  </div>
                )}

                {/* Save Feedback Alert */}
                {stepSaveMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{stepSaveMessage}</span>
                  </div>
                )}

                {/* Nested Step Cards List */}
                <div className="space-y-3">
                  {(editingAction.nestedSteps || []).map((step, index) => {
                    const isLast = index === (editingAction.nestedSteps?.length || 1) - 1

                    return (
                      <React.Fragment key={step.id || index}>
                        {/* Step Card Container */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
                          {/* Card Top Row: Title & Remove '✕' */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Inbuilt Action Step {index + 1}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Select an inbuilt action to add as a nested step.
                              </p>
                            </div>
                            {(editingAction.nestedSteps?.length || 0) > 0 && (
                              <button
                                type="button"
                                onClick={() => removeNestedStep(index)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                                title="Remove this step"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Dotted / Dashed Separator Line */}
                          <div className="border-t border-dashed border-slate-200 dark:border-slate-800 -mx-5 px-5" />

                          {/* Select Inbuilt Action Dropdown */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Select Inbuilt Action
                            </label>
                            <Select
                              value={step.inbuiltActionId || ""}
                              onChange={(e) => updateNestedStepAction(index, e.target.value)}
                              options={[
                                { value: "", label: "Select Inbuilt Action" },
                                ...(app.inbuiltActions || [])
                                  .filter((a) => a.id !== editingAction.id)
                                  .map((a) => ({
                                    value: a.id,
                                    label: `${a.name} (${a.key})`,
                                  })),
                              ]}
                              className="h-10 text-xs font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                            />
                          </div>

                          {/* Button Row: Save & Edit Inbuilt Action */}
                          <div className="flex items-center gap-3 pt-1">
                            <Button
                              type="button"
                              onClick={() => handleSaveStep(index)}
                              className="h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer"
                            >
                              Save
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              disabled={!step.inbuiltActionId}
                              onClick={() => handleEditNestedAction(step.inbuiltActionId)}
                              className={cn(
                                "h-9 px-4 text-xs font-semibold rounded-lg border transition-all",
                                step.inbuiltActionId
                                  ? "border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                                  : "border-slate-200 text-slate-400 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed opacity-60"
                              )}
                            >
                              Edit Inbuilt Action
                            </Button>

                            {step.saved && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium ml-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Saved</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Centered '+ Insert' Button Between Cards */}
                        {!isLast && (
                          <div className="relative flex items-center justify-center py-1">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
                            </div>
                            <button
                              type="button"
                              onClick={() => insertNestedStep(index + 1)}
                              className="relative z-10 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Plus className="w-3 h-3 text-blue-600" />
                              <span>Insert</span>
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>

                {/* Bottom '+ Add Inbuilt Action Step' Button */}
                <button
                  type="button"
                  onClick={addNestedStep}
                  className="w-full py-3 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Inbuilt Action Step</span>
                </button>
              </div>
            )}

            {/* ============================================================= */}
            {/* ============================================================= */}
            {/* TAB 3: API CONFIGURATION                                      */}
            {/* ============================================================= */}
            {inbuiltDrawerTab === "api" && (
              <div className="space-y-4 animate-in fade-in-50 duration-150">
                {/* Subtitle with Learn more */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    Configure the API endpoint for this inbuilt action.{" "}
                    <button
                      type="button"
                      onClick={() => setApiLearnMoreTopic("api_endpoint")}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                    >
                      Learn more
                    </button>
                  </p>
                </div>

                {/* 1. HTTP Method * */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    HTTP Method <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={editingAction.method}
                    onChange={(e) =>
                      setEditingAction({
                        ...editingAction,
                        method: e.target.value as any,
                      })
                    }
                    options={[
                      { value: "GET", label: "GET" },
                      { value: "POST", label: "POST" },
                      { value: "DELETE", label: "DELETE" },
                      { value: "PUT", label: "PUT" },
                      { value: "PATCH", label: "PATCH" },
                    ]}
                    className="h-10 text-xs font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select an HTTP method to request this inbuilt action e.g. POST
                  </p>
                </div>

                {/* 2. API Endpoint URL * */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    API Endpoint URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editingAction.endpointUrl}
                    onChange={(e) =>
                      setEditingAction({
                        ...editingAction,
                        endpointUrl: e.target.value,
                      })
                    }
                    placeholder="API Endpoint URL *"
                    className="h-10 text-xs font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    The URL to communicate with third-party applications using the HTTP request method in order to either push or receive data from them e.g. https://api.example.com/v1/subscribers
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Checkbox 1: HTTP Headers (Exact Reusable UI) */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="chk_headers"
                        checked={Boolean(editingAction.enableHeaders)}
                        onChange={(e) =>
                          setEditingAction({
                            ...editingAction,
                            enableHeaders: e.target.checked,
                          })
                        }
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
                              setApiLearnMoreTopic("http_headers")
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer font-medium"
                          >
                            Learn more
                          </button>
                        </p>
                      </div>
                    </label>

                    {/* Collapsible Headers Builder matching user screenshot */}
                    {editingAction.enableHeaders && (
                      <div className="space-y-2.5 pt-1">
                        {(editingAction.headers || []).map((hdr, idx) => (
                          <div
                            key={(hdr as any).id || idx}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleHeaderDrop(idx)}
                            className={cn(
                              "flex items-center gap-3 group transition-opacity",
                              draggedHeaderIndex === idx && "opacity-50"
                            )}
                          >
                            {/* Header Key */}
                            <div className="flex-1">
                              <Input
                                value={hdr.key}
                                onChange={(e) => updateHeader((hdr as any).id || idx, "key", e.target.value)}
                                placeholder="Enter header key e.g. x-api-key"
                                className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100"
                              />
                            </div>

                            {/* Header Value */}
                            <div className="flex-1">
                              <Input
                                value={hdr.value}
                                onChange={(e) => updateHeader((hdr as any).id || idx, "value", e.target.value)}
                                placeholder="Enter header value"
                                className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100"
                              />
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
                                onClick={() => duplicateHeader(idx)}
                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 cursor-pointer"
                                title="Duplicate header"
                              >
                                <CopyPlus className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteHeader(idx)}
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

                  {/* Checkbox 2: Set Body/Query/Path Parameters (Exact Reusable UI) */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="chk_params"
                        checked={Boolean(editingAction.enableParameters)}
                        onChange={(e) =>
                          setEditingAction({
                            ...editingAction,
                            enableParameters: e.target.checked,
                          })
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Set Body/Query/Path Parameters
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Define the parameters that will be sent with the API request.{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setApiLearnMoreTopic("parameters")
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer font-medium"
                          >
                            Learn more
                          </button>
                        </p>
                      </div>
                    </label>

                    {/* Collapsible Parameters Builder matching user screenshot */}
                    {editingAction.enableParameters && (
                      <div className="space-y-2.5 pt-1">
                        {(editingAction.parameters || []).map((param, idx) => (
                          <div
                            key={param.id || idx}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleParamDrop(idx)}
                            className={cn(
                              "flex items-center gap-3 group transition-opacity",
                              draggedParamIndex === idx && "opacity-50"
                            )}
                          >
                            {/* Parameter Key Input with gear icon inside on the right */}
                            <div className="relative flex-1">
                              <Input
                                value={param.key}
                                onChange={(e) => updateParameter(param.id || idx, "key", e.target.value)}
                                placeholder={`Enter parameter key e.g. ${idx === 0 ? "field_1" : `field_${idx + 1}`}`}
                                className="h-10 pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100"
                              />
                              <button
                                type="button"
                                onClick={() => setOpenParamSettingsId(param.id)}
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
                                onDragStart={() => setDraggedParamIndex(idx)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 select-none"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <button
                                type="button"
                                onClick={() => duplicateParameter(idx)}
                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 cursor-pointer"
                                title="Duplicate parameter"
                              >
                                <CopyPlus className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeParameter(idx)}
                                className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                                title="Delete parameter"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Parameter Button */}
                        <div className="pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addParameter}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/40 h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Add Parameter</span>
                          </Button>
                        </div>

                        {/* Dotted border separator matching reference UI */}
                        <div className="border-b border-dotted border-slate-200 dark:border-slate-800 pt-3" />
                      </div>
                    )}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* ACTION BUTTONS                                            */}
                {/* ========================================================= */}
                <div className="pt-2">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendTestRequest}
                    disabled={isTesting}
                    className="h-9 px-4 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5 cursor-pointer"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                    )}
                    <span>{isTesting ? "Executing..." : "Send Test Request"}</span>
                  </Button>
                </div>

                {/* Sandbox Detected Variables Input */}
                {detectedPlaceholders.length > 0 && (
                  <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                      <Link2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Test Parameters Required for Simulation</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detectedPlaceholders.map((varName) => (
                        <div key={varName} className="space-y-1">
                          <label className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300">
                            &#123;&#123;{varName}&#125;&#125;
                          </label>
                          <Input
                            value={testVariables[varName] || ""}
                            onChange={(e) =>
                              setTestVariables({
                                ...testVariables,
                                [varName]: e.target.value,
                              })
                            }
                            placeholder={`Sample ${varName}`}
                            className="h-8 text-xs font-mono bg-white dark:bg-slate-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test Output Panel */}
                {testResult && (
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Status: {testResult.status} {testResult.statusText}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({testResult.latencyMs}ms)
                        </span>
                        {testResult.itemsCount !== undefined && (
                          <Badge variant="blue" className="text-[10px] font-medium">
                            {testResult.itemsCount} options detected
                          </Badge>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setTestResult(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Live Dropdown Simulation Widget */}
                    {testResult.parsedOptions && testResult.parsedOptions.length > 0 && (
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>Live Dropdown Simulation (User Preview)</span>
                          </span>
                          <Badge variant="outline" className="text-[9px] font-medium">
                            Interactive Preview
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          This preview verifies how your label key (<code>{editingAction.objectToArrayConfig?.labelKey || editingAction.labelKey}</code>) and value key (<code>{editingAction.objectToArrayConfig?.valueKey || editingAction.valueKey}</code>) render inside the workflow builder:
                        </p>
                        <Select
                          value={selectedSimulatedOption}
                          onChange={(e) => setSelectedSimulatedOption(e.target.value)}
                          options={[
                            { value: "", label: "Select an option (Simulated)..." },
                            ...testResult.parsedOptions.map((o) => ({
                              value: o.value,
                              label: `${o.label} (value: ${o.value})`,
                            })),
                          ]}
                          className="h-9 text-xs font-medium"
                        />
                        {selectedSimulatedOption && (
                          <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-[11px] flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Selected Machine Value: <strong className="font-mono">{selectedSimulatedOption}</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Headers Preview (if enabled) */}
                    {testResult.headers && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                          HTTP Response Headers {editingAction.receiveHeaders && "(Exposed in Output)"}
                        </span>
                        <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-28 overflow-y-auto">
                          {JSON.stringify(testResult.headers, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Body Preview */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Response Body (JSON)
                      </span>
                      <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* Learn More Dialog for Response Headers */}
      <Dialog open={showHeadersLearnMore} onOpenChange={setShowHeadersLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            How to Use: HTTP Response Headers
          </DialogTitle>
          <DialogDescription>
            Why and how to capture raw response headers alongside the JSON body for pagination and metadata.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-lg text-blue-800 dark:text-blue-300">
            <strong>What this does:</strong> By default, only the JSON response body is parsed. Enabling this option exposes the full HTTP response headers object (e.g. pagination cursors, rate limits, record counts) as mappable variables.
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">How Developer Configures It:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Check &ldquo;Receive Headers&rdquo;:</strong> Toggle the checkbox under your API request configuration.</li>
              <li><strong>Run Endpoint Test:</strong> Click test to inspect the returned headers in the test output console.</li>
              <li><strong>Map Header Keys:</strong> Reference values like <code className="font-mono text-blue-600">headers.link</code> or <code className="font-mono text-blue-600">headers[&apos;x-total-count&apos;]</code> in downstream steps or dropdown items.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How End-Users Experience It:</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Enables automations to fetch multi-page records seamlessly and extract created resource IDs from <code className="font-mono text-blue-600">Location</code> headers without manual scripting.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowHeadersLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Universal Learn More Dialog for Any Selected Inbuilt Action Type */}
      <Dialog
        open={Boolean(activeLearnMoreType)}
        onOpenChange={(open) => {
          if (!open) setActiveLearnMoreType(null)
        }}
      >
        {activeLearnMoreType && (() => {
          const info = INBUILT_ACTION_LEARNING_CONTENT[activeLearnMoreType]
          if (!info) return null
          const IconComp = info.icon

          return (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold flex items-center gap-2">
                  <IconComp className="w-4 h-4 text-blue-600" />
                  <span>{info.title}</span>
                </DialogTitle>
                <DialogDescription>
                  {info.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                {info.tip && (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50">
                    <span className="font-semibold text-blue-900 dark:text-blue-200 block mb-1">
                      Quick Linking Guidance
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {info.tip}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Key Architectural Capabilities:
                  </span>

                  <div className="space-y-2">
                    {info.bullets.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
                      >
                        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          <span>{b.label}</span>
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed pl-3.5">
                          {b.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveLearnMoreType(null)}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Got it
                </Button>
              </DialogFooter>
            </>
          )
        })()}
      </Dialog>

      {/* Learn More Dialog for Nested Inbuilt Actions (Step 2) */}
      <Dialog open={showNestedStepsLearnMore} onOpenChange={setShowNestedStepsLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            How to Use: In-built Actions & Chained Steps
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to building internal micro-actions that power dynamic dropdowns and cascades.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
            <strong>What this does:</strong> Runs internal helper HTTP requests in the background (0 task credits) to load dynamic lists (e.g. Workspaces, Projects, Folders) into dropdowns.
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
              How Developer Configures It:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Step 1 (Create In-built Action):</strong> Set up your API endpoint to fetch list items from your service.
              </li>
              <li>
                <strong>Step 2 (Chain Nested Steps):</strong> If an action depends on a prior selection (e.g. Projects inside a selected Workspace), add Step 1 first and reference its output.
              </li>
              <li>
                <strong>Step 3 (Attach to Action/Trigger):</strong> Link this In-built Action to a dropdown field in your Action or Trigger configuration.
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When users build a workflow, they see live, real-time dropdown choices populated directly from their connected software account without typing IDs manually.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowNestedStepsLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>
      {/* Warning Modal */}
      <Dialog
        open={Boolean(deleteWarningModal?.open)}
        onOpenChange={(open) => {
          if (!open) setDeleteWarningModal(null)
        }}
        className="max-w-md"
      >
        <div className="flex flex-col items-center text-center space-y-4 pt-1">
          {/* Amber Warning Icon Pill */}
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Action In Use
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              This In-built action cannot be deleted because it is currently linked to an active action or trigger field.{" "}
              <button
                type="button"
                onClick={() => {
                  setDeleteWarningModal(null)
                  setShowNestedStepsLearnMore(true)
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer ml-0.5"
              >
                Learn more
              </button>
            </p>
          </div>

          {/* Active Dependencies List */}
          {deleteWarningModal?.usages && deleteWarningModal.usages.length > 0 && (
            <div className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left text-xs space-y-2 max-h-40 overflow-y-auto">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-amber-500" />
                Active Dependencies Found:
              </span>
              <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-700/50">
                {deleteWarningModal.usages.map((u, i) => (
                  <div key={i} className={cn("flex items-start gap-2 text-slate-600 dark:text-slate-400", i > 0 && "pt-1.5")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <div className="min-w-0 flex-1 leading-snug">
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{u.name}</strong>:{" "}
                      <span>{u.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action Button */}
          <div className="pt-1 flex justify-center w-full">
            <Button
              type="button"
              onClick={() => setDeleteWarningModal(null)}
              className="h-8.5 px-7 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              OK
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Warning Modal: No Available Inbuilt Actions */}
      <Dialog
        open={noInbuiltActionsModal}
        onOpenChange={(open) => {
          if (!open) setNoInbuiltActionsModal(false)
        }}
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center space-y-4 pt-1">
          {/* Amber Warning Icon Pill */}
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Inbuilt Action Required
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Create an In-built Action first to use dynamic dropdowns or multi-step validation.
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

      {/* API Configuration Learn More Dialog */}
      <Dialog
        open={Boolean(apiLearnMoreTopic)}
        onOpenChange={(open) => {
          if (!open) setApiLearnMoreTopic(null)
        }}
      >
        {apiLearnMoreTopic && (
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  {apiLearnMoreTopic === "api_endpoint" && "How to Use: Inbuilt API Endpoints"}
                  {apiLearnMoreTopic === "http_headers" && "How to Use: HTTP Request Headers"}
                  {apiLearnMoreTopic === "parameters" && "How to Use: Request Parameters (Query/Body/Path)"}
                  {apiLearnMoreTopic === "config" && "How to Use: In-built Actions Configuration"}
                  {apiLearnMoreTopic === "dynamic_param" && "How to Use: Dynamic Cascading Parameters"}
                  {apiLearnMoreTopic === "static_param" && "How to Use: Static Parameters & Test Defaults"}
                </span>
              </DialogTitle>
              <DialogDescription>
                {apiLearnMoreTopic === "api_endpoint" && "Connect internal micro-endpoints to third-party REST services."}
                {apiLearnMoreTopic === "http_headers" && "Pass authorization credentials and headers during internal requests."}
                {apiLearnMoreTopic === "parameters" && "Transmit parameters dynamically across URL, query, and payload locations."}
                {apiLearnMoreTopic === "config" && "Overview of internal micro-actions in the Developer Platform."}
                {apiLearnMoreTopic === "dynamic_param" && "Chain dependent dropdowns that react to parent selections."}
                {apiLearnMoreTopic === "static_param" && "Configure fallback values and test payloads for the developer sandbox."}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5 text-slate-600 dark:text-slate-300">
              {apiLearnMoreTopic === "api_endpoint" && (
                <>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Endpoint URL:</strong> Enter the full REST URL. You can embed dynamic tags like <code>&#123;&#123;connection.access_token&#125;&#125;</code> or <code>&#123;&#123;input.field&#125;&#125;</code> directly in the URL path.</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>HTTP Method:</strong> Choose GET (for fetching dropdown items) or POST/PUT/DELETE for background validation and lifecycle management.</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Zero Task Credits:</strong> In-built actions execute purely for UI rendering and connection management, consuming 0 credits for users.</span>
                  </div>
                </>
              )}

              {apiLearnMoreTopic === "http_headers" && (
                <>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Authorization Headers:</strong> Pass authentication tokens (e.g. <code>Bearer &#123;&#123;connection.access_token&#125;&#125;</code>) so your API authorizes the request.</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Receive Headers Option:</strong> Check this box if your API returns critical data (like pagination cursors or rate limits) in the response headers.</span>
                  </div>
                </>
              )}

              {apiLearnMoreTopic === "parameters" && (
                <>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Query Parameters:</strong> Appended to the URL query string (e.g. <code>?limit=100&status=active</code>).</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Path Parameters:</strong> Replaces placeholders in the endpoint path (e.g. <code>/workspaces/&#123;&#123;workspace_id&#125;&#125;</code>).</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Body Parameters:</strong> Serialized as the JSON request payload for POST, PUT, and PATCH methods.</span>
                  </div>
                </>
              )}

              {apiLearnMoreTopic === "config" && (
                <>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Step 1:</strong> Define metadata and action type (Dynamic Dropdown, Auth Validator, or Webhook Lifecycle).</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Step 2:</strong> Chain multi-step execution dependencies if this action relies on prior data.</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Step 3:</strong> Configure API endpoint, parameters, headers, and test the live response.</span>
                  </div>
                </>
              )}

              {apiLearnMoreTopic === "dynamic_param" && (
                <>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Cascading Dropdowns:</strong> Links this In-built Action to a parent dropdown so selecting a Workspace automatically updates the list of Projects.</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Key Mapping:</strong> Select which field from the parent action supplies the filter value.</span>
                  </div>
                </>
              )}

              {apiLearnMoreTopic === "static_param" && (
                <>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Default Value:</strong> Automatically sent if the user does not select or provide a custom value.</span>
                  </div>
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span><strong>Sandbox Test Value:</strong> Used when testing the endpoint inside the Developer Sandbox console.</span>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                size="sm"
                onClick={() => setApiLearnMoreTopic(null)}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
              >
                Got it
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>

      {/* Set Response Parameter Details Modal */}
      {editingAction && openParamSettingsId && (() => {
        const activeParam = (editingAction.parameters || []).find((p) => p.id === openParamSettingsId)
        if (!activeParam) return null

        const paramSourceType =
          activeParam.paramSourceType ||
          (activeParam.dynamicKeyField ? "dynamic" : "static")

        const activeFieldType =
          activeParam.fieldType ||
          (activeParam.dataType
            ? activeParam.dataType.charAt(0).toUpperCase() + activeParam.dataType.slice(1)
            : "String")

        // Merge active dynamic key if set and not in options list
        const activeDynamicOptions = [...dynamicKeyFieldOptions]
        if (
          activeParam.dynamicKeyField &&
          !activeDynamicOptions.some((o) => o.value === activeParam.dynamicKeyField)
        ) {
          activeDynamicOptions.unshift({
            value: activeParam.dynamicKeyField,
            label: activeParam.dynamicKeyField,
          })
        }

        return (
          <Drawer
            open={Boolean(openParamSettingsId)}
            onOpenChange={(open) => !open && setOpenParamSettingsId(null)}
            side="right"
            zIndex={80}
            className="w-[660px] max-w-[94vw]"
            title="Set Response Parameter Details"
            description="Configure dynamic dependencies, response parameter mapping, test values, and validation rules."
            footer={
              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenParamSettingsId(null)}
                  className="h-9 px-4 text-xs cursor-pointer font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenParamSettingsId(null)}
                  className="h-9 px-5 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </Button>
              </div>
            }
          >
            <div className="space-y-4 pt-1">
              {/* Option 1: Dynamic Parameter Value (Image 1) */}
              <div className="space-y-3">
                <div
                  onClick={() =>
                    updateParameterMultiple(activeParam.id, { paramSourceType: "dynamic" })
                  }
                  className="flex items-start gap-3 cursor-pointer select-none group"
                >
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                        paramSourceType === "dynamic"
                          ? "border-blue-600 bg-white dark:bg-slate-900"
                          : "border-slate-400 group-hover:border-slate-500 bg-white dark:bg-slate-900"
                      )}
                    >
                      {paramSourceType === "dynamic" && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                      Dynamic Parameter Value
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure this field to generate dependant dropdown option.{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setApiLearnMoreTopic("dynamic_param")
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer font-medium"
                      >
                        Learn more
                      </button>
                    </p>
                  </div>
                </div>

                {/* Dynamic Parameter Content (Dropdown) */}
                {paramSourceType === "dynamic" && (
                  <div className="pl-7 space-y-1.5 animate-in fade-in-50 duration-150">
                    <Select
                      value={activeParam.dynamicKeyField || ""}
                      onChange={(e) =>
                        updateParameterMultiple(activeParam.id, {
                          dynamicKeyField: e.target.value,
                          key: e.target.value || activeParam.key,
                        })
                      }
                      options={activeDynamicOptions}
                      placeholder="Select key field"
                      className="h-10 text-sm font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select response field from configured inbuilt actions
                    </p>
                  </div>
                )}
              </div>

              {/* Dotted border separator */}
              <div className="border-b border-dotted border-slate-200 dark:border-slate-800 my-4" />

              {/* Option 2: Static Parameter Value (Images 2 & 3) */}
              <div className="space-y-3">
                <div
                  onClick={() =>
                    updateParameterMultiple(activeParam.id, { paramSourceType: "static" })
                  }
                  className="flex items-start gap-3 cursor-pointer select-none group"
                >
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                        paramSourceType === "static"
                          ? "border-blue-600 bg-white dark:bg-slate-900"
                          : "border-slate-400 group-hover:border-slate-500 bg-white dark:bg-slate-900"
                      )}
                    >
                      {paramSourceType === "static" && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                      Static Parameter Value
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select &quot;Static Parameter Value&quot; to use fixed values from response or user input.{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setApiLearnMoreTopic("static_param")
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer font-medium"
                      >
                        Learn more
                      </button>
                    </p>
                  </div>
                </div>

                {/* Static Parameter Inputs */}
                {paramSourceType === "static" && (
                  <div className="pl-7 space-y-3.5 animate-in fade-in-50 duration-150">
                    {/* Response/Parameter Key * */}
                    <div className="space-y-1.5">
                      <Input
                        value={
                          activeParam.responseParamKey !== undefined
                            ? activeParam.responseParamKey
                            : activeParam.key || ""
                        }
                        onChange={(e) =>
                          updateParameterMultiple(activeParam.id, {
                            responseParamKey: e.target.value,
                            key: e.target.value,
                          })
                        }
                        placeholder="Response/Parameter Key *"
                        className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enter the JSON response key or parameter path. e.g. &#123;&#123;result==&gt;tags==&gt;tag_id&#125;&#125;
                      </p>
                    </div>

                    {/* Test Value */}
                    <div className="space-y-1.5">
                      <Input
                        value={activeParam.testValue || ""}
                        onChange={(e) => updateParameter(activeParam.id, "testValue", e.target.value)}
                        placeholder="Test Value"
                        className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        The value passed in this field will be used to test the trigger event in the backend only.
                      </p>
                    </div>

                    {/* Default Value */}
                    <div className="space-y-1.5">
                      <Input
                        value={
                          activeParam.defaultValue !== undefined
                            ? activeParam.defaultValue
                            : activeParam.value || ""
                        }
                        onChange={(e) =>
                          updateParameterMultiple(activeParam.id, {
                            defaultValue: e.target.value,
                            value: e.target.value,
                          })
                        }
                        placeholder="Default Value"
                        className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        If the user does not enter or map any data in this field, provide a default value to be passed.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dotted border separator */}
              <div className="border-b border-dotted border-slate-200 dark:border-slate-800 my-4" />

              {/* Field Type Selector */}
              <div className="space-y-1.5">
                <div className="relative">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Field Type
                  </label>
                  <Select
                    value={activeFieldType}
                    onChange={(e) => {
                      const val = e.target.value
                      updateParameterMultiple(activeParam.id, {
                        fieldType: val,
                        dataType: val.toLowerCase(),
                      })
                    }}
                    options={[
                      { value: "String", label: "String" },
                      { value: "Number", label: "Number" },
                      { value: "Boolean", label: "Boolean" },
                      { value: "Dropdown", label: "Dropdown" },
                      { value: "Array", label: "Array" },
                      { value: "Object", label: "Object" },
                      { value: "File", label: "File" },
                    ]}
                    className="h-10 text-sm font-medium bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose the data type expected for this field&apos;s value.
                </p>
              </div>

              {/* Required Field Toggle Switch (On/Off) */}
              <div className="pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                      Make this Field Required
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Toggle on to make this field mandatory for the user to fill.
                    </p>
                  </div>
                  <Switch
                    checked={Boolean(activeParam.required)}
                    onCheckedChange={(checked) =>
                      updateParameter(activeParam.id, "required", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </Drawer>
        )
      })()}

      {/* JSON Schema & Definition Preview Modal */}
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
                <span>In-built Action Schema & API Definition</span>
              </DialogTitle>
              <DialogDescription>
                Raw technical JSON configuration for <code className="font-mono font-medium text-slate-900 dark:text-slate-100">{previewActionJson.name}</code> ({previewActionJson.key}).
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
                className="h-8 text-xs gap-1.5 font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy JSON
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setPreviewActionJson(null)}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
