"use client"

import * as React from "react"
import { Search, X, Hash, Type, Calendar, Database, Check, ChevronRight, Variable } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AppIcon } from "@/components/ui/app-icon"
import { WorkflowStep } from "@/lib/data"
import { APP_SCHEMAS_MAP } from "@/lib/action-schemas"

interface VariableItem {
  key: string
  label: string
  sampleValue: string
  type: "string" | "number" | "date" | "boolean" | "object"
  token: string
}

interface StepVariables {
  stepId: string
  stepNumber: number
  stepName: string
  appId: string
  appName: string
  variables: VariableItem[]
}

interface VariablePickerProps {
  steps: WorkflowStep[]
  currentStepId: string
  isOpen: boolean
  onClose: () => void
  onSelectVariable: (token: string) => void
  position?: { top: number; left: number }
  title?: string
  subtitle?: string
}

export const DEFAULT_SAMPLE_DATA: Record<string, Record<string, any>> = {
  "webhook": {
    event_id: "evt_live_89124",
    created_at: "2026-09-04T10:30:00Z",
    customer_name: "Alex Johnson",
    customer_email: "alex.johnson@example.com",
    customer_phone: "+1 555-0199",
    order_id: "ord_99824",
    order_amount: 149.50,
    currency: "USD",
    payment_status: "PAID",
    source_channel: "Organic Checkout",
    line_items_count: 2
  },
  "webhook-catch": {
    event_id: "evt_live_89124",
    created_at: "2026-09-04T10:30:00Z",
    customer_name: "Alex Johnson",
    customer_email: "alex.johnson@example.com",
    customer_phone: "+1 555-0199",
    order_id: "ord_99824",
    order_amount: 149.50,
    currency: "USD",
    payment_status: "PAID",
    source_channel: "Organic Checkout",
    line_items_count: 2
  },
  "api": {
    status_code: 200,
    status_text: "OK",
    latency_ms: 148,
    data_success: true,
    data_id: "resp_99812",
    data_message: "Order successfully synced"
  },
  "api-webhook": {
    status_code: 200,
    status_text: "OK",
    latency_ms: 148,
    data_success: true,
    data_id: "resp_99812",
    data_message: "Order successfully synced"
  },
  "calendly": {
    event_id: "evt_cal_98234",
    status: "active",
    start_time: "2026-09-10T14:30:00Z",
    end_time: "2026-09-10T15:00:00Z",
    meet_url: "https://meet.google.com/abc-defg-hij",
    invitee_name: "Alex Johnson",
    invitee_email: "alex.johnson@example.com",
    timezone: "America/New_York"
  },
  "typeform": {
    response_id: "tf_resp_48129",
    submitted_at: "2026-09-04T11:15:00Z",
    full_name: "Sarah Miller",
    email: "sarah.m@company.com",
    company_size: "50-100",
    budget_range: "$5,000 - $10,000",
    service_interest: "Custom Workflows"
  },
  "google-forms": {
    form_id: "1FAIpQLSc9B1xY-G8L1vBwExampleFormId",
    form_title: "Customer Intake & Project Inquiry",
    response_id: "resp_gform_892140",
    respondent_email: "sarah.connor@example.com",
    full_name: "Sarah Connor",
    phone_number: "+1 555-0192",
    company_name: "Cyberdyne Systems",
    service_requested: "Enterprise Workflow Automation",
    budget_range: "$10,000 - $25,000",
    project_details: "Looking to automate CRM lead capture directly from Google Forms into Slack and HubSpot.",
    timestamp: "2026-09-10 12:30:00",
    submission_date: "2026-09-10"
  },
  "shopify": {
    order_id: "5129481920",
    order_number: "#1042",
    total_price: 289.00,
    customer_first_name: "Michael",
    customer_last_name: "Chen",
    customer_email: "m.chen@outlook.com",
    shipping_city: "San Francisco",
    fulfillment_status: "unfulfilled"
  },
  "hubspot": {
    contact_id: "vid_9281204",
    first_name: "Jessica",
    last_name: "Taylor",
    email: "jessica@growthscale.com",
    lifecycle_stage: "marketingqualifiedlead",
    lead_score: 85
  }
}

