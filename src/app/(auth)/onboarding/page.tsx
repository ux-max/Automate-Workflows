"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Sparkles, MessageSquare, FileText, Users, ShoppingBag, ArrowRight, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function OnboardingPage() {
  const router = useRouter()

  const starterCards = [
    {
      id: "form-whatsapp",
      title: "Automate Form → WhatsApp Welcome",
      description: "Trigger WhatsApp welcome message on new Automate Form submissions.",
      apps: ["Automate Forms", "Automate Chats"],
      badge: "Popular Starter",
      templateId: "tpl_1"
    },
    {
      id: "whatsapp-crm",
      title: "WhatsApp Lead → HubSpot CRM Sync",
      description: "Automatically log incoming WhatsApp leads and update deals in HubSpot.",
      apps: ["Automate Chats", "HubSpot"],
      badge: "High Growth",
      templateId: "tpl_2"
    },
    {
      id: "shopify-slack",
      title: "Shopify Order → Slack & Google Sheets",
      description: "Notify sales team on Slack and record sales data in Google Sheets.",
      apps: ["Shopify", "Slack", "Google Sheets"],
      badge: "E-Commerce",
      templateId: "tpl_3"
    },
    {
      id: "scratch",
      title: "Start from Blank Canvas",
      description: "Build a custom multi-step workflow from scratch with any trigger & action.",
      apps: ["Any App"],
      badge: "Custom Builder",
      templateId: "scratch"
    }
  ]

  const handleSelect = (templateId: string) => {
    if (templateId === "scratch") {
      router.push("/workflows/editor?new=true")
    } else {
      router.push(`/workflows/editor?template=${templateId}`)
    }
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-12 px-6 md:px-12 flex flex-col items-center justify-center transition-colors">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="blue" className="px-3 py-1">Welcome to Automate Workflows</Badge>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">What do you want to automate first?</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-xs font-medium">
            Select a starter template pre-configured for your stack or open a blank canvas to build from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {starterCards.map((card) => (
            <Card
              key={card.id}
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => handleSelect(card.templateId)}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                    {card.badge}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Apps:</span>
                  <div className="flex items-center space-x-1.5">
                    {card.apps.map((app, i) => (
                      <span key={i} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-4">
          <Button
            size="lg"
            className="space-x-2"
            onClick={() => router.push("/workflows/editor?new=true")}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Open Blank Workflow Canvas</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
