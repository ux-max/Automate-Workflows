"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Zap,
  Layers,
  Settings,
  MessageSquare,
  ShieldCheck,
  ArrowUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppIcon } from "@/components/ui/app-icon"
import {
  GeneratedWorkflowPlan,
  SuggestedNextStep,
  ChatMessage,
  generateWorkflowFromPrompt,
  refineWorkflowWithPrompt
} from "@/lib/ai-workflow-generator"
import { AppConnection, WorkflowStep } from "@/lib/data"

export interface AIWorkflowAssistantProps {
  mode: "bottom-floating" | "left-docked" | "minimized" | "closed"
  onModeChange: (mode: "bottom-floating" | "left-docked" | "minimized" | "closed") => void
  catalog: AppConnection[]
  steps: WorkflowStep[]
  onGenerateSteps: (plan: GeneratedWorkflowPlan) => void
  onRefineSteps: (plan: GeneratedWorkflowPlan) => void
  onSelectStepToConfigure: (stepId: string) => void
  isBuildingWorkflow: boolean
  buildingProgress: {
    total: number
    current: number
    currentAppName?: string
  }
  chatMessages?: ChatMessage[]
  onChatMessagesChange?: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  lastPlan?: GeneratedWorkflowPlan | null
  onLastPlanChange?: (plan: GeneratedWorkflowPlan | null) => void
}

export const WORKFLOW_IDEAS = [
  "When a new lead fills Google Forms, send a Slack message to #leads and add a row in Google Sheets",
  "When a new WhatsApp message arrives in Automate Chats, create or update a contact in HubSpot CRM",
  "When an order is paid in Shopify, send an email receipt via Gmail and alert the sales team on Slack",
  "Catch an inbound Webhook, filter for high-value transactions, and create a deal in Pipedrive",
  "When a new customer signs up, send a welcome email and create an onboarding task in ClickUp"
]

export const PEEKING_APPS = [
  {
    id: "slack",
    name: "Slack",
    prompt: "When a new lead fills Google Forms, send a Slack notification to #leads and add to Google Sheets",
    animClass: "animate-peek-pop-1",
    tiltClass: "peek-tilt-left",
    zIndex: "z-[11]"
  },
  {
    id: "shopify",
    name: "Shopify",
    prompt: "When an order is paid in Shopify, send a confirmation email via Gmail and alert the team on Slack",
    animClass: "animate-peek-pop-2",
    tiltClass: "peek-tilt-right",
    zIndex: "z-[12]"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    prompt: "When a new WhatsApp message arrives in Automate Chats, create or update a contact in HubSpot CRM",
    animClass: "animate-peek-pop-3",
    tiltClass: "peek-tilt-left",
    zIndex: "z-[13]"
  },
  {
    id: "gmail",
    name: "Gmail",
    prompt: "Catch an inbound Webhook, filter for high-value transactions, and send a personalized email via Gmail",
    animClass: "animate-peek-pop-4",
    tiltClass: "peek-tilt-right",
    zIndex: "z-[14]"
  }
]

