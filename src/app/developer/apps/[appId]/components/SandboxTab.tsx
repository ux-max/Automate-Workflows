"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  DeveloperApp,
  DeveloperAction,
  DeveloperTrigger,
} from "@/lib/developer-types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Workflow,
  Share2,
  Table,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Eye,
  HelpCircle,
  Code,
  Info,
} from "lucide-react"

interface SandboxTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

export function SandboxTab({ app, onChange }: SandboxTabProps) {
  const [activeStep, setActiveStep] = useState<string | null>("debugger")
  const [selectedActionId, setSelectedActionId] = useState<string>(
    app.actions[0]?.id || ""
  )
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: number
    statusText: string
    latency: number
    responseFields: { key: string; type: string; value: string }[]
  } | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showSandboxHelpModal, setShowSandboxHelpModal] = useState(false)
  const [previewRawTestModal, setPreviewRawTestModal] = useState(false)

  const toggleStep = (stepId: string) => {
    setActiveStep((prev) => (prev === stepId ? null : stepId))
  }

  const selectedAction = app.actions.find((a) => a.id === selectedActionId) || app.actions[0]

  const handleInputChange = (fieldKey: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: val }))
  }

  const runTestRequest = () => {
    if (!selectedAction) return
    setIsRunningTest(true)
    setTestResult(null)

    setTimeout(() => {
      setIsRunningTest(false)
      // Generate clean visual response fields from the action's sampleResponseFields or inputs
      const sampleFields = selectedAction.sampleResponseFields.length > 0
        ? selectedAction.sampleResponseFields.map((s) => ({
            key: s.key,
            type: s.type,
            value: s.sampleValue || "Sample output",
          }))
        : [
            { key: "id", type: "number", value: "98201" },
            { key: "status", type: "string", value: "success" },
            { key: "created_at", type: "date", value: new Date().toISOString() },
          ]

      setTestResult({
        status: 200,
        statusText: "OK",
        latency: 138,
        responseFields: sampleFields,
      })
    }, 1200)
  }

  const copyToken = (key: string) => {
    navigator.clipboard.writeText(`{{step.${selectedAction?.key || "action"}.${key}}}`)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-8 w-full">
      {/* Triple-Layer Testing Intro Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" className="text-[10px] font-medium uppercase">
              Triple-Layer Sandbox
            </Badge>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Test Safely Before Going Live
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Verify every endpoint in 3 isolated environments without affecting live automations or publishing to the public directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/workflows/editor?app=${app.id}`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs font-medium"
            >
              <Workflow className="w-3.5 h-3.5" />
              Test on Canvas
            </Button>
          </Link>
        </div>
      </div>

      {/* Layer 1: In-Portal Visual Form Debugger (Accordion Step 1 - Default Open) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-30">
        <div
          onClick={() => toggleStep("debugger")}
          className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold text-xs shrink-0">
              L1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  In-Portal Visual Form Debugger
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSandboxHelpModal(true)
                  }}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Sandbox Debugger & Execution Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Select an action, fill test input values, and dispatch a real mock execution request.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Badge variant="outline" className="text-[10px] font-medium">Step 1</Badge>

            {app.actions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Testing Action:</span>
                <div className="w-48 sm:w-56">
                  <Select
                    value={selectedAction?.id || ""}
                    onChange={(e) => {
                      setSelectedActionId(e.target.value)
                      setTestResult(null)
                    }}
                    options={app.actions.map((act) => ({
                      value: act.id,
                      label: `${act.name} (${act.method})`,
                    }))}
                    className="h-8 text-xs font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleStep("debugger")
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  activeStep === "debugger" && "rotate-180 text-blue-600 dark:text-blue-400"
                )}
              />
            </button>
          </div>
        </div>

        {activeStep === "debugger" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="space-y-6 p-5 pt-4">
          {!selectedAction ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Configure at least one action in the Actions tab to test.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Form Fields matching action inputs */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Input Parameters Form
                  </h5>
                  <Badge variant="outline" className="text-[10px] font-mono font-medium">
                    {selectedAction.method} {selectedAction.endpointUrl}
                  </Badge>
                </div>

                {selectedAction.inputFields.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 font-medium">This action has no input fields configured.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAction.inputFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          {field.label}
                          {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                        </label>

                        {field.type === "dropdown" ? (
                          <Select
                            value={formValues[field.key] || ""}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            options={[
                              { value: "", label: "-- Choose an option --" },
                              { value: "val_1", label: "Primary Option (Sample)" },
                              { value: "val_2", label: "Secondary Option (Sample)" },
                            ]}
                            className="h-9 text-xs"
                          />
                        ) : (
                          <Input
                            type={field.type === "number" ? "number" : "text"}
                            value={formValues[field.key] || ""}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                            className="h-9 text-xs"
                          />
                        )}

                        {field.helpText && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{field.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={runTestRequest}
                    disabled={isRunningTest}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs h-9 font-medium"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunningTest ? "animate-spin" : ""}`} />
                    {isRunningTest ? "Executing Test Request..." : "Send Test Request"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Visual Response Table (Zero Raw JSON) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-emerald-600" />
                    Structured Response Data (Zero JSON)
                  </h5>
                  {testResult && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewRawTestModal(true)}
                        className="h-6 px-2 text-[11px] gap-1 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs font-medium"
                        title="Inspect Raw JSON Response"
                      >
                        <Eye className="w-3 h-3 text-blue-600" />
                        <span>Raw JSON</span>
                      </Button>
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-medium">
                        {testResult.status} {testResult.statusText}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">{testResult.latency}ms</span>
                    </div>
                  )}
                </div>

                {!testResult ? (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center">
                    <Play className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      No test executed yet
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                      Fill the form fields on the left and click "Send Test Request" to inspect the structured response table.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs">
                          <tr>
                            <th className="py-2.5 px-3 font-medium">Field</th>
                            <th className="py-2.5 px-3 font-medium">Type</th>
                            <th className="py-2.5 px-3 font-medium">Returned Value</th>
                            <th className="py-2.5 px-2 text-right w-12 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {testResult.responseFields.map((field) => (
                            <tr key={field.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="p-2.5 font-mono font-medium text-slate-800 dark:text-slate-200">
                                {field.key}
                              </td>
                              <td className="p-2.5">
                                <Badge variant="outline" className="text-[10px] font-mono uppercase">
                                  {field.type}
                                </Badge>
                              </td>
                              <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400">
                                {field.value}
                              </td>
                              <td className="p-2.5 text-right">
                                <Button
                                  type="button"
                                  onClick={() => copyToken(field.key)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-purple-600"
                                  title="Copy Variable Token"
                                >
                                  {copiedKey === field.key ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Status 200 OK — Ready to map as variable tokens in real workflow steps!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
            </CardContent>
          </div>
        )}
      </Card>

      {/* Layers 2 & 3: Multi-Environment Availability (Accordion Step 2) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-20">
        <div
          onClick={() => toggleStep("environments")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Multi-Environment Deployment & Sandbox Access
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Instant private canvas availability (L2) and cryptographic beta tester links (L3).
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] font-medium">Step 2</Badge>
            <Badge variant="secondary" className="text-[10px] font-mono font-medium">Layers 2 & 3</Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "environments" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "environments" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Layer 2 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold text-xs shrink-0">
                      L2
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        Instant Private Canvas Availability
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Your custom app is immediately visible in your personal workflow canvas with the{" "}
                        <Badge variant="outline" className="text-[10px] font-medium">
                          Private (Dev)
                        </Badge>{" "}
                        badge. You can connect it with Slack, Sheets, or Webhooks right now.
                      </p>
                      <div className="pt-2">
                        <Link href={`/workflows/editor?app=${app.id}`}>
                          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-blue-200 text-blue-700 dark:text-blue-300 font-medium">
                            Open Canvas With App
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layer 3 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-semibold text-xs shrink-0">
                      L3
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        Cryptographic Private Invite Links
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Share a private invite URL with up to {app.distribution.maxTesters} team members or clients. They can install the app into their workspace before public launch.
                      </p>
                      <div className="pt-2">
                        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          {app.distribution.activeInstalls} active beta testers installed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Raw Test JSON Response Modal */}
      <Dialog
        open={previewRawTestModal}
        onOpenChange={setPreviewRawTestModal}
        className="max-w-2xl"
      >
        {testResult && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>Raw HTTP Test Execution Payload</span>
              </DialogTitle>
              <DialogDescription>
                Live response snapshot for <code className="font-mono font-medium text-slate-900 dark:text-slate-100">{selectedAction?.name || "Action"}</code> ({testResult.status} {testResult.statusText} • {testResult.latency}ms).
              </DialogDescription>
            </DialogHeader>

            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(testResult, null, 2))
                }}
                className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy JSON
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setPreviewRawTestModal(false)}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>

      {/* Sandbox Testing Environment Helping Modal */}
      <Dialog open={showSandboxHelpModal} onOpenChange={setShowSandboxHelpModal}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            How to Use: Triple-Layer Sandbox & Live Testing
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to testing endpoints safely in isolated environments without affecting live data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
            <strong>What this does:</strong> Tests and validates your triggers, actions, and authentication against real API responses before going live.
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
              How Developer Uses It:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Layer 1 (Live Inspector):</strong> Fill in sample parameters and click "Execute Test". Inspect raw JSON payloads, status codes, and network latency.
              </li>
              <li>
                <strong>Layer 2 (Canvas Preview):</strong> Open the Workflow Editor to test your private connector inside real multi-step workflow pipelines.
              </li>
              <li>
                <strong>Layer 3 (Beta Testers):</strong> Share private invite links with team members to test on their own accounts.
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Thorough sandbox testing ensures that when regular users add your actions to their workflows, every parameter and dropdown runs smoothly without unexpected errors.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowSandboxHelpModal(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
