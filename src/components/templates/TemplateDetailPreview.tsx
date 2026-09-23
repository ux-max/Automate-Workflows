"use client"

import React, { useState } from "react"
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Zap,
  Plus,
  Minus,
  Maximize2,
  Clock,
  DollarSign,
  Workflow,
  Copy,
  Check,
  BookOpen
} from "lucide-react"
import { Template, WorkflowStep } from "@/lib/data"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface TemplateDetailPreviewProps {
  template: Template
  onBack: () => void
  onUseTemplate: (templateId: string) => void
}

export function TemplateDetailPreview({
  template,
  onBack,
  onUseTemplate
}: TemplateDetailPreviewProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [setupGuideOpen, setSetupGuideOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/templates?template=${template.id}`
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 140))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70))
  const handleResetZoom = () => setZoomLevel(100)

  // Steps to render in visual flow
  const flowSteps: WorkflowStep[] = template.steps && template.steps.length > 0
    ? template.steps
    : [
        {
          id: "step_1",
          type: "trigger",
          appId: template.apps[0] || "webhook",
          appName: template.apps[0] || "Trigger",
          eventId: "trigger_ev",
          eventName: template.triggerSummary || "Trigger Event",
          fieldMappings: {}
        },
        ...template.apps.slice(1).map((app, idx) => ({
          id: `step_${idx + 2}`,
          type: "action" as const,
          appId: app,
          appName: app,
          eventId: "action_ev",
          eventName: idx === 0 && template.actionSummary ? template.actionSummary : `${app} Action`,
          fieldMappings: {}
        }))
      ]

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 select-none overflow-hidden rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs animate-in fade-in duration-200">
      {/* 1. TOP HEADER BAR - explicitly rounded top-left and top-right */}
      <header className="h-14 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 rounded-t-[22px] z-20">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>All Templates</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            title="Share template link"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. SPLIT LAYOUT BODY */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative rounded-b-[22px]">
        {/* LEFT COLUMN: ABOUT & DETAILS (approx 420px - 460px) */}
        <div className="w-full lg:w-[440px] xl:w-[480px] border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 p-6 md:p-8 overflow-y-auto space-y-6 shrink-0 bg-white dark:bg-slate-900 rounded-bl-[22px]">
          {/* Template Title */}
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              {template.title}
            </h1>

            {/* Savings & Category Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3.5">
              {template.savings?.time && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/50 shadow-2xs">
                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Save <strong className="font-bold">{template.savings.time}</strong></span>
                </div>
              )}
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                {template.category}
              </Badge>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={() => onUseTemplate(template.id)}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Use Template</span>
              <span className="text-base font-normal">→</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSetupGuideOpen(true)}
              className="h-11 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center space-x-1.5 shadow-2xs shrink-0"
            >
              <span>Setup guide</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Section: About this template */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              About this template
            </h3>
            <p className="text-xs md:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {template.about || template.description}
            </p>
          </div>

          {/* Section: What's included? */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              What&apos;s included?
            </h3>
            <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <Workflow className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {template.title}
                </span>
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                {template.apps.slice(0, 3).map((appId, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs"
                    title={appId}
                  >
                    <AppIcon appId={appId} appName={appId} size={14} />
                  </div>
                ))}
                {template.apps.length > 3 && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                    +{template.apps.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Apps & Integrations */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Apps & Integrations
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {template.apps.map((appId, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850/70 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center space-x-2.5 shadow-2xs"
                >
                  <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center shrink-0">
                    <AppIcon appId={appId} appName={appId} size={16} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                    {appId.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Author footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            By {template.author || "Automate Workflows Team • Updated Recently"}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW OF PRE-BUILT TEMPLATE FLOW */}
        <div className="flex-1 relative flex flex-col items-center justify-center overflow-auto p-8 bg-slate-50/70 dark:bg-slate-950/80 rounded-br-[22px]">
          {/* Canvas Dotted Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25"
            style={{
              backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Workflow Nodes Flow Container */}
          <div
            className="relative z-10 flex flex-col items-center py-10 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {flowSteps.map((step, idx) => {
              const isTrigger = step.type === "trigger" || idx === 0

              return (
                <React.Fragment key={step.id}>
                  {/* Step Node Card */}
                  <div className="relative group">
                    {/* Trigger Top Badge */}
                    {isTrigger && (
                      <div className="absolute -top-3 left-4 z-20">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/80 dark:border-purple-800/80 flex items-center gap-1 shadow-2xs">
                          <Zap className="h-2.5 w-2.5 fill-purple-600 text-purple-600 dark:fill-purple-400 dark:text-purple-400" />
                          <span>Trigger</span>
                        </span>
                      </div>
                    )}

                    {/* Node Card Body */}
                    <div
                      className={`w-[290px] md:w-[320px] p-4 rounded-2xl transition-all shadow-xs hover:shadow-md bg-white dark:bg-slate-900 border ${
                        isTrigger
                          ? "border-purple-300/80 dark:border-purple-800/70 hover:border-purple-400"
                          : "border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600"
                      } flex items-center space-x-3.5 text-left`}
                    >
                      {/* App Icon Circle/Square */}
                      <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center shrink-0 shadow-2xs">
                        <AppIcon appId={step.appId} appName={step.appName} size={22} />
                      </div>

                      {/* Step Labels */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {step.eventName || step.appName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate capitalize mt-0.5">
                          {step.appName || step.appId.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Arrow Down */}
                  {idx < flowSteps.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
                      <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 dark:slate-600 rotate-45 -mt-1.5" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Floating Canvas Zoom Controls */}
          <div className="absolute bottom-5 right-5 z-20 flex items-center space-x-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 px-2 select-none">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-[10px] font-semibold"
              title="Fit to view"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      <Dialog open={setupGuideOpen} onOpenChange={setSetupGuideOpen}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <DialogTitle>Setup Guide: {template.title}</DialogTitle>
          </div>
          <DialogDescription>
            Follow these simple steps to configure and launch this workflow template in your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-3">
          {(template.setupGuide && template.setupGuide.length > 0
            ? template.setupGuide
            : [
                "Authenticate the trigger app with your account credentials.",
                "Map required fields between step outputs and action inputs.",
                "Run a test execution to verify API payload delivery.",
                "Turn the workflow toggle to On to go live."
              ]
          ).map((instruction, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300"
            >
              <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                {idx + 1}
              </span>
              <p className="leading-relaxed font-medium mt-0.5">{instruction}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSetupGuideOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setSetupGuideOpen(false)
              onUseTemplate(template.id)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Use Template Now
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
