"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  ArrowUp,
  Play,
  Code2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Check,
  Zap,
  Presentation,
  BookOpen,
  Compass,
  MessageSquareCheck,
  PanelLeftOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppIcon } from "@/components/ui/app-icon"
import { CustomActionItem } from "@/lib/custom-action-types"

interface ActionChatStudioProps {
  action: CustomActionItem
  onSendMessage: (text: string) => void
  onViewCode: () => void
  onDeployLive: () => void
  onOpenTestHarness: () => void
  isGenerating?: boolean
  isLeftCollapsed?: boolean
  onToggleLeftCollapse?: () => void
}

// Canvas App Icons for the 3 moving vertical columns (matching /chat page)
const COL_1_APPS = [
  { id: "google-sheets", name: "Google Sheets" },
  { id: "slack", name: "Slack" },
  { id: "shopify", name: "Shopify" },
  { id: "hubspot", name: "HubSpot" },
  { id: "stripe", name: "Stripe" }
]

const COL_2_APPS = [
  { id: "automate-chats", name: "WhatsApp" },
  { id: "gmail", name: "Gmail" },
  { id: "google-forms", name: "Google Forms" },
  { id: "notion", name: "Notion" },
  { id: "airtable", name: "Airtable" }
]

const COL_3_APPS = [
  { id: "calendly", name: "Calendly" },
  { id: "api-webhook", name: "Webhook" },
  { id: "pipedrive", name: "Pipedrive" },
  { id: "filter", name: "Filter Rules" },
  { id: "delay", name: "Delay" }
]

// 4 Primary Suggestion Cards tailored for Action Building
const ACTION_SUGGESTION_CARDS = [
  {
    id: "sheets-delete",
    title: "Delete Sheet in Google Sheets",
    prompt: "Create a Google Sheets action to delete a sheet tab by spreadsheet ID and sheet ID using batchUpdate API",
    tag: "Sheets API",
    iconBgClass: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
    colorClass: "text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "slack-ephemeral",
    title: "Send Ephemeral Slack Alert",
    prompt: "Create a Slack action to post an ephemeral message to a targeted user inside a channel via chat.postEphemeral",
    tag: "Slack API",
    iconBgClass: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:purple-900/50",
    colorClass: "text-purple-600 dark:text-purple-400"
  },
  {
    id: "shopify-cancel",
    title: "Cancel Order in Shopify",
    prompt: "Create a Shopify action to cancel an unfulfilled customer order by order ID and refund payment",
    tag: "E-Commerce",
    iconBgClass: "bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/50",
    colorClass: "text-pink-500 dark:text-pink-400"
  },
  {
    id: "custom-webhook-sync",
    title: "Custom Webhook Client Sync",
    prompt: "Create a custom API action to POST contact details with HMAC signature to an external CRM webhook",
    tag: "REST API",
    iconBgClass: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
    colorClass: "text-blue-600 dark:text-blue-400"
  }
]

