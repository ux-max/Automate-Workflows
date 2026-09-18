# Automate Workflows — Node & Action Documentation

> **Complete reference documentation for all 29 workflow nodes, their triggers, actions, field schemas, and sample outputs.**

## 📖 Documentation Index

| # | Document | Category | Nodes Covered |
|---|----------|----------|---------------|
| 1 | [Native Suite](./01-native-suite.md) | Native Apps | Automate Chats, Automate Forms |
| 2 | [Lead Capture & Forms](./02-lead-capture-forms.md) | Forms | Google Forms, Typeform |
| 3 | [CRM & Sales](./03-crm-sales.md) | CRM | HubSpot, Google Sheets, Pipedrive |
| 4 | [Communication & Notifications](./04-communication-notifications.md) | Messaging | Slack, Gmail, Telegram |
| 5 | [Commerce](./05-commerce.md) | E-Commerce | Shopify, Razorpay |
| 6 | [Scheduling & Productivity](./06-scheduling-productivity.md) | Scheduling | Google Calendar, Calendly |
| 7 | [Support](./07-support.md) | Help Desk | Freshdesk |
| 8 | [Generic Connectors](./08-generic-connectors.md) | Connectors | Webhook — Catch Hook, HTTP Request — Send |
| 9 | [Flow Control](./09-flow-control.md) | Logic & Routing | Scheduler, Filter, Router, Delay, Iterator/Loop |
| 10 | [Utilities](./10-utilities.md) | Data Transform | Text Formatter, DateTime Formatter, Number Formatter, API, Webhook, Code Runner, Lookup Table, Human in the Loop |
| 11 | [**Custom Parameters & Headers**](./11-custom-parameters-and-headers.md) | **Extensibility** | **Custom CRM Properties, HTTP Headers, Approval Context & API Flags** |
| 12 | [**How Zapier Manages 6,000+ Integrations**](./12-how-zapier-manages-thousands-of-integrations.md) | **iPaaS Architecture** | **Ecosystem Model, CLI SDKs, Token Vault, Polling Deduplication & Rate Limiting** |
| 13 | [**Application Master Plan & Gap Analysis**](./13-application-gap-analysis-and-roadmap.md) | **Product Roadmap** | **What Remains to Build (Backend, Workers, Webhooks, Billing, RBAC)** |
| 14 | [**Node Connections & Variable Mapping**](../node-connections/README.md) | **Deep Architecture** | **Auth Models, Payload Ingestion, Variable Flattening, Platform Payloads & Downstream Mapping** |
| 15 | [**Node Roles & Auth Decisions**](../node-roles-and-auth/README.md) | **System Decisions** | **Trigger-Only vs. Action-Only Rationale, Why Different Auth Types are Followed (OAuth 2.0, Webhooks, API Keys)** |
| 16 | [**Developer Platform Hub & Custom Apps**](./developer-platform/README.md) | **Developer Platform** | **App Builder, Auth Schemes, Webhooks, In-Built Actions (English & Hinglish Guides)** |
| 17 | [**Master Guide to In-Built Actions (English)**](./developer-platform/en/09-complete-inbuilt-actions-working-guide.md) | **In-Built Actions** | **6 Action Types, Multi-Step Execution Timings, Payload Hydration, Dynamic Dropdowns** |
| 18 | [**In-Built Actions Ka Master Guide (Hinglish)**](./developer-platform/hinglish/09-inbuilt-actions-ka-complete-working-guide.md) | **In-Built Actions** | **Complete Hinglish Reference: Dropdown Mapping, Webhook Hydration, 0 Task Credits** |

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                     WORKFLOW ENGINE                             │
├────────────┬───────────┬──────────────┬────────────────────────┤
│  TRIGGERS  │  ACTIONS  │ FLOW CONTROL │      UTILITIES         │
│            │           │              │                        │
│ • Instant  │ • Create  │ • Filter     │ • Text Formatter       │
│ • Polling  │ • Update  │ • Router     │ • DateTime Formatter   │
│ • Schedule │ • Send    │ • Delay      │ • Number Formatter     │
│            │ • Delete  │ • Iterator   │ • Code Runner          │
│            │ • Lookup  │ • Scheduler  │ • Lookup Table         │
│            │           │              │ • Human Approval       │
└────────────┴───────────┴──────────────┴────────────────────────┘
```

## 🔑 Key Concepts

### Node Types
| Type | Icon | Purpose |
|------|------|---------|
| **Trigger** | ⚡ | Starts a workflow when an event occurs (e.g., form submission, new order) |
| **Action** | ▶️ | Performs an operation in a connected app (e.g., send message, create contact) |
| **Filter** | 🔍 | Evaluates conditions to decide if workflow should continue |
| **Router** | 🔀 | Splits workflow into multiple parallel branches |
| **Delay** | ⏳ | Pauses workflow for a duration or until a specific time |

### Trigger Types
| Type | Description |
|------|-------------|
| **Instant** | Real-time via webhooks (e.g., WhatsApp message, Shopify order, HubSpot contact) |
| **Polling** | Checks for changes at intervals, typically 1–5 minutes (e.g., Google Sheets new row) |
| **Schedule** | Runs at predefined cron intervals (e.g., every day at 9 AM) |

### ⚡ Trigger & Webhook Architecture (Automate Workflows-Style)

Automate Workflows implements three distinct trigger operational models:

1. **Automate Workflows-Style UI Webhook Triggers (Zero Verification Required)**:
   - **Apps**: Automate Chats, Automate Forms, Shopify, Razorpay, HubSpot, Pipedrive, Freshdesk, Webhook — Catch Hook, **Google Forms**.
   - **How It Works**: When an event is selected in Step 1, the platform automatically generates a dedicated **Webhook Capture URL**. Users copy this URL and paste it into the external or native app's settings/dashboard (just like Automate Workflows Chatflow or Google Forms Apps Script in Automate Workflows).
   - **No App Registration Needed**: Users do **not** need developer account verification or marketplace approval just to receive trigger webhooks!
   - **Simple vs. Advanced Response**:
     - **Simple Response (`Yes` — Default)**: Automatically flattens nested JSON hierarchies into clean dot-notation variable tokens (e.g. `{{step_1.customer_first_name}}`, `{{step_1.full_name}}`, `{{step_1.total_amount}}`, `{{step_1.sender_phone}}`).
     - **Advanced Response (`No`)**: Keeps raw nested objects/arrays for custom scripting and advanced handling.
   - **1-Click Test Simulation**: A built-in "Simulate Test Event" button injects realistic mock payloads immediately, allowing full downstream variable mapping without waiting for a live customer transaction.

2. **API-Only Webhook Triggers (OAuth 2.0 / Bot Token)**:
   - **Apps**: Calendly, Slack, **Typeform**, Telegram.
   - **How It Works**: These apps do not require pasting a webhook URL into their dashboard. Instead, our platform connects via **OAuth 2.0** (Calendly, Slack, Typeform) or **Bot Token** (Telegram) and automatically creates the webhook subscription via background API (`POST /webhook_subscriptions`, `PUT /webhooks`, or `setWebhook`).
   - **Typeform Note**: Pure 1-click OAuth 2.0 handshake. Select form from dropdown and the webhook registers automatically.

3. **Polling & Scheduled Triggers**:
   - **Apps**: Google Sheets, Gmail, Google Calendar, Scheduler.
   - **How It Works**: Polls Google Workspace APIs at regular intervals (1–5 minutes) to detect new rows, emails, or calendar entries.

### Authentication Methods
| Method | Apps Using It |
|--------|---------------|
| **OAuth 2.0** | Google Sheets, Gmail, Slack, Google Calendar, Calendly, **Typeform**, **HubSpot (Actions)** |
| **API Key / Token** | Automate Chats, Automate Forms, Shopify, Pipedrive, Razorpay, Freshdesk, HubSpot (Fallback Private App Token) |
| **Webhook URL Trigger (Automate Workflows-Style)** | Automate Chats, Automate Forms, HubSpot, Shopify, Razorpay, Pipedrive, Freshdesk, Webhook Catch Hook, **Google Forms** |
| **Bot Token** | Telegram |
| **None** | Filter, Router, Delay, Iterator, Scheduler, Webhook, HTTP Request, Google Forms (Inbound), all Utilities |

### Variable Mapping Syntax
Fields that support `supportsMapping: true` accept dynamic variables from earlier steps:
```
{{step_1.field_name}}   →  References output of Step 1
{{step_2.email}}        →  References email field from Step 2 output
```


---

## 📊 Node Summary (29 Total)

| Node | Category | Triggers | Actions | Auth | Sync Mode |
|------|----------|:--------:|:-------:|------|-----------|
| Automate Chats | Native Suite | 4 | 5 | API Key / Token | Webhook URL |
| Automate Forms | Native Suite | 3 | 2 | API Key / Token | Webhook URL |
| Google Forms | Lead Capture & Forms | 2 | 4 | OAuth 2.0 | Polling |
| Typeform | Lead Capture & Forms | 2 | 4 | API Key | Webhook URL |
| HubSpot | CRM / Sales | 5 | 6 | Private App Token | Webhook URL |
| Google Sheets | CRM / Sales | 3 | 7 | OAuth 2.0 | Polling |
| Pipedrive | CRM / Sales | 5 | 5 | API Key | Webhook URL |
| Slack | Communication | 3 | 6 | OAuth 2.0 | Instant |
| Gmail | Communication | 3 | 5 | OAuth 2.0 | Polling |
| Telegram | Communication | 3 | 4 | Bot Token | Webhook |
| Shopify | Commerce | 5 | 5 | API Key | Webhook URL |
| Razorpay | Commerce | 4 | 4 | API Key | Webhook URL |
| Google Calendar | Scheduling | 3 | 4 | OAuth 2.0 | Polling |
| Calendly | Scheduling | 3 | 3 | OAuth 2.0 | Webhook (API) |
| Freshdesk | Support | 3 | 5 | API Key | Webhook URL |
| Webhook — Catch Hook | Generic Connectors | 1 | 0 | None | Instant |
| HTTP Request — Send | Generic Connectors | 0 | 3 | None | Instant |
| Scheduler | Flow Control | 1 | 2 | None | Instant |
| Filter | Flow Control | 0 | 3 | None | Instant |
| Router | Flow Control | 0 | 2 | None | Instant |
| Delay | Flow Control | 0 | 3 | None | Instant |
| Iterator / Loop | Flow Control | 0 | 2 | None | Instant |
| Text Formatter | Utilities | 0 | 5 | None | Instant |
| DateTime Formatter | Utilities | 0 | 4 | None | Instant |
| Number Formatter | Utilities | 0 | 5 | None | Instant |
| API | Utilities | 0 | 2 | None | Instant |
| Webhook | Utilities | 2 | 1 | None | Instant |
| Code Runner (JS/Python) | Utilities | 0 | 2 | None | Instant |
| Lookup Table | Utilities | 0 | 2 | None | Instant |
| Human in the Loop | Utilities | 0 | 2 | None | Instant |

---

*Generated on September 8, 2026 • Source: `src/lib/data.ts` & `src/lib/action-schemas.ts`*
