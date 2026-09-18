# In-Built Actions: UI/UX Design & Component Implementation Guide

This guide details **how to design, display, and implement In-built Actions on the User Interface (UI)** within the **Automate Workflows Developer Platform** and how those actions seamlessly render for end-users on the **Workflow Canvas**.

---

## 1. UI Architecture & Placement Strategy

In-built Actions power dynamic lookups, custom field generation, and connection lifecycles without cluttering the primary workflow catalog. To give developers an intuitive experience, the UI provides both a dedicated workspace and in-context parameter linking.

### Architecture in the Developer App Builder:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  /developer/apps/[appId]                                                                         │
├───────────┬────────┬──────────┬─────────┬──────────────────┬─────────┬─────────┬─────────────────┤
│ Overview  │  Auth  │ Triggers │ Actions │ In-built Actions │ Sandbox │ Sharing │     Publish     │
└───────────┴────────┴──────────┴─────────┴─────────┬────────┴─────────┴─────────┴─────────────────┘
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   ▼                                                                 ▼
         [Dedicated Tab Workspace]                                      [Field Settings Linking]
   Full-width table managing all 6 types,                        Inside Actions/Triggers tab, clicking 
   dependencies, search, and live testing.                       Gear (⚙) links dynamic In-built Actions.
```

1. **Dedicated Tab (`In-built Actions`)**: A top-level tab in the App Builder listing all internal actions (`Dropdown & Custom Fields`, `Multi-Step`, `App Auth Validator`, `Webhook Validator`, `Delete Webhook`, `Delete Connection`) with search, status badges, and compact ghost icon action buttons.
2. **Contextual Linking (Field Settings Drawer)**: Inside the Actions and Triggers tabs, clicking the **Gear (⚙)** icon on any parameter row allows developers to select `Dynamic (In-built Action)` to populate dropdowns directly.

---

## 2. Inbuilt Action Configuration Drawer: 3-Tab Architecture

When creating or editing an In-built Action, a full-height sliding drawer opens with **3 horizontal tabs**:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Inbuilt Action Detail      Setup Inbuilt Action      API Configuration        │
│  ─────────────────────                                                         │
└────────────────────────────────────────────────────────────────────────────────┘
```

### The 3 Core Tabs:
1. **Tab 1: `Inbuilt Action Detail`**:
   - **Inbuilt Action Name** (*Required*): e.g., `Fetch All Workspaces`
   - **Inbuilt Action Key / Slug** (*Required*): e.g., `fetch_workspaces`
   - **Inbuilt Action Description**: Explains what options or lifecycle check this internal action fulfills.
   - **Inbuilt Action Type** (*Required Dropdown*):
     - `Dropdown & Custom Fields (Default)`
     - `Multi-Step`
     - `App Auth Validator`
     - `Webhook Validator`
     - `Delete Webhook`
     - `Delete Connection`
   - **Receive Headers Checkbox**:
     - `[✓] Check the box to receive headers along with the response from this inbuilt action. Learn more`
     - Clickable `Learn more` dialog detailing pagination headers (`Link`), count headers (`X-Total-Count`), and location headers.

2. **Tab 2: `Setup Inbuilt Action`**:
   - For **Multi-Step** actions: Configure step chaining and execution timing (`each_execution`, `post_webhook_setup`, `post_webhook_trigger_event`).
   - For **Dynamic Cascading**: Define parent field dependencies.

3. **Tab 3: `API Configuration`**:
   - Endpoint URL, HTTP Verb (`GET`, `POST`, etc.), Headers, Query/Body parameters.
   - Live **Test Action** runner displaying JSON responses and label/value key mapping.

---

## 3. Dedicated In-Built Actions Tab Table View

Inside `/developer/apps/[appId]?tab=inbuilt`, the full-width table organizes all internal actions:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  In-built Actions                                                         [+ Add In-built Action]│
│  Manage internal helper actions, dynamic dropdown providers, and lifecycle validators.           │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Filter In-built Actions... 🔍 ]                                                               │
│                                                                                                  │
│  Name & Key              Type / Mode            Endpoint & Method   Used In             Actions  │
├──────────────────────────┼──────────────────────┼───────────────────┼───────────────────┼────────┤
│ Fetch Workspaces         │ Dropdown Provider    │ GET /workspaces   │ • Create Task     │ [✏] [🗑]│
│ `fetch_workspaces`       │                      │                   │                   │        │
├──────────────────────────┼──────────────────────┼───────────────────┼───────────────────┼────────┤
│ Fetch Projects           │ Cascading Dropdown   │ GET /projects     │ • Create Task     │ [✏] [🗑]│
│ `fetch_projects`         │                      │                   │ • Update Deal     │        │
├──────────────────────────┼──────────────────────┼───────────────────┼───────────────────┼────────┤
│ Connection Validator     │ App Auth Validator   │ GET /v1/me        │ App Connection    │ [✏] [🗑]│
│ `auth_validator`         │                      │                   │                   │        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key UI Features:
- **Used In Reverse Lookup**: Shows exactly which customer-facing Actions or Triggers depend on each In-built Action.
- **Ghost Action Controls**: Compact icon buttons (`w-8 h-8 p-0`) for clean and uncluttered management.
- **Deletion Safety Protection**: Blocks deletion if dependencies exist, showing a modal with all active usages.

---

## 4. End-User Workflow Canvas Experience

When a user adds your integration to a workflow:
1. **Instant Reactive Dropdowns**: The dropdown displays friendly labels (e.g. `Marketing Board`) while sending exact database IDs (`board_9912`) to the API.
2. **Cascading Fluidity**: Selecting a Workspace automatically updates the Project dropdown with a subtle inline loading spinner.
3. **Zero-Task Credits**: The platform guarantees **0 task credits** for all internal lookups and dropdown queries.

---

*Documentation Version 2.0.0 — Automate Workflows Developer Platform.*
