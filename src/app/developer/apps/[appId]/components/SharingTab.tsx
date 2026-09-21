"use client"

import React, { useState, useEffect } from "react"
import {
  DeveloperApp,
  AppCollaborator,
  CollaboratorRole,
  InstalledWorkspace
} from "@/lib/developer-types"
import {
  getAppCollaborators,
  saveAppCollaborators,
  getInstalledWorkspaces
} from "@/lib/developer-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"
import {
  Share2,
  Copy,
  Check,
  RefreshCw,
  Users,
  Shield,
  Plus,
  Trash2,
  ExternalLink,
  UserCheck,
  Ban,
  Building2,
  ChevronDown,
  Eye,
  HelpCircle,
  Code,
  Globe,
  Info,
  CheckCircle2,
  UserPlus,
  Lock,
  Sparkles
} from "lucide-react"

interface SharingTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

export function SharingTab({ app, onChange }: SharingTabProps) {
  const [activeStep, setActiveStep] = useState<string | null>("collaborators")
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [newTesterEmail, setNewTesterEmail] = useState("")
  const [workspaceSharing, setWorkspaceSharing] = useState(true)
  const [showSharingHelpModal, setShowSharingHelpModal] = useState(false)
  const [previewInviteLandingModal, setPreviewInviteLandingModal] = useState(false)

  // Collaborators & Installed Workspaces State
  const [collaborators, setCollaborators] = useState<AppCollaborator[]>([])
  const [installedWorkspaces, setInstalledWorkspaces] = useState<InstalledWorkspace[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Invite Collaborator Modal
  const [inviteCollabModalOpen, setInviteCollabModalOpen] = useState(false)
  const [collabName, setCollabName] = useState("")
  const [collabEmail, setCollabEmail] = useState("")
  const [collabRole, setCollabRole] = useState<CollaboratorRole>("editor")

  // Confirmation Modal
  const [confirmModalState, setConfirmModalState] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ open: false, title: "", description: "", onConfirm: () => {} })

  useEffect(() => {
    setCollaborators(getAppCollaborators(app.id))
    setInstalledWorkspaces(getInstalledWorkspaces(app.id))
  }, [app.id])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const toggleStep = (stepId: string) => {
    setActiveStep((prev) => (prev === stepId ? null : stepId))
  }

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/developer/invite/${app.distribution.inviteToken}`
      : `http://localhost:3000/developer/invite/${app.distribution.inviteToken}`

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const regenerateToken = () => {
    const newToken = `inv_${app.slug}_${Math.random().toString(36).substring(2, 8)}`
    const newUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/developer/invite/${newToken}`
        : `http://localhost:3000/developer/invite/${newToken}`

    onChange({
      ...app,
      distribution: {
        ...app.distribution,
        inviteToken: newToken,
        inviteUrl: newUrl,
      },
    })
    showToast("Generated new cryptographic invite token!")
  }

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault()
    if (!collabEmail || !collabEmail.includes("@")) return

    const newCollab: AppCollaborator = {
      id: `collab_${Date.now().toString(36)}`,
      name: collabName.trim() || collabEmail.split("@")[0],
      email: collabEmail.trim(),
      role: collabRole,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "active"
    }

    const updated = [...collaborators, newCollab]
    setCollaborators(updated)
    saveAppCollaborators(app.id, updated)
    setInviteCollabModalOpen(false)
    setCollabName("")
    setCollabEmail("")
    showToast(`Invited ${newCollab.name} as ${collabRole.toUpperCase()}`)
  }

  const handleRemoveCollaborator = (id: string, name: string) => {
    setConfirmModalState({
      open: true,
      title: `Remove Collaborator ${name}?`,
      description: `Are you sure you want to revoke app editing and testing permissions for ${name}?`,
      onConfirm: () => {
        const updated = collaborators.filter((c) => c.id !== id)
        setCollaborators(updated)
        saveAppCollaborators(app.id, updated)
        showToast(`Removed collaborator ${name}`)
      }
    })
  }

  const toggleWorkspaceStatus = (id: string) => {
    setInstalledWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === id ? { ...ws, status: ws.status === "active" ? "suspended" : "active" } : ws
      )
    )
    showToast("Updated installation access status")
  }

  const addManualTester = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTesterEmail || !newTesterEmail.includes("@")) return
    const exists = app.distribution.betaTesters.some((t) => t.email === newTesterEmail)
    if (exists) return

    onChange({
      ...app,
      distribution: {
        ...app.distribution,
        activeInstalls: app.distribution.activeInstalls + 1,
        betaTesters: [
          ...app.distribution.betaTesters,
          {
            email: newTesterEmail,
            acceptedAt: new Date().toISOString().split("T")[0],
            status: "active",
          },
        ],
      },
    })
    setNewTesterEmail("")
    showToast(`Added beta tester ${newTesterEmail}`)
  }

  const toggleTesterStatus = (email: string) => {
    const updated = app.distribution.betaTesters.map((t) => {
      if (t.email === email) {
        return {
          ...t,
          status: t.status === "active" ? ("revoked" as const) : ("active" as const),
        }
      }
      return t
    })
    onChange({
      ...app,
      distribution: {
        ...app.distribution,
        betaTesters: updated,
      },
    })
  }

  const removeTester = (email: string) => {
    onChange({
      ...app,
      distribution: {
        ...app.distribution,
        activeInstalls: Math.max(0, app.distribution.activeInstalls - 1),
        betaTesters: app.distribution.betaTesters.filter((t) => t.email !== email),
      },
    })
    showToast(`Removed tester ${email}`)
  }

  const percentUsed = Math.min(
    100,
    Math.round((app.distribution.activeInstalls / (app.distribution.maxTesters || 100)) * 100)
  )

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <Badge variant="success" className="fixed top-20 right-6 z-50 space-x-1.5 py-2 px-4 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium text-xs">{toastMessage}</span>
        </Badge>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Collaborators & Beta Access
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage team permissions, private beta invite links, and workspace installs.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            size="sm"
            onClick={() => setInviteCollabModalOpen(true)}
            className="text-xs font-medium space-x-1.5 h-8"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite Collaborator</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Collaborators
            </span>
            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1.5 block">
            {collaborators.length}
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Beta Testers
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1.5 block">
            {app.distribution.betaTesters.length}
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Workspaces
            </span>
            <div className="h-6 w-6 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1.5 block">
            {installedWorkspaces.length}
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Sharing Mode
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Globe className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <Badge variant="blue" className="text-[10px] font-medium">
              {app.status === "published" ? "Public Directory" : "Private Beta"}
            </Badge>
          </div>
        </Card>
      </div>

      {/* SECTION 1: TEAM COLLABORATORS & RBAC */}
      <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div
          onClick={() => toggleStep("collaborators")}
          className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium text-xs">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Team Collaborators
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                {collaborators.length}
              </Badge>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              activeStep === "collaborators" ? "rotate-180" : ""
            }`}
          />
        </div>

        {activeStep === "collaborators" && (
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400">Collaborator</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-slate-500 dark:text-slate-400">Role</TableHead>
                  <TableHead className="w-[110px] text-xs font-medium text-slate-500 dark:text-slate-400">Joined</TableHead>
                  <TableHead className="w-[90px] text-xs font-medium text-slate-500 dark:text-slate-400">Status</TableHead>
                  <TableHead className="w-[70px] text-right text-xs font-medium text-slate-500 dark:text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.map((c) => (
                  <TableRow key={c.id} className="border-slate-100 dark:border-slate-800/80">
                    <TableCell>
                      <div>
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">{c.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.role === "admin" ? "default" : c.role === "editor" ? "blue" : "outline"}
                        className="text-[10px] font-medium capitalize"
                      >
                        {c.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500">{c.joinedAt}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "success" : "secondary"} className="text-[10px] font-medium capitalize">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.role !== "admin" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(c.id, c.name)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Remove Collaborator"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* SECTION 2: PRIVATE INVITE LINK */}
      <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div
          onClick={() => toggleStep("invite")}
          className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-medium text-xs">
              <Share2 className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Beta Invite Link
              </span>
              <Badge variant="blue" className="text-[10px] px-1.5 py-0 font-normal">
                {percentUsed}% capacity
              </Badge>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              activeStep === "invite" ? "rotate-180" : ""
            }`}
          />
        </div>

        {activeStep === "invite" && (
          <CardContent className="p-4 space-y-4">
            {/* Link Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="font-mono text-xs pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-9"
                />
              </div>
              <Button onClick={copyLink} size="sm" className="space-x-1.5 shrink-0 text-xs font-medium h-9 px-3">
                {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedUrl ? "Copied!" : "Copy Link"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateToken}
                className="space-x-1.5 shrink-0 text-xs font-normal h-9 px-3 border-slate-200 dark:border-slate-800"
                title="Revoke and create new link"
              >
                <RefreshCw className="h-3 w-3 text-slate-500" />
                <span>Regenerate</span>
              </Button>
            </div>

            {/* Manual Invite Tester Form */}
            <form onSubmit={addManualTester} className="flex gap-2">
              <Input
                type="email"
                placeholder="Add tester by email (e.g. tester@company.com)..."
                value={newTesterEmail}
                onChange={(e) => setNewTesterEmail(e.target.value)}
                className="text-xs h-8"
              />
              <Button type="submit" size="sm" variant="secondary" className="text-xs font-medium shrink-0 h-8">
                <Plus className="h-3 w-3 mr-1" />
                Add Tester
              </Button>
            </form>

            {/* Testers List */}
            {app.distribution.betaTesters.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                  Active Testers ({app.distribution.betaTesters.length})
                </span>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  {app.distribution.betaTesters.map((tester) => (
                    <div
                      key={tester.email}
                      className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{tester.email}</span>
                        <Badge
                          variant={tester.status === "active" ? "success" : "secondary"}
                          className="text-[9px] font-medium capitalize"
                        >
                          {tester.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTesterStatus(tester.email)}
                          className="h-6 px-2 text-xs font-normal"
                        >
                          {tester.status === "active" ? "Revoke" : "Activate"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => removeTester(tester.email)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* SECTION 3: ACTIVE WORKSPACES */}
      <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div
          onClick={() => toggleStep("workspaces")}
          className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-medium text-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Installed Workspaces
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                {installedWorkspaces.length}
              </Badge>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              activeStep === "workspaces" ? "rotate-180" : ""
            }`}
          />
        </div>

        {activeStep === "workspaces" && (
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400">Workspace</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400">Owner</TableHead>
                  <TableHead className="w-[110px] text-xs font-medium text-slate-500 dark:text-slate-400">Workflows</TableHead>
                  <TableHead className="w-[110px] text-xs font-medium text-slate-500 dark:text-slate-400">Last Active</TableHead>
                  <TableHead className="w-[90px] text-xs font-medium text-slate-500 dark:text-slate-400">Status</TableHead>
                  <TableHead className="w-[90px] text-right text-xs font-medium text-slate-500 dark:text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installedWorkspaces.map((ws) => (
                  <TableRow key={ws.id} className="border-slate-100 dark:border-slate-800/80">
                    <TableCell className="font-medium text-xs text-slate-900 dark:text-slate-100">
                      {ws.workspaceName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500">{ws.ownerEmail}</TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                      {ws.activeWorkflowsCount} Workflows
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500">{ws.lastUsed}</TableCell>
                    <TableCell>
                      <Badge variant={ws.status === "active" ? "success" : "secondary"} className="text-[10px] font-medium capitalize">
                        {ws.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={ws.status === "active" ? "outline" : "default"}
                        onClick={() => toggleWorkspaceStatus(ws.id)}
                        className="h-6 px-2 text-xs font-normal"
                      >
                        {ws.status === "active" ? "Suspend" : "Restore"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* INVITE COLLABORATOR DIALOG */}
      <Dialog open={inviteCollabModalOpen} onOpenChange={setInviteCollabModalOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Invite Developer Collaborator</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Invite a teammate to collaborate on building, testing, or reviewing {app.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddCollaborator} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <Input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={collabName}
              onChange={(e) => setCollabName(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <Input
              type="email"
              placeholder="e.g. alex@partner.dev"
              value={collabEmail}
              onChange={(e) => setCollabEmail(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Collaborator Role</label>
            <Select
              value={collabRole}
              onValueChange={(val) => setCollabRole(val as CollaboratorRole)}
              options={[
                { value: "editor", label: "Editor / Developer (Full editing & sandbox testing)" },
                { value: "admin", label: "App Admin (Manage secrets, team & versions)" },
                { value: "tester", label: "Tester / QA (Run sandbox executions & test requests)" },
                { value: "viewer", label: "Viewer (Read-only configuration inspector)" }
              ]}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setInviteCollabModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" className="text-xs font-medium space-x-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Send Invite</span>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        open={confirmModalState.open}
        onOpenChange={(open) => setConfirmModalState({ ...confirmModalState, open })}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmText="Confirm"
        variant="danger"
      />
    </div>
  )
}

