# In-Built Actions Ko UI Par Kaise Dikhayein Aur Implement Karein (UI/UX Guide)

Yeh guide explain karti hai ki **Automate Workflows Developer Platform ke UI par In-built Actions kaise dikhte hain aur kaise kaam karte hain**, aur end-users ke **Workflow Canvas** par inka kya smooth experience hota hai.

---

## 1. UI Architecture Aur Placement Strategy

In-built Actions workflow catalog ko bina cluttered banaye background me dynamic dropdowns aur metadata manage karte hain.

### Developer App Builder Ka Layout:

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
   Full-width table jisme 6 types,                               Actions/Triggers tab me Gear (⚙) daba kar
   dependencies, search aur live test milta hai.                 dynamic In-built Actions link karte hain.
```

1. **Dedicated Tab (`In-built Actions`)**: App Builder ka top-level tab jisme sabhi 6 Inbuilt Action types list hote hain, live search aur compact ghost icon buttons ke saath.
2. **Contextual Linking (Field Settings Drawer)**: Actions aur Triggers tab me parameter ki **Settings (⚙)** open karke `Dynamic (In-built Action)` choose karke dynamic dropdown connect karte hain.

---

## 2. Inbuilt Action Configuration Drawer: 3-Tab Architecture

Jab aap In-built Action banate ya edit karte hain, toh **3 horizontal tabs** wala drawer open hota hai:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Inbuilt Action Detail      Setup Inbuilt Action      API Configuration        │
│  ─────────────────────                                                         │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3 Core Tabs Ka Breakdown:
1. **Tab 1: `Inbuilt Action Detail`**:
   - **Name**: e.g. `Fetch All Workspaces`
   - **Key / Slug**: e.g. `fetch_workspaces`
   - **Description**: Action ka purpose.
   - **Inbuilt Action Type (Dropdown)**:
     - `Dropdown & Custom Fields (Default)`
     - `Multi-Step`
     - `App Auth Validator`
     - `Webhook Validator`
     - `Delete Webhook`
     - `Delete Connection`
   - **Receive Headers Checkbox**:
     - `[✓] Check the box to receive headers along with the response from this inbuilt action. Learn more`
     - Clickable `Learn more` dialog pagination aur location headers ke liye.

2. **Tab 2: `Setup Inbuilt Action`**:
   - **Multi-Step actions** ke liye: Chained steps aur execution timing (`each_execution`, `post_webhook_setup`, `post_webhook_trigger_event`).
   - **Dynamic Cascading**: Parent dropdown field dependencies configure karna.

3. **Tab 3: `API Configuration`**:
   - Endpoint URL, HTTP Verb (`GET`, `POST`), Headers, aur Parameters.
   - Live **Test Action** console jo raw JSON aur label/value keys preview karta hai.

---

## 3. Dedicated In-Built Actions Tab Table View

`/developer/apps/[appId]?tab=inbuilt` ke andar full-width table format:

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
- **Used In Reverse Lookup**: Saaf dikhta hai ki kaunsa Inbuilt Action kis Action ya Trigger mein use ho raha hai.
- **Ghost Action Controls**: Compact icon buttons (`w-8 h-8 p-0`) clean interface ke liye.
- **Deletion Protection Blocker**: Linked actions ko galti se delete hone se rokta hai.

---

## 4. End-User Workflow Canvas Experience

Workflow Canvas par end-user ke liye:
1. **Live Dropdowns**: Dropdown me human-readable names (e.g. `Marketing Board`) aate hain aur backend me automatic IDs map hoti hain.
2. **Smooth Cascading**: Workspace change karte hi Project dropdown smoothly refresh ho jata hai.
3. **0 Task Credits**: User se internal dropdown query ka koi credit nahi kat-ta.

---

*Documentation Version 2.0.0 — Automate Workflows Developer Platform.*
