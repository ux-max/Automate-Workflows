"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  PlusCircle,
  Mic,
  MicOff,
  ArrowUp,
  ArrowRight,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AppIcon } from "@/components/ui/app-icon"
import { MVP_APPS } from "@/lib/data"
import {
  generateWorkflowFromPrompt,
  GeneratedWorkflowPlan
} from "@/lib/ai-workflow-generator"
import {
  PEEKING_APPS,
  WORKFLOW_IDEAS
} from "@/components/workflow/AIWorkflowAssistant"
import {
  WorkflowTemplateCard,
  WorkflowTemplateCardItem
} from "@/components/templates/WorkflowTemplateCard"
import { WorkflowCategorySection } from "@/components/templates/WorkflowCategorySection"
import {
  CATEGORY_TABS,
  STARTER_TEMPLATES_BY_CATEGORY
} from "@/lib/starter-templates-data"

const QUICK_SUGGESTIONS = [
  {
    label: "Google Forms → Slack & Sheets",
    prompt: "When a new lead fills Google Forms, send a Slack message to #leads and add a row in Google Sheets"
  },
  {
    label: "WhatsApp Lead → HubSpot CRM",
    prompt: "When a new WhatsApp message arrives in Automate Chats, create or update a contact in HubSpot CRM"
  },
  {
    label: "Shopify Order → Gmail & Slack",
    prompt: "When an order is paid in Shopify, send an email receipt via Gmail and alert the sales team on Slack"
  },
  {
    label: "Stripe Payout → Google Sheets",
    prompt: "When a customer pays in Stripe, record transaction in Google Sheets and notify team in Slack"
  }
]

