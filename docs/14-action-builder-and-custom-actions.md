# Action Builder & Custom Actions — Complete Master Guide

> **Official Technical Architecture & User Manual**
> 
> *A comprehensive, end-to-end guide explaining the core philosophy, business benefits, AI-assisted development workflow, sandbox testing harness, deployment lifecycle, and workflow canvas consumption of Custom (Private) Actions in Automate Workflows.*

---

## 📑 Table of Contents

1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [What is Action Builder & Custom Actions?](#2-what-is-action-builder--custom-actions)
   - [The Ecosystem Spectrum: Native Apps vs. Custom Apps vs. Private Actions](#the-ecosystem-spectrum)
   - [The "Action-First" Design Philosophy](#the-action-first-design-philosophy)
3. [Why is Action Builder Beneficial? (Core Advantages)](#3-why-is-action-builder-beneficial-core-advantages)
   - [Zero Integration Roadblocks (No Vendor Lock-In)](#1-zero-integration-roadblocks)
   - [AI Prompt-to-Action Generation in Seconds](#2-ai-prompt-to-action-generation)
   - [Built-In TypeScript Handler & Schema Compiler](#3-built-in-typescript-handler--schema-compiler)
   - [Isolated Interactive Sandbox & Test Harness](#4-isolated-interactive-sandbox--test-harness)
   - [Strict Draft vs. Live Deployment Safety](#5-strict-draft-vs-live-deployment-safety)
   - [Native Zero-Friction Workflow Canvas Integration](#6-native-zero-friction-workflow-canvas-integration)
4. [Architecture & System Flow](#4-architecture--system-flow)
5. [Step-by-Step User Guide: How to Build & Use a Custom Action](#5-step-by-step-user-guide-how-to-build--use-a-custom-action)
   - [Step 1: Navigating to Action Builder (`/custom-actions`)](#step-1-navigating-to-action-builder)
   - [Step 2: Prompting the AI Studio & Iterating on Code](#step-2-prompting-the-ai-studio--iterating-on-code)
   - [Step 3: Reviewing Code Diffs & Helper Functions](#step-3-reviewing-code-diffs--helper-functions)
   - [Step 4: Defining Input Fields & Authentication Schemas](#step-4-defining-input-fields--authentication-schemas)
   - [Step 5: Testing with the Interactive Sandbox Harness](#step-5-testing-with-the-interactive-sandbox-harness)
   - [Step 6: Deploying Live to Workflow Canvas](#step-6-deploying-live-to-workflow-canvas)
   - [Step 7: Consuming Private Actions in Workflow Canvas (`/workflows/editor`)](#step-7-consuming-private-actions-in-workflow-canvas)
6. [Real-World Case Studies](#6-real-world-case-studies)
   - [Case Study A: Internal Microservice Webhook with HMAC Signature](#case-study-a-internal-microservice-webhook)
   - [Case Study B: Niche SaaS CRM Endpoint (Proprietary Headers)](#case-study-b-niche-saas-crm-endpoint)
   - [Case Study C: Google Sheets Batch Delete Operation](#case-study-c-google-sheets-batch-delete-operation)
7. [Security, Secrets & Environment Governance](#7-security-secrets--environment-governance)
8. [Troubleshooting & Best Practices](#8-troubleshooting--best-practices)

---

## 1. Executive Summary & Core Philosophy

In traditional Integration Platform as a Service (iPaaS) platforms like Zapier, Make, or Workato, users frequently encounter the **"Integration Wall"**:
- An official integration exists (e.g. Google Sheets or Slack), but it only supports 5 basic actions. The specific endpoint you need (e.g., `batchUpdate`, `deleteSheet`, `ephemeralAlert`, `customWebhook`) is not supported.
- Connecting to an internal company microservice or proprietary CRM requires waiting months for a developer team to build, publish, and review an entire OAuth application.
- Generic HTTP Webhook nodes require manual curl reconstruction, raw JSON payload writing, and fragile header management in every single workflow step.

**Action Builder** eliminates this friction. It empowers both developers and non-technical automation builders to create **Private Custom Actions** in seconds using conversational AI or direct code, test them in a live sandbox, and immediately publish them to their team's **Workflow Canvas** under the **Private Actions** drawer.

---

## 2. What is Action Builder & Custom Actions?

### The Ecosystem Spectrum

To understand where Custom Actions fit in **Automate Workflows**, consider our three tiers of integrations:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AUTOMATE WORKFLOWS ECOSYSTEM                                      │
├───────────────────────────────┬─────────────────────────────────┬────────────────────────────────┤
│ 1. Native / SaaS Suite        │ 2. Developer Platform Apps      │ 3. Action Builder              │
│ (Pre-Built Connectors)        │ (Public / Team OAuth Apps)      │ (Custom Private Actions)       │
├───────────────────────────────┼─────────────────────────────────┼────────────────────────────────┤
│ • Pre-installed in canvas     │ • Multi-step OAuth 2.0 apps     │ • On-demand single actions     │
│ • Slack, HubSpot, Gmail, etc. │ • Custom branding & app portal  │ • AI prompt-driven creation    │
│ • Standard triggers & actions │ • In-built actions & webhooks   │ • Private to your workspace    │
│ • Managed by platform team    │ • Built for app ecosystem       │ • Instant live deployment      │
│ • Fixed feature set           │ • Requires complete API schemas │ • Action-first experience      │
└───────────────────────────────┴─────────────────────────────────┴────────────────────────────────┘
```

### The "Action-First" Design Philosophy

Unlike third-party app stores where you must first register an Application, configure App Icons, set up OAuth scopes, and configure webhooks, **Action Builder is Action-First**:
- Users do not care about app wrappers when they simply want to perform a task.
- When an automation builder says *"I need to delete an unfulfilled order in Shopify"* or *"I need to sync a contact with our internal Postgres webhook"*, they want an **Action**.
- Private Actions are named after the **Action Purpose** (e.g. `Execute Webhook Action`, `Delete Sheet Tab`, `Send Ephemeral Alert`) and feature a universal `Zap` badge in the workflow drawer, removing visual clutter and app-name confusion.

---

## 3. Why is Action Builder Beneficial? (Core Advantages)

### 1. Zero Integration Roadblocks
If an external API has an HTTP endpoint, it can be automated in your workflows within 60 seconds. You never have to file feature requests with SaaS vendors or wait for official connectors.

### 2. AI Prompt-to-Action Generation
Describe what you need in plain English:
> *"Create a Google Sheets action to delete a sheet tab by spreadsheet ID and sheet ID using the Google Sheets batchUpdate API."*

The AI model:
- Analyzes endpoint structures, HTTP methods (`POST`, `PUT`, `DELETE`, `GET`), and URL parameters.
- Generates a production-grade TypeScript handler with validation, parameter extraction, and status boundaries.
- Autogenerates dynamic input field definitions (`spreadsheet_id`, `sheet_id`) with clean labels, helper texts, and variable mapping flags.
- Configures appropriate authentication headers (Bearer token, API key, OAuth).

### 3. Built-In TypeScript Handler & Schema Compiler
Every custom action is powered by a high-performance TypeScript handler with built-in helper abstractions:
- `jsonOk(data)`: Formats successful execution responses with HTTP 200 standards.
- `jsonErr(message, code, debug)`: Catches network anomalies, API rate-limits, and authentication rejections cleanly.
- Full code visibility: You can inspect, modify, and fine-tune every line of code in the integrated Monaco-style code drawer.

### 4. Isolated Interactive Sandbox & Test Harness
Before deploying an action to live production workflows:
- Execute test runs directly inside Action Builder.
- Send custom JSON payloads or individual test parameter inputs.
- Inspect real HTTP response codes (e.g. `200 OK`, `401 Unauthorized`), response latencies (e.g. `142ms`), and raw JSON response bodies.
- Maintain a persistent test history to ensure reliability.

### 5. Strict Draft vs. Live Deployment Safety
- New actions and AI revisions are created in **`Draft`** state.
- While in `Draft`, the action is isolated in the builder and cannot accidentally disrupt existing workflow runs.
- Only when you click **Deploy Live** and confirm the action name in the modal does it transition to **`Live`**.
- Any future prompt modifications automatically set the update to `Draft` until redeployed, ensuring zero runtime regressions.

### 6. Native Zero-Friction Workflow Canvas Integration
- Once deployed, your action appears in the Workflow Editor under **Step 1: Choose App** → **`Private Actions`**.
- It is rendered as a clean, first-class citizen card alongside native nodes like Slack, Filter, and Webhook.
- Supports downstream dynamic variable pills (`{{step_1.output.id}}`) using the visual Variable Picker.

---

## 4. Architecture & System Flow

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                ACTION BUILDER ARCHITECTURE                             │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                        1. User Prompt / Code Modification
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ AI Generation Engine:                                                                 │
│ • Synthesizes TypeScript Handler (`handleExecuteAction`)                              │
│ • Generates Input Fields Schema (`endpoint_url`, `payload_json`, etc.)                │
│ • Derives Authentication Protocol (Bearer Token, API Key, Custom Headers)             │
│ • Computes Granular Diff Summary (Additions, Line Numbers, Error Handlers)           │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Isolated Sandbox & Test Runner:                                                       │
│ • Executes real HTTP request with injected secrets & test payload                     │
│ • Measures Latency (ms), Status Codes, and Formats JSON Payloads                      │
│ • Records execution history in Action Store                                           │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                        2. Deploy Live Confirmation Modal
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ State Transition: `status: "draft"`  ──►  `status: "live"`                            │
│ Synchronized in LocalStorage / Workspace Database                                     │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Workflow Canvas Ingestion (`/workflows/editor`):                                      │
│ • Step 1: App Drawer filters under "Private Actions" category                         │
│ • Step 2: Renders Node on Canvas (Vertical & Horizontal SVG Layouts)                  │
│ • Step 3: Setup Details Drawer with Variable Mapping (`{{node.variable}}`)            │
│ • Step 4: Runtime Execution Engine dispatches handler during live workflow runs        │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Step-by-Step User Guide: How to Build & Use a Custom Action

### Step 1: Navigating to Action Builder
1. Log in to your **Automate Workflows** dashboard.
2. Click on **Custom Actions** in the top navigation bar or sidebar (direct route: `/custom-actions`).
3. You will enter the **Action Builder Studio**, consisting of:
   - **Left Sub-Sidebar:** Catalog of existing actions (labeled with `Draft` or `Live` badges), search filter, and `+ New` button.
   - **Center Studio:** Interactive AI chat feed, ambient glowing prompt dock, suggestion chips, and deployment status cards.
   - **Right Inspection Drawer (Collapsible):** Live TypeScript code editor, input schema manager, authentication configurator, and test runner.

---

### Step 2: Prompting the AI Studio & Iterating on Code
1. Click **+ New** to initialize an action, or select an existing draft.
2. In the bottom prompt dock, describe the action you want to build:
   - *Example:* `"Create a custom API action to POST contact details with HMAC signature to an external CRM webhook"`
3. Click **Send** (or press `Enter`).
4. The AI analysis engine will run for a few seconds (displaying thinking time and live status).
5. The chat studio outputs:
   - **Summary of changes:** Clear explanation of generated endpoints and schemas.
   - **Diff Summary Card:** Numbered breakdown of modified lines (e.g. `Add after line 48: Implemented handler`, `Add after line 64: Added parameter validation`).
   - **Ready to Deploy Card:** Outlines line count, current `Draft` badge, and action trigger buttons.

---

### Step 3: Reviewing Code Diffs & Helper Functions
1. Click the **View Code** button on the ready-to-deploy card (or toggle the code drawer on the right).
2. Inspect the generated TypeScript code:
   ```typescript
   // ── Helpers ──
   function jsonOk(data) { 
     return { statusCode: 200, statusMessage: 'OK', success: true, ...data }; 
   }
   function jsonErr(message, code, debug) { 
     return { statusCode: code || 400, statusMessage: message, success: false, error: message, ...(debug ? { _debug: debug } : {}) }; 
   }

   // ── Action Execution Handler ──
   async function handleExecuteAction(body, headers) {
     const token = headers['authorization'] || headers['x-api-key'] || process.env.API_ACCESS_TOKEN;
     if (!token) return jsonErr('Missing required credential: authorization header or token', 401);

     const endpoint = body.endpoint_url || 'https://api.service.com/v1/resource';
     if (!endpoint) return jsonErr('Missing required field: endpoint_url', 400);

     const res = await fetch(endpoint, {
       method: 'POST',
       headers: {
         'Authorization': 'Bearer ' + token,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(body)
     });
     return res.json();
   }
   ```
3. You can edit the code directly or instruct the AI to make changes (e.g., *"Add retry logic if response is 429"*).

---

### Step 4: Defining Input Fields & Authentication Schemas
Switch to the **Schema** tab in the right drawer:
- **Authentication:** Select between `Bearer Token`, `API Key`, `OAuth 2.0`, or `None`.
- **Input Fields:** Verify fields that users will see when configuring this step in workflows:
  - `endpoint_url` (Text, required)
  - `payload_json` (Textarea, supports dynamic variable mapping)
  - Custom query parameters or headers.

---

### Step 5: Testing with the Interactive Sandbox Harness
1. Click **Test Action** from the chat card or right drawer.
2. In the test console, enter your test credentials and input values:
   ```json
   {
     "endpoint_url": "https://api.service.com/v1/resource",
     "payload_json": "{\"company\": \"Acme Corp\", \"deal_size\": 50000}"
   }
   ```
3. Click **Run Test Request**.
4. Review the response:
   - **Status:** `200 OK`
   - **Latency:** `157ms`
   - **Response Payload:** Expandable JSON viewer confirming the API accepted your request.

---

### Step 6: Deploying Live to Workflow Canvas
1. Once satisfied with testing, click the blue **Deploy Live** button.
2. The **Deploy Custom Action** confirmation modal opens.
3. Review or customize your **Action Name** (e.g., `Execute Webhook Action`).
4. Click **Deploy**.
5. The action transitions to **`Live`**:
   - The card badge updates to green **`Deployed`**.
   - A green banner confirms: *"Action is live! Ready for selection in Workflow Canvas."*
   - In the left sidebar, the action badge turns from gray `Draft` to green `Live`.

---

### Step 7: Consuming Private Actions in Workflow Canvas
1. Navigate to the **Workflow Editor** (`/workflows/editor`).
2. Add a new step or click on an unconfigured action node.
3. The **Step 1: Choose App** drawer opens.
4. Click the **`Private Actions`** category pill in the filter bar.
5. You will see your newly deployed action card:
   - Title: `Execute Webhook Action`
   - Subtitle: `Private Action`
   - Badge: `Live`
   - Icon: `Zap`
6. Click the card to select it.
7. In the canvas, the node updates with the action name and Zap icon.
8. In the **Step 2: Setup Details** drawer:
   - Enter your authentication credential or secret.
   - Enter field values or click the **Variable Picker** icon to map dynamic values from upstream triggers (e.g., `{{trigger.body.customer_email}}`).
   - The Variable Picker opens seamlessly in front of the drawer with high-contrast layering.
9. Click **Save & Continue** — your workflow is now connected with your custom integration!

---

## 6. Real-World Case Studies

### Case Study A: Internal Microservice Webhook
- **Problem:** An enterprise client needs to dispatch a hashed HMAC payload to an internal on-premise inventory system whenever a Shopify order is placed.
- **Solution:** Built an action in Action Builder named `Dispatch Signed Inventory Webhook` with custom crypto hashing in the TypeScript handler.
- **Result:** Deployed in 3 minutes without waiting for IT infrastructure changes or external app reviews.

### Case Study B: Niche SaaS CRM Endpoint
- **Problem:** A sales team uses a regional CRM that lacks a native Zapier/Make integration. They need to automatically create a lead whenever a Google Form is submitted.
- **Solution:** Prompted Action Builder with the CRM's Swagger API documentation. The AI generated the auth header `X-API-KEY` and dynamic contact fields.
- **Result:** Deployed as `Create Lead in Regional CRM` and mapped directly from Google Forms in the workflow editor.

### Case Study C: Google Sheets Batch Delete Operation
- **Problem:** The official Google Sheets connector supports creating and updating rows, but cannot delete a specific worksheet tab programmatically.
- **Solution:** Created `Delete Sheet Tab` using Google's `batchUpdate` endpoint with `deleteSheet` request body.
- **Result:** Successfully automated monthly spreadsheet tab archiving workflows.

---

## 7. Security, Secrets & Environment Governance

1. **Zero Exposure in Code:** API keys and sensitive tokens entered during workflow configuration are encrypted and injected via runtime environment headers (`headers['authorization']`).
2. **Workspace Isolation:** Custom Actions are strictly scoped to your team workspace. They are never published publicly unless submitted to the Developer Platform for public app review.
3. **Audit Logging & Test History:** Every execution in the test harness records timestamps, HTTP status codes, and latency for debugging and security auditing.

---

## 8. Troubleshooting & Best Practices

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Action not visible in App Drawer** | Action is still in `Draft` state | Go to `/custom-actions`, open the action, and click **Deploy Live**. |
| **Test request returns 401 Unauthorized** | Missing or expired API Key / Token | Verify credentials in the Auth tab or inject valid token in the Test Harness input. |
| **Variable Picker opens behind drawer** | Z-index stacking context collision | Fixed: Variable Picker is teleported via React Portal with `zIndex: 150`. |
| **Code changes reset status to Draft** | Automatic safety protection | When code is modified via AI prompt or editor, the action transitions to `Draft` until tested and redeployed live. |

---

*Automate Workflows Documentation Team — September 2026*
