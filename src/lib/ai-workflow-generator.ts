import { AppConnection, WorkflowStep } from "./data"

export interface SuggestedNextStep {
  id: string
  stepId: string
  stepNumber: number
  appName: string
  appId: string
  title: string
  description: string
  actionType: "auth" | "config" | "mapping" | "test"
  actionLabel: string
  status: "pending" | "ready" | "completed"
}

export interface GeneratedWorkflowPlan {
  workflowName: string
  summary: string
  steps: WorkflowStep[]
  suggestedNextSteps: SuggestedNextStep[]
  tags: string[]
}

export interface ChatMessage {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: string
  plan?: GeneratedWorkflowPlan
  buildingProgress?: {
    totalSteps: number
    completedSteps: number
    currentStepName?: string
    isBuilding: boolean
  }
}

/**
 * Standard app aliases to match common natural language terms
 */
const APP_ALIASES: Record<string, string> = {
  "form": "google-forms",
  "forms": "google-forms",
  "google form": "google-forms",
  "google forms": "google-forms",
  "gform": "google-forms",
  "typeform": "typeform",
  "automate form": "automate-forms",
  "automate forms": "automate-forms",
  "sheet": "google-sheets",
  "sheets": "google-sheets",
  "google sheet": "google-sheets",
  "google sheets": "google-sheets",
  "spreadsheet": "google-sheets",
  "excel": "google-sheets",
  "slack": "slack",
  "slack message": "slack",
  "slack notification": "slack",
  "channel": "slack",
  "gmail": "gmail",
  "email": "gmail",
  "mail": "gmail",
  "hubspot": "hubspot",
  "crm": "hubspot",
  "contact": "hubspot",
  "pipedrive": "pipedrive",
  "deal": "pipedrive",
  "sales": "pipedrive",
  "whatsapp": "automate-chats",
  "chats": "automate-chats",
  "automate chats": "automate-chats",
  "telegram": "telegram",
  "webhook": "api-webhook",
  "api": "api-webhook",
  "http": "api-webhook",
  "stripe": "stripe",
  "payment": "stripe",
  "shopify": "shopify",
  "order": "shopify",
  "store": "shopify",
  "airtable": "airtable",
  "notion": "notion",
  "database": "notion",
  "filter": "filter",
  "condition": "filter",
  "only if": "filter",
  "delay": "delay",
  "wait": "delay",
  "sleep": "delay",
  "approval": "human-approval",
  "approve": "human-approval",
  "router": "router",
  "branch": "router"
}

/**
 * Intelligently parse natural language prompt and generate a multi-step workflow
 */
