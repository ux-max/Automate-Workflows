# Application Master Plan & Gap Analysis (Excluding Developer Platform)

> **Comprehensive audit and milestone roadmap detailing everything remaining to take Automate Workflows from its current interactive UI state to an enterprise-grade, production-ready SaaS automation engine (aligned with the Automate Workflows PRD).**

---

## 📌 Executive Summary

Our current platform has achieved an **industry-grade frontend UI and visual canvas engine**:
- Complete 2D infinite canvas with vertical & horizontal auto-layouts, pan, zoom, and minimap.
- Multi-branch Router engine (Route A, B, C... with custom names and multi-rule AND/OR conditions).
- Standalone Filter steps, Delay steps, and Iterators.
- 29 app schemas with dynamic action switching, field mapping, and keyboard `/` Variable Picker.
- Automate Workflows-style Webhook Capture URLs with step-by-step guides and 1-click test simulation.
- Universal **Custom Parameters & Headers** for zero-code CRM custom fields and HTTP headers.
- Interactive drawers for Human in the Loop approval email preview, test response modals, and connections manager.
- Fully interactive Filter Popovers across all data tables (Dashboard, Workflows, History, Connections, Templates, Settings, Apps).

**What remains** is the transition from **in-memory UI simulation** to a **production-hardened distributed backend system**, complete with real database persistence, asynchronous execution workers, live webhook ingestion, team collaboration, and automated billing enforcement.

---

## 🗺️ The 6 Core Missing Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REMAINING ARCHITECTURE ROADMAP                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 1: BACKEND PERSISTENCE & REST APIS                                   │
│  • PostgreSQL + Prisma ORM (Workflows, Steps, Runs, Credentials, Users)     │
│  • Next.js Server Route Handlers (/api/workflows, /api/connections)         │
│  • Real Dynamic API Proxies (Fetching live Google Sheets, Slack channels)   │
│                                                                             │
│  LAYER 2: ASYNCHRONOUS EXECUTION ENGINE & QUEUE WORKER                      │
│  • Distributed Task Queue (BullMQ / Redis or Temporal)                      │
│  • Live Public Webhook Ingestion Service (/api/webhooks/[id] with HMAC)     │
│  • Polling Daemon (1–5 min cron for Google Sheets, Gmail, deduplication)   │
│  • Runtime Variable Interpolator & Step Execution Pipeline                  │
│                                                                             │
│  LAYER 3: MISSING PRD SCREENS & UX FLOWS                                    │
│  • Interactive Onboarding Wizard (/onboarding)                              │
│  • Team Collaboration & Multi-Tenancy (RBAC: Admin, Member, Read-Only)     │
│  • Canvas History: Undo/Redo (Ctrl+Z) & JSON Export/Import                  │
│  • Single App Deep-Dive Pages (/apps/[appId]) & Template Preview Modal      │
│                                                                             │
│  LAYER 4: ERROR RECOVERY, RETRIES & ALERTING                                │
│  • Configurable Auto-Retry with Exponential Backoff (1m, 5m, 15m)           │
│  • Live Failure Alerting via Email, Slack & In-App Webhook Notification     │
│  • Dead-Letter Queue (DLQ) & 1-Click Run Replay with same/modified payload  │
│                                                                             │
│  LAYER 5: REAL BILLING, STRIPE INTEGRATION & QUOTA ENFORCEMENT              │
│  • Real Payment Gateway Webhooks (Stripe / Razorpay Subscription Handlers)  │
│  • Soft Limit Warning Banners (80%, 90%) & Hard Limit Auto-Pause at 100%    │
│  • Automated Invoicing & PDF Receipt Generation                             │
│                                                                             │
│  LAYER 6: SECURITY, VAULT ENCRYPTION & SYSTEM OBSERVABILITY                 │
│  • Envelope Encryption (AES-256 GCM) for OAuth Refresh Tokens & API Keys    │
│  • Automated Silent OAuth 2.0 Refresh Daemon on HTTP 401                    │
│  • Cloudflare Webhook Rate-Limiting & DDoS Shield                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Layer-by-Layer Detailed Breakdown

---

