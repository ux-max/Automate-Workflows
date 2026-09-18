# 🔌 Node Connections, Auth & Variable Mapping Architecture

> **Comprehensive Engineering & Integration Guide:** How each of the 29 workflow nodes authenticates with external platforms, ingests live webhook/API data, flattens payloads into accessible variable tokens, and populates downstream fields in Automate Workflows.

> [!TIP]
> **Looking for Node Role Classifications & Auth Decisions?**
> Check out the dedicated **[Node Roles & Authentication Architecture Guide](../node-roles-and-auth/README.md)** for a deep dive into Trigger-Only vs. Action-Only nodes (e.g. why Google Forms has no actions) and the technical reasons behind each authentication tier.

---

## 📑 Table of Contents

1. [Architectural Overview: The Data Flow Lifecycle](#-architectural-overview-the-data-flow-lifecycle)
2. [The 4 Platform Authentication Models](#-the-4-platform-authentication-models)
3. [How Platform Payloads Enter the App](#-how-platform-payloads-enter-the-app)
4. [The Ingestion & Variable Flattening Engine](#-the-ingestion--variable-flattening-engine)
5. [How Downstream Fields Map & Resolve Variables](#-how-downstream-fields-map--resolve-variables)
6. [Detailed Node Category Guides](#-detailed-node-category-guides)

---

## 🔄 Architectural Overview: The Data Flow Lifecycle

Every automation workflow operates on a 4-phase data transformation pipeline:

```
 ┌──────────────────────┐
 │   EXTERNAL PLATFORM  │ (Shopify, HubSpot, WhatsApp, Slack, etc.)
 └──────────┬───────────┘
            │  1. Triggers Event (Webhook POST / API Poll / OAuth handshake)
            ▼
 ┌──────────────────────┐
 │   AUTHENTICATION &   │ • Verifies OAuth 2.0 Token / API Key / HMAC Header
 │   INGESTION LAYER    │ • Generates Unique Webhook Capture URL
 └──────────┬───────────┘
            │  2. Ingests Raw Platform JSON Payload
            ▼
 ┌──────────────────────┐
 │  VARIABLE FLATTENING │ • Simple Response (Yes): Flattens nested JSON to dot-notation
 │      ENGINE          │ • Advanced Response (No): Preserves raw array hierarchies
 └──────────┬───────────┘
            │  3. Registers Variable Catalog (`{{step_1.customer_email}}`)
            ▼
 ┌──────────────────────┐
 │ DOWNSTREAM EXECUTION │ • VariablePillInput / Keyboard `/` picker
 │  & TEMPLATE ENGINE   │ • Replaces `{{step_N.var}}` tokens with runtime values
 └──────────────────────┘
```

---

## 🔐 The 4 Platform Authentication Models

Automate Workflows segregates its 29 nodes into 4 standardized authentication tiers:

| Tier | Auth Mechanism | Platforms / Nodes | How It Connects & Stores Credentials |
|:---:|:---|:---|:---|
| **1** | **OAuth 2.0 Handshake** | Google Sheets, Gmail, Slack, Google Calendar, Calendly, **Typeform**, **HubSpot (Actions)** | Uses standard Authorization Code Grant. Platform opens pop-up consent dialog, exchanges authorization code for short-lived `access_token` and permanent `refresh_token`. Stored securely in `UserConnection` vault with automated token refresh. |
| **2** | **API Key / Access Token** | Automate Chats, Automate Forms, Shopify, Razorpay, Pipedrive, Freshdesk, HubSpot (Fallback Private App Token) | User generates private API Key / Personal Access Token in platform settings. Automate Workflows securely injects it into outbound HTTP request headers (e.g. `Authorization: Bearer <token>`, `X-Shopify-Access-Token: <token>`, `Basic base64(key:secret)`). |
| **3** | **Bot Token / Telegram API** | Telegram | User creates bot via Telegram's `@BotFather` and pastes Bot HTTP API Token (`123456:ABC-DEF...`). Automate Workflows registers the webhook via `POST https://api.telegram.org/bot<TOKEN>/setWebhook`. |
| **4** | **Automate Workflows-Style Webhook URL (Zero Auth)** | Webhook Catch Hook, Shopify, Razorpay, HubSpot (Triggers), Freshdesk, **Google Forms (Trigger-Only)** | **No developer accounts or marketplace approvals required.** System dynamically generates a dedicated URL (`https://connect.automateworkflows.com/webhook-listener/webhook/<hash>`). User pastes this URL directly into the external app webhook settings. |
| **—** | **Native / Local Utility (None)** | Filter, Router, Delay, Iterator, Scheduler, Text/Number/DateTime Formatter, Code Runner, Lookup Table, Human in the Loop | Runs natively inside our execution container with zero external network authentication required. |

---

## 📡 How Platform Payloads Enter the App

When an event triggers on an external platform, it reaches Automate Workflows through one of three pathways:

### 1. Instant Push Webhook (e.g. Shopify Order Paid, Razorpay Payment Captured)
1. Customer pays on Shopify.
2. Shopify dispatches an HTTP POST request to our unique Webhook URL with headers:
   ```http
   POST /webhook-listener/webhook/lji1J3NjFwNTZmMDYzTAlmMzY1MjE1MjM3 HTTP/1.1
   Host: connect.automateworkflows.com
   X-Shopify-Topic: orders/paid
   X-Shopify-Hmac-Sha256: 4h8r9kL...
   Content-Type: application/json
   ```
3. Our webhook listener intercepts the request, validates the signature, stores the test payload in the step execution cache, and responds with `HTTP 200 OK`.

### 2. Scheduled / Polling Engine (e.g. Google Sheets New Row, Gmail New Email)
1. Scheduler or cron worker awakens every 1 to 5 minutes.
2. Injects the stored OAuth 2.0 `access_token` and calls the platform's list API:
   ```http
   GET /v4/spreadsheets/{id}/values/Sheet1!A2:Z HTTP/1.1
   Host: sheets.googleapis.com
   Authorization: Bearer ya29.a0AfH6...
   ```
3. Detects rows whose `row_id` or `timestamp` exceeds the last processed cursor checkpoint.

### 3. Native UI Simulation ("Simulate Test Event")
For instant onboarding without waiting for live customer actions, each trigger node provides a **1-Click Simulation Button**:
- Instantly injects pre-compiled, 100% production-authentic JSON payloads into the step's `testOutput` cache.
- Immediately populates the downstream variable catalog so users can build the rest of their workflow in seconds.

---

## 🧩 The Ingestion & Variable Flattening Engine

External platform payloads are typically heavily nested, containing objects within arrays and multiple levels of dictionary trees:

### Raw Platform JSON (Input):
```json
{
  "event": "order.paid",
  "id": "ord_99014",
  "customer": {
    "first_name": "Anita",
    "last_name": "Roy",
    "contact": {
      "email": "anita@example.com",
      "phone": "+919812345678"
    }
  },
  "line_items": [
    { "title": "Wireless Earbuds", "price": 49.99, "quantity": 1 },
    { "title": "USB-C Fast Cable", "price": 12.50, "quantity": 2 }
  ]
}
```

### The Flattening Engine Process:

```
┌─────────────────────────────────────────────────────────────┐
│                 PAYLOAD FLATTENING ENGINE                   │
├──────────────────────────────┬──────────────────────────────┤
│ SIMPLE RESPONSE (YES)        │ ADVANCED RESPONSE (NO)       │
│ • Flattens deep objects into │ • Preserves arrays as raw    │
│   dot notation keys          │   objects for loops          │
│ • Creates clean variable     │ • Ideal for Iterator/Loop    │
│   picker tokens              │   and Code Runner scripts    │
└──────────────────────────────┴──────────────────────────────┘
```

#### Generated Variable Catalog in Automate Workflows:

| Variable Token | Display Label | Data Type | Sample Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.id}}` | Order ID | `string` | `"ord_99014"` |
| `{{step_1.customer_first_name}}` | Customer First Name | `string` | `"Anita"` |
| `{{step_1.customer_last_name}}` | Customer Last Name | `string` | `"Roy"` |
| `{{step_1.customer_contact_email}}` | Customer Contact Email | `string` | `"anita@example.com"` |
| `{{step_1.customer_contact_phone}}` | Customer Contact Phone | `string` | `"+919812345678"` |
| `{{step_1.line_items_0_title}}` | Line Item 1 Title | `string` | `"Wireless Earbuds"` |
| `{{step_1.line_items_0_price}}` | Line Item 1 Price | `number` | `49.99` |
| `{{step_1.line_items}}` | Line Items (Raw Array) | `array` | `[ {...}, {...} ]` *(Advanced)* |

---

## 🎯 How Downstream Fields Map & Resolve Variables

### 1. In the UI (Editor Drawer)
When configuring an action step (e.g. sending a WhatsApp message or creating a CRM contact):
1. **Interactive Pill Input (`VariablePillInput.tsx`)**:
   - The user clicks the **`Press /`** pill button or presses the `/` key on their physical keyboard.
2. **Variable Picker Modal (`VariablePicker.tsx`)**:
   - Displays all upstream steps (Step 1, Step 2, etc.) with app icons and categorized outputs.
   - User clicks any variable (e.g. `Customer Contact Email`).
3. **Pill Insertion**:
   - The variable appears as an interactive colored chip:
     `[ 👤 step_1.customer_contact_email ]`
   - Internally, it is serialized cleanly as mustache template syntax:
     `{{step_1.customer_contact_email}}`

### 2. At Runtime Execution
When the workflow executes:
1. The execution runner builds a runtime variable context dictionary:
   ```javascript
   const context = {
     step_1: {
       id: "ord_99014",
       customer_first_name: "Anita",
       customer_contact_email: "anita@example.com"
     }
   }
   ```
2. Any template string containing `{{step_1.var}}` undergoes regex substitution:
   ```javascript
   const resolved = template.replace(/\{\{step_(\d+)\.([a-zA-Z0-9_]+)\}\}/g, (_, stepIdx, key) => {
     return context[`step_${stepIdx}`]?.[key] ?? ""
   })
   ```
3. The resolved payload is sent to the target platform API.

---

## 📚 Detailed Node Category Guides

Detailed deep-dive guides for each node category are available in this directory:

- [**01. Native Suite & Form Builders**](./01-native-and-forms.md)
  *Automate Chats, Automate Forms, Google Forms, Typeform*
- [**02. CRM & E-Commerce**](./02-crm-and-commerce.md)
  *HubSpot, Pipedrive, Shopify, Razorpay*
- [**03. Communication, Scheduling & Spreadsheets**](./03-communication-and-scheduling.md)
  *Slack, Gmail, Telegram, Google Sheets, Google Calendar, Calendly, Freshdesk*
- [**04. Flow Control & Built-In Utilities**](./04-flow-control-and-utilities.md)
  *Scheduler, Filter, Router, Delay, Iterator/Loop, Code Runner, Lookup Table, Formatters, Human in the Loop*
- [**05. Variable Mapping & Flattening Engine Deep-Dive**](./05-variable-mapping-deep-dive.md)
  *In-depth look at JSON parsing, array handling, mustache token interpolation, and error resilience*
- [**Custom Parameters & Headers — Architecture & Use Cases**](../docs/11-custom-parameters-and-headers.md)
  *Why Custom Parameters & Headers exist, custom CRM fields, idempotency headers, approval metadata & zero-code API extensibility*