export function AIWorkflowAssistant({
  mode,
  onModeChange,
  catalog,
  steps,
  onGenerateSteps,
  onRefineSteps,
  onSelectStepToConfigure,
  isBuildingWorkflow,
  buildingProgress,
  chatMessages: externalChatMessages,
  onChatMessagesChange,
  lastPlan: externalLastPlan,
  onLastPlanChange
}: AIWorkflowAssistantProps) {
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [internalChatMessages, setInternalChatMessages] = useState<ChatMessage[]>([])
  const [internalLastPlan, setInternalLastPlan] = useState<GeneratedWorkflowPlan | null>(null)
  const [completedSuggestions, setCompletedSuggestions] = useState<Record<string, boolean>>({})

  const chatMessages = externalChatMessages !== undefined ? externalChatMessages : internalChatMessages
  const setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = (action) => {
    if (onChatMessagesChange) {
      onChatMessagesChange(action)
    } else {
      setInternalChatMessages(action)
    }
  }

  const lastPlan = externalLastPlan !== undefined ? externalLastPlan : internalLastPlan
  const setLastPlan = (plan: GeneratedWorkflowPlan | null) => {
    if (onLastPlanChange) {
      onLastPlanChange(plan)
    } else {
      setInternalLastPlan(plan)
    }
  }

  // Dynamic Animated Workflow Idea Typing Effect (Cycles inspiring workflow prompts)
  const [ideaIndex, setIdeaIndex] = useState(0)
  const [currentIdeaText, setCurrentIdeaText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (inputText) return // Stop animating when user types

    const fullText = WORKFLOW_IDEAS[ideaIndex]
    const typingSpeed = isDeleting ? 18 : 36
    const pauseDelay = isDeleting ? 400 : 3600

    if (!isDeleting && currentIdeaText === fullText) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDelay)
      return () => clearTimeout(timeout)
    } else if (isDeleting && currentIdeaText === "") {
      setIsDeleting(false)
      setIdeaIndex((prev) => (prev + 1) % WORKFLOW_IDEAS.length)
      return
    }

    const timeout = setTimeout(() => {
      setCurrentIdeaText(
        isDeleting
          ? fullText.substring(0, currentIdeaText.length - 1)
          : fullText.substring(0, currentIdeaText.length + 1)
      )
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentIdeaText, isDeleting, ideaIndex, inputText])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-scroll to conversation bottom when messages update or panel opens
  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages.length, mode])

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (mode === "left-docked" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages, isBuildingWorkflow, mode])

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    if (speechSupported && recognitionRef.current) {
      try {
        setIsListening(true)
        recognitionRef.current.start()
      } catch {
        setIsListening(false)
      }
    } else {
      // Graceful simulated voice typing for testing in environments without Speech API
      setIsListening(true)
      const mockVoicePrompts = [
        "When a new response is submitted in Google Forms, send a Slack message to #leads and add a row in Google Sheets",
        "When a new customer signs up, send a welcome WhatsApp message and create a deal in Pipedrive",
        "New Shopify order created, then notify sales on Slack and log in Notion"
      ]
      const chosen = mockVoicePrompts[Math.floor(Math.random() * mockVoicePrompts.length)]
      setTimeout(() => {
        setInputText(chosen)
        setIsListening(false)
      }, 1400)
    }
  }

  const handlePromptSubmit = (promptToUse?: string) => {
    const text = (promptToUse || inputText).trim()
    if (!text || isBuildingWorkflow) return

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // Determine whether this is an initial build or refinement
    const isInitialBuild = steps.length === 0 || (steps.length === 1 && !steps[0].appId) || !lastPlan
    const plan = isInitialBuild
      ? generateWorkflowFromPrompt(text, catalog)
      : refineWorkflowWithPrompt(steps, text, catalog)

    setLastPlan(plan)

    // Add AI response placeholder with plan
    const aiMsg: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      sender: "ai",
      text: plan.summary,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      plan
    }

    setChatMessages((prev) => [...prev, userMsg, aiMsg])
    setInputText("")

    // Transition mode to left-docked if not already
    if (mode !== "left-docked") {
      onModeChange("left-docked")
    }

    // Dispatch plan to parent workflow canvas
    if (isInitialBuild) {
      onGenerateSteps(plan)
    } else {
      onRefineSteps(plan)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === "Tab" && !inputText.trim() && currentIdeaText) {
      e.preventDefault()
      setInputText(currentIdeaText)
      return
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (inputText.trim()) {
        handlePromptSubmit()
      }
    }
  }

  // =========================================================================
  // VIEW 1: BOTTOM FLOATING TYPER UI (Zapier Copilot Style with App Theme)
  // =========================================================================
  if (mode === "bottom-floating") {
    return (
      <div className="absolute bottom-6 inset-x-0 mx-auto w-[700px] max-w-[94vw] z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Apps Pop-up Row Peeking Behind Top Edge - Alternating Left & Right Tilt with Balanced Spacing */}
        <div className="absolute -top-8 left-8 z-10 flex items-center -space-x-2 select-none pointer-events-auto">
          {PEEKING_APPS.map((app) => (
            <div
              key={app.id}
              onClick={() => setInputText(app.prompt)}
              className={`relative ${app.animClass} ${app.zIndex} group/peek cursor-pointer transition-all duration-300 hover:z-40 hover:-translate-y-3 hover:scale-115 active:scale-95`}
              title={`Click to automate with ${app.name}`}
            >
              <div
                className={`w-[52px] h-[52px] rounded-2xl bg-white dark:bg-slate-850 border-2 border-slate-200/90 dark:border-slate-700 shadow-md ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center p-2.5 transition-all duration-300 group-hover/peek:border-blue-500 dark:group-hover/peek:border-blue-400 group-hover/peek:shadow-xl ${app.tiltClass}`}
              >
                <AppIcon appId={app.id} size={28} />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/peek:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xs text-white text-[10px] font-semibold py-0.5 px-2 rounded-md shadow-md whitespace-nowrap z-40">
                {app.name}
              </div>
            </div>
          ))}
        </div>

        {/* Animated Colorful Gradient Side Glow (Low Opacity Ambient Attention Grabber) */}
        <div className="relative group z-20">
          {/* Ambient Diffused Outer Glow */}
          <div className="absolute -inset-[3px] rounded-[22px] ai-ambient-gradient opacity-25 dark:opacity-30 blur-md pointer-events-none transition-opacity duration-500 group-hover:opacity-45 group-focus-within:opacity-60" />

          {/* Animated Colorful Border Ring Along the Sides */}
          <div className="absolute -inset-[1.5px] rounded-[18px] ai-ambient-gradient opacity-40 dark:opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-65 group-focus-within:opacity-85" />

          {/* Main Card Surface */}
          <div className="relative z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl p-4 transition-all">
            {/* Multiline Prompt Area with Dynamic Workflow Idea */}
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                currentIdeaText
                  ? `e.g. ${currentIdeaText}`
                  : "e.g. When a new lead fills Google Forms, send a Slack message..."
              }
              className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400/90 dark:placeholder:text-slate-500 text-sm sm:text-base resize-none min-h-[56px] leading-relaxed transition-all"
              style={{ outline: "none", boxShadow: "none" }}
            />

            {/* Bottom Toolbar Row */}
            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800/80">
              {/* Left: Microphone */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-sm"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={isListening ? "Listening... click to stop" : "Voice input"}
                aria-label="Voice Input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Right: Start building button + Dismiss */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={!inputText.trim() || isBuildingWorkflow}
                  onClick={() => handlePromptSubmit()}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs ${
                    inputText.trim() && !isBuildingWorkflow
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200/60 dark:border-slate-700/60"
                  }`}
                >
                  <span>Start building</span>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onModeChange("closed")}
                  className="h-7 w-7 rounded-lg text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Disclaimer Caption */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2.5 select-none">
          AI can make mistakes. Please double-check responses.
        </p>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: LEFT-DOCKED AI CONVERSATION INTERFACE (Image 2 - Left Panel)
  // =========================================================================
  if (mode === "left-docked") {
    return (
      <aside className="absolute left-16 top-4 bottom-4 w-80 md:w-96 z-30 select-none text-slate-900 dark:text-slate-100 group animate-in slide-in-from-left duration-200">
        {/* Ambient Diffused Outer Glow on side of panel */}
        <div className="absolute -inset-[3px] rounded-[22px] ai-ambient-gradient opacity-20 dark:opacity-25 blur-md pointer-events-none transition-opacity duration-500 group-hover:opacity-35" />

        {/* Animated Colorful Border Ring Along the Sides */}
        <div className="absolute -inset-[1.5px] rounded-[18px] ai-ambient-gradient opacity-35 dark:opacity-40 pointer-events-none transition-opacity duration-500 group-hover:opacity-55" />

        {/* Inner Card Container */}
        <div className="relative h-full w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 rounded-t-2xl shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <span>AI Workflow Architect</span>
              {isBuildingWorkflow ? (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                  Building...
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              )}
            </h3>
          </div>

          {/* Action buttons: Reset, Close */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setChatMessages([])
                setLastPlan(null)
                setCompletedSuggestions({})
                setInputText("")
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90"
              title="Refresh & Clear Chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onModeChange("closed")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close AI Panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Real-time Generation Banner when building */}
        {isBuildingWorkflow && (
          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-900/60 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Adding {buildingProgress.currentAppName || "step"} to canvas...
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300">
              {buildingProgress.current} / {buildingProgress.total}
            </span>
          </div>
        )}

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 space-y-4 text-xs">
          
          {chatMessages.length === 0 ? (
            /* Welcome Empty State inside Left Panel */
            <div className="min-h-full flex flex-col items-center justify-center text-center p-2 text-slate-500 dark:text-slate-400">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                AI Workflow Architect
              </h4>
              <p className="text-[11px] mt-1 text-slate-500 max-w-xs leading-relaxed">
                Describe any multi-app automation. I will build the nodes on your canvas in real-time.
              </p>

              {/* Workflow Ideas Showcase */}
              <div className="mt-4 w-full space-y-2 text-left">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                  💡 Workflow Ideas
                </span>
                {WORKFLOW_IDEAS.slice(0, 3).map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(idea)
                      handlePromptSubmit(idea)
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-xs text-slate-700 dark:text-slate-300 group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-start space-x-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 text-[11px]">
                        {idea}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                {/* SENDER LABEL */}
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-semibold text-slate-400 px-1">
                  {msg.sender === "user" ? (
                    <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>You</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-semibold">
                      <Sparkles className="h-3 w-3" />
                      <span>AI Architect</span>
                    </span>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                {/* USER BUBBLE */}
                {msg.sender === "user" && (
                  <div className="max-w-[92%] bg-gradient-to-br from-blue-50/95 via-indigo-50/50 to-blue-50/80 dark:from-blue-950/40 dark:via-slate-800/80 dark:to-indigo-950/30 border border-blue-200/90 dark:border-blue-800/70 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tr-xs p-3.5 text-xs font-normal leading-relaxed shadow-2xs whitespace-pre-wrap break-words">
                    {msg.text}
                  </div>
                )}

                {/* AI RESPONSE BUBBLE */}
                {msg.sender === "ai" && (
                  <div className="w-full space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl rounded-tl-xs p-3.5 text-slate-800 dark:text-slate-200 leading-relaxed space-y-2.5">
                      <p className="font-medium text-xs text-slate-700 dark:text-slate-300">
                        {msg.text}
                      </p>

                      {/* Workflow Steps Badges */}
                      {msg.plan && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Built on Canvas ({msg.plan.steps.length} Steps)
                          </span>
                          <div className="space-y-1.5">
                            {msg.plan.steps.map((st, sIdx) => (
                              <div
                                key={st.id}
                                onClick={() => onSelectStepToConfigure(st.id)}
                                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="h-5 w-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                                    {sIdx + 1}
                                  </span>
                                  <AppIcon appId={st.appId} appName={st.appName} size={18} />
                                  <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {st.appName}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                  {st.eventName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SUGGESTED REQUIRED STEPS CHECKLIST (Requested in prompt) */}
                    {msg.plan && msg.plan.suggestedNextSteps.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-50/60 to-indigo-50/30 dark:from-blue-950/40 dark:to-slate-900/60 border border-blue-200 dark:border-blue-900/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Required Setup & Next Steps</span>
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            {Object.keys(completedSuggestions).length} / {msg.plan.suggestedNextSteps.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {msg.plan.suggestedNextSteps.map((sug) => {
                            const isDone = completedSuggestions[sug.id]
                            return (
                              <div
                                key={sug.id}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isDone
                                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 shadow-2xs"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                      {isDone ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                      ) : (
                                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                      )}
                                      <span>{sug.title}</span>
                                    </h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                                      {sug.description}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectStepToConfigure(sug.stepId)
                                      setCompletedSuggestions((prev) => ({ ...prev, [sug.id]: true }))
                                    }}
                                    className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                      isDone
                                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs hover:scale-105"
                                    }`}
                                  >
                                    <span>{sug.actionLabel}</span>
                                    <ArrowRight className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Docked AI Input Bar at the Bottom of Left Panel */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 backdrop-blur-md rounded-b-2xl shrink-0">
          <div className="relative">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to refine, add steps, or filter..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pr-20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none leading-relaxed"
              style={{ outline: "none" }}
            />

            {/* Bottom-Right Icons: VOICE and SEND */}
            <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-500 border-red-600 text-white animate-pulse"
                    : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400"
                }`}
                title="Voice Input"
                aria-label="Voice Input"
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                disabled={!inputText.trim() || isBuildingWorkflow}
                onClick={() => handlePromptSubmit()}
                className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="Send"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* AI Disclaimer Caption */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2 select-none">
            AI can make mistakes. Please double-check responses.
          </p>
        </div>

        </div>
      </aside>
    )
  }

  // =========================================================================
  // VIEW 3: MINIMIZED FLOATING PILL
  // =========================================================================
  if (mode === "minimized") {
    return (
      <div className="absolute bottom-6 left-16 z-30 animate-in fade-in">
        <button
          onClick={() => onModeChange("left-docked")}
          className="h-10 px-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xl flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Open AI Architect</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return null
}