export function generateWorkflowFromPrompt(
  prompt: string,
  catalog: AppConnection[]
): GeneratedWorkflowPlan {
  const lower = prompt.toLowerCase()

  // 1. Identify Trigger App
  let triggerAppId = "google-forms"
  if (lower.includes("typeform")) triggerAppId = "typeform"
  else if (lower.includes("shopify") || lower.includes("new order")) triggerAppId = "shopify"
  else if (lower.includes("stripe") || lower.includes("payment")) triggerAppId = "stripe"
  else if (lower.includes("webhook") || lower.includes("payload") || lower.includes("api event")) triggerAppId = "api-webhook"
  else if (lower.includes("hubspot") || lower.includes("new contact")) triggerAppId = "hubspot"
  else if (lower.includes("whatsapp") || lower.includes("message received")) triggerAppId = "automate-chats"
  else if (lower.includes("gmail") || lower.includes("new email")) triggerAppId = "gmail"
  else if (lower.includes("slack") && (lower.startsWith("when slack") || lower.includes("slack message received"))) triggerAppId = "slack"
  else if (lower.includes("automate form")) triggerAppId = "automate-forms"

  // 2. Identify Action Apps in order of mention
  const actionAppCandidates: string[] = []

  // Check for filter condition
  const hasFilter = lower.includes("filter") || lower.includes("only if") || lower.includes("if amount") || lower.includes("vip") || lower.includes("qualif")
  // Check for delay
  const hasDelay = lower.includes("delay") || lower.includes("wait") || lower.includes("minute") || lower.includes("hour")
  // Check for approval
  const hasApproval = lower.includes("approv") || lower.includes("manager approval")

  // Check notifications and data sinks
  if (lower.includes("slack") && triggerAppId !== "slack") {
    actionAppCandidates.push("slack")
  }
  if (lower.includes("sheet") || lower.includes("sheets") || lower.includes("spreadsheet")) {
    actionAppCandidates.push("google-sheets")
  }
  if (lower.includes("gmail") || lower.includes("email") || lower.includes("mail")) {
    if (triggerAppId !== "gmail" && !actionAppCandidates.includes("gmail")) {
      actionAppCandidates.push("gmail")
    }
  }
  if (lower.includes("hubspot") || lower.includes("crm")) {
    if (triggerAppId !== "hubspot" && !actionAppCandidates.includes("hubspot")) {
      actionAppCandidates.push("hubspot")
    }
  }
  if (lower.includes("whatsapp") || lower.includes("chat")) {
    if (triggerAppId !== "automate-chats" && !actionAppCandidates.includes("automate-chats")) {
      actionAppCandidates.push("automate-chats")
    }
  }
  if (lower.includes("pipedrive") || lower.includes("deal")) {
    if (triggerAppId !== "pipedrive" && !actionAppCandidates.includes("pipedrive")) {
      actionAppCandidates.push("pipedrive")
    }
  }
  if (lower.includes("notion")) {
    actionAppCandidates.push("notion")
  }
  if (lower.includes("telegram")) {
    actionAppCandidates.push("telegram")
  }
  if (lower.includes("airtable")) {
    actionAppCandidates.push("airtable")
  }

  // Fallbacks if user prompt is minimal
  if (actionAppCandidates.length === 0) {
    actionAppCandidates.push("slack", "google-sheets")
  }

  // Helper to find app in catalog or fallback
  const getApp = (id: string): AppConnection => {
    const found = catalog.find((a) => a.id === id)
    if (found) return found
    return {
      id,
      name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: "Zap",
      category: "Integration",
      authType: "OAuth 2.0",
      triggers: [{ id: "trigger_1", name: "Inbound Trigger Event", description: "Default trigger", type: "instant" }],
      actions: [{ id: "action_1", name: "Process Action Event", description: "Default action" }],
      syncMode: "Instant"
    }
  }

  const triggerApp = getApp(triggerAppId)
  const triggerEvent = triggerApp.triggers[0] || { id: "inbound_event", name: "New Inbound Event", description: "" }

  const steps: WorkflowStep[] = []

  // 1. Trigger Step
  steps.push({
    id: "step_1",
    type: "trigger",
    appId: triggerApp.id,
    appName: triggerApp.name,
    eventId: triggerEvent.id,
    eventName: triggerEvent.name,
    status: triggerApp.authType === "None" ? "configured" : "unmapped",
    fieldMappings: {},
    testOutput: {
      id: "lead_98241",
      customer_name: "Sarah Jenkins",
      email: "sarah.jenkins@company.com",
      phone: "+1 (555) 942-1200",
      company: "Acme Dynamics",
      source: "Website Lead Form",
      submitted_at: new Date().toISOString()
    }
  })

  let stepCounter = 2

  // Optional: Add filter if requested
  if (hasFilter) {
    steps.push({
      id: `step_${stepCounter}`,
      type: "filter",
      appId: "filter",
      appName: "Filter Rules",
      eventId: "apply_filter_rules",
      eventName: "Only continue if lead is valid",
      status: "configured",
      fieldMappings: {
        field: "{{step_1.email}}",
        operator: "contains",
        value: "@"
      }
    })
    stepCounter++
  }

  // Optional: Add delay if requested
  if (hasDelay) {
    steps.push({
      id: `step_${stepCounter}`,
      type: "delay",
      appId: "delay",
      appName: "Delay",
      eventId: "delay_for",
      eventName: "Delay for 15 Minutes",
      status: "configured",
      fieldMappings: {
        delay_type: "delay_for",
        duration: "15",
        unit: "Minutes"
      }
    })
    stepCounter++
  }

  // Add Action Steps
  for (const appId of actionAppCandidates) {
    const app = getApp(appId)
    const actionEvent = app.actions[0] || { id: "default_action", name: "Execute Action", description: "" }

    const fieldMappings: Record<string, string> = {}
    if (appId === "slack") {
      fieldMappings["channel"] = "#leads-alerts"
      fieldMappings["message"] = "🚀 *New Lead Received!*\n• *Name:* {{step_1.customer_name}}\n• *Email:* {{step_1.email}}\n• *Company:* {{step_1.company}}"
    } else if (appId === "google-sheets") {
      fieldMappings["spreadsheet"] = "Sales Leads 2026"
      fieldMappings["worksheet"] = "Sheet 1"
      fieldMappings["column_a"] = "{{step_1.customer_name}}"
      fieldMappings["column_b"] = "{{step_1.email}}"
      fieldMappings["column_c"] = "{{step_1.company}}"
    } else if (appId === "gmail") {
      fieldMappings["to"] = "{{step_1.email}}"
      fieldMappings["subject"] = "Thanks for connecting with us!"
      fieldMappings["body"] = "Hi {{step_1.customer_name}},\n\nThank you for submitting the form. Our sales specialist will reach out shortly."
    } else if (appId === "hubspot") {
      fieldMappings["email"] = "{{step_1.email}}"
      fieldMappings["firstname"] = "{{step_1.customer_name}}"
      fieldMappings["company"] = "{{step_1.company}}"
    } else if (appId === "automate-chats") {
      fieldMappings["phone"] = "{{step_1.phone}}"
      fieldMappings["template"] = "lead_welcome_v1"
    } else if (appId === "notion") {
      fieldMappings["database_id"] = "db_crm_leads"
      fieldMappings["title"] = "{{step_1.customer_name}} ({{step_1.company}})"
    }

    steps.push({
      id: `step_${stepCounter}`,
      type: "action",
      appId: app.id,
      appName: app.name,
      eventId: actionEvent.id,
      eventName: actionEvent.name,
      status: "unmapped",
      fieldMappings
    })
    stepCounter++
  }

  // Generate Suggested Next Steps (as requested by user)
  const suggestedNextSteps: SuggestedNextStep[] = []

  steps.forEach((step, idx) => {
    const stepNum = idx + 1
    if (step.type === "trigger") {
      if (step.appId === "google-forms") {
        suggestedNextSteps.push({
          id: `sug_${step.id}_auth`,
          stepId: step.id,
          stepNumber: stepNum,
          appName: step.appName,
          appId: step.appId,
          title: "Configure Google Forms Webhook",
          description: "No OAuth required. Webhook listener URL is generated and ready to receive form responses.",
          actionType: "auth",
          actionLabel: "View Webhook URL",
          status: "ready"
        })
      } else {
        suggestedNextSteps.push({
          id: `sug_${step.id}_auth`,
          stepId: step.id,
          stepNumber: stepNum,
          appName: step.appName,
          appId: step.appId,
          title: `Connect ${step.appName} Account`,
          description: `Authenticate your ${step.appName} account to listen for real-time events.`,
          actionType: "auth",
          actionLabel: "Connect Account",
          status: "pending"
        })
      }
    } else if (step.type === "action") {
      if (step.appId === "slack") {
        suggestedNextSteps.push({
          id: `sug_${step.id}_slack`,
          stepId: step.id,
          stepNumber: stepNum,
          appName: "Slack",
          appId: "slack",
          title: "Select Slack Channel",
          description: "Connect your Slack workspace and select the target channel (#leads-alerts).",
          actionType: "config",
          actionLabel: "Select Channel",
          status: "pending"
        })
      } else if (step.appId === "google-sheets") {
        suggestedNextSteps.push({
          id: `sug_${step.id}_sheets`,
          stepId: step.id,
          stepNumber: stepNum,
          appName: "Google Sheets",
          appId: "google-sheets",
          title: "Select Target Spreadsheet",
          description: "Pick your Google Drive spreadsheet and worksheet to map lead rows into.",
          actionType: "config",
          actionLabel: "Choose Spreadsheet",
          status: "pending"
        })
      } else if (step.appId === "gmail") {
        suggestedNextSteps.push({
          id: `sug_${step.id}_gmail`,
          stepId: step.id,
          stepNumber: stepNum,
          appName: "Gmail",
          appId: "gmail",
          title: "Authorize Gmail Sender",
          description: "Connect the email account that will dispatch automated confirmations.",
          actionType: "auth",
          actionLabel: "Authorize Gmail",
          status: "pending"
        })
      } else {
        suggestedNextSteps.push({
          id: `sug_${step.id}_action`,
          stepId: step.id,
          stepNumber: stepNum,
          appName: step.appName,
          appId: step.appId,
          title: `Configure ${step.appName}`,
          description: `Complete authorization and review parameter mappings for ${step.eventName}.`,
          actionType: "config",
          actionLabel: "Configure Step",
          status: "pending"
        })
      }
    }
  })

  // Final testing recommendation
  suggestedNextSteps.push({
    id: "sug_test_flow",
    stepId: steps[0]?.id || "step_1",
    stepNumber: steps.length,
    appName: "Workflow Engine",
    appId: "engine",
    title: "Test Full Workflow",
    description: "Send a sample test payload to verify end-to-end data transmission across all apps.",
    actionType: "test",
    actionLabel: "Run Test Simulation",
    status: "ready"
  })

  // Generate Title
  const appNamesInWorkflow = [triggerApp.name, ...actionAppCandidates.map((id) => getApp(id).name)]
  const workflowName = `${appNamesInWorkflow[0]} ➔ ${appNamesInWorkflow.slice(1).join(" & ")}`

  return {
    workflowName,
    summary: `I've created a ${steps.length}-step automation connecting **${appNamesInWorkflow.join("**, **")}**. Each step is linked with dynamic data pills passing lead details from your trigger into all downstream actions.`,
    steps,
    suggestedNextSteps,
    tags: appNamesInWorkflow
  }
}

