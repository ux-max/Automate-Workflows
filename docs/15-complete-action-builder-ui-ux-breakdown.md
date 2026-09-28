# Action Builder UI/UX Master Reference — Tab-by-Tab & Button-by-Button Guide

> **Comprehensive Visual Layout, Component Dictionary & Interaction Blueprint**
> 
> *A granular, element-by-element reference explaining every screen, panel, tab, drawer, button, modal, badge, and input state in the Automate Workflows Action Builder studio and its Workflow Canvas integration.*

---

## 📑 Table of Contents

1. [Architectural Overview of the 3-Panel Layout](#1-architectural-overview-of-the-3-panel-layout)
2. [Panel 1: Left Action Catalog (Sub-Sidebar)](#2-panel-1-left-action-catalog-sub-sidebar)
   - [Panel Header & Controls (`Recents`, `+ New`, Collapse Button)](#panel-1-header-and-controls)
   - [Search Input & Auto-fill Shield](#search-input-and-auto-fill-shield)
   - [Action List Cards & Badges (`Draft` vs `Live`)](#action-list-cards-and-badges)
   - [The 3-Dots Action Context Menu (`Rename`, `Toggle Publish/Draft`, `Delete`)](#the-3-dots-action-context-menu)
   - [Catalog Resizer Drag Handle](#catalog-resizer-drag-handle)
3. [Panel 2: Central AI Conversation & Code Studio](#3-panel-2-central-ai-conversation-and-code-studio)
   - [Studio Header Bar (Breadcrumbs, Status Pills & Collapse Toggles)](#studio-header-bar)
   - [Hero State (Empty State Before Prompting)](#hero-state-empty-state-before-prompting)
     - [Headline & Simplified Subheading](#headline-and-subheading)
     - [Moving 3-Column App Cluster](#moving-3-column-app-cluster)
     - [4 Quick Suggestion Chips (Sheets, Slack, Shopify, Custom Webhook)](#4-quick-suggestion-chips)
   - [Active Conversation Stream (Message Flow)](#active-conversation-stream)
     - [User Message Bubble](#user-message-bubble)
     - [AI Thinking Accordion & Timer](#ai-thinking-accordion-and-timer)
     - ["Here's what I'll change" Code Diff Card](#heres-what-ill-change-code-diff-card)
     - ["Ready to Deploy" Card & Action Buttons](#ready-to-deploy-card-and-action-buttons)
       - [`View Code` Button](#view-code-button)
       - [`Test Action` Button](#test-action-button)
       - [`Deploy Live` Button](#deploy-live-button)
     - [Live Status Banner](#live-status-banner)
   - [Ambient Glowing Prompt Dock](#ambient-glowing-prompt-dock)
     - [Animated Gradient Glow & Border Rings](#animated-gradient-glow-and-border-rings)
     - [Typewriter Input Area (Live Animated Typing Placeholder & Blinking Cursor)](#typewriter-input-area)
     - [Bottom Action Dock Toolbar (`Test actions`, `Send` Arrow Button)](#bottom-action-dock-toolbar)
4. [Panel 3: Right Live Sandbox & Test Drawer](#4-panel-3-right-live-sandbox-and-test-drawer)
   - [Drawer Navigation Header (`TabsList`, `Wide Mode`, `Close`)](#drawer-navigation-header)
   - [Tab 1: `Test Action` (Interactive Test Harness)](#tab-1-test-action-interactive-test-harness)
     - [Action Meta Box](#action-meta-box)
     - [Authentication Input & Show/Hide Eye Toggle](#authentication-input-and-showhide-eye-toggle)
     - [Dynamic Parameter Fields & Input Controls](#dynamic-parameter-fields-and-input-controls)
     - [`Test Action` Execution Button & Loading Spinner](#test-action-execution-button-and-loading-spinner)
     - [Response Viewer (Status Code, Latency, Copy JSON, Formatted Body)](#response-viewer)
   - [Tab 2: `Test History` (Execution Audit Trail)](#tab-2-test-history-execution-audit-trail)
   - [Tab 3: `View Code` (Integrated Code Viewer)](#tab-3-view-code-integrated-code-viewer)
   - [Drawer Resizer Drag Handle](#drawer-resizer-drag-handle)
5. [System Modals & Dialogs](#5-system-modals-and-dialogs)
   - [1. Deploy Custom Action Confirmation Modal (`DeployConfirmModal`)](#1-deploy-custom-action-confirmation-modal)
   - [2. Rename Action Modal](#2-rename-action-modal)
   - [3. Delete Confirmation Modal (`ConfirmModal`)](#3-delete-confirmation-modal)
   - [4. Fullscreen Code Viewer Modal (`CodeViewerModal`)](#4-fullscreen-code-viewer-modal)
6. [Workflow Canvas Integration (End-User Experience)](#6-workflow-canvas-integration-end-user-experience)
   - [App Drawer Category Filter Pill: `Private Actions (N)`](#app-drawer-category-filter-pill-private-actions)
   - [Private Action Cards in Canvas Drawer](#private-action-cards-in-canvas-drawer)
   - [Canvas Node Appearance (Vertical & Horizontal SVG Trees)](#canvas-node-appearance)
   - [Setup Details Drawer & Layered Variable Picker](#setup-details-drawer-and-layered-variable-picker)
7. [Comprehensive Interactive Element Matrix (Master Summary)](#7-comprehensive-interactive-element-matrix)

---

## 1. Architectural Overview of the 3-Panel Layout

Action Builder (`/custom-actions`) is built on a responsive, high-efficiency **3-Panel Unified Container**. This layout mirrors modern developer IDEs (like VS Code or Cursor) combined with modern AI conversational interfaces (like ChatGPT and Claude):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             TOP APP BAR & NAVIGATION                                             │
├──────────────────────┬────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ PANEL 1: CATALOG     │ PANEL 2: AI CONVERSATION & STUDIO                          │ PANEL 3: SANDBOX DRAWER       │
│                      │                                                            │ (Contextual / Collapsible)    │
│ • Recents Counter    │ • Action Breadcrumb & Live Status Pill                     │ • Tabs: Test / History / Code │
│ • + New Action Btn   │ • Left / Right Drawer Toggle Buttons                       │ • Wide Mode (460px ↔ 720px)   │
│ • Search Filter      │ • Hero / Prompt Suggestions / Active Chat Feed             │ • Credential Vault & Eye Icon │
│ • Action Cards       │ • Code Diff Breakdown Card ("Here's what I'll change")     │ • Dynamic Field Inputs        │
│ • 3-Dots Menu:       │ • Ready to Deploy Card (Draft/Live Badges, 3 Action Btns)  │ • Live HTTP Request Runner    │
│   - Rename           │ • Ambient Glow Prompt Dock with Live Typewriter Placeholder│ • Response Inspector (Latency)│
│   - Toggle Live      │ • Send Button                                              │ • Execution History Trail     │
│   - Delete           │                                                            │ • Syntax-Highlighted Code     │
│ • Width Drag Resizer │                                                            │ • Width Drag Resizer          │
└──────────────────────┴────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Panel 1: Left Action Catalog (Sub-Sidebar)

The Left Catalog organizes and maintains all custom actions created in your team workspace.

### Panel 1 Header and Controls
- **`RECENTS` Label:** Uppercase section header indicating the historical action inventory.
- **`X Custom Actions` Counter:** Dynamic counter showing total actions currently stored in the workspace.
- **`+ New` Button (Blue Primary):**
  - *Icon:* `Plus`
  - *Purpose:* Initializes a blank draft action (`Untitled Action` under `New Action`), switches active selection, and resets the center studio to the clean Hero State.
  - *Why it exists:* Allows instant creation of a new action without overwriting current work.
- **Collapse Button (`PanelLeftClose`):**
  - *Icon:* Left panel dock icon.
  - *Purpose:* Collapses the left catalog to 0px width with smooth CSS transition.
  - *Why it exists:* Maximizes horizontal screen real estate for wide prompt chats or code diff inspection.

### Search Input and Auto-fill Shield
- **Search Bar Input:**
  - *Placeholder:* `"Search actions..."`
  - *Purpose:* Real-time, instant fuzzy filter across action names, app categories, and descriptions.
  - *Auto-fill Shield Mechanism:* Includes defense attributes (`autoComplete="new-password"`, regex email check) to prevent password managers (1Password, LastPass, Chrome Autofill) from automatically injecting your login email into the search bar.
- **Clear Search Button (`X`):**
  - Appears dynamically inside the right side of the search input when text is entered. Clears query on click.

### Action List Cards and Badges
Every custom action card in the list displays:
- **Application Title:** Primary classification (e.g. `Custom API`, `Google Sheets`, `Shopify`).
- **Action Name:** Specific task name (e.g. `Execute Webhook Action`, `Delete Sheet`).
- **Status Badge:**
  - **`Draft` (Slate Pill):** Indicates the action is currently in development or has un-deployed changes.
  - **`Live` (Emerald Pill):** Indicates the action is published and immediately selectable in Workflow Canvas.
- **Selected State:** Blue left accent border, soft blue background tint (`bg-blue-50/50 dark:bg-blue-950/30`), and highlighted text.

### The 3-Dots Action Context Menu
Hovering over any card reveals the `MoreVertical` (3-dots) menu button:
1. **`Rename` (`Pencil` Icon):**
   - *Why it exists:* Allows modifying the action display name without re-entering chat or redeploying code.
   - *Action:* Opens the Rename Modal with an autofocus input.
2. **`Make Live` / `Move to Draft` (`CheckCircle2` Icon):**
   - *Why it exists:* Immediate toggle switch to publish or unpublish an action from the Workflow Canvas without deleting it.
   - *Action:* Toggles status between `"live"` and `"draft"` and triggers a confirmation toast notification.
3. **`Delete Action` (`Trash2` Red Icon):**
   - *Why it exists:* Safely removes retired actions.
   - *Action:* Opens the safety Delete Confirmation Modal.

### Catalog Resizer Drag Handle
- Located on the right border of the catalog.
- Allows smooth mouse-drag resizing between **240px and 480px** with active hover glow.

---

## 3. Panel 2: Central AI Conversation & Code Studio

The center panel is the conversational and visual intelligence engine of Action Builder.

### Studio Header Bar
- **Collapse Toggle Button (`PanelLeftOpen` / `PanelLeftClose`):** Expands or collapses the left catalog.
- **Breadcrumb:** Shows `[App Name] • [Action Name]` (e.g. `Custom API • Execute Webhook Action`).
- **Timestamp:** Displays the last updated or created time (e.g. `04:59 PM`).
- **`Live in Workflows` Indicator Pill:**
  - Displays an emerald pulsing dot (`animate-pulse`) and green text when `action.status === "live"`.
  - Hidden when in Draft state to prevent status confusion.

---

### Hero State (Empty State Before Prompting)
When opening a new action with no messages, the studio presents a clean, welcoming canvas:

#### Headline and Subheading
- **Headline:** `Build any action, [User Name].`
- **Subheading (Simplified & Understandable):**
  > *"Create custom actions in seconds. Just describe what you want to automate or paste an API / cURL, and I'll build everything ready to use in your workflows — no coding required."*
  - *Why this wording:* Replaces intimidating developer jargon with plain English, highlighting that you can describe your goal or paste a cURL command without writing code.

#### Moving 3-Column App Cluster
- An animated marquee cluster of popular integration icons (Slack, Google Sheets, Shopify, Webhook, HubSpot, etc.).
- Clicking any icon automatically populates a starter prompt (e.g., *"Create an action for Google Sheets"*).

#### 4 Quick Suggestion Chips
Clickable starter cards tailored for common automation challenges:
1. **Delete Sheet in Google Sheets** (Sheets API batchUpdate)
2. **Send Ephemeral Slack Alert** (Slack chat.postEphemeral)
3. **Cancel Order in Shopify** (E-Commerce cancellation & refund)
4. **Custom Webhook Client Sync** (HMAC-signed REST webhook)

---

### Active Conversation Stream
Once an action is initialized with prompts, the feed transitions to the interactive studio:

#### User Message Bubble
- Dark modern bubble aligned to the right showing the prompt and timestamp.

#### AI Thinking Accordion and Timer
- **Thinking Header:** Shows `Thinking time: 12.8 seconds` with an accordion chevron.
- **Purpose:** Gives users visual feedback while complex API endpoints and TypeScript schemas are being generated. Can be collapsed or expanded to review reasoning steps.

#### "Here's what I'll change" Code Diff Card
- Displays an emerald **`Applied`** badge.
- Numbered breakdown of modifications (e.g., `1. Add after line 48: Implemented handler for Execute Webhook Action`, `2. Add after line 64: Added parameter validation and error boundary checks`).
- *Why it exists:* Provides complete transparency into code changes without forcing users to read raw code line-by-line.

#### "Ready to Deploy" Card and Action Buttons
An amber-accented card that appears whenever new or updated code is generated:
- **Card Title:**
  - When in Draft: *"Your updated action is ready to deploy"*
  - When Live: *"Action is live & deployed"*
- **Line Count:** Shows generated code volume (e.g. `78 lines`).
- **Dynamic Status Badge:**
  - Displays neutral **`Draft`** badge when not yet deployed.
  - Displays green **`Deployed`** badge only after you confirm live deployment.
- **Action Buttons:**
  1. **`View Code` Button (`Code2` Icon):**
     - Opens the right drawer directly to the **View Code** tab so you can inspect generated TypeScript.
  2. **`Test Action` Button (`Play` Icon):**
     - Opens the right drawer directly to the **Test Action** interactive sandbox.
  3. **`Deploy Live` / `Redeploy Live` Button (`CheckCircle2` Icon):**
     - Blue primary call-to-action that launches the **Deploy Custom Action** confirmation modal.

#### Live Status Banner
- A green celebration card appearing below the ready card when `action.status === "live"`:
  > *"Action is live! Ready for selection in Workflow Canvas."*

---

### Ambient Glowing Prompt Dock
Positioned permanently at the bottom of the studio with a modern ambient diffused glow:

#### Animated Gradient Glow and Border Rings
- Dual-layer CSS blur rings (`ai-ambient-gradient`) that pulse on focus, providing an unmistakable, responsive aesthetic.

#### Typewriter Input Area
- **Interactive Multiline Textarea:**
- **Animated Typewriter Typing State:**
  - Cycles inspiring, realistic prompt ideas character-by-character with a realistic 34ms typing speed.
  - Displays an authentic blinking pipe cursor (`|`).
  - Pauses for ~3.2 seconds upon typing completion, then smoothly deletes backward and switches to the next idea.
  - *Instant Pause on Input:* The moment the user types a single key or pastes a cURL command, the animation pauses immediately so it never interrupts manual typing.

#### Bottom Action Dock Toolbar
- **`Test actions` Button:** Secondary button inside the dock to open the test harness once an action exists.
- **`Send` Arrow Button (Blue Circle):**
  - *State:* Disabled when input is empty or when AI generation is in progress.
  - *Action:* Dispatches prompt and triggers generation animation.

---

## 4. Panel 3: Right Live Sandbox & Test Drawer

The Right Drawer is a full-featured API workbench that slides out from the right edge.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [ Test Action ]  [ Test History (2) ]  [ View Code ]    [ ⤢ ]  [ ✕ ]   │
├────────────────────────────────────────────────────────────────────────┤
│ Action: Execute Webhook Action                                         │
│ Custom integration action generated via AI prompts                     │
├────────────────────────────────────────────────────────────────────────┤
│ AUTHENTICATION                                                         │
│ Custom API Access Token / API Key *                                    │
│ [ ••••••••••••••••••••••••••••••                  ] [ 👁 ]             │
├────────────────────────────────────────────────────────────────────────┤
│ PARAMETERS                                                             │
│ endpoint_url *                                                         │
│ [ https://api.service.com/v1/resource                                ] │
│                                                                        │
│ payload_json                                                           │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ {"key": "value"}                                                   │ │
│ └────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ [ ▶ Run Test Request ]                                                 │
├────────────────────────────────────────────────────────────────────────┤
│ LATEST TEST RESULT                                                     │
│ [ 200 OK ]  157ms  04:59 PM                                [ Copy JSON] │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ { "success": true, "status": 200, "data": { ... } }                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Drawer Navigation Header
- **Tabs Trigger List:**
  1. `Test Action`: Interactive request form.
  2. `Test History`: Historical log of executions.
  3. `View Code`: Monaco-style TypeScript viewer.
- **`Wide Mode` Button (`Maximize2` / `Minimize2`):**
  - Toggles drawer width between standard **460px** and expanded **720px**.
  - *Why it exists:* Provides wider horizontal space when inspecting large JSON responses or deep code files.
- **`Close Drawer` Button (`X`):**
  - Collapses drawer to give 100% focus back to the chat studio.

---

### Tab 1: `Test Action` (Interactive Test Harness)
- **Action Event Box:** Displays the current action name and description.
- **Authentication Box:**
  - Token input field with security masking (`password` type).
  - **Eye Toggle Button (`Eye` / `EyeOff`):** Reveals or masks sensitive API tokens for easy verification without accidental exposure.
- **Parameter Inputs:**
  - Dynamically generated based on the action's schema.
  - Includes input labels, required asterisks (`*`), placeholders, and helper text.
- **`Run Test Request` Button (`Play` Icon):**
  - Dispatches a real test execution.
  - Displays an active spinner (`animate-spin`) during request dispatch.
- **Result Inspector (Below Button):**
  - **Status Pill:** Green `200 OK` or Red `400 Bad Request`.
  - **Latency Metric:** Response time measured in milliseconds (e.g. `157ms`).
  - **Timestamp:** Exact execution time.
  - **`Copy JSON` Button (`Copy` / `Check`):** 1-click clipboard copy of the entire response payload.
  - **JSON Tree Viewer:** Formatted, syntax-colored view of the API server's response.

---

### Tab 2: `Test History` (Execution Audit Trail)
- Displays all past test executions recorded in the workspace.
- Each entry shows status, timestamp, latency, request payload snapshot, and response data.
- *Why it exists:* Allows developers to compare performance, inspect payload changes, and debug errors across multiple test iterations.

---

### Tab 3: `View Code` (Integrated Code Viewer)
- Displays the complete generated TypeScript handler (`handleExecuteAction`).
- Includes code header with filename (`action-handler.ts`), line count, and `Copy Code` button.
- Clean syntax highlighting with line numbers.
- Shows built-in standard helper functions (`jsonOk`, `jsonErr`).

### Drawer Resizer Drag Handle
- Draggable left edge allowing custom drawer width adjustments from **380px up to 720px**.

---

## 5. System Modals & Dialogs

### 1. Deploy Custom Action Confirmation Modal (`DeployConfirmModal`)
- **Trigger:** Clicking **Deploy Live** in the Ready to Deploy card.
- **Header:** Blue Rocket icon (`Rocket`), Title: *"Deploy Custom Action"*, Description: *"Confirm or update the action name before publishing live to Workflow Canvas."*
- **Action Name Input:**
  - Pre-filled with the current action name.
  - Autofocused with required red asterisk (`*`).
  - Allows renaming right at the point of deployment.
- **Footer Buttons:**
  - `Cancel` Button: Closes modal without altering state.
  - `Deploy` Button (Blue Rocket): Sets `status: "live"`, updates badges to `Deployed`, and syncs with Workflow Canvas.

### 2. Rename Action Modal
- **Trigger:** Selected from the 3-dots menu on any action card.
- **Purpose:** Fast in-place renaming of action catalog entries.

### 3. Delete Confirmation Modal (`ConfirmModal`)
- **Trigger:** Selected from the 3-dots menu on any action card.
- **Design:** Danger-themed modal with red action button (`Delete Action`) ensuring irreversible deletions require deliberate confirmation.

### 4. Fullscreen Code Viewer Modal (`CodeViewerModal`)
- **Trigger:** Expand button inside code viewers.
- **Design:** Full-screen modal overlay for deep code inspection and review.

---

## 6. Workflow Canvas Integration (End-User Experience)

### App Drawer Category Filter Pill: `Private Actions (N)`
In `/workflows/editor`, clicking on any action step opens the **Step 1: Choose App** drawer:
- Category pills filter between: `All`, `Flow Control`, `Utilities`, `SaaS Apps`, `My Custom Apps (Dev)`, and **`Private Actions (N)`**.
- Selecting **`Private Actions`** displays all custom actions deployed via Action Builder.

### Private Action Cards in Canvas Drawer
- **Universal Zap Icon (⚡):** Clean amber Zap icon in place of third-party brand logos.
- **Action Name Heading:** Displays the human-readable action purpose (e.g. `Execute Webhook Action`, `Delete Sheet`).
- **Subtitle:** Clearly marked as `Private Action`.
- **Status Badge:** Emerald `Live` badge.

### Canvas Node Appearance
- Both **Vertical** and **Horizontal** canvas views render the node with the custom action name, Zap icon, and status indicators matching native system nodes.

### Setup Details Drawer & Layered Variable Picker
- **Setup Drawer (`Step 2: Setup Details`):** Allows configuring authentication credentials, endpoints, and field values.
- **Variable Picker (Eye/Tag Icon):**
  - Placed right inside input fields.
  - Clicking opens the **Variable Picker Modal** to select dynamic outputs from upstream triggers (e.g. `{{trigger.body.id}}`).
  - **Layering Architecture:** Teleported via React Portal directly to `document.body` with `zIndex: 150`, ensuring it always opens smoothly in front of the setup drawer (`zIndex: 70`).

---

## 7. Comprehensive Interactive Element Matrix

| Element / Component | Location | Icon | Primary Function | State / Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **`+ New` Button** | Left Catalog Header | `Plus` | Creates blank action draft | Resets studio to Hero view |
| **`PanelLeftClose`** | Left Catalog / Studio | `PanelLeftClose` | Toggles left catalog collapse | Smooth width transition 0 ↔ 300px |
| **Search Input** | Left Catalog | `Search` | Filters actions in real-time | Includes autofill defense + Clear `X` |
| **Action Card** | Left Catalog | — | Selects active custom action | Highlights card, loads chat & code |
| **3-Dots Menu** | Action Card (Hover) | `MoreVertical` | Contextual action options | Dropdown: Rename, Toggle Live, Delete |
| **Suggestion Chip** | Center Hero State | App Icons | Populates starter prompt | Sends predefined prompt to AI |
| **Thinking Accordion** | Chat Stream | `ChevronDown` | Expands AI reasoning steps | Displays thinking duration in seconds |
| **`View Code` Button** | Ready to Deploy Card | `Code2` | Opens code viewer | Sets drawer tab to `view_code` |
| **`Test Action` Button**| Ready to Deploy Card | `Play` | Opens test harness | Sets drawer tab to `test_action` |
| **`Deploy Live` Button**| Ready to Deploy Card | `Rocket` / `Check` | Triggers deployment modal | Opens `DeployConfirmModal` |
| **Typewriter Input** | Bottom Prompt Dock | `|` cursor | Accepts prompts & cURL commands | Live typewriter cycling + auto-pause |
| **Send Button** | Bottom Prompt Dock | `ArrowUp` | Dispatches prompt to AI engine | Disabled when empty or generating |
| **`Wide Mode` Button** | Right Drawer Header | `Maximize2` | Expands drawer width | Toggles 460px ↔ 720px |
| **Eye Toggle Button** | Right Drawer Auth Box | `Eye` / `EyeOff` | Reveals/masks secret tokens | Switches input type text ↔ password |
| **`Run Test Request`** | Right Drawer Sandbox | `Play` | Dispatches live HTTP request | Shows spinner, outputs latency & status |
| **`Copy JSON` Button** | Right Drawer Sandbox | `Copy` / `Check` | Copies API response payload | Temporarily displays checkmark |
| **`Deploy` Button** | Deploy Modal | `Rocket` | Publishes action live | Sets status `live`, updates badges |
| **`Variable Picker`** | Canvas Setup Drawer | `Eye` / `Tag` | Maps upstream step variables | Opens portal modal at `zIndex: 150` |

---

*Automate Workflows Documentation Team — September 2026*