export function VariablePicker({
  steps,
  currentStepId,
  isOpen,
  onClose,
  onSelectVariable,
  title,
  subtitle,
}: VariablePickerProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStepFilter, setSelectedStepFilter] = React.useState<string | null>(null)
  const [recentlySelected, setRecentlySelected] = React.useState<string | null>(null)

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Find steps that occur BEFORE the current step
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId)
  const priorSteps = currentStepIndex > 0 ? steps.slice(0, currentStepIndex) : steps.slice(0, 1)

  // Build list of variables for each prior step
  const stepsWithVariables: StepVariables[] = React.useMemo(() => {
    return priorSteps.map((step, idx) => {
      const stepNumber = idx + 1
      const sampleData = step.testOutput || DEFAULT_SAMPLE_DATA[step.appId] || APP_SCHEMAS_MAP[step.appId]?.sampleOutput || {
        id: `sample_${step.id}`,
        name: "Test Customer",
        email: "sample@domain.com",
        status: "SUCCESS",
        timestamp: new Date().toISOString()
      }

      const variables: VariableItem[] = Object.entries(sampleData).map(([k, v]) => {
        let type: VariableItem["type"] = "string"
        if (typeof v === "number") type = "number"
        else if (typeof v === "boolean") type = "boolean"
        else if (typeof v === "object" && v !== null) type = "object"
        else if (String(v).includes("T") && !isNaN(Date.parse(String(v)))) type = "date"

        const label = k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        const sampleValue = typeof v === "object" ? JSON.stringify(v) : String(v)
        const token = `{{step_${stepNumber}.${k}}}`

        return {
          key: k,
          label,
          sampleValue,
          type,
          token
        }
      })

      return {
        stepId: step.id,
        stepNumber,
        stepName: step.eventName || step.appName,
        appId: step.appId,
        appName: step.appName,
        variables
      }
    })
  }, [priorSteps])

  if (!isOpen) return null

  // Filter variables by search query
  const filteredSteps = stepsWithVariables
    .map((step) => {
      if (selectedStepFilter && step.stepId !== selectedStepFilter) {
        return null
      }
      const matchingVars = step.variables.filter(
        (v) =>
          v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.sampleValue.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return {
        ...step,
        variables: matchingVars
      }
    })
    .filter((s): s is StepVariables => s !== null && s.variables.length > 0)

  const handleSelect = (token: string) => {
    setRecentlySelected(token)
    onSelectVariable(token)
    setTimeout(() => {
      onClose()
    }, 150)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/70">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-sm border border-blue-200/90 dark:border-blue-800/80 shadow-2xs">
              /
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>{title || "Insert Variable from Previous Step"}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle || (
                  <>
                    Click any dynamic token to insert at cursor position or press{" "}
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-[10px] font-mono font-bold shadow-2xs">
                      /
                    </kbd>
                  </>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg"
            title="Close modal (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar & Step Filter Navigation */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              autoFocus
              placeholder="Search data fields, variables, sample outputs (e.g. email, amount)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all font-medium rounded-xl"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1 h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Step Filter Navigation (No scrollbar track) */}
          {stepsWithVariables.length > 1 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
              <Button
                type="button"
                variant={selectedStepFilter === null ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedStepFilter(null)}
                className={`h-7 px-3 text-[11px] font-semibold rounded-lg shrink-0 transition-all ${
                  selectedStepFilter === null ? "shadow-xs" : ""
                }`}
              >
                All Steps
              </Button>
              {stepsWithVariables.map((step) => {
                const isCurrent = selectedStepFilter === step.stepId
                return (
                  <Button
                    key={step.stepId}
                    type="button"
                    variant={isCurrent ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedStepFilter(step.stepId)}
                    className={`h-7 px-2.5 text-[11px] font-semibold rounded-lg shrink-0 transition-all flex items-center space-x-1.5 ${
                      isCurrent ? "shadow-xs" : ""
                    }`}
                  >
                    <AppIcon appId={step.appId} appName={step.appName} size={14} />
                    <span>Step {step.stepNumber}: {step.appName}</span>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Variable List Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredSteps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Database className="h-8 w-8 mx-auto mb-2.5 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">No matching variable fields found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Try searching for something else or clear filters to view all available variables
              </p>
              {(searchQuery || selectedStepFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedStepFilter(null)
                  }}
                  className="mt-3.5 h-7 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            filteredSteps.map((step) => (
              <div key={step.stepId} className="pt-3.5 first:pt-0 space-y-2.5">
                {/* Step Header */}
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center space-x-2">
                    <AppIcon appId={step.appId} appName={step.appName} size={18} />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Step {step.stepNumber}: {step.appName}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      ({step.stepName})
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    {step.variables.length} fields
                  </Badge>
                </div>

                {/* Variable Cards List */}
                <div className="space-y-1.5">
                  {step.variables.map((item) => {
                    const isSelected = recentlySelected === item.token

                    return (
                      <div
                        key={item.key}
                        onClick={() => handleSelect(item.token)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-200 dark:ring-emerald-800/60 shadow-xs"
                            : "bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors border border-slate-200/50 dark:border-slate-700">
                            {item.type === "number" ? (
                              <Hash className="h-3.5 w-3.5" />
                            ) : item.type === "date" ? (
                              <Calendar className="h-3.5 w-3.5" />
                            ) : (
                              <Type className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {item.label}
                              </span>
                              <span className="inline-flex items-center text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/90 dark:border-blue-800/70 shadow-2xs group-hover:bg-blue-100/90 dark:group-hover:bg-blue-900/60 transition-colors">
                                {item.token}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate font-mono">
                              Sample: <span className="text-slate-600 dark:text-slate-300 font-sans font-medium">{item.sampleValue}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center pl-2">
                          {isSelected ? (
                            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-md">
                              <Check className="h-3.5 w-3.5" />
                              <span>Inserted</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white px-2 py-1 rounded-md transition-all opacity-0 group-hover:opacity-100 flex items-center space-x-1 shadow-2xs">
                              <span>Insert</span>
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5 truncate pr-2">
            <span className="text-amber-500 font-medium">💡 Tip:</span>
            <span className="truncate">
              You can mix static text with dynamic tokens, e.g.
            </span>
            <code className="text-[10px] font-mono bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 border border-blue-200 dark:border-blue-800/60 rounded shadow-2xs shrink-0">
              Hello {"{{step_1.name}}"}
            </code>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 shrink-0"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
