"use client"

import React, { useState } from "react"
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

export default function BillingPage() {
  const [tasksUsed, setTasksUsed] = useState(2260)
  const [taskLimit, setTaskLimit] = useState(5000)
  const [currentPlan, setCurrentPlan] = useState("Starter")

  // Screen 20 State: Plan Upgrade / Checkout Modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedPlanTier, setSelectedPlanTier] = useState<"Starter" | "Pro" | "Business">("Pro")
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242")
  const [upgrading, setUpgrading] = useState(false)

  const usagePercent = Math.round((tasksUsed / taskLimit) * 100)

  const handleUpgradeCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    setUpgrading(true)
    setTimeout(() => {
      setUpgrading(false)
      if (selectedPlanTier === "Pro") {
        setCurrentPlan("Pro")
        setTaskLimit(20000)
      } else if (selectedPlanTier === "Business") {
        setCurrentPlan("Business")
        setTaskLimit(100000)
      }
      setUpgradeModalOpen(false)
    }, 800)
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      tasks: "500 / mo",
      workflows: "3 Workflows",
      steps: "Up to 5 steps/wf",
      features: ["Native Suite Connectors", "Basic Webhook", "7-day Log History"]
    },
    {
      name: "Starter",
      price: "$15/mo",
      tasks: "5,000 / mo",
      workflows: "Unlimited Workflows",
      steps: "Up to 15 steps/wf",
      features: ["All 18 MVP Connectors", "Internal Logic Free", "30-day Log History", "Standard Email Support"]
    },
    {
      name: "Pro",
      price: "$39/mo",
      tasks: "20,000 / mo",
      workflows: "Unlimited Workflows",
      steps: "Unlimited steps",
      features: ["1-min Polling", "Priority Retries", "99.9% Uptime Target", "Advanced Field Mapping"]
    },
    {
      name: "Business",
      price: "Custom",
      tasks: "Custom pooled",
      workflows: "Unlimited Workflows",
      steps: "Unlimited + Seats",
      features: ["SSO & Team Workspaces", "1-year Audit Logs", "Dedicated Account Manager", "Custom SLAs"]
    }
  ]

  const invoices = [
    { id: "INV-2026-08", date: "Aug 01, 2026", plan: "Starter Plan ($15)", status: "Paid", amount: "$15.00" },
    { id: "INV-2026-07", date: "Jul 01, 2026", plan: "Starter Plan ($15)", status: "Paid", amount: "$15.00" },
    { id: "INV-2026-06", date: "Jun 01, 2026", plan: "Starter Plan ($15)", status: "Paid", amount: "$15.00" }
  ]

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Premium Floating Pure White Main Canvas Container */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-7 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Usage Meter & Subscription Billing</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Track monthly billable action tasks. Internal logic steps (Filter, Router, Delay) are 100% free.
          </p>
        </div>

        {/* Primary Blue Button */}
        <Button size="default" className="space-x-2" onClick={() => setUpgradeModalOpen(true)}>
          <Zap className="h-4 w-4 fill-current" />
          <span>Upgrade Plan</span>
        </Button>
      </div>

      {/* 80% / 100% Usage Warning Banner (Section 9.4) */}
      {usagePercent >= 80 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Usage Alert: You have consumed {usagePercent}% of your monthly task quota</span>
              <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                At 100%, new task-consuming runs will queue automatically until upgraded or reset.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => setUpgradeModalOpen(true)}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Screen 19: Usage Meter Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Monthly Task Consumption Meter</CardTitle>
              <CardDescription className="text-xs">Current Plan: <span className="font-bold text-slate-900 dark:text-slate-100">{currentPlan} Plan</span></CardDescription>
            </div>
            <Badge variant="blue" className="text-xs">Billing Period: Aug 1 - Aug 31</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Tasks Executed: {tasksUsed.toLocaleString()} / {taskLimit.toLocaleString()}</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{usagePercent}% Consumed</span>
            </div>
            <Progress value={usagePercent} />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Internal Steps (Filters, Routers, Delays, Formatters) are <strong>FREE</strong> and unbilled.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Fair &amp; Transparent Pricing</span>
          </div>
        </CardContent>
      </Card>

      {/* Plans Comparison Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Available Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`border-2 bg-white dark:bg-slate-900 flex flex-col justify-between ${
                currentPlan === p.name ? "border-blue-600 dark:border-blue-500 shadow-md" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                  {currentPlan === p.name && <Badge variant="success">Current Plan</Badge>}
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{p.price}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{p.tasks}</p>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-700 dark:text-slate-300">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{p.workflows}</div>
                  <div className="text-slate-500 dark:text-slate-400">{p.steps}</div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 pt-2">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary Blue Button on upgrade target */}
                <Button
                  variant={currentPlan === p.name ? "outline" : "default"}
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedPlanTier(p.name as any)
                    setUpgradeModalOpen(true)
                  }}
                >
                  {currentPlan === p.name ? "Active Plan" : `Select ${p.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Billing History & Invoices</h2>
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plan Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs text-slate-700 dark:text-slate-300">{inv.id}</TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">{inv.date}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{inv.plan}</TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">{inv.amount}</TableCell>
                  <TableCell><Badge variant="success">{inv.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-xs space-x-1">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Screen 20: Plan Upgrade / Checkout Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogHeader>
          <DialogTitle>Upgrade Subscription — {selectedPlanTier} Plan</DialogTitle>
          <DialogDescription>
            Instant limit upgrade. Queued tasks resume immediately upon confirmation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpgradeCheckout} className="space-y-4 my-2">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Selected Target Tier:</span>
              <span>{selectedPlanTier} Plan</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Task Limit:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {selectedPlanTier === "Pro" ? "20,000 tasks/mo" : "100,000 tasks/mo"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Card Payment Details</label>
            <Input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setUpgradeModalOpen(false)}>
              Cancel
            </Button>
            {/* Primary Blue Button */}
            <Button type="submit" disabled={upgrading}>
              {upgrading ? "Processing Payment..." : "Confirm & Pay Upgrade"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      </div>
    </div>
  )
}
