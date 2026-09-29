"use client"

import React, { useState, useMemo } from "react"
import {
  Sparkles,
  Wrench,
  Database,
  ShieldCheck,
  Play,
  Trash2,
  Plus,
  Search,
  Zap,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Bot,
  Info,
  UserCheck,
  Mail,
  Eye,
  Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { AppIcon, OpenAIIcon, ClaudeIcon, GeminiIcon } from "@/components/ui/app-icon"
import { VariablePillInput } from "@/components/workflow/VariablePillInput"
import { EmailApprovalPreviewModal } from "@/components/workflow/EmailApprovalPreviewModal"
import { WorkflowStep, AppConnection, AIAgentConfig, AIAgentToolConfig, ToolApprovalSettings } from "@/lib/data"
import { CustomActionItem } from "@/lib/custom-action-types"
import { PriorVariableOption } from "@/components/workflow/ConditionRow"

interface AIAgentSetupDrawerProps {
  step: WorkflowStep
  onUpdateStep: (updates: Partial<WorkflowStep>) => void
  priorVariables: PriorVariableOption[]
  allApps: AppConnection[]
  customActions: CustomActionItem[]
  onOpenVariablePicker: (fieldId: string) => void
  showToast: (msg: string, type?: "success" | "warning" | "error" | "info") => void
  onOpenInfoModal?: () => void
}

const DEFAULT_AI_AGENT_CONFIG: AIAgentConfig = {
  role: "Customer Support & Lead Triager",
  model: "gpt-4o",
  instructions: `You are an autonomous AI Agent in Automate Workflows.
1. Analyze the customer inquiry or trigger payload carefully.
2. Select appropriate tools to fetch data, log details, or notify teams.
3. If processing refunds over $100 or deleting records, pause for human approval.
4. Output a clear, concise summary of all actions performed.`,
  taskPrompt: "Evaluate inquiry from {{step_1.sender_email}} and execute required responses or escalations.",
  tools: [
    {
      id: "tool_slack_msg",
      name: "Slack: Send Message",
      type: "app_action",
      appId: "slack",
      appName: "Slack",
      actionId: "send_channel_msg",
      actionName: "Send Channel Message",
      description: "Post real-time updates and alerts to the team Slack channel.",
      enabled: true,
      requireApproval: false
    },
    {
      id: "tool_sheets_row",
      name: "Google Sheets: Add Row",
      type: "app_action",
      appId: "google-sheets",
      appName: "Google Sheets",
      actionId: "add_row",
      actionName: "Add Spreadsheet Row",
      description: "Log audit events and tickets in Google Sheets.",
      enabled: true,
      requireApproval: false
    },
    {
      id: "tool_shopify_product",
      name: "Shopify: Create Product Item",
      type: "app_action",
      appId: "shopify",
      appName: "Shopify",
      actionId: "create_product",
      actionName: "Create New Product Catalog Item",
      description: "Adds product title, price, and SKU.",
      enabled: true,
      requireApproval: false
    }
  ],
  sessionId: "{{step_1.sender_id}}",
  memoryType: "window",
  memoryWindowSize: 10,
  maxIterations: 5,
  timeoutSeconds: 60,
  requireHumanApprovalForSensitive: true,
  approvalChannel: "slack",
  fallbackResponse: "I was unable to complete the task within the allowed execution steps. A human specialist has been notified."
}

export function AIAgentSetupDrawer({
  step,
  onUpdateStep,
  priorVariables,
  allApps,
  customActions,
  onOpenVariablePicker,
  showToast,
  onOpenInfoModal
}: AIAgentSetupDrawerProps) {
  const [activeTab, setActiveTab] = useState<"brain" | "tools" | "memory" | "guardrails">("brain")
  const [isToolModalOpen, setIsToolModalOpen] = useState(false)
  const [toolSearchQuery, setToolSearchQuery] = useState("")
  const [toolFilterCategory, setToolFilterCategory] = useState<"all" | "apps" | "custom">("all")

  // Simulator state
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationLogs, setSimulationLogs] = useState<
    Array<{ stage: "thought" | "action" | "observation" | "final"; text: string; time: string }>
  >([])

  // Human approval modal state (outside the drawer)
  const [configuringApprovalToolId, setConfiguringApprovalToolId] = useState<string | null>(null)
  const [previewingApprovalTool, setPreviewingApprovalTool] = useState<AIAgentToolConfig | null>(null)

  // Ensure config is populated
  const config: AIAgentConfig = useMemo(() => {
    return {
      ...DEFAULT_AI_AGENT_CONFIG,
      ...(step.aiAgentConfig || {})
    }
  }, [step.aiAgentConfig])

  // Current tool being configured in modal
  const configuringApprovalTool = useMemo(() => {
    return config.tools.find((t) => t.id === configuringApprovalToolId) || null
  }, [config.tools, configuringApprovalToolId])

  const updateConfig = (updates: Partial<AIAgentConfig>) => {
    const updatedConfig: AIAgentConfig = {
      ...config,
      ...updates
    }
    onUpdateStep({
      aiAgentConfig: updatedConfig,
      eventName: updatedConfig.role || "Autonomous Goal Solver"
    })
  }

  // Filter available tools to add
  const availableToolsToAdd = useMemo(() => {
    const q = toolSearchQuery.toLowerCase().trim()
    const currentToolIds = new Set(config.tools.map((t) => `${t.appId}_${t.actionId}`))

    const appTools: Array<{
      id: string
      name: string
      type: "app_action"
      appId: string
      appName: string
      actionId: string
      actionName: string
      description: string
    }> = []

    allApps.forEach((app) => {
      if (app.id === "ai-agent" || app.id === "router" || app.id === "filter" || app.id === "delay") return
      app.actions.forEach((act) => {
        const uniqueKey = `${app.id}_${act.id}`
        if (!currentToolIds.has(uniqueKey)) {
          if (!q || app.name.toLowerCase().includes(q) || act.name.toLowerCase().includes(q) || act.description.toLowerCase().includes(q)) {
            appTools.push({
              id: `tool_${app.id}_${act.id}`,
              name: `${app.name}: ${act.name}`,
              type: "app_action",
              appId: app.id,
              appName: app.name,
              actionId: act.id,
              actionName: act.name,
              description: act.description
            })
          }
        }
      })
    })

    const customActionTools: Array<{
      id: string
      name: string
      type: "private_action"
      appId: string
      appName: string
      actionId: string
      actionName: string
      description: string
    }> = []

    customActions.forEach((ca) => {
      const uniqueKey = `custom_${ca.actionId || ca.id}`
      if (!currentToolIds.has(uniqueKey)) {
        if (!q || ca.actionName.toLowerCase().includes(q) || (ca.description && ca.description.toLowerCase().includes(q))) {
          customActionTools.push({
            id: `tool_custom_${ca.id}`,
            name: `Private Action: ${ca.actionName}`,
            type: "private_action",
            appId: "custom-action",
            appName: "Action Builder",
            actionId: ca.actionId || ca.id,
            actionName: ca.actionName,
            description: ca.description || "Custom enterprise action built with Action Builder"
          })
        }
      }
    })

    if (toolFilterCategory === "apps") return appTools
    if (toolFilterCategory === "custom") return customActionTools
    return [...appTools, ...customActionTools]
  }, [allApps, customActions, config.tools, toolSearchQuery, toolFilterCategory])

  const handleAddTool = (tool: {
    id: string
    name: string
    type: "app_action" | "private_action"
    appId: string
    appName: string
    actionId: string
    actionName: string
    description: string
  }) => {
    const newTool: AIAgentToolConfig = {
      ...tool,
      enabled: true,
      requireApproval: false
    }
    updateConfig({
      tools: [...config.tools, newTool]
    })
    showToast(`Equipped ${tool.name} as Agent tool!`, "success")
    setIsToolModalOpen(false)
  }

  const handleRemoveTool = (toolId: string) => {
    updateConfig({
      tools: config.tools.filter((t) => t.id !== toolId)
    })
    showToast("Tool removed from Agent arsenal", "info")
  }

  const handleToggleTool = (toolId: string, enabled: boolean) => {
    updateConfig({
      tools: config.tools.map((t) => (t.id === toolId ? { ...t, enabled } : t))
    })
  }

  const handleToggleToolApproval = (toolId: string, requireApproval: boolean) => {
    updateConfig({
      tools: config.tools.map((t) => {
        if (t.id !== toolId) return t
        const defaultApprovalSettings: ToolApprovalSettings = t.approvalSettings || {
          approverEmail: "{{step_1.manager_email}}",
          approvalTitle: `Action Required: Approve ${t.name}`,
          approvalNotes: `The AI Agent requested approval to execute "${t.name}" to complete the workflow goal.`,
          approveButtonLabel: "Approve",
          rejectButtonLabel: "Reject",
          timeoutDuration: "24_hours"
        }
        return {
          ...t,
          requireApproval,
          approvalSettings: defaultApprovalSettings
        }
      })
    })

    if (requireApproval) {
      // Immediately open configuration modal outside the drawer to eliminate cognitive load
      setConfiguringApprovalToolId(toolId)
    } else {
      if (configuringApprovalToolId === toolId) {
        setConfiguringApprovalToolId(null)
      }
    }
  }

  const handleUpdateToolApprovalSettings = (
    toolId: string,
    settingsUpdate: Partial<ToolApprovalSettings>
  ) => {
    updateConfig({
      tools: config.tools.map((t) => {
        if (t.id !== toolId) return t
        return {
          ...t,
          approvalSettings: {
            approverEmail: "{{step_1.manager_email}}",
            approvalTitle: `Action Required: Approve ${t.name}`,
            approvalNotes: `The AI Agent requested approval to execute "${t.name}" to complete the workflow goal.`,
            approveButtonLabel: "Approve",
            rejectButtonLabel: "Reject",
            timeoutDuration: "24_hours",
            ...(t.approvalSettings || {}),
            ...settingsUpdate
          }
        }
      })
    })
  }

  const handleToolDescriptionChange = (toolId: string, desc: string) => {
    updateConfig({
      tools: config.tools.map((t) => (t.id === toolId ? { ...t, description: desc } : t))
    })
  }

  // Live ReAct Loop Simulation Engine
  const runSimulation = () => {
    setIsSimulating(true)
    setSimulationLogs([])

    const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    const activeTools = config.tools.filter((t) => t.enabled)
    const firstToolName = activeTools[0]?.actionName || "Data Lookup"
    const secondToolName = activeTools[1]?.actionName || "Send Notification"

    const stepsQueue: Array<{ stage: "thought" | "action" | "observation" | "final"; text: string; delay: number }> = [
      {
        stage: "thought",
        text: `Analyzing input goal: "${config.taskPrompt.slice(0, 60)}...". Context mapped from session ${config.sessionId || "default_session"}.`,
        delay: 400
      },
      {
        stage: "action",
        text: `Executing Tool 1/2: ${activeTools[0]?.appName || "Workspace"} -> ${firstToolName}()`,
        delay: 1100
      },
      {
        stage: "observation",
        text: `Received status 200 OK: { id: "res_84920", status: "VERIFIED", matchCount: 1 }`,
        delay: 1800
      },
      {
        stage: "thought",
        text: `Data confirmed. Checking safety thresholds... Max iterations = ${config.maxIterations} (currently step 2). Human approval not triggered.`,
        delay: 2500
      },
      {
        stage: "action",
        text: `Executing Tool 2/2: ${activeTools[1]?.appName || "Notifications"} -> ${secondToolName}()`,
        delay: 3200
      },
      {
        stage: "observation",
        text: `Dispatched message successfully. Delivery timestamp recorded.`,
        delay: 3900
      },
      {
        stage: "final",
        text: `ReAct Loop successfully resolved goal in 2 tool calls. Synthesized final response for downstream workflow steps.`,
        delay: 4600
      }
    ]

    stepsQueue.forEach((st) => {
      setTimeout(() => {
        setSimulationLogs((prev) => [...prev, { stage: st.stage, text: st.text, time: now() }])
        if (st.stage === "final") {
          setIsSimulating(false)
        }
      }, st.delay)
    })
  }

  return (
    <div className="space-y-4">
      {/* Segmented Tab Navigation Bar */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        {[
          { id: "brain", label: "Brain & Goal", icon: Cpu },
          { id: "tools", label: `Tools (${config.tools.filter((t) => t.enabled).length})`, icon: Wrench },
          { id: "memory", label: "Memory", icon: Database },
          { id: "guardrails", label: "Safety & Limits", icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: BRAIN & GOAL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "brain" && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Field 1: Agent Role / Persona Title */}
          <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Agent Name / Role
              </label>
              <span className="text-[10px] text-slate-400 font-normal">Name on workflow canvas</span>
            </div>
            <Input
              type="text"
              value={config.role}
              onChange={(e) => updateConfig({ role: e.target.value })}
              placeholder="e.g. Customer Support & Order Assistant"
              className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 h-9"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              What job is this agent doing? (e.g. Customer Support, Lead Qualifier, Refund Checker).
            </p>
          </div>

          {/* Field 2: Primary LLM Reasoning Model */}
          <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>AI Reasoning Model</span>
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ready & Active</span>
              </span>
            </div>

            <Select
              value={config.model}
              onChange={(e) => updateConfig({ model: e.target.value as any })}
              options={[
                {
                  value: "gpt-4o",
                  label: "OpenAI GPT-4o (Recommended — Fast & Smart)",
                  icon: <OpenAIIcon size={20} />
                },
                {
                  value: "claude-3-5-sonnet",
                  label: "Anthropic Claude 3.5 Sonnet (Recommended — Deep Reasoning)",
                  icon: <ClaudeIcon size={20} />
                },
                {
                  value: "gemini-1-5-pro",
                  label: "Google Gemini 1.5 Pro (Huge Context Window)",
                  icon: <GeminiIcon size={20} />
                },
                {
                  value: "gpt-4o-mini",
                  label: "OpenAI GPT-4o Mini (Fast & Cost-Effective)",
                  icon: <OpenAIIcon size={20} />
                }
              ]}
              className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            />

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              The AI brain that reads your prompt, makes smart decisions, and runs your equipped tools.
            </p>
          </div>

          {/* Field 3: System Instructions & Persona */}
          <div className="space-y-2 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Agent Instructions & Rules
              </label>
              <span className="text-[10px] text-slate-400 font-normal">How it should behave</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium mr-0.5">Presets:</span>
              {[
                {
                  label: "Support & Refund Triage",
                  text: "You are a customer support agent. Look up orders, answer customer questions politely, and flag refunds over $100 for human approval."
                },
                {
                  label: "Lead Qualification Agent",
                  text: "You are a B2B sales development representative. Score inbound leads based on job title and company size, update CRM, and alert account execs."
                },
                {
                  label: "Data Sync & Harmonizer",
                  text: "You are a data consistency agent. Cleanse user input fields, match records across systems, and log deduplicated entries."
                },
                {
                  label: "Autonomous IT Helpdesk",
                  text: "You are an internal IT helpdesk bot. Resolve password resets, query documentation, and escalate critical access requests."
                }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => updateConfig({ instructions: p.text })}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              value={config.instructions}
              onChange={(e) => updateConfig({ instructions: e.target.value })}
              placeholder="Tell the agent its tone, rules to follow, what information to collect, and how to format final answers..."
              className="w-full text-xs font-normal p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none leading-relaxed transition-colors resize-y"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Give the agent clear guidelines on how to talk, what rules to follow, and what answers to give.
            </p>
          </div>

          {/* Field 4: Task / Goal Input Prompt */}
          <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <span>What should the agent do? (Goal Prompt)</span>
                <span className="text-red-500 font-bold">*</span>
              </label>

              {/* Standard Press [/] Button */}
              <button
                type="button"
                onClick={() => onOpenVariablePicker("task_prompt")}
                className="h-6 px-2 flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/90 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/90 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-md transition-all cursor-pointer shadow-2xs group select-none"
                title="Insert variable (or Press / on keyboard)"
              >
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  Press
                </span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 border border-slate-200/90 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 rounded text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-semibold text-[10px] leading-none shadow-2xs">
                  /
                </kbd>
              </button>
            </div>

            <VariablePillInput
              id="agent_task_prompt"
              value={config.taskPrompt}
              placeholder="e.g. Evaluate incoming inquiry {{step_1.body}} and take appropriate actions..."
              supportsMapping={true}
              multiline={true}
              minHeight="min-h-[76px]"
              onChange={(val) => updateConfig({ taskPrompt: val })}
              onOpenVariablePicker={() => onOpenVariablePicker("task_prompt")}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              The main task for the agent to complete. You can type instructions and add variables from previous steps with /.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: TOOLS & CAPABILITIES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "tools" && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Header Action Bar with Primary Blue Button */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Equipped Apps & Tools</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select apps (like Shopify, Slack, Gmail) this agent is allowed to use to get work done.
              </p>
            </div>
            <Button
              size="sm"
              type="button"
              onClick={() => setIsToolModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs space-x-1.5 h-8 cursor-pointer shadow-none"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Equip Tool</span>
            </Button>
          </div>

          {/* Equipped Tools List */}
          <div className="space-y-2.5">
            {config.tools.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <Wrench className="h-8 w-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No Tools Equipped Yet</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Equip tools from your app catalog or Action Builder so the agent can take real actions across your stack.
                </p>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => setIsToolModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold mt-2 h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Equip First Tool</span>
                </Button>
              </div>
            ) : (
              config.tools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {tool.type === "private_action" ? (
                        <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center shrink-0">
                          <Zap className="h-4 w-4" />
                        </div>
                      ) : (
                        <AppIcon appId={tool.appId} appName={tool.appName} size={28} />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tool.name}</span>
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {tool.type === "private_action" ? "Private Action" : tool.appName}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-slate-400">action: {tool.actionId}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</span>
                        <Switch
                          checked={tool.enabled}
                          onCheckedChange={(val) => handleToggleTool(tool.id, val)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(tool.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Remove tool"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tool description / guidance */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      When should the agent use this tool?
                    </label>
                    <Input
                      type="text"
                      value={tool.description}
                      onChange={(e) => handleToolDescriptionChange(tool.id, e.target.value)}
                      placeholder="e.g. Call this whenever a customer asks about their order status or shipment..."
                      className="text-xs bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-8"
                    />
                  </div>

                  {/* Human Approval Section */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                        <ShieldCheck className={`h-4 w-4 ${tool.requireApproval ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                        <span>Ask for your approval before running this tool</span>
                      </span>
                      <Switch
                        checked={!!tool.requireApproval}
                        onCheckedChange={(val) => handleToggleToolApproval(tool.id, val)}
                      />
                    </div>

                    {/* Compact Approval Status & Configure Modal Trigger */}
                    {tool.requireApproval && (
                      <div className="flex items-center justify-between p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs animate-in fade-in duration-150">
                        <div className="flex items-center space-x-2 min-w-0 pr-2">
                          <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs">
                            <UserCheck className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate text-xs">
                              {tool.approvalSettings?.approverEmail || "{{step_1.manager_email}}"}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {tool.approvalSettings?.timeoutDuration === "1_hour"
                                ? "1 Hour timeout"
                                : tool.approvalSettings?.timeoutDuration === "7_days"
                                ? "7 Days timeout"
                                : "24 Hours timeout"}
                              {" • "}
                              Subject: {tool.approvalSettings?.approvalTitle || `Action Required: Approve ${tool.name}`}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() => setConfiguringApprovalToolId(tool.id)}
                          className="h-7 px-2.5 text-xs font-semibold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/70 shrink-0 cursor-pointer shadow-none space-x-1"
                        >
                          <Settings2 className="h-3 w-3" />
                          <span>Configure</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: MEMORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "memory" && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Field 1: Session ID with Standard Press [/] Button */}
          <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <span>Session ID (Conversation Identifier)</span>
              </label>

              {/* Standard Press [/] Button */}
              <button
                type="button"
                onClick={() => onOpenVariablePicker("session_id")}
                className="h-6 px-2 flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/90 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/90 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-md transition-all cursor-pointer shadow-2xs group select-none"
                title="Insert variable (or Press / on keyboard)"
              >
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  Press
                </span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 border border-slate-200/90 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 rounded text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-semibold text-[10px] leading-none shadow-2xs">
                  /
                </kbd>
              </button>
            </div>

            <VariablePillInput
              id="agent_session_id"
              value={config.sessionId}
              placeholder="e.g. {{step_1.sender_id}} or {{step_1.customer_email}}"
              supportsMapping={true}
              multiline={false}
              onChange={(val) => updateConfig({ sessionId: val })}
              onOpenVariablePicker={() => onOpenVariablePicker("session_id")}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Keeps track of conversations with the same person (e.g. customer email or phone number) so the agent remembers previous chats.
            </p>
          </div>

          {/* Field 2: Memory Window Strategy */}
          <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              How much conversation history should the agent remember?
            </label>
            <Select
              value={config.memoryType}
              onChange={(e) => updateConfig({ memoryType: e.target.value as any })}
              options={[
                { value: "window", label: "Recent Messages (Remembers last few turns)" },
                { value: "session", label: "Full Session (Stores entire conversation history)" },
                { value: "none", label: "No Memory (Treat each run as a brand new conversation)" }
              ]}
              className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Controls whether the agent recalls previous customer questions or starts fresh every time.
            </p>
          </div>

          {/* Field 3: Window Size */}
          {config.memoryType === "window" && (
            <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Window Size (Recent Messages)
                </label>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {config.memoryWindowSize} messages
                </span>
              </div>
              <Select
                value={String(config.memoryWindowSize)}
                onChange={(e) => updateConfig({ memoryWindowSize: parseInt(e.target.value) || 10 })}
                options={[
                  { value: "5", label: "5 Messages (Lightweight)" },
                  { value: "10", label: "10 Messages (Recommended Standard)" },
                  { value: "15", label: "15 Messages (Extended Dialogue)" },
                  { value: "20", label: "20 Messages (Deep Context)" }
                ]}
                className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Only keeps the last few messages in memory to keep responses fast and focused.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: GUARDRAILS & SAFETY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "guardrails" && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Field 1: Max Reasoning Iterations */}
          <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Maximum Steps per Run
              </label>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {config.maxIterations} steps
              </span>
            </div>
            <Select
              value={String(config.maxIterations)}
              onChange={(e) => updateConfig({ maxIterations: parseInt(e.target.value) || 5 })}
              options={[
                { value: "3", label: "3 Steps (Strict / Fast)" },
                { value: "5", label: "5 Steps (Recommended Default)" },
                { value: "8", label: "8 Steps (Complex Tasks)" },
                { value: "12", label: "12 Steps (Deep Multi-Step Tasks)" }
              ]}
              className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Limits how many actions the agent can take at once to prevent infinite loops and save costs.
            </p>
          </div>

          {/* Field 2: Fallback Response */}
          <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Fallback Message (if stuck)
            </label>
            <Input
              type="text"
              value={config.fallbackResponse}
              onChange={(e) => updateConfig({ fallbackResponse: e.target.value })}
              placeholder="I was unable to complete the task within the allowed execution steps..."
              className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              What the agent will reply if it cannot complete the goal or runs out of allowed steps.
            </p>
          </div>

          {/* Field 4: Agent ReAct Reasoning Simulator */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Agent Test Run Simulator
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Preview how the agent thinks, makes decisions, and runs tools in real-time.
                </p>
              </div>
              <Button
                size="sm"
                type="button"
                onClick={runSimulation}
                disabled={isSimulating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs space-x-1.5 h-8 cursor-pointer shadow-none"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Simulating...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Simulation</span>
                  </>
                )}
              </Button>
            </div>

            {/* Trace Viewer Box */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
              <div className="px-3 py-1.5 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Live ReAct Execution Trace</span>
                </span>
                <span>{simulationLogs.length} events</span>
              </div>

              <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
                {simulationLogs.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] italic py-2 text-center">
                    Click &quot;Run Simulation&quot; above to preview how the agent thinks and calls tools.
                  </p>
                ) : (
                  simulationLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                      <span className="text-slate-400 dark:text-slate-500 shrink-0 text-[10px] font-medium">{log.time}</span>
                      {log.stage === "thought" ? (
                        <span className="text-sky-600 dark:text-sky-400 font-medium">💭 {log.text}</span>
                      ) : log.stage === "action" ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">⚡ {log.text}</span>
                      ) : log.stage === "observation" ? (
                        <span className="text-emerald-600 dark:text-emerald-400">👁️ {log.text}</span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-bold">✅ {log.text}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EQUIP NEW TOOL MODAL */}
      {/* ------------------------------------------------------------- */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Equip Tool to Agent Arsenal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select actions the autonomous agent can call dynamically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsToolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search apps, actions, or private webhook endpoints..."
                  value={toolSearchQuery}
                  onChange={(e) => setToolSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                {[
                  { id: "all", label: "All Available" },
                  { id: "custom", label: `Private Actions (${customActions.length})` },
                  { id: "apps", label: "SaaS & Core Apps" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setToolFilterCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      toolFilterCategory === cat.id
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Tool List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2">
              {availableToolsToAdd.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No matching tools found.
                </div>
              ) : (
                availableToolsToAdd.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => handleAddTool(tool)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-3">
                      {tool.type === "private_action" ? (
                        <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                          <Zap className="h-4 w-4" />
                        </div>
                      ) : (
                        <AppIcon appId={tool.appId} appName={tool.appName} size={28} />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {tool.name}
                          </h4>
                          {tool.type === "private_action" && (
                            <Badge variant="blue" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-bold">
                              Private Action
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      className="shrink-0 h-7 text-[11px] font-bold border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <span>Equip</span>
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-end shrink-0">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsToolModalOpen(false)}
                className="text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HUMAN APPROVAL CONFIGURATION MODAL (OUTSIDE THE DRAWER) */}
      {configuringApprovalTool && (
        <Modal
          open={!!configuringApprovalTool}
          onOpenChange={(isOpen) => {
            if (!isOpen) setConfiguringApprovalToolId(null)
          }}
          title="Configure Human Approval"
          description="Workflow execution will pause when this tool is selected until the assigned reviewer approves via email."
          icon={<UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          standardWidthClassName="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewingApprovalTool(configuringApprovalTool)}
                className="text-xs font-semibold text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer space-x-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Preview Email &amp; Send Test</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setConfiguringApprovalToolId(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-none px-4"
              >
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-1">
            {/* Field 1: Approver Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Approver Email Address
                </label>
                <button
                  type="button"
                  onClick={() => onOpenVariablePicker(`modal_tool_${configuringApprovalTool.id}_approver_email`)}
                  className="h-5 px-1.5 flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded text-[10px] transition-all cursor-pointer shadow-2xs group select-none"
                  title="Insert variable (or Press / on keyboard)"
                >
                  <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                    Press
                  </span>
                  <kbd className="px-1 py-0.2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-semibold">
                    /
                  </kbd>
                </button>
              </div>
              <VariablePillInput
                id={`modal_tool_${configuringApprovalTool.id}_approver_email`}
                value={configuringApprovalTool.approvalSettings?.approverEmail || ""}
                placeholder="manager@company.com or {{step_1.manager_email}}"
                supportsMapping={true}
                multiline={false}
                onChange={(val) => {
                  handleUpdateToolApprovalSettings(configuringApprovalTool.id, { approverEmail: val })
                }}
                onOpenVariablePicker={() => onOpenVariablePicker(`modal_tool_${configuringApprovalTool.id}_approver_email`)}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                The person or team who must approve this action. Supports dynamic variables from previous steps.
              </p>
            </div>

            {/* Field 2: Approval Email Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Approval Email Subject
              </label>
              <Input
                type="text"
                value={configuringApprovalTool.approvalSettings?.approvalTitle || ""}
                onChange={(e) => {
                  handleUpdateToolApprovalSettings(configuringApprovalTool.id, { approvalTitle: e.target.value })
                }}
                placeholder={`Action Required: Approve ${configuringApprovalTool.name}`}
                className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                The subject line displayed in the reviewer&apos;s email inbox.
              </p>
            </div>

            {/* Field 3: Reviewer Context / Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reviewer Context &amp; Details
                </label>
                <button
                  type="button"
                  onClick={() => onOpenVariablePicker(`modal_tool_${configuringApprovalTool.id}_approval_notes`)}
                  className="h-5 px-1.5 flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded text-[10px] transition-all cursor-pointer shadow-2xs group select-none"
                  title="Insert variable (or Press / on keyboard)"
                >
                  <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                    Press
                  </span>
                  <kbd className="px-1 py-0.2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-semibold">
                    /
                  </kbd>
                </button>
              </div>
              <VariablePillInput
                id={`modal_tool_${configuringApprovalTool.id}_approval_notes`}
                value={configuringApprovalTool.approvalSettings?.approvalNotes || ""}
                placeholder={`The AI Agent requested approval to execute "${configuringApprovalTool.name}" to complete the workflow goal.`}
                supportsMapping={true}
                multiline={true}
                minHeight="min-h-[64px]"
                onChange={(val) => {
                  handleUpdateToolApprovalSettings(configuringApprovalTool.id, { approvalNotes: val })
                }}
                onOpenVariablePicker={() => onOpenVariablePicker(`modal_tool_${configuringApprovalTool.id}_approval_notes`)}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Detailed instructions or dynamic context shown in the body of the approval email.
              </p>
            </div>

            {/* Field 4: Expiration Timeout Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expiration Timeout
              </label>
              <Select
                value={configuringApprovalTool.approvalSettings?.timeoutDuration || "24_hours"}
                onChange={(e) => {
                  handleUpdateToolApprovalSettings(configuringApprovalTool.id, { timeoutDuration: e.target.value as any })
                }}
                options={[
                  { value: "1_hour", label: "1 Hour (Urgent Approvals)" },
                  { value: "24_hours", label: "24 Hours (Standard Default)" },
                  { value: "7_days", label: "7 Days (Extended Window)" }
                ]}
                className="text-xs bg-slate-50/50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                If unreviewed after this duration, execution times out and sends the fallback response.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* EMAIL APPROVAL PREVIEW MODAL */}
      {previewingApprovalTool && (
        <EmailApprovalPreviewModal
          open={!!previewingApprovalTool}
          onClose={() => setPreviewingApprovalTool(null)}
          approverEmail={previewingApprovalTool.approvalSettings?.approverEmail || ""}
          approvalSubject={
            previewingApprovalTool.approvalSettings?.approvalTitle ||
            `Action Required: Approve ${previewingApprovalTool.name}`
          }
          approvalNotes={
            previewingApprovalTool.approvalSettings?.approvalNotes ||
            `The AI Agent requested approval to execute the tool "${previewingApprovalTool.name}" to achieve the workflow goal.`
          }
          approveButtonLabel={previewingApprovalTool.approvalSettings?.approveButtonLabel || "Approve"}
          rejectButtonLabel={previewingApprovalTool.approvalSettings?.rejectButtonLabel || "Reject"}
          timeoutDuration={previewingApprovalTool.approvalSettings?.timeoutDuration || "24_hours"}
          onSendPreview={(targetEmail: string) => {
            showToast(`Test approval email for "${previewingApprovalTool.name}" dispatched to ${targetEmail}!`, "success")
          }}
        />
      )}
    </div>
  )
}