export function ActionChatStudio({
  action,
  onSendMessage,
  onViewCode,
  onDeployLive,
  onOpenTestHarness,
  isGenerating = false,
  isLeftCollapsed = false,
  onToggleLeftCollapse
}: ActionChatStudioProps) {
  const [inputText, setInputText] = useState("")
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [action.messages, isGenerating])

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return
    onSendMessage(inputText.trim())
    setInputText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleThinking = (msgId: string) => {
    setExpandedThinking((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }))
  }

  const isConversationActive = action.messages.length > 0
  const hasAgentBuiltAction = Boolean(
    action.messages.some((m) => m.sender === "assistant") ||
      (action.fields.length > 0 &&
        action.actionName !== "Untitled Action" &&
        action.appName !== "New Action")
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative select-none">
      {/* Top Header Bar (Matching /chat Top Session Bar) */}
      <header className="h-14 px-4 sm:px-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Re-open Left Catalog Button (Only visible when left catalog is collapsed) */}
          {isLeftCollapsed && onToggleLeftCollapse && (
            <button
              type="button"
              onClick={onToggleLeftCollapse}
              className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 shadow-2xs"
              title="Open Actions Catalog (Recents)"
            >
              <PanelLeftOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Recents</span>
            </button>
          )}

          <div className="flex items-center space-x-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {action.appName} · {action.actionName}
            </h1>
            <span className="text-slate-300 dark:text-slate-700 shrink-0">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
              {action.updatedAt || action.createdAt}
            </span>
          </div>

          {action.status === "live" && (
            <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 items-center space-x-1 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live in Workflows</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area (Scrollable Feed) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-5xl mx-auto w-full flex flex-col no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* 1. HERO VIEW (Exact /chat layout when action has no messages) */}
        {!isConversationActive ? (
          <div className="flex-1 flex flex-col justify-center space-y-8 my-auto pb-4 animate-in fade-in duration-300">
            {/* Hero Two-Column Grid: Headline on Left + Moving App Cluster on Right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
              <div className="md:col-span-7 space-y-3.5">
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
                  Build any action,
                  <br />
                  Himanshu.
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
                  Turn any API into a workflow action. Describe the endpoint, payload, or integration, and I&apos;ll write the TypeScript handler and parameters.
                </p>
              </div>

              {/* Right Column: Moving App Cluster with top/bottom blur masks */}
              <div className="md:col-span-5 flex flex-col items-center justify-center select-none">
                <div className="relative w-full max-w-[210px] sm:max-w-[220px] h-[190px] overflow-hidden marquee-vertical-container marquee-vertical-mask flex items-center justify-center">
                  <div className="marquee-blur-top" />
                  <div className="marquee-blur-bottom" />

                  <div className="grid grid-cols-3 gap-2.5 w-full h-full items-center justify-center">
                    {/* Line 1: Top to Bottom */}
                    <div className="overflow-hidden h-full flex justify-center">
                      <div className="animate-marquee-ttb flex flex-col gap-2.5">
                        {[...COL_1_APPS, ...COL_1_APPS].map((app, idx) => (
                          <div
                            key={`col1-${app.id}-${idx}`}
                            onClick={() => onSendMessage(`Create an action for ${app.name}`)}
                            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center p-2.5 transition-all duration-300 hover:scale-110 cursor-pointer shrink-0"
                            title={app.name}
                          >
                            <AppIcon appId={app.id} appName={app.name} size={26} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Line 2: Bottom to Top */}
                    <div className="overflow-hidden h-full flex justify-center">
                      <div className="animate-marquee-btt flex flex-col gap-2.5">
                        {[...COL_2_APPS, ...COL_2_APPS].map((app, idx) => (
                          <div
                            key={`col2-${app.id}-${idx}`}
                            onClick={() => onSendMessage(`Create an action for ${app.name}`)}
                            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center p-2.5 transition-all duration-300 hover:scale-110 cursor-pointer shrink-0"
                            title={app.name}
                          >
                            <AppIcon appId={app.id} appName={app.name} size={26} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Line 3: Top to Bottom */}
                    <div className="overflow-hidden h-full flex justify-center">
                      <div className="animate-marquee-ttb flex flex-col gap-2.5">
                        {[...COL_3_APPS, ...COL_3_APPS].map((app, idx) => (
                          <div
                            key={`col3-${app.id}-${idx}`}
                            onClick={() => onSendMessage(`Create an action for ${app.name}`)}
                            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center p-2.5 transition-all duration-300 hover:scale-110 cursor-pointer shrink-0"
                            title={app.name}
                          >
                            <AppIcon appId={app.id} appName={app.name} size={26} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Connect any API endpoint</span>
                </div>
              </div>
            </div>

            {/* 4 Action Suggestion Cards (Matching /chat Card Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ACTION_SUGGESTION_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onSendMessage(card.prompt)}
                  className="group text-left p-4 rounded-2xl bg-[#fcfbf9] dark:bg-slate-900/70 border border-amber-100/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[125px] cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`p-1.5 rounded-xl border ${card.iconBgClass} transition-transform group-hover:scale-105`}>
                      <Sparkles className={`w-4 h-4 ${card.colorClass}`} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {card.title}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 2. CONVERSATION MESSAGES FEED */
          <div className="space-y-5">
            {action.messages.map((msg) => {
              const isUser = msg.sender === "user"

              if (isUser) {
                return (
                  <div key={msg.id} className="flex items-start justify-end gap-3 max-w-2xl ml-auto animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-slate-800 dark:text-blue-100 border border-blue-100 dark:border-blue-900/50 shadow-xs rounded-tr-xs text-sm leading-relaxed space-y-1">
                      <p className="whitespace-pre-wrap font-normal">
                        {msg.content}
                      </p>
                      {msg.timestamp && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block text-right">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-2xs">
                      H
                    </div>
                  </div>
                )
              }

              // AI Message
              return (
                <div key={msg.id} className="flex justify-start space-y-3 flex-col max-w-2xl animate-in fade-in duration-200">
                  {/* Thinking Time Pill Accordion */}
                  {msg.thinkingSeconds !== undefined && (
                    <div className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleThinking(msg.id)}
                        className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1 cursor-pointer transition-colors"
                      >
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Thinking time: {msg.thinkingSeconds} seconds</span>
                        {expandedThinking[msg.id] ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {expandedThinking[msg.id] && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1">
                      <p>1. Inferred REST API endpoint for {action.appName} mutation</p>
                      <p>2. Generated parameter schema validation rules</p>
                      <p>3. Constructed TypeScript execution handler</p>
                    </div>
                  )}

                  {/* Diff Proposal Card */}
                  {msg.diffSummary && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                          <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span>{msg.diffSummary.title}</span>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Applied
                        </span>
                      </div>

                      <div className="space-y-2">
                        {msg.diffSummary.steps.map((st, i) => (
                          <div key={st.id} className="flex items-start space-x-2.5 text-xs">
                            <span className="h-4 w-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                Add after line {st.lineNumber}:
                              </span>{" "}
                              <span>{st.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ready to Deploy Card */}
                  {msg.isDeployed && (
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {action.status === "live" || action.status === "published"
                              ? "Action is live & deployed"
                              : "Your updated action is ready to deploy"}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {msg.diffSummary?.totalLines || 78} lines
                          </span>
                          {action.status === "live" || action.status === "published" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              Deployed
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {action.status === "live" || action.status === "published"
                          ? "This action is live in Workflow Canvas. You can test it, view code, or redeploy updates."
                          : "Review the changes and deploy the update live when you\u0027re ready."}
                      </p>

                      <div className="flex items-center space-x-2.5 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onViewCode}
                          className="text-xs font-semibold space-x-1.5 h-8 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
                        >
                          <Code2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>View Code</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onOpenTestHarness}
                          className="text-xs font-semibold space-x-1.5 h-8 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 fill-slate-500" />
                          <span>Test Action</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={onDeployLive}
                          className="text-xs font-semibold space-x-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>
                            {action.status === "live" || action.status === "published"
                              ? "Redeploy Live"
                              : "Deploy Live"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status Banner */}
                  {(action.status === "live" || action.status === "published") && (
                    <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-900/60 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Action is live! Ready for selection in Workflow Canvas.</span>
                    </div>
                  )}
                </div>
              )
            })}

            {isGenerating && (
              <div className="flex items-center space-x-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 max-w-md">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Analyzing API endpoints & generating TypeScript action handler...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. FIXED BOTTOM PROMPT DOCK (Matching /chat's Ambient Gradient Card & Layout) */}
      <div className="shrink-0 z-20 w-full px-4 sm:px-6 pb-4 pt-2 max-w-4xl mx-auto bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent">
        <div className="max-w-4xl mx-auto w-full relative">
          {/* Animated Colorful Gradient Side Glow (Matching /chat page) */}
          <div className="relative group z-20">
            {/* Ambient Diffused Outer Glow */}
            <div className="absolute -inset-[3px] rounded-[22px] ai-ambient-gradient opacity-25 dark:opacity-30 blur-md pointer-events-none transition-opacity duration-500 group-hover:opacity-45 group-focus-within:opacity-60" />

            {/* Animated Colorful Border Ring Along the Sides */}
            <div className="absolute -inset-[1.5px] rounded-[18px] ai-ambient-gradient opacity-40 dark:opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-65 group-focus-within:opacity-85" />

            {/* Main Card Surface */}
            <div className="relative z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl p-4 transition-all">
              {/* Multiline Prompt Area */}
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Create a Google Sheets action to delete sheet, or Slack ephemeral message..."
                className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400/90 dark:placeholder:text-slate-500 text-sm resize-none min-h-[50px] leading-relaxed transition-all"
                style={{ outline: "none", boxShadow: "none" }}
              />

              {/* Controls Toolbar inside the card */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                <div className="flex items-center space-x-2">
                  {/* Test Actions Button (Only visible once agent builds action) */}
                  {hasAgentBuiltAction && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenTestHarness}
                      className="h-8 px-3 text-xs font-semibold space-x-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Play className="h-3 w-3 text-slate-600 dark:text-slate-300 fill-slate-500" />
                      <span>Test actions</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isGenerating}
                    className="h-9 w-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
