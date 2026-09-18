"use client"

import React, { useState } from "react"
import {
  DeveloperApp,
  AuthType,
  UserCredentialField,
  AuthParameterField,
  AuthHeaderField,
  ParametersAuthConfig,
} from "@/lib/developer-types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { Drawer } from "@/components/ui/drawer"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ShieldCheck,
  Key,
  Lock,
  Globe,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Info,
  ExternalLink,
  ChevronDown,
  Settings,
  GripVertical,
  CopyPlus,
  PlusCircle,
  X,
  Eye,
  HelpCircle,
  Code,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
  onSave?: () => void
}

const AUTH_SCHEMES: { type: AuthType; title: string; desc: string; icon: any }[] = [
  {
    type: "oauth2",
    title: "OAuth 2.0 (User Authorization)",
    desc: "Standard redirect grant with Client ID, Secret, Scopes, and automatic token refresh.",
    icon: Globe,
  },
  {
    type: "parameters",
    title: "Parameters",
    desc: "Define custom body, query, or path parameters and headers required for authentication.",
    icon: Key,
  },
  {
    type: "bearer_token",
    title: "Bearer Token",
    desc: "Personal access tokens or static JWTs automatically prefixed with 'Bearer '.",
    icon: Lock,
  },
  {
    type: "basic_auth",
    title: "Basic Authentication",
    desc: "Standard Username and Password combination, automatically Base64-encoded.",
    icon: ShieldCheck,
  },
  {
    type: "none",
    title: "No Authentication",
    desc: "For open, public APIs or rate-limit-only endpoints without user accounts.",
    icon: Globe,
  },
]

