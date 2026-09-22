"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Settings,
  Trash2,
  Layers,
  ChevronRight,
  Code,
  FileCode,
  Globe,
  Zap,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Lock,
  Grid,
  Copy,
  RefreshCw,
  X,
  Plug,
  MoreVertical,
  Search,
  MessageSquare,
  Clock,
  ChevronDown,
  Edit2,
  Folder,
  HelpCircle,
  ArrowDown,
  ArrowRight,
  Check,
  ArrowLeftRight,
  Save,
  ExternalLink,
  Key,
  Mail,
  Send,
  Eye,
  Sun,
  Moon,
  Sparkles,
  Crosshair
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Drawer } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AppIcon } from "@/components/ui/app-icon"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { MVP_APPS, INITIAL_USER_CONNECTIONS, INITIAL_WORKFLOWS, WorkflowStep, UserConnection } from "@/lib/data"
import { getAppActionSchema, ActionField, AppActionSchema, APP_SCHEMAS_MAP } from "@/lib/action-schemas"
import { VariablePicker, DEFAULT_SAMPLE_DATA } from "@/components/workflow/VariablePicker"
import { VariablePillInput } from "@/components/workflow/VariablePillInput"
import { ConditionRow, PriorVariableOption } from "@/components/workflow/ConditionRow"
import { isUIWebhookApp, getWebhookAppGuide, getWebhookEventGuide } from "@/lib/webhook-guides"
import { HumanFormFieldsBuilder } from "@/components/workflow/HumanFormFieldsBuilder"
import { EmailApprovalPreviewModal } from "@/components/workflow/EmailApprovalPreviewModal"
import { useTheme } from "@/context/ThemeContext"
import { getDeveloperApps, developerAppsToAppConnections } from "@/lib/developer-data"
import { AIWorkflowAssistant } from "@/components/workflow/AIWorkflowAssistant"
import { GeneratedWorkflowPlan, ChatMessage } from "@/lib/ai-workflow-generator"

