"use client"

import React, { useState, useEffect, useRef } from "react"
import { ActionCatalogList } from "./components/ActionCatalogList"
import { ActionChatStudio } from "./components/ActionChatStudio"
import { ActionSandboxDrawer } from "./components/ActionSandboxDrawer"
import { CodeViewerModal } from "./components/CodeViewerModal"
import { DeployConfirmModal } from "./components/DeployConfirmModal"
import {
  getCustomActions,
  saveCustomAction,
  deleteCustomAction
} from "@/lib/custom-action-storage"
import { CustomActionItem, CustomActionTestRun } from "@/lib/custom-action-types"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { MVP_APPS } from "@/lib/data"
import { Zap, CheckCircle2, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ActionBuilderPage() {
  const masterContainerRef = useRef<HTMLDivElement>(null)
  const [actions, setActions] = useState<CustomActionItem[]>([])
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(true)
  const [sandboxTab, setSandboxTab] = useState("test_action")

  // Resizable panel widths
  const [rightDrawerWidth, setRightDrawerWidth] = useState(480)
  const [leftCatalogWidth, setLeftCatalogWidth] = useState(300)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)

  const handleStartResizeRight = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingRight(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!masterContainerRef.current) return
      const containerRect = masterContainerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - moveEvent.clientX
      const maxAllowed = Math.min(880, containerRect.width - (isLeftCollapsed ? 380 : leftCatalogWidth + 360))
      const clamped = Math.max(360, Math.min(newWidth, Math.max(360, maxAllowed)))
      setRightDrawerWidth(clamped)
    }

    const onMouseUp = () => {
      setIsDraggingRight(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  const handleStartResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingLeft(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!masterContainerRef.current) return
      const containerRect = masterContainerRef.current.getBoundingClientRect()
      const newWidth = moveEvent.clientX - containerRect.left
      const clamped = Math.max(220, Math.min(newWidth, 480))
      setLeftCatalogWidth(clamped)
    }

    const onMouseUp = () => {
      setIsDraggingLeft(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  const handleToggleWideMode = () => {
    if (rightDrawerWidth >= 640) {
      setRightDrawerWidth(480)
    } else {
      setRightDrawerWidth(700)
    }
  }

  // Delete Action Modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; actionId: string; title: string }>({
    open: false,
    actionId: "",
    title: ""
  })

  useEffect(() => {
    const loaded = getCustomActions()
    setActions(loaded)
    if (loaded.length > 0) {
      setSelectedActionId(loaded[0].id)
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const selectedAction = actions.find((a) => a.id === selectedActionId) || actions[0] || null

  const hasAgentBuiltAction = Boolean(
    selectedAction &&
      (selectedAction.messages.some((m) => m.sender === "assistant") ||
        (selectedAction.fields.length > 0 &&
          selectedAction.actionName !== "Untitled Action" &&
          selectedAction.appName !== "New Action"))
  )

  const handleSelectAction = (id: string) => {
    setSelectedActionId(id)
    setIsRightCollapsed(true)
  }

  // Pure AI-first session creation: No blocking modal popup!
  const handleStartNewAction = () => {
    const newActionId = `ca_${Date.now()}`
    const blankAction: CustomActionItem = {
      id: newActionId,
      appId: "google-sheets",
      appName: "New Action",
      actionId: `action_${Date.now()}`,
      actionName: "Untitled Action",
      description: "Custom integration action generated via AI prompts",
      status: "draft",
      authType: "oauth2",
      authLabel: "API Key / OAuth Access Token",
      authPlaceholder: "Enter token or credential...",
      fields: [],
      generatedCode: `// Generated code will appear here after prompting AI
export async function executeAction(params: Record<string, any>, auth: Record<string, any>) {
  return { success: true };
}`,
      messages: [],
      testHistory: [],
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      updatedAt: "Just now"
    }

    const updated = saveCustomAction(blankAction)
    setActions(updated)
    setSelectedActionId(newActionId)
    setIsRightCollapsed(true)
    showToast("Started fresh Action Builder session! Tell the AI what you want to build.")
  }

  const handleSendMessage = (text: string) => {
    if (!selectedAction) return

    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: "user" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: text
    }

    // Infer target app & title if this was a fresh untitled session
    const lower = text.toLowerCase()
    let inferredAppId = selectedAction.appId
    let inferredAppName = selectedAction.appName
    let inferredActionName = selectedAction.actionName

    if (selectedAction.actionName === "Untitled Action" || selectedAction.appName === "New Action") {
      if (lower.includes("sheet")) {
        inferredAppId = "google-sheets"
        inferredAppName = "Google Sheets"
        inferredActionName = lower.includes("delete") ? "Delete Sheet" : lower.includes("column") ? "Add Column" : "Custom Sheets Action"
      } else if (lower.includes("slack")) {
        inferredAppId = "slack"
        inferredAppName = "Slack"
        inferredActionName = lower.includes("ephemeral") ? "Send Ephemeral Alert" : "Send Channel Message"
      } else if (lower.includes("shopify")) {
        inferredAppId = "shopify"
        inferredAppName = "Shopify"
        inferredActionName = lower.includes("cancel") ? "Cancel Order" : "Update Inventory"
      } else if (lower.includes("stripe")) {
        inferredAppId = "stripe"
        inferredAppName = "Stripe"
        inferredActionName = "Create Customer Invoice"
      } else if (lower.includes("hubspot")) {
        inferredAppId = "hubspot"
        inferredAppName = "HubSpot"
        inferredActionName = "Archive CRM Contact"
      } else {
        inferredAppId = "api-webhook"
        inferredAppName = "Custom API"
        inferredActionName = "Execute Webhook Action"
      }
    }

    const updatedActionWithUser: CustomActionItem = {
      ...selectedAction,
      appId: inferredAppId,
      appName: inferredAppName,
      actionName: inferredActionName,
      messages: [...selectedAction.messages, userMsg]
    }

    setActions((prev) => prev.map((a) => (a.id === selectedAction.id ? updatedActionWithUser : a)))
    setIsGenerating(true)

    // Simulate AI reasoning and code generation
    setTimeout(() => {
      setIsGenerating(false)

      const isSheets = inferredAppId === "google-sheets"
      const isSlack = inferredAppId === "slack"

      const sampleFields = isSheets
        ? [
            {
              id: "spreadsheet_id",
              label: "Spreadsheet ID",
              type: "text" as const,
              required: true,
              placeholder: "1BuMvX0XRA5nFMdKv8cIR7grmUUqntbx74QgVF2upmx",
              helperText: "Google Sheets spreadsheet unique ID",
              supportsMapping: true
            },
            {
              id: "sheet_id",
              label: "Sheet ID",
              type: "text" as const,
              required: true,
              placeholder: "0 or Sheet1",
              helperText: "Numeric or string sheet tab ID",
              supportsMapping: true
            }
          ]
        : isSlack
        ? [
            {
              id: "channel_id",
              label: "Channel ID",
              type: "text" as const,
              required: true,
              placeholder: "C0123456789",
              supportsMapping: true
            },
            {
              id: "user_id",
              label: "Target User ID",
              type: "text" as const,
              required: true,
              placeholder: "U0123456789",
              supportsMapping: true
            }
          ]
        : [
            {
              id: "endpoint_url",
              label: "API Endpoint URL",
              type: "text" as const,
              required: true,
              placeholder: "https://api.service.com/v1/resource",
              supportsMapping: true
            },
            {
              id: "payload_json",
              label: "Request Body Payload",
              type: "textarea" as const,
              required: false,
              placeholder: '{"key": "value"}',
              supportsMapping: true
            }
          ]

      const aiMsg = {
        id: `msg_ai_${Date.now()}`,
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        thinkingSeconds: 12.8,
        content: `I've analyzed the API requirements and generated the execution handler for ${inferredAppName} (${inferredActionName}). All required authentication headers and parameter schemas are configured and ready.`,
        diffSummary: {
          title: "Here's what I'll change",
          totalLines: 78,
          steps: [
            {
              id: `diff_${Date.now()}_1`,
              lineNumber: 48,
              description: `Implemented handler for ${inferredActionName}`,
              type: "add" as const
            },
            {
              id: `diff_${Date.now()}_2`,
              lineNumber: 64,
              description: "Added parameter validation and error boundary checks",
              type: "add" as const
            }
          ]
        },
        isDeployed: true
      }

      const finalAction: CustomActionItem = {
        ...updatedActionWithUser,
        appId: inferredAppId,
        appName: inferredAppName,
        actionName: inferredActionName,
        fields: sampleFields,
        authLabel: `${inferredAppName} Access Token / API Key`,
        authPlaceholder: "Enter secret token or OAuth 2.0 credential...",
        generatedCode: `// ── Helpers ──
function jsonOk(data) { return { statusCode: 200, statusMessage: 'OK', success: true, ...data }; }
function jsonErr(message, code, debug) { return { statusCode: code || 400, statusMessage: message, success: false, error: message, ...(debug ? { _debug: debug } : {}) }; }

// ── Action: ${inferredAppName} ${inferredActionName} ──
async function handleExecuteAction(body, headers) {
  const token = headers['authorization'] || headers['x-api-key'] || process.env.API_ACCESS_TOKEN;
  if (!token) return jsonErr('Missing required credential: authorization header or token', 401);

  const endpoint = body.endpoint_url || 'https://api.service.com/v1/resource';
  if (!endpoint) return jsonErr('Missing required field: endpoint_url', 400);

  const res = await
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return res.json();
}`,
        messages: [...updatedActionWithUser.messages, aiMsg],
        status: "draft",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }

      const saved = saveCustomAction(finalAction)
      setActions(saved)
      setIsRightCollapsed(true)
      showToast(`Action updated! Click "View Code" or "Test Action" to inspect.`)
    }, 1200)
  }

  const handleOpenDeployModal = () => {
    if (!selectedAction) return
    setIsDeployModalOpen(true)
  }

  const handleConfirmDeploy = (confirmedName: string) => {
    if (!selectedAction) return
    const deployed: CustomActionItem = {
      ...selectedAction,
      actionName: confirmedName,
      status: "live",
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    const saved = saveCustomAction(deployed)
    setActions(saved)
    showToast(`"${confirmedName}" is now LIVE and selectable in Workflow Canvas!`)
  }

  const handleSaveTestRun = (run: CustomActionTestRun) => {
    if (!selectedAction) return
    const updated: CustomActionItem = {
      ...selectedAction,
      testHistory: [run, ...selectedAction.testHistory]
    }
    const saved = saveCustomAction(updated)
    setActions(saved)
    showToast(`Test request successful (${run.status} ${run.statusText})!`)
  }

  const confirmDelete = () => {
    if (!deleteModal.actionId) return
    const updated = deleteCustomAction(deleteModal.actionId)
    setActions(updated)
    if (selectedActionId === deleteModal.actionId) {
      setSelectedActionId(updated[0]?.id || null)
    }
    showToast(`Deleted action "${deleteModal.title}"`)
    setDeleteModal({ open: false, actionId: "", title: "" })
  }

  const handleRenameAction = (id: string, newName: string) => {
    const act = actions.find((a) => a.id === id)
    if (!act) return
    const updated: CustomActionItem = {
      ...act,
      actionName: newName,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    const saved = saveCustomAction(updated)
    setActions(saved)
    showToast(`Renamed action to "${newName}"`)
  }

  const handleTogglePublish = (id: string) => {
    const act = actions.find((a) => a.id === id)
    if (!act) return
    const newStatus = act.status === "live" ? "draft" : "live"
    const updated: CustomActionItem = {
      ...act,
      status: newStatus,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    const saved = saveCustomAction(updated)
    setActions(saved)
    showToast(
      newStatus === "live"
        ? `"${act.actionName}" is now LIVE in Workflow Canvas!`
        : `"${act.actionName}" moved to draft.`
    )
  }

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 h-full w-full font-sans select-none relative flex flex-col no-scrollbar overflow-hidden">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
        title="Delete Custom Action"
        description={`Are you sure you want to permanently delete "${deleteModal.title}"? It will no longer be available in Workflow Canvas.`}
        confirmText="Delete Action"
        variant="danger"
        onConfirm={confirmDelete}
      />

      {/* Master 3-Panel Unified Container */}
      <div
        ref={masterContainerRef}
        className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex overflow-hidden relative"
      >
        {/* Panel 1: Left Action Catalog Sub-Sidebar */}
        <ActionCatalogList
          actions={actions}
          selectedActionId={selectedActionId}
          onSelectAction={handleSelectAction}
          onNewAction={handleStartNewAction}
          isCollapsed={isLeftCollapsed}
          onToggleCollapse={() => setIsLeftCollapsed((prev) => !prev)}
          width={leftCatalogWidth}
          isDragging={isDraggingLeft}
          onStartResize={handleStartResizeLeft}
          onDeleteAction={(id) => {
            const act = actions.find((a) => a.id === id)
            setDeleteModal({
              open: true,
              actionId: id,
              title: act ? act.actionName : "Action"
            })
          }}
          onPublishAction={handleTogglePublish}
          onRenameAction={handleRenameAction}
        />

        {/* Panel 2: Center AI Conversation & Code Studio */}
        {selectedAction ? (
          <ActionChatStudio
            action={selectedAction}
            onSendMessage={handleSendMessage}
            onViewCode={() => {
              setIsRightCollapsed(false)
              setSandboxTab("view_code")
              showToast("Viewing code in the right drawer!")
            }}
            onDeployLive={handleOpenDeployModal}
            onOpenTestHarness={() => {
              setIsRightCollapsed(false)
              setSandboxTab("test_action")
              showToast("Test Harness ready on right panel!")
            }}
            isGenerating={isGenerating}
            isLeftCollapsed={isLeftCollapsed}
            onToggleLeftCollapse={() => setIsLeftCollapsed((prev) => !prev)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            {isLeftCollapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeftCollapsed(false)}
                className="gap-2 text-xs mb-2 border-slate-200 dark:border-slate-800"
              >
                <PanelLeftOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Open Actions Catalog</span>
              </Button>
            )}
            <Zap className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Action Selected
            </h3>
            <p className="text-xs max-w-sm">
              Select an action from the recents list or click &quot;New&quot; to build a custom action.
            </p>
          </div>
        )}

        {/* Panel 3: Right Live Test Action & History Sandbox Drawer (Hidden until agent builds the action) */}
        {selectedAction && (
          <ActionSandboxDrawer
            action={selectedAction}
            onClose={() => setIsRightCollapsed(true)}
            onSaveTestRun={handleSaveTestRun}
            isCollapsed={!hasAgentBuiltAction || isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed((prev) => !prev)}
            activeTab={sandboxTab}
            onActiveTabChange={setSandboxTab}
            width={rightDrawerWidth}
            isDragging={isDraggingRight}
            onStartResize={handleStartResizeRight}
            onToggleWide={handleToggleWideMode}
            isWide={rightDrawerWidth >= 640}
          />
        )}
      </div>

      {/* Full Code Viewer Modal */}
      {selectedAction && (
        <CodeViewerModal
          open={isCodeModalOpen}
          onOpenChange={setIsCodeModalOpen}
          actionName={`${selectedAction.appName} • ${selectedAction.actionName}`}
          code={selectedAction.generatedCode}
        />
      )}

      {/* Deploy Live Confirmation Modal */}
      {selectedAction && (
        <DeployConfirmModal
          open={isDeployModalOpen}
          onOpenChange={setIsDeployModalOpen}
          currentActionName={selectedAction.actionName}
          appName={selectedAction.appName}
          onConfirmDeploy={handleConfirmDeploy}
        />
      )}
    </div>
  )
}