### Layer 1: Backend Persistence & REST APIs
*Current Status: All workflows, folders, connections, and runs reside in client React state (`INITIAL_WORKFLOWS`, `INITIAL_RUN_HISTORY`).*

#### 1. Database Schema & ORM (PostgreSQL + Prisma / Drizzle)
- **`User` & `Workspace`**: Multi-tenant isolation; each workflow belongs to a workspace.
- **`Workflow`**: `id`, `name`, `status` (`On` | `Off` | `Draft`), `folder_id`, `created_at`, `updated_at`.
- **`WorkflowStep`**: `id`, `workflow_id`, `step_order`, `type`, `app_id`, `event_id`, `field_mappings` (JSONB), `custom_parameters` (JSONB), `routes` (JSONB).
- **`Connection`**: `id`, `workspace_id`, `app_id`, `auth_type`, `account_label`, `status`, `last_used_at`.
- **`EncryptedCredential`**: AES-256 encrypted access tokens, refresh tokens, and API keys stored separately from connection metadata.
- **`WorkflowRun`**: `id`, `workflow_id`, `status` (`success` | `error` | `running` | `queued`), `execution_duration_ms`, `triggered_by`, `started_at`, `completed_at`.
- **`StepRun`**: `id`, `run_id`, `step_id`, `status`, `input_payload` (JSONB), `output_payload` (JSONB), `error_message`, `duration_ms`.

#### 2. Server-Side REST Route Handlers (`src/app/api/`)
- `GET/POST /api/workflows`: List, filter, and create workflows.
- `GET/PUT/DELETE /api/workflows/[id]`: Retrieve, update step configurations, and delete.
- `GET/POST /api/connections`: Manage OAuth connections and API keys.
- `GET/POST /api/runs`: Fetch paginated execution logs and inspect step payloads.
- **Live Dynamic Dropdown Proxy (`/api/proxy/[appId]/[resource]`)**:
  - Secure server-side proxy that calls external APIs using the user's stored token to populate dropdowns (e.g. `GET /api/proxy/google-sheets/spreadsheets`, `GET /api/proxy/slack/channels`, `GET /api/proxy/hubspot/contact-lists`).

---

### Layer 2: Asynchronous Execution Engine & Queue Worker
*Current Status: Step execution is simulated with client-side timers (`setTimeout`).*

#### 1. Distributed Task Queue (BullMQ + Redis)
- **Decoupled Architecture**: Webhook ingestion must return `HTTP 200 OK` in <50ms without waiting for downstream steps (e.g., waiting 5 seconds for a slow CRM API).
- Incoming events are pushed as jobs onto Redis queues:
  - `workflow:triggers` (High priority)
  - `workflow:actions` (Standard concurrency workers)
  - `workflow:retries` (Delayed retry queue with backoff)
  - `workflow:delays` (Scheduled jobs waiting for 1h, 24h, or 7d)

#### 2. Public Webhook Receiver (`POST /api/webhooks/[webhookId]`)
- Permanent, high-availability endpoint accepting incoming POST/GET requests.
- **Signature Verification**:
  - Shopify: `X-Shopify-Hmac-Sha256` validation.
  - Razorpay: `X-Razorpay-Signature` validation.
  - Typeform: `Typeform-Signature` validation.
- Payload normalization and immediate dispatch into the BullMQ trigger queue.

#### 3. Polling Worker Daemon (Cron Engine)
- Recurring job running every 1–5 minutes (based on plan tier: Free = 15m, Starter = 5m, Pro = 1m).
- Polls Google Sheets (`spreadsheets.values.get`), Gmail (`users.messages.list`), and Google Calendar.
- **Redis Deduplication Hash Cache**: Compares retrieved record IDs against `seen_ids:{workflow_id}`. Only unvisited row/message IDs are emitted as new workflow execution jobs.

#### 4. Step Pipeline Interpreter & Token Resolver
- Sequentially resolves dynamic tokens (`{{step_1.email}}`) against prior step outputs.
- Evaluates Filter conditions (`gt`, `lte`, `contains`, `equals`, `not_empty`).
- Evaluates Router branches, executing parallel or isolated route paths.
- Handles Iterator loops over array items.
- Manages **Human in the Loop** approval pauses, persisting task records until an external approval click is received.

