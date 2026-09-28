# Automate Workflows Platform — Complete Tab-by-Tab & Button-by-Button Master Guide (Hinglish)

> **Poori Application Ka A-to-Z Guide, Tab-by-Tab, Button-by-Button aur Drawer-by-Drawer (Hinglish Edition)**
> 
> *Automate Workflows platform ke har ek page, tab, sub-sidebar, drawer, button, modal, form input, aur status toggle ka comprehensive, aasan Hinglish guide.*

---

## 📑 Table of Contents (Vishay Suchi)

1. [Global Application Shell aur Navigation](#1-global-application-shell-aur-navigation)
   - [Primary Collapsible Sidebar](#primary-collapsible-sidebar)
   - [Global Top Navigation Bar (`Navbar`)](#global-top-navigation-bar)
   - [Flyout Sub-Sidebars (Folders, Settings, App Builder)](#flyout-sub-sidebars)
2. [Section 1: AI Chat Automation Studio (`/chat`)](#2-section-1-ai-chat-automation-studio)
   - [Hero State aur Workflow Ideas Marquee](#chat-hero-state)
   - [Voice Dictation aur Ambient Prompt Dock](#voice-dictation-aur-prompt-dock)
   - [AI Multi-Step Workflow Generation aur Plan Cards](#ai-multi-step-generation)
   - [`Direct Canvas View` aur `Copy Schema` Buttons](#direct-canvas-view-aur-copy-schema)
3. [Section 2: Workflows Management aur Folders (`/workflows`)](#3-section-2-workflows-management-aur-folders)
   - [Top Action Bar (`+ Create Workflow`, Search, Filters)](#workflows-top-action-bar)
   - [Folders Sub-Sidebar aur Organization](#folders-sub-sidebar)
   - [Workflow Cards, Status Toggles aur 3-Dot Menus](#workflow-cards-aur-actions)
4. [Section 3: Visual Workflow Canvas Editor (`/workflows/editor`)](#4-section-3-visual-workflow-canvas-editor)
   - [Top Editor Bar (Title Rename, Status Toggle, Test, Publish)](#editor-top-bar)
   - [Master Infinite Canvas aur Layout Switcher (Vertical vs Horizontal)](#master-canvas-aur-layouts)
   - [Step 1: Choose App Drawer aur Category Filter Pills](#step-1-choose-app-drawer)
   - [Step 2: Setup Details Drawer (Events, Accounts, Fields)](#step-2-setup-details-drawer)
   - [Portal Layered Variable Picker (Eye/Tag Icon)](#variable-picker-architecture)
   - [AI Workflow Assistant Floating Panel (`AIWorkflowAssistant`)](#ai-workflow-assistant-panel)
5. [Section 4: Action Builder Studio (`/custom-actions`)](#5-section-4-action-builder-studio)
   - [Panel 1: Action Catalog Sub-Sidebar (`+ New`, Search, 3-Dots)](#action-builder-panel-1)
   - [Panel 2: Central AI Conversation aur Code Studio](#action-builder-panel-2)
   - [Panel 3: Right Live Sandbox Drawer (`Test Action`, `History`, `View Code`)](#action-builder-panel-3)
   - [Deploy Confirmation Modal aur Canvas Synchronization](#action-builder-deploy-modal)
6. [Section 5: Execution History aur Logs (`/history`)](#6-section-5-execution-history-aur-logs)
   - [Execution Table aur Real-Time Filter Pills (All, Success, Failed)](#execution-table-aur-filters)
   - [Detailed Execution Inspector Drawer (Timelines, Payloads, Tracebacks)](#execution-inspector-drawer)
   - [`Retry Execution` Button](#retry-execution-action)
7. [Section 6: Connections Vault (`/connections`)](#7-section-6-connections-vault)
   - [Authorized App Accounts Table](#authorized-app-accounts)
   - [`+ Add Connection` Modal aur OAuth / API Key Flows](#add-connection-modal)
   - [Reconnect, Test aur Delete Connection Buttons](#connection-actions)
8. [Section 7: Developer Platform Hub (`/developer`)](#8-section-7-developer-platform-hub)
   - [Developer Apps List aur `+ Create Custom App`](#developer-apps-list)
   - [App Builder ke 8 Tabs (Auth, Triggers, Actions, In-Built Actions, Sandbox, etc.)](#the-8-app-builder-tabs)
   - [Zero-Task Credit In-Built Actions Engine](#in-built-actions-engine)
9. [Section 8: Settings, Workspace aur Team RBAC (`/settings`)](#9-section-8-settings-workspace-aur-team-rbac)
   - [Settings Sub-Sidebar Navigation](#settings-sub-sidebar)
   - [Workspace Details, Team Members, API Keys aur Notifications](#workspace-settings-tabs)
10. [Section 9: Templates Marketplace aur Billing (`/templates`, `/billing`)](#10-section-9-templates-marketplace-aur-billing)
    - [1-Click Template Cloning](#templates-cloning)
    - [Task Credit Meter aur Plan Upgrades](#task-credit-meter)
11. [Master Application Element & Action Matrix (Summary Table)](#11-master-application-element-and-action-matrix)

---

## 1. Global Application Shell aur Navigation

Automate Workflows ka poora application structure `AppShell.tsx` ke through chalta hai, jo main navigation sidebar, top navbar, aur sliding sub-sidebars ko smoothly coordinate karta hai:

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

### Primary Collapsible Sidebar
Poori application ke har page par left side mein rehta hai:
- **Logo Area:**
  - *Expanded (`w-56`):* Poora `Automate Business` branding text dikhta hai.
  - *Collapsed (`w-16`):* Square `A` icon dikhta hai. Ispe click karte hi `/chat` par redirect hota hai.
- **Main Navigation Items:**
  1. **`Chat` (`/chat`, `SquarePen` Icon):** AI chat ke zariye natural language se workflow banane ka studio.
  2. **`Workflow` (`/workflows`, `Layers` Icon):** Saare active/paused workflows dekhne ka master page.
  3. **`Folders` (`#folders`, `Folder` Icon):** Folders Sub-Sidebar open karta hai.
  4. **`History` (`/history`, `History` Icon):** Workflow execution logs aur runs ka audit trail.
  5. **`Action Builder` (`/custom-actions`, `Zap` Icon):** AI-powered custom action code studio.
  6. **`Connections` (`/connections`, `Link2` Icon):** Connected app accounts aur OAuth tokens ka vault.
- **Bottom Navigation Items:**
  - **`Settings` (`/settings`, `Settings` Icon):** Settings sub-sidebar open karta hai.
  - **`Create Custom App` (`/developer`, `Code2` Icon):** Developer platform ka shortcut.
  - **`Get Help & Templates` (`/templates`, `HelpCircle` Icon):** Ready-made templates marketplace.
  - **User Profile Row:** Avatar, user name, plan status aur logout access.

### Global Top Navigation Bar (`Navbar`)
- **Global Search Input:** Workflows, IDs ya Webhook URLs search karne ke liye (`Ctrl + K`).
- **`Upgrade` Button:** Current plan status aur task usage dikhata hai, click karne par upgrade popup aata hai.
- **Theme Switcher (`Sun` / `Moon`):** Light mode aur sleek dark mode ke beech instant switch karta hai.
- **Notification Bell (`Bell`):** Failed workflows, token expiration aur system updates ka dropdown.
- **User Avatar / Workspace Switcher:** Team workspaces ke beech switch karne ke liye.

### Flyout Sub-Sidebars
Jab aap **Folders**, **Settings** ya **Developer App** par click karte hain, to ek secondary panel slide hokar aata hai:
- **Auto-Collapse Logic:** Jab koi sub-sidebar open hota hai, to primary sidebar automatically `w-16` icon-only mode mein shrink ho jaata hai taaki screen par central page ko full space mile!

---

## 2. Section 1: AI Chat Automation Studio (`/chat`)

Chat Studio un users ke liye hai jo canvas par manual drag-and-drop kiye bina **sirf baat karke (conversational prompting)** poora automation pipeline banana chahte hain.

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

### Hero State aur Workflow Ideas Marquee
- **Ideas Marquee:** Screen par scrolling idea chips hoti hain. Kisi bhi chip par click karne se prompt input box mein idea auto-fill ho jaata hai.
- **Voice Dictation Button (`Mic` / `MicOff`):** Agar aapko type nahi karna, to mic button click karke bol kar prompt dictate kar sakte hain. Active hone par red glow ke sath pulse karta hai.
- **Send Arrow Button:** Prompt bhejne ke liye.

### AI Multi-Step Workflow Generation
- AI analyze karta hai ki trigger kaunsa hai aur actions kaunse hain.
- Pipeline cards banakar deta hai: `Step 0: Trigger`, `Step 1: Action`, `Step 2: Action`.
- **`Copy Schema` Button:** Generated JSON blueprint ko clipboard par copy karta hai.
- **`Direct Canvas View` Button (`ArrowRight`):** Is button par click karte hi canvas open ho jaata hai jisme yeh saare steps pehle se live place aur connect huye milte hain!

---

## 3. Section 2: Workflows Management aur Folders (`/workflows`)

Yeh page aapke workspace ke saare live, paused aur draft automations ko manage karta hai.

### Top Action Bar
- **`+ Create Workflow` Button (Blue Primary):** Visual Canvas Editor (`/workflows/editor`) mein naya blank workflow kholta hai.
- **Search Bar:** Workflow name ya webhook URL se instant search.
- **Filter Tabs:** `All`, `Active`, `Paused`, `Draft`.

### Folders Sub-Sidebar
- Workflows ko client-wise ya department-wise categorize karne ke liye (jaise: `Marketing`, `Sales`, `IT Ops`).
- **`+ New Folder` Button:** Naya folder create karta hai.
- Drag-and-drop se workflows ko folders mein move kiya ja sakta hai.

### Workflow Cards aur Actions
- **Live Status Toggle:** Switch ko ON/OFF karke workflow ko active ya pause kiya ja sakta hai.
- **Run Metrics:** Kitni baar trigger hua (e.g. `1,420 runs`), success percentage, aur last execution time.
- **3-Dots Menu (`MoreVertical`):**
  - *Edit Workflow:* Canvas Editor mein open karta hai.
  - *Duplicate:* Exact copy clone karta hai.
  - *Move to Folder:* Dusre folder mein shift karta hai.
  - *Delete:* Workflow ko permanently remove karta hai.

---

## 4. Section 3: Visual Workflow Canvas Editor (`/workflows/editor`)

Visual Canvas Editor workflow design ka heart hai, jahan drag-and-drop, wiring, variable mapping aur real-time testing hoti hai.

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

### Top Editor Bar
- **Back Button (`ArrowLeft`):** Save karke workflow list par wapas bhejta hai.
- **Workflow Name:** Click karke workflow ka naam rename karein.
- **Draft/Active Switch:** Toggle karke decide karein ki live events capture karne hain ya nahi.
- **`Test Workflow` Button (`Play`):** Fake test payload bhejkar poore pipeline ka dry run karta hai.
- **`Publish Live` Button (Blue Primary):** Production workers par workflow deploy karta hai.

### Master Canvas aur Layout Switcher
- **Infinite Pan/Zoom:** Mouse wheel se zoom aur drag se canvas ghumayein.
- **`↕ / ↔ Layout Switcher` Button:** 1-click mein canvas ke SVG nodes ko Vertical (top-to-bottom) ya Horizontal (left-to-right) pipeline mein re-align karta hai!

### Step 1: Choose App Drawer
Canvas par kisi node ke `+` button par click karne se **App Drawer** open hota hai:
- **Category Filter Pills:**
  - `All`: Saari apps.
  - `Flow Control`: Router, Filter, Delay, Iterator.
  - `Utilities`: Text Formatter, Date Formatter, Code Runner, Webhook.
  - `SaaS Apps`: Slack, Google Sheets, Gmail, Stripe, Shopify.
  - `My Custom Apps (Dev)`: Developer platform par banayi gayi apps.
  - **`Private Actions (N)`:** Action Builder se banaye gaye custom actions!

### Step 2: Setup Details Drawer
Jab koi action node select hota hai, to right side se setup drawer slide hota hai:
- **Account Dropdown:** Connected account select karein ya naya authorize karein.
- **Action Event Dropdown:** Action operation chunein.
- **Dynamic Fields:** Inputs jinme values bharni hoti hain.

### Portal Layered Variable Picker (Eye/Tag Icon)
- Har input field ke right edge par **Variable Picker** icon hota hai.
- Click karne par **Variable Picker Modal** open hota hai jahan se aap pichhle steps ke outputs (`{{trigger.body.email}}`) direct select kar sakte hain.
- **Layering Architecture:** Variable Picker React Portal ke zariye direct `document.body` par `zIndex: 150` par open hota hai taaki setup drawer (`zIndex: 70`) ke piche na dabe.

### AI Workflow Assistant Floating Panel (`AIWorkflowAssistant`)
- Canvas ke bottom mein `🪄 AI Assistant` floating pill hoti hai.
- Ispe click karne par AI chat open hoti hai jahan prompt type karne par AI canvas par naye nodes khud insert aur connect kar deta hai.

---

## 5. Section 4: Action Builder Studio (`/custom-actions`)

Agar aapko kisi aisi API se connect karna hai jiska koi official connector exist nahi karta, to aap **Action Builder** use karte hain:

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

### Panel 1: Left Action Catalog
- **`+ New` Button:** Naya action shuru karta hai.
- **Search Bar:** Real-time search with autofill protection.
- **Badges:** `Draft` (gray) vs `Live` (green).
- **3-Dots Menu:** Rename, Make Live toggle, Delete.

### Panel 2: Center AI Conversation & Code Studio
- **Hero State:** Non-technical bhasha mein welcoming screen:
  > *"Create custom actions in seconds. Just describe what you want to automate or paste an API / cURL, and I'll build everything ready to use in your workflows — no coding required."*
- **"Here's what I'll change" Diff Card:** Line numbers ke sath additions aur checks ka summary.
- **Ready to Deploy Card:** `Draft` status badge aur 3 buttons:
  - `View Code`: Code viewer kholta hai.
  - `Test Action`: Sandbox test harness kholta hai.
  - `Deploy Live`: Action ko live karne ka popup kholta hai.
- **Typewriter Prompt Dock:** Prompt ideas real-time type hote hain blinking cursor (`|`) ke sath, aur user ke type karne par turant pause ho jaate hain.

### Panel 3: Right Live Sandbox Drawer
- **Tabs:** `Test Action`, `Test History`, `View Code`.
- **Wide Mode Button (`Maximize2` / `Minimize2`):** Width 460px se 720px karta hai.
- **Interactive Test Harness:** Real API call dispatch karta hai, **Eye Icon Toggle (`Eye` / `EyeOff`)** se token reveal/hide hota hai, `200 OK`, latency in ms aur formatted JSON response preview milta hai.

### Deploy Confirmation Modal (`DeployConfirmModal`)
- Action ka final name confirm karein aur `Deploy` dabayein — action turant live hokar canvas ke **Private Actions** tab mein sync ho jaata hai.

---

## 6. Section 5: Execution History aur Logs (`/history`)

Workflow executions ka live audit system:
- **Filter Pills:** `All`, `Success` (green), `Failed` (red), `Running` (blue).
- **Inspector Drawer:** Kisi bhi row par click karne se step-by-step visual timeline khulta hai, jisme input payload, output data aur error tracebacks inspect kiye ja sakte hain.
- **`Retry Execution` Button:** Failed run ko original payload ke sath dobara re-execute karta hai bina form dobara fill kiye.

---

## 7. Section 6: Connections Vault (`/connections`)

Aapke workspace ke saare authorized credentials ka safe locker:
- **Accounts Table:** Google, Slack, Shopify, Custom API ke tokens list hote hain.
- **`+ Add Connection` Button:** Naya OAuth consent screen ya API Key modal open karta hai.
- **Action Buttons:** `Test Connection` (validity check), `Reconnect` (token refresh), `Delete` (credential revocation).

---

## 8. Section 7: Developer Platform Hub (`/developer`)

Teams ke liye full-scale integration applications build karne ka portal:
- **8 App Builder Tabs:** `Overview`, `Authentication` (OAuth 2.0, Multi-Auth, API Key), `Triggers` (Webhooks/Polling), `Actions`, `In-built Actions`, `Sandbox`, `Sharing`, `Publish`.
- **Zero-Task Credit Guarantee:** In-built actions (jaise dropdown populate karna) hamesha 0 task credits lete hain aur user ka quota consume nahi karte.

---

## 9. Section 8: Settings, Workspace aur Team RBAC (`/settings`)

- **`General`:** Workspace details aur timezones.
- **`Team & Members`:** Team invite karna aur roles set karna (`Admin`, `Builder`, `Viewer`).
- **`API Keys`:** Workflows ko external system se trigger karne ke liye API tokens generate karna.
- **`Notifications`:** Workflow failure alerts email ya webhook par bhejna.

---

## 10. Section 9: Templates Marketplace aur Billing (`/templates`, `/billing`)

- **Templates (`/templates`):** Pre-built recipes (jaise Google Forms to Slack notification). `Use Template` dabate hi canvas par poora setup clone ho jaata hai.
- **Billing (`/billing`):** Monthly task credit limit, live usage meter, invoices aur plan upgrades.

---

## 11. Master Application Element & Action Matrix

| Button / Component | Page / Location | Icon | Primary Kaam (Function) | Click Par Kya Hota Hai? |
| :--- | :--- | :--- | :--- | :--- |
| **`Chat` Link** | Primary Sidebar | `SquarePen` | Conversational studio kholna | `/chat` page open hota hai |
| **`Workflow` Link** | Primary Sidebar | `Layers` | Workflows list dekhna | `/workflows` page open hota hai |
| **`Folders` Toggle** | Primary Sidebar | `Folder` | Folders sub-sidebar toggle karna | `FoldersSubSidebar` slide out hota hai |
| **`History` Link** | Primary Sidebar | `History` | Execution logs dekhna | `/history` page open hota hai |
| **`Action Builder` Link**| Primary Sidebar | `Zap` | Custom action studio kholna | `/custom-actions` page open hota hai |
| **`Connections` Link** | Primary Sidebar | `Link2` | Credentials vault kholna | `/connections` page open hota hai |
| **`Settings` Toggle** | Primary Sidebar | `Settings` | Settings sub-sidebar toggle | `SettingsSubSidebar` slide out hota hai |
| **`+ Create Workflow`** | Workflows Header | `Plus` | Naya workflow shuru karna | Canvas Editor `/workflows/editor` open hota hai |
| **Status Switch** | Workflow Card | Toggle | Workflow active/pause karna | Live trigger execution state change hoti hai |
| **`Publish Live`** | Canvas Top Bar | `Rocket` | Production workers par bhejna | Live version publish hota hai |
| **`Layout Switcher`** | Canvas Toolbar | `ArrowUpDown` | Vertical/Horizontal switch | SVG tree layout re-render hota hai |
| **`Variable Picker`** | Setup Drawer | `Eye` / `Tag` | Upstream variables map karna | Portal modal direct drawer ke aage open hota hai |
| **`+ New` (Action)** | Action Builder Catalog| `Plus` | Naya action draft shuru karna | Studio blank Hero View mein switch hota hai |
| **Typewriter Input** | Action Builder Dock | `|` cursor | Prompt ya cURL paste karna | Live typing animation chalti hai |
| **`View Code` Button** | Action Builder Ready | `Code2` | TypeScript code dekhna | Right drawer ka `view_code` tab open hota hai |
| **`Test Action` Button**| Action Builder Ready | `Play` | Sandbox runner open karna | Right drawer ka `test_action` tab open hota hai |
| **`Deploy Live` Button**| Action Builder Ready | `Rocket` | Live deployment modal kholna | `DeployConfirmModal` popup open hota hai |
| **Eye Toggle Button** | Sandbox Drawer Auth | `Eye` / `EyeOff` | Secret token reveal/hide | Input type password ↔ text switch hota hai |
| **`Run Test Request`** | Sandbox Drawer | `Play` | Live test call dispatch karna | Spinner chalta hai aur real latency/status aati hai |
| **`Retry Execution`** | History Inspector | `RotateCw` | Failed run ko rerun karna | Original payload ke sath step dubara chalta hai |

---

*Automate Workflows Documentation Team — September 2026*
