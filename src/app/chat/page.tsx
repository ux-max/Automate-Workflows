"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  ArrowUp,
  Paperclip,
  Mic,
  MicOff,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Play,
  Copy,
  Download,
  ExternalLink,
  X,
  AlertCircle,
  Presentation,
  BookOpen,
  Compass,
  MessageSquareCheck,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Bot,
  Zap,
  Check,
  FileText,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppIcon } from "@/components/ui/app-icon"
import {
  GeneratedWorkflowPlan,
  ChatMessage,
  generateWorkflowFromPrompt,
  refineWorkflowWithPrompt
} from "@/lib/ai-workflow-generator"
import { MVP_APPS } from "@/lib/data"
import { WORKFLOW_IDEAS } from "@/components/workflow/AIWorkflowAssistant"

// Rotating motivational greetings — changes on each new chat
const HERO_GREETINGS = [
  "Go all in,",
  "Let's build it,",
  "Dream bigger,",
  "Automate everything,",
  "Ship it faster,",
  "Level up today,",
  "Make it happen,",
  "Think bolder,",
  "Break limits,",
  "Own the workflow,",
  "Start creating,",
  "No limits,",
  "Ready to build,",
  "Let's crush it,",
  "Move faster,"
]

// Canvas App Icons organized for 3 vertical moving columns
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

// The 4 Action / Suggestion Cards matching Image 2
interface SuggestionCard {
  id: string
  title: string
  prompt: string
  icon: "presentation" | "book" | "compass" | "check"
  colorClass: string
  iconBgClass: string
  tag: string
}

const PRIMARY_SUGGESTION_CARDS: SuggestionCard[] = [
  {
    id: "synthesize-research",
    title: "Synthesize user research findings",
    prompt: "Synthesize user research findings from Google Forms, summarize key pain points, and send an executive alert to #product Slack channel",
    icon: "presentation",
    colorClass: "text-pink-500 dark:text-pink-400",
    iconBgClass: "bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/50",
    tag: "Research"
  },
  {
    id: "friction-analysis",
    title: "Deep-dive friction analysis",
    prompt: "Perform a deep-dive friction analysis by logging failed checkout webhooks to Google Sheets, sending a high-priority alert to Slack, and creating a HubSpot task",
    icon: "book",
    colorClass: "text-purple-600 dark:text-purple-400",
    iconBgClass: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50",
    tag: "Analytics"
  },
  {
    id: "first-run-redesign",
    title: "Redesign first-run experience",
    prompt: "When a new customer signs up, send an automated welcome email via Gmail, trigger a personalized WhatsApp message, and add contact to HubSpot CRM",
    icon: "compass",
    colorClass: "text-teal-600 dark:text-teal-400",
    iconBgClass: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/50",
    tag: "Activation"
  },
  {
    id: "benchmark-onboarding",
    title: "Benchmark onboarding UX",
    prompt: "Collect post-onboarding satisfaction survey responses from Google Forms, calculate benchmark scores in Google Sheets, and post weekly summary to Slack",
    icon: "check",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    iconBgClass: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
    tag: "Growth"
  }
]

const EXPANDED_SUGGESTION_CARDS: SuggestionCard[] = [
  {
    id: "shopify-fulfillment",
    title: "Shopify order to Sheets & Slack",
    prompt: "When an order is paid in Shopify, record transaction in Google Sheets and alert the fulfillment team in Slack",
    icon: "compass",
    colorClass: "text-blue-600 dark:text-blue-400",
    iconBgClass: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
    tag: "E-Commerce"
  },
  {
    id: "whatsapp-crm-capture",
    title: "WhatsApp lead capture & CRM sync",
    prompt: "When a new inquiry message is received in WhatsApp, create or update a contact in HubSpot CRM and schedule a follow-up task",
    icon: "check",
    colorClass: "text-green-600 dark:text-green-400",
    iconBgClass: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/50",
    tag: "Leads"
  },
  {
    id: "calendly-meeting-prep",
    title: "Calendly booking to Zoom & Gmail",
    prompt: "When a customer books a meeting via Calendly, generate a Zoom meeting link and send confirmation email via Gmail",
    icon: "presentation",
    colorClass: "text-amber-600 dark:text-amber-400",
    iconBgClass: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    tag: "Meetings"
  },
  {
    id: "stripe-payout-audit",
    title: "Stripe payout & finance logging",
    prompt: "When a payout or charge succeeds in Stripe, append payment details to Google Sheets and notify #finance in Slack",
    icon: "book",
    colorClass: "text-indigo-600 dark:text-indigo-400",
    iconBgClass: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50",
    tag: "Finance"
  }
]