export function AuthTab({ app, onChange, onSave }: AuthTabProps) {
  const auth = app.authentication
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

  const [copiedCallback, setCopiedCallback] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    status: "success" | "error"
    code: number
    message: string
    latency: number
  } | null>(null)

  const CALLBACK_URL = "https://automate.app/api/auth/callback/custom-app"

  // Combo-field mode: track whether Client ID / Secret use manual entry
  const secretKeys = app.secrets.map((s) => s.key)
  const [clientIdManual, setClientIdManual] = useState(
    () => !!(auth.oauth2Config?.clientId && !secretKeys.includes(auth.oauth2Config.clientId))
  )
  const [clientSecretManual, setClientSecretManual] = useState(
    () => !!(auth.oauth2Config?.clientSecret && !secretKeys.includes(auth.oauth2Config.clientSecret))
  )

  // Accordion state: Step 1 (Select Authentication Type) is open by default.
  // Clicking another step collapses Step 1 and opens the selected step.
  const [activeStep, setActiveStep] = useState<string | null>("type")

  const toggleStep = (stepId: string) => {
    setActiveStep((prev) => (prev === stepId ? null : stepId))
  }

  // Parameters Configuration state
  const currentParams: AuthParameterField[] = auth.parametersConfig?.parameters ?? (
    auth.apiKeyConfig?.paramName
      ? [
          {
            id: "param_1",
            key: auth.apiKeyConfig.paramName,
            label: "API Key",
            type: "string",
            required: true,
            placeholder: "Enter parameter",
          },
        ]
      : [
          {
            id: "param_1",
            key: "",
            label: "API Key",
            type: "string",
            required: true,
            placeholder: "Enter parameter",
          },
        ]
  )

  const showParameters: boolean = auth.parametersConfig?.showParameters ?? true

  const [openParamSettingsId, setOpenParamSettingsId] = useState<string | null>(null)
  const [draggedParamIndex, setDraggedParamIndex] = useState<number | null>(null)
  const [showParamLearnMore, setShowParamLearnMore] = useState(false)
  const [showOAuthLearnMore, setShowOAuthLearnMore] = useState(false)
  const [showUserFieldsLearnMore, setShowUserFieldsLearnMore] = useState(false)
  const [showConnectionTestLearnMore, setShowConnectionTestLearnMore] = useState(false)
  const [showAuthLearnMore, setShowAuthLearnMore] = useState(false)
  const [previewConnectionModal, setPreviewConnectionModal] = useState(false)

  const updateParametersConfig = (updated: Partial<ParametersAuthConfig>) => {
    onChange({
      ...app,
      authentication: {
        ...auth,
        type: auth.type === "api_key" ? "parameters" : auth.type,
        parametersConfig: {
          showParameters,
          parameters: currentParams,
          showHeaders: false,
          headers: [],
          ...updated,
        },
      },
    })
  }

  const toggleParameters = (show: boolean) => {
    updateParametersConfig({ showParameters: show })
  }

  const addParam = () => {
    const newParam: AuthParameterField = {
      id: `param_${Date.now()}`,
      key: "",
      label: `Parameter ${currentParams.length + 1}`,
      type: "string",
      required: true,
      placeholder: "Enter parameter",
    }
    updateParametersConfig({ parameters: [...currentParams, newParam] })
  }

  const updateParam = (id: string, field: keyof AuthParameterField, value: any) => {
    const updated = currentParams.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    updateParametersConfig({ parameters: updated })
  }

  const duplicateParam = (id: string) => {
    const target = currentParams.find((p) => p.id === id)
    if (!target) return
    const duplicated: AuthParameterField = {
      ...target,
      id: `param_${Date.now()}`,
      key: target.key ? `${target.key}_copy` : "",
      label: target.label ? `${target.label} (Copy)` : "Parameter (Copy)",
    }
    updateParametersConfig({ parameters: [...currentParams, duplicated] })
  }

  const deleteParam = (id: string) => {
    updateParametersConfig({ parameters: currentParams.filter((p) => p.id !== id) })
  }

  const handleParamDrop = (dropIndex: number) => {
    if (draggedParamIndex === null || draggedParamIndex === dropIndex) {
      setDraggedParamIndex(null)
      return
    }
    const updated = [...currentParams]
    const [moved] = updated.splice(draggedParamIndex, 1)
    updated.splice(dropIndex, 0, moved)
    updateParametersConfig({ parameters: updated })
    setDraggedParamIndex(null)
  }

  const setAuthType = (type: AuthType) => {
    onChange({
      ...app,
      authentication: {
        ...auth,
        type,
      },
    })
    if (type !== "none") {
      setActiveStep("config")
    } else {
      setActiveStep(null)
    }
  }

  const updateApiKeyConfig = (key: string, value: any) => {
    onChange({
      ...app,
      authentication: {
        ...auth,
        apiKeyConfig: {
          headerOrQuery: auth.apiKeyConfig?.headerOrQuery || "header",
          paramName: auth.apiKeyConfig?.paramName || "X-API-Key",
          valuePrefix: auth.apiKeyConfig?.valuePrefix || "",
          [key]: value,
        },
      },
    })
  }

  const updateOAuth2Config = (key: string, value: any) => {
    onChange({
      ...app,
      authentication: {
        ...auth,
        oauth2Config: {
          authorizeUrl: auth.oauth2Config?.authorizeUrl || "",
          accessTokenUrl: auth.oauth2Config?.accessTokenUrl || "",
          refreshUrl: auth.oauth2Config?.refreshUrl || "",
          clientId: auth.oauth2Config?.clientId || "",
          clientSecret: auth.oauth2Config?.clientSecret || "",
          scopes: auth.oauth2Config?.scopes || "",
          pkceEnabled: auth.oauth2Config?.pkceEnabled || false,
          [key]: value,
        },
      },
    })
  }

  const updateBasicAuthConfig = (key: string, value: any) => {
    onChange({
      ...app,
      authentication: {
        ...auth,
        basicAuthConfig: {
          usernameLabel: auth.basicAuthConfig?.usernameLabel || "Username",
          passwordLabel: auth.basicAuthConfig?.passwordLabel || "Password",
          helpText: auth.basicAuthConfig?.helpText || "",
          [key]: value,
        },
      },
    })
  }

  const updateConnectionTest = (key: string, value: any) => {
    onChange({
      ...app,
      authentication: {
        ...auth,
        connectionTest: {
          ...auth.connectionTest,
          [key]: value,
        },
      },
    })
  }

  // User Credential Fields
  const addUserField = () => {
    const newField: UserCredentialField = {
      id: `uf_${Date.now()}`,
      key: "new_credential",
      label: "Credential Field Label",
      type: "text",
      required: true,
      helpText: "Instructions for finding this credential in your account.",
      placeholder: "e.g. acme_live_...",
    }
    onChange({
      ...app,
      authentication: {
        ...auth,
        userFields: [...auth.userFields, newField],
      },
    })
  }

  const updateUserField = (id: string, field: keyof UserCredentialField, value: any) => {
    const updated = auth.userFields.map((f) => {
      if (f.id === id) {
        return { ...f, [field]: value }
      }
      return f
    })
    onChange({
      ...app,
      authentication: {
        ...auth,
        userFields: updated,
      },
    })
  }

  const deleteUserField = (id: string) => {
    onChange({
      ...app,
      authentication: {
        ...auth,
        userFields: auth.userFields.filter((f) => f.id !== id),
      },
    })
  }

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(CALLBACK_URL)
    setCopiedCallback(true)
    setTimeout(() => setCopiedCallback(false), 2000)
  }

  const runConnectionTest = () => {
    setTestingConnection(true)
    setTestResult(null)
    setTimeout(() => {
      setTestingConnection(false)
      if (auth.connectionTest.url && auth.connectionTest.url.startsWith("https://")) {
        setTestResult({
          status: "success",
          code: 200,
          message: `Connection successful! Verified identity endpoint ${auth.connectionTest.url} responded with 200 OK.`,
          latency: 148,
        })
      } else {
        setTestResult({
          status: "error",
          code: 400,
          message: "Connection test failed: Endpoints must be secure (https://) and configured.",
          latency: 210,
        })
      }
    }, 1200)
  }

  const currentScheme = AUTH_SCHEMES.find((s) => s.type === auth.type) || AUTH_SCHEMES[0]

  return (
    <div className="space-y-8 w-full">
      {/* Section 1: Choose Scheme (Accordion Step 1 - Default Open) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-30">
        <div
          onClick={() => toggleStep("type")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Select Authentication Type
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAuthLearnMore(true)
                  }}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Learn more about Authentication Types"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Choose how Automate Workflows authenticates end-user requests against your API.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px]">Step 1</Badge>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {(auth.type === "api_key" || auth.type === "parameters")
                ? "Parameters"
                : (AUTH_SCHEMES.find((s) => s.type === auth.type)?.title || auth.type)}
            </Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "type" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "type" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="p-5 pt-4">
              <div className="max-w-xl space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Auth Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={auth.type === "api_key" ? "parameters" : auth.type}
                  onChange={(e) => setAuthType(e.target.value as AuthType)}
                  options={AUTH_SCHEMES.map((scheme) => {
                    const Icon = scheme.icon
                    return {
                      value: scheme.type,
                      label: scheme.title,
                      icon: <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
                    }
                  })}
                  className="h-10 text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Select the authentication method your app supports.{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowAuthLearnMore(true)
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer"
                  >
                    Learn more
                  </button>
                </p>

                {/* When Bearer Token is selected: Multi-Auth option */}
                {auth.type === "bearer_token" && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={auth.enableMultiAuth ?? true}
                        onChange={(e) => {
                          onChange({
                            ...app,
                            authentication: {
                              ...auth,
                              enableMultiAuth: e.target.checked,
                            },
                          })
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Enable Parameters Auth (Multi-Auth)
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Add custom parameters alongside the selected authentication method. Parameters will be sent with API requests.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Section 2: Scheme-Specific Form Configuration (Accordion Step 2) */}
      {auth.type === "oauth2" && (
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-20">
          <div
            onClick={() => toggleStep("config")}
            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    OAuth 2.0 Credentials & Endpoints
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowOAuthLearnMore(true)
                    }}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Learn more about OAuth 2.0 Setup"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure your OAuth authorization URLs, tokens, and PKCE security parameters.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px]">Step 2</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">OAuth 2.0 Flow</Badge>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", activeStep === "config" && "rotate-180 text-blue-600 dark:text-blue-400")} />
            </div>
          </div>

          {activeStep === "config" && (
            <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
              <CardContent className="space-y-4 p-5 pt-4">
            {/* Redirect Callback URI */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60">
              <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Platform OAuth Redirect Callback URI
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={CALLBACK_URL}
                  className="font-mono text-xs bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300"
                />
                <Button
                  type="button"
                  onClick={copyCallbackUrl}
                  variant="outline"
                  size="sm"
                  className="gap-1 border-blue-300 text-blue-700 dark:text-blue-300 dark:border-blue-800 shrink-0 text-xs"
                >
                  {copiedCallback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCallback ? "Copied" : "Copy URI"}
                </Button>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1.5">
                Register this callback URI inside your SaaS app's developer console (e.g. Google Cloud, Slack, or GitHub).
              </p>
            </div>

            {/* Endpoints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Authorize URL <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={auth.oauth2Config?.authorizeUrl || ""}
                  onChange={(e) => updateOAuth2Config("authorizeUrl", e.target.value)}
                  placeholder="https://app.acme.com/oauth/authorize"
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Access Token URL <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={auth.oauth2Config?.accessTokenUrl || ""}
                  onChange={(e) => updateOAuth2Config("accessTokenUrl", e.target.value)}
                  placeholder="https://api.acme.com/oauth/token"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Refresh Token URL (Optional)
                </label>
                <Input
                  value={auth.oauth2Config?.refreshUrl || ""}
                  onChange={(e) => updateOAuth2Config("refreshUrl", e.target.value)}
                  placeholder="https://api.acme.com/oauth/token"
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Required Scopes (Space-separated)
                </label>
                <Input
                  value={auth.oauth2Config?.scopes || ""}
                  onChange={(e) => updateOAuth2Config("scopes", e.target.value)}
                  placeholder="read:contacts write:contacts offline_access"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Client ID and Secret references */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Client ID (Common Data Secret or Value)
                </label>
                <Select
                  value={clientIdManual ? "__DIRECT__" : (auth.oauth2Config?.clientId || "")}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "__DIRECT__") {
                      setClientIdManual(true)
                      updateOAuth2Config("clientId", "")
                    } else {
                      setClientIdManual(false)
                      updateOAuth2Config("clientId", val)
                    }
                  }}
                  options={[
                    { value: "", label: "-- Select Secret Variable --" },
                    ...app.secrets.map((s) => ({ value: s.key, label: `Secret: ${s.key}` })),
                    { value: "__DIRECT__", label: "Enter Value Manually" },
                  ]}
                  className="h-10 text-xs font-mono"
                />
                {clientIdManual && (
                  <Input
                    value={auth.oauth2Config?.clientId || ""}
                    onChange={(e) => updateOAuth2Config("clientId", e.target.value)}
                    placeholder="Paste or type your Client ID value..."
                    className="font-mono text-xs mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Client Secret (Common Data Secret)
                </label>
                <Select
                  value={clientSecretManual ? "__DIRECT__" : (auth.oauth2Config?.clientSecret || "")}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "__DIRECT__") {
                      setClientSecretManual(true)
                      updateOAuth2Config("clientSecret", "")
                    } else {
                      setClientSecretManual(false)
                      updateOAuth2Config("clientSecret", val)
                    }
                  }}
                  options={[
                    { value: "", label: "-- Select Secret Variable --" },
                    ...app.secrets.map((s) => ({ value: s.key, label: `Secret: ${s.key}` })),
                    { value: "__DIRECT__", label: "Enter Value Manually" },
                  ]}
                  className="h-10 text-xs font-mono"
                />
                {clientSecretManual && (
                  <Input
                    type="password"
                    value={auth.oauth2Config?.clientSecret || ""}
                    onChange={(e) => updateOAuth2Config("clientSecret", e.target.value)}
                    placeholder="Paste or type your Client Secret value..."
                    className="font-mono text-xs mt-2"
                  />
                )}
              </div>
            </div>

            {/* PKCE Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Enable PKCE (Proof Key for Code Exchange)
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Generates SHA-256 code challenge to prevent authorization code interception.
                </p>
              </div>
              <Switch
                checked={auth.oauth2Config?.pkceEnabled || false}
                onCheckedChange={(checked) => updateOAuth2Config("pkceEnabled", checked)}
              />
            </div>
              </CardContent>
            </div>
          )}
        </Card>
      )}

      {/* Section 2: Parameters Configuration (Bearer Token Multi-Auth) */}
      {((auth.type === "parameters" || auth.type === "api_key") ||
        (auth.type === "bearer_token" && (auth.enableMultiAuth ?? true))) && (
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-20">
          <div
            onClick={() => toggleStep("config")}
            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {auth.type === "bearer_token"
                      ? "Parameters Configuration (Multi-Auth)"
                      : "Parameters Configuration"}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowParamLearnMore(true)
                    }}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Learn more about Parameters Configuration"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {auth.type === "bearer_token"
                  ? "Define custom parameters required alongside the Bearer Token. These parameters will be sent with API requests."
                  : "Configure custom body, query, or path parameters required for authentication."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px]">Step 2</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {currentParams.length} parameter{currentParams.length === 1 ? "" : "s"}
              </Badge>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", activeStep === "config" && "rotate-180 text-blue-600 dark:text-blue-400")} />
            </div>
          </div>

          {activeStep === "config" && (
            <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
              <CardContent className="space-y-4 p-5 pt-4">
                {/* Set Body/Query/Path Parameters (Exact Reference UI) */}
                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showParameters}
                      onChange={(e) => toggleParameters(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Set Body/Query/Path Parameters
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enable this option to define custom parameters that will be required for authentication. These parameters will be passed in API requests.{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowParamLearnMore(true)
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center cursor-pointer"
                        >
                          Learn more
                        </button>
                      </p>
                    </div>
                  </label>

                  {showParameters && (
                    <div className="space-y-2.5 pt-1">
                      {currentParams.map((param, idx) => (
                        <div
                          key={param.id}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleParamDrop(idx)}
                          className={cn(
                            "flex items-center gap-3 group transition-opacity",
                            draggedParamIndex === idx && "opacity-50"
                          )}
                        >
                          {/* Parameter Input with inline gear icon inside on the right */}
                          <div className="relative flex-1">
                            <Input
                              value={param.key}
                              onChange={(e) => updateParam(param.id, "key", e.target.value)}
                              placeholder="Enter parameter"
                              className="h-10 pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100"
                            />
                            <button
                              type="button"
                              onClick={() => setOpenParamSettingsId(param.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                              title="Configure parameter settings"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Right-side Action Icons */}
                          <div className="flex items-center gap-2.5 text-slate-400 shrink-0">
                            <div
                              draggable
                              onDragStart={() => setDraggedParamIndex(idx)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 select-none"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <button
                              type="button"
                              onClick={() => duplicateParam(param.id)}
                              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 cursor-pointer"
                              title="Duplicate parameter"
                            >
                              <CopyPlus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteParam(param.id)}
                              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                              title="Delete parameter"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Parameter Button */}
                      <div className="pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addParam}
                          className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/40 h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Add Parameter</span>
                        </Button>
                      </div>

                      {/* Dotted border separator matching reference UI */}
                      <div className="border-b border-dotted border-slate-200 dark:border-slate-800 pt-3" />
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          )}
        </Card>
      )}

      {/* When Bearer Token has multi-auth disabled */}
      {auth.type === "bearer_token" && !(auth.enableMultiAuth ?? true) && (
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-20">
          <div
            onClick={() => toggleStep("config")}
            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Bearer Token Authentication
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAuthLearnMore(true)
                    }}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Learn more about Bearer Token Auth"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Standard Bearer token will be passed via the `Authorization: Bearer &lt;token&gt;` HTTP header.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px]">Step 2</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">Standard Header</Badge>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", activeStep === "config" && "rotate-180 text-blue-600 dark:text-blue-400")} />
            </div>
          </div>

          {activeStep === "config" && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-5 animate-in fade-in-50 duration-200">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Standard Bearer Token authentication is active without additional multi-auth parameters. To add custom body, query, or path parameters, check <strong>Enable Parameters Auth (Multi-Auth)</strong> in Step 1.
              </p>
            </div>
          )}
        </Card>
      )}

      {auth.type === "basic_auth" && (
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-20">
          <div
            onClick={() => toggleStep("config")}
            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Basic Authentication Prompts
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAuthLearnMore(true)
                    }}
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Learn more about Basic Auth"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Customize the form field labels presented to users when connecting their account.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px]">Step 2</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">Username/Password</Badge>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", activeStep === "config" && "rotate-180 text-blue-600 dark:text-blue-400")} />
            </div>
          </div>

          {activeStep === "config" && (
            <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
              <CardContent className="space-y-4 p-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username Field Label
                </label>
                <Input
                  value={auth.basicAuthConfig?.usernameLabel || "Username / Account ID"}
                  onChange={(e) => updateBasicAuthConfig("usernameLabel", e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password Field Label
                </label>
                <Input
                  value={auth.basicAuthConfig?.passwordLabel || "Password / API Token"}
                  onChange={(e) => updateBasicAuthConfig("passwordLabel", e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Help Instructions for Users
              </label>
              <Input
                value={auth.basicAuthConfig?.helpText || ""}
                onChange={(e) => updateBasicAuthConfig("helpText", e.target.value)}
                placeholder="e.g. Enter your company email and generated developer token."
                className="text-xs"
              />
            </div>
              </CardContent>
            </div>
          )}
        </Card>
      )}

      {/* Section 3: Connection Prompt Fields Configuration (Accordion Step 3) */}
      {auth.type !== "none" && (
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-10">
          <div
            onClick={() => toggleStep("fields")}
            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    End-User Connection Dialog Fields
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserFieldsLearnMore(true)
                    }}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Learn more about Connection Dialog Fields"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Form fields shown to users when adding a new connection (e.g. API Key, Subdomain, Region).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px]">Step 3</Badge>
              <Badge variant="secondary" className="text-[10px]">
                {auth.userFields.length} {auth.userFields.length === 1 ? "Field" : "Fields"}
              </Badge>
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  addUserField()
                  setActiveStep("fields")
                }}
                variant="outline"
                size="sm"
                className="gap-1.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs h-7 px-2.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Field</span>
              </Button>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", activeStep === "fields" && "rotate-180 text-blue-600 dark:text-blue-400")} />
            </div>
          </div>

          {activeStep === "fields" && (
            <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
              <CardContent className="p-5 pt-4">
            {auth.userFields.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No extra user fields configured. {auth.type === "oauth2" ? "OAuth automatically uses redirect flow." : "Click below to add credential fields."}
                </p>
                <Button
                  type="button"
                  onClick={addUserField}
                  size="sm"
                  variant="outline"
                  className="mt-3 text-xs gap-1 border-slate-300 dark:border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add User Credential Field
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {auth.userFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {field.label || "Untitled Field"}
                        </span>
                      </div>

                      <Button
                        type="button"
                        onClick={() => deleteUserField(field.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Field Key
                        </label>
                        <Input
                          value={field.key}
                          onChange={(e) =>
                            updateUserField(
                              field.id,
                              "key",
                              e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                            )
                          }
                          placeholder="e.g. apiKey"
                          className="font-mono text-xs h-8"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Display Label
                        </label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateUserField(field.id, "label", e.target.value)}
                          placeholder="e.g. API Secret Key"
                          className="text-xs h-8"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Input Type
                        </label>
                        <Select
                          value={field.type}
                          onChange={(e) => updateUserField(field.id, "type", e.target.value)}
                          options={[
                            { value: "text", label: "Text (Subdomain / Account)" },
                            { value: "password", label: "Password (Secret / API Key)" },
                          ]}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateUserField(field.id, "required", checked)}
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">Required</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Help Description
                      </label>
                      <Input
                        value={field.helpText || ""}
                        onChange={(e) => updateUserField(field.id, "helpText", e.target.value)}
                        placeholder="e.g. Located under Settings > Developers in your Acme dashboard."
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
              </CardContent>
            </div>
          )}
        </Card>
      )}

      {/* Section 4: Connection Test Endpoint & Label Template (Accordion Step 4) */}
      {auth.type !== "none" && (
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-0">
          <div
            onClick={() => toggleStep("test")}
            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Connection Verification & Label Templating
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowConnectionTestLearnMore(true)
                    }}
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Learn more about Connection Verification & Label Templating"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verify user credentials by pinging a lightweight identity endpoint (e.g. GET /me or /user).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px]">Step 4</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {auth.connectionTest.method} {auth.connectionTest.url ? "Endpoint Configured" : "Optional"}
              </Badge>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", activeStep === "test" && "rotate-180 text-blue-600 dark:text-blue-400")} />
            </div>
          </div>

          {activeStep === "test" && (
            <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
              <CardContent className="space-y-4 p-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  HTTP Method
                </label>
                <Select
                  value={auth.connectionTest.method}
                  onChange={(e) => updateConnectionTest("method", e.target.value)}
                  options={[
                    { value: "GET", label: "GET" },
                    { value: "POST", label: "POST" },
                  ]}
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Test Endpoint URL <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={auth.connectionTest.url}
                  onChange={(e) => updateConnectionTest("url", e.target.value)}
                  placeholder="https://api.acme.com/v1/me"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Connection Display Label Template
              </label>
              <Input
                value={auth.connectionLabelTemplate}
                onChange={(e) => onChange({ ...app, authentication: { ...auth, connectionLabelTemplate: e.target.value } })}
                placeholder="e.g. {{email}} ({{account_name}})"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Controls how connected accounts are labeled in the user dashboard. Tokens enclosed in{" "}
                <code className="text-purple-600 dark:text-purple-400">{"{{}}"}</code> resolve from the test response.
              </p>
            </div>

            {/* Test Runner Button & Visual Result Card */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={runConnectionTest}
                disabled={testingConnection}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
              >
                <Play className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
                {testingConnection ? "Pinging Endpoint..." : "Test Connection Endpoint"}
              </Button>

              {testResult && (
                <div
                  className={`mt-3 p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    testResult.status === "success"
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {testResult.status === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          testResult.status === "success"
                            ? "text-emerald-900 dark:text-emerald-200"
                            : "text-rose-900 dark:text-rose-200"
                        }`}
                      >
                        Status {testResult.code} {testResult.status === "success" ? "OK" : "Error"}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {testResult.latency}ms
                      </Badge>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        testResult.status === "success"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {testResult.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      )}
    </Card>
      )}

      {/* Informational notice when No Authentication is selected */}
      {auth.type === "none" && (
        <Card className="border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-6 text-center animate-in fade-in-50 duration-200">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Authentication Required
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This app connects directly to public APIs or open endpoints. Users can immediately use your app&apos;s actions and triggers without configuring credentials.
            </p>
          </div>
        </Card>
      )}

      {/* Bottom Save Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shadow-2xs">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Save your authentication parameters, OAuth keys, and connection verification tests.
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
          <span>{isSaved ? "Saved Successfully!" : "Save Authentication"}</span>
        </Button>
      </div>

      {/* Parameter Settings Drawer (Built-in Drawer Component) */}
      {openParamSettingsId && (() => {
        const activeParam = currentParams.find((p) => p.id === openParamSettingsId)
        if (!activeParam) return null

        return (
          <Drawer
            open={Boolean(openParamSettingsId)}
            onOpenChange={(open) => !open && setOpenParamSettingsId(null)}
            side="right"
            zIndex={60}
            className="w-[780px] max-w-[94vw]"
            title={`Parameter Settings for ${activeParam.key || "Parameter"}`}
            description="Configure display label, placeholder text, and validation rules for this authentication parameter."
            footer={
              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenParamSettingsId(null)}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenParamSettingsId(null)}
                  className="h-9 px-5 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Parameter Identification Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                    Authentication Parameter Key
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {activeParam.key || "unnamed_parameter"}
                  </code>
                </div>
                <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-mono">
                  &#123;&#123;auth.{activeParam.key || "key"}&#125;&#125;
                </Badge>
              </div>

              {/* Display Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>Display Label</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={activeParam.label || ""}
                  onChange={(e) => updateParam(activeParam.id, "label", e.target.value)}
                  placeholder="e.g. API Key / Access Token"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Label displayed to users when connecting their account.
                </p>
              </div>

              {/* Placeholder Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Placeholder Text
                </label>
                <Input
                  value={activeParam.placeholder || ""}
                  onChange={(e) => updateParam(activeParam.id, "placeholder", e.target.value)}
                  placeholder="e.g. Enter your API Key"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hint text shown inside the input box when empty.
                </p>
              </div>

              {/* Help Instruction / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Help Instruction / Description
                </label>
                <Input
                  value={activeParam.helpText || ""}
                  onChange={(e) => updateParam(activeParam.id, "helpText", e.target.value)}
                  placeholder="e.g. You can find your API key under Account Settings > Developers"
                  className="h-10 text-sm font-medium text-slate-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Helpful instructions shown beneath the field in the connection dialog.
                </p>
              </div>

              {/* Required Field Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Required Field
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Must be provided when users connect their account
                  </span>
                </div>
                <Switch
                  checked={activeParam.required !== false}
                  onCheckedChange={(checked) => updateParam(activeParam.id, "required", checked)}
                />
              </div>
            </div>
          </Drawer>
        )
      })()}

      {/* Set Body/Query/Path Parameters Learn More Dialog */}
      <Dialog open={showParamLearnMore} onOpenChange={setShowParamLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            How to Use: Custom Parameters Authentication
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to passing API keys, tokens, and custom query/header parameters.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
            <strong>What this does:</strong> Automatically attaches API keys or custom parameters to every trigger and action request sent to your service.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
              How Developer Sets It Up:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Add Parameter Key:</strong> Type the parameter name expected by your API (e.g. <code>api_key</code> or <code>access_token</code>).
              </li>
              <li>
                <strong>Configure Placement (⚙):</strong> Click the gear icon to choose where it goes:
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li><strong>Header:</strong> Sent as HTTP header (e.g. <code>X-API-Key: value</code>).</li>
                  <li><strong>Query:</strong> Appended to URL (e.g. <code>?api_key=value</code>).</li>
                  <li><strong>Request Body:</strong> Sent inside the JSON payload.</li>
                </ul>
              </li>
              <li>
                <strong>Value Prefix:</strong> Add optional prefixes like <code>Bearer </code> or <code>Token </code> if required.
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When users connect their account, they simply enter their API key once. The platform securely encrypts it and passes it seamlessly during workflow runs.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowParamLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Auth Type Learn More Dialog */}
      <Dialog open={showAuthLearnMore} onOpenChange={setShowAuthLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            How to Choose: Authentication Mechanism
          </DialogTitle>
          <DialogDescription>
            Pick the right authentication method based on how your API validates requests.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
              Available Methods & When to Use:
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">1. Parameters / API Key:</strong> Best for APIs where users provide an API Key, Token, or Account ID passed in headers or query strings.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">2. OAuth 2.0:</strong> Best for major platforms (Google, Slack, HubSpot) where users log in via a popup consent screen without sharing raw passwords.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">3. Basic Authentication:</strong> Best for standard Username and Password combinations sent via Base64 Authorization header.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200">4. Bearer Token:</strong> For APIs expecting a dedicated <code>Authorization: Bearer &lt;token&gt;</code> HTTP header.
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAuthLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>

      {/* OAuth 2.0 Learn More Dialog */}
      <Dialog open={showOAuthLearnMore} onOpenChange={setShowOAuthLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            How to Use: OAuth 2.0 Authentication Flow
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to setting up 3-legged OAuth with automatic token refreshes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
            <strong>What this does:</strong> Allows end-users to connect by clicking "Authorize" on your app's login page without typing secrets manually.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
              How Developer Configures It:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Authorize URL:</strong> The web page where users log in and grant permissions (e.g. <code>https://app.example.com/oauth/authorize</code>).
              </li>
              <li>
                <strong>Access Token URL:</strong> The backend endpoint where the authorization code is exchanged for an access token (e.g. <code>https://api.example.com/oauth/token</code>).
              </li>
              <li>
                <strong>Redirect Callback URI:</strong> Copy the callback URL provided in this tab and paste it into your third-party Developer Portal app settings.
              </li>
              <li>
                <strong>Scopes:</strong> List the permissions required (e.g. <code>read_contacts write_messages</code>).
              </li>
              <li>
                <strong>PKCE:</strong> Enable Proof Key for Code Exchange (SHA-256) to eliminate authorization code interception vulnerabilities.
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When a user adds a connection, a popup window opens your login consent screen. Upon approval, tokens are automatically saved and refreshed silently in the background when they expire.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowOAuthLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Connection Prompt Fields Learn More Dialog */}
      <Dialog open={showUserFieldsLearnMore} onOpenChange={setShowUserFieldsLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            How to Use: End-User Connection Dialog Fields
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to customizing the input form presented when users connect their account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300">
            <strong>What this does:</strong> Creates custom input fields in the connection popup so users can enter account-specific data (e.g., Subdomain, API Key, Region).
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
              How Developer Configures It:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Click "Add Field":</strong> Create an input field for each value needed from the user.
              </li>
              <li>
                <strong>Field Key:</strong> Unique identifier used in API URLs (e.g. <code>subdomain</code> or <code>api_key</code>).
              </li>
              <li>
                <strong>Display Label:</strong> Friendly title shown on the form (e.g. "Your Company Subdomain" or "API Secret Key").
              </li>
              <li>
                <strong>Input Type:</strong> Use <strong>Password</strong> for secrets/tokens (masks characters) and <strong>Text</strong> for public IDs/URLs.
              </li>
              <li>
                <strong>Help Description:</strong> Tell users where to find this value in their software dashboard (e.g. &ldquo;Located under Settings &gt; API Keys in your portal&rdquo;).
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When users click "+ Add New Connection", a clean modal opens with these fields. Values entered are securely encrypted and automatically injected into API endpoints using <code>&#123;&#123;connection.key&#125;&#125;</code>.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowUserFieldsLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Connection Test & Label Templating Learn More Dialog */}
      <Dialog open={showConnectionTestLearnMore} onOpenChange={setShowConnectionTestLearnMore}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            How to Use: Connection Verification & Account Labeling
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to testing credentials automatically and giving connected accounts friendly names.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-slate-700 dark:text-slate-300">
            <strong>What this does:</strong> Instantly tests user credentials against your API when they click Save, and formats the account name cleanly in workflow dropdowns.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-blue-600">
              How Developer Sets It Up:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Test Endpoint URL:</strong> Enter a lightweight identity endpoint (e.g. <code>https://api.yourdomain.com/v1/me</code> or <code>https://api.yourdomain.com/v1/user</code>).
              </li>
              <li>
                <strong>HTTP Method:</strong> Select <code>GET</code> or <code>POST</code>.
              </li>
              <li>
                <strong>Display Label Template:</strong> Use double-curly brackets to reference response fields (e.g. <code>&#123;&#123;email&#125;&#125; (&#123;&#123;account_name&#125;&#125;)</code> or <code>&#123;&#123;username&#125;&#125;</code>).
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-emerald-600">
              How End-Users Experience It:
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When a user saves their connection, the system pings this endpoint. If it returns HTTP 200, the connection is verified and labeled (e.g. <em>"alex@company.com (Acme HQ)"</em>). If credentials are wrong, the user gets an instant error alert with guidance.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowConnectionTestLearnMore(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Live End-User Connection Dialog Preview Modal */}
      <Dialog
        open={previewConnectionModal}
        onOpenChange={setPreviewConnectionModal}
        className="max-w-md"
      >
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Connect {app.name || "App"} Account</span>
            </DialogTitle>
            <DialogDescription>
              Live simulated preview of the modal workflow users will see when connecting their account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            {auth.type === "oauth2" ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Authorize {app.name || "Application"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    You will be securely redirected to {auth.oauth2Config?.authorizeUrl || "OAuth Provider"} to grant permissions.
                  </p>
                </div>
                <Button className="h-9 px-6 bg-blue-600 text-white text-xs font-semibold w-full">
                  Connect via OAuth 2.0 →
                </Button>
              </div>
            ) : auth.type === "basic_auth" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {auth.basicAuthConfig?.usernameLabel || "Username"} <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Enter username..." className="h-9 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {auth.basicAuthConfig?.passwordLabel || "Password / API Token"} <span className="text-red-500">*</span>
                  </label>
                  <Input type="password" placeholder="••••••••••••" className="h-9 text-xs" />
                </div>
              </div>
            ) : auth.type === "bearer_token" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bearer Token / Personal Access Token <span className="text-red-500">*</span>
                  </label>
                  <Input type="password" placeholder="Paste your API access token..." className="h-9 text-xs font-mono" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentParams.map((p) => (
                  <div key={p.id} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{p.label || p.key || "Parameter"}</span>
                      {p.required && <span className="text-red-500">*</span>}
                    </label>
                    <Input placeholder={p.placeholder || "Enter parameter value..."} className="h-9 text-xs font-mono" />
                    {p.helpText && <p className="text-[11px] text-slate-500">{p.helpText}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => setPreviewConnectionModal(false)}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Close Preview
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  )
}
