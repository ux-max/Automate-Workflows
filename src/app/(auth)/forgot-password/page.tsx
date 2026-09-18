"use client"

import React, { useState } from "react"
import Link from "next/link"
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="pt-8 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
            <KeyRound className="h-6 w-6" />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Reset your password</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enter your email and we&apos;ll send a password reset link</p>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg flex items-start space-x-3 text-emerald-900 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Reset link sent!</span>
                <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">Check {email} for instructions to set your new password. Link expires in 24 hours.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Account Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="pt-2 justify-center">
          <Link href="/login" className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Log In</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
