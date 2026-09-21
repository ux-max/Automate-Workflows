"use client"

import React, { useState, useEffect } from "react"
import { DeveloperApp, AppMonitoringMetrics } from "@/lib/developer-types"
import { getAppMonitoringMetrics } from "@/lib/developer-data"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"
import {
  Activity,
  Zap,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  BarChart3,
  Flame,
  ShieldCheck,
  Server,
  ArrowUpRight,
  ExternalLink,
  RotateCw
} from "lucide-react"

interface MonitoringTabProps {
  app: DeveloperApp
  onChange: (updated: DeveloperApp) => void
  onNavigateToHistory?: () => void
}

export function MonitoringTab({ app, onChange, onNavigateToHistory }: MonitoringTabProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")
  const [metrics, setMetrics] = useState<AppMonitoringMetrics | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setMetrics(getAppMonitoringMetrics(app.id))
  }, [app.id])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setMetrics(getAppMonitoringMetrics(app.id))
      setIsRefreshing(false)
    }, 600)
  }

  if (!metrics) return null

  // Calculate chart max height scaling
  const maxInvocations = Math.max(...metrics.hourlyTimeSeries.map((t) => t.success + t.errors), 3000)

  return (
    <div className="space-y-5 w-full animate-in fade-in duration-200">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Telemetry & Monitoring
            </h2>
            <Badge variant="success" className="text-[10px] font-medium space-x-1 py-0 px-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational</span>
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            API performance, request volume, error rates, and quota telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
            {(["24h", "7d", "30d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  timeRange === range
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="h-8 px-2.5 text-xs font-normal space-x-1 border-slate-200 dark:border-slate-800"
            title="Refresh Live Metrics"
          >
            <RotateCw className={`h-3 w-3 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Invocations */}
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Invocations ({timeRange})
            </span>
            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline space-x-1.5">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {metrics.totalInvocations24h.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              +{metrics.totalInvocationsTrendPercent}%
            </span>
          </div>
        </Card>

        {/* Card 2: Success Rate */}
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Success Rate
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.successRatePercent}%
            </span>
            <Badge variant="success" className="text-[10px] px-1 py-0 font-medium">
              Healthy
            </Badge>
          </div>
        </Card>

        {/* Card 3: Average Latency */}
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Avg Latency (P50)
            </span>
            <div className="h-6 w-6 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {metrics.avgLatencyMs}ms
            </span>
            <span className="text-xs font-mono text-slate-400">P95: {metrics.p95LatencyMs}ms</span>
          </div>
        </Card>

        {/* Card 4: Rate Limit & Quota */}
        <Card className="p-3.5 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Quota Usage
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Gauge className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {metrics.rateLimitUsagePercent}%
            </span>
          </div>
          <div className="mt-2">
            <Progress value={metrics.rateLimitUsagePercent} className="h-1" />
          </div>
        </Card>
      </div>

      {/* SECTION 2: TIME-SERIES INVOCATIONS CHART */}
      <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Hourly Throughput & Error Distribution
              </CardTitle>
            </div>
            <div className="flex items-center space-x-3 text-xs font-normal">
              <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-xs bg-blue-600" />
                <span>Success</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-xs bg-red-500" />
                <span>Errors</span>
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {/* Responsive Bar Chart Visualizer */}
          <div className="h-36 flex items-end justify-between gap-3 pt-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            {metrics.hourlyTimeSeries.map((point, idx) => {
              const total = point.success + point.errors
              const heightPercent = Math.max(8, Math.min(100, (total / maxInvocations) * 100))
              const errorHeightPercent = point.errors > 0 ? Math.max(4, (point.errors / total) * 100) : 0

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Hover Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                    <div>{point.hour}: {point.success} ok / {point.errors} err ({point.latencyMs}ms)</div>
                  </div>

                  {/* Combined Bar */}
                  <div
                    className="w-full max-w-[28px] bg-blue-500/80 hover:bg-blue-600 rounded-t transition-all relative overflow-hidden flex flex-col justify-end"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {point.errors > 0 && (
                      <div
                        className="w-full bg-red-500 shrink-0"
                        style={{ height: `${errorHeightPercent}%` }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1.5 block">
                    {point.hour}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: COMPONENT BREAKDOWN & HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2/3): Endpoint Breakdown Table */}
        <Card className="lg:col-span-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Endpoint Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400">Component</TableHead>
                  <TableHead className="w-[100px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Calls</TableHead>
                  <TableHead className="w-[90px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Error %</TableHead>
                  <TableHead className="w-[110px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Avg Latency</TableHead>
                  <TableHead className="w-[110px] whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">Last Call</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.endpointBreakdown.map((ep, i) => (
                  <TableRow key={i} className="border-slate-100 dark:border-slate-800/80">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {ep.type === "action" ? (
                          <Layers className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        ) : ep.type === "trigger" ? (
                          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                          {ep.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {ep.calls24h.toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={ep.errorRatePercent === 0 ? "success" : ep.errorRatePercent < 1 ? "blue" : "destructive"}
                        className="text-[10px] font-medium"
                      >
                        {ep.errorRatePercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {ep.avgLatencyMs}ms
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{ep.lastExecuted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column (1/3): Top Failing Errors Monitor */}
        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col">
          <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Top Incidents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {metrics.topErrors.map((err, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-red-50/60 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 rounded-lg space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="text-[9px] font-medium">
                      HTTP {err.code}
                    </Badge>
                    <span className="text-[10px] font-normal text-red-600 dark:text-red-400">
                      {err.occurrences} events
                    </span>
                  </div>
                  <p className="text-xs font-normal text-red-900 dark:text-red-300 line-clamp-1">
                    {err.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block">{err.lastSeen}</span>
                </div>
              ))}
            </div>

            {onNavigateToHistory && (
              <Button
                variant="outline"
                onClick={onNavigateToHistory}
                className="w-full text-xs font-normal space-x-1 mt-2 h-7 border-slate-200 dark:border-slate-800"
              >
                <span>View in History</span>
                <ArrowUpRight className="h-3 w-3 text-slate-400" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