function WorkflowEditorContent() {
  const { theme, toggleTheme } = useTheme()
  const searchParams = useSearchParams()
  const wfId = searchParams.get("id")
  const paramName = searchParams.get("name")
  const initialAppId = searchParams.get("app")
  const isExplicitNew = searchParams.get("new") === "true" || searchParams.get("empty") === "true"
  const existingWorkflow = wfId ? INITIAL_WORKFLOWS.find((w) => w.id === wfId) : null
  const isNew = isExplicitNew || !wfId || !existingWorkflow

  const [workflowName, setWorkflowName] = useState(() => {
    if (paramName) return decodeURIComponent(paramName)
    if (existingWorkflow) return existingWorkflow.name
    return "Untitled Workflow"
  })
  const [isOn, setIsOn] = useState(true)
  const [canvasOrientation, setCanvasOrientation] = useState<"vertical" | "horizontal">("vertical")

  const [toastState, setToastState] = useState<{ message: string; type?: "success" | "warning" | "error" | "info" } | null>(null)

  const showToast = (msg: string, type: "success" | "warning" | "error" | "info" = "success") => {
    setToastState({ message: msg, type })
    setTimeout(() => setToastState(null), 3500)
  }

  // Developer Custom Apps Integration
  const [devApps, setDevApps] = useState<any[]>([])
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDevApps(developerAppsToAppConnections(getDeveloperApps()))
    }
  }, [])

  const ALL_AVAILABLE_APPS = React.useMemo(() => {
    return [...MVP_APPS, ...devApps]
  }, [devApps])

  // AI Workflow Builder Interface State
  const [aiPanelMode, setAiPanelMode] = useState<"bottom-floating" | "left-docked" | "minimized" | "closed">(() => {
    if (isNew && !initialAppId) return "bottom-floating"
    return "closed"
  })
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([])
  const [aiLastPlan, setAiLastPlan] = useState<GeneratedWorkflowPlan | null>(null)
  const [isBuildingWorkflow, setIsBuildingWorkflow] = useState(false)
  const [buildingProgress, setBuildingProgress] = useState<{ total: number; current: number; currentAppName?: string }>({
    total: 0,
    current: 0
  })
  const [activeAiGeneratingStepId, setActiveAiGeneratingStepId] = useState<string | null>(null)
 

  const handleGenerateStepsWithAI = (plan: GeneratedWorkflowPlan) => {
    setIsBuildingWorkflow(true)
    if (plan.workflowName) {
      setWorkflowName(plan.workflowName)
    }

    const stepsToAdd = plan.steps
    setSteps([])
    setBuildingProgress({ total: stepsToAdd.length, current: 0 })

    stepsToAdd.forEach((st, idx) => {
      setTimeout(() => {
        setActiveAiGeneratingStepId(st.id)
        setSteps((prev) => [...prev, st])
        setBuildingProgress({
          total: stepsToAdd.length,
          current: idx + 1,
          currentAppName: st.appName
        })

        handleResetPan()

        if (idx === stepsToAdd.length - 1) {
          setTimeout(() => {
            setActiveAiGeneratingStepId(null)
            setIsBuildingWorkflow(false)
            showToast(`Workflow built! ${stepsToAdd.length} steps generated in real-time.`, "success")
          }, 600)
        }
      }, (idx + 1) * 650)
    })
  }

  const handleRefineStepsWithAI = (plan: GeneratedWorkflowPlan) => {
    setIsBuildingWorkflow(true)
    if (plan.workflowName) {
      setWorkflowName(plan.workflowName)
    }
    setSteps(plan.steps)
    setTimeout(() => {
      setIsBuildingWorkflow(false)
      showToast("Workflow updated with AI refinement!", "success")
    }, 450)
  }

  // Canvas Steps State
  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    if (initialAppId) {
      const allInitial = typeof window !== "undefined" ? [...MVP_APPS, ...developerAppsToAppConnections(getDeveloperApps())] : MVP_APPS
      const matchedApp = allInitial.find((a) => a.id === initialAppId)
      if (matchedApp) {
        const isTrig = matchedApp.triggers.length > 0
        const ev = isTrig ? matchedApp.triggers[0] : matchedApp.actions[0]
        return [
          {
            id: "step_1",
            type: isTrig ? "trigger" : "action",
            appId: matchedApp.id,
            appName: matchedApp.name,
            eventId: ev?.id || "",
            eventName: ev?.name || "Event",
            status: "unmapped",
            fieldMappings: {}
          }
        ]
      }
    }
    if (existingWorkflow && existingWorkflow.steps && existingWorkflow.steps.length > 0) {
      return existingWorkflow.steps
    }
    // New workflows default to a completely empty canvas!
    return []
  })

  // Only convert AI Interface into the Pill when a trigger is newly added (transition from no-trigger to has-trigger).
  // When the user clicks the pill to reopen, allow it to open freely without being forced back to minimized!
  const prevHasTriggerRef = useRef<boolean>(steps.some((s) => s.type === "trigger" && Boolean(s.appId)))

  useEffect(() => {
    const hasTrigger = steps.some((s) => s.type === "trigger" && Boolean(s.appId))
    if (!prevHasTriggerRef.current && hasTrigger) {
      setAiPanelMode("minimized")
    }
    prevHasTriggerRef.current = hasTrigger
  }, [steps])

  // Canvas Side Rail Toolbar State
  const [activeSideTool, setActiveSideTool] = useState<string | null>(null)
  const [zoomPercent, setZoomPercent] = useState<string>("110%")
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [copiedTooltipId, setCopiedTooltipId] = useState<string | null>(null)
  const [showDottedGrid, setShowDottedGrid] = useState<boolean>(true)

  // Side Rail Tool Panels State
  const [sideSearchQuery, setSideSearchQuery] = useState("")
  const [canvasComments, setCanvasComments] = useState([
    {
      id: "comment_1",
      author: "Himanshu Pundir",
      role: "Product Lead",
      text: "Double check WhatsApp template parameters before activating v1 live trigger",
      time: "10 mins ago",
      stepName: "Automate Chats"
    },
    {
      id: "comment_2",
      author: "Rahul Sharma",
      role: "DevOps Eng",
      text: "Webhook endpoint tested & SSL certificate verified cleanly",
      time: "1 hour ago",
      stepName: "Webhook"
    }
  ])
  const [newCommentText, setNewCommentText] = useState("")
  const [selectedCommentStep, setSelectedCommentStep] = useState<string>("step_1")

  const [revisions] = useState([
    {
      id: "rev_3",
      version: "v1.2",
      label: "Added HubSpot CRM Contact action",
      author: "Himanshu Pundir",
      time: "Just now",
      isActive: true
    },
    {
      id: "rev_2",
      version: "v1.1",
      label: "Configured Slack trigger and Webhook listener",
      author: "Himanshu Pundir",
      time: "2 hours ago",
      isActive: false
    },
    {
      id: "rev_1",
      version: "v1.0",
      label: "Created initial workflow draft",
      author: "System",
      time: "Yesterday",
      isActive: false
    }
  ])

  // App Picker Category Filter State
  const [appCategoryFilter, setAppCategoryFilter] = useState<string>("All")

  // Canvas Settings State
  const [autoRetry, setAutoRetry] = useState(true)
  const [executionTimeout, setExecutionTimeout] = useState("60s")
  const [alertEmail, setAlertEmail] = useState("himanshu@automate.com")

  // Core Step Interactive Form States
  const [filterField, setFilterField] = useState("{{step_1.user}}")
  const [filterOp, setFilterOp] = useState("contains")
  const [filterVal, setFilterVal] = useState("Rahul")

  // Router Route Branch Filter Condition States
  const [routeAField, setRouteAField] = useState("{{step_1.amount}}")
  const [routeAOp, setRouteAOp] = useState("gt")
  const [routeAVal, setRouteAVal] = useState("500")

  const [routeBField, setRouteBField] = useState("{{step_1.amount}}")
  const [routeBOp, setRouteBOp] = useState("lte")
  const [routeBVal, setRouteBVal] = useState("500")

  const [expandedRouteId, setExpandedRouteId] = useState<string | null>("rt_1")

  // Per-Route Branch Steps Collections (Steps rendered inside Route A and Route B columns)
  const [routeASteps, setRouteASteps] = useState<WorkflowStep[]>([])
  const [routeBSteps, setRouteBSteps] = useState<WorkflowStep[]>([])

  // Branch-scoped steps dictionary: key = "{parentRouterStepId}_{branch}" (e.g. "rt_step_123_sub_a")
  // This ensures each Router node gets its own independent child branch step collections,
  // preventing cross-contamination between Route A and Route B sub-trees.
  const [branchSteps, setBranchSteps] = useState<Record<string, WorkflowStep[]>>({})

  // Helper to get steps for a specific branch (including Level 1 routeA and routeB)
  const getBranchSteps = (key: string): WorkflowStep[] =>
    key === "routeA" ? routeASteps : key === "routeB" ? routeBSteps : (branchSteps[key] || [])

  // Compatibility shims: derive old names from branchSteps for width detection
  // These collect ALL steps across all branches of that type
  const allSubRouteSteps = Object.entries(branchSteps)
    .filter(([k]) => k.includes("_sub_"))
    .flatMap(([, v]) => v)
  const allNestedRouteSteps = Object.entries(branchSteps)
    .filter(([k]) => k.includes("_nest_"))
    .flatMap(([, v]) => v)
  const allDeepRouteSteps = Object.entries(branchSteps)
    .filter(([k]) => k.includes("_deep_"))
    .flatMap(([, v]) => v)

  // Dynamic Router Branch Keys: key = routerStepId, value = ["a", "b", "c", ...]
  const [routerBranchKeys, setRouterBranchKeys] = useState<Record<string, string[]>>({})

  // Dynamic Router Branch Conditions: key = branchKey, value = { field, op, val }
  const [branchConditions, setBranchConditions] = useState<Record<string, { field: string; op: string; val: string }>>({})

  // Dynamic Router Branch Multi-Conditions: key = branchKey, value = [{ id, field, op, val, logic }]
  const [branchMultiConditions, setBranchMultiConditions] = useState<
    Record<string, Array<{ id: string; field: string; op: string; val: string; logic: "AND" | "OR" }>>
  >({})

  // Custom Branch Names: key = branchKey, value = "Route A — High Value Leads"
  const [branchNames, setBranchNames] = useState<Record<string, string>>({})

  // Standalone Filter Step Multi-Conditions: key = stepId, value = [{ id, field, op, val, logic }]
  const [filterStepConditions, setFilterStepConditions] = useState<
    Record<string, Array<{ id: string; field: string; op: string; val: string; logic: "AND" | "OR" }>>
  >({})

  const [pickerConditionTarget, setPickerConditionTarget] = useState<{
    type: "branch" | "filter"
    key: string
    ruleId: string
    targetField?: "field" | "val"
    branchIndex?: number
  } | null>(null)

  const getOpSymbol = (op: string) => {
    switch (op) {
      case "gt": return ">"
      case "lte": return "<="
      case "contains": return "contains"
      case "not_empty": return "is not empty"
      default: return "="
    }
  }

  const getBranchCondition = (branchKey: string, index: number) => {
    if (branchConditions[branchKey]) return branchConditions[branchKey]
    if (index === 0) return { field: routeAField, op: routeAOp, val: routeAVal }
    if (index === 1) return { field: routeBField, op: routeBOp, val: routeBVal }
    const defaultOps = ["gt", "lte", "equals", "contains", "not_empty"]
    const op = defaultOps[index % defaultOps.length]
    return { field: "{{step_1.amount}}", op, val: `${(index + 1) * 200}` }
  }

  const updateBranchCondition = (branchKey: string, updates: Partial<{ field: string; op: string; val: string }>, index: number) => {
    const current = getBranchCondition(branchKey, index)
    setBranchConditions((prev) => ({
      ...prev,
      [branchKey]: { ...current, ...updates }
    }))
  }

  const getRouterStepDepth = (stepId: string): number => {
    if (steps.some((s) => s.id === stepId)) return 1
    if (routeASteps.some((s) => s.id === stepId) || routeBSteps.some((s) => s.id === stepId)) return 2
    for (const [branchKey, bSteps] of Object.entries(branchSteps)) {
      if (bSteps.some((s) => s.id === stepId)) {
        if (branchKey.includes("_sub_")) return 3
        if (branchKey.includes("_nest_")) return 4
        if (branchKey.includes("_deep_")) return 5
        return 2
      }
    }
    return 1
  }

  function getBranchMeta(stepId: string, suffix: string, depth: number) {
    const isFirstRoot = depth === 1 && steps.some((s) => s.id === stepId && s.appId === "router")
    if (isFirstRoot) {
      if (suffix === "a") {
        return { key: "routeA", name: branchNames["routeA"] || "Route A", suffix }
      }
      if (suffix === "b") {
        return { key: "routeB", name: branchNames["routeB"] || "Route B", suffix }
      }
    }

    const suffixUpper = suffix.toUpperCase()
    const legacySub = `${stepId}_sub_${suffix}`
    const legacyNest = `${stepId}_nest_${suffix}`
    const legacyDeep = `${stepId}_deep_${suffix}`
    const legacyLeaf = `${stepId}_leaf_${suffix}`
    const standardKey = `${stepId}_br_${suffix}`

    let prefix = "Route"
    if (depth === 2) prefix = "Sub-Route"
    else if (depth === 3) prefix = "Nested Route"
    else if (depth === 4) prefix = "Deep Route"
    else prefix = "Route"

    let key = standardKey
    let name = `${prefix} ${suffixUpper}`

    if (branchSteps[legacySub]) { key = legacySub; name = `Sub-Route ${suffixUpper}` }
    else if (branchSteps[legacyNest]) { key = legacyNest; name = `Nested Route ${suffixUpper}` }
    else if (branchSteps[legacyDeep]) { key = legacyDeep; name = `Deep Route ${suffixUpper}` }
    else if (branchSteps[legacyLeaf]) { key = legacyLeaf; name = `Route ${suffixUpper}` }
    else if (branchSteps[standardKey]) { key = standardKey; name = `${prefix} ${suffixUpper}` }
    else {
      if (depth === 2) { key = legacySub; name = `Sub-Route ${suffixUpper}` }
      else if (depth === 3) { key = legacyNest; name = `Nested Route ${suffixUpper}` }
      else if (depth === 4) { key = legacyDeep; name = `Deep Route ${suffixUpper}` }
      else if (depth === 5) { key = legacyLeaf; name = `Route ${suffixUpper}` }
      else { key = standardKey; name = `${prefix} ${suffixUpper}` }
    }

    if (branchNames[key]) {
      name = branchNames[key]
    }

    return { key, name, suffix }
  }

  const getBranchesForRouter = (routerStepId: string) => {
    const depth = getRouterStepDepth(routerStepId)
    const suffixes = routerBranchKeys[routerStepId] || ["a", "b"]
    return suffixes.map((s, idx) => {
      const char = String.fromCharCode(65 + idx)
      const meta = getBranchMeta(routerStepId, s, depth)
      return {
        key: meta.key,
        name: branchNames[meta.key] || meta.name,
        suffix: s,
        char,
        index: idx
      }
    })
  }

  const handleAddBranchToRouter = (routerStepId: string) => {
    let nextChar = "a"
    setRouterBranchKeys((prev) => {
      const current = prev[routerStepId] || ["a", "b"]
      const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
      const available = alphabet.find((l) => !current.includes(l)) || String.fromCharCode(97 + current.length)
      nextChar = available
      return {
        ...prev,
        [routerStepId]: [...current, nextChar]
      }
    })
    const depth = getRouterStepDepth(routerStepId)
    const branchMeta = getBranchMeta(routerStepId, nextChar, depth)
    if (stepDrawerOpen) {
      setActiveRouteId(branchMeta.key)
    }
    showToast(`Added new ${branchMeta.name} to Router!`)
  }

  const handleDeleteBranchFromRouter = (routerStepId: string, suffix: string, branchKey: string) => {
    setRouterBranchKeys((prev) => {
      const current = prev[routerStepId] || ["a", "b"]
      return {
        ...prev,
        [routerStepId]: current.filter((s) => s !== suffix)
      }
    })
    if (branchKey === "routeA") {
      setRouteASteps([])
    }
    if (branchKey === "routeB") {
      setRouteBSteps([])
    }
    setBranchSteps((prev) => {
      const next = { ...prev }
      delete next[branchKey]
      Object.keys(next).forEach((k) => {
        if (k.startsWith(branchKey)) delete next[k]
      })
      return next
    })
    if (activeRouteId === branchKey) {
      setActiveRouteId(null)
      setStepDrawerOpen(false)
    }
    showToast("Filter route removed from Router")
  }

  const getBranchConditionsList = (branchKey: string, index: number) => {
    if (branchMultiConditions[branchKey] && branchMultiConditions[branchKey].length > 0) {
      return branchMultiConditions[branchKey]
    }
    const legacy = getBranchCondition(branchKey, index)
    return [{ id: "cond_init", field: legacy.field, op: legacy.op, val: legacy.val, logic: "AND" as const }]
  }

  const handleUpdateBranchConditionRule = (
    branchKey: string,
    ruleId: string,
    fieldKey: "field" | "op" | "val",
    newVal: string,
    index: number
  ) => {
    const currentList = getBranchConditionsList(branchKey, index)
    const updated = currentList.map((r) => (r.id === ruleId ? { ...r, [fieldKey]: newVal } : r))
    setBranchMultiConditions((prev) => ({ ...prev, [branchKey]: updated }))
    if (updated[0]) {
      updateBranchCondition(branchKey, { field: updated[0].field, op: updated[0].op, val: updated[0].val }, index)
    }
  }

  const handleAddConditionToBranch = (branchKey: string, logic: "AND" | "OR", index: number) => {
    const currentList = getBranchConditionsList(branchKey, index)
    const newRule = {
      id: `cond_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      field: "{{step_1.amount}}",
      op: "equals",
      val: "",
      logic
    }
    setBranchMultiConditions((prev) => ({ ...prev, [branchKey]: [...currentList, newRule] }))
  }

  const handleDeleteConditionFromBranch = (branchKey: string, ruleId: string, index: number) => {
    const currentList = getBranchConditionsList(branchKey, index)
    if (currentList.length <= 1) return
    const updated = currentList.filter((r) => r.id !== ruleId)
    setBranchMultiConditions((prev) => ({ ...prev, [branchKey]: updated }))
    if (updated[0]) {
      updateBranchCondition(branchKey, { field: updated[0].field, op: updated[0].op, val: updated[0].val }, index)
    }
  }

  const handleToggleBranchConditionLogic = (branchKey: string, ruleId: string, index: number) => {
    const currentList = getBranchConditionsList(branchKey, index)
    const updated = currentList.map((r) => {
      if (r.id === ruleId) {
        const nextLogic: "AND" | "OR" = (r.logic || "AND") === "AND" ? "OR" : "AND"
        return { ...r, logic: nextLogic }
      }
      return r
    })
    setBranchMultiConditions((prev) => ({ ...prev, [branchKey]: updated }))
  }

  const getFilterConditionsList = (stepId: string) => {
    if (filterStepConditions[stepId] && filterStepConditions[stepId].length > 0) {
      return filterStepConditions[stepId]
    }
    const curVal = selectedStep?.fieldMappings?.["value"] || filterVal || ""
    const curField = selectedStep?.fieldMappings?.["field"] || filterField || "{{step_1.amount}}"
    const curOp = selectedStep?.fieldMappings?.["operator"] || filterOp || "equals"
    return [{ id: "f_init", field: curField, op: curOp, val: curVal, logic: "AND" as const }]
  }

  const handleUpdateFilterConditionRule = (
    stepId: string,
    ruleId: string,
    fieldKey: "field" | "op" | "val",
    newVal: string
  ) => {
    const currentList = getFilterConditionsList(stepId)
    const updated = currentList.map((r) => (r.id === ruleId ? { ...r, [fieldKey]: newVal } : r))
    setFilterStepConditions((prev) => ({ ...prev, [stepId]: updated }))
    if (updated[0]) {
      handleFieldChange("field", updated[0].field)
      handleFieldChange("operator", updated[0].op)
      handleFieldChange("value", updated[0].val)
    }
  }

  const handleAddFilterCondition = (stepId: string, logic: "AND" | "OR") => {
    const currentList = getFilterConditionsList(stepId)
    const newRule = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      field: "{{step_1.amount}}",
      op: "equals",
      val: "",
      logic
    }
    setFilterStepConditions((prev) => ({ ...prev, [stepId]: [...currentList, newRule] }))
  }

  const handleDeleteFilterCondition = (stepId: string, ruleId: string) => {
    const currentList = getFilterConditionsList(stepId)
    if (currentList.length <= 1) return
    const updated = currentList.filter((r) => r.id !== ruleId)
    setFilterStepConditions((prev) => ({ ...prev, [stepId]: updated }))
    if (updated[0]) {
      handleFieldChange("field", updated[0].field)
      handleFieldChange("operator", updated[0].op)
      handleFieldChange("value", updated[0].val)
    }
  }

  const handleToggleFilterConditionLogic = (stepId: string, ruleId: string) => {
    const currentList = getFilterConditionsList(stepId)
    const updated = currentList.map((r) => {
      if (r.id === ruleId) {
        const nextLogic: "AND" | "OR" = (r.logic || "AND") === "AND" ? "OR" : "AND"
        return { ...r, logic: nextLogic }
      }
      return r
    })
    setFilterStepConditions((prev) => ({ ...prev, [stepId]: updated }))
  }

  const [delayDuration, setDelayDuration] = useState("24")
  const [delayUnit, setDelayUnit] = useState("Hours")

  const [textTransformType, setTextTransformType] = useState("split")
  const [textInput, setTextInput] = useState("{{step_1.text}}")
  const [textSeparator, setTextSeparator] = useState(" ")

  const [dateInput, setDateInput] = useState("{{step_1.timestamp}}")
  const [dateToFormat, setDateToFormat] = useState("DD/MM/YYYY HH:mm")

  const [mathExpression, setMathExpression] = useState("{{step_1.amount}} * 1.18")
  const [currencySymbol, setCurrencySymbol] = useState("USD")

  const [apiMethod, setApiMethod] = useState("POST")
  const [apiUrl, setApiUrl] = useState("https://connect.automateworkflows.com/api/v1/sync")
  const [apiBody, setApiBody] = useState('{\n  "lead_name": "{{step_1.user}}",\n  "status": "qualified"\n}')

  const [codeSnippet, setCodeSnippet] = useState(
    '// Access incoming step data via inputData object\nconst total = (inputData.amount || 100) * 1.18;\nreturn { calculatedTotal: total, status: "SUCCESS" };'
  )

  const [lookupKey, setLookupKey] = useState("{{step_1.country}}")
  const [approverEmail, setApproverEmail] = useState("manager@company.com")

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    const step = steps.find((s) => s.id === selectedCommentStep)
    const newComment = {
      id: `comment_${Date.now()}`,
      author: "Himanshu Pundir",
      role: "Product Lead",
      text: newCommentText.trim(),
      time: "Just now",
      stepName: step ? step.appName : "General Canvas"
    }
    setCanvasComments([newComment, ...canvasComments])
    setNewCommentText("")
    showToast("Comment posted to workflow canvas!")
  }

  const handleMoveStep = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= steps.length) return
    const updated = [...steps]
    const [moved] = updated.splice(idx, 1)
    updated.splice(targetIdx, 0, moved)
    const normalized = updated.map((s, i) => ({
      ...s,
      type: (i === 0 ? "trigger" : "action") as "trigger" | "action"
    }))
    setSteps(normalized)
    showToast(`Moved "${moved.appName}" step ${direction}`)
  }

  const handleRestoreRevision = (version: string) => {
    showToast(`Restored workflow state to revision ${version}`)
  }



  // Infinite 2D Canvas Pan & Drag State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isPanningCanvas, setIsPanningCanvas] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Prevent panning when clicking buttons, inputs, links, or dragging step cards
    const target = e.target as HTMLElement
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("a")
    ) {
      return
    }

    setIsPanningCanvas(true)
    setPanStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    })
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanningCanvas) return
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    })
  }

  const handleCanvasMouseUp = () => {
    setIsPanningCanvas(false)
  }

  const handleResetPan = () => {
    setPanOffset({ x: 0, y: 0 })
    setZoomPercent("110%")
  }

  const handleZoomIn = () => {
    const current = parseInt(zoomPercent.replace("%", "")) || 100
    const nextZoom = Math.min(current + 10, 200)
    setZoomPercent(`${nextZoom}%`)
  }

  const handleZoomOut = () => {
    const current = parseInt(zoomPercent.replace("%", "")) || 100
    const nextZoom = Math.max(current - 10, 40)
    setZoomPercent(`${nextZoom}%`)
  }

  const canvasRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const handleNativeWheel = (e: WheelEvent) => {
      // Prevent browser default page zoom completely when scrolling on canvas
      e.preventDefault()
      e.stopPropagation()

      const delta = e.deltaY > 0 ? -10 : 10
      setZoomPercent((prev) => {
        const current = parseInt(prev.replace("%", "")) || 100
        const nextZoom = Math.min(Math.max(current + delta, 40), 200)
        return `${nextZoom}%`
      })
    }

    // { passive: false } allows e.preventDefault() to intercept native browser window zooming
    canvasEl.addEventListener("wheel", handleNativeWheel, { passive: false })

    return () => {
      canvasEl.removeEventListener("wheel", handleNativeWheel)
    }
  }, [])

  const [selectedStepId, setSelectedStepId] = useState<string>(() => {
    if (isNew && !initialAppId) return ""
    return "step_1"
  })
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null)
  const [stepDrawerOpen, setStepDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"setup" | "connections">("setup")
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [appSearchQuery, setAppSearchQuery] = useState("")
  const [responseFormat, setResponseFormat] = useState<"simple" | "advance" | "raw">("simple")

  // Drawer Resizing & Custom Width States
  const [drawerWidth, setDrawerWidth] = useState<number>(640)
  const [isResizingDrawer, setIsResizingDrawer] = useState<boolean>(false)
  const [isDrawerMaximized, setIsDrawerMaximized] = useState<boolean>(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingDrawer) return
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 440), Math.min(window.innerWidth - 60, 960))
      setDrawerWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizingDrawer(false)
    }

    if (isResizingDrawer) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizingDrawer])

  // User Accounts & Dynamic Connections State
  const [userConnections, setUserConnections] = useState<UserConnection[]>([
    ...INITIAL_USER_CONNECTIONS,
    { id: "conn_7", appId: "gmail", appName: "Gmail", accountLabel: "himanshu@company.com", status: "Active", lastUsed: "Just now", authType: "OAuth 2.0" },
    { id: "conn_8", appId: "webhook", appName: "Webhook", accountLabel: "Webhook Default Endpoint", status: "Active", lastUsed: "Just now", authType: "Internal SSO" },
    { id: "conn_9", appId: "api-webhook", appName: "API", accountLabel: "Custom API Client", status: "Active", lastUsed: "Just now", authType: "None" },
    { id: "conn_10", appId: "api", appName: "API", accountLabel: "Custom API Client", status: "Active", lastUsed: "Just now", authType: "None" }
  ])
  const [connectionMode, setConnectionMode] = useState<"existing" | "new">("existing")
  const [newConnLabel, setNewConnLabel] = useState("")
  const [newConnApiKey, setNewConnApiKey] = useState("")
  const [isConnectingAccount, setIsConnectingAccount] = useState(false)

  const selectedStep =
    steps.find((s) => s.id === selectedStepId) ||
    routeASteps.find((s) => s.id === selectedStepId) ||
    routeBSteps.find((s) => s.id === selectedStepId) ||
    Object.values(branchSteps).flat().find((s) => s.id === selectedStepId)
  const activeRoute = selectedStep?.routes?.find((r: any) => r.id === activeRouteId)
  const effectiveAppId = activeRoute ? activeRoute.appId : selectedStep?.appId
  const selectedApp = ALL_AVAILABLE_APPS.find((a) => a.id === effectiveAppId)

  const activeStepConnection = userConnections.find(
    (c) => c.id === selectedStep?.connectionId
  ) || (selectedApp?.authType === "Internal SSO" ? userConnections.find((c) => c.appId === (effectiveAppId || selectedStep?.appId)) : undefined)
  const isStepConnected = !!activeStepConnection || selectedApp?.authType === "Internal SSO"
  const isTriggerStep = selectedStep?.type === "trigger" || selectedStepId === steps[0]?.id
  const isUIWebhookTrigger = isTriggerStep && isUIWebhookApp(effectiveAppId || selectedStep?.appId)

  const isAuthOptionalApp = [
    "scheduler", "filter", "router", "delay", "iterator",
    "text-formatter", "datetime-formatter", "number-formatter",
    "api-webhook", "api", "code-runner", "lookup-table", "human-approval",
    "webhook-catch", "http-request", "webhook"
  ].includes(effectiveAppId || "") || isUIWebhookTrigger

  const isStepReadyForConfig = isStepConnected || isAuthOptionalApp

  const currentTargetedBranch = React.useMemo(() => {
    if (!selectedStep || selectedStep.appId !== "router" || !activeRouteId) return null
    const branches = getBranchesForRouter(selectedStep.id)
    const exact = branches.find((b) => b.key === activeRouteId)
    if (exact) return exact

    for (const b of branches) {
      if (
        b.suffix === activeRouteId ||
        (activeRouteId === "rt_1" && b.suffix === "a" && steps.some((s) => s.id === selectedStep.id)) ||
        (activeRouteId === "rt_2" && b.suffix === "b" && steps.some((s) => s.id === selectedStep.id)) ||
        b.name.toLowerCase() === activeRouteId.toLowerCase() ||
        `Route ${b.char}`.toLowerCase() === activeRouteId.toLowerCase() ||
        (activeRouteId.includes("_") && b.key.endsWith(activeRouteId.split("_").slice(-2).join("_")))
      ) {
        return b
      }
    }
    return null
  }, [selectedStep, activeRouteId, routerBranchKeys, branchNames, branchSteps, steps, routeASteps, routeBSteps])

  const priorVariablesList: PriorVariableOption[] = React.useMemo(() => {
    if (!selectedStep) return []
    const currentStepIndex = steps.findIndex((s) => s.id === selectedStep.id)
    const priorSteps = currentStepIndex > 0 ? steps.slice(0, currentStepIndex) : steps.slice(0, 1)

    const vars: PriorVariableOption[] = []
    priorSteps.forEach((step, idx) => {
      const stepNumber = idx + 1
      const sampleData =
        step.testOutput ||
        DEFAULT_SAMPLE_DATA[step.appId] ||
        APP_SCHEMAS_MAP[step.appId]?.sampleOutput || {
          id: `sample_${step.id}`,
          name: "Test Customer",
          email: "sample@domain.com",
          amount: "500",
          status: "PAID"
        }
      Object.entries(sampleData).forEach(([k, v]) => {
        const label = k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        const sampleValue = typeof v === "object" ? JSON.stringify(v) : String(v)
        vars.push({
          token: `{{step_${stepNumber}.${k}}}`,
          label,
          stepNumber,
          appName: step.appName,
          sampleValue
        })
      })
    })
    return vars
  }, [selectedStep, steps])

  // Dynamic Action Fields & Variable Engine State
  const [variablePickerOpen, setVariablePickerOpen] = useState(false)
  const [approvalPreviewOpen, setApprovalPreviewOpen] = useState(false)

  const handleSendPreviewMessage = (overrideEmail?: string) => {
    if (!selectedStep) return
    const curEmail = overrideEmail || selectedStep.fieldMappings?.["approver_email"] || ""
    const approveLabel = selectedStep.fieldMappings?.["approve_button_label"] || "Approve"
    const rejectLabel = selectedStep.fieldMappings?.["reject_button_label"] || "Reject"

    if (!curEmail) {
      setApprovalPreviewOpen(true)
      showToast("Please specify an approver email or test recipient to send preview", "info")
      return
    }

    showToast(
      `Preview approval email sent to ${curEmail} with buttons: "${approveLabel}" and "${rejectLabel}"`,
      "success"
    )
  }

  const [activeFieldForPicker, setActiveFieldForPicker] = useState<string | null>(null)
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null)
  const [fieldMapModes, setFieldMapModes] = useState<Record<string, boolean>>({})
  const [customParams, setCustomParams] = useState<Record<string, { id: string; key: string; value: string }[]>>({})
  const [isTestingAction, setIsTestingAction] = useState(false)
  const [testResponseModalOpen, setTestResponseModalOpen] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: number
    statusText: string
    latencyMs: number
    timestamp: string
    payload: any
    outputFields: Record<string, any>
  } | null>(null)
  const [testResultView, setTestResultView] = useState<"simple" | "advance">("simple")

  const webhookUrl = "https://connect.automateworkflows.com/webhook-listener/webhook/lji1J3NjFwNTZmMDYzTAlmMzY1MjE1MjM3"

  // Webhook Simulation & State
  const [webhookListening, setWebhookListening] = useState<Record<string, boolean>>({})
  const [webhookCapturedData, setWebhookCapturedData] = useState<Record<string, Record<string, any>>>({})
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false)
  const [webhookSimpleResponse, setWebhookSimpleResponse] = useState<Record<string, "yes" | "no">>({})

  const handleSimulateWebhookPayload = (stepId: string) => {
    const targetStep = steps.find((s) => s.id === stepId) || selectedStep
    const targetAppId = effectiveAppId || targetStep?.appId
    const targetEventId = targetStep?.eventId
    const eventGuide = getWebhookEventGuide(targetAppId, targetEventId)

    setIsSimulatingWebhook(true)
    setTimeout(() => {
      let mockPayload: Record<string, any> = eventGuide?.samplePayload
        ? JSON.parse(JSON.stringify(eventGuide.samplePayload))
        : {
            event_id: `evt_live_${Math.floor(100000 + Math.random() * 900000)}`,
            event_type: targetEventId || "checkout.session.completed",
            timestamp: new Date().toISOString(),
            customer_name: "Alex Johnson",
            customer_email: "alex.johnson@example.com",
            customer_phone: "+1 (555) 234-5678",
            order_id: `ord_${Math.floor(10000 + Math.random() * 90000)}`,
            order_amount: 149.50,
            currency: "USD",
            payment_status: "PAID",
            source_channel: "Direct Webhook",
            shipping_city: "San Francisco",
            line_items_count: 2
          }

      // If simple response is enabled, flatten nested objects
      const isSimple = (selectedStep?.fieldMappings?.simple_response || webhookSimpleResponse[stepId] || "yes") === "yes"
      if (isSimple) {
        const flattened: Record<string, any> = {}
        const flatten = (obj: any, prefix = "") => {
          Object.entries(obj).forEach(([k, v]) => {
            const newKey = prefix ? `${prefix}_${k}` : k
            if (v && typeof v === "object" && !Array.isArray(v)) {
              flatten(v, newKey)
            } else if (Array.isArray(v)) {
              flattened[newKey] = JSON.stringify(v)
            } else {
              flattened[newKey] = v
            }
          })
        }
        flatten(mockPayload)
        mockPayload = flattened
      }

      setWebhookCapturedData((prev) => ({ ...prev, [stepId]: mockPayload }))
      setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, testOutput: mockPayload, status: "configured" } : s)))
      setIsSimulatingWebhook(false)
      showToast(`${targetStep?.appName || "Webhook"} test payload captured successfully!`)
    }, 600)
  }

  const handleRecaptureWebhook = (stepId: string) => {
    setWebhookCapturedData((prev) => {
      const copy = { ...prev }
      delete copy[stepId]
      return copy
    })
    setWebhookListening((prev) => ({ ...prev, [stepId]: true }))
    showToast("Listening for incoming webhook response...")
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  const handleCopyNode = (step: WorkflowStep) => {
    if (step.appId === "router") {
      showToast("Router Node can only be added at the end of the workflow.", "warning")
      return
    }
    if (steps.some((s) => s.appId === "router")) {
      showToast("Cannot add steps after Router node in the main workflow.", "warning")
      return
    }
    setCopiedTooltipId(step.id)
    const clonedStep: WorkflowStep = {
      ...step,
      id: `step_${Date.now()}`,
      eventName: `${step.eventName} (Copy)`,
      isNewStep: false
    }
    setSteps([...steps, clonedStep])
    setTimeout(() => setCopiedTooltipId(null), 1500)
  }

  const handleStartAddTrigger = () => {
    let triggerStep = steps.find((s) => s.id === "step_1" || s.type === "trigger")
    if (!triggerStep) {
      triggerStep = {
        id: "step_1",
        type: "trigger",
        appId: "",
        appName: "Select Trigger App",
        eventId: "",
        eventName: "Choose Trigger Event",
        status: "unmapped",
        fieldMappings: {},
        isNewStep: true
      }
      setSteps([triggerStep])
    }
    setSelectedStepId(triggerStep.id)
    setActiveRouteId(null)
    setActiveTab("setup")
    setDrawerStep("app_select")
    setIsDrawerMaximized(false)
    setStepDrawerOpen(true)
  }



  const handleInsertStepAfter = (index: number, isNewEndStep = false) => {
    // Prevent adding any step after a Router node in the main workflow
    if (steps.some((s) => s.appId === "router")) {
      showToast("Router Node is already at the end of the main workflow. Add action steps inside Route branches.", "warning")
      return
    }

    const newStepId = `step_${Date.now()}`
    const newStep: WorkflowStep = {
      id: newStepId,
      type: "action",
      appId: "",
      appName: "Select Action App",
      eventId: "",
      eventName: "Choose Action Event",
      status: "unmapped",
      fieldMappings: {},
      isNewStep: true
    }
    const updated = [...steps]
    updated.splice(index + 1, 0, newStep)
    setSteps(updated)
    setSelectedStepId(newStepId)
    setActiveRouteId(null)
    setActiveTab("setup")
    setDrawerStep("app_select")
    setIsDrawerMaximized(false)
    setStepDrawerOpen(true)
    showToast("Added new action step. Select an app from the catalog.")
  }



  // Drawer 2-Step Wizard State ("app_select" -> "setup_details")
  const [drawerStep, setDrawerStep] = useState<"app_select" | "setup_details">("app_select")

  // Helper to update selected step regardless of where it resides in the tree
  const updateSelectedStep = (updater: (s: WorkflowStep) => WorkflowStep) => {
    if (steps.some((s) => s.id === selectedStepId)) {
      setSteps(steps.map((s) => (s.id === selectedStepId ? updater(s) : s)))
    } else if (routeASteps.some((s) => s.id === selectedStepId)) {
      setRouteASteps(routeASteps.map((s) => (s.id === selectedStepId ? updater(s) : s)))
    } else if (routeBSteps.some((s) => s.id === selectedStepId)) {
      setRouteBSteps(routeBSteps.map((s) => (s.id === selectedStepId ? updater(s) : s)))
    } else {
      // Search through all branch step collections
      for (const branchKey of Object.keys(branchSteps)) {
        if (branchSteps[branchKey].some((s) => s.id === selectedStepId)) {
          setBranchSteps(prev => ({
            ...prev,
            [branchKey]: prev[branchKey].map((s) => (s.id === selectedStepId ? updater(s) : s))
          }))
          break
        }
      }
    }
  }

  // Auto-link existing or native connection if not yet explicitly selected
  useEffect(() => {
    if (selectedStep && !selectedStep.connectionId && effectiveAppId) {
      const matching = userConnections.find((c) => c.appId === effectiveAppId)
      if (matching) {
        updateSelectedStep((s) => ({ ...s, connectionId: matching.id }))
      }
    }
  }, [selectedStep?.id, effectiveAppId, userConnections])

  const handleFieldChange = (fieldId: string, val: string) => {
    let updatedEventId = selectedStep?.eventId
    let updatedEventName = selectedStep?.eventName

    if (selectedStep?.appId === "text-formatter" && fieldId === "transform_type") {
      if (val === "truncate") {
        updatedEventId = "truncate_text"
        updatedEventName = "Truncate Character Length (...)"
      } else if (val.startsWith("extract")) {
        updatedEventId = "extract_email_url"
        updatedEventName = "Extract Email, URL or Phone Number"
      } else if (val === "change_case") {
        updatedEventId = "change_case"
        updatedEventName = "Transform Casing (UPPER/lower/Title)"
      } else if (val === "find_replace") {
        updatedEventId = "find_replace"
        updatedEventName = "Find & Replace Text"
      } else if (val === "split") {
        updatedEventId = "split_text"
        updatedEventName = "Split Text String"
      }
    } else if (selectedStep?.appId === "datetime-formatter" && fieldId === "date_operation") {
      if (val === "add_subtract_time") {
        updatedEventId = "add_subtract_time"
        updatedEventName = "Add / Subtract Time (Hours/Days)"
      } else if (val === "time_difference") {
        updatedEventId = "time_difference"
        updatedEventName = "Calculate Time Difference"
      } else if (val === "current_timestamp") {
        updatedEventId = "current_timestamp"
        updatedEventName = "Generate Current Unix/ISO Timestamp"
      } else {
        updatedEventId = "format_date"
        updatedEventName = "Format Timestamp & Timezone"
      }
    } else if (selectedStep?.appId === "number-formatter" && fieldId === "number_operation") {
      if (val === "spreadsheet") {
        updatedEventId = "spreadsheet_formulas"
        updatedEventName = "Spreadsheet Formulas (Excel / Google Sheets Style)"
      } else if (val === "currency") {
        updatedEventId = "format_currency"
        updatedEventName = "Format Currency / Number ($ / ₹ / €)"
      } else if (val === "round") {
        updatedEventId = "round_number"
        updatedEventName = "Round Up / Round Down Precision"
      } else if (val === "random") {
        updatedEventId = "random_number"
        updatedEventName = "Generate Random Number / OTP"
      } else {
        updatedEventId = "math_operation"
        updatedEventName = "Math Formula Calculation (+, -, *, /)"
      }
    } else if (selectedStep?.appId === "delay" && fieldId === "delay_type") {
      if (val === "delay_until") {
        updatedEventId = "delay_until"
        updatedEventName = "Delay Until (Specific Timestamp)"
      } else if (val === "rate_limiter") {
        updatedEventId = "rate_limiter"
        updatedEventName = "Rate Limiter Queue (Throttle)"
      } else {
        updatedEventId = "delay_for"
        updatedEventName = "Delay For (Duration)"
      }
    }

    updateSelectedStep((s) => ({
      ...s,
      eventId: updatedEventId || s.eventId,
      eventName: updatedEventName || s.eventName,
      fieldMappings: {
        ...(s.fieldMappings || {}),
        [fieldId]: val
      }
    }))
  }

  const openVariablePickerForField = (fieldId: string) => {
    setActiveFieldForPicker(fieldId)
    setFocusedFieldId(fieldId)
    setVariablePickerOpen(true)
  }

  const handleSelectVariable = (token: string) => {
    if (pickerConditionTarget) {
      const { type, key, ruleId, targetField = "val", branchIndex = 0 } = pickerConditionTarget
      if (type === "branch") {
        if (targetField === "field") {
          handleUpdateBranchConditionRule(key, ruleId, "field", token, branchIndex)
          showToast(`Selected condition label: ${token}`)
        } else {
          const currentList = getBranchConditionsList(key, branchIndex)
          const target = currentList.find((r) => r.id === ruleId) || currentList[0]
          if (target) {
            const currentVal = target.val || ""
            const newVal = currentVal ? `${currentVal} ${token}` : token
            handleUpdateBranchConditionRule(key, target.id, "val", newVal, branchIndex)
          }
          showToast(`Mapped variable ${token}`)
        }
      } else if (type === "filter") {
        if (targetField === "field") {
          handleUpdateFilterConditionRule(key, ruleId, "field", token)
          showToast(`Selected filter label: ${token}`)
        } else {
          const currentList = getFilterConditionsList(key)
          const target = currentList.find((r) => r.id === ruleId) || currentList[0]
          if (target) {
            const currentVal = target.val || ""
            const newVal = currentVal ? `${currentVal} ${token}` : token
            handleUpdateFilterConditionRule(key, target.id, "val", newVal)
          }
          showToast(`Mapped variable ${token}`)
        }
      }
      setPickerConditionTarget(null)
      return
    }

    if (!activeFieldForPicker || !selectedStep) return
    const isCustomParam = activeFieldForPicker.startsWith("param_")
    if (isCustomParam) {
      setCustomParams((prev) => ({
        ...prev,
        [selectedStep.id]: (prev[selectedStep.id] || []).map((p) => {
          if (p.id === activeFieldForPicker) {
            const currentVal = p.value || ""
            const newVal = currentVal ? `${currentVal} ${token}` : token
            return { ...p, value: newVal }
          }
          return p
        })
      }))
    } else {
      const currentVal = selectedStep.fieldMappings?.[activeFieldForPicker] || ""
      const newVal = currentVal ? `${currentVal} ${token}` : token
      handleFieldChange(activeFieldForPicker, newVal)
    }
    showToast(`Mapped variable ${token}`)
  }

  useEffect(() => {
    const handleGlobalSlashKey = (e: KeyboardEvent) => {
      if (variablePickerOpen || testResponseModalOpen || e.ctrlKey || e.altKey || e.metaKey) return
      
      if (e.key === "/" && stepDrawerOpen && activeTab === "connections" && selectedStep) {
        const target = e.target as HTMLElement | null
        const isAlreadyInField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
        if (!isAlreadyInField) {
          e.preventDefault()
          const schema = getAppActionSchema(effectiveAppId || selectedStep.appId, selectedStep.eventId, selectedStep.eventName, selectedStep.fieldMappings)
          const targetField = focusedFieldId || schema?.fields?.find((f) => f.supportsMapping)?.id
          if (targetField) {
            openVariablePickerForField(targetField)
          }
        }
      }
    }

    window.addEventListener("keydown", handleGlobalSlashKey)
    return () => window.removeEventListener("keydown", handleGlobalSlashKey)
  }, [stepDrawerOpen, activeTab, variablePickerOpen, testResponseModalOpen, focusedFieldId, selectedStep, effectiveAppId])

  useEffect(() => {
    if (selectedStep && selectedStep.customParameters && !customParams[selectedStep.id]) {
      setCustomParams((prev) => ({
        ...prev,
        [selectedStep.id]: selectedStep.customParameters || []
      }))
    }
  }, [selectedStepId, selectedStep])

  const toggleFieldMapMode = (fieldId: string) => {
    setFieldMapModes((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }))
  }

  const handleAddCustomParam = (stepId: string) => {
    const newParam = { id: `param_${Date.now()}`, key: "", value: "" }
    setCustomParams((prev) => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), newParam]
    }))
  }

  const handleUpdateCustomParam = (stepId: string, paramId: string, field: "key" | "value", val: string) => {
    setCustomParams((prev) => ({
      ...prev,
      [stepId]: (prev[stepId] || []).map((p) => (p.id === paramId ? { ...p, [field]: val } : p))
    }))
  }

  const handleDeleteCustomParam = (stepId: string, paramId: string) => {
    setCustomParams((prev) => ({
      ...prev,
      [stepId]: (prev[stepId] || []).filter((p) => p.id !== paramId)
    }))
  }

  const handleRunTestAction = () => {
    if (!selectedStep) return
    setIsTestingAction(true)
    setTimeout(() => {
      setIsTestingAction(false)
      const schema = getAppActionSchema(effectiveAppId || selectedStep.appId, selectedStep.eventId, selectedStep.eventName, selectedStep.fieldMappings)
      let sampleOutput = schema.sampleOutput || {
        status: "SUCCESS",
        id: `gen_${Date.now()}`,
        timestamp: new Date().toISOString()
      }

      // Dynamic Evaluation for Number Formatter Spreadsheet Formulas
      if (
        selectedStep.appId === "number-formatter" &&
        (selectedStep.eventId === "spreadsheet_formulas" || selectedStep.fieldMappings?.number_operation === "spreadsheet")
      ) {
        const rawFormula = (selectedStep.fieldMappings?.formula || "=SUM(1100, 150)").trim()
        let evaluatedResult: any = 1250
        try {
          // Replace dynamic tokens like {{step_1.amount}} with realistic sample numbers
          let cleanExpr = rawFormula.replace(/\{\{[^}]+\}\}/g, "1000").trim()
          if (cleanExpr.startsWith("=")) cleanExpr = cleanExpr.substring(1).trim()

          if (/^SUM\((.+)\)$/i.test(cleanExpr)) {
            const inner = cleanExpr.match(/^SUM\((.+)\)$/i)?.[1] || ""
            const nums = inner.split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n))
            evaluatedResult = nums.reduce((a, b) => a + b, 0)
          } else if (/^AVERAGE\((.+)\)$/i.test(cleanExpr)) {
            const inner = cleanExpr.match(/^AVERAGE\((.+)\)$/i)?.[1] || ""
            const nums = inner.split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n))
            evaluatedResult = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
          } else if (/^ROUND\((.+),?\s*(\d+)?\)$/i.test(cleanExpr)) {
            const m = cleanExpr.match(/^ROUND\(([^,]+),?\s*(\d+)?\)$/i)
            const num = parseFloat(m?.[1] || "0")
            const decimals = parseInt(m?.[2] || "0")
            evaluatedResult = Number(num.toFixed(decimals))
          } else if (/^RANDBETWEEN\((.+),(.+)\)$/i.test(cleanExpr)) {
            const m = cleanExpr.match(/^RANDBETWEEN\((.+),(.+)\)$/i)
            const min = parseInt(m?.[1] || "1000")
            const max = parseInt(m?.[2] || "9999")
            evaluatedResult = Math.floor(Math.random() * (max - min + 1)) + min
          } else if (/^DAYS\((.+),(.+)\)$/i.test(cleanExpr)) {
            evaluatedResult = 30
          } else if (/^IF\((.+)\)$/i.test(cleanExpr)) {
            evaluatedResult = "Qualified (High Value)"
          } else {
            const mathSafe = cleanExpr.replace(/[^0-9+\-*/().]/g, "")
            if (mathSafe) {
              evaluatedResult = Function(`"use strict"; return (${mathSafe})`)()
            }
          }
        } catch {
          evaluatedResult = 1250
        }
        sampleOutput = {
          result: evaluatedResult,
          formula: rawFormula,
          is_valid: true,
          status: "SUCCESS"
        }
      }

      // Dynamic Evaluation for Number Formatter Format Currency
      if (
        selectedStep.appId === "number-formatter" &&
        (selectedStep.eventId === "format_currency" || selectedStep.fieldMappings?.number_operation === "currency")
      ) {
        const rawAmount = selectedStep.fieldMappings?.amount || "4000"
        const numVal = parseFloat(String(rawAmount).replace(/[^0-9.-]/g, "")) || 4000
        const code = (selectedStep.fieldMappings?.currency_code || "USD").trim().toUpperCase()
        const locale = selectedStep.fieldMappings?.currency_locale || "en-US"
        const formatPattern = selectedStep.fieldMappings?.currency_format || "¤#,##0.00"

        const formatted = formatCurrencyWithPattern(numVal, locale, code, formatPattern)

        sampleOutput = {
          formatted_currency: formatted,
          amount: numVal,
          currency_code: code,
          currency_locale: locale,
          currency_format: formatPattern,
          raw_number: numVal,
          status: "SUCCESS"
        }
      }

      const curStepParams = customParams[selectedStep.id] || selectedStep.customParameters || []
      const mergedPayload: Record<string, any> = { ...(selectedStep.fieldMappings || {}) }
      if (curStepParams.length > 0) {
        curStepParams.forEach((p) => {
          if (p.key) mergedPayload[p.key] = p.value
        })
      }

      updateSelectedStep((s) => ({
        ...s,
        testOutput: sampleOutput,
        status: "configured",
        customParameters: curStepParams
      }))

      setTestResult({
        status: 200,
        statusText: "OK",
        latencyMs: Math.floor(Math.random() * 80) + 120,
        timestamp: new Date().toLocaleTimeString(),
        payload: mergedPayload,
        outputFields: sampleOutput
      })
      setTestResponseModalOpen(true)
      showToast(`Test request successful (200 OK)! Output variables saved.`)
    }, 450)
  }

  const formatCurrencyWithPattern = (
    numVal: number,
    locale: string = "en-US",
    code: string = "USD",
    pattern: string = "¤#,##0.00"
  ): string => {
    const isNegative = numVal < 0
    const absVal = Math.abs(numVal)

    // Check grouping
    const useGrouping = pattern.includes(",")

    // Check decimals
    let minDecimals = 0
    let maxDecimals = 0
    if (pattern.includes(".000")) {
      minDecimals = 3
      maxDecimals = 3
    } else if (pattern.includes(".00")) {
      minDecimals = 2
      maxDecimals = 2
    } else if (pattern.includes(".##")) {
      minDecimals = absVal % 1 !== 0 ? 1 : 0
      maxDecimals = 2
    } else {
      minDecimals = 0
      maxDecimals = 0
    }

    let numStr = ""
    try {
      numStr = new Intl.NumberFormat(locale, {
        useGrouping,
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals
      }).format(absVal)
    } catch {
      numStr = useGrouping ? absVal.toLocaleString() : String(absVal)
    }

    // Determine currency symbol
    let symbol = "$"
    try {
      const parts = new Intl.NumberFormat(locale, { style: "currency", currency: code }).formatToParts(1)
      symbol = parts.find((p) => p.type === "currency")?.value || code
    } catch {
      symbol = code
    }

    let formatted = ""
    if (pattern.includes("¤¤")) {
      // 3-Letter ISO Code
      if (pattern.startsWith("¤¤")) {
        const hasSpace = pattern.startsWith("¤¤ ")
        formatted = `${code}${hasSpace ? " " : ""}${numStr}`
      } else {
        const hasSpace = pattern.includes(" ¤¤")
        formatted = `${numStr}${hasSpace ? " " : ""}${code}`
      }
    } else if (pattern.includes("¤")) {
      // Currency Symbol
      if (pattern.startsWith("¤")) {
        const hasSpace = pattern.startsWith("¤ ")
        formatted = `${symbol}${hasSpace ? " " : ""}${numStr}`
      } else {
        const hasSpace = pattern.includes(" ¤")
        formatted = `${numStr}${hasSpace ? " " : ""}${symbol}`
      }
    } else {
      // No symbol
      formatted = numStr
    }

    if (isNegative) {
      if (pattern.includes(";(")) {
        return `(${formatted})`
      }
      return `-${formatted}`
    }
    return formatted
  }

  const getLiveCurrencyPreview = () => {
    if (!selectedStep) return "$4,000.00"
    const rawAmount = selectedStep.fieldMappings?.amount || "4000"
    const numVal = parseFloat(String(rawAmount).replace(/[^0-9.-]/g, "")) || 4000
    const code = (selectedStep.fieldMappings?.currency_code || "USD").trim().toUpperCase()
    const locale = selectedStep.fieldMappings?.currency_locale || "en-US"
    const formatPattern = selectedStep.fieldMappings?.currency_format || "¤#,##0.00"

    return formatCurrencyWithPattern(numVal, locale, code, formatPattern)
  }

  const renderActionFieldsBlock = () => {
    if (!selectedStep) return null
    const currentSchema = getAppActionSchema(effectiveAppId || selectedStep.appId, selectedStep.eventId, selectedStep.eventName, selectedStep.fieldMappings)
    const isRouter = selectedStep.appId === "router"
    const isFilter = selectedStep.appId === "filter"
    const isWebhookTrigger =
      ((effectiveAppId === "webhook" || effectiveAppId === "webhook-catch" || selectedStep.appId === "webhook" || selectedStep.appId === "webhook-catch") &&
        selectedStep.eventId !== "custom_webhook_response") ||
      (isTriggerStep && isUIWebhookApp(effectiveAppId || selectedStep.appId))

    const missingRequiredFields = isRouter
      ? []
      : isFilter
      ? (getFilterConditionsList(selectedStep.id).some((c) => !c.val) ? ["Filter Value"] : [])
      : isWebhookTrigger
      ? []
      : currentSchema.fields.filter((f) => {
          if (!f.required) return false
          const val = selectedStep.fieldMappings?.[f.id]
          return !val || String(val).trim() === ""
        })

    const currentCustomParams = customParams[selectedStep.id] || []

    const routerBranchesList = isRouter ? getBranchesForRouter(selectedStep.id) : []

    const targetedBranch = (isRouter && activeRouteId)
      ? routerBranchesList.find((b) => b.key === activeRouteId) ||
        routerBranchesList.find((b) =>
          b.suffix === activeRouteId ||
          (activeRouteId === "rt_1" && b.suffix === "a" && steps.some((s) => s.id === selectedStep.id)) ||
          (activeRouteId === "rt_2" && b.suffix === "b" && steps.some((s) => s.id === selectedStep.id)) ||
          b.name.toLowerCase() === activeRouteId.toLowerCase() ||
          `Route ${b.char}`.toLowerCase() === activeRouteId.toLowerCase() ||
          (activeRouteId.includes("_") && b.key.endsWith(activeRouteId.split("_").slice(-2).join("_")))
        ) || null
      : null

    const branchesToRender = targetedBranch ? [targetedBranch] : routerBranchesList

    const filterConditionsList = getFilterConditionsList(selectedStep.id)

    return (
      <div className="space-y-5">
        {/* Top Toolbar: Status Validation Badge, Connected Account Tag, and Refresh Fields */}
        {!targetedBranch && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl">
            <div className="flex items-center space-x-2">
              {missingRequiredFields.length > 0 ? (
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span>{missingRequiredFields.length} Required Field{missingRequiredFields.length > 1 ? "s" : ""} Missing</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>All Required Fields Configured</span>
                </span>
              )}

              {activeStepConnection && (
                <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                  Account: <strong className="ml-1 text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{activeStepConnection.accountLabel}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => showToast("Dynamic action schema refreshed!")}
                className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 h-7 space-x-1 cursor-pointer shadow-none"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh Fields</span>
              </Button>
            </div>
          </div>
        )}

        {/* Dynamic Action Fields Section */}
        {isRouter ? (
          /* Multi-Branch Router Manager (Filters to clicked branch node if targeted) */
          <div className="space-y-4">
            {/* Top Route Navigation Switcher & Add Branch (Shown only when viewing all routes) */}
            {!targetedBranch && (
              <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                  {routerBranchesList.map((branch) => {
                    const isCurrent = activeRouteId === branch.key
                    return (
                      <button
                        key={branch.key}
                        type="button"
                        onClick={() => setActiveRouteId(branch.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                          isCurrent
                            ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                        <span>Route {branch.char}</span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setActiveRouteId(null)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !targetedBranch
                        ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700"
                    }`}
                  >
                    All Routes
                  </button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddBranchToRouter(selectedStep.id)}
                  className="h-7 px-2.5 text-xs font-bold space-x-1 shrink-0 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer shadow-none"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="hidden sm:inline">Add Branch</span>
                </Button>
              </div>
            )}

            {!targetedBranch && (
              <div className="flex items-center justify-between px-0.5">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block">
                    Multi-Branch Router ({routerBranchesList.length} Routes)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Diverge execution into conditional paths with custom filter criteria
                  </span>
                </div>
              </div>
            )}

            {/* List of Branch Cards (Shows ONLY targeted branch or all routes) */}
            <div className="space-y-3.5">
              {branchesToRender.map((branch) => {
                const bIdx = branch.index
                const conditions = getBranchConditionsList(branch.key, bIdx)
                const branchName = branchNames[branch.key] || branch.name
                const branchStepsList = getBranchSteps(branch.key)

                return (
                  <div
                    key={branch.key}
                    className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs transition-all"
                  >
                    {/* Branch Title Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
                        <Badge className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 shrink-0 shadow-2xs">
                          {branch.name}
                        </Badge>
                        <input
                          type="text"
                          value={branchName}
                          onChange={(e) => {
                            const val = e.target.value
                            setBranchNames((prev) => ({ ...prev, [branch.key]: val }))
                          }}
                          placeholder={`${branch.name} Name`}
                          className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none px-2 py-1 rounded-lg transition-all flex-1 min-w-0"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                          {branchStepsList.length} action{branchStepsList.length === 1 ? "" : "s"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => requestDeleteBranch(selectedStep.id, branch.suffix, branch.key, branch.name)}
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                          title={`Delete ${branch.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Condition Rows */}
                    <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {conditions.map((cond, cIdx) => (
                        <React.Fragment key={cond.id}>
                          {cIdx > 0 && (
                            <div className="flex items-center justify-center gap-2 py-2 my-0.5">
                              <div
                                className={`h-px flex-1 ${
                                  cond.logic === "OR"
                                    ? "bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-purple-400 dark:to-purple-600"
                                    : "bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-blue-400 dark:to-blue-600"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleToggleBranchConditionLogic(branch.key, cond.id, bIdx)}
                                title="Click to toggle between AND and OR logic"
                                className={`group inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer select-none ${
                                  cond.logic === "OR"
                                    ? "bg-purple-600 hover:bg-purple-700 text-white ring-4 ring-purple-100 dark:ring-purple-950 active:scale-95"
                                    : "bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-100 dark:ring-blue-950 active:scale-95"
                                }`}
                              >
                                <span>{cond.logic || "AND"}</span>
                                <ArrowLeftRight className="h-2.5 w-2.5 opacity-80 group-hover:opacity-100 group-hover:rotate-180 transition-transform duration-300" />
                              </button>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shadow-2xs hidden sm:inline-flex items-center tracking-wide ${
                                  cond.logic === "OR"
                                    ? "text-purple-700 dark:text-purple-300 bg-purple-50/90 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800"
                                    : "text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800"
                                }`}
                              >
                                {cond.logic === "OR" ? "either can match" : "all must match"}
                              </span>
                              <div
                                className={`h-px flex-1 ${
                                  cond.logic === "OR"
                                    ? "bg-gradient-to-l from-transparent via-purple-300 dark:via-purple-700 to-purple-400 dark:to-purple-600"
                                    : "bg-gradient-to-l from-transparent via-blue-300 dark:via-blue-700 to-blue-400 dark:to-blue-600"
                                }`}
                              />
                            </div>
                          )}
                          <ConditionRow
                            field={cond.field}
                            operator={cond.op}
                            value={cond.val}
                            priorVariables={priorVariablesList}
                            onFieldChange={(f) => handleUpdateBranchConditionRule(branch.key, cond.id, "field", f, bIdx)}
                            onOperatorChange={(op) => handleUpdateBranchConditionRule(branch.key, cond.id, "op", op, bIdx)}
                            onValueChange={(val) => handleUpdateBranchConditionRule(branch.key, cond.id, "val", val, bIdx)}
                            onDelete={conditions.length > 1 ? () => handleDeleteConditionFromBranch(branch.key, cond.id, bIdx) : undefined}
                            onOpenLabelPicker={() => {
                              setPickerConditionTarget({ type: "branch", key: branch.key, ruleId: cond.id, targetField: "field", branchIndex: bIdx })
                              setActiveFieldForPicker(`cond_${cond.id}_field`)
                              setVariablePickerOpen(true)
                            }}
                            onOpenVariablePicker={() => {
                              setPickerConditionTarget({ type: "branch", key: branch.key, ruleId: cond.id, targetField: "val", branchIndex: bIdx })
                              setActiveFieldForPicker(`cond_${cond.id}_val`)
                              setVariablePickerOpen(true)
                            }}
                          />
                        </React.Fragment>
                      ))}

                      {/* Add Condition Buttons */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddConditionToBranch(branch.key, "AND", bIdx)}
                          className="h-7 px-3 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>AND Condition</span>
                          <span className="text-[9px] text-blue-500/90 dark:text-blue-400/80 font-normal">(all match)</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddConditionToBranch(branch.key, "OR", bIdx)}
                          className="h-7 px-3 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/50 hover:bg-purple-100/80 dark:hover:bg-purple-900/60 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 rounded-lg cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <span>OR Condition</span>
                          <span className="text-[9px] text-purple-500/90 dark:text-purple-400/80 font-normal">(any match)</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Actions */}
            {!targetedBranch && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddBranchToRouter(selectedStep.id)}
                className="w-full h-10 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Add Another Route / Branch</span>
              </Button>
            )}
          </div>
        ) : isFilter ? (
          /* Standalone Filter Step Condition Builder (Image 2 style) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block">
                  Filter Rule Criteria ({filterConditionsList.length})
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Execution continues only if these conditional rules match
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
              {filterConditionsList.map((cond, cIdx) => (
                <React.Fragment key={cond.id}>
                  {cIdx > 0 && (
                    <div className="flex items-center justify-center gap-2 py-2 my-0.5">
                      <div
                        className={`h-px flex-1 ${
                          cond.logic === "OR"
                            ? "bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-purple-400 dark:to-purple-600"
                            : "bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-blue-400 dark:to-blue-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleFilterConditionLogic(selectedStep.id, cond.id)}
                        title="Click to toggle between AND and OR logic"
                        className={`group inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer select-none ${
                          cond.logic === "OR"
                            ? "bg-purple-600 hover:bg-purple-700 text-white ring-4 ring-purple-100 dark:ring-purple-950 active:scale-95"
                            : "bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-100 dark:ring-blue-950 active:scale-95"
                        }`}
                      >
                        <span>{cond.logic || "AND"}</span>
                        <ArrowLeftRight className="h-2.5 w-2.5 opacity-80 group-hover:opacity-100 group-hover:rotate-180 transition-transform duration-300" />
                      </button>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shadow-2xs hidden sm:inline-flex items-center tracking-wide ${
                          cond.logic === "OR"
                            ? "text-purple-700 dark:text-purple-300 bg-purple-50/90 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800"
                            : "text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {cond.logic === "OR" ? "either can match" : "all must match"}
                      </span>
                      <div
                        className={`h-px flex-1 ${
                          cond.logic === "OR"
                            ? "bg-gradient-to-l from-transparent via-purple-300 dark:via-purple-700 to-purple-400 dark:to-purple-600"
                            : "bg-gradient-to-l from-transparent via-blue-300 dark:via-blue-700 to-blue-400 dark:to-blue-600"
                        }`}
                      />
                    </div>
                  )}
                  <ConditionRow
                    field={cond.field}
                    operator={cond.op}
                    value={cond.val}
                    priorVariables={priorVariablesList}
                    onFieldChange={(f) => handleUpdateFilterConditionRule(selectedStep.id, cond.id, "field", f)}
                    onOperatorChange={(op) => handleUpdateFilterConditionRule(selectedStep.id, cond.id, "op", op)}
                    onValueChange={(val) => handleUpdateFilterConditionRule(selectedStep.id, cond.id, "val", val)}
                    onDelete={filterConditionsList.length > 1 ? () => handleDeleteFilterCondition(selectedStep.id, cond.id) : undefined}
                    onOpenLabelPicker={() => {
                      setPickerConditionTarget({ type: "filter", key: selectedStep.id, ruleId: cond.id, targetField: "field" })
                      setActiveFieldForPicker(`filter_cond_${cond.id}_field`)
                      setVariablePickerOpen(true)
                    }}
                    onOpenVariablePicker={() => {
                      setPickerConditionTarget({ type: "filter", key: selectedStep.id, ruleId: cond.id, targetField: "val" })
                      setActiveFieldForPicker(`filter_cond_${cond.id}_val`)
                      setVariablePickerOpen(true)
                    }}
                  />
                </React.Fragment>
              ))}

              {/* Add Condition Buttons */}
              <div className="flex items-center gap-2 pt-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFilterCondition(selectedStep.id, "AND")}
                  className="h-7 px-3 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>AND Condition</span>
                  <span className="text-[9px] text-blue-500/90 dark:text-blue-400/80 font-normal">(all match)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFilterCondition(selectedStep.id, "OR")}
                  className="h-7 px-3 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/50 hover:bg-purple-100/80 dark:hover:bg-purple-900/60 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 rounded-lg cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>OR Condition</span>
                  <span className="text-[9px] text-purple-500/90 dark:text-purple-400/80 font-normal">(any match)</span>
                </Button>
              </div>
            </div>
          </div>
        ) : isWebhookTrigger ? (
          /* Dedicated Webhook Trigger Setup */
          (() => {
            const currentAppId = effectiveAppId || selectedStep.appId
            const currentEventId = selectedStep.eventId
            const appGuide = getWebhookAppGuide(currentAppId, currentEventId)
            const eventGuide = getWebhookEventGuide(currentAppId, currentEventId)
            const appDisplayName = selectedStep.appName || appGuide?.appName || "Webhook"
            const generatedWebhookUrl = `https://connect.automateworkflows.com/webhook-listener/webhook/wh_${selectedStep.id}_${currentAppId}`

            const captured = webhookCapturedData[selectedStep.id] || selectedStep.testOutput || (selectedStep.status === "configured" ? (eventGuide?.samplePayload || {
              event_id: "evt_live_89124",
              customer_name: "Alex Johnson",
              customer_email: "alex.johnson@example.com",
              order_amount: 149.50,
              currency: "USD",
              payment_status: "PAID"
            }) : null)

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AppIcon appId={currentAppId} appName={appDisplayName} size={20} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {appDisplayName} Webhook Trigger Setup
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                    ● Instant Webhook
                  </Badge>
                </div>

                {/* 1. Webhook Capture URL Card */}
                <div className="space-y-2 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                      <span>Webhook Capture URL</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">POST / JSON</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Copy this unique webhook URL and paste it into your <strong>{appDisplayName}</strong> webhook settings.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      readOnly
                      value={generatedWebhookUrl}
                      className="text-xs font-mono bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 select-all font-medium h-9"
                    />
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedWebhookUrl)
                        setCopiedWebhook(true)
                        setTimeout(() => setCopiedWebhook(false), 2000)
                      }}
                      className="shrink-0 h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs space-x-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedWebhook ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </Button>
                  </div>
                  {copiedWebhook && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>URL copied to clipboard! Paste into {appDisplayName} dashboard.</span>
                    </p>
                  )}
                </div>

                {/* 2. Setup Instructions Note */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-100">
                      <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>How to Connect {appDisplayName}</span>
                    </div>
                    {eventGuide?.targetEventNameInApp && (
                      <span className="text-[10px] font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded font-semibold max-w-[220px] truncate" title={eventGuide.targetEventNameInApp}>
                        {eventGuide.targetEventNameInApp}
                      </span>
                    )}
                  </div>
                  <ol className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside pl-0.5 leading-relaxed">
                    {(appGuide?.generalSteps || [
                      "Copy the Webhook URL above.",
                      `Paste into your ${appDisplayName} webhook settings.`,
                      "Send a test event from your software, or click Simulate Test Event below."
                    ]).map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                  {appGuide?.docUrl && (
                    <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                      <a
                        href={appGuide.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center space-x-1 font-medium"
                      >
                        <span>View Official {appDisplayName} Webhook Docs</span>
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* 3. Simple Response Format */}
                <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Simple Response
                    </label>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Data Format</span>
                  </div>
                  <Select
                    value={selectedStep.fieldMappings?.simple_response || webhookSimpleResponse[selectedStep.id] || "yes"}
                    onChange={(e) => {
                      handleFieldChange("simple_response", e.target.value)
                      setWebhookSimpleResponse(prev => ({ ...prev, [selectedStep.id]: e.target.value as "yes" | "no" }))
                    }}
                    options={[
                      { value: "yes", label: "Yes (Recommended - Flatten JSON into simple variable keys)" },
                      { value: "no", label: "No (Advanced - Retain nested JSON objects and arrays)" }
                    ]}
                    className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    When enabled, nested JSON objects are automatically flattened into easy-to-use variable tokens like <code className="font-mono text-blue-600 dark:text-blue-400 text-[10px]">{"{{step_1.customer_email}}"}</code>.
                  </p>
                </div>

                {/* 4. Webhook Test & Response Viewer */}
                <div className="space-y-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {captured ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {captured ? "Webhook Response Captured (200 OK)" : "Waiting for Webhook Response..."}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSimulatingWebhook}
                        onClick={() => handleSimulateWebhookPayload(selectedStep.id)}
                        className="h-7 px-2.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 border-blue-200 dark:border-blue-800 cursor-pointer shadow-2xs"
                      >
                        {isSimulatingWebhook ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin mr-1 text-blue-600 dark:text-blue-400" />
                            <span>Simulating...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1 fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" />
                            <span>{captured ? "Re-simulate" : "Simulate Test Event"}</span>
                          </>
                        )}
                      </Button>
                      {captured && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRecaptureWebhook(selectedStep.id)}
                          className="h-7 px-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          <span>Recapture</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {!captured ? (
                    <div className="py-5 text-center text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">Listening for incoming payload from {appDisplayName}...</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Paste the URL in your {appDisplayName} settings and send an event, or click Simulate Test Event above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-200/80 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/80 dark:bg-slate-950/70 shadow-inner">
                        {Object.entries(captured).map(([key, val]) => (
                          <div
                            key={key}
                            className="p-2.5 flex items-center justify-between text-xs gap-3 hover:bg-white/60 dark:hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-[11px] truncate">
                                  {key}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-slate-300/70 dark:border-slate-700">
                                  {typeof val}
                                </span>
                              </div>
                              <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate block mt-0.5 font-mono">
                                {typeof val === "object" ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                            <span className="shrink-0 text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800/80 shadow-2xs select-all">
                              {`{{step_1.${key}}}`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-0.5 pt-0.5">
                        <span className="flex items-center gap-1">
                          <span>💡 Press</span>
                          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-[9px] font-mono font-bold shadow-2xs">/</kbd>
                          <span>to insert these in downstream steps</span>
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{Object.keys(captured).length} fields available</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()
        ) : (
          /* Standard Action Fields */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {currentSchema.actionName} Fields ({currentSchema.fields.length})
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                Click (/) or press {"{/}"} to insert variable
              </span>
            </div>

            {/* Real-time Currency Live Preview Card */}
            {selectedStep.appId === "number-formatter" &&
              (selectedStep.eventId === "format_currency" || selectedStep.fieldMappings?.number_operation === "currency") && (
                <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-sky-50/40 to-blue-50/80 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 rounded-xl shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse ring-4 ring-blue-100 dark:ring-blue-950" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        Live Formatting Output Preview
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-blue-100/70 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 px-2 py-0.5 rounded-md">
                      Intl.NumberFormat
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                        Formatted Value
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight font-mono">
                        {getLiveCurrencyPreview()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Applied Locale</span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                        {(selectedStep.fieldMappings?.currency_code || "USD").toUpperCase()} • {selectedStep.fieldMappings?.currency_locale || "en-US"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 This preview updates in real time as you change the number, currency code, locale, or pattern below.
                  </p>
                </div>
              )}

            {currentSchema.fields.map((field) => {
              const fieldValue = selectedStep.fieldMappings?.[field.id] !== undefined
                ? selectedStep.fieldMappings[field.id]
                : field.defaultValue !== undefined
                ? String(field.defaultValue)
                : ""
              const isMapped = !!fieldMapModes[field.id]

              return (
                <div key={field.id} className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
                  {/* Field Label Header */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                      <span>{field.label}</span>
                      {field.required && <span className="text-red-500 font-bold">*</span>}
                    </label>

                    <div className="flex items-center space-x-2">
                      {/* Map Toggle Switch for Selects */}
                      {field.type === "select" && field.supportsMapping && (
                        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                          <span className={`text-[10px] font-semibold transition-colors ${isMapped ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
                            Map
                          </span>
                          <Switch
                            checked={isMapped}
                            onCheckedChange={() => toggleFieldMapMode(field.id)}
                          />
                        </label>
                      )}

                      {/* Press / Variable Trigger Button Outside the Input Box */}
                      {field.supportsMapping && (field.type !== "select" || isMapped) && (
                        <button
                          type="button"
                          onClick={() => openVariablePickerForField(field.id)}
                          className="h-6 px-2 flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/90 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/90 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-md transition-all cursor-pointer shadow-2xs group select-none"
                          title="Insert variable (or Press / on keyboard)"
                        >
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">Press</span>
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 border border-slate-200/90 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 rounded text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-mono font-bold text-[10px] leading-none shadow-2xs">
                            /
                          </kbd>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Field Input Element */}
                  {field.type === "select" && !isMapped ? (
                    <Select
                      value={fieldValue || field.options?.[0]?.value || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      options={field.options || []}
                      className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
                    />
                  ) : field.type === "textarea" ? (
                    <VariablePillInput
                      id={`field_${field.id}`}
                      value={fieldValue}
                      placeholder={field.placeholder || "Type content or insert dynamic variables..."}
                      supportsMapping={field.supportsMapping}
                      multiline={true}
                      minHeight="min-h-[72px]"
                      onFocus={() => setFocusedFieldId(field.id)}
                      onChange={(val) => handleFieldChange(field.id, val)}
                      onOpenVariablePicker={() => openVariablePickerForField(field.id)}
                    />
                  ) : field.type === "code" ? (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center space-x-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          <span className="text-slate-200 font-bold">
                            {selectedStep.eventId === "run_python" ? "Python 3.11 Runtime" : "JavaScript (Node.js 20)"}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => openVariablePickerForField(field.id)}
                          className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1.5 cursor-pointer group"
                        >
                          <span className="font-mono font-bold text-xs bg-slate-800 px-1.5 py-0.5 rounded group-hover:bg-slate-700">/</span>
                          <span>Insert Variable</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={fieldValue || field.defaultValue}
                        onFocus={() => setFocusedFieldId(field.id)}
                        onKeyDown={(e) => {
                          if (e.key === "/" && !e.ctrlKey && !e.altKey && !e.metaKey) {
                            e.preventDefault()
                            openVariablePickerForField(field.id)
                          }
                        }}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full text-xs font-mono bg-slate-950 text-sky-300 p-3 focus:outline-none leading-relaxed"
                      />
                    </div>
                  ) : field.type === "boolean" ? (
                    <div className="flex items-center space-x-2.5 pt-1">
                      <Switch
                        checked={fieldValue === "true" || field.defaultValue === true}
                        onCheckedChange={(checked) => handleFieldChange(field.id, String(checked))}
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Enabled</span>
                    </div>
                  ) : field.id === "fields_to_collect" ? (
                    <HumanFormFieldsBuilder
                      value={fieldValue}
                      onChange={(newVal) => handleFieldChange(field.id, newVal)}
                    />
                  ) : (
                    <VariablePillInput
                      id={`field_${field.id}`}
                      value={fieldValue}
                      placeholder={field.placeholder || "Enter value or map variable..."}
                      supportsMapping={field.supportsMapping}
                      multiline={false}
                      minHeight="min-h-[42px]"
                      onFocus={() => setFocusedFieldId(field.id)}
                      onChange={(val) => handleFieldChange(field.id, val)}
                      onOpenVariablePicker={() => openVariablePickerForField(field.id)}
                    />
                  )}

                  {/* Spreadsheet Formula Quick Presets & Cheat Sheet */}
                  {selectedStep.appId === "number-formatter" && field.id === "formula" && (
                    <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                          <span>Quick Formula Presets</span>
                          <span className="text-[10px] text-blue-600/80 dark:text-blue-400 font-normal">(Click to insert template)</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                          Excel / Sheets Syntax
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "=SUM()", template: "=SUM({{step_1.amount}}, 100)" },
                          { label: "=AVERAGE()", template: "=AVERAGE({{step_1.amount}}, 250)" },
                          { label: "=ROUND()", template: "=ROUND({{step_1.amount}}, 2)" },
                          { label: "=IF()", template: '=IF({{step_1.amount}} > 500, "High Value", "Standard")' },
                          { label: "=RANDBETWEEN()", template: "=RANDBETWEEN(1000, 9999)" },
                          { label: "=DAYS()", template: '=DAYS("2026-12-31", "2026-01-01")' },
                          { label: "=CONCATENATE()", template: '=CONCATENATE({{step_1.first_name}}, " ", {{step_1.last_name}})' }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              handleFieldChange(field.id, preset.template)
                              showToast(`Inserted template: ${preset.label}`)
                            }}
                            className="text-[11px] font-mono font-semibold px-2 py-1 bg-white dark:bg-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white dark:hover:text-white border border-blue-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-lg transition-all shadow-2xs cursor-pointer select-none"
                            title={`Insert ${preset.template}`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Educational Pattern Syntax Guide for Currency Format (Compact Collapsible) */}
                  {selectedStep.appId === "number-formatter" && field.id === "currency_format" && (
                    <details className="group bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/60 rounded-lg overflow-hidden transition-all text-xs">
                      <summary className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer select-none font-semibold text-blue-950 dark:text-blue-200 list-none [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center space-x-1.5 text-[11px] truncate">
                          <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="text-blue-900 dark:text-blue-200 font-bold">Format Cheat Sheet:</span>
                          <span className="font-mono text-[10px] text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/60 px-1.5 py-0.5 rounded font-medium">
                            ¤ Symbol • 0 Fixed • # Optional
                          </span>
                        </span>
                        <span className="flex items-center space-x-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium shrink-0 ml-2">
                          <span className="group-open:hidden">Show details</span>
                          <span className="hidden group-open:inline">Hide details</span>
                          <ChevronDown className="h-3 w-3 transition-transform duration-200 group-open:rotate-180" />
                        </span>
                      </summary>
                      <div className="px-2.5 py-2 border-t border-blue-100/80 dark:border-blue-900/60 bg-white/70 dark:bg-slate-900/70 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800 min-w-[22px] text-center shrink-0">¤</span>
                          <span className="text-slate-600 dark:text-slate-300">Currency symbol ($ / ₹ / €)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800 min-w-[22px] text-center shrink-0">, .</span>
                          <span className="text-slate-600 dark:text-slate-300">Grouping & decimal separators</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800 min-w-[22px] text-center shrink-0">0</span>
                          <span className="text-slate-600 dark:text-slate-300">Fixed zeroes (<code className="text-blue-600 dark:text-blue-400 font-mono">.00</code> = 2 decimals)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800 min-w-[22px] text-center shrink-0">#</span>
                          <span className="text-slate-600 dark:text-slate-300">Optional digits (<code className="text-blue-600 dark:text-blue-400 font-mono">.##</code> hides zeroes)</span>
                        </div>
                      </div>
                    </details>
                  )}

                  {/* Helper Subtext */}
                  {field.helperText && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight pt-0.5">
                      {field.helperText}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Email Approval Live Preview & Send Test Action */}
        {selectedStep.appId === "human-approval" && selectedStep.eventId === "wait_for_approval" && (
          <div className="p-3.5 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/90 dark:border-blue-900/60 rounded-xl space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-2xs">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    Approval Email Preview & Test
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Preview custom buttons & send test message
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800 px-2 py-0.5 rounded-full">
                Live Template
              </span>
            </div>

            {/* Live Button Preview */}
            <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200/90 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Email Decision Buttons:
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md font-bold text-xs truncate max-w-[150px]">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  <span>{selectedStep.fieldMappings?.["approve_button_label"] || "Approve"}</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-md font-bold text-xs truncate max-w-[150px]">
                  <X className="h-3 w-3 stroke-[2.5]" />
                  <span>{selectedStep.fieldMappings?.["reject_button_label"] || "Reject"}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApprovalPreviewOpen(true)}
                className="flex-1 h-8 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                <span>Preview Email</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSendPreviewMessage()}
                className="flex-1 h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                <span>Send Preview Message</span>
              </Button>
            </div>
          </div>
        )}

        {/* Custom Parameters Section */}
        {!isWebhookTrigger && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block">
                  Custom Parameters & Headers
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Add optional key-value parameters with variable mapping support
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAddCustomParam(selectedStep.id)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Parameter</span>
              </button>
            </div>

            {currentCustomParams.length > 0 && (
              <div className="space-y-2">
                {currentCustomParams.map((p) => (
                  <div key={p.id} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Input
                      placeholder="Parameter Key"
                      value={p.key}
                      onChange={(e) => handleUpdateCustomParam(selectedStep.id, p.id, "key", e.target.value)}
                      className="text-xs bg-white dark:bg-slate-900 font-mono flex-1 h-8"
                    />
                    <div className="flex-1">
                      <VariablePillInput
                        id={`param_${p.id}`}
                        value={p.value}
                        placeholder="Value or {{step_1.var}}"
                        supportsMapping={true}
                        multiline={false}
                        minHeight="min-h-[34px]"
                        onFocus={() => setFocusedFieldId(p.id)}
                        onChange={(val) => handleUpdateCustomParam(selectedStep.id, p.id, "value", val)}
                        onOpenVariablePicker={() => openVariablePickerForField(p.id)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => openVariablePickerForField(p.id)}
                      className="h-7 px-1.5 flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/90 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-md transition-all cursor-pointer shadow-2xs group select-none shrink-0"
                      title="Insert variable (or Press / on keyboard)"
                    >
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">Press</span>
                      <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 border border-slate-200/90 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 rounded text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-mono font-bold text-[9px] leading-none shadow-2xs">
                        /
                      </kbd>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomParam(selectedStep.id, p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                      title="Remove parameter"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const handleOpenConfig = (stepId: string) => {
    let targetStep =
      steps.find((s) => s.id === stepId) ||
      routeASteps.find((s) => s.id === stepId) ||
      routeBSteps.find((s) => s.id === stepId) ||
      Object.values(branchSteps).flat().find((s) => s.id === stepId)

    // Normalize any middle action steps that had Webhook to API node
    const isTrigger = targetStep?.type === "trigger" || stepId === steps[0]?.id
    if (!isTrigger && targetStep && (targetStep.appId === "webhook" || targetStep.appId === "webhook-catch")) {
      const normalized = {
        ...targetStep,
        type: "action" as const,
        appId: "api-webhook",
        appName: "API",
        eventId: "send_custom_http",
        eventName: "Custom API Request (GET/POST/PUT/DELETE)"
      }
      setSteps((prev) => prev.map((s) => (s.id === stepId ? normalized : s)))
      setRouteASteps((prev) => prev.map((s) => (s.id === stepId ? normalized : s)))
      setRouteBSteps((prev) => prev.map((s) => (s.id === stepId ? normalized : s)))
      setBranchSteps((prev) => {
        const next: Record<string, WorkflowStep[]> = {}
        for (const [k, v] of Object.entries(prev)) {
          next[k] = v.map((s) => (s.id === stepId ? normalized : s))
        }
        return next
      })
      targetStep = normalized
    }

    // Router node itself doesn't open drawer; clicking its route Filter nodes opens the drawer
    if (targetStep?.appId === "router") {
      return
    }

    setSelectedStepId(stepId)
    setActiveRouteId(null)
    setActiveTab("setup")
    if (targetStep && targetStep.appId) {
      setDrawerStep("setup_details")
    } else {
      setDrawerStep("app_select")
    }
    setIsDrawerMaximized(false)
    setStepDrawerOpen(true)
  }

  const handleOpenRouteConfig = (stepId: string, routeId: string) => {
    setSelectedStepId(stepId)
    setActiveRouteId(routeId)
    setActiveTab("connections")
    setDrawerStep("setup_details")
    setIsDrawerMaximized(false)
    setStepDrawerOpen(true)
  }

  const handleAddStepToRoute = (routeKey: "Route A" | "Route B") => {
    const newStepId = `rt_step_${Date.now()}`

    const newStep: WorkflowStep = {
      id: newStepId,
      type: "action",
      appId: "",
      appName: "Select Action App",
      eventId: "",
      eventName: "Choose Action Event",
      status: "unmapped",
      fieldMappings: {},
      isNewStep: true
    }

    if (routeKey === "Route A") {
      setRouteASteps((prev) => [...prev, newStep])
    } else {
      setRouteBSteps((prev) => [...prev, newStep])
    }
    showToast(`Added action step to ${routeKey}! Select an app from the catalog.`)
    setSelectedStepId(newStepId)
    setActiveRouteId(null)
    setActiveTab("setup")
    setDrawerStep("app_select")
    setIsDrawerMaximized(false)
    setStepDrawerOpen(true)
  }

  const handleDeleteRouteStep = (routeKey: "Route A" | "Route B", stepId: string) => {
    if (routeKey === "Route A") {
      setRouteASteps(routeASteps.filter((s) => s.id !== stepId))
    } else {
      setRouteBSteps(routeBSteps.filter((s) => s.id !== stepId))
    }
    setBranchSteps(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        if (k.startsWith(stepId)) delete next[k]
      })
      return next
    })
    showToast(`Removed step from ${routeKey}`)
  }

  const handleAddStepToBranch = (branchKey: string, routeName: string) => {
    const newStepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`

    const newStep: WorkflowStep = {
      id: newStepId,
      type: "action",
      appId: "",
      appName: "Select Action App",
      eventId: "",
      eventName: "Choose Action Event",
      status: "unmapped",
      fieldMappings: {},
      isNewStep: true
    }

    if (branchKey === "routeA") {
      setRouteASteps((prev) => [...prev, newStep])
    } else if (branchKey === "routeB") {
      setRouteBSteps((prev) => [...prev, newStep])
    } else {
      setBranchSteps((prev) => ({
        ...prev,
        [branchKey]: [...(prev[branchKey] || []), newStep]
      }))
    }
    showToast(`Added action step to ${routeName}! Select an app from the catalog.`)
    setSelectedStepId(newStepId)
    setActiveRouteId(null)
    setActiveTab("setup")
    setDrawerStep("app_select")
    setIsDrawerMaximized(false)
    setStepDrawerOpen(true)
  }

  const handleDeleteBranchStep = (branchKey: string, stepId: string) => {
    if (branchKey === "routeA") {
      setRouteASteps((prev) => prev.filter((s) => s.id !== stepId))
    } else if (branchKey === "routeB") {
      setRouteBSteps((prev) => prev.filter((s) => s.id !== stepId))
    } else {
      setBranchSteps((prev) => {
        const next = {
          ...prev,
          [branchKey]: (prev[branchKey] || []).filter((s) => s.id !== stepId)
        }
        Object.keys(next).forEach((k) => {
          if (k.startsWith(stepId)) delete next[k]
        })
        return next
      })
    }
    showToast(`Removed step from branch`)
  }

  // Backwards-compatibility aliases
  const handleAddStepToSubRoute = (k: string) => handleAddStepToBranch(k, k.endsWith("_a") ? "Sub-Route A" : "Sub-Route B")
  const handleAddStepToNestedRoute = (k: string) => handleAddStepToBranch(k, k.endsWith("_a") ? "Nested Route A" : "Nested Route B")
  const handleAddStepToDeepRoute = (k: string, name: string) => handleAddStepToBranch(k, name)
  const handleAddStepToLeafRoute = (k: string, name: string) => handleAddStepToBranch(k, name)

  const handleDeleteSubRouteStep = handleDeleteBranchStep
  const handleDeleteNestedRouteStep = handleDeleteBranchStep
  const handleDeleteDeepRouteStep = handleDeleteBranchStep
  const handleDeleteLeafRouteStep = handleDeleteBranchStep

  // Delete Confirmation Modal State (Handles Main Workflow Steps, Branch Steps, and Router Branches)
  const [deleteStepModalState, setDeleteStepModalState] = useState<{
    open: boolean
    stepId: string
    stepName: string
    branchKey?: string
    isRouterBranch?: boolean
    routerStepId?: string
    branchSuffix?: string
  }>({ open: false, stepId: "", stepName: "" })

  const requestDeleteStep = (stepId: string, stepName?: string) => {
    const targetStep = steps.find((s) => s.id === stepId)
    if (targetStep?.type === "trigger" || stepId === steps[0]?.id) {
      showToast("Trigger cannot be deleted. A workflow must start with a trigger.", "warning")
      return
    }
    const displayName = stepName || (targetStep ? `${targetStep.appName} - ${targetStep.eventName}` : "this step")
    setDeleteStepModalState({ open: true, stepId, stepName: displayName })
  }

  const requestDeleteBranchStep = (branchKey: string, stepId: string, stepName?: string) => {
    const bSteps = getBranchSteps(branchKey)
    const targetStep = bSteps.find((s) => s.id === stepId)
    const displayName = stepName || (targetStep ? `${targetStep.appName} - ${targetStep.eventName}` : "this step")
    setDeleteStepModalState({ open: true, stepId, stepName: displayName, branchKey })
  }

  const requestDeleteBranch = (routerStepId: string, suffix: string, branchKey: string, branchName?: string) => {
    setDeleteStepModalState({
      open: true,
      stepId: "",
      stepName: branchName || `Branch ${suffix.toUpperCase()}`,
      isRouterBranch: true,
      routerStepId,
      branchSuffix: suffix,
      branchKey
    })
  }

  const handleConfirmDeleteStep = () => {
    if (deleteStepModalState.isRouterBranch && deleteStepModalState.routerStepId && deleteStepModalState.branchSuffix && deleteStepModalState.branchKey) {
      handleDeleteBranchFromRouter(deleteStepModalState.routerStepId, deleteStepModalState.branchSuffix, deleteStepModalState.branchKey)
    } else if (deleteStepModalState.branchKey && deleteStepModalState.stepId) {
      if (deleteStepModalState.branchKey === "Route A") {
        handleDeleteRouteStep("Route A", deleteStepModalState.stepId)
      } else if (deleteStepModalState.branchKey === "Route B") {
        handleDeleteRouteStep("Route B", deleteStepModalState.stepId)
      } else {
        handleDeleteBranchStep(deleteStepModalState.branchKey, deleteStepModalState.stepId)
      }
    } else if (deleteStepModalState.stepId) {
      const targetStep = steps.find((s) => s.id === deleteStepModalState.stepId)
      if (targetStep?.type === "trigger" || deleteStepModalState.stepId === steps[0]?.id) {
        showToast("Trigger cannot be deleted.", "warning")
        return
      }
      setSteps((prev) => prev.filter((s) => s.id !== deleteStepModalState.stepId))
      if (selectedStepId === deleteStepModalState.stepId) {
        setSelectedStepId("")
        setStepDrawerOpen(false)
      }
      showToast("Step removed successfully")
    }
  }

  function getBranchWidth(branchKey: string, depth: number): number {
    if (depth > 12) return 260
    const steps = branchKey === "routeA"
      ? routeASteps
      : branchKey === "routeB"
      ? routeBSteps
      : (branchSteps[branchKey] || [])

    const routerStep = steps.find((s) => s.appId === "router")
    const baseColWidth = depth <= 1 ? 400 : depth <= 2 ? 340 : depth <= 3 ? 300 : 260

    if (!routerStep) {
      return baseColWidth
    }

    const childRouterWidth = getSubtreeWidth(routerStep.id, depth + 1)
    return Math.max(baseColWidth, childRouterWidth)
  }

  function getSubtreeWidth(stepId: string, depth: number): number {
    if (depth > 12) return 500
    const suffixes = routerBranchKeys[stepId] || ["a", "b"]
    const branches = suffixes.map((s) => getBranchMeta(stepId, s, depth))
    const gap = depth <= 1 ? 36 : depth <= 2 ? 28 : 20

    let total = 0
    for (let i = 0; i < branches.length; i++) {
      const bWidth = getBranchWidth(branches[i].key, depth)
      total += bWidth + (i > 0 ? gap : 0)
    }

    const baseColWidth = depth <= 1 ? 400 : depth <= 2 ? 340 : depth <= 3 ? 300 : 260
    return Math.max(total, baseColWidth * branches.length + gap * (branches.length - 1))
  }

  function renderRouterBranches(parentStepId: string, depth: number): React.ReactNode {
    const suffixes = routerBranchKeys[parentStepId] || ["a", "b"]
    const branches = suffixes.map((s) => getBranchMeta(parentStepId, s, depth))
    const gap = depth <= 1 ? 36 : depth <= 2 ? 28 : 20

    const branchWidths = branches.map((b) => getBranchWidth(b.key, depth))

    let currentLeft = 0
    const columnCenters: number[] = []
    for (let i = 0; i < branches.length; i++) {
      const w = branchWidths[i]
      columnCenters.push(currentLeft + w / 2)
      currentLeft += w + gap
    }
    const totalWidth = currentLeft - gap
    const wireLeft = columnCenters[0]
    const wireWidth = columnCenters[columnCenters.length - 1] - columnCenters[0]

    const cardClass = depth <= 2
      ? "w-72 md:w-80 px-4 py-3"
      : depth <= 3
      ? "w-60 md:w-68 px-3.5 py-2.5"
      : depth <= 4
      ? "w-52 md:w-56 px-3 py-2"
      : "w-44 md:w-48 px-2.5 py-2"

    const iconSize = depth <= 2 ? 36 : depth <= 3 ? 30 : depth <= 4 ? 26 : 22

    return (
      <div key={`tree_${parentStepId}`} className="flex flex-col items-center w-full my-2 animate-in fade-in zoom-in-95 duration-200">
        {/* Top vertical connector wire */}
        <div className="h-5 w-0.5 bg-slate-300 dark:bg-slate-700" />

        <div
          style={{ width: `${totalWidth}px` }}
          className="flex flex-col items-center transition-all duration-300"
        >
          {/* Horizontal Splitter Line and Center Drops */}
          <div className="relative w-full h-4">
            <div
              style={{
                left: `${wireLeft}px`,
                width: `${wireWidth}px`
              }}
              className="absolute top-0 h-0.5 bg-slate-300 dark:bg-slate-700 transition-all duration-300"
            />
            {columnCenters.map((centerPx, idx) => (
              <div
                key={idx}
                style={{ left: `${centerPx}px` }}
                className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700 absolute top-0 -translate-x-1/2 transition-all duration-300"
              />
            ))}
          </div>

          {/* Parallel Branch Columns with Dedicated Explicit Widths */}
          <div
            className="flex justify-center items-start w-full mt-0"
            style={{ gap: `${gap}px` }}
          >
            {branches.map((branch, bIdx) => {
              const colWidth = branchWidths[bIdx]
              const cond = getBranchCondition(branch.key, bIdx)
              const opSymbol = getOpSymbol(cond.op)
              const fieldName = cond.field
              const compareVal = cond.val

              const branchStepsList = getBranchSteps(branch.key)
              const routerIdx = branchStepsList.findIndex((s) => s.appId === "router")
              const visibleSteps = routerIdx !== -1 ? branchStepsList.slice(0, routerIdx + 1) : branchStepsList
              const hasRouter = routerIdx !== -1

              return (
                <div
                  key={branch.key}
                  style={{ width: `${colWidth}px` }}
                  className="flex flex-col items-center shrink-0 transition-all duration-300"
                >
                  {/* Filter Node Card */}
                  <div
                    onClick={() => handleOpenRouteConfig(parentStepId, branch.key)}
                    className={`${cardClass} rounded-2xl border-2 shadow-xs transition-all flex items-center justify-between relative select-none cursor-pointer ${
                      selectedStepId === parentStepId && activeRouteId === branch.key && stepDrawerOpen
                        ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950 bg-white dark:bg-slate-900 shadow-md"
                        : "border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <AppIcon appId="filter" appName="Filter" size={iconSize} />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500 block truncate">
                          {branch.name} • Filter
                        </span>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">Filter</h4>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[140px]">
                          IF {fieldName || "Field"} {opSymbol} {compareVal}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenRouteConfig(parentStepId, branch.key) }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                        title="Edit Route Condition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          requestDeleteBranch(parentStepId, branch.suffix, branch.key, branch.name)
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                        title={`Delete ${branch.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ACTION STEPS IN THIS BRANCH */}
                  {visibleSteps.map((bStep, sIdx) => {
                    const isUnconfigured = !bStep.appId
                    const isSelected = selectedStepId === bStep.id && stepDrawerOpen
                    const isHovered = hoveredNodeId === bStep.id

                    return (
                    <div key={bStep.id} className="flex flex-col items-center my-2 animate-in fade-in w-full">
                      <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                      <div
                        onMouseEnter={() => setHoveredNodeId(bStep.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => {
                          if (bStep.appId !== "router") {
                            handleOpenConfig(bStep.id)
                          }
                        }}
                        className={`${cardClass} rounded-2xl border-2 shadow-xs transition-all flex items-center justify-between relative select-none group/bcard ${
                          bStep.appId === "router" ? "cursor-default" : "cursor-pointer"
                        } ${
                          isSelected && bStep.appId !== "router"
                            ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950 bg-white dark:bg-slate-900"
                            : isUnconfigured
                            ? "border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                          {isUnconfigured ? (
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                              <Plus className="h-4 w-4" />
                            </div>
                          ) : (
                            <AppIcon appId={bStep.appId} appName={bStep.appName} size={iconSize} />
                          )}
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <span className="text-[8px] font-medium text-blue-600 dark:text-blue-400 block truncate">
                              {branch.name} • Action {sIdx + 1}
                            </span>
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight flex items-center space-x-1.5 truncate">
                              <span>{isUnconfigured ? "Select Action App" : bStep.appName}</span>
                              {bStep.appId === "router" && (
                                <Badge variant="blue" className="text-[8px] font-bold px-1 py-0">Router</Badge>
                              )}
                            </h4>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                              {isUnconfigured ? "Click to choose app" : bStep.eventName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-0.5 shrink-0">
                          <div
                            className={`flex items-center space-x-0.5 transition-all duration-200 ${
                              isHovered || isUnconfigured ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-2 pointer-events-none"
                            }`}
                          >
                            {bStep.appId === "router" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddBranchToRouter(bStep.id)
                                }}
                                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                                title="Add Route Branch"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                              </button>
                            )}
                            {!isUnconfigured && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyNode(bStep)
                                }}
                                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Copy Step"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {!isUnconfigured && bStep.appId !== "router" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenConfig(bStep.id)
                                }}
                                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                                title="Edit Step Setup"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                requestDeleteBranchStep(branch.key, bStep.id, isUnconfigured ? "Unconfigured Step" : `${bStep.appName} - ${bStep.eventName}`)
                              }}
                              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                              title="Delete Step"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {copiedTooltipId === bStep.id && (
                          <div className="absolute -top-7 right-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-30 animate-in fade-in">
                            Copied!
                          </div>
                        )}
                      </div>

                      {/* RECURSIVE ROUTER BRANCH RENDERING */}
                      {bStep.appId === "router" && renderRouterBranches(bStep.id, depth + 1)}
                    </div>
                  )})}

                  {/* Per-Filter Add Action Insertion Connector Button (Hidden if branch contains a Router Node) */}
                  {!hasRouter && (
                    <div className="flex flex-col items-center justify-center pt-2">
                      <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddStepToBranch(branch.key, branch.name)
                        }}
                        className="h-7 px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:border-blue-300 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs flex items-center space-x-1.5 text-[11px] font-semibold transition-all hover:scale-105"
                        title={`Add action step in ${branch.name}`}
                      >
                        <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Add Action in {branch.name}</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  function HorizontalAppSquircle({
    appId,
    appName,
    size = 48,
    isTrigger = false
  }: {
    appId?: string
    appName?: string
    size?: number
    isTrigger?: boolean
  }) {
    return (
      <div className="relative shrink-0 select-none flex items-center justify-center transition-transform duration-200 group-hover/hnode:scale-105">
        <AppIcon appId={appId} appName={appName} size={size} />
      </div>
    )
  }

  function getHorizontalBranchHeight(branchKey: string, depth: number): number {
    if (depth > 12) return 150
    const steps = getBranchSteps(branchKey)
    const routerStep = steps.find((s) => s.appId === "router")
    const baseRowHeight = 150

    if (!routerStep) {
      return baseRowHeight
    }

    const childRouterHeight = getHorizontalSubtreeHeight(routerStep.id, depth + 1)
    return Math.max(baseRowHeight, childRouterHeight)
  }

  function getHorizontalSubtreeHeight(stepId: string, depth: number): number {
    if (depth > 12) return 150
    const suffixes = routerBranchKeys[stepId] || ["a", "b"]
    const branches = suffixes.map((s) => {
      if (depth === 1) {
        const letter = s.toUpperCase()
        return {
          key: s === "a" ? "routeA" : s === "b" ? "routeB" : `${stepId}_br_${s}`,
          name: `Route ${letter}`,
          suffix: s
        }
      }
      return getBranchMeta(stepId, s, depth)
    })
    const rowGap = 28

    let total = 0
    for (let i = 0; i < branches.length; i++) {
      const bHeight = getHorizontalBranchHeight(branches[i].key, depth)
      total += bHeight + (i > 0 ? rowGap : 0)
    }

    return Math.max(total, 110 * branches.length + rowGap * (branches.length - 1))
  }

  function renderHorizontalRouterBranches(parentStepId: string, depth: number): React.ReactNode {
    const suffixes = routerBranchKeys[parentStepId] || ["a", "b"]
    const branches = suffixes.map((s) => {
      if (depth === 1) {
        const letter = s.toUpperCase()
        return {
          key: s === "a" ? "routeA" : s === "b" ? "routeB" : `${parentStepId}_br_${s}`,
          name: `Route ${letter}`,
          suffix: s
        }
      }
      return getBranchMeta(parentStepId, s, depth)
    })
    const rowGap = 28

    const branchHeights = branches.map((b) => getHorizontalBranchHeight(b.key, depth))

    let currentTop = 0
    const rowCenters: number[] = []
    for (let i = 0; i < branches.length; i++) {
      const h = branchHeights[i]
      rowCenters.push(currentTop + h / 2)
      currentTop += h + rowGap
    }
    const totalHeight = currentTop - rowGap
    const wireTop = rowCenters[0]
    const wireHeight = rowCenters[rowCenters.length - 1] - rowCenters[0]

    return (
      <div key={`htree_${parentStepId}`} className="flex items-center select-none shrink-0">
        {/* Horizontal trunk wire from parent router */}
        <div className="w-10 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />

        {/* Vertical Splitter & Rows */}
        <div style={{ height: `${totalHeight}px` }} className="relative flex items-center shrink-0">
          {/* Vertical Splitter Wire */}
          <div
            style={{
              top: `${wireTop}px`,
              height: `${wireHeight}px`
            }}
            className="absolute left-0 w-0.5 bg-slate-300 dark:bg-slate-700 transition-all duration-300"
          />

          {/* Parallel Rows Container */}
          <div className="flex flex-col" style={{ gap: `${rowGap}px` }}>
            {branches.map((branch, bIdx) => {
              const rowH = branchHeights[bIdx]
              const cond = getBranchCondition(branch.key, bIdx)
              const opSymbol = getOpSymbol(cond.op)
              const fieldName = cond.field
              const compareVal = cond.val

              const branchStepsList = getBranchSteps(branch.key)
              const routerIdx = branchStepsList.findIndex((s) => s.appId === "router")
              const visibleSteps = routerIdx !== -1 ? branchStepsList.slice(0, routerIdx + 1) : branchStepsList
              const hasRouter = routerIdx !== -1

              return (
                <div
                  key={branch.key}
                  style={{ height: `${rowH}px` }}
                  className="flex items-center shrink-0 relative"
                >
                  {/* Branch Horizontal Wire */}
                  <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />

                  {/* Compact Filter Node (Big Icon on Top + Text Below) */}
                  <div
                    onClick={() => handleOpenRouteConfig(parentStepId, branch.key)}
                    className={`flex flex-col items-center justify-center text-center group/hnode relative p-3.5 w-36 sm:w-40 rounded-2xl border-2 shadow-xs transition-all cursor-pointer select-none shrink-0 ${
                      selectedStepId === parentStepId && activeRouteId === branch.key && stepDrawerOpen
                        ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950 shadow-md bg-white dark:bg-slate-900"
                        : "border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md bg-white dark:bg-slate-900"
                    }`}
                  >
                    <HorizontalAppSquircle appId="filter" appName="Filter" size={52} />
                    <div className="mt-2 space-y-0.5 w-full">
                      <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 block truncate">
                        {branch.name} • Filter
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">Filter</h4>
                      <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate w-full">
                        IF {fieldName || "Field"} {opSymbol} {compareVal}
                      </p>
                    </div>

                    {/* Quick hover actions */}
                    <div className="absolute -top-3 right-0 opacity-0 group-hover/hnode:opacity-100 transition-opacity flex items-center space-x-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg p-0.5 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenRouteConfig(parentStepId, branch.key) }}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Configure Filter"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          requestDeleteBranch(parentStepId, branch.suffix, branch.key, branch.name)
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title={`Delete ${branch.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Branch Action Steps */}
                  {visibleSteps.map((bStep, sIdx) => {
                    const isUnconfigured = !bStep.appId
                    const isSelected = selectedStepId === bStep.id && stepDrawerOpen

                    return (
                    <React.Fragment key={bStep.id}>
                      <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <div
                        onClick={() => {
                          if (bStep.appId !== "router") {
                            handleOpenConfig(bStep.id)
                          }
                        }}
                        className={`flex flex-col items-center justify-center text-center group/hnode relative p-3.5 w-36 sm:w-40 rounded-2xl border-2 shadow-xs transition-all select-none shrink-0 ${
                          bStep.appId === "router" ? "cursor-default" : "cursor-pointer"
                        } ${
                          isSelected && bStep.appId !== "router"
                            ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950 shadow-sm bg-white dark:bg-slate-900"
                            : isUnconfigured
                            ? "border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
                            : "border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md bg-white dark:bg-slate-900"
                        }`}
                      >
                        {isUnconfigured ? (
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-xs">
                            <Plus className="h-5 w-5" />
                          </div>
                        ) : (
                          <HorizontalAppSquircle appId={bStep.appId} appName={bStep.appName} size={52} />
                        )}
                        <div className="mt-2 space-y-0.5 w-full">
                          <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 block truncate">
                            {branch.name} • Action {sIdx + 1}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug truncate">
                            {isUnconfigured ? "Select App" : bStep.appName}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full">
                            {isUnconfigured ? "Click to choose" : bStep.eventName}
                          </p>
                        </div>

                        {/* Quick hover actions */}
                        <div className={`absolute -top-3 right-0 transition-opacity flex items-center space-x-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg p-0.5 z-20 ${
                          isUnconfigured ? "opacity-100" : "opacity-0 group-hover/hnode:opacity-100"
                        }`}>
                          {bStep.appId === "router" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddBranchToRouter(bStep.id)
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Add Route Branch"
                            >
                              <Plus className="h-3 w-3 stroke-[2.5]" />
                            </button>
                          )}
                          {!isUnconfigured && bStep.appId !== "router" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenConfig(bStep.id) }}
                              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Configure"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              requestDeleteBranchStep(branch.key, bStep.id, isUnconfigured ? "Unconfigured Step" : `${bStep.appName} - ${bStep.eventName}`)
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Nested router branch rendering in horizontal view */}
                      {bStep.appId === "router" && renderHorizontalRouterBranches(bStep.id, depth + 1)}
                    </React.Fragment>
                  )})}

                  {/* Add Action button in branch */}
                  {!hasRouter && (
                    <div className="flex items-center shrink-0">
                      <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddStepToBranch(branch.key, branch.name)
                        }}
                        className="h-7 px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:border-blue-300 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs flex items-center space-x-1.5 text-[11px] font-semibold transition-all hover:scale-105 shrink-0 cursor-pointer"
                        title={`Add action in ${branch.name}`}
                      >
                        <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Add Action</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const handleAddStep = () => {
    if (steps.length === 0 || (steps.length === 1 && !steps[0].appId)) {
      handleStartAddTrigger()
      return
    }
    if (steps.some((s) => s.appId === "router")) {
      showToast("Router Node is already at the end of the main workflow. Add action steps inside Route branches.", "warning")
      return
    }
    handleInsertStepAfter(steps.length - 1, true)
  }

  const numericZoom = parseInt(zoomPercent.replace("%", "")) || 100

  const filteredApps = ALL_AVAILABLE_APPS.filter((app) => {
    // If configuring Step 1 (Trigger), only show apps that support Triggers
    if (isTriggerStep && app.triggers.length === 0) return false
    // If configuring Step 2+ or branch steps (Actions), only show apps with Actions (excludes Webhook)
    if (!isTriggerStep && app.actions.length === 0) return false

    const matchesSearch =
      app.name.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(appSearchQuery.toLowerCase())

    if (appCategoryFilter === "All") return matchesSearch
    if (appCategoryFilter === "Flow Control") return matchesSearch && app.category === "Flow Control"
    if (appCategoryFilter === "Utilities") return matchesSearch && app.category === "Utilities"
    if (appCategoryFilter === "SaaS Apps") return matchesSearch && app.category !== "Flow Control" && app.category !== "Utilities" && !(app as any).isDeveloperApp
    if (appCategoryFilter === "My Custom Apps (Dev)") return matchesSearch && (app as any).isDeveloperApp

    return matchesSearch
  })

  const isConfiguringFields = !!selectedStep && (isAuthOptionalApp || (isStepConnected && connectionMode === "existing"))
  const showDrawerFooter = activeTab === "connections" && isConfiguringFields

  const drawerFooter = showDrawerFooter ? (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Button
        type="button"
        variant="secondary"
        onClick={handleRunTestAction}
        disabled={isTestingAction}
        className="w-full bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white border border-slate-200/90 dark:border-slate-700 font-bold text-xs space-x-2 h-10 cursor-pointer shadow-none"
      >
        {isTestingAction ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Sending Test...</span>
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 fill-slate-600 dark:fill-slate-300" />
            <span>Save & Send Test</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        onClick={() => {
          const curStepParams = selectedStep ? (customParams[selectedStep.id] || selectedStep.customParameters || []) : []
          updateSelectedStep((s) => ({
            ...s,
            status: "configured",
            customParameters: curStepParams
          }))
          setStepDrawerOpen(false)
          showToast(currentTargetedBranch ? `${currentTargetedBranch.name} filter conditions saved!` : `Step "${selectedStep?.eventName}" saved!`)
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs space-x-2 h-10 cursor-pointer shadow-none"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>Save & Finish</span>
      </Button>
    </div>
  ) : null

  const drawerHeader = selectedStep ? (
    <div className="px-6 pt-3.5 pb-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-t-2xl flex items-center justify-between shrink-0 z-20 select-none">
      {/* Minimal Tabs Touched to Top */}
      <div className="flex items-center space-x-6">
        {selectedStep.appId === "router" && currentTargetedBranch ? (
          <div className="text-sm font-bold pb-3.5 -mb-px text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500 flex items-center space-x-2">
            <AppIcon appId="filter" appName="Filter" size={18} />
            <span>{currentTargetedBranch.name} • Filter Setup</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("setup")}
              className={`text-sm font-semibold pb-3.5 -mb-px transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
                activeTab === "setup"
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-transparent"
              }`}
            >
              <span>{selectedStep.type === "trigger" ? "Trigger Setup" : "Action Setup"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!effectiveAppId && !selectedStep.appId) {
                  showToast("Please choose an app first.", "warning")
                  return
                }
                setActiveTab("connections")
                const matching = userConnections.filter(c => c.appId === (effectiveAppId || selectedStep.appId))
                setConnectionMode(matching.length > 0 ? "existing" : "new")
              }}
              className={`text-sm font-semibold pb-3.5 -mb-px transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
                activeTab === "connections"
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-transparent"
              }`}
            >
              <span>Connections</span>
              {isStepConnected ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950" />
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">1 Required</span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center space-x-1 pb-3.5">
        <button
          type="button"
          onClick={() => setIsDrawerMaximized(!isDrawerMaximized)}
          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDrawerMaximized ? "Exit Fullscreen (Side Panel)" : "Maximize to Whole Screen"}
          aria-label={isDrawerMaximized ? "Exit Fullscreen" : "Maximize to Whole Screen"}
        >
          {isDrawerMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => setStepDrawerOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Configuration Panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-slate-950 overflow-hidden select-none font-sans">
      {/* STATIC FIXED TOP HEADER BAR (Unified with Sidebar into single white component) */}
      <header className="shrink-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left Group */}
          <div className="flex items-center space-x-3.5 shrink-0">
            <Link
              href="/workflows"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all shadow-2xs group"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </Link>

            <span className="text-slate-300 dark:text-slate-700 text-sm font-light">|</span>

            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 bg-transparent px-1.5 py-1 focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800 rounded transition-all max-w-[140px] sm:max-w-xs md:max-w-md truncate"
                  placeholder="Untitled Workflow"
                />
              </div>

              {/* On/Off Toggle with Heading */}
              <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 select-none whitespace-nowrap">
                  Turn on / off the workflow
                </span>
                <Switch checked={isOn} onCheckedChange={setIsOn} />
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors select-none ${
                    isOn
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isOn ? "On" : "Off"}
                </span>
              </div>
            </div>
          </div>

          {/* Center Group */}
          <div className="hidden lg:flex items-center space-x-3.5 flex-1 justify-center max-w-md">
            <div className="relative flex items-center w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search Ctrl+F"
                className="w-full pl-9 pr-9 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <span className="absolute right-2.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1 rounded border border-slate-200 dark:border-slate-600">
                ⌘F
              </span>
            </div>
          </div>

          {/* Right Group */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Dark Mode Theme Toggle */}
            <button
              type="button"
              onClick={(e) => toggleTheme(e)}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform duration-700" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-transform duration-700" />
              )}
            </button>

            <Button size="sm" className="font-bold text-xs space-x-1.5 px-4 h-9 shadow-xs">
              <span>Edit draft</span>
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE SHELL */}
      <div className="flex-1 flex overflow-hidden relative bg-white dark:bg-slate-950">
        {/* STATIC FIXED LEFT VERTICAL SIDEBAR (Seamless continuation of Top Header) */}
        <aside className="w-12 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between items-center py-4 z-20">
          <div className="flex flex-col items-center space-y-3.5">
            {/* AI Builder Tool Toggle */}
            <button
              onClick={() => {
                setActiveSideTool(null)
                setAiPanelMode(aiPanelMode === "left-docked" ? "closed" : "left-docked")
              }}
              className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                aiPanelMode === "left-docked" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold" : ""
              }`}
              title="AI Workflow Builder"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                if (aiPanelMode === "left-docked") setAiPanelMode("closed")
                setActiveSideTool(activeSideTool === "search" ? null : "search")
              }}
              className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeSideTool === "search" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold" : ""
              }`}
              title="Search canvas nodes"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (aiPanelMode === "left-docked") setAiPanelMode("closed")
                setActiveSideTool(activeSideTool === "add" ? null : "add")
              }}
              className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeSideTool === "add" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold" : ""
              }`}
              title="Add step node (+)"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (aiPanelMode === "left-docked") setAiPanelMode("closed")
                setActiveSideTool(activeSideTool === "outline" ? null : "outline")
              }}
              className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeSideTool === "outline" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold" : ""
              }`}
              title="Step Outline & Tree View"
            >
              <Layers className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (aiPanelMode === "left-docked") setAiPanelMode("closed")
                setActiveSideTool(activeSideTool === "history" ? null : "history")
              }}
              className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeSideTool === "history" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold" : ""
              }`}
              title="Version History & Audits"
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (aiPanelMode === "left-docked") setAiPanelMode("closed")
                setActiveSideTool(activeSideTool === "settings" ? null : "settings")
              }}
              className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeSideTool === "settings" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold" : ""
              }`}
              title="Canvas Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => setShowDottedGrid(!showDottedGrid)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showDottedGrid ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Toggle Dotted Grid Background"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* AI WORKFLOW ASSISTANT (Persistent across bottom-floating, left-docked, and minimized) */}
        {aiPanelMode !== "closed" && (
          <AIWorkflowAssistant
            mode={aiPanelMode}
            onModeChange={setAiPanelMode}
            catalog={ALL_AVAILABLE_APPS}
            steps={steps}
            onGenerateSteps={handleGenerateStepsWithAI}
            onRefineSteps={handleRefineStepsWithAI}
            onSelectStepToConfigure={handleOpenConfig}
            isBuildingWorkflow={isBuildingWorkflow}
            buildingProgress={buildingProgress}
            chatMessages={aiChatMessages}
            onChatMessagesChange={setAiChatMessages}
            lastPlan={aiLastPlan}
            onLastPlanChange={setAiLastPlan}
          />
        )}

        {/* EXPANDABLE LEFT SIDE TOOL PANEL FLOATING ISLAND */}
        {activeSideTool && (
          <div className="absolute left-16 top-4 bottom-4 w-80 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200 select-none">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                {activeSideTool === "search" && <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {activeSideTool === "add" && <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {activeSideTool === "outline" && <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {activeSideTool === "history" && <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {activeSideTool === "settings" && <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />}

                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {activeSideTool === "search" && "Search Canvas Steps"}
                  {activeSideTool === "add" && "Quick Add Action"}
                  {activeSideTool === "outline" && "Step Hierarchy & Flow"}
                  {activeSideTool === "history" && "Version Control & Audits"}
                  {activeSideTool === "settings" && "Workflow Policy & Canvas"}
                </h3>
              </div>

              <button
                onClick={() => setActiveSideTool(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Side Panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel Content Body */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* 1. SEARCH TOOL PANEL */}
              {activeSideTool === "search" && (
                <div className="space-y-3">
                  <div className="relative flex items-center">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3" />
                    <Input
                      type="text"
                      placeholder="Search by app name or event..."
                      value={sideSearchQuery}
                      onChange={(e) => setSideSearchQuery(e.target.value)}
                      className="pl-8 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-8 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Canvas Steps ({steps.length})
                    </span>
                    {steps
                      .filter(
                        (s) =>
                          s.appName.toLowerCase().includes(sideSearchQuery.toLowerCase()) ||
                          s.eventName.toLowerCase().includes(sideSearchQuery.toLowerCase())
                      )
                      .map((step, idx) => (
                        <div
                          key={step.id}
                          onClick={() => handleOpenConfig(step.id)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center space-x-2.5">
                            <AppIcon appId={step.appId} appName={step.appName} size={24} />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                                {idx + 1}. {step.appName}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{step.eventName}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 2. ADD STEP TOOL PANEL */}
              {activeSideTool === "add" && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Choose App to Append Step
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {ALL_AVAILABLE_APPS.filter((app) => app.actions.length > 0).slice(0, 6).map((app) => (
                      <button
                        key={app.id}
                        onClick={() => {
                          const firstEvent = app.actions[0] || app.triggers[0]
                          const newStep: WorkflowStep = {
                            id: `step_${Date.now()}`,
                            type: "action",
                            appId: app.id,
                            appName: app.name,
                            eventId: firstEvent?.id || "action",
                            eventName: firstEvent?.name || "Perform Action",
                            connectionId: userConnections.find(c => c.appId === app.id)?.id || (app.authType === "Internal SSO" ? `conn_${app.id}` : undefined),
                            status: "unmapped",
                            fieldMappings: {}
                          }
                          setSteps([...steps, newStep])
                          showToast(`Appended "${app.name}" action step!`)
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-all flex flex-col items-center justify-center space-y-2 text-center group cursor-pointer"
                      >
                        <AppIcon appId={app.id} appName={app.name} size={32} />
                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. OUTLINE & HIERARCHY TOOL PANEL */}
              {activeSideTool === "outline" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sequence ({steps.length} Steps)
                    </span>
                    <button
                      onClick={handleAddStep}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  {steps.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No steps yet. Click &quot;Add Trigger&quot; on the canvas to begin.
                    </div>
                  ) : (
                    steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <AppIcon appId={step.appId} appName={step.appName} size={20} />
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{step.appName}</h4>
                        </div>

                        <Badge
                          variant={step.status === "configured" ? "success" : "secondary"}
                          className="text-[9px] uppercase px-1.5 py-0.2"
                        >
                          {step.status}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7">{step.eventName}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 pl-7 text-[10px]">
                        <div className="flex items-center space-x-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveStep(idx, "up")}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            disabled={idx === steps.length - 1}
                            onClick={() => handleMoveStep(idx, "down")}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            ↓
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenConfig(step.id)}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            Configure
                          </button>
                          {step.type !== "trigger" && idx !== 0 && (
                            <button
                              onClick={() => requestDeleteStep(step.id, `${step.appName} - ${step.eventName}`)}
                              className="text-red-500 font-bold hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              )}

              {/* 4. CANVAS COMMENTS & NOTES TOOL PANEL */}
              {activeSideTool === "comments" && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Target Step
                    </span>
                    <select
                      value={selectedCommentStep}
                      onChange={(e) => setSelectedCommentStep(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-medium text-slate-800 dark:text-slate-200"
                    >
                      {steps.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.appName} ({s.eventName})
                        </option>
                      ))}
                    </select>

                    <Input
                      type="text"
                      placeholder="Type a team note or annotation..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-9 text-slate-800 dark:text-slate-200"
                    />
                    <Button type="submit" size="sm" className="w-full text-xs font-bold h-8">
                      Post Note
                    </Button>
                  </form>

                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Canvas Notes ({canvasComments.length})
                    </span>
                    {canvasComments.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{c.author}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.time}</span>
                        </div>
                        <Badge variant="blue" className="text-[9px] px-1.5 py-0.2">
                          @{c.stepName}
                        </Badge>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. VERSION HISTORY TOOL PANEL */}
              {activeSideTool === "history" && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Revision History Timeline
                  </span>
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className={`p-3 rounded-xl border transition-all space-y-2 ${
                        rev.isActive
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-2xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{rev.version}</span>
                          {rev.isActive && (
                            <Badge variant="success" className="text-[9px] px-1.5 py-0.2 uppercase">
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{rev.time}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">{rev.label}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>By {rev.author}</span>
                        {!rev.isActive && (
                          <button
                            onClick={() => handleRestoreRevision(rev.version)}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. CANVAS SETTINGS TOOL PANEL */}
              {activeSideTool === "settings" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Canvas Flow Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setCanvasOrientation("vertical")
                          handleResetPan()
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          canvasOrientation === "vertical"
                            ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-2xs"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                        <span>Vertical (↕)</span>
                      </button>
                      <button
                        onClick={() => {
                          setCanvasOrientation("horizontal")
                          handleResetPan()
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          canvasOrientation === "horizontal"
                            ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-2xs"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Horizontal (↔)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Auto-Retry on Failure
                    </label>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Exponential 3x Retry</span>
                      <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Execution Timeout Limit
                    </label>
                    <Select
                      value={executionTimeout}
                      onChange={(e) => setExecutionTimeout(e.target.value)}
                      options={[
                        { value: "30s", label: "30 Seconds" },
                        { value: "60s", label: "60 Seconds" },
                        { value: "300s", label: "5 Minutes" }
                      ]}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Error Alert Notification Email
                    </label>
                    <Input
                      type="email"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-9"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CENTER CANVAS WORKSPACE WITH 2D INFINITE PAN & DRAG */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className={`flex-1 bg-slate-50/60 dark:bg-slate-950 relative p-12 overflow-hidden flex justify-center items-start h-full transition-colors select-none rounded-tl-[28px] border-t border-l border-slate-200 dark:border-slate-800 shadow-2xs ${
            isPanningCanvas ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            touchAction: "none",
            ...(showDottedGrid
              ? {
                  backgroundImage: theme === "dark" ? "radial-gradient(#334155 1.2px, transparent 1.2px)" : "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
                }
              : {})
          }}
        >
          {/* Node Workspace Container */}
          {canvasOrientation === "vertical" ? (
            <div
              className="flex flex-col items-center pt-6 pb-20 select-none"
            style={{
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${numericZoom / 100})`,
              transition: isPanningCanvas ? "none" : "transform 0.1s ease-out"
            }}
          >
            {(!steps.length || (steps.length === 1 && !steps[0].appId)) ? (
              /* EMPTY CANVAS: ADD TRIGGER CARD */
              <div className="flex flex-col items-center justify-center pt-12 pb-20 select-none animate-in fade-in duration-200">
                <div
                  onClick={handleStartAddTrigger}
                  className="w-[480px] max-w-[90vw] min-h-[260px] bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-lg transition-all cursor-pointer group select-none"
                >
                  <div className="h-24 w-24 rounded-3xl bg-[#8ea1b4] dark:bg-slate-700 group-hover:bg-blue-600 transition-all flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md">
                    <Plus className="h-11 w-11 text-white stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Add Trigger
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline mt-1 cursor-pointer">
                    Choose Your First Application
                  </p>
                </div>

                {aiPanelMode === "closed" && (
                  <button
                    onClick={() => setAiPanelMode("bottom-floating")}
                    className="mt-4 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all hover:scale-105 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Build with AI</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {steps.map((step, idx) => {
              const isHovered = hoveredNodeId === step.id
              const isSelected = selectedStepId === step.id && stepDrawerOpen
              const isUnconfigured = !step.appId

              return (
                <React.Fragment key={step.id}>
                  {/* CANVAS STEP CARD WITH HOVER ACTIONS */}
                  <div
                    onMouseEnter={() => setHoveredNodeId(step.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => {
                      if (step.appId !== "router") {
                        handleOpenConfig(step.id)
                      }
                    }}
                    className={`w-80 md:w-96 rounded-2xl border-2 shadow-xs transition-all px-5 py-4 flex items-center justify-between relative select-none group/card ${
                      step.appId === "router" ? "cursor-default" : "cursor-pointer"
                    } ${
                      isSelected && step.appId !== "router"
                        ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-950 bg-white dark:bg-slate-900"
                        : isUnconfigured
                        ? "border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md bg-white dark:bg-slate-900"
                    } ${
                      activeAiGeneratingStepId === step.id
                        ? "border-blue-500 ring-4 ring-blue-400/40 shadow-xl animate-pulse scale-102"
                        : ""
                    }`}
                  >
                    {/* Left: BRAND ICON + APP NAME */}
                    <div className="flex items-center space-x-4 flex-1">
                      {isUnconfigured ? (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                          <Plus className="h-5 w-5" />
                        </div>
                      ) : (
                        <AppIcon appId={step.appId} appName={step.appName} size={40} />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-medium text-slate-400 block">
                          {idx + 1}. {step.type === "trigger" ? "Trigger" : "Action"}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight flex items-center space-x-2">
                          <span>{isUnconfigured ? (step.type === "trigger" ? "Select Trigger App" : "Select Action App") : step.appName}</span>
                          {step.appId === "router" && (
                            <Badge variant="blue" className="text-[9px] font-bold px-1.5 py-0">Router</Badge>
                          )}
                          {activeAiGeneratingStepId === step.id && (
                            <Badge variant="blue" className="text-[9px] font-bold px-1.5 py-0 bg-blue-600 text-white animate-pulse flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>AI Adding...</span>
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {isUnconfigured ? "Click to choose app from catalog" : step.eventName}
                        </p>
                      </div>
                    </div>

                    {/* Right: ACTION BUTTONS */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <div
                        className={`flex items-center space-x-1 transition-all duration-200 ${
                          isHovered || isUnconfigured ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-2 pointer-events-none"
                        }`}
                      >
                        {step.appId === "router" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddBranchToRouter(step.id)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Add Route Branch"
                          >
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                          </button>
                        )}

                        {!isUnconfigured && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyNode(step)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy Step"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}

                        {!isUnconfigured && step.appId !== "router" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenConfig(step.id)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Step Setup"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}

                        {step.type !== "trigger" && idx !== 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              requestDeleteStep(step.id, isUnconfigured ? "Unconfigured Step" : `${step.appName} - ${step.eventName}`)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete Step"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {copiedTooltipId === step.id && (
                      <div className="absolute -top-7 right-4 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-30 animate-in fade-in">
                        Copied!
                      </div>
                    )}
                  </div>

                  {/* ROUTER MULTI-BRANCH CANVAS PARALLEL FILTER NODES TREE */}
                  {step.appId === "router" && (
                    <div className="flex flex-col items-center w-full my-1 animate-in fade-in zoom-in-95 duration-200">
                      {/* SOLID vertical connector from Router Card to Splitter */}
                      <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700" />

                      {/* SOLID Horizontal Branch Splitter Line - Mathematically Aligned to Column Centers */}
                      {(() => {
                        const suffixes = routerBranchKeys[step.id] || ["a", "b"]
                        const currentBranches = suffixes.map((s) => {
                          const letter = s.toUpperCase()
                          return {
                            id: s === "a" ? "rt_1" : s === "b" ? "rt_2" : `${step.id}_rt_${s}`,
                            name: `Route ${letter}`,
                            suffix: s,
                            key: s === "a" ? "routeA" : s === "b" ? "routeB" : `${step.id}_br_${s}`,
                            appId: "filter",
                            appName: "Filter",
                            eventId: "apply_filter_rules",
                            eventName: `Filter Values (Route ${letter})`
                          }
                        })

                        if (currentBranches.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 my-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2.5">No routes configured in this Router</p>
                              <button
                                onClick={() => handleAddBranchToRouter(step.id)}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Add Route</span>
                              </button>
                            </div>
                          )
                        }

                        const gap = 36
                        const branchWidths = currentBranches.map((b) => getBranchWidth(b.key, 1))

                        let currentLeft = 0
                        const columnCenters: number[] = []
                        for (let i = 0; i < currentBranches.length; i++) {
                          const w = branchWidths[i]
                          columnCenters.push(currentLeft + w / 2)
                          currentLeft += w + gap
                        }
                        const level1GridWidth = currentLeft - gap
                        const wireLeft = columnCenters[0]
                        const wireWidth = columnCenters[columnCenters.length - 1] - columnCenters[0]

                        return (
                          <div style={{ width: `${level1GridWidth}px` }} className="flex flex-col items-center transition-all duration-300">
                            {/* Horizontal Splitter Line Spanning Exactly between Outer Column Centers */}
                            <div className="relative w-full h-4">
                              <div
                                style={{
                                  left: `${wireLeft}px`,
                                  width: `${wireWidth}px`
                                }}
                                className="absolute top-0 h-0.5 bg-slate-300 dark:bg-slate-700 transition-all duration-300"
                              />

                              {columnCenters.map((centerPx, idx) => (
                                <div
                                  key={idx}
                                  style={{ left: `${centerPx}px` }}
                                  className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700 absolute top-0 -translate-x-1/2 transition-all duration-300"
                                />
                              ))}
                            </div>

                            {/* Parallel Filter Child Cards Flex Container with Dedicated Column Widths */}
                            <div
                              className="flex justify-center items-start w-full mt-0"
                              style={{ gap: `${gap}px` }}
                            >
                              {currentBranches.map((route, rIdx) => {
                                const colWidth = branchWidths[rIdx]
                                const cond = getBranchCondition(route.key, rIdx)
                                const opSymbol = getOpSymbol(cond.op)
                                const fieldName = cond.field
                                const compareVal = cond.val

                                const currentRouteSteps = route.key === "routeA" ? routeASteps : route.key === "routeB" ? routeBSteps : (branchSteps[route.key] || [])

                                return (
                                  <div
                                    key={route.id}
                                    style={{ width: `${colWidth}px` }}
                                    className="flex flex-col items-center shrink-0 transition-all duration-300"
                                  >
                                    <div
                                      onClick={() => handleOpenRouteConfig(step.id, route.key)}
                                      className={`w-80 md:w-96 rounded-2xl border-2 shadow-xs transition-all px-5 py-4 flex items-center justify-between relative select-none group/route cursor-pointer ${
                                        selectedStepId === step.id && activeRouteId === route.key && stepDrawerOpen
                                          ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-950 bg-white dark:bg-slate-900 shadow-md"
                                          : "border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md bg-white dark:bg-slate-900"
                                      }`}
                                    >
                                      {/* Left: BRAND ICON + STEP DETAILS */}
                                      <div className="flex items-center space-x-4 flex-1">
                                        <AppIcon appId="filter" appName="Filter" size={40} />
                                        <div className="space-y-0.5">
                                          <span className="text-[10px] font-medium text-slate-400 block">
                                            {route.name} • Filter
                                          </span>
                                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                            Filter
                                          </h4>
                                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[220px]">
                                            IF {fieldName || "Field"} {opSymbol} {compareVal}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Right: EDIT ACTION + DELETE BUTTON FOR ROUTE FILTER */}
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenRouteConfig(step.id, route.key)
                                          }}
                                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                          title="Edit Route Condition"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            requestDeleteBranch(step.id, route.suffix, route.key, route.name)
                                          }}
                                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                          title={`Delete ${route.name}`}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* PER-ROUTE NESTED ACTION STEPS LIST */}
                                    {currentRouteSteps.map((rStep, sIdx) => {
                                      const isSelected = selectedStepId === rStep.id && stepDrawerOpen
                                      const isUnconfigured = !rStep.appId
                                      const isHovered = hoveredNodeId === rStep.id

                                      return (
                                        <div key={rStep.id} className="flex flex-col items-center my-2 animate-in fade-in">
                                          <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                                          <div
                                            onMouseEnter={() => setHoveredNodeId(rStep.id)}
                                            onMouseLeave={() => setHoveredNodeId(null)}
                                            onClick={() => {
                                              if (rStep.appId !== "router") {
                                                handleOpenConfig(rStep.id)
                                              }
                                            }}
                                            className={`w-80 md:w-96 rounded-2xl border-2 shadow-xs transition-all px-5 py-4 flex items-center justify-between relative select-none group/rcard ${
                                              rStep.appId === "router" ? "cursor-default" : "cursor-pointer"
                                            } ${
                                              isSelected && rStep.appId !== "router"
                                                ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-950 bg-white dark:bg-slate-900"
                                                : isUnconfigured
                                                ? "border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md bg-white dark:bg-slate-900"
                                            }`}
                                          >
                                            <div className="flex items-center space-x-4 flex-1">
                                              {isUnconfigured ? (
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                                                  <Plus className="h-5 w-5" />
                                                </div>
                                              ) : (
                                                <AppIcon appId={rStep.appId} appName={rStep.appName} size={40} />
                                              )}
                                              <div className="space-y-0.5">
                                                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 block">
                                                  {route.name} • Action {sIdx + 1}
                                                </span>
                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight flex items-center space-x-2">
                                                  <span>{isUnconfigured ? "Select Action App" : rStep.appName}</span>
                                                  {rStep.appId === "router" && (
                                                    <Badge variant="blue" className="text-[9px] font-bold px-1.5 py-0">Router</Badge>
                                                  )}
                                                </h4>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                                  {isUnconfigured ? "Click to choose app from catalog" : rStep.eventName}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-1 shrink-0">
                                              <div
                                                className={`flex items-center space-x-1 transition-all duration-200 ${
                                                  isHovered || isUnconfigured ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-2 pointer-events-none"
                                                }`}
                                              >
                                                {rStep.appId === "router" && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleAddBranchToRouter(rStep.id)
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                    title="Add Route Branch"
                                                  >
                                                    <Plus className="h-4 w-4 stroke-[2.5]" />
                                                  </button>
                                                )}
                                                {!isUnconfigured && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleCopyNode(rStep)
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                    title="Copy Step"
                                                  >
                                                    <Copy className="h-4 w-4" />
                                                  </button>
                                                )}
                                                {!isUnconfigured && rStep.appId !== "router" && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleOpenConfig(rStep.id)
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                    title="Edit Step Setup"
                                                  >
                                                    <Edit2 className="h-4 w-4" />
                                                  </button>
                                                )}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    const rKey = route.key === "routeA" ? "Route A" : route.key === "routeB" ? "Route B" : route.key
                                                    requestDeleteBranchStep(rKey, rStep.id, isUnconfigured ? "Unconfigured Step" : `${rStep.appName} - ${rStep.eventName}`)
                                                  }}
                                                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                                  title="Delete Step from Route"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </button>
                                              </div>
                                            </div>
                                            {copiedTooltipId === rStep.id && (
                                              <div className="absolute -top-7 right-4 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-30 animate-in fade-in">
                                                Copied!
                                              </div>
                                            )}
                                          </div>

                                          {/* RECURSIVE ROUTER BRANCH RENDERING: SUPPORTS INFINITE ROUTER NESTING */}
                                          {rStep.appId === "router" && renderRouterBranches(rStep.id, 2)}
                                        </div>
                                      )
                                    })}

                                    {/* PER-ROUTE ACTION CONNECTOR INSERTION BUTTON (Hidden if route contains a nested Router Node) */}
                                    {!currentRouteSteps.some((s) => s.appId === "router") && (
                                      <div className="flex flex-col items-center justify-center pt-2">
                                        <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (route.key === "routeA") handleAddStepToRoute("Route A")
                                            else if (route.key === "routeB") handleAddStepToRoute("Route B")
                                            else handleAddStepToBranch(route.key, route.name)
                                          }}
                                          className="h-7 px-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs flex items-center space-x-1.5 text-[11px] font-semibold transition-all hover:scale-105 cursor-pointer"
                                          title={`Add action step in ${route.name}`}
                                        >
                                          <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                          <span>Add Action in {route.name}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}
              </div>
            )}

                  {/* INTERACTIVE & INTUITIVE STEP CONNECTOR WITH DROP TARGET & '+' INSERT ACTION (Hidden after Router Node) */}
                  {idx < steps.length - 1 && step.appId !== "router" && (
                    <div className="flex flex-col items-center my-2 relative group/line transition-all">
                      {/* Top connector segment */}
                      <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700 group-hover/line:bg-blue-500 transition-colors" />

                      {/* Interactive '+' Insert Step Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleInsertStepAfter(idx)
                        }}
                        className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover/line:border-blue-600 dark:group-hover/line:border-blue-400 group-hover/line:text-blue-600 dark:group-hover/line:text-blue-400 group-hover/line:bg-blue-50 dark:group-hover/line:bg-slate-800 hover:scale-110 shadow-2xs transition-all flex items-center justify-center cursor-pointer z-10 my-0.5"
                        title="Insert action step here"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>

                      {/* Bottom connector segment with direction chevron indicator */}
                      <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700 group-hover/line:bg-blue-500 transition-colors relative flex items-end justify-center">
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover/line:text-blue-600 dark:group-hover/line:text-blue-400 -mb-2.5 transition-colors" />
                      </div>

                      {/* Tooltip Badge on Hover */}
                      <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/line:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md whitespace-nowrap pointer-events-none z-20">
                        + Insert step here
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )
            })}

            {/* Add Final Step Node '+' Affordance (Hidden when the last step is a Router Node) */}
            {steps.length > 0 && steps[0]?.appId && steps[steps.length - 1]?.appId !== "router" && (
              <div className="flex flex-col items-center mt-6">
                <button
                  onClick={handleAddStep}
                  className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-110"
                  title="Add Next Action Step"
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
            )}
              </>
            )}
            </div>
          ) : (
            /* HORIZONTAL FLOW WORKSPACE: SLEEK COMPACT NODES MATCHING REFERENCE */
            <div
              className="flex flex-row items-center pt-20 pb-24 px-16 select-none min-w-max animate-in fade-in zoom-in-95 duration-200"
              style={{
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${numericZoom / 100})`,
                transition: isPanningCanvas ? "none" : "transform 0.1s ease-out"
              }}
            >
              {(!steps.length || (steps.length === 1 && !steps[0].appId)) ? (
                /* EMPTY CANVAS: ADD TRIGGER CARD */
                <div className="flex flex-col items-center justify-center py-12 px-8 select-none animate-in fade-in duration-200">
                  <div
                    onClick={handleStartAddTrigger}
                    className="w-[480px] max-w-[90vw] min-h-[260px] bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-lg transition-all cursor-pointer group select-none"
                  >
                    <div className="h-24 w-24 rounded-3xl bg-[#8ea1b4] dark:bg-slate-700 group-hover:bg-blue-600 transition-all flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md">
                      <Plus className="h-11 w-11 text-white stroke-[2.5]" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Add Trigger
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline mt-1 cursor-pointer">
                      Choose Your First Application
                    </p>
                  </div>

                  {aiPanelMode === "closed" && (
                    <button
                      onClick={() => setAiPanelMode("bottom-floating")}
                      className="mt-4 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all hover:scale-105 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Build with AI</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {steps.map((step, idx) => {
                const isHovered = hoveredNodeId === step.id
                const isSelected = selectedStepId === step.id && stepDrawerOpen
                const isRouter = step.appId === "router"
                const isUnconfigured = !step.appId

                return (
                  <React.Fragment key={`h_${step.id}`}>
                    {/* Compact Step Node (Big App Icon on Top + Title & Subtitle Below in White Card) */}
                    <div
                      onClick={() => {
                        if (!isRouter) {
                          handleOpenConfig(step.id)
                        }
                      }}
                      onMouseEnter={() => setHoveredNodeId(step.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`flex flex-col items-center justify-center text-center group/hnode relative p-4 w-36 sm:w-40 rounded-2xl border-2 shadow-xs transition-all select-none shrink-0 ${
                        isRouter ? "cursor-default" : "cursor-pointer"
                      } ${
                        isSelected && !isRouter
                          ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-950 shadow-sm bg-white dark:bg-slate-900"
                          : isUnconfigured
                          ? "border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md bg-white dark:bg-slate-900"
                      } ${
                        activeAiGeneratingStepId === step.id
                          ? "border-blue-500 ring-4 ring-blue-400/40 shadow-xl animate-pulse scale-102"
                          : ""
                      }`}
                    >
                      {/* Big App Icon on Top or Node Selector Squircle */}
                      {isUnconfigured ? (
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-xs">
                          <Plus className="h-6 w-6" />
                        </div>
                      ) : (
                        <HorizontalAppSquircle
                          appId={step.appId}
                          appName={step.appName}
                          size={56}
                          isTrigger={step.type === "trigger"}
                        />
                      )}

                      {/* Title & Subtitle Downside below the icon */}
                      <div className="mt-2.5 space-y-0.5 w-full">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block leading-tight">
                          {idx + 1}. {step.type === "trigger" ? "Trigger" : "Action"}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight leading-snug truncate">
                          {isUnconfigured ? (step.type === "trigger" ? "Select Trigger" : "Select Action") : step.appName}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate w-full">
                          {isUnconfigured ? "Click to choose" : step.eventName}
                        </p>
                      </div>

                      {/* Quick Action Hover Bar */}
                      <div
                        className={`absolute -top-3 right-0 transition-opacity flex items-center space-x-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg p-0.5 z-20 ${
                          isHovered || isUnconfigured ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        }`}
                      >
                        {isRouter && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddBranchToRouter(step.id)
                            }}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                            title="Add Route Branch"
                          >
                            <Plus className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        )}
                        {!isUnconfigured && !isRouter && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenConfig(step.id)
                            }}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                            title="Configure Step"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}
                        {!isUnconfigured && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyNode(step)
                            }}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded transition-colors cursor-pointer"
                            title="Copy Step"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                        {step.type !== "trigger" && idx !== 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              requestDeleteStep(step.id, isUnconfigured ? "Unconfigured Step" : `${step.appName} - ${step.eventName}`)
                            }}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
                            title="Delete Step"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* If step is a Router, render its horizontal tree */}
                    {isRouter && renderHorizontalRouterBranches(step.id, 1)}

                    {/* Horizontal Connector Wire between steps (if not last step and not router) */}
                    {idx < steps.length - 1 && !isRouter && (
                      <div className="flex items-center shrink-0">
                        <div className="w-14 h-0.5 bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center group/wire">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInsertStepAfter(idx)
                            }}
                            className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-400 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center shadow-2xs hover:scale-110 transition-all cursor-pointer z-10"
                            title="Insert step here"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )
              })}

              {/* Append Step '+' Button at the end (hidden if last step is a router) */}
              {steps.length > 0 && steps[0]?.appId && steps[steps.length - 1]?.appId !== "router" && (
                <div className="flex items-center shrink-0 ml-2">
                  <div className="w-10 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />
                  <button
                    onClick={handleAddStep}
                    className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-110 shrink-0"
                    title="Add Next Action Step"
                  >
                    <Plus className="h-5 w-5 stroke-[2.5]" />
                  </button>
                </div>
              )}
                </>
              )}
            </div>
          )}

          {/* FLOATING CANVAS MOUSE ZOOM ACTION BUTTON CONTROLS (BOTTOM RIGHT) */}
          <div className="absolute bottom-6 right-6 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-1.5 flex items-center space-x-1 select-none">
            {/* Flow Orientation Switcher: Vertical ↕ vs Horizontal ↔ */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 mr-1">
              <button
                onClick={() => {
                  setCanvasOrientation("vertical")
                  handleResetPan()
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  canvasOrientation === "vertical"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Vertical Flow View (Top-to-Bottom)"
              >
                <ArrowDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Vertical</span>
              </button>
              <button
                onClick={() => {
                  setCanvasOrientation("horizontal")
                  handleResetPan()
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  canvasOrientation === "horizontal"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Horizontal Flow View (Left-to-Right)"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Horizontal</span>
              </button>
            </div>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
              title="Zoom Out (-10%)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <button
              onClick={handleResetPan}
              className="px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-mono bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
              title="Click to Reset Zoom & Recenter Canvas"
            >
              {zoomPercent}
            </button>

            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
              title="Zoom In (+10%)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={handleResetPan}
              className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer relative ${
                panOffset.x !== 0 || panOffset.y !== 0
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800"
              }`}
              title="Recenter Canvas View"
            >
              <Crosshair className="h-4 w-4" />
              {(panOffset.x !== 0 || panOffset.y !== 0) && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Screen 9: Right Configuration Drawer Panel with Drag Resizing & Width Presets */}
      <Drawer
        open={stepDrawerOpen}
        onOpenChange={(open) => {
          setStepDrawerOpen(open)
          if (!open) {
            setActiveRouteId(null)
            setIsDrawerMaximized(false)
          }
        }}
        side="right"
        style={{ width: `${drawerWidth}px` }}
        header={drawerHeader}
        footer={drawerFooter}
        isMaximized={isDrawerMaximized}
        className={cn("transition-[width] duration-75 ease-out relative", !isDrawerMaximized && "max-w-[95vw]")}
      >
        {/* INTERACTIVE DRAG HANDLE TO RESIZE DRAWER WIDTH (Hidden when maximized) */}
        {!isDrawerMaximized && (
          <div
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizingDrawer(true)
            }}
            className={`absolute left-0 top-0 bottom-0 w-2.5 hover:w-3.5 -ml-1 z-50 cursor-col-resize flex items-center justify-center transition-all group select-none ${
              isResizingDrawer ? "bg-blue-500/40 w-3.5" : "hover:bg-blue-500/20"
            }`}
            title="Click and drag left/right to resize drawer width"
          >
            <div className="w-1 h-12 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors shadow-2xs flex flex-col items-center justify-center space-y-1 py-1">
              <div className="w-0.5 h-1 bg-slate-400 rounded-full" />
              <div className="w-0.5 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
        )}

        {selectedStep && (
          <div className="space-y-6">
            {/* TAB CONTENT: CONNECTIONS TAB VS SETUP WIZARD */}
            {activeTab === "connections" ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header with App Info & Back Button */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center space-x-3.5">
                    <AppIcon
                      appId={selectedStep.appId === "router" && currentTargetedBranch ? "filter" : (effectiveAppId || selectedStep.appId)}
                      appName={selectedStep.appId === "router" && currentTargetedBranch ? "Filter" : selectedStep.appName}
                      size={40}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                          {selectedStep.appId === "router" && currentTargetedBranch
                            ? `${currentTargetedBranch.name} • Filter Rules`
                            : `${selectedStep.appName} Connections`}
                        </h4>
                        {selectedStep.appId === "router" && currentTargetedBranch ? (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Active Filter</span>
                          </span>
                        ) : isStepReadyForConfig ? (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Connected</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                            1 Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedStep.appId === "router" && currentTargetedBranch
                          ? `Define conditional filter criteria that must match for ${currentTargetedBranch.name} to execute.`
                          : isAuthOptionalApp
                          ? "Native workflow module — configure action fields and variable mappings below"
                          : `Manage authentication and configure dynamic action fields for ${selectedStep.appName}`}
                      </p>
                    </div>
                  </div>

                  {!(selectedStep.appId === "router" && currentTargetedBranch) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab("setup")}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 space-x-1.5 cursor-pointer shadow-none"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Setup</span>
                    </Button>
                  )}
                </div>

                {isAuthOptionalApp ? (
                  /* NATIVE / AUTH-OPTIONAL MODULES: FLOW CONTROL & UTILITIES */
                  <div className="space-y-5">
                    {!(selectedStep.appId === "router" && currentTargetedBranch) && (
                      <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                            {isUIWebhookTrigger
                              ? `${selectedStep.appName} Instant Webhook Mode`
                              : "Native Component (No External Auth Required)"}
                          </h5>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            {isUIWebhookTrigger
                              ? "No external OAuth verification required. Copy the Webhook URL below and paste into your app's webhook settings."
                              : `${selectedStep.appName} executes directly inside the workflow engine. Configure the fields, variable mappings, and test requests below.`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Action Fields Engine */}
                    {renderActionFieldsBlock()}
                  </div>
                ) : (
                  /* SAAS INTEGRATIONS REQUIRING CONNECTION */
                  <>
                    {/* INTEGRATION CONNECTION HEADER CARD */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                          <Plug className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            Connect {selectedStep.appName} Account
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            All connections are fully encrypted and secure.{" "}
                            <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                              View privacy policy
                            </a>
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">
                        {selectedApp?.authType || "API Key"}
                      </Badge>
                    </div>

                    {/* TAB SWITCHER: EXISTING VS NEW CONNECTION */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Choose Connection Method
                      </label>
                      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setConnectionMode("existing")}
                          className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                            connectionMode === "existing"
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 shadow-none"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                          }`}
                        >
                          <Layers className={`h-3.5 w-3.5 shrink-0 ${connectionMode === "existing" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                          <span>Select Existing Connection</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConnectionMode("new")}
                          className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                            connectionMode === "new"
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 shadow-none"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                          }`}
                        >
                          <Plus className={`h-3.5 w-3.5 shrink-0 ${connectionMode === "new" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                          <span>Add New Connection</span>
                        </button>
                      </div>
                    </div>

                    {/* OPTION 1: USE EXISTING CONNECTION */}
                    {connectionMode === "existing" && (
                      <div className="space-y-4 animate-in fade-in duration-150">
                        {userConnections.filter(c => c.appId === (effectiveAppId || selectedStep.appId)).length > 0 ? (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Select Connection *
                              </label>
                              <Select
                                value={
                                  selectedStep.connectionId && userConnections.some(c => c.id === selectedStep.connectionId && c.appId === (effectiveAppId || selectedStep.appId))
                                    ? selectedStep.connectionId
                                    : (userConnections.find(c => c.appId === (effectiveAppId || selectedStep.appId))?.id || "")
                                }
                                onChange={(e) => {
                                  const selectedId = e.target.value
                                  const conn = userConnections.find(c => c.id === selectedId)
                                  updateSelectedStep((s) => ({
                                    ...s,
                                    connectionId: selectedId,
                                    status: "configured"
                                  }))
                                  if (conn) {
                                    showToast(`Selected "${conn.accountLabel}" for this step!`)
                                  }
                                }}
                                options={userConnections
                                  .filter(c => c.appId === (effectiveAppId || selectedStep.appId))
                                  .map((conn) => ({
                                    value: conn.id,
                                    label: conn.accountLabel
                                  }))}
                                placeholder="Select a connected account..."
                                className="text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
                              />
                            </div>

                            {/* DYNAMIC ACTION FIELDS RENDERED DIRECTLY UNDER THE DROPDOWN */}
                            {isStepConnected ? (
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                                {renderActionFieldsBlock()}
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                <p className="font-semibold">Select an account from the dropdown above to display action configuration fields.</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mx-auto flex items-center justify-center">
                              <Plug className="h-6 w-6" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                No Existing Connections Found
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                                You have not connected any {selectedStep.appName} accounts yet. Click below to add a connection.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setConnectionMode("new")}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs space-x-1.5 mt-2 cursor-pointer shadow-none"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add New Connection</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* OPTION 2: CREATE NEW CONNECTION */}
                    {connectionMode === "new" && (
                      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-150">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              New Connection Name *
                            </label>
                            <Input
                              value={newConnLabel}
                              onChange={(e) => setNewConnLabel(e.target.value)}
                              placeholder={
                                selectedStep.appId === "automate-chats"
                                  ? `Automate Chats #${userConnections.filter(c => c.appId === "automate-chats").length + 1}`
                                  : selectedStep.appId === "automate-forms"
                                  ? `Automate Forms #${userConnections.filter(c => c.appId === "automate-forms").length + 1}`
                                  : `${selectedStep.appName} #${userConnections.filter(c => c.appId === (effectiveAppId || selectedStep.appId)).length + 1}`
                              }
                              className="text-xs bg-white dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Name your connection with {selectedStep.appName}
                            </span>
                          </div>

                          {/* Authentication Method UI */}
                          {selectedStep.appId === "automate-chats" || selectedStep.appId === "automate-forms" ? (
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Token*
                              </label>
                              <Input
                                type="password"
                                value={newConnApiKey}
                                onChange={(e) => setNewConnApiKey(e.target.value)}
                                placeholder="Paste API token here..."
                                className="text-xs font-mono bg-white dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-700"
                              />
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Enter the API token here. Login to the{" "}
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 font-medium"
                                >
                                  {selectedStep.appName} account
                                </a>
                                . Navigate to &quot;Settings,&quot; then select &quot;API and Webhooks&quot; and copy the API token.
                              </p>
                            </div>
                          ) : selectedApp?.authType === "Internal SSO" ? (
                            <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-900/60 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-300 font-semibold">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Automate Native Suite — Shared Workspace Session</span>
                              </div>
                              <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                                <strong>{selectedStep.appName}</strong> is built directly into Automate Workflows. It authenticates through your active organization workspace session — no passwords, API keys, or OAuth redirects required.
                              </p>
                            </div>
                          ) : selectedApp?.authType === "API Key" || selectedApp?.authType === "Private App Token" || selectedApp?.authType === "Bot Token" ? (
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {selectedStep.appName} {selectedApp?.authType === "Private App Token" ? "Private App Token" : selectedApp?.authType === "Bot Token" ? "Bot Token" : "API Key / Token"}*
                              </label>
                              <Input
                                type="password"
                                value={newConnApiKey}
                                onChange={(e) => setNewConnApiKey(e.target.value)}
                                placeholder={selectedApp?.authType === "Bot Token" ? "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" : "Paste secret token or key..."}
                                className="text-xs font-mono bg-white dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-700"
                              />
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Found in your {selectedStep.appName} {selectedApp?.authType === "Bot Token" ? "via @BotFather" : selectedApp?.authType === "Private App Token" ? "Settings > Integrations > Private Apps" : "Developer / Settings console"}.
                              </p>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-300 font-semibold">
                                <Lock className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>Secure OAuth 2.0 Handshake</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                Clicking Connect will open a secure window to authenticate with {selectedStep.appName}. Automate Workflows does not store your password.
                              </p>
                              {(effectiveAppId === "hubspot" || selectedStep.appId === "hubspot") && (
                                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-blue-200/60 dark:border-blue-900/60 space-y-1 text-[11px]">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">HubSpot Permission Scopes:</span>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">crm.objects.contacts.write</span>
                                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">crm.objects.deals.write</span>
                                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">crm.objects.companies.write</span>
                                  </div>
                                </div>
                              )}
                              {(effectiveAppId === "typeform" || selectedStep.appId === "typeform") && (
                                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-blue-200/60 dark:border-blue-900/60 space-y-1 text-[11px]">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">Typeform Permission Scopes:</span>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">forms:read</span>
                                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">webhooks:write</span>
                                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">responses:read</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Authorize & Save Button */}
                        <div className="pt-2">
                          <Button
                            className="w-full font-bold text-xs h-10 space-x-2 text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
                            disabled={isConnectingAccount}
                            onClick={() => {
                              setIsConnectingAccount(true)
                              setTimeout(() => {
                                const newConnId = `conn_${Date.now()}`
                                const defaultLabel = selectedStep.appId === "automate-chats"
                                  ? `Automate Chats #${userConnections.filter(c => c.appId === "automate-chats").length + 1}`
                                  : selectedStep.appId === "automate-forms"
                                  ? `Automate Forms #${userConnections.filter(c => c.appId === "automate-forms").length + 1}`
                                  : `${selectedStep.appName} Account (${Math.floor(1000 + Math.random() * 9000)})`
                                const label = newConnLabel.trim() || defaultLabel
                                const newConn: UserConnection = {
                                  id: newConnId,
                                  appId: effectiveAppId || selectedStep.appId,
                                  appName: selectedStep.appName,
                                  accountLabel: label,
                                  status: "Active",
                                  lastUsed: "Just now",
                                  authType: selectedApp?.authType || "API Key"
                                }
                                setUserConnections((prev) => [newConn, ...prev])
                                updateSelectedStep((s) => ({
                                  ...s,
                                  connectionId: newConnId,
                                  status: "configured"
                                }))
                                setIsConnectingAccount(false)
                                setNewConnLabel("")
                                setNewConnApiKey("")
                                setConnectionMode("existing")
                                showToast(`Connected "${label}" successfully! Action fields are ready below.`)
                              }, 600)
                            }}
                          >
                            {isConnectingAccount ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Connecting Account...</span>
                              </>
                            ) : selectedStep.appId === "automate-chats" || selectedStep.appId === "automate-forms" ? (
                              <>
                                <Key className="h-4 w-4" />
                                <span>Save & Connect Account</span>
                              </>
                            ) : selectedApp?.authType === "API Key" || selectedApp?.authType === "Private App Token" || selectedApp?.authType === "Bot Token" ? (
                              <>
                                <Key className="h-4 w-4" />
                                <span>Save & Connect API Key</span>
                              </>
                            ) : (
                              <>
                                <Plug className="h-4 w-4" />
                                <span>Authorize & Connect Account</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {/* 2-STEP WIZARD VIEW 1: APP SELECTION GRID */}
                {drawerStep === "app_select" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Step 1: Choose App
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Select an app from SaaS integrations, Flow Control, or Utilities
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {filteredApps.length} Apps available
                  </span>
                </div>

                {/* Category Pills Bar */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {["All", "Flow Control", "Utilities", "SaaS Apps", "My Custom Apps (Dev)"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAppCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        appCategoryFilter === cat
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* App Search Bar */}
                <div className="relative flex items-center">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3" />
                  <Input
                    type="text"
                    placeholder="Search app by name or category..."
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    className="pl-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 h-9"
                  />
                  {appSearchQuery && (
                    <button
                      onClick={() => setAppSearchQuery("")}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Responsive Grid of App Cards - Spans across the whole screen / drawer without cutoff */}
                <div
                  className={cn(
                    "grid gap-4 w-full pt-1 pb-8",
                    isDrawerMaximized
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                      : "grid-cols-2 sm:grid-cols-3"
                  )}
                >
                  {filteredApps.map((app) => {
                    const isSelected = selectedStep.appId === app.id
                    
                    // Check if selectedStep is at the end of its respective execution chain (main workflow, Route A, Route B, or nested branch)
                    let isLastStepOfChain = false
                    let chainHasRouter = false

                    const rootIndex = steps.findIndex((s) => s.id === selectedStep.id)
                    if (rootIndex !== -1) {
                      isLastStepOfChain = rootIndex === steps.length - 1 && steps.length > 1
                      chainHasRouter = steps.some((s) => s.appId === "router" && s.id !== selectedStep.id)
                    } else {
                      const rAIndex = routeASteps.findIndex((s) => s.id === selectedStep.id)
                      if (rAIndex !== -1) {
                        isLastStepOfChain = rAIndex === routeASteps.length - 1
                        chainHasRouter = routeASteps.some((s) => s.appId === "router" && s.id !== selectedStep.id)
                      } else {
                        const rBIndex = routeBSteps.findIndex((s) => s.id === selectedStep.id)
                        if (rBIndex !== -1) {
                          isLastStepOfChain = rBIndex === routeBSteps.length - 1
                          chainHasRouter = routeBSteps.some((s) => s.appId === "router" && s.id !== selectedStep.id)
                        } else {
                          for (const bList of Object.values(branchSteps)) {
                            const bIdx = bList.findIndex((s) => s.id === selectedStep.id)
                            if (bIdx !== -1) {
                              isLastStepOfChain = bIdx === bList.length - 1
                              chainHasRouter = bList.some((s) => s.appId === "router" && s.id !== selectedStep.id)
                              break
                            }
                          }
                        }
                      }
                    }

                    const isExistingConfiguredNode = selectedStep.status === "configured" || (!selectedStep.isNewStep && selectedStep.appId !== "")
                    const isRouterBlocked = app.id === "router" && (!isLastStepOfChain || chainHasRouter || isExistingConfiguredNode)

                    return (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/json", JSON.stringify({ type: "app", appId: app.id, appName: app.name }))
                          e.dataTransfer.effectAllowed = "copy"
                        }}
                        onClick={() => {
                          if (app.id === "router" && isRouterBlocked) {
                            showToast("Router Node can only be added at the end of a workflow or route branch.", "warning")
                            return
                          }

                          const isTrigger = selectedStep.type === "trigger" || selectedStepId === steps[0]?.id
                          const firstEvent = isTrigger ? (app.triggers[0] || app.actions[0]) : (app.actions[0] || app.triggers[0])
                          const defaultRoutes = app.id === "router" ? [
                            { id: `rt_1_${Date.now()}`, name: "Route A", appId: "filter", appName: "Filter", eventId: "apply_filter_rules", eventName: "Filter Values (Route A)" },
                            { id: `rt_2_${Date.now()}`, name: "Route B", appId: "filter", appName: "Filter", eventId: "apply_filter_rules", eventName: "Filter Values (Route B)" }
                          ] : undefined

                          const existingConn = userConnections.find((c) => c.appId === app.id)

                          if (app.id === "router") {
                            setRouterBranchKeys((prev) => ({
                              ...prev,
                              [selectedStep.id]: prev[selectedStep.id] || ["a", "b"]
                            }))
                            updateSelectedStep((s) => ({
                              ...s,
                              appId: app.id,
                              appName: app.name,
                              eventId: firstEvent?.id || "",
                              eventName: firstEvent?.name || (isTrigger ? "Catch Webhook" : "Perform Action"),
                              connectionId: existingConn ? existingConn.id : (app.authType === "Internal SSO" ? `conn_${app.id}` : undefined),
                              routes: defaultRoutes,
                              isNewStep: false,
                              status: "configured"
                            }))
                            setStepDrawerOpen(false)
                            setActiveRouteId(null)
                            showToast("Router node added with branches. Click on any Filter node to configure its rules.")
                            return
                          }

                          updateSelectedStep((s) => ({
                            ...s,
                            appId: app.id,
                            appName: app.name,
                            eventId: firstEvent?.id || "",
                            eventName: firstEvent?.name || (isTrigger ? "Catch Webhook" : "Perform Action"),
                            connectionId: existingConn ? existingConn.id : (app.authType === "Internal SSO" ? `conn_${app.id}` : undefined),
                            routes: defaultRoutes,
                            isNewStep: false,
                            status: "configured"
                          }))
                          setDrawerStep("setup_details")
                          setIsDrawerMaximized(false)
                          if (isTrigger || selectedStep.type === "trigger") {
                            setAiPanelMode("minimized")
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2.5 relative min-h-[135px] ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 shadow-sm ring-2 ring-blue-100 dark:ring-blue-950"
                            : isRouterBlocked
                            ? "border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 bg-white dark:bg-slate-900"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs bg-white dark:bg-slate-900"
                        }`}
                        title={isRouterBlocked ? "Router Node can only be added at the end of a workflow or route branch." : undefined}
                      >
                        <div className="flex items-center justify-center h-14 w-14 my-0.5">
                          <AppIcon appId={app.id} appName={app.name} size={56} />
                        </div>

                        <div className="space-y-0.5">
                          <h5 className={`text-xs font-bold leading-tight ${isSelected ? "text-blue-900 dark:text-blue-300 font-bold" : "text-slate-800 dark:text-slate-100"}`}>
                            {app.name}
                          </h5>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">
                            {app.category}
                          </span>
                          {(app as any).isDeveloperApp && (
                            <span className="inline-block text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/90 dark:border-purple-800 px-1.5 py-0.5 rounded shadow-2xs mt-1">
                              Private (Dev)
                            </span>
                          )}
                          {isRouterBlocked && (
                            <span className="inline-block text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-800 px-1.5 py-0.5 rounded shadow-2xs mt-1">
                              End of branch only
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2-STEP WIZARD VIEW 2: CONFIGURE STEP DETAILS FORM */}
            {drawerStep === "setup_details" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Selected App Badge Header with ← Change App Button */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AppIcon appId={effectiveAppId || selectedStep.appId} appName={activeRoute ? activeRoute.appName : selectedStep.appName} size={36} />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">
                        {activeRoute ? `${activeRoute.appName} (${activeRoute.name})` : selectedStep.appName}
                      </h4>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        {activeRoute ? "Route Filter Setup" : selectedApp?.category || "Integration"}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDrawerStep("app_select")
                    }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 space-x-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change App</span>
                  </Button>
                </div>

                {/* App Event Selection Dropdown (For All Apps including Flow Control & Utilities) */}
                {selectedApp && (selectedApp.actions.length > 0 || selectedApp.triggers.length > 0) && (
                  <div className="space-y-1.5 p-3.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{selectedStep.type === "trigger" ? "Select App Trigger" : "Select App Action"}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        {selectedStep.type === "trigger" && selectedApp.triggers.length ? `${selectedApp.triggers.length} Triggers` : `${selectedApp.actions.length} Actions`}
                      </span>
                    </label>
                    <Select
                      value={selectedStep.eventId || (selectedApp.actions[0]?.id || selectedApp.triggers[0]?.id || "")}
                      onChange={(e) => {
                        const evId = e.target.value
                        const evObj = [...selectedApp.actions, ...selectedApp.triggers].find((x) => x.id === evId)
                        let initialMappings: Record<string, string> = { ...(selectedStep.fieldMappings || {}) }
                        if (selectedStep.appId === "text-formatter") {
                          if (evId === "truncate_text") initialMappings["transform_type"] = "truncate"
                          else if (evId === "extract_email_url") initialMappings["transform_type"] = "extract_url"
                          else if (evId === "change_case") initialMappings["transform_type"] = "change_case"
                          else if (evId === "find_replace") initialMappings["transform_type"] = "find_replace"
                          else if (evId === "split_text") initialMappings["transform_type"] = "split"
                        } else if (selectedStep.appId === "datetime-formatter") {
                          initialMappings["date_operation"] = evId
                        } else if (selectedStep.appId === "number-formatter") {
                          if (evId === "spreadsheet_formulas") initialMappings["number_operation"] = "spreadsheet"
                          else if (evId === "format_currency") {
                            initialMappings["number_operation"] = "currency"
                            if (!initialMappings["currency_code"]) initialMappings["currency_code"] = "USD"
                            if (!initialMappings["currency_locale"]) initialMappings["currency_locale"] = "en-US"
                            if (!initialMappings["currency_format"]) initialMappings["currency_format"] = "¤#,##0.00"
                          }
                          else if (evId === "round_number") initialMappings["number_operation"] = "round"
                          else if (evId === "random_number") initialMappings["number_operation"] = "random"
                          else if (evId === "math_operation") initialMappings["number_operation"] = "math"
                          else initialMappings["number_operation"] = "spreadsheet"
                        } else if (selectedStep.appId === "delay") {
                          initialMappings["delay_type"] = evId
                        } else if (selectedStep.appId === "code-runner") {
                          if (evId === "run_python") {
                            if (!initialMappings["code_snippet"] || initialMappings["code_snippet"].includes("inputData")) {
                              initialMappings["code_snippet"] = `# Access mapped variables via input_data dictionary\nbase_amount = float(input_data.get("amount", 100))\ntax_amount = round(base_amount * 0.18, 2)\ngrand_total = round(base_amount + tax_amount, 2)\n\n# Return final results by defining the 'output' dictionary\noutput = {\n    "base": base_amount,\n    "tax": tax_amount,\n    "total": grand_total,\n    "status": "SUCCESS"\n}`
                            }
                          } else if (evId === "run_javascript") {
                            if (!initialMappings["code_snippet"] || initialMappings["code_snippet"].includes("input_data")) {
                              initialMappings["code_snippet"] = `// Access mapped variables via inputData object\nconst baseAmount = Number(inputData.amount || 100);\nconst taxAmount = baseAmount * 0.18;\nconst grandTotal = baseAmount + taxAmount;\n\nreturn {\n  base: baseAmount,\n  tax: taxAmount,\n  total: grandTotal,\n  timestamp: new Date().toISOString()\n};`
                            }
                          }
                        } else if (selectedStep.appId === "human-approval") {
                          if (evId === "wait_for_approval") {
                            if (!initialMappings["approve_button_label"]) initialMappings["approve_button_label"] = "Approve"
                            if (!initialMappings["reject_button_label"]) initialMappings["reject_button_label"] = "Reject"
                            if (!initialMappings["timeout_duration"]) initialMappings["timeout_duration"] = "24_hours"
                          } else if (evId === "request_user_input") {
                            if (!initialMappings["fields_to_collect"]) initialMappings["fields_to_collect"] = "Tracking Number, Carrier Name, Dispatched Date, Notes"
                            if (!initialMappings["timeout_duration"]) initialMappings["timeout_duration"] = "24_hours"
                          }
                        } else if (selectedStep.appId === "lookup-table") {
                          if (evId === "dynamic_dictionary") {
                            if (!initialMappings["dictionary_tokens"]) initialMappings["dictionary_tokens"] = "TITLE=Mr.\nLAST_NAME={{step_1.last_name}}\nINV_NUM=INV-9902\nAMOUNT=1,250"
                            if (!initialMappings["match_mode"]) initialMappings["match_mode"] = "case_insensitive"
                          }
                        } else if (selectedStep.appId === "automate-forms") {
                          if (!initialMappings["form_id"]) initialMappings["form_id"] = "form_lead_capture"
                          if (evId === "create_form_link" && !initialMappings["link_expiry_days"]) {
                            initialMappings["link_expiry_days"] = "7_days"
                          }
                        } else if (selectedStep.appId === "iterator") {
                          if (evId === "aggregate_items") {
                            if (!initialMappings["aggregation_format"]) initialMappings["aggregation_format"] = "comma_separated"
                            if (!initialMappings["filter_empty"]) initialMappings["filter_empty"] = "yes"
                          } else if (evId === "loop_array_items") {
                            if (!initialMappings["max_iterations"]) initialMappings["max_iterations"] = "50"
                          }
                        }

                        // Auto-populate default values defined on fields in the target action schema
                        const targetSchema = getAppActionSchema(effectiveAppId || selectedStep.appId, evId, evObj?.name)
                        if (targetSchema && targetSchema.fields) {
                          targetSchema.fields.forEach((f) => {
                            if (f.defaultValue !== undefined && initialMappings[f.id] === undefined) {
                              initialMappings[f.id] = String(f.defaultValue)
                            }
                          })
                        }

                        updateSelectedStep((s) => ({
                          ...s,
                          eventId: evId,
                          eventName: evObj?.name || evId,
                          fieldMappings: initialMappings
                        }))
                      }}
                      options={(selectedStep.type === "trigger" && selectedApp.triggers.length ? selectedApp.triggers : (selectedApp.actions.length ? selectedApp.actions : selectedApp.triggers)).map((ev: any) => ({
                        value: ev.id,
                        label: ev.name
                      }))}
                      className="text-xs bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 h-9 border-blue-300 dark:border-blue-700 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-0.5">
                      {[...selectedApp.actions, ...selectedApp.triggers].find((x: any) => x.id === (selectedStep.eventId || selectedApp.actions[0]?.id || selectedApp.triggers[0]?.id))?.description || "Select an app event to execute."}
                    </p>
                  </div>
                )}
                {/* Connection Gateway Card for Action Setup */}
                <div className="pt-2">
                  {isStepReadyForConfig ? (
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                            <Check className="h-5 w-5 stroke-[2.5]" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {isUIWebhookTrigger
                                  ? `${selectedStep.appName} Webhook Ready`
                                  : isAuthOptionalApp
                                  ? `${selectedStep.appName} Ready`
                                  : `${selectedStep.appName} Connected`}
                              </h4>
                              <Badge variant="blue" className="text-[10px] font-bold py-0.5 px-2">
                                {isUIWebhookTrigger ? "Webhook Mode" : "Active"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {isUIWebhookTrigger
                                ? "Instant Webhook endpoint ready. Click below to view Webhook URL, copy instructions, and capture test response."
                                : isAuthOptionalApp
                                ? "Native module ready. Configure step fields in the Connection tab."
                                : `Connected Account: ${activeStepConnection?.accountLabel || "Primary Account"}`}
                            </p>
                          </div>
                        </div>
                        {!isAuthOptionalApp && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("connections")
                              setConnectionMode("existing")
                            }}
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-none"
                          >
                            Change
                          </Button>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                        <p className="leading-relaxed">
                          {isUIWebhookTrigger
                            ? "Capture real-time events by pasting your unique Webhook URL into your app's dashboard. Sample payload simulation is available in the Webhook panel."
                            : "All dynamic action fields, variable mappers ({x}), custom parameters, and live API test requests are configured in the Connections tab."}
                        </p>
                      </div>

                      <Button
                        onClick={() => {
                          setActiveTab("connections")
                          if (!isAuthOptionalApp) {
                            setConnectionMode("existing")
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 space-x-2 cursor-pointer shadow-none"
                      >
                        <span>
                          {isUIWebhookTrigger
                            ? "Open Webhook Setup & Copy URL"
                            : "Open Connection Tab & Configure Fields"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 mx-auto flex items-center justify-center">
                        <Plug className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          Connect {selectedStep.appName} Account
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                          Connect your {selectedStep.appName} account to configure dynamic action fields, map variables, and send test requests.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveTab("connections")
                          const matching = userConnections.filter((c) => c.appId === (effectiveAppId || selectedStep.appId))
                          setConnectionMode(matching.length > 0 ? "existing" : "new")
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs space-x-2 cursor-pointer shadow-none h-9 px-4"
                      >
                        <Plug className="h-3.5 w-3.5" />
                        <span>Connect {selectedStep.appName} Account</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
          </div>
        )}
      </>
    )}
  </div>
)}
</Drawer>

      {/* TEST RESPONSE INSPECTOR MODAL */}
      {testResponseModalOpen && (
        <Dialog open={testResponseModalOpen} onOpenChange={setTestResponseModalOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Test Request Response
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{testResult?.status || 200} {testResult?.statusText || "OK"}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {testResult?.latencyMs || 142} ms
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Live API test execution for {selectedStep?.appName} ({selectedStep?.eventName})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTestResponseModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* View Format Switcher Tabs: Simple vs Advance */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setTestResultView("simple")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      testResultView === "simple"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border border-slate-200/80 dark:border-slate-700 shadow-none"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    Simple View
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestResultView("advance")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      testResultView === "advance"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border border-slate-200/80 dark:border-slate-700 shadow-none"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    Advance (JSON)
                  </button>
                </div>

                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                  <Check className="h-3.5 w-3.5" />
                  <span>Ready for downstream variable mapping</span>
                </span>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto flex-1 max-h-[50vh]">
                {testResultView === "simple" ? (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Response Output Fields ({Object.keys(testResult?.outputFields || {}).length})
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      {Object.entries(testResult?.outputFields || {}).map(([key, val]) => (
                        <div
                          key={key}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-blue-700 dark:text-blue-400 font-bold">{key}</span>
                            <span className="text-slate-400 mx-1">:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-sans">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(String(val))
                              showToast(`Copied "${key}" to clipboard!`)
                            }}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 shrink-0 cursor-pointer"
                            title="Copy value"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                    <pre>{JSON.stringify(testResult?.outputFields || {}, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Executed at: <span className="font-mono text-slate-700 dark:text-slate-300">{testResult?.timestamp || "Just now"}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setTestResponseModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 cursor-pointer shadow-none"
                >
                  <span>Save & Return to Canvas</span>
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* VARIABLE PICKER MODAL */}
      <VariablePicker
        steps={steps}
        currentStepId={selectedStep?.id || ""}
        isOpen={variablePickerOpen}
        onClose={() => {
          setVariablePickerOpen(false)
          setPickerConditionTarget(null)
        }}
        onSelectVariable={handleSelectVariable}
        title={
          pickerConditionTarget?.targetField === "field"
            ? "Choose Variable for Condition Label"
            : undefined
        }
        subtitle={
          pickerConditionTarget?.targetField === "field"
            ? "Select any dynamic output property from previous steps to evaluate in this condition"
            : undefined
        }
      />

      {/* Toast Notification Banner */}
      {toastState && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 border animate-in fade-in slide-in-from-bottom-2 ${
            toastState.type === "warning"
              ? "bg-slate-900 border-amber-500/80 text-amber-200 shadow-amber-950/20"
              : toastState.type === "error"
              ? "bg-slate-900 border-rose-500/80 text-rose-200 shadow-rose-950/20"
              : "bg-slate-900 border-slate-800 text-white"
          }`}
        >
          {toastState.type === "warning" ? (
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          ) : toastState.type === "error" ? (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastState.message}</span>
        </div>
      )}

      {/* Reusable Alert Confirmation Modal for Step & Branch Deletion */}
      <ConfirmModal
        open={deleteStepModalState.open}
        onOpenChange={(open) => setDeleteStepModalState((prev) => ({ ...prev, open }))}
        title={deleteStepModalState.isRouterBranch ? "Delete Router Branch?" : "Delete Workflow Step?"}
        description={
          deleteStepModalState.isRouterBranch
            ? "Are you sure you want to delete this route branch? All nested steps and filter rules configured inside this branch will be permanently removed."
            : "Are you sure you want to delete this step from your workflow? Any field mappings, test payload captures, and downstream variable references dependent on this step will be permanently removed."
        }
        itemName={deleteStepModalState.stepName}
        confirmText={deleteStepModalState.isRouterBranch ? "Delete Branch" : "Delete Step"}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDeleteStep}
      />

      {/* EMAIL APPROVAL PREVIEW & TEST MODAL */}
      {selectedStep && selectedStep.appId === "human-approval" && selectedStep.eventId === "wait_for_approval" && (
        <EmailApprovalPreviewModal
          open={approvalPreviewOpen}
          onClose={() => setApprovalPreviewOpen(false)}
          approverEmail={selectedStep.fieldMappings?.["approver_email"] || ""}
          approvalSubject={selectedStep.fieldMappings?.["approval_title"] || ""}
          approvalNotes={selectedStep.fieldMappings?.["approval_notes"] || ""}
          approveButtonLabel={selectedStep.fieldMappings?.["approve_button_label"] || "Approve"}
          rejectButtonLabel={selectedStep.fieldMappings?.["reject_button_label"] || "Reject"}
          timeoutDuration={selectedStep.fieldMappings?.["timeout_duration"] || "24_hours"}
          onSendPreview={(targetEmail) => handleSendPreviewMessage(targetEmail)}
        />
      )}
    </div>
  )
}

export default function WorkflowEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading canvas editor...</div>}>
      <WorkflowEditorContent />
    </Suspense>
  )
}
