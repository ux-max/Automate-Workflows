"use client"

import React, { useState } from "react"

interface AppIconProps {
  appId?: string
  appName?: string
  className?: string
  size?: number
}

const APP_BRAND_MAP: Record<string, { slug: string; color: string; label: string }> = {
  gmail: { slug: "gmail", color: "EA4335", label: "Gmail" },
  mail: { slug: "gmail", color: "EA4335", label: "Gmail" },
  shopify: { slug: "shopify", color: "7AB55C", label: "Shopify" },
  razorpay: { slug: "razorpay", color: "0C2340", label: "Razorpay" },
  razor: { slug: "razorpay", color: "0C2340", label: "Razorpay" },
  calendar: { slug: "googlecalendar", color: "4285F4", label: "Google Calendar" },
  googlecalendar: { slug: "googlecalendar", color: "4285F4", label: "Google Calendar" },
  calendly: { slug: "calendly", color: "006BFF", label: "Calendly" },
  sheet: { slug: "googlesheets", color: "0F9D58", label: "Google Sheets" },
  googlesheets: { slug: "googlesheets", color: "0F9D58", label: "Google Sheets" },
  gform: { slug: "googleforms", color: "7248B9", label: "Google Forms" },
  googleform: { slug: "googleforms", color: "7248B9", label: "Google Forms" },
  pipedrive: { slug: "pipedrive", color: "040926", label: "Pipedrive" },
  telegram: { slug: "telegram", color: "26A5E4", label: "Telegram" },
  typeform: { slug: "typeform", color: "262627", label: "Typeform" },
  hubspot: { slug: "hubspot", color: "FF7A59", label: "HubSpot" },
  freshdesk: { slug: "freshdesk", color: "00B8D9", label: "Freshdesk" },
  chat: { slug: "whatsapp", color: "25D366", label: "WhatsApp" },
  whatsapp: { slug: "whatsapp", color: "25D366", label: "WhatsApp" },
  notion: { slug: "notion", color: "000000", label: "Notion" },
  airtable: { slug: "airtable", color: "18BFFF", label: "Airtable" },
  stripe: { slug: "stripe", color: "635BFF", label: "Stripe" },
  salesforce: { slug: "salesforce", color: "00A1E0", label: "Salesforce" },
  discord: { slug: "discord", color: "5865F2", label: "Discord" },
  zoom: { slug: "zoom", color: "2D8CFF", label: "Zoom" }
}

