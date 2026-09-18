"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Drawer } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { saveDeveloperApp } from "@/lib/developer-data"
import { DeveloperApp, AuthType } from "@/lib/developer-types"
import {
  Code2,
  Sparkles,
  ShieldCheck,
  Key,
  Lock,
  Globe,
  X,
  Upload
} from "lucide-react"

interface CreateAppDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppCreated?: (app: DeveloperApp) => void
}

const CATEGORIES = [
  "CRM",
  "Lead Capture",
  "Marketing",
  "Dev Tools",
  "Productivity",
  "E-Commerce",
  "Payment",
  "Support",
  "Analytics",
  "Other"
]

const AUTH_OPTIONS = [
  {
    value: "oauth2" as AuthType,
    label: "OAuth 2.0 (User Authorization)",
    description: "Standard redirect grant with Client ID, Secret, Scopes, and automatic token refresh.",
    icon: <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
  },
  {
    value: "parameters" as AuthType,
    label: "Parameters",
    description: "Define custom body, query, or path parameters and headers required for authentication.",
    icon: <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
  },
  {
    value: "bearer_token" as AuthType,
    label: "Bearer Token",
    description: "Personal access tokens or static JWTs automatically prefixed with 'Bearer '.",
    icon: <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
  },
  {
    value: "basic_auth" as AuthType,
    label: "Basic Authentication",
    description: "Standard Username and Password combination, automatically Base64-encoded.",
    icon: <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
  },
  {
    value: "none" as AuthType,
    label: "No Authentication",
    description: "For open, public APIs or rate-limit-only endpoints without user accounts.",
    icon: <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
  },
]

