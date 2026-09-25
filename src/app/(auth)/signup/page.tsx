"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout"

const ROLE_OPTIONS = [
  { value: "IT", label: "IT" },
  { value: "Engineering", label: "Engineering" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Operations", label: "Operations" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "Security", label: "Security & Compliance" },
  { value: "Executive", label: "Executive / Leadership" },
  { value: "Other", label: "Other" }
]

export default function SignUpPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [profileRole, setProfileRole] = useState("IT")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }
    setPasswordError("")
    setLoading(true)

    try {
      if (firstName.trim()) localStorage.setItem("user_profile_firstName", firstName.trim())
      if (lastName.trim()) localStorage.setItem("user_profile_lastName", lastName.trim())
      if (email.trim()) localStorage.setItem("user_profile_email", email.trim())
      if (company.trim()) localStorage.setItem("user_profile_company", company.trim())
      if (profileRole) localStorage.setItem("user_profile_role", profileRole)
      // Automatically detect and save the user's local timezone
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"
      localStorage.setItem("user_profile_timezone", localTz)
    } catch {
      // ignore
    }

    setTimeout(() => {
      setLoading(false)
      router.push("/verify-email")
    }, 600)
  }

  return (
    <AuthSplitLayout>
      <div className="w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs mb-1">
            <img src="/logo.png" alt="Automate Business" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            Create your Automate account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Connect apps & automate workflows in minutes
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-slate-200 dark:border-zinc-800 shadow-md bg-white dark:bg-zinc-900/90 backdrop-blur-sm">
          <form onSubmit={handleSignUp}>
            <CardContent className="pt-6 space-y-3.5">
              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 justify-center space-x-2.5 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium rounded-xl transition-all"
                onClick={() => router.push("/onboarding")}
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

              {/* Name Row: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    First name <span className="font-normal text-slate-400 dark:text-slate-500">(required)</span>
                  </label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-10 text-xs font-medium rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Last name
                  </label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-10 text-xs font-medium rounded-xl"
                  />
                </div>
              </div>

              {/* Work Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Work Email <span className="font-normal text-slate-400 dark:text-slate-500">(required)</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="h-10 text-xs font-medium rounded-xl"
                  required
                />
              </div>

              {/* Company & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Company
                  </label>
                  <Input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="h-10 text-xs font-medium rounded-xl placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Role
                  </label>
                  <Select
                    value={profileRole}
                    onValueChange={setProfileRole}
                    className="h-10 text-xs font-medium rounded-xl"
                    options={ROLE_OPTIONS}
                  />
                </div>
              </div>

              {/* Password & Confirm Password Row: Placed close to each other */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Password <span className="font-normal text-slate-400 dark:text-slate-500">(required)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (passwordError) setPasswordError("")
                        }}
                        placeholder="At least 8 characters"
                        className="h-10 text-xs font-medium rounded-xl pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Confirm Password <span className="font-normal text-slate-400 dark:text-slate-500">(required)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (passwordError) setPasswordError("")
                        }}
                        placeholder="Re-enter password"
                        className={`h-10 text-xs font-medium rounded-xl pr-10 ${
                          passwordError ? "border-rose-500 focus-visible:ring-rose-400" : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Match / Error Indicator */}
                {passwordError ? (
                  <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                    ✗ {passwordError}
                  </p>
                ) : confirmPassword && password ? (
                  <p className={`text-[11px] font-medium ${
                    password === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                  }`}>
                    {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                ) : null}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" disabled={loading} className="w-full h-11 space-x-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20">
                <span>{loading ? "Creating Account..." : "Create Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Log In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthSplitLayout>
  )
}