---

### Layer 3: Missing PRD Screens & User Experience Flows
*Current Status: Core screens exist; specific onboarding, workspace, and canvas utility screens outlined in the PRD are pending.*

| Screen / Feature | PRD Reference | Description & Purpose |
|---|---|---|
| **First-Run Onboarding Wizard** | Section 9.1 | `/onboarding`: 3-step interactive questionnaire asking user role, company size, and primary apps used to personalize template recommendations. |
| **Email Verification Screen** | Section A (Screen 4) | `/verify-email`: Clean verification card waiting for 6-digit OTP or magic link confirmation. |
| **Password Reset Form** | Section A (Screen 5) | `/reset-password?token=...`: New password confirmation input with real-time strength meter. |
| **Team Members & RBAC** | Section 9.5 & Settings | Invite teammates by email, role assignments (`Owner`, `Admin`, `Member`, `Viewer`), and team audit logs. |
| **Workspace Switcher** | Section 5.1 | Dropdown in top navigation allowing seamless switching between Personal and Organization workspaces. |
| **Canvas Undo / Redo** | Section 8.3 | Keyboard `Ctrl+Z` / `Ctrl+Y` history stack on workflow canvas to reverse accidental node deletion or config edits. |
| **Workflow Export & Import (JSON)** | Section 8.3 | 1-Click "Export Workflow as JSON" and "Import Workflow" modal to share blueprints across accounts. |
| **Canvas Sticky Notes / Annotations** | Section 8.3 | Sticky note nodes allowing engineers to leave documentation notes directly on the workflow canvas. |
| **App Detail Single Pages** | Section F (Screen 17) | `/apps/[appId]`: Dedicated SEO-friendly page for each app displaying all available triggers, actions, auth types, and popular templates. |
| **Template Preview Modal** | Section F (Screen 16) | Clicking a template opens an interactive modal previewing the exact step sequence and required connections before cloning. |

---

### Layer 4: Error Recovery, Auto-Retries & Alerting
*Current Status: UI shows error badges and retry buttons, but automated server-side error recovery is not yet wired.*

#### 1. Configurable Auto-Retry Policy (Per-Workflow)
- Allow users to configure retry strategies in Workflow Settings:
  - **No Retry**: Fail immediately on error.
  - **Smart Retry**: Retry 3 times at 1m, 5m, 15m intervals (ideal for transient network timeouts or 5xx server errors).
  - **Exponential Backoff**: For rate-limited APIs (`HTTP 429`).

#### 2. Multi-Channel Failure Alerting
- Real-time alert dispatch when a workflow encounters an unrecoverable failure:
  - **Email Alert**: Direct notification to the workflow owner or team alert address.
  - **Slack / Teams Webhook**: Instant notification posted to an engineering alert channel with a direct link to the failed run log.
  - **In-App Notification Center**: Bell icon badge in top navigation showing recent failures.

#### 3. Dead Letter Queue (DLQ) & 1-Click Replay
- Execution logs store the exact raw trigger payload in the database.
- If an action fails due to a temporary third-party API outage, users can click **"Replay Run with Original Payload"** without asking the customer to re-submit the form or re-trigger the event.

---

### Layer 5: Real Billing, Payment Gateway & Quota Enforcement
*Current Status: Billing UI renders plan cards, progress bar, and simulated checkout modal.*

#### 1. Payment Gateway Webhook Integration (Stripe / Razorpay)
- Real checkout session creation via Stripe Billing or Razorpay Subscriptions.
- Inbound webhook handler listening for:
  - `checkout.session.completed` → Upgrade user plan and set new monthly task limit.
  - `invoice.payment_succeeded` → Reset monthly task counter and generate PDF receipt.
  - `customer.subscription.deleted` → Gracefully downgrade to Free tier.

#### 2. Automated Quota Enforcement Engine
- **Task Metering**: Every successfully executed action step increments the workspace's monthly task counter (Triggers, Filters, and Routers are typically free, matching Automate Workflows/Zapier standards).
- **Soft Limit Warnings**:
  - At **80% quota**: Warning banner on Dashboard and notification email.
  - At **90% quota**: Urgent warning banner.
