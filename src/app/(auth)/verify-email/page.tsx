"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [resent, setResent] = useState(false)

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 text-center">
        <CardContent className="pt-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40">
            <Mail className="h-7 w-7" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Verify your email address</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We sent a verification link to <span className="font-semibold text-slate-800 dark:text-slate-200">user@company.com</span>. Click the link in your inbox to publish workflows.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 text-left space-y-1">
            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Draft Mode Available</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
              You can start building draft workflows immediately while verification completes.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-4">
          <Button
            className="w-full space-x-2"
            onClick={() => router.push("/onboarding")}
          >
            <span>Continue to Onboarding</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            onClick={() => setResent(true)}
          >
            {resent ? "Verification link resent!" : "Didn't get the email? Resend"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