export function CreateAppDrawer({ open, onOpenChange, onAppCreated }: CreateAppDrawerProps) {
  const router = useRouter()

  // Form State (Clean 1-step form)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("CRM")
  const [customCategory, setCustomCategory] = useState("")
  const [authType, setAuthType] = useState<AuthType>("oauth2")

  // App Logo State
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      setLogoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLogoPreview(null)
    setLogoError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
  }

  const resetForm = () => {
    setName("")
    setSlug("")
    setCategory("CRM")
    setCustomCategory("")
    setAuthType("oauth2")
    setLogoPreview(null)
    setLogoError(null)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleFinish = () => {
    const id = `app_${slug || "custom"}_${Date.now().toString().slice(-4)}`
    const inviteToken = `inv_${slug || "app"}_${Math.random().toString(36).substring(2, 10)}`
    const resolvedCategory = category === "Other" ? (customCategory.trim() || "Other") : category

    const newApp: DeveloperApp = {
      id,
      name: name.trim() || "My Custom App",
      slug: slug.trim() || "custom-app",
      tagline: "Custom automation connector",
      description: "Visual connector for automating workflows.",
      category: resolvedCategory,
      logoIcon: logoPreview || "Zap",
      brandColor: "#2563EB",
      version: "1.0.0",
      status: "private",
      baseApiUrl: "https://api.example.com/v1",
      websiteUrl: "",
      documentationUrl: "",
      author: {
        name: "Himanshu Pundir",
        email: "developer@company.com",
        company: "Workspace Team",
        isVerified: true,
      },
      secrets: [
        {
          id: "sec_1",
          key: "API_SECRET",
          value: "sec_live_initial_token",
          description: "Default workspace environment secret"
        }
      ],
      authentication: {
        type: authType,
        apiKeyConfig: {
          headerOrQuery: "header",
          paramName: "X-API-Key",
          valuePrefix: "",
        },
        parametersConfig: {
          showParameters: true,
          parameters: [
            {
              id: "param_1",
              key: "api_key",
              label: "API Key",
              type: "string",
              required: true,
              placeholder: "Enter parameter",
            },
          ],
          showHeaders: false,
          headers: [],
        },
        oauth2Config: {
          clientId: "",
          clientSecret: "",
          authorizeUrl: "https://api.example.com/oauth/authorize",
          accessTokenUrl: "https://api.example.com/oauth/token",
          scopes: "read,write",
          pkceEnabled: false,
        },
        enableMultiAuth: true,
        userFields: [
          {
            id: "uf_1",
            key: "apiKey",
            label: "API Secret Key",
            type: "password",
            required: true,
            helpText: "Enter the secret API token from your account dashboard.",
            placeholder: "key_live_••••••••",
          }
        ],
        connectionTest: {
          method: "GET",
          url: "https://api.example.com/v1/me",
          expectedStatus: 200,
        },
        connectionLabelTemplate: "{{email}}",
      },
      triggers: [],
      actions: [],
      distribution: {
        inviteToken,
        inviteUrl: typeof window !== "undefined"
          ? `${window.location.origin}/developer/invite/${inviteToken}`
          : `http://localhost:3000/developer/invite/${inviteToken}`,
        maxTesters: 100,
        activeInstalls: 1,
        betaTesters: [],
      },
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    saveDeveloperApp(newApp)
    if (onAppCreated) {
      onAppCreated(newApp)
    }
    handleClose()
    resetForm()
    router.push(`/developer/apps/${id}`)
  }

  // Drawer Header
  const drawerHeader = (
    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 rounded-t-2xl shrink-0 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
          <Code2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Create Custom App
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your application identity, logo, and authentication scheme.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )

  // Drawer Footer
  const drawerFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClose}
        className="text-xs font-semibold"
      >
        Cancel
      </Button>

      <Button
        type="button"
        size="sm"
        disabled={!name.trim() || (category === "Other" && !customCategory.trim())}
        onClick={handleFinish}
        className="space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Create App & Open Builder</span>
      </Button>
    </div>
  )

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      header={drawerHeader}
      footer={drawerFooter}
      className="w-[600px] max-w-[94vw]"
    >
      <div className="space-y-5 text-slate-900 dark:text-slate-100 pr-1">
        {/* App Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              App Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Nova Desk"
              className="text-xs bg-slate-50 dark:bg-slate-800"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              App Slug (Identifier)
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="nova-desk"
              className="text-xs font-mono bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* App Logo */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            App Logo <span className="text-rose-500">*</span>
          </label>

          <div className="flex items-center gap-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
              id="custom-app-logo-input"
            />

            {/* Dashed logo container matching our app's blue theme */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-blue-400 dark:border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/30 hover:border-blue-600 dark:hover:border-blue-400 transition-all flex items-center justify-center cursor-pointer group shadow-2xs overflow-hidden shrink-0"
              title="Click to upload SVG or PNG logo (max 25KB)"
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="App Logo Preview"
                  className="w-14 h-14 object-contain rounded-xl transition-transform group-hover:scale-105"
                />
              ) : (
                /* Default fallback logo using app's brand blue theme */
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs transition-transform group-hover:scale-105">
                  {name ? name.trim().charAt(0).toUpperCase() : "A"}
                </div>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold rounded-2xl">
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span>{logoPreview ? "Change" : "Upload"}</span>
              </div>

              {/* Remove custom logo button */}
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs transition-colors cursor-pointer shadow-xs"
                  title="Remove uploaded logo"
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
                  <span>{logoPreview ? "Replace Logo" : "Upload Logo"}</span>
                </Button>
                {logoPreview && (
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
                {logoPreview ? "Custom logo applied" : "Default logo active"}
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

        {/* Primary Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Primary Category <span className="text-rose-500">*</span>
          </label>
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val)
              if (val !== "Other") {
                setCustomCategory("")
              }
            }}
            options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
            placeholder="Select a primary category..."
            className="bg-slate-50 dark:bg-slate-800"
          />

          {category === "Other" && (
            <div className="pt-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Specify Category Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. AI & Automation, Human Resources, Finance..."
                className="text-xs bg-slate-50 dark:bg-slate-800"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Auth Type * (Positioned directly under App Logo / Category) */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Auth Type <span className="text-rose-500">*</span>
          </label>
          <Select
            value={authType === "api_key" ? "parameters" : authType}
            onChange={(e) => setAuthType(e.target.value as AuthType)}
            options={AUTH_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
              icon: opt.icon,
            }))}
            className="h-10 text-xs font-semibold"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
            {AUTH_OPTIONS.find((opt) => opt.value === (authType === "api_key" ? "parameters" : authType))?.description}
          </p>
        </div>
      </div>
    </Drawer>
  )
}
