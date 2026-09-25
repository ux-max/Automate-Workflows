"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout"

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<"login" | "forgot">("login")
  const [email, setEmail] = useState("user@company.com")
  const [password, setPassword] = useState("••••••••")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (email === "error@test.com") {
        setError(true)
      } else {
        router.push("/chat")
      }
    }, 600)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setTimeout(() => {
      setForgotLoading(false)
      setForgotSubmitted(true)
    }, 600)
  }

  return (
    <AuthSplitLayout>
      <div className="w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs mb-1">
            <img src="/logo.png" alt="Automate Business" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            {view === "login" ? "Log in to Automate Workflows" : "Reset your password"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {view === "login"
              ? "Access your automation canvas, workflows & connections"
              : "Enter your account email and we'll send you a password reset link"}
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-slate-200 dark:border-zinc-800 shadow-md bg-white dark:bg-zinc-900/90 backdrop-blur-sm transition-all duration-200">
          {view === "login" ? (
            <form onSubmit={handleLogin}>
              <CardContent className="pt-6 space-y-4">
                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start space-x-2.5 text-rose-800 dark:text-rose-300 text-xs">
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Invalid credentials</span>
                      <p className="text-rose-600 dark:text-rose-400 mt-0.5">Please check your email and password and try again.</p>
                    </div>
                  </div>
                )}

                {/* Google OAuth Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10.5 justify-center space-x-2.5 border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all shadow-2xs"
                  onClick={() => router.push("/chat")}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </Button>

                <div className="relative flex items-center justify-center my-2.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                  </div>
                  <span className="relative bg-white dark:bg-zinc-900 px-3 text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                    or email
                  </span>
                </div>

                {/* Work Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="work-email" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Work Email
                  </label>
                  <Input
                    id="work-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="h-10 text-xs font-medium rounded-xl border-slate-300 dark:border-zinc-700 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot")
                        setForgotSubmitted(false)
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-10 text-xs font-medium rounded-xl pr-10 border-slate-300 dark:border-zinc-700 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 space-x-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all"
                >
                  <span>{loading ? "Logging in..." : "Log In"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    Sign up free
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            /* In-place Forgot Password View */
            <div className="pt-6">
              {forgotSubmitted ? (
                <div className="space-y-5 px-6 pb-6">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start space-x-3 text-emerald-900 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-sm">Reset link sent!</span>
                      <p className="text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                        Instructions have been sent to <span className="font-semibold">{email || "your email"}</span>. Please check your inbox and spam folder. Link expires in 24 hours.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setView("login")
                      setForgotSubmitted(false)
                    }}
                    className="w-full h-11 space-x-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Log In</span>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="reset-email" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Account Email
                      </label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="h-10 text-xs font-medium rounded-xl border-slate-300 dark:border-zinc-700 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500"
                        required
                        autoFocus
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-3.5 pt-2">
                    <Button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full h-11 space-x-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all"
                    >
                      <span>{forgotLoading ? "Sending link..." : "Send Reset Link"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="inline-flex items-center justify-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors cursor-pointer py-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Log In</span>
                    </button>
                  </CardFooter>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </AuthSplitLayout>
  )
}
