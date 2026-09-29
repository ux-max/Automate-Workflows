"use client"

import React, { useState } from "react"
import {
  Bot,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Database,
  Cpu,
  HelpCircle,
  Lightbulb,
  Zap,
  Layers,
  MessageSquare
} from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AIAgentInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIAgentInfoModal({ open, onOpenChange }: AIAgentInfoModalProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "examples" | "how_to_setup">("overview")

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center space-x-2.5">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            What is the AI Agent Node?
          </span>
          <Badge className="bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-semibold">
            Quick Guide
          </Badge>
        </div>
      }
      description="A simple, beginner-friendly guide to understanding how this node works and how it helps you automate smarter."
      icon={<Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      standardWidthClassName="max-w-2xl"
      expandedWidthClassName="max-w-4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Tip: Press <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">/</kbd> anytime to insert data from previous steps</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-none space-x-1"
            >
              <span>Got It, Let&apos;s Build</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
        {/* Hero Explanation Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 flex items-start space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
              Think of it as hiring a smart digital assistant for your workflow
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Standard automation steps can only follow one rigid instruction (e.g. <em>&ldquo;always send template #1&rdquo;</em>).
              An <strong>AI Agent node</strong> can <strong>read messy input, think about the right solution, choose between multiple tools</strong>, and take the best actions autonomously.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveSection("overview")}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeSection === "overview"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Regular Step vs AI Agent</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("examples")}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeSection === "examples"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Real-World Examples</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("how_to_setup")}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeSection === "how_to_setup"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>The 4 Easy Settings</span>
          </button>
        </div>

        {/* SECTION 1: REGULAR STEP VS AI AGENT */}
        {activeSection === "overview" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Traditional Automation Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Normal Workflow Action
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Performs <strong>only 1 fixed action</strong> every single time. It cannot think, analyze context, or adapt if something unexpected happens.
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Example:</span>
                  &ldquo;Whenever an email arrives, send a generic template reply. No checking of customer history or order status.&rdquo;
                </div>
              </div>

              {/* AI Agent Card */}
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    Autonomous AI Agent Node
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Has <strong>judgment and reasoning</strong>. It understands what the user actually wants, decides which tools to call, and handles multi-step goals on its own.
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-blue-700 dark:text-blue-400 block mb-0.5">Example:</span>
                  &ldquo;Reads the customer inquiry, searches their Shopify order, checks FedEx shipping status, and writes back a polite, personalized answer.&rdquo;
                </div>
              </div>
            </div>

            {/* Why use it banner */}
            <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start space-x-2.5 text-xs text-amber-900 dark:text-amber-300">
              <HelpCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">When should you use this node?</span>
                Use it whenever a task requires judgment, reading free-form text, answering user questions, or deciding which app to call based on the situation.
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: REAL-WORLD EXAMPLES */}
        {activeSection === "examples" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            {/* Example 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🛍️</span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  1. Customer Support &amp; Order Lookup
                </h5>
                <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200">
                  E-Commerce
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                A customer emails: <em>&ldquo;Where is my order #5821? I haven&rsquo;t received tracking yet.&rdquo;</em><br />
                The AI Agent checks Shopify for order #5821, grabs the latest tracking link, verifies whether the package has shipped, and writes a helpful reply.
              </p>
            </div>

            {/* Example 2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🎯</span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. Inbound Lead Qualification &amp; Routing
                </h5>
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200">
                  Sales &amp; CRM
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                A lead submits a contact form. The agent reads their company size and requirements, decides if it is an enterprise lead, notifies your sales team in Slack with a summary, and creates a deal in HubSpot.
              </p>
            </div>

            {/* Example 3 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🧹</span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  3. Smart Data Cleaning &amp; Harmonization
                </h5>
                <Badge variant="outline" className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 border-purple-200">
                  Operations
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Takes messy input text from webhooks, standardizes phone numbers, corrects misspellings in city names, categorizes sentiment, and adds clean rows to Google Sheets without you writing custom code.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 3: THE 4 EASY SETTINGS */}
        {activeSection === "how_to_setup" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            {/* Setting 1: Brain & Goal */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    1. Brain &amp; Goal Tab
                  </h5>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">What to do</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Give your agent a title (e.g. <em>Customer Support Assistant</em>), choose an AI Model, provide instructions on how it should behave, and type its main goal.
                </p>
              </div>
            </div>

            {/* Setting 2: Tools */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    2. Tools Tab
                  </h5>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Allowed apps &amp; approval</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Equip apps (Slack, Shopify, Gmail, Google Sheets), write tool usage guidance, and configure the embedded <strong>Human Approval Node</strong> with live email preview and test sending on sensitive tools.
                </p>
              </div>
            </div>

            {/* Setting 3: Memory */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3">
              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-900">
                <Database className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    3. Memory Tab
                  </h5>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Conversation context</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Use a Session ID (like customer email or phone number) so the agent remembers past questions from the same person instead of starting fresh every time.
                </p>
              </div>
            </div>

            {/* Setting 4: Guardrails */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    4. Safety &amp; Limits Tab
                  </h5>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Safety &amp; limits</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Limit max steps per run to prevent infinite loops and save costs, set a polite fallback message if the agent gets stuck, and run live simulations to test your setup.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
