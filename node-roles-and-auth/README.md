# 🧭 Node Roles & Authentication Architecture Guide

> An authoritative guide detailing why nodes in **Automate Workflows** are classified as **Trigger-Only**, **Action-Only**, or **Dual-Role**, along with the technical and architectural reasons behind each **Authentication Model** across our 30 integration nodes.

---

## 📑 Directory Navigation

| Document | Core Subject Matter |
|:---|:---|
| **[01 — Trigger-Only Nodes & Architectural Rationale](./01-trigger-only-nodes-with-reasons.md)** | In-depth analysis of nodes treated strictly as Triggers (e.g., Google Forms, Webhook Catch Hook) and why actions are disallowed or redundant. |
| **[02 — Action-Only Nodes & Pipeline Rationale](./02-action-only-nodes-with-reasons.md)** | Why flow control engines, formatters, and native utilities (12 nodes) operate exclusively as downstream Actions without triggers. |
| **[03 — Why Different Auth Types with Technical Reasons](./03-why-different-auth-types-with-reasons.md)** | Deep dive into OAuth 2.0, Webhook URLs, API Keys, Bot Tokens, and Native SSO — why each platform demands its specific auth mechanism. |

---

## 📊 Master Node Classification Matrix (30 Apps)

Automate Workflows organizes all 30 nodes into three functional roles based on data flow directionality:

```
                  ┌──────────────────────────────────────────────┐
                  │          WORKFLOW DATA LIFECYCLE             │
                  └──────────────────────────────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │   STEP 1: TRIGGERS     │                     │   STEP 2+: ACTIONS     │
     │   (Event Initiation)   │                     │   (Execution & Writes) │
     └────────────────────────┘                     └────────────────────────┘
                 │                                               │
     ┌───────────┴───────────┐                       ┌───────────┴───────────┐
     ▼                       ▼                       ▼                       ▼
┌──────────────┐     ┌──────────────┐         ┌──────────────┐     ┌──────────────┐
│ TRIGGER-ONLY │     │  DUAL-ROLE   │         │  DUAL-ROLE   │     │ ACTION-ONLY  │
│ (2 Nodes)    │     │  (16 Nodes)  │         │  (16 Nodes)  │     │ (12 Nodes)   │
└──────────────┘     └──────────────┘         └──────────────┘     └──────────────┘
```

### Complete Classification Table

