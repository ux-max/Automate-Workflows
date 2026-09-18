"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { DeveloperApp } from "@/lib/developer-types"
import { getAppByInviteToken, acceptInviteToken, getDeveloperApps } from "@/lib/developer-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Layers,
  ArrowRight,
  Workflow,
  Sparkles,
  Building2,
  ArrowLeft,
} from "lucide-react"

export default function PrivateInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = (params?.token as string) || ""

  const [app, setApp] = useState<DeveloperApp | null>(null)
  const [email, setEmail] = useState("user@company.com")
  const [isAccepted, setIsAccepted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const found = getAppByInviteToken(token)
    if (found) {
      setApp(found)
    } else {
      // Fallback: check if token matches any app's distribution.inviteToken or appId
      const all = getDeveloperApps()
      const match = all.find(
        (a) => a.distribution.inviteToken === token || a.id === token || a.slug === token
      )
      if (match) setApp(match)
    }
    setLoading(false)
  }, [token])

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !email) return
    acceptInviteToken(token, email)
    setIsAccepted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 text-center rounded-2xl shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Invalid or Expired Invite Link
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The private beta invitation link is no longer active, or the maximum tester capacity has been reached.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/developer">
              <Button variant="outline" size="sm" className="text-xs">
                Developer Hub
              </Button>
            </Link>
            <Link href="/apps">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                Browse Public Apps
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/developer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Developer Hub
          </Link>
          <Badge variant="outline" className="text-[10px]">
            Private Beta Invite
          </Badge>
        </div>

        {/* Invitation Card */}
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-6">

            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {app.name}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {app.tagline || app.description}
            </CardDescription>

            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs font-mono">
                v{app.version}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {app.category}
              </Badge>
              {app.author.isVerified && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Author
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {/* Author Credit */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>
                  Created by <strong>{app.author.name}</strong>
                  {app.author.company && ` (${app.author.company})`}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Private Release</span>
            </div>

            {/* Included Triggers & Actions preview */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Capabilities Included in This Connector:
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    Triggers ({app.triggers.length})
                  </div>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    {app.triggers.slice(0, 2).map((t) => (
                      <li key={t.id} className="truncate">
                        • {t.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    Actions ({app.actions.length})
                  </div>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    {app.actions.slice(0, 2).map((a) => (
                      <li key={a.id} className="truncate">
                        • {a.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Form to Accept Invitation */}
            {!isAccepted ? (
              <form onSubmit={handleAccept} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Workspace Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-xs h-9"
                    placeholder="name@company.com"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-10 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  Accept Invitation & Add to Workspace
                </Button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Successfully Installed!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    <strong>{app.name}</strong> is now available in your workflow canvas.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Link href={`/workflows/editor?app=${app.id}`} className="w-full sm:w-auto">
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5">
                      <Workflow className="w-3.5 h-3.5" />
                      Build Workflow With {app.name}
                    </Button>
                  </Link>

                  <Link href="/developer" className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Developer Hub
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