export default function ChatPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showMoreCards, setShowMoreCards] = useState(false)
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showCreditAlert, setShowCreditAlert] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTestStepId, setActiveTestStepId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [greetingIndex, setGreetingIndex] = useState(() => Math.floor(Math.random() * HERO_GREETINGS.length))

  // Dynamic Animated Workflow Idea Typing Effect (Exact Same Interaction as in Canvas)
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

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isGenerating])

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }

  // Voice speech-to-text handler
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in your browser.")
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        showToast("Listening... speak your workflow prompt.")
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
        showToast("Transcribed voice input!")
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  // Execute workflow prompt
  const handleSendPrompt = (promptText?: string) => {
    const textToSubmit = (promptText || inputText).trim()
    if (!textToSubmit || isGenerating) return

    const userMessageId = `user_${Date.now()}`
    const aiMessageId = `ai_${Date.now()}`

    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    setIsGenerating(true)

    // Simulate real-time generation and blueprint synthesis
    setTimeout(() => {
      // Check if this is an update to an existing plan or brand new
      const lastAiMessage = [...messages].reverse().find((m) => m.sender === "ai" && m.plan)
      let plan: GeneratedWorkflowPlan

      if (lastAiMessage?.plan) {
        plan = refineWorkflowWithPrompt(lastAiMessage.plan.steps, textToSubmit, MVP_APPS)
      } else {
        plan = generateWorkflowFromPrompt(textToSubmit, MVP_APPS)
      }

      const aiMsg: ChatMessage = {
        id: aiMessageId,
        sender: "ai",
        text: `I've planned and built the automation architecture for **${plan.workflowName}** with ${plan.steps.length} integrated apps. You can inspect the blueprint below and launch it directly into the visual canvas editor.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        plan
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsGenerating(false)
    }, 900)
  }

  // Reset conversation to fresh hero state
  const handleNewChat = () => {
    setMessages([])
    setInputText("")
    setGreetingIndex((prev) => {
      let next = Math.floor(Math.random() * HERO_GREETINGS.length)
      while (next === prev && HERO_GREETINGS.length > 1) {
        next = Math.floor(Math.random() * HERO_GREETINGS.length)
      }
      return next
    })
    showToast("Started a new chat session")
  }

  // Open generated plan on Visual Canvas Editor
  const handleOpenInCanvas = (plan: GeneratedWorkflowPlan) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "pending_ai_workflow",
        JSON.stringify({
          workflowName: plan.workflowName,
          steps: plan.steps,
          plan: plan,
          chatMessages: messages
        })
      )
    }
    router.push(`/workflows/editor?source=chat&name=${encodeURIComponent(plan.workflowName)}`)
  }

  // Simulate a live step test
  const handleSimulateTest = (plan: GeneratedWorkflowPlan) => {
    if (!plan.steps.length) return
    setActiveTestStepId(plan.steps[0].id)
    showToast(`Testing step 1: ${plan.steps[0].appName}...`)

    setTimeout(() => {
      if (plan.steps.length > 1) {
        setActiveTestStepId(plan.steps[1].id)
        showToast(`Step 1 passed! Testing step 2: ${plan.steps[1].appName}...`)
      }
      setTimeout(() => {
        setActiveTestStepId(null)
        showToast("Workflow dry-run completed successfully! All steps valid.")
      }, 800)
    }, 800)
  }

  // Copy workflow JSON schema to clipboard
  const handleCopySchema = (plan: GeneratedWorkflowPlan) => {
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2))
    setCopiedId(plan.workflowName)
    showToast("Copied workflow schema to clipboard")
    setTimeout(() => setCopiedId(null), 2500)
  }

  // Render suggestion card icon
  const renderCardIcon = (type: SuggestionCard["icon"], colorClass: string) => {
    switch (type) {
      case "presentation":
        return <Presentation className={`w-6 h-6 ${colorClass}`} />
      case "book":
        return <BookOpen className={`w-6 h-6 ${colorClass}`} />
      case "compass":
        return <Compass className={`w-6 h-6 ${colorClass}`} />
      case "check":
        return <MessageSquareCheck className={`w-6 h-6 ${colorClass}`} />
    }
  }

  const isConversationActive = messages.length > 0

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 h-full w-full font-sans select-none relative flex flex-col no-scrollbar overflow-hidden">
      {/* Premium Floating Pure White Main Canvas Container (matching workflows and all other pages) */}
      <div className="w-full h-full flex-1 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs relative overflow-hidden flex flex-col no-scrollbar min-h-0">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Session Bar (Matching Image 2: Clock History Icon + New Chat Button) */}
        <header className="h-14 shrink-0 px-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-20">
        <div className="flex items-center gap-2">
          {/* History Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              showHistoryDrawer ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : ""
            }`}
            title="Chat History"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* + New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Slide-over History Drawer */}
        {showHistoryDrawer && (
          <aside className="w-72 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recent Workflows
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { title: "Shopify Orders to Sheets & Slack", date: "Today" },
                  { title: "WhatsApp Lead to HubSpot CRM", date: "Yesterday" },
                  { title: "Webhook Transaction Router", date: "Sep 20" },
                  { title: "Calendly to Zoom Sync", date: "Sep 18" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleSendPrompt(item.title)
                      setShowHistoryDrawer(false)
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs group cursor-pointer"
                  >
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.date}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => {
                  setMessages([])
                  setShowHistoryDrawer(false)
                }}
                className="w-full py-2 text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </aside>
        )}

        {/* Middle Column: Scrollable Top Area + Fixed Bottom AI Input */}
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
          {/* Scrollable Content Container (Hero or Messages) */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-5xl mx-auto w-full flex flex-col">
            {/* 1. HERO VIEW: When conversation is empty (Exact Layout Matching Image 2) */}
            {!isConversationActive ? (
              <div className="flex-1 flex flex-col justify-center space-y-8 sm:space-y-10 my-auto pb-4">
              {/* Hero Two-Column Grid: Left Text + Right Honeycomb App Cluster */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2 md:pt-6">
                {/* Left Column: Heading & Subheadline */}
                <div className="md:col-span-7 space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                    {HERO_GREETINGS[greetingIndex]}
                    <br />
                    Himanshu.
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
                    I don't just answer questions — I do the work, end to end, across every app you use. Whatever
                    you're picturing, I can probably go further.
                  </p>
                </div>

                {/* Right Column: Canvas Moving App Columns (Top to Bottom & Bottom to Top, Background Removed, 3 Lines, Blur Top & Bottom) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center select-none">
                  <div className="relative w-full max-w-[210px] sm:max-w-[230px] h-[220px] overflow-hidden marquee-vertical-container marquee-vertical-mask flex items-center justify-center">
                    {/* Top & bottom frosted blur effect overlays */}
                    <div className="marquee-blur-top" />
                    <div className="marquee-blur-bottom" />

                    {/* Exactly 3 Lines/Columns of canvas app icons moving vertically */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-3.5 w-full h-full items-center justify-center">
                      {/* Line 1: Top to Bottom */}
                      <div className="overflow-hidden h-full flex justify-center">
                        <div className="animate-marquee-ttb flex flex-col gap-3">
                          {[...COL_1_APPS, ...COL_1_APPS, ...COL_1_APPS].map((app, idx) => (
                            <div
                              key={`col1-${app.id}-${idx}`}
                              onClick={() => handleSendPrompt(`Create an automated workflow connecting ${app.name} to notify the team.`)}
                              className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center p-2.5 sm:p-3 transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer shrink-0"
                              title={app.name}
                            >
                              <AppIcon appId={app.id} appName={app.name} size={28} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Line 2: Bottom to Top */}
                      <div className="overflow-hidden h-full flex justify-center">
                        <div className="animate-marquee-btt flex flex-col gap-3">
                          {[...COL_2_APPS, ...COL_2_APPS, ...COL_2_APPS].map((app, idx) => (
                            <div
                              key={`col2-${app.id}-${idx}`}
                              onClick={() => handleSendPrompt(`Create an automated workflow connecting ${app.name} to notify the team.`)}
                              className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center p-2.5 sm:p-3 transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer shrink-0"
                              title={app.name}
                            >
                              <AppIcon appId={app.id} appName={app.name} size={28} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Line 3: Top to Bottom */}
                      <div className="overflow-hidden h-full flex justify-center">
                        <div className="animate-marquee-ttb flex flex-col gap-3">
                          {[...COL_3_APPS, ...COL_3_APPS, ...COL_3_APPS].map((app, idx) => (
                            <div
                              key={`col3-${app.id}-${idx}`}
                              onClick={() => handleSendPrompt(`Create an automated workflow connecting ${app.name} to notify the team.`)}
                              className="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center p-2.5 sm:p-3 transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer shrink-0"
                              title={app.name}
                            >
                              <AppIcon appId={app.id} appName={app.name} size={28} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtle 700+ apps label under cluster */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>70+ apps supported</span>
                  </div>
                </div>
              </div>

              {/* Action / Suggestion Cards Grid (4 Cards across matching Image 2) */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {PRIMARY_SUGGESTION_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSendPrompt(card.prompt)}
                      className="group text-left p-5 rounded-2xl bg-[#fcfbf9] dark:bg-slate-900/70 border border-amber-100/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px] cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div
                          className={`p-2 rounded-xl border ${card.iconBgClass} transition-transform duration-200 group-hover:scale-105`}
                        >
                          {renderCardIcon(card.icon, card.colorClass)}
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {card.tag}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {card.title}
                      </h3>
                    </button>
                  ))}
                </div>

                {/* Expandable "More and bigger ⌵" Section */}
                {showMoreCards && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {EXPANDED_SUGGESTION_CARDS.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleSendPrompt(card.prompt)}
                        className="group text-left p-5 rounded-2xl bg-[#fcfbf9] dark:bg-slate-900/70 border border-amber-100/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px] cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <div
                            className={`p-2 rounded-xl border ${card.iconBgClass} transition-transform duration-200 group-hover:scale-105`}
                          >
                            {renderCardIcon(card.icon, card.colorClass)}
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {card.tag}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {card.title}
                        </h3>
                      </button>
                    ))}
                  </div>
                )}

                {/* "More and bigger ⌵" Toggle Button */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMoreCards(!showMoreCards)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <span>{showMoreCards ? "Show less" : "More and bigger"}</span>
                    {showMoreCards ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 2. CONVERSATION VIEW: Interactive AI Workflow Plan & Message Stream */
            <div className="flex-1 space-y-6 pb-6 overflow-y-auto no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Bubble */}
                  {msg.sender === "user" ? (
                    <div className="flex items-start justify-end gap-3 max-w-2xl ml-auto">
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-slate-800 dark:text-blue-100 border border-blue-100 dark:border-blue-900/50 shadow-xs rounded-tr-xs text-sm leading-relaxed">
                        {msg.text}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-2xs">
                        H
                      </div>
                    </div>
                  ) : (
                    /* AI Assistant Bubble + Interactive Workflow Plan Card */
                    <div className="flex items-start gap-3 max-w-3xl">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/40">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-4">
                        {/* Text explanation */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-sm leading-relaxed rounded-tl-xs">
                          <p className="text-slate-800 dark:text-slate-200">{msg.text}</p>
                        </div>

                        {/* Interactive Workflow Plan Card */}
                        {msg.plan && (
                          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                            {/* Header: Title & Badges */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 text-[11px]">
                                    AI Blueprint
                                  </Badge>
                                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                    {msg.plan.steps.length} steps generated
                                  </span>
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                                  {msg.plan.workflowName}
                                </h3>
                              </div>

                              {/* Primary Action: Open in Canvas Editor */}
                              <Button
                                size="sm"
                                onClick={() => handleOpenInCanvas(msg.plan!)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5 px-4 rounded-xl shadow-xs cursor-pointer"
                              >
                                <span>Open in Canvas Editor</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Connected Pipeline Steps Visualization */}
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Automation Pipeline
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {msg.plan.steps.map((step, sIdx) => (
                                  <div
                                    key={step.id}
                                    className={`p-3.5 rounded-xl border relative transition-all ${
                                      activeTestStepId === step.id
                                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                                        : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <AppIcon appId={step.appId} appName={step.appName} size={22} />
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                          {step.appName}
                                        </span>
                                      </div>
                                      <span
                                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                                          step.type === "trigger"
                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                        }`}
                                      >
                                        {step.type === "trigger" ? "Trigger" : `Action ${sIdx}`}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                                      {step.eventName}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSimulateTest(msg.plan!)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Simulate Run</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopySchema(msg.plan!)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                                >
                                  {copiedId === msg.plan.workflowName ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                  <span>{copiedId === msg.plan.workflowName ? "Copied" : "Copy Schema"}</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenInCanvas(msg.plan!)}
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Direct Canvas View</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Generating loading indicator */}
              {isGenerating && (
                <div className="flex items-center gap-3 max-w-2xl">
                  <div className="h-8 w-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>Analyzing triggers, mapping apps & generating nodes...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
          </div>

          {/* 3. FIXED BOTTOM CHAT INPUT SECTION (Stays pinned to bottom when scrolling) */}
          <div className="shrink-0 z-20 w-full px-4 sm:px-6 lg:px-8 pb-3 pt-2 max-w-5xl mx-auto bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent">
            <div className="max-w-4xl mx-auto w-full relative">
              {/* Animated Colorful Gradient Side Glow (Same as Canvas Input Field) */}
              <div className="relative group z-20">
                {/* Ambient Diffused Outer Glow */}
                <div className="absolute -inset-[3px] rounded-[22px] ai-ambient-gradient opacity-25 dark:opacity-30 blur-md pointer-events-none transition-opacity duration-500 group-hover:opacity-45 group-focus-within:opacity-60" />

                {/* Animated Colorful Border Ring Along the Sides */}
                <div className="absolute -inset-[1.5px] rounded-[18px] ai-ambient-gradient opacity-40 dark:opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-65 group-focus-within:opacity-85" />

                {/* Main Card Surface */}
                <div className="relative z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl p-4 transition-all">
                {/* Multiline Prompt Area with Dynamic Workflow Idea */}
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={inputText}
                  onChange={handleTextChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendPrompt()
                    }
                  }}
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
                  <div className="flex items-center space-x-1.5">
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
                  </div>

                  {/* Right: "Start building" Button */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={!inputText.trim() || isGenerating}
                      onClick={() => handleSendPrompt()}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs ${
                        inputText.trim() && !isGenerating
                          ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200/60 dark:border-slate-700/60"
                      }`}
                    >
                      <span>Start building</span>
                      <ArrowUp className="h-3.5 w-3.5" />
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
        </div>
        </div>
      </div>
    </div>
  </div>
  )
}