- **Hard Limit Reached (100%)**:
  - Automatically pause active workflows.
  - Display non-intrusive upgrade modal: *"Task quota exhausted for this billing cycle. Upgrade your plan to resume automatic workflows immediately."*

---

### Layer 6: Security, Vault Encryption & Compliance
*Current Status: Tokens and credentials stored in plain state.*

#### 1. Envelope Encryption for Credentials
- Implement AWS KMS or HashiCorp Vault envelope encryption:
  - Master key encrypts data encryption keys (DEK).
  - All stored OAuth refresh tokens, client secrets, and API keys are encrypted at rest using AES-256-GCM.
  - Plaintext credentials never appear in server logs or browser network responses.

#### 2. Automated Silent OAuth Token Refresh Daemon
- When an action step encounters an `HTTP 401 Unauthorized` or token expiration:
  - The worker halts for <150ms.
  - Calls provider token refresh endpoint (`POST /oauth/v2/token`).
  - Updates encrypted database record.
  - Transparently replays the action step with the new access token.

#### 3. Webhook Ingestion Security & DDoS Protection
- Redis-backed rate limiting on `/api/webhooks/*` (e.g. max 1,000 requests/minute per webhook URL).
- Request body payload size cap (max 10MB) to prevent memory exhaustion attacks.

---

## 📊 Summary: Current State vs. Target State

| Dimension | Current State | Target Production State |
|---|---|---|
| **Frontend Canvas & UI** | 🟢 **98% Complete** (Infinite 2D canvas, routers, filters, pill inputs) | 🟢 Minor polish (Undo/Redo, JSON import/export) |
| **Connectors & Schemas** | 🟢 **100% Complete** (All 29 MVP nodes documented & schemas mapped) | 🟢 Ready for live API proxies |
| **Variable Mapping Engine** | 🟢 **100% Complete** (Dot notation, modal picker, live pill rendering) | 🟢 Backend interpreter execution parity |
| **Database & Persistence** | 🟡 **Mock / In-Memory** (`INITIAL_WORKFLOWS`, local state) | 🔴 **PostgreSQL + Prisma ORM** (Workflows, Runs, Connections) |
| **Asynchronous Queue Worker**| 🟡 **Client Mock** (`setTimeout`) | 🔴 **BullMQ + Redis Worker** (Background job queue) |
| **Public Webhook Ingestion** | 🟡 **Client Simulation** (Simulate Test Event button) | 🔴 **Live `/api/webhooks/[id]`** with HMAC verification |
| **OAuth Token Daemon** | 🟡 **Simulated Handshake** | 🔴 **Live OAuth Callbacks & Silent Refresh Daemon** |
| **Team Collaboration (RBAC)**| 🟡 **Single User Mock** | 🔴 **Workspaces, Teammate Invites & Role Permissions** |
| **Billing & Quota Gateway** | 🟡 **Simulated Checkout** | 🔴 **Live Stripe / Razorpay Webhook Billing Handshake** |

---

## 🗓️ Recommended Implementation Phasing

```
┌────────────────────────┬────────────────────────┬────────────────────────┐
│ PHASE 1: PERSISTENCE   │ PHASE 2: EXECUTION     │ PHASE 3: PRODUCTION    │
│ (Weeks 1–2)            │ (Weeks 3–4)            │ (Weeks 5–6)            │
├────────────────────────┼────────────────────────┼────────────────────────┤
│ • PostgreSQL + Prisma  │ • BullMQ + Redis Queue │ • Stripe Billing Live  │
│ • Next.js Route APIs   │ • Live Webhook Endpoint│ • Multi-Tenancy & RBAC │
│ • OAuth Callback Vault │ • Polling Cron Daemon  │ • Auto-Retry & DLQ     │
│ • Database Migration   │ • Live Token Resolver  │ • Canvas Undo / Import │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

---

*Related Documentation:*
- [How Zapier Manages 6,000+ Integrations](./12-how-zapier-manages-thousands-of-integrations.md)
- [Custom Parameters & Headers Architecture](./11-custom-parameters-and-headers.md)
- [Node Roles & Auth Decisions](../node-roles-and-auth/README.md)
- [Node Connections Master Index](../node-connections/README.md)