/**
 * Handle conversational refinement of existing steps
 */
export function refineWorkflowWithPrompt(
  currentSteps: WorkflowStep[],
  prompt: string,
  catalog: AppConnection[]
): GeneratedWorkflowPlan {
  const lower = prompt.toLowerCase()
  const updatedSteps = [...currentSteps]

  // If user wants to add a delay
  if (lower.includes("delay") || lower.includes("wait")) {
    const delayStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: "delay",
      appId: "delay",
      appName: "Delay",
      eventId: "delay_for",
      eventName: "Delay Execution",
      status: "configured",
      fieldMappings: {
        duration: "10",
        unit: "Minutes"
      }
    }
    // Insert before the last action step if possible
    if (updatedSteps.length > 1) {
      updatedSteps.splice(updatedSteps.length - 1, 0, delayStep)
    } else {
      updatedSteps.push(delayStep)
    }
  }
  // If user wants to add a filter
  else if (lower.includes("filter") || lower.includes("only if") || lower.includes("vip")) {
    const filterStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: "filter",
      appId: "filter",
      appName: "Filter Rules",
      eventId: "apply_filter_rules",
      eventName: "Filter Lead Criteria",
      status: "configured",
      fieldMappings: {
        field: "{{step_1.customer_name}}",
        operator: "not_empty",
        value: "true"
      }
    }
    updatedSteps.splice(1, 0, filterStep)
  }
  // If user wants to add email / gmail
  else if ((lower.includes("email") || lower.includes("gmail")) && !updatedSteps.some((s) => s.appId === "gmail")) {
    const gmailStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: "action",
      appId: "gmail",
      appName: "Gmail",
      eventId: "send_email",
      eventName: "Send Email (with Attachments)",
      status: "unmapped",
      fieldMappings: {
        to: "{{step_1.email}}",
        subject: "Automated Update",
        body: "Hello,\n\nYour workflow triggered successfully."
      }
    }
    updatedSteps.push(gmailStep)
  }
  // If user wants to add Slack
  else if (lower.includes("slack") && !updatedSteps.some((s) => s.appId === "slack")) {
    const slackStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: "action",
      appId: "slack",
      appName: "Slack",
      eventId: "send_channel_msg",
      eventName: "Send Channel Message",
      status: "unmapped",
      fieldMappings: {
        channel: "#general",
        message: "Notification from workflow step: {{step_1.customer_name}}"
      }
    }
    updatedSteps.push(slackStep)
  }

  // Renumber and clean IDs
  const finalSteps = updatedSteps.map((s, idx) => ({
    ...s,
    id: `step_${idx + 1}`
  }))

  const appNames = finalSteps.map((s) => s.appName)
  const workflowName = `${appNames[0]} ➔ ${appNames.slice(1).join(" & ")}`

  return {
    workflowName,
    summary: `Updated workflow with the requested changes. Now running with **${finalSteps.length} steps** across ${appNames.join(", ")}.`,
    steps: finalSteps,
    suggestedNextSteps: [
      {
        id: "sug_review",
        stepId: finalSteps[finalSteps.length - 1]?.id || "step_1",
        stepNumber: finalSteps.length,
        appName: "Workflow Editor",
        appId: "editor",
        title: "Review Added Configuration",
        description: "Verify the new step parameters and test the execution.",
        actionType: "config",
        actionLabel: "Review Step",
        status: "ready"
      }
    ],
    tags: appNames
  }
}
