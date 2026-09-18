"use client"

import React, { useState } from "react"
import { DeveloperApp } from "@/lib/developer-types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
} from "lucide-react"

interface SharingTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
}

export function SharingTab({ app, onChange }: SharingTabProps) {
  const [activeStep, setActiveStep] = useState<string | null>("invite")
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [newTesterEmail, setNewTesterEmail] = useState("")
  const [workspaceSharing, setWorkspaceSharing] = useState(true)
  const [showSharingHelpModal, setShowSharingHelpModal] = useState(false)
  const [previewInviteLandingModal, setPreviewInviteLandingModal] = useState(false)

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
  }

  const updateMaxTesters = (max: number) => {
    onChange({
      ...app,
      distribution: {
        ...app.distribution,
        maxTesters: max,
      },
    })
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
  }

  const percentUsed = Math.min(
    100,
    Math.round((app.distribution.activeInstalls / (app.distribution.maxTesters || 100)) * 100)
  )

  return (
    <div className="space-y-8 w-full">
      {/* Section 1: Cryptographic Private Invite Link (Accordion Step 1 - Default Open) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-30">
        <div
          onClick={() => toggleStep("invite")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Private Beta Invite Link
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSharingHelpModal(true)
                  }}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Beta Tester & Invite Roles Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Share this secure URL with external collaborators, clients, or beta testers.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px]">Step 1</Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {app.distribution.activeInstalls} / {app.distribution.maxTesters} Claimed
            </Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "invite" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "invite" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="space-y-5 p-5 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Secret Installation URL
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="font-mono text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
              <Button
                type="button"
                onClick={copyLink}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? "Copied" : "Copy Link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewInviteLandingModal(true)}
                className="text-xs gap-1.5 shrink-0 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
                title="Preview what testers see on the invite page"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Preview Page</span>
              </Button>
              <Button
                type="button"
                onClick={regenerateToken}
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 shrink-0 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Invalidates previous link and issues new token"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Anyone with this link can install this custom app into their workspace without administrative approval.
            </p>
          </div>

          {/* Tester Limits & Meter */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tester Capacity Limit
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {app.distribution.activeInstalls} of {app.distribution.maxTesters} slots claimed ({percentUsed}%)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Max Testers:</span>
                <Input
                  type="number"
                  value={app.distribution.maxTesters}
                  onChange={(e) => updateMaxTesters(Number(e.target.value) || 50)}
                  min={1}
                  max={500}
                  className="w-20 h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Section 2: Team Workspace Auto-Availability (Accordion Step 2) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-20">
        <div
          onClick={() => toggleStep("workspace")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Workspace Team Availability
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Automatically expose this connector to all organization members without invite links.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px]">Step 2</Badge>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold ${
                workspaceSharing
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {workspaceSharing ? "Enabled" : "Disabled"}
            </Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "workspace" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "workspace" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Enable for Entire Workspace Team
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
                      Automatically expose this private connector in the workflow canvas for all team members in your organization without requiring an invite link.
                    </p>
                  </div>
                </div>

                <Switch checked={workspaceSharing} onCheckedChange={setWorkspaceSharing} />
              </div>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Section 3: Active Beta Testers Table (Accordion Step 3) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm rounded-2xl relative z-10">
        <div
          onClick={() => toggleStep("testers")}
          className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Active Beta Testers ({app.distribution.betaTesters.length})
              </CardTitle>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSharingHelpModal(true)
                }}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Beta Testers Management Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px]">Step 3</Badge>
            <Badge variant="blue" className="text-[10px] font-mono">
              {app.distribution.betaTesters.length} Testers
            </Badge>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                activeStep === "testers" && "rotate-180 text-blue-600 dark:text-blue-400"
              )}
            />
          </div>
        </div>

        {activeStep === "testers" && (
          <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50 duration-200">
            <CardContent className="space-y-4 p-5 pt-4">
              {/* Add Manual Tester Input */}
              <form onSubmit={addManualTester} className="flex items-center gap-2">
                <Input
                  type="email"
                  value={newTesterEmail}
                  onChange={(e) => setNewTesterEmail(e.target.value)}
                  placeholder="Enter tester email address..."
                  className="text-xs h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shrink-0 h-9 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tester
                </Button>
              </form>

              {app.distribution.betaTesters.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    No external testers have accepted the link yet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Copy your invite link above and send it to your team or clients to get started.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Tester Email</th>
                        <th className="py-2.5 px-4">Joined Date</th>
                        <th className="py-2.5 px-4">Access Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {app.distribution.betaTesters.map((tester) => (
                        <tr key={tester.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                            {tester.email}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {tester.acceptedAt}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold uppercase ${
                                tester.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                              }`}
                            >
                              {tester.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                onClick={() => toggleTesterStatus(tester.email)}
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] gap-1"
                              >
                                {tester.status === "active" ? (
                                  <>
                                    <Ban className="w-3 h-3 text-rose-500" />
                                    Revoke
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3 text-emerald-500" />
                                    Re-activate
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => removeTester(tester.email)}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </div>
        )}
      </Card>

      {/* Beta Tester Invite Landing Page Preview Modal */}
      <Dialog
        open={previewInviteLandingModal}
        onOpenChange={setPreviewInviteLandingModal}
        className="max-w-md"
      >
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Tester Invitation Landing Preview</span>
            </DialogTitle>
            <DialogDescription>
              Preview of what collaborators see when visiting your private beta invite link.
            </DialogDescription>
          </DialogHeader>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
              {app.name ? app.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] font-mono mb-1">
                Private Beta v{app.version}
              </Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                You&apos;re Invited to test {app.name || "Custom App"}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {app.description || "Automate workflows with custom triggers and actions."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Included Triggers:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{app.triggers.length} events</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Included Actions:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{app.actions.length} actions</span>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-sm cursor-pointer">
              Accept Invite & Install to Workspace →
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => setPreviewInviteLandingModal(false)}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Close Preview
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Beta Sharing & Tester Roles Helping Modal */}
      <Dialog open={showSharingHelpModal} onOpenChange={setShowSharingHelpModal}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            How to Use: Private Beta Sharing & Tester Invites
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide for developers to share early access and how invited testers use the app.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-lg text-blue-800 dark:text-blue-300">
            <strong>What this does:</strong> Enables you to safely share early versions of your integration with select teammates, clients, or external beta testers before submitting for public release.
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">How Developer Sets It Up:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Set Tester Capacity:</strong> Define max tester seats (e.g., 50 or 200 testers) to limit concurrent access.</li>
              <li><strong>Generate Invite Link:</strong> Click generate to create a cryptographically secured invite link containing a unique authorization token.</li>
              <li><strong>Distribute URL:</strong> Send the link via email, Slack, or documentation to your QA team or beta users.</li>
              <li><strong>Manage Access:</strong> View all installed accounts in the active testers list below. Click revoke at any time to instantly deactivate their access.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How End-Users & Testers Use It:</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              When a tester opens your invite link, they view your app&apos;s landing page and click <em>&ldquo;Accept &amp; Install Integration&rdquo;</em>. Your custom app immediately unlocks inside their workflow builder trigger and action search pickers with a &ldquo;Private Beta&rdquo; badge, allowing them to connect credentials and run live automations.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowSharingHelpModal(false)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
