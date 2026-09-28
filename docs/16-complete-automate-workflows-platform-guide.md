# Automate Workflows Platform — Complete Tab-by-Tab & Button-by-Button Master Guide

> **The Definitive End-to-End System Manual & UI/UX Component Dictionary**
> 
> *A comprehensive, granular guide detailing every page, tab, sub-sidebar, drawer, button, modal, form input, and toggle across the entire Automate Workflows application.*

---

## 📑 Table of Contents

1. [Global Application Shell & Navigation](#1-global-application-shell--navigation)
   - [The Primary Collapsible Sidebar](#the-primary-collapsible-sidebar)
   - [Global Top Navigation Bar (`Navbar`)](#global-top-navigation-bar)
   - [Flyout Sub-Sidebars (Folders, Settings, App Builder)](#flyout-sub-sidebars)
2. [Section 1: AI Chat Automation Studio (`/chat`)](#2-section-1-ai-chat-automation-studio)
   - [Hero State & Multi-App Idea Marquee](#chat-hero-state)
   - [Voice Dictation & Ambient Prompt Dock](#voice-dictation--prompt-dock)
   - [AI Multi-Step Workflow Generation & Plan Cards](#ai-multi-step-generation)
   - [`Direct Canvas View` & `Copy Schema` Buttons](#direct-canvas-view--copy-schema)
3. [Section 2: Workflows Management & Folders (`/workflows`)](#3-section-2-workflows-management--folders)
   - [Top Action Bar (`+ Create Workflow`, Search, Filters)](#workflows-top-action-bar)
   - [Folders Sub-Sidebar & Workspace Categorization](#folders-sub-sidebar)
   - [Workflow Cards, Status Toggles & 3-Dot Menus](#workflow-cards--actions)
4. [Section 3: Visual Workflow Canvas Editor (`/workflows/editor`)](#4-section-3-visual-workflow-canvas-editor)
   - [Top Editor Bar (Title Rename, Status Toggle, Test, Publish)](#editor-top-bar)
   - [Master Infinite Canvas & Layout Switcher (Vertical vs Horizontal)](#master-canvas--layouts)
   - [Step 1: Choose App Drawer & Category Filter Pills](#step-1-choose-app-drawer)
   - [Step 2: Setup Details Drawer (Events, Accounts, Fields)](#step-2-setup-details-drawer)
   - [The Portal Layered Variable Picker (Eye/Tag Icon)](#variable-picker-architecture)
   - [AI Workflow Assistant Floating Panel (`AIWorkflowAssistant`)](#ai-workflow-assistant-panel)
5. [Section 4: Action Builder Studio (`/custom-actions`)](#5-section-4-action-builder-studio)
   - [Panel 1: Action Catalog Sub-Sidebar (`+ New`, Search, 3-Dots)](#action-builder-panel-1)
   - [Panel 2: Central AI Conversation & Code Studio](#action-builder-panel-2)
   - [Panel 3: Right Live Sandbox Drawer (`Test Action`, `History`, `View Code`)](#action-builder-panel-3)
   - [Deploy Confirmation Modal & Canvas Synchronization](#action-builder-deploy-modal)
6. [Section 5: Execution History & Logs (`/history`)](#6-section-5-execution-history--logs)
   - [Execution Table & Real-Time Filter Pills (All, Success, Failed)](#execution-table--filters)
   - [Detailed Execution Inspector Drawer (Timelines, Payloads, Tracebacks)](#execution-inspector-drawer)
   - [The `Retry Execution` Action](#retry-execution-action)
7. [Section 6: Connections Vault (`/connections`)](#7-section-6-connections-vault)
   - [Authorized App Accounts Table](#authorized-app-accounts)
   - [`+ Add Connection` Modal & OAuth / API Key Flows](#add-connection-modal)
   - [Reconnect, Test & Delete Connection Buttons](#connection-actions)
8. [Section 7: Developer Platform Hub (`/developer`)](#8-section-7-developer-platform-hub)
   - [Developer Apps List & `+ Create Custom App`](#developer-apps-list)
   - [The 8 App Builder Tabs (Auth, Triggers, Actions, In-Built Actions, Sandbox, etc.)](#the-8-app-builder-tabs)
   - [The Zero-Task Credit In-Built Actions Engine](#in-built-actions-engine)
9. [Section 8: Settings, Workspace & Team RBAC (`/settings`)](#9-section-8-settings-workspace--team-rbac)
   - [Settings Sub-Sidebar Navigation](#settings-sub-sidebar)
   - [Workspace Details, Team Members, API Keys & Notifications](#workspace-settings-tabs)
10. [Section 9: Templates Marketplace & Billing (`/templates`, `/billing`)](#10-section-9-templates-marketplace--billing)
    - [1-Click Template Cloning](#templates-cloning)
    - [Task Credit Meter & Plan Upgrades](#task-credit-meter)
11. [Master Application Element & Action Matrix](#11-master-application-element--action-matrix)

---

## 1. Global Application Shell & Navigation

The core application layout is orchestrated by `AppShell.tsx`, unifying the primary navigation sidebar, contextual flyout panels, and the top utility navigation bar.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] [Toggle]       [Search Workflow / Webhook URL...                   ]  [Upgrade] [☀/🌙] [👤]│
├───────┬───────────────┬──────────────────────────────────────────────────────────────────────────┤
│ PRIMARY│ FLYOUT SUB-   │ MAIN PAGE CONTENT WORKSPACE                                              │
│ SIDEBAR│ SIDEBAR       │                                                                          │
│       │ (Contextual)  │ • /chat (AI Workflow Generator)                                          │
│ • Chat│               │ • /workflows (Folder & Workflow Manager)                                 │
│ • Flow│ • Folders     │ • /workflows/editor (Full-Screen Visual Canvas)                          │
│ • Fold│ • Settings    │ • /custom-actions (Action Builder 3-Panel Studio)                        │
│ • Hist│ • App Builder │ • /connections (OAuth & API Token Vault)                                 │
│ • Acts│               │ • /history (Live Execution Audit Logs)                                   │
│ • Conn│               │ • /developer (Custom App Developer Portal)                               │
└───────┴───────────────┴──────────────────────────────────────────────────────────────────────────┘
```

### The Primary Collapsible Sidebar
Located on the far left of every view (except the full-bleed Workflow Canvas and Auth pages):
- **Logo Area:**
  - *Expanded (`w-56`):* Displays full `Automate Business` branding.
  - *Collapsed (`w-16`):* Displays compact square `A` emblem. Clicking navigates directly to `/chat`.
- **Navigation Items:**
  1. **`Chat` (`/chat`, `SquarePen` Icon):** Opens the conversational AI workflow prompt studio.
  2. **`Workflow` (`/workflows`, `Layers` Icon):** Opens the master workflow manager.
  3. **`Folders` (`#folders`, `Folder` Icon):** Slides open the **Folders Sub-Sidebar** for nested workspace organization.
  4. **`History` (`/history`, `History` Icon):** Opens the execution logs and audit stream.
  5. **`Action Builder` (`/custom-actions`, `Zap` Icon):** Opens the 3-panel custom action code studio.
  6. **`Connections` (`/connections`, `Link2` Icon):** Opens the authorized credentials vault.
- **Bottom Navigation Group:**
  - **`Settings` (`/settings`, `Settings` Icon):** Slides open the **Settings Sub-Sidebar**.
  - **`Create Custom App` (`/developer`, `Code2` Icon):** Direct shortcut to the Developer Platform.
  - **`Get Help & Templates` (`/templates`, `HelpCircle` Icon):** Opens the pre-built template marketplace.
  - **User Profile Row:** Displays avatar, account name, plan tier, and quick logout access.

### Global Top Navigation Bar (`Navbar`)
- **Global Search Input:** Accepts workflow names, IDs, or webhook URLs (`Ctrl + K` focus).
- **`Upgrade` Button:** Highlights current task tier and opens the billing upgrade modal.
- **Dark/Light Mode Toggle (`Sun` / `Moon`):** Smoothly switches the application theme with instantaneous CSS variable hydration.
- **Notification Bell (`Bell`):** Pull-down feed displaying workflow execution alerts, credential expirations, and team activity.
- **User Avatar / Workspace Selector:** Switches between personal and organization workspaces.

### Flyout Sub-Sidebars
When selecting **Folders**, **Settings**, or entering a **Developer App**, a contextual secondary panel smoothly slides out:
- **Automatic Collapse Logic:** When a sub-sidebar opens, the primary sidebar automatically collapses to `w-16` icon-only mode to preserve central workspace width. When closed, it smoothly expands back.

---

## 2. Section 1: AI Chat Automation Studio (`/chat`)

The **Chat Studio** allows users to build complete multi-step automations purely through natural language conversation.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     AI CHAT AUTOMATION STUDIO                                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                  "What would you like to automate today?"                         │
│                                                                                                  │
│ [💡 Send Slack notification when Stripe payment succeeds] [💡 Sync Google Forms to HubSpot CRM]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ USER: "When someone fills my Typeform, add them to Google Sheets and notify #sales in Slack"      │
│                                                                                                  │
│ AI: "Here is your 3-step automation blueprint:"                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Typeform: New Submission] ──► [Google Sheets: Add Row] ──► [Slack: Post Message]            │ │
│ │ [Copy Schema]                                                          [ Direct Canvas View ]│ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ 🎙 ] [ Describe any multi-app workflow idea...                                        ] [ ↑ ]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Hero State & Idea Marquee
- **Inspirational Suggestion Strip:** Horizontal scrolling pills of popular workflows. Clicking any pill immediately populates the prompt box.
- **Ambient Diffused Background:** Soft glowing gradients that dynamically adjust to dark mode.

### Voice Dictation & Ambient Prompt Dock
- **Microphone Button (`Mic` / `MicOff`):** Uses the browser's Web Speech API for hands-free voice dictation. Pulses in red during active recording.
- **Multiline Textarea:** Supports multi-sentence workflow prompts with character wrapping.
- **Send Button (`ArrowUp`):** Dispatches prompt and triggers step generation.

### AI Multi-Step Generation & Plan Cards
- Evaluates app compatibility, identifies triggers vs. actions, and formats a visual 3-card pipeline (`Step 0: Trigger`, `Step 1: Action`, `Step 2: Action`).
- **`Copy Schema` Button:** Copies the underlying JSON schema to clipboard.
- **`Direct Canvas View` Button (`ArrowRight`):** Ingests the generated steps and transitions immediately into the visual **Workflow Canvas Editor** (`/workflows/editor`) with all nodes pre-placed!

---

## 3. Section 2: Workflows Management & Folders (`/workflows`)

The **Workflows Manager** is the mission control center for active, paused, and draft automations.

### Top Action Bar
- **`+ Create Workflow` Button (Blue Primary):** Opens a fresh canvas in `/workflows/editor`.
- **Search Bar:** Real-time query filter across workflow names and descriptions.
- **Status Filter Tabs:** Filter by `All`, `Active`, `Paused`, and `Draft`.

### Folders Sub-Sidebar
- Organizes automations by department or client (e.g., `Marketing`, `Sales Ops`, `Internal HR`).
- **`+ New Folder` Button:** Creates custom nested directories.
- **Drag-and-Drop Organization:** Move workflows across folders effortlessly.

### Workflow Cards & Actions
Each workflow card displays:
- **Status Toggle Switch:** Turns the live webhook/polling trigger **ON** or **OFF** instantly.
- **Execution Metrics:** Shows total runs (e.g. `1,420 runs`), success percentage, and last triggered time.
- **App Stack Icons:** Visual row of connected icons (e.g., Typeform → Sheets → Slack).
- **3-Dot (`MoreVertical`) Menu:**
  - *Edit Workflow:* Opens in Canvas Editor.
  - *Duplicate:* Clones the workflow configuration.
  - *Move to Folder:* Reassigns organization folder.
  - *Delete:* Prompts safe deletion confirmation.

---

## 4. Section 3: Visual Workflow Canvas Editor (`/workflows/editor`)

The **Canvas Editor** is an interactive, infinite visual workspace for wiring triggers, filters, routers, native utilities, and custom private actions.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [←] "Customer Onboarding Flow"  [Draft/Active]      [ ⟲ Reset ]  [ ▶ Test ]  [ 🚀 Publish Live ] │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│   ┌───────────────────────────┐                                                                  │
│   │ ⚡ Typeform: New Lead     │                                                                  │
│   └─────────────┬─────────────┘                                                                  │
│                 ▼                                                                                │
│   ┌───────────────────────────┐        ┌───────────────────────────┐                             │
│   │ 🔀 Router: Tier Check     ├───────►│ ⚡ Private: Webhook Sync  │ (Action Builder Node)       │
│   └─────────────┬─────────────┘        └───────────────────────────┘                             │
│                 ▼                                                                                │
│   ┌───────────────────────────┐                                                                  │
│   │ ▶️ Slack: Post Message     │                                                                  │
│   └───────────────────────────┘                                                                  │
│                                                                                                  │
│ [ + Zoom ] [ - Zoom ] [ ⛶ Fit Screen ] [ ↕/↔ Layout Switcher ]          [ 🪄 AI Assistant Pill ] │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Editor Top Bar
- **Back Button (`ArrowLeft`):** Safely saves changes and returns to the workflow list.
- **Workflow Name Field:** Click-to-rename text field.
- **Status Badge / Switch (`Draft` / `Active`):** Dictates whether live external webhooks are received.
- **`Test Workflow` Button (`Play`):** Executes an end-to-end dry run with synthetic test payloads.
- **`Publish Live` Button (Blue Primary):** Deploys the workflow to active production workers.

### Master Canvas & Layout Switcher
- **Infinite Pan/Zoom:** Drag canvas with middle-click or spacebar; zoom with mouse wheel.
- **Minimap & Zoom Controls (`+`, `-`, `Fit Screen`):** Real-time canvas orientation.
- **Layout Switcher (`↕ Vertical` vs `↔ Horizontal`):** Instantly re-renders the SVG dependency tree in vertical top-to-bottom or horizontal left-to-right pipelines.

### Step 1: Choose App Drawer
Clicking any `+` on the canvas opens the **App Drawer**:
- **Search Box:** Instant app filtering.
- **Category Filter Pills:**
  - `All`: Complete library.
  - `Flow Control`: Router, Filter, Delay, Iterator.
  - `Utilities`: Text Formatter, Date Formatter, Code Runner, Webhook.
  - `SaaS Apps`: Slack, Google Sheets, Gmail, Stripe, Shopify.
  - `My Custom Apps (Dev)`: Custom apps created in Developer Platform.
  - **`Private Actions (N)`:** Custom private actions created via **Action Builder**!

### Step 2: Setup Details Drawer
Slides open when an action node is selected:
- **Account Dropdown:** Selects stored connection or prompts new OAuth authorization.
- **Action Event Dropdown:** Chooses specific operation.
- **Dynamic Field Inputs:** Text inputs, textareas, booleans, and dropdown selectors.
- **Test Step Button:** Dispatches a test call and displays live sample output data.

### The Portal Layered Variable Picker (Eye/Tag Icon)
- **Inline Variable Button:** Positioned on the right side of every field input.
- **React Portal Layering (`zIndex: 150`):** Teleported directly to `document.body` so it opens unblocked in front of the setup drawer (`zIndex: 70`).
- **Pill Insertion:** Clicking any upstream output pill (e.g. `{{trigger.body.customer_name}}`) inserts the dynamic variable into the input field.

### AI Workflow Assistant Floating Panel (`AIWorkflowAssistant`)
- Available as a minimized floating pill at the bottom of the canvas (`🪄 AI Assistant`).
- Expanding it opens a docked side panel where you can type prompts (e.g., *"Add a delay of 2 hours before sending Slack message"*).
- The assistant automatically inserts, connects, and configures the new node on your live canvas!

---

## 5. Section 4: Action Builder Studio (`/custom-actions`)

The dedicated IDE for building **Custom (Private) Actions** without full OAuth application overhead.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ /custom-actions                                                                                  │
├──────────────────────┬────────────────────────────────────────────────────┬──────────────────────┤
│ PANEL 1: CATALOG     │ PANEL 2: AI CODE STUDIO                            │ PANEL 3: SANDBOX     │
│                      │                                                    │                      │
│ • Recents Counter    │ • Breadcrumb & Live Status                         │ • Test Action Form   │
│ • + New Action Btn   │ • Empty Hero: Headline, Subheading & App Marquee   │ • Password Vault Eye │
│ • Search Filter      │ • 4 Suggestion Chips (Sheets, Slack, etc.)         │ • Dynamic Parameters │
│ • Action Cards       │ • "Here's what I'll change" Code Diff Card         │ • Run Test Button    │
│ • 3-Dots Menu        │ • Ready to Deploy Card (Draft/Deployed Badges)     │ • 200 OK & Latency ms│
│   (Rename, Live, Del)│ • View Code / Test Action / Deploy Live Buttons    │ • Test History Logs  │
│ • Drag Resizer       │ • Typewriter Animated Prompt Dock with Blinking |  │ • TypeScript Viewer  │
└──────────────────────┴────────────────────────────────────────────────────┴──────────────────────┘
```

### Panel 1: Action Catalog Sub-Sidebar
- **`+ New` Button:** Starts a fresh draft action.
- **Search Bar:** Real-time action search with credential autofill shield.
- **Cards List:** Displays `Draft` (slate) vs. `Live` (emerald) badges.
- **3-Dots Menu:** In-place renaming, 1-click `Make Live` / `Move to Draft` toggle, and safe deletion.

### Panel 2: Central AI Conversation & Code Studio
- **Hero State:** Friendly, non-technical subheading:
  > *"Create custom actions in seconds. Just describe what you want to automate or paste an API / cURL, and I'll build everything ready to use in your workflows — no coding required."*
- **Diff Breakdown Card ("Here's what I'll change"):** Numbered line additions and parameter validations.
- **Ready to Deploy Card:**
  - Displays neutral **`Draft`** badge until live deployment is confirmed.
  - Three action buttons: **`View Code`**, **`Test Action`**, and **`Deploy Live`**.
- **Typewriter Prompt Dock:** Cycles inspiring prompts letter-by-letter with a real-time blinking cursor (`|`). Automatically pauses the moment the user types or pastes a cURL command.

### Panel 3: Right Live Sandbox Drawer
- **Tabs:** `Test Action`, `Test History`, `View Code`.
- **Wide Mode Toggle (`Maximize2` / `Minimize2`):** Switches drawer width between standard 460px and wide 720px.
- **Test Harness:** Real HTTP test runner with masked token input, **Eye Toggle Button (`Eye` / `EyeOff`)**, latency metrics (ms), `200 OK` status, and formatted JSON viewer with 1-click clipboard copy.

### Deploy Confirmation Modal (`DeployConfirmModal`)
- Triggered by clicking **Deploy Live**.
- Allows confirming or renaming the **Action Name** before publication.
- On confirmation, updates status to **`Live`**, switches card badges to **`Deployed`**, and synchronizes with the Workflow Canvas.

---

## 6. Section 5: Execution History & Logs (`/history`)

The **Execution History** portal provides transparent observability into every automation run.

### Execution Table & Real-Time Filter Pills
- **Filters:** Quick filter by `All`, `Success` (green), `Failed` (red), or `Running` (blue).
- **Table Columns:**
  - *Workflow Name:* Clickable link to canvas.
  - *Trigger Event:* Trigger type and source payload ID.
  - *Execution Status:* Badge indicator.
  - *Duration:* Total execution time (e.g. `248ms`).
  - *Timestamp:* Exact date and time.

### Detailed Execution Inspector Drawer
Clicking any execution row opens a side inspection drawer:
- **Visual Step Timeline:** Shows every step in the pipeline with individual green checkmarks or red error boundaries.
- **Input / Output Payload Inspector:** Full JSON trees showing what entered and exited each step.
- **Error Tracebacks:** Detailed stack traces and HTTP response codes for fast debugging.

### The `Retry Execution` Action
- Reruns the exact workflow run with the original trigger payload. Essential for resolving transient API rate limits or network dropouts without re-triggering external forms.

---

## 7. Section 6: Connections Vault (`/connections`)

The **Connections Vault** centralizes all external account authorizations across your workspace.

### Authorized App Accounts Table
- Lists all connected platforms (Google, Slack, HubSpot, Shopify, Custom APIs).
- Displays account identity (e.g., `user@company.com`, `Workspace: Acme Corp`), authorization type (OAuth 2.0, Bearer Token, API Key), and connection date.

### `+ Add Connection` Modal
- Opens a searchable app picker. Selecting an app launches its OAuth consent screen or prompts for API credentials with input guidelines.

### Connection Actions
- **`Test Connection` Button:** Sends a background ping (`GET /v1/me`) to confirm credentials are still valid.
- **`Reconnect` Button:** Refreshes expired OAuth tokens.
- **`Delete` Button:** Safely revokes and removes the connection.

---

## 8. Section 7: Developer Platform Hub (`/developer`)

The **Developer Platform** enables teams to build, test, and distribute full-scale integration apps with OAuth 2.0, multi-auth, dynamic triggers, and in-built background actions.

### The 8 App Builder Tabs
1. **`Overview`:** App metadata, name, description, category, and app icon upload.
2. **`Authentication`:** Supports OAuth 2.0, Bearer Token, API Key, Basic Auth, and Custom Header Parameters.
3. **`Triggers`:** Instant Catch Webhooks, REST Hook subscriptions, and Polling schedules.
4. **`Actions`:** Standard user-facing workflow actions with HTTP verbs (`POST`, `PUT`, `DELETE`).
5. **`In-built Actions`:** 6 background action types for dynamic dropdowns and lifecycle management.
6. **`Sandbox`:** Live testing console with environment secrets injection (`{{common.KEY}}`).
7. **`Sharing & Collaboration`:** Invite team developers with Role-Based Access Control.
8. **`Publish & Verification`:** Submit app for workspace or global marketplace review.

### The Zero-Task Credit In-Built Actions Engine
- Background micro-actions (e.g., fetching a list of Slack channels for a dropdown) are **100% Free** and **never consume user task credits**.

---

## 9. Section 8: Settings, Workspace & Team RBAC (`/settings`)

Centralized administrative panel for team governance and workspace defaults.

### Settings Sub-Sidebar Navigation
- **`General`:** Workspace title, timezone, and regional date/time formats.
- **`Team & Members`:** Invite collaborators and assign RBAC roles (`Admin`, `Builder`, `Viewer`).
- **`API Keys`:** Generate workspace API tokens for headless workflow triggering.
- **`Security & Audit`:** SSO settings, 2FA enforcement, and session termination.
- **`Notifications`:** Email and webhook alerts for workflow failures.

---

## 10. Section 9: Templates Marketplace & Billing (`/templates`, `/billing`)

### Templates Marketplace (`/templates`)
- Curated collection of pre-configured automation templates.
- **`Use Template` Button:** Clones the complete pipeline into your canvas in 1 click, leaving only account connections to be selected.

### Billing & Usage (`/billing`)
- **Task Credit Meter:** Visual progress bar tracking monthly task consumption against subscription limits.
- **`Change Plan` / `Upgrade` Button:** Opens tiered pricing plans (Free, Pro, Enterprise).
- **Invoice History:** Downloadable PDF receipts for accounting.

---

## 11. Master Application Element & Action Matrix

| Component / Button | Page / Location | Icon | Primary Function | Interaction & Result |
| :--- | :--- | :--- | :--- | :--- |
| **`Chat` Link** | Primary Sidebar | `SquarePen` | Opens conversational studio | Navigates to `/chat` |
| **`Workflow` Link** | Primary Sidebar | `Layers` | Opens workflows manager | Navigates to `/workflows` |
| **`Folders` Toggle** | Primary Sidebar | `Folder` | Toggles folder panel | Slides open `FoldersSubSidebar` |
| **`History` Link** | Primary Sidebar | `History` | Opens execution logs | Navigates to `/history` |
| **`Action Builder` Link**| Primary Sidebar | `Zap` | Opens custom action IDE | Navigates to `/custom-actions` |
| **`Connections` Link** | Primary Sidebar | `Link2` | Opens credentials vault | Navigates to `/connections` |
| **`Settings` Toggle** | Primary Sidebar | `Settings` | Toggles settings panel | Slides open `SettingsSubSidebar` |
| **`+ Create Workflow`** | Workflows Header | `Plus` | Initializes blank workflow | Opens `/workflows/editor` |
| **Status Toggle** | Workflow Card | Switch | Activates/pauses triggers | Toggles live execution state |
| **`Publish Live`** | Canvas Top Bar | `Rocket` | Deploys workflow to workers | Publishes live canvas version |
| **`Layout Switcher`** | Canvas Bottom Toolbar | `ArrowUpDown` | Toggles vertical/horizontal | Re-renders SVG layout |
| **`Variable Picker`** | Canvas Setup Drawer | `Eye` / `Tag` | Dynamic pill insertion | Opens portal modal at `zIndex: 150` |
| **`+ New` (Action)** | Action Builder Catalog| `Plus` | Creates blank action draft | Resets studio to Hero view |
| **Typewriter Input** | Action Builder Dock | `|` cursor | Accepts prompts & cURLs | Animated typing + pause on input |
| **`View Code` Button** | Action Builder Ready | `Code2` | Inspects TypeScript code | Switches drawer to `view_code` |
| **`Test Action` Button**| Action Builder Ready | `Play` | Opens sandbox test runner | Switches drawer to `test_action` |
| **`Deploy Live` Button**| Action Builder Ready | `Rocket` | Triggers deploy confirmation | Opens `DeployConfirmModal` |
| **Eye Toggle** | Sandbox Drawer Auth | `Eye` / `EyeOff` | Reveals/masks secret tokens | Switches input password ↔ text |
| **`Run Test Request`** | Sandbox Drawer | `Play` | Executes test API call | Dispatches request, shows latency |
| **`Retry Execution`** | History Inspector | `RotateCw` | Reruns failed automation | Dispatches original payload |

---

*Automate Workflows Documentation Team — September 2026*