export default function OnboardingPage() {
  const router = useRouter()

  // AI Interface States (Matching Canvas AI Interface)
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)

  // Dynamic Animated Workflow Idea Typing Effect
  const [ideaIndex, setIdeaIndex] = useState(0)
  const [currentIdeaText, setCurrentIdeaText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Reusable Tabs State (Matching Design System Tabs)
  const [activeCategory, setActiveCategory] = useState("All")

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  // Rotating placeholder effect
  useEffect(() => {
    if (inputText) return

    const fullText =
      WORKFLOW_IDEAS[ideaIndex] ||
      "When a new lead fills Google Forms, send a Slack notification..."
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

  // Speech recognition initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
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

        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)

        recognitionRef.current = recognition
      }
    }
  }, [])

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
      setIsListening(true)
      const mockVoicePrompts = [
        "When a new response is submitted in Google Forms, send a Slack message to #leads and add a row in Google Sheets",
        "When a new customer signs up, send a welcome WhatsApp message and create a deal in HubSpot CRM",
        "New Shopify order created, then notify sales on Slack and log in Google Sheets"
      ]
      const chosen =
        mockVoicePrompts[Math.floor(Math.random() * mockVoicePrompts.length)]
      setTimeout(() => {
        setInputText(chosen)
        setIsListening(false)
      }, 1200)
    }
  }

  const handlePromptSubmit = (promptToUse?: string) => {
    const text = (promptToUse || inputText).trim()
    if (!text || isBuilding) return

    setIsBuilding(true)

    // Generate workflow plan using AI workflow generator
    const plan: GeneratedWorkflowPlan = generateWorkflowFromPrompt(
      text,
      MVP_APPS
    )

    // Store in session storage so Visual Canvas Editor picks it up immediately
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "pending_ai_workflow",
        JSON.stringify({
          workflowName: plan.workflowName,
          steps: plan.steps,
          plan: plan,
          chatMessages: [
            {
              id: `msg_${Date.now()}_user`,
              sender: "user",
              text: text,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            },
            {
              id: `msg_${Date.now()}_ai`,
              sender: "ai",
              text: plan.summary,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              }),
              plan
            }
          ]
        })
      )
    }

    // Direct user to canvas editor loaded with AI plan
    setTimeout(() => {
      router.push(
        `/workflows/editor?source=chat&name=${encodeURIComponent(
          plan.workflowName
        )}`
      )
    }, 400)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handleSelectTemplate = (template: WorkflowTemplateCardItem) => {
    if (template.templateId === "scratch") {
      router.push("/workflows/editor?new=true")
    } else {
      router.push(`/workflows/editor?template=${template.templateId || template.id}`)
    }
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-10 flex flex-col items-center justify-start transition-colors relative">
      <div className="max-w-7xl w-full space-y-10 relative">

        {/* Top Right Skip Onboarding Button (Design System Pill Button) */}
        <div className="flex justify-end sm:absolute sm:top-1 sm:right-0 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/chat")}
            className="text-xs font-semibold border-slate-200/90 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full px-3.5 h-8 shadow-2xs transition-all flex items-center gap-1.5 group cursor-pointer"
          >
            <span>Skip Onboarding</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Button>
        </div>

        {/* ============================================================== */}
        {/* HEADER & AI INTERFACE (Centered Spotlight)                     */}
        {/* ============================================================== */}
        <div className="max-w-3xl mx-auto w-full space-y-7">
          {/* Header Title & Intro using Design System Badge */}
          <div className="text-center space-y-3">
            <Badge variant="blue" className="px-3 py-1 text-xs">
              Welcome to Automate Workflows
            </Badge>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              What do you want to automate first?
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-xs font-medium">
              Describe what you want to automate in plain English, or pick a starter template below.
            </p>
          </div>

          {/* AI INTERFACE (Identical to Canvas AI Interface with Peeking App Stickers & Ambient Glow) */}
          <div className="relative pt-8 pb-2">
            {/* Peeking App Stickers (Slack, Shopify, HubSpot, Gmail) using AppIcon */}
            <div className="absolute -top-1 left-8 z-10 flex items-center -space-x-2 select-none pointer-events-auto">
              {PEEKING_APPS.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    setInputText(app.prompt)
                    textareaRef.current?.focus()
                  }}
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

            {/* Glowing Ambient Gradient Border Effect */}
            <div className="relative group z-20">
              {/* Ambient Diffused Outer Glow */}
              <div className="absolute -inset-[3px] rounded-[22px] ai-ambient-gradient opacity-25 dark:opacity-30 blur-md pointer-events-none transition-opacity duration-500 group-hover:opacity-45 group-focus-within:opacity-60" />

              {/* Animated Colorful Border Ring Along the Sides */}
              <div className="absolute -inset-[1.5px] rounded-[18px] ai-ambient-gradient opacity-40 dark:opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-65 group-focus-within:opacity-85" />

              {/* Main Card Surface using Design System Card */}
              <Card className="relative z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-2xl p-4 sm:p-5 transition-all">
                {/* Multiline Prompt Area with Dynamic Workflow Idea */}
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    currentIdeaText
                      ? `e.g. ${currentIdeaText}`
                      : "e.g. When a new lead fills Google Forms, send a Slack message..."
                  }
                  className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400/90 dark:placeholder:text-slate-500 text-sm sm:text-base resize-none min-h-[58px] leading-relaxed transition-all"
                  style={{ outline: "none", boxShadow: "none" }}
                />

                {/* Bottom Toolbar Row */}
                <div className="flex items-center justify-between pt-3 mt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Left: Microphone Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoiceInput}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? "bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-sm"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title={isListening ? "Listening... click to stop" : "Voice input"}
                    aria-label="Voice Input"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Right: Start Building Button using Design System Button */}
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      disabled={!inputText.trim() || isBuilding}
                      onClick={() => handlePromptSubmit()}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                        inputText.trim() && !isBuilding
                          ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-md shadow-blue-500/20"
                          : ""
                      }`}
                    >
                      {isBuilding ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating workflow...</span>
                        </>
                      ) : (
                        <>
                          <span>Start building</span>
                          <ArrowUp className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Disclaimer Caption */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2.5 select-none">
              AI can make mistakes. Please double-check responses.
            </p>

            {/* Quick Suggestion Chips using Reusable Badges */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                Try:
              </span>
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(item.prompt)
                    textareaRef.current?.focus()
                  }}
                  className="inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* REUSABLE DESIGN SYSTEM TABS FOR CATEGORIES (Image 1 Style)     */}
        {/* ============================================================== */}
        <div className="space-y-6 pt-2">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full space-y-6"
          >
            {/* Category Filter Tabs Bar using Reusable TabsList and TabsTrigger (Mid-aligned) */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-center w-full">
              <div className="overflow-x-auto no-scrollbar scrollbar-none py-1 max-w-full flex justify-center">
                <TabsList className="h-auto p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-full border border-slate-200/80 dark:border-slate-700/80 inline-flex items-center space-x-1 mx-auto shrink-0">
                  {CATEGORY_TABS.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors"
                      indicatorClassName="rounded-full bg-white dark:bg-slate-900 shadow-xs"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {/* TAB CONTENT: "All" Category Overview (Image 1 Layout) */}
            <TabsContent
              value="All"
              className="mt-0 space-y-10 focus-visible:outline-none"
            >
              {/* 1. Featured Category Section */}
              {STARTER_TEMPLATES_BY_CATEGORY["Featured"] && (
                <WorkflowCategorySection
                  title="Featured"
                  templates={STARTER_TEMPLATES_BY_CATEGORY["Featured"]}
                  onSelectTemplate={handleSelectTemplate}
                  onViewAll={() => setActiveCategory("Featured")}
                />
              )}

              {/* 2. ✨ Everyday Category Section */}
              {STARTER_TEMPLATES_BY_CATEGORY["✨ Everyday"] && (
                <WorkflowCategorySection
                  title="✨ Everyday"
                  templates={STARTER_TEMPLATES_BY_CATEGORY["✨ Everyday"]}
                  onSelectTemplate={handleSelectTemplate}
                  onViewAll={() => setActiveCategory("✨ Everyday")}
                />
              )}

              {/* 3. Sales Category Section */}
              {STARTER_TEMPLATES_BY_CATEGORY["Sales"] && (
                <WorkflowCategorySection
                  title="Sales"
                  templates={STARTER_TEMPLATES_BY_CATEGORY["Sales"]}
                  onSelectTemplate={handleSelectTemplate}
                  onViewAll={() => setActiveCategory("Sales")}
                />
              )}

              {/* 4. Customer Service Category Section */}
              {STARTER_TEMPLATES_BY_CATEGORY["Customer Service"] && (
                <WorkflowCategorySection
                  title="Customer Service"
                  templates={STARTER_TEMPLATES_BY_CATEGORY["Customer Service"]}
                  onSelectTemplate={handleSelectTemplate}
                  onViewAll={() => setActiveCategory("Customer Service")}
                />
              )}
            </TabsContent>

            {/* TAB CONTENT: Specific Filtered Categories */}
            {CATEGORY_TABS.filter((cat) => cat !== "All").map((cat) => (
              <TabsContent
                key={cat}
                value={cat}
                className="mt-0 space-y-6 focus-visible:outline-none"
              >
                {STARTER_TEMPLATES_BY_CATEGORY[cat] ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {cat}
                      </h2>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {STARTER_TEMPLATES_BY_CATEGORY[cat].length} automations
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {STARTER_TEMPLATES_BY_CATEGORY[cat].map((tpl) => (
                        <WorkflowTemplateCard
                          key={tpl.id}
                          template={tpl}
                          onClick={handleSelectTemplate}
                          className="w-full"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Fallback using Reusable Card */
                  <Card className="p-12 text-center border-slate-200 dark:border-slate-800 space-y-3">
                    <Sparkles className="h-8 w-8 text-blue-500 mx-auto" />
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                      No starter templates in {cat}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      You can describe what you need in the AI builder above, or start with a blank workflow canvas!
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveCategory("All")}
                      className="mt-2"
                    >
                      View All Templates
                    </Button>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Bottom Blank Canvas CTA Card */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Want to build from scratch?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Open a blank workflow canvas with infinite nodes, custom triggers, and multi-step branching.
              </p>
            </div>

            <Button
              size="lg"
              className="space-x-2 shrink-0 cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => router.push("/workflows/editor?new=true")}
            >
              <PlusCircle className="h-5 w-5" />
              <span>Open Blank Workflow Canvas</span>
            </Button>
          </Card>
        </div>

      </div>
    </div>
  )
}