export function AppIcon({ appId, appName, className = "", size = 24 }: AppIconProps) {
  const [imgError, setImgError] = useState(false)
  const id = (appId || appName || "").toLowerCase().replace(/[^a-z0-9]/g, "")

  // 1. OFFICIAL SLACK 4-COLOR HASHTAG LOGO (Vector SVG)
  if (id.includes("slack")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.523v-2.52h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
      </svg>
    )
  }

  // Webhook / HTTP / Scheduler Custom Icons
  if (id.includes("webhook") || id.includes("catch")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#009688" />
        <path d="M7 8l5-4 5 4M12 4v9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="8" r="2" fill="#FFFFFF" />
        <circle cx="17" cy="8" r="2" fill="#FFFFFF" />
        <circle cx="12" cy="16" r="2.5" fill="#FFFFFF" />
      </svg>
    )
  }

  if (id.includes("http") || id.includes("request") || id.includes("api")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#2563EB" />
        <circle cx="12" cy="12" r="7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M5 12h14M12 5a10 10 0 0 1 0 14 10 10 0 0 1 0-14z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
      </svg>
    )
  }

  if (id.includes("schedule") || id.includes("cron")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#F59E0B" />
        <circle cx="12" cy="12" r="7" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <polyline points="12 8 12 12 15 14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }

  if (id.includes("automateform") || (id.includes("automate") && id.includes("form"))) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#2563EB" />
        <path d="M7 6h10v2H7V6zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="#FFFFFF" />
      </svg>
    )
  }

  // OFFICIAL WHATSAPP / AUTOMATE CHATS BRAND VECTOR ICON
  if (id.includes("whatsapp") || id.includes("automatechat") || (id.includes("automate") && id.includes("chat"))) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <path
          d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m-3.53 3.41c-.2 0-.42.01-.61.02-.24.01-.52.09-.76.35-.24.26-.94.92-.94 2.24s.96 2.6 1.09 2.78c.13.17 1.86 2.85 4.52 3.99.63.27 1.13.43 1.51.56.63.2 1.21.17 1.66.11.51-.08 1.56-.64 1.78-1.26.22-.62.22-1.15.15-1.26-.06-.11-.24-.18-.51-.31-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.15.18-.26.27-.43.09-.18.04-.33-.02-.47-.07-.13-.6-1.45-.82-1.99-.22-.52-.44-.45-.61-.46h-.52Z"
          fill="#25D366"
        />
      </svg>
    )
  }

  // --- FLOW CONTROL CORE APPS ---
  if (id.includes("filter")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#3B82F6" />
        <path d="M4 6h16l-6 7v6l-4 2v-8L4 6z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  }

  if (id.includes("router") || id.includes("branch")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#8B5CF6" />
        <circle cx="6" cy="18" r="2" fill="#FFFFFF" />
        <circle cx="18" cy="6" r="2" fill="#FFFFFF" />
        <circle cx="18" cy="18" r="2" fill="#FFFFFF" />
        <path d="M8 18h4a4 4 0 004-4V8" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M8 18h8" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (id.includes("delay")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#F59E0B" />
        <path d="M7 5h10M7 19h10M8 5v4l4 3 4-3V5M8 19v-4l4-3 4 3v4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  }

  if (id.includes("iterator") || id.includes("loop")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#EC4899" />
        <path d="M17 2l4 4-4 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M3 11v-1a4 4 0 014-4h14M7 22l-4-4 4-4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M21 13v1a4 4 0 01-4 4H3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  }

  // --- UTILITIES CORE APPS ---
  if (id.includes("text") && id.includes("format")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#10B981" />
        <path d="M6 6h12M12 6v12M9 18h6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (id.includes("date") || id.includes("datetime")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#6366F1" />
        <rect x="5" y="7" width="14" height="12" rx="2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M16 4v4M8 4v4M5 11h14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (id.includes("number") && id.includes("format")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#14B8A6" />
        <path d="M7 6h10M7 12h10M7 18h10M12 6v12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (id.includes("code") || id.includes("runner")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#0284C7" />
        <path d="M8 10l-3 2 3 2M16 10l3 2-3 2M14 7l-4 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (id.includes("lookup") || id.includes("table")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#D97706" />
        <rect x="5" y="5" width="14" height="14" rx="2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M5 10h14M11 5v14" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    )
  }

  if (id.includes("human") || id.includes("approval")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <rect width="24" height="24" rx="6" fill="#6D28D9" />
        <circle cx="10" cy="9" r="3" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M4 18c0-3 3-4 6-4s6 1 6 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M16 11l2 2 4-4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  // Find matching brand key
  const matchKey = Object.keys(APP_BRAND_MAP).find((key) => id.includes(key))
  const brand = matchKey ? APP_BRAND_MAP[matchKey] : null

  // Use official CDN SVG logo if brand is recognized and imgError is false
  if (brand && !imgError) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`}
        alt={brand.label}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`shrink-0 object-contain ${className}`}
        onError={() => setImgError(true)}
        loading="eager"
      />
    )
  }

  // Fallback to crisp colored SVG badge
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <rect width="24" height="24" rx="6" fill={brand ? `#${brand.color}` : "#2563EB"} />
      <text x="12" y="16" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
        {(appName || appId || "A").charAt(0).toUpperCase()}
      </text>
    </svg>
  )
}