| # | Node / Platform | Role | Triggers Count | Actions Count | Primary Auth Type | Sync Mode |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 1 | **Google Forms** | **Trigger-Only** | 2 | **0** | None (Webhook URL) | Instant Webhook |
| 2 | **Webhook — Catch Hook** | **Trigger-Only** | 1 | **0** | None (Webhook URL) | Instant Webhook |
| 3 | **Filter** | **Action-Only** | **0** | 3 | None (Native) | Instant Container |
| 4 | **Router** | **Action-Only** | **0** | 2 | None (Native) | Instant Container |
| 5 | **Delay** | **Action-Only** | **0** | 3 | None (Native) | Instant Container |
| 6 | **Iterator / Loop** | **Action-Only** | **0** | 2 | None (Native) | Instant Container |
| 7 | **Text Formatter** | **Action-Only** | **0** | 5 | None (Native) | Instant Container |
| 8 | **DateTime Formatter** | **Action-Only** | **0** | 4 | None (Native) | Instant Container |
| 9 | **Number Formatter** | **Action-Only** | **0** | 5 | None (Native) | Instant Container |
| 10 | **HTTP Request — Send** | **Action-Only** | **0** | 3 | None (Native) | Instant Container |
| 11 | **API (Custom HTTP/GraphQL)** | **Action-Only** | **0** | 2 | None (Native) | Instant Container |
| 12 | **Code Runner (JS/Python)** | **Action-Only** | **0** | 2 | None (Native) | Instant Container |
| 13 | **Lookup Table** | **Action-Only** | **0** | 2 | None (Native) | Instant Container |
| 14 | **Human in the Loop** | **Action-Only** | **0** | 2 | None (Native) | Instant Container |
| 15 | **Automate Chats (WhatsApp)** | **Dual-Role** | 4 | 5 | API Key / Token | Webhook / API |
| 16 | **Automate Forms** | **Dual-Role** | 3 | 2 | API Key / Token | Webhook / API |
| 17 | **Typeform** | **Dual-Role** | 2 | 4 | **OAuth 2.0** | Instant OAuth / API |
| 18 | **HubSpot CRM** | **Dual-Role** | 5 | 6 | **OAuth 2.0** (Actions) / None (Trigger) | Webhook / OAuth API |
| 19 | **Google Sheets** | **Dual-Role** | 3 | 7 | **OAuth 2.0** | Polling / API |
| 20 | **Gmail** | **Dual-Role** | 3 | 5 | **OAuth 2.0** | Polling / API |
| 21 | **Slack** | **Dual-Role** | 3 | 6 | **OAuth 2.0** | Instant OAuth / API |
| 22 | **Google Calendar** | **Dual-Role** | 3 | 4 | **OAuth 2.0** | Polling / API |
| 23 | **Calendly** | **Dual-Role** | 3 | 3 | **OAuth 2.0** | Instant OAuth / API |
| 24 | **Shopify** | **Dual-Role** | 5 | 5 | API Key / Token (Actions) / None (Trigger) | Webhook / API |
| 25 | **Razorpay** | **Dual-Role** | 4 | 4 | API Key / Token (Actions) / None (Trigger) | Webhook / API |
| 26 | **Pipedrive** | **Dual-Role** | 5 | 5 | API Key / Token (Actions) / None (Trigger) | Webhook / API |
| 27 | **Telegram** | **Dual-Role** | 3 | 4 | **Bot Token** | Webhook / API |
| 28 | **Freshdesk** | **Dual-Role** | 3 | 5 | API Key / Token (Actions) / None (Trigger) | Webhook / API |
| 29 | **Scheduler** | **Dual-Role** | 1 | 2 | None (Native) | Instant Cron / Engine |
| 30 | **Webhook (Generic)** | **Dual-Role** | 2 | 1 | None (Native) | Instant Webhook |

---

## 🔐 The 5 Authentication Tiers Summary

| Tier | Auth Protocol | Target Nodes | Core Architectural Rationale |
|:---:|:---|:---|:---|
| **Tier 1** | **OAuth 2.0 Handshake** | Google Sheets, Gmail, Slack, Google Calendar, Calendly, **Typeform**, **HubSpot (Actions)** | **Multi-tenant security & zero password exposure.** Platform delegates identity to Google / Slack / HubSpot auth servers. Provides scoped access (`forms:read`, `crm.objects.contacts.write`) and auto-refreshing bearer tokens. |
| **Tier 2** | **Automate Workflows-Style Webhook URL (Zero Auth)** | Google Forms (Inbound), Webhook Catch Hook, Shopify (Trigger), Razorpay (Trigger), HubSpot (Trigger) | **Server vs. Client Inversion.** The external service pushes HTTP POST data *into* our listener. We are the receiving server; zero developer marketplace registration or OAuth credentials are required to accept inbound payloads. |
| **Tier 3** | **API Key / Secret Token** | Automate Chats, Automate Forms, Shopify, Razorpay, Pipedrive, Freshdesk, HubSpot (Private Token) | **Direct Server-to-Server Outbound Writes.** High-performance static credential injection (`Bearer <token>`, `Basic base64(key:secret)`) without requiring end-user browser popups or interactive redirects. |
| **Tier 4** | **Bot Token** | Telegram | **Bot-Centric Identity Model.** Telegram separates human users from automated agents. Bot tokens issued by `@BotFather` provide complete isolated API authority over that specific bot. |
| **Tier 5** | **Native Workspace SSO / None** | Filter, Router, Delay, Iterator, Formatters, Code Runner, Human in the Loop | **Local Execution Container.** Modules execute entirely inside our runtime cluster. They require zero external network requests or third-party authentication. |

---

*Continue to: [01 — Trigger-Only Nodes & Architectural Rationale →](./01-trigger-only-nodes-with-reasons.md)*
