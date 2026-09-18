"use client"

import React, { useState } from "react"
import {
  DeveloperApp,
  SecretVariable,
} from "@/lib/developer-types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Info,
  ChevronDown,
  Upload,
  X,
  HelpCircle,
  Code,
  Copy,
  Save,
  Check,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OverviewTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
  onSave?: () => void
}

const CATEGORIES = [
  "CRM",
  "Lead Capture",
  "Marketing",
  "Dev Tools",
  "E-Commerce",
  "Payment",
  "Productivity",
  "Support",
  "Communication",
  "Databases",
  "AI / Machine Learning",
]

export function OverviewTab({ app, onChange, onSave }: OverviewTabProps) {
  const [showSecretId, setShowSecretId] = useState<string | null>(null)
  const [previewManifestModal, setPreviewManifestModal] = useState(false)
  const [showIdentityHelpModal, setShowIdentityHelpModal] = useState(false)
  const [showSecretsHelpModal, setShowSecretsHelpModal] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    if (onSave) {
      onSave()
    } else {
      onChange(app)
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  // Accordion state: Step 1 (App Identity & Details) is open by default.
  // Clicking another step collapses Step 1 and opens the selected step.
  const [activeStep, setActiveStep] = useState<string | null>("identity")

  const toggleStep = (stepId: string) => {
    setActiveStep((prev) => (prev === stepId ? null : stepId))
  }

  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError(null)

    if (file.size > 25 * 1024) {
      setLogoError("File size is larger than 25KB (recommended max for SVGs/logos).")
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      updateField("logoIcon", result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLogoError(null)
    updateField("logoIcon", "Zap")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const updateField = <K extends keyof DeveloperApp>(key: K, value: DeveloperApp[K]) => {
    onChange({
      ...app,
      [key]: value,
    })
  }

  // Secrets Table Handlers
  const addSecret = () => {
    const newSecret: SecretVariable = {
      id: `sec_${Date.now()}`,
      key: "NEW_SECRET_KEY",
      value: "",
      description: "Custom secret variable",
    }
    onChange({
      ...app,
      secrets: [...app.secrets, newSecret],
    })
  }

  const updateSecret = (id: string, field: keyof SecretVariable, value: string) => {
    const updated = app.secrets.map((s) => {
      if (s.id === id) {
        return { ...s, [field]: value }
      }
      return s
    })
    onChange({ ...app, secrets: updated })
  }

  const deleteSecret = (id: string) => {
    onChange({
      ...app,
      secrets: app.secrets.filter((s) => s.id !== id),
    })
  }

  return (
    <div className="space-y-8 w-full">
      {/* Section 1: App Identity & Branding (Accordion Step 1 - Default Open) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-30">
        <div
          onClick={() => toggleStep("identity")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                App Identity & Details
              </CardTitle>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowIdentityHelpModal(true)
                }}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="App Identity & Taxonomy Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Configure public display metadata, slug identifier, and catalog classifications.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewManifestModal(true)
              }}
              className="h-7 px-2.5 text-xs gap-1 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
              title="Preview App Manifest JSON"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Manifest JSON</span>
            </Button>
            <Badge variant="outline" className="text-[10px]">Step 1</Badge>
            <Badge variant="outline" className="text-xs font-mono">
              v{app.version}
            </Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "identity" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "identity" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="space-y-6 p-5 pt-4">
              {/* App Logo */}
              <div className="space-y-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  App Logo <span className="text-rose-500">*</span>
                </label>

                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="overview-app-logo-input"
                  />

                  {/* Dashed logo container matching our app's blue theme */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-blue-400 dark:border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/30 hover:border-blue-600 dark:hover:border-blue-400 transition-all flex items-center justify-center cursor-pointer group shadow-2xs overflow-hidden shrink-0"
                    title="Click to upload SVG or PNG logo (max 25KB)"
                  >
                    {app.logoIcon?.startsWith("data:") || app.logoIcon?.startsWith("http") ? (
                      <img
                        src={app.logoIcon}
                        alt={app.name}
                        className="w-14 h-14 object-contain rounded-xl transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs transition-transform group-hover:scale-105">
                        {app.name ? app.name.trim().charAt(0).toUpperCase() : "A"}
                      </div>
                    )}

                    {/* Hover overlay hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold rounded-2xl">
                      <Upload className="w-3.5 h-3.5 mb-0.5" />
                      <span>Change</span>
                    </div>

                    {/* Remove custom logo button */}
                    {(app.logoIcon?.startsWith("data:") || app.logoIcon?.startsWith("http")) && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs transition-colors cursor-pointer shadow-xs"
                        title="Reset to default logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Action buttons & status */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 text-xs font-semibold space-x-1.5 cursor-pointer border-slate-200 dark:border-slate-700"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Upload New Logo</span>
                      </Button>
                      {(app.logoIcon?.startsWith("data:") || app.logoIcon?.startsWith("http")) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="h-8 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          Reset Default
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {app.logoIcon?.startsWith("data:") || app.logoIcon?.startsWith("http")
                        ? "Custom logo applied"
                        : "Default logo active"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload your app logo (SVG, max 25KB). Default logo will be used if not provided.
                </p>

                {logoError && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {logoError}
                  </p>
                )}
              </div>

              {/* Row 1: App Name & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                App Display Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={app.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Acme CRM"
                className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                App Identifier Slug
              </label>
              <div className="relative">
                <Input
                  value={app.slug}
                  onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                  placeholder="e.g. acme-crm"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Tagline & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Short Tagline
              </label>
              <Input
                value={app.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="e.g. High-velocity B2B sales CRM, pipeline deals & customer sync"
                className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Category
              </label>
              <Select
                value={app.category}
                onChange={(e) => updateField("category", e.target.value)}
                options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                className="h-10 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Description & Use Cases <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={app.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              placeholder="Describe what users can accomplish with this connector in Automate Workflows..."
              className="w-full p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 20 characters required for public review. Current length: {app.description.length}
            </p>
          </div>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Section 2: Visual Environment Secrets Table (Accordion Step 2) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-10">
        <div
          onClick={() => toggleStep("secrets")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Environment Secrets & Common Data
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSecretsHelpModal(true)
                  }}
                  className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  title="Environment Secrets & Encryption Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Store OAuth Client IDs, secrets, and API keys securely. Reference them anywhere using{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                  {"{{common.KEY}}"}
                </code>
                .
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px]">Step 2</Badge>
            <Badge variant="secondary" className="text-[10px]">
              {app.secrets.length} {app.secrets.length === 1 ? "Secret" : "Secrets"}
            </Badge>
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              addSecret()
              setActiveStep("secrets")
            }}
            variant="outline"
            size="sm"
            className="gap-1.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs h-7 px-2.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Secret</span>
          </Button>
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", activeStep === "secrets" && "rotate-180 text-blue-600 dark:text-blue-400")} />
        </div>
      </div>

      {activeStep === "secrets" && (
        <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
          <CardContent className="p-5 pt-4">
          {app.secrets.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Key className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No environment secrets configured yet
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add sensitive keys like OAuth Client Secrets or Webhook Signing Keys here so they remain encrypted.
              </p>
              <Button
                type="button"
                onClick={addSecret}
                size="sm"
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Secret
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/90 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3">Secret Key Identifier</th>
                    <th className="p-3">Environment Value</th>
                    <th className="p-3">Description & Token Tag</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {app.secrets.map((secret) => {
                    const isRevealed = showSecretId === secret.id
                    return (
                      <tr key={secret.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3">
                          <Input
                            value={secret.key}
                            onChange={(e) =>
                              updateSecret(
                                secret.id,
                                "key",
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="SECRET_NAME"
                            className="font-mono text-xs uppercase h-8"
                          />
                        </td>

                        <td className="p-3">
                          <div className="relative">
                            <Input
                              type={isRevealed ? "text" : "password"}
                              value={secret.value}
                              onChange={(e) => updateSecret(secret.id, "value", e.target.value)}
                              placeholder="Secret value..."
                              className="font-mono text-xs pr-8 h-8"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecretId(isRevealed ? null : secret.id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Input
                              value={secret.description || ""}
                              onChange={(e) => updateSecret(secret.id, "description", e.target.value)}
                              placeholder="e.g. Production OAuth Secret"
                              className="text-sm font-medium text-slate-900 dark:text-slate-100 h-8"
                            />
                            <span className="hidden lg:inline-block font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded border border-blue-100 dark:border-blue-900 whitespace-nowrap">
                              {"{{common." + (secret.key || "KEY") + "}}"}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            onClick={() => deleteSecret(secret.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Zero-Code Variable Injection</strong>: Any secret stored here can be used in your
              Authentication, Headers, or Action Parameter Rows without writing code or exposing plaintext values.
            </p>
          </div>
        </CardContent>
      </div>
    )}
  </Card>

  {/* Bottom Save Action Bar */}
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shadow-2xs">
    <div className="text-xs text-slate-500 dark:text-slate-400">
      Save your changes to update app identity metadata, branding, and environment secrets.
    </div>
    <Button
      type="button"
      onClick={handleSave}
      className={cn(
        "h-9 px-5 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs transition-colors",
        isSaved
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      )}
    >
      {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
      <span>{isSaved ? "Saved Successfully!" : "Save Overview & Secrets"}</span>
    </Button>
  </div>

  {/* App Manifest JSON Preview Modal */}
  <Dialog
    open={previewManifestModal}
    onOpenChange={setPreviewManifestModal}
    className="max-w-2xl"
  >
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" />
          <span>App Manifest Definition ({app.name || "App"})</span>
        </DialogTitle>
        <DialogDescription>
          Live JSON manifest representing your complete custom application definition.
        </DialogDescription>
      </DialogHeader>

      <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{JSON.stringify(app, null, 2)}</pre>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(app, null, 2))
          }}
          className="h-8 text-xs gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy JSON
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => setPreviewManifestModal(false)}
          className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          Close
        </Button>
      </DialogFooter>
    </div>
  </Dialog>

  {/* App Identity Helping Modal */}
  <Dialog open={showIdentityHelpModal} onOpenChange={setShowIdentityHelpModal}>
    <DialogHeader>
      <DialogTitle className="text-base font-bold flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600" />
        How to Configure: App Identity & Branding
      </DialogTitle>
      <DialogDescription>
        Step-by-step guide to naming, branding, and categorizing your application.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
        <strong>What this does:</strong> Sets the public face of your integration in the App Catalog and the workflow builder connector search.
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
          How Developer Sets It Up:
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
          <li>
            <strong>App Name & Slug:</strong> Pick a recognizable name (e.g. <em>Acme CRM</em>) and URL-safe slug (e.g. <code>acme_crm</code>).
          </li>
          <li>
            <strong>App Logo:</strong> Upload a square SVG or PNG (max 25KB) with transparent background.
          </li>
          <li>
            <strong>Category:</strong> Assign your app to an ecosystem category (CRM, Payment, Marketing, Productivity) for catalog filtering.
          </li>
          <li>
            <strong>Description:</strong> Write a concise summary of what automation actions this connector enables.
          </li>
        </ol>
      </div>

      <div className="space-y-1.5">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
          How End-Users Experience It:
        </h4>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Users search for this name or logo in the Workflow Canvas trigger/action picker when building their automation pipelines.
        </p>
      </div>
    </div>
    <DialogFooter>
      <Button
        type="button"
        size="sm"
        onClick={() => setShowIdentityHelpModal(false)}
        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
      >
        Got it
      </Button>
    </DialogFooter>
  </Dialog>

  {/* Secrets & Environment Variables Helping Modal */}
  <Dialog open={showSecretsHelpModal} onOpenChange={setShowSecretsHelpModal}>
    <DialogHeader>
      <DialogTitle className="text-base font-bold flex items-center gap-2">
        <Key className="w-4 h-4 text-amber-500" />
        How to Use: Environment Secrets & Common Data
      </DialogTitle>
      <DialogDescription>
        Step-by-step guide to securely storing developer master keys, client secrets, and global endpoints.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-slate-700 dark:text-slate-300">
        <strong>What this does:</strong> Securely stores sensitive developer credentials (like OAuth Client Secrets) with AES-256 encryption so they are never exposed to clients.
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
          How Developer Sets It Up:
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
          <li>
            <strong>Add Secret:</strong> Click "+ Add Secret" and provide a unique key (e.g. <code>CLIENT_SECRET</code> or <code>SIGNING_KEY</code>).
          </li>
          <li>
            <strong>Paste Secret Value:</strong> Enter the token or key value. It is masked immediately for security.
          </li>
          <li>
            <strong>Interpolate Anywhere:</strong> Reference this secret in any endpoint URL, header, or body payload using <code>&#123;&#123;common.KEY_NAME&#125;&#125;</code>.
          </li>
        </ol>
      </div>

      <div className="space-y-1.5">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
          How End-Users Experience It:
        </h4>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          End users never see your environment secrets. During workflow dispatch, the server silently replaces <code>&#123;&#123;common.KEY&#125;&#125;</code> with the decrypted value.
        </p>
      </div>
    </div>
    <DialogFooter>
      <Button
        type="button"
        size="sm"
        onClick={() => setShowSecretsHelpModal(false)}
        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
      >
        Got it
      </Button>
    </DialogFooter>
  </Dialog>
</div>
  )
}
