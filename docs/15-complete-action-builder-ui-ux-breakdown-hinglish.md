# Action Builder UI/UX Master Reference — Tab-by-Tab & Button-by-Button Guide (Hinglish)

> **Complete Visual Layout, Component Dictionary aur Interaction Blueprint (Hinglish Edition)**
> 
> *Automate Workflows ke Action Builder studio aur Workflow Canvas integration ka ek-ek screen, panel, tab, drawer, button, modal, badge, aur input field ka detailed, aasan Hinglish guide.*

---

## 📑 Table of Contents (Vishay Suchi)

1. [3-Panel Master Layout Ka Architecture](#1-3-panel-master-layout-ka-architecture)
2. [Panel 1: Left Action Catalog (Sub-Sidebar)](#2-panel-1-left-action-catalog-sub-sidebar)
   - [Panel Header aur Controls (`Recents`, `+ New`, Collapse Button)](#panel-1-header-aur-controls)
   - [Search Input aur Auto-fill Shield](#search-input-aur-auto-fill-shield)
   - [Action List Cards aur Status Badges (`Draft` vs `Live`)](#action-list-cards-aur-status-badges)
   - [3-Dots Action Context Menu (`Rename`, `Toggle Publish/Draft`, `Delete`)](#the-3-dots-action-context-menu)
   - [Catalog Resizer Drag Handle](#catalog-resizer-drag-handle)
3. [Panel 2: Central AI Conversation aur Code Studio](#3-panel-2-central-ai-conversation-aur-code-studio)
   - [Studio Header Bar (Breadcrumb, Status Pill aur Collapse Toggles)](#studio-header-bar)
   - [Hero State (Empty State Jab Koi Prompt Na Ho)](#hero-state-empty-state-jab-koi-prompt-na-ho)
     - [Headline aur Asaan Subheading](#headline-aur-asaan-subheading)
     - [Moving 3-Column App Cluster](#moving-3-column-app-cluster)
     - [4 Quick Suggestion Chips (Sheets, Slack, Shopify, Custom Webhook)](#4-quick-suggestion-chips)
   - [Active Conversation Stream (Chat Messages Ka Flow)](#active-conversation-stream)
     - [User Message Bubble](#user-message-bubble)
     - [AI Thinking Accordion aur Timer](#ai-thinking-accordion-aur-timer)
     - ["Here's what I'll change" Code Diff Card](#heres-what-ill-change-code-diff-card)
     - ["Ready to Deploy" Card aur Uske 3 Buttons](#ready-to-deploy-card-aur-uske-3-buttons)
       - [`View Code` Button](#view-code-button)
       - [`Test Action` Button](#test-action-button)
       - [`Deploy Live` Button](#deploy-live-button)
     - [Live Status Banner](#live-status-banner)
   - [Ambient Glowing Bottom Prompt Dock](#ambient-glowing-bottom-prompt-dock)
     - [Animated Gradient Glow aur Border Rings](#animated-gradient-glow-aur-border-rings)
     - [Typewriter Input Area (Live Animated Typing Placeholder aur Blinking Cursor)](#typewriter-input-area)
     - [Bottom Action Dock Toolbar (`Test actions`, `Send` Arrow Button)](#bottom-action-dock-toolbar)
4. [Panel 3: Right Live Sandbox aur Test Drawer](#4-panel-3-right-live-sandbox-aur-test-drawer)
   - [Drawer Navigation Header (`TabsList`, `Wide Mode`, `Close`)](#drawer-navigation-header)
   - [Tab 1: `Test Action` (Interactive Test Harness)](#tab-1-test-action-interactive-test-harness)
     - [Action Info Box](#action-info-box)
     - [Authentication Input aur Show/Hide Eye Toggle Button](#authentication-input-aur-showhide-eye-toggle-button)
     - [Dynamic Parameter Fields aur Input Controls](#dynamic-parameter-fields-aur-input-controls)
     - [`Test Action` Execution Button aur Loading Spinner](#test-action-execution-button-aur-loading-spinner)
     - [Response Viewer (Status Code, Latency, Copy JSON, Formatted Body)](#response-viewer)
   - [Tab 2: `Test History` (Purane Test Runs Ka Record)](#tab-2-test-history-purane-test-runs-ka-record)
   - [Tab 3: `View Code` (Integrated Code Viewer)](#tab-3-view-code-integrated-code-viewer)
   - [Drawer Resizer Drag Handle](#drawer-resizer-drag-handle)
5. [System Modals aur Dialogs](#5-system-modals-aur-dialogs)
   - [1. Deploy Custom Action Confirmation Modal (`DeployConfirmModal`)](#1-deploy-custom-action-confirmation-modal)
   - [2. Rename Action Modal](#2-rename-action-modal)
   - [3. Delete Confirmation Modal (`ConfirmModal`)](#3-delete-confirmation-modal)
   - [4. Fullscreen Code Viewer Modal (`CodeViewerModal`)](#4-fullscreen-code-viewer-modal)
6. [Workflow Canvas Integration (End-User Ka Experience)](#6-workflow-canvas-integration-end-user-ka-experience)
   - [App Drawer Category Filter Pill: `Private Actions (N)`](#app-drawer-category-filter-pill-private-actions)
   - [Private Action Cards in Canvas Drawer](#private-action-cards-in-canvas-drawer)
   - [Canvas Node Appearance (Vertical aur Horizontal Layouts)](#canvas-node-appearance)
   - [Setup Details Drawer aur Layered Variable Picker](#setup-details-drawer-aur-layered-variable-picker)
7. [Comprehensive Interactive Element Matrix (Master Summary Table)](#7-comprehensive-interactive-element-matrix)

---

## 1. 3-Panel Master Layout Ka Architecture

Action Builder (`/custom-actions`) modern developer IDEs (jaise VS Code ya Cursor) aur AI studio (jaise ChatGPT/Claude) ka ek powerful combination hai. Yeh poora interface **3 responsive panels** mein divide hai:

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

Yeh left sub-sidebar aapke workspace ke andar banaye gaye saare custom actions ki inventory ko manage karta hai.

### Panel 1 Header aur Controls
- **`RECENTS` Label:** Section heading jo batata hai ki yahan aapke banaye huye actions hain.
- **`X Custom Actions` Counter:** Dynamic counter jo batata hai total kitne custom actions exist karte hain.
- **`+ New` Button (Blue Primary Button):**
  - *Icon:* `Plus`
  - *Kyu hai:* Is button par click karte hi ek naya blank action draft (`Untitled Action` under `New Action`) initialize hota hai, aur center studio fresh Hero State mein switch ho jaata hai.
  - *Fayda:* Aapko pichhla action delete ya overwrite karne ki zaroorat nahi padti, instant naya draft shuru ho jaata hai.
- **Collapse Button (`PanelLeftClose`):**
  - *Icon:* Left panel collapse icon.
  - *Kyu hai:* Agar aapko center studio ya code review ke liye zyada screen space chahiye, to is button se left catalog 0px width par smoothly hide ho jaata hai.

### Search Input aur Auto-fill Shield
- **Search Bar Input Box:**
  - *Placeholder:* `"Search actions..."`
  - *Kyu hai:* Agar aapke paas 20-30 actions hain, to action name, app category ya description type karke instant filter kar sakte hain.
  - *Auto-fill Shield:* Is input box mein special attributes (`autoComplete="new-password"`, email regex detection) lagaye gaye hain taaki browser ya 1Password/Chrome autofill galti se user ka login email search box mein na daal sake.
- **Clear Search Button (`X`):**
  - Jab search box mein text likha hota hai, to right side par `X` button aata hai jisse 1-click mein search clear ho jaati hai.

### Action List Cards aur Status Badges
List mein har action card par yeh cheezein dikhti hain:
- **Application Title:** Primary category (e.g. `Custom API`, `Google Sheets`, `Shopify`).
- **Action Name:** Specific task name (e.g. `Execute Webhook Action`, `Delete Sheet`).
- **Status Badge:**
  - **`Draft` (Slate Gray Pill):** Batata hai ki yeh action abhi testing mein hai ya isme un-deployed changes hain.
  - **`Live` (Emerald Green Pill):** Batata hai ki yeh action live publish ho chuka hai aur Workflow Canvas mein selection ke liye available hai.
- **Selected Card Styling:** Jo action select hota hai, uske left edge par blue border aur soft blue background highlight aa jaata hai.

### The 3-Dots Action Context Menu
Card par mouse hover karne par right side mein `MoreVertical` (3 dots) ka icon aata hai:
1. **`Rename` (`Pencil` Icon):**
   - *Kyu hai:* Agar aapko action ka naam badalna hai bina chat mein dobara prompt diye.
   - *Action:* Ek clean Rename Modal open hota hai jahan aap naya naam type karke save kar sakte hain.
2. **`Make Live` / `Move to Draft` (`CheckCircle2` Icon):**
   - *Kyu hai:* Agar aap kisi live action ko temporarily canvas se unpublish karna chahte hain, ya kisi draft ko turant live banana chahte hain bina deploy modal khole.
   - *Action:* Status toggle hota hai aur screen par toast confirmation message aata hai.
3. **`Delete Action` (`Trash2` Red Icon):**
   - *Kyu hai:* Purane ya galti se bane actions ko delete karne ke liye.
   - *Action:* Danger confirmation modal open hota hai.

### Catalog Resizer Drag Handle
- Catalog ke right border par invisible mouse handle hota hai.
- Isko drag karke aap catalog ki width **240px se 480px** ke beech adjust kar sakte hain.

---

## 3. Panel 2: Central AI Conversation aur Code Studio

Center panel Action Builder ka main workspace hai jahan AI ke sath conversation aur action building hoti hai.

### Studio Header Bar
- **Toggle Collapse Button:** Left catalog ko expand/collapse karta hai.
- **Breadcrumb:** `[App Name] • [Action Name]` (jaise `Custom API • Execute Webhook Action`).
- **Timestamp:** Last update ka waqt (jaise `04:59 PM`).
- **`Live in Workflows` Indicator:**
  - Jab action live hota hai, to yahan green glowing dot (`animate-pulse`) aur text dikhta hai.
  - Jab draft hota hai, to status confusion avoid karne ke liye yeh hide rehta hai.

---

### Hero State (Empty State Jab Koi Prompt Na Ho)
Jab aap `+ New` button dabakar naya action shuru karte hain, to center panel mein welcoming Hero Screen dikhti hai:

#### Headline aur Asaan Subheading
- **Headline:** `Build any action, [User Name].`
- **Subheading (Aasan aur Clear Bhasha):**
  > *"Create custom actions in seconds. Just describe what you want to automate or paste an API / cURL, and I'll build everything ready to use in your workflows — no coding required."*
  - *Kyu badla gaya:* Pehle yahan "TypeScript handler and parameters" likha tha jo non-developers ko mushkil lagta tha. Ab yeh saaf batata hai ki aap bas plain bhasha mein batayein ya cURL paste karein, AI bina coding ke sab bana dega.

#### Moving 3-Column App Cluster
- Right side par popular apps (Slack, Google Sheets, Shopify, Webhook, HubSpot) ka smooth moving animated cluster dikhta hai.
- Kisi bhi app icon par click karne se prompt box mein starter query auto-fill ho jaati hai.

#### 4 Quick Suggestion Chips
Common business use cases ke ready-made clickable cards:
1. **Delete Sheet in Google Sheets** (Google Sheets API batchUpdate)
2. **Send Ephemeral Slack Alert** (Slack private user alert)
3. **Cancel Order in Shopify** (E-Commerce order cancel & refund)
4. **Custom Webhook Client Sync** (HMAC signed REST webhook)

---

### Active Conversation Stream (Chat Messages Ka Flow)

#### User Message Bubble
- Right side par dark rounded bubble mein aapka bheja gaya prompt aur waqt dikhta hai.

#### AI Thinking Accordion aur Timer
- **Thinking Header:** Shows `Thinking time: 12.8 seconds` with down chevron icon.
- **Kyu hai:** Jab AI complex API endpoints aur TypeScript handlers compile kar raha hota hai, to user ko transparent progress dikhti hai. Ispe click karke AI ke internal thoughts ko expand/collapse kiya ja sakta hai.

#### "Here's what I'll change" Code Diff Card
- Top par green **`Applied`** badge hota hai.
- Niche numbered steps hote hain (jaise: `1. Add after line 48: Implemented handler for Execute Webhook Action`, `2. Add after line 64: Added parameter validation and error boundary checks`).
- *Kyu hai:* User ko ek-ek line code padhne ki zaroorat nahi padti, summary se hi pata chal jaata hai ki kya naya add hua hai.

#### "Ready to Deploy" Card aur Uske 3 Buttons
Amber border wala card jo code generate hone par samne aata hai:
- **Card Title:**
  - Jab action draft hota hai: *"Your updated action is ready to deploy"*
  - Jab live hota hai: *"Action is live & deployed"*
- **Line Count:** Generated code ka size (jaise `78 lines`).
- **Dynamic Status Badge:**
  - Jab tak aapne live deploy nahi kiya: neutral gray **`Draft`** badge dikhta hai.
  - Jab aap live deploy confirm kar dete hain: green **`Deployed`** badge dikhta hai.
- **3 Action Buttons:**
  1. **`View Code` Button (`Code2` Icon):** Right drawer open karke generated TypeScript code dikhata hai.
  2. **`Test Action` Button (`Play` Icon):** Right drawer open karke test harness ready karta hai.
  3. **`Deploy Live` Button (`CheckCircle2` Icon):** Blue primary button jo Deploy Confirmation Modal kholta hai.

#### Live Status Banner
- Card ke niche green notification banner:
  > *"Action is live! Ready for selection in Workflow Canvas."*

---

### Ambient Glowing Bottom Prompt Dock
Center panel ke bottom mein fixed floating card jisme prompt input box hota hai:

#### Animated Gradient Glow aur Border Rings
- Diffused colorful background glow jo focus hone par highlight hota hai aur premium look deta hai.

#### Typewriter Input Area (Live Animated Typing Placeholder)
- **Live Typing State Effect:**
  - Input box ke andar inspiring action ideas letter-by-letter type hoti hain (34ms speed).
  - Saath mein real-time blinking pipe cursor (`|`) chalta hai.
  - Poori line type hone ke baad ~3.2 seconds pause rehta hai taaki user aaram se padh sake, fir smoothly backspace hokar next idea type hota hai.
  - **Instant User Typing Pause:** Jaise hi user ek bhi key press karta hai ya koi cURL command paste karta hai, typing animation turant ruk jaati hai taaki user ko koi disturbance na ho!

#### Bottom Action Dock Toolbar
- **`Test actions` Button:** Code generate hone ke baad right drawer ka test runner kholne ka quick shortcut.
- **`Send` Arrow Button (Blue Circle):**
  - Jab input khali hota hai ya generation chal rahi hoti hai to disabled rehta hai.
  - Click karne par prompt AI ko dispatch ho jaata hai.

---

## 4. Panel 3: Right Live Sandbox aur Test Drawer

Right drawer ek integrated API workbench hai jo right side se slide out hota hai:

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
- **Tabs Switcher:**
  1. `Test Action`: Interactive form testing ke liye.
  2. `Test History`: Purane test runs ke logs dekhne ke liye (saath mein counter badge).
  3. `View Code`: TypeScript code dekhne ke liye.
- **`Wide Mode` Button (`Maximize2` / `Minimize2`):**
  - Drawer ki width ko 460px (Standard) se 720px (Wide) mein toggle karta hai.
  - *Kyu hai:* Badi JSON body ya lambe code ko aaram se bina horizontal scroll ke padhne ke liye.
- **`Close Drawer` Button (`X`):**
  - Drawer ko collapse karta hai taaki center chat studio ko full space mile.

---

### Tab 1: `Test Action` (Interactive Test Harness)
- **Action Info Box:** Action ka title aur summary.
- **Authentication Box:**
  - Token input box jisme dots (`••••••`) aate hain.
  - **Eye Icon Toggle (`Eye` / `EyeOff`):** Is button par click karke aap secret token ko reveal ya hide kar sakte hain bina clipboard par copy kiye.
- **Parameters Form:**
  - Schema se nikle huye input fields (jaise `endpoint_url`, `payload_json`).
  - Required fields par red asterisk (`*`) hota hai.
- **`Run Test Request` Button (`Play` Icon):**
  - Click karte hi actual HTTP request dispatch hoti hai.
  - Loading spinner chalta hai.
- **Latest Test Result Inspector:**
  - **Status Pill:** Green `200 OK` ya Red `400 Bad Request`.
  - **Latency:** Server ka response time milliseconds mein (jaise `157ms`).
  - **`Copy JSON` Button:** Server response ko 1-click mein copy karne ke liye.
  - **Formatted JSON View:** Clean syntax-colored JSON response body.

---

### Tab 2: `Test History` (Purane Test Runs Ka Record)
- Jitne bhi test runs kiye gaye hain, unka time-stamped log.
- Isse developers inspect kar sakte hain ki pichhla test kab successful hua tha aur kya payload aaya tha.

---

### Tab 3: `View Code` (Integrated Code Viewer)
- Action ka complete generated TypeScript handler code (`handleExecuteAction`).
- Top par filename (`action-handler.ts`), line count, aur `Copy Code` button.
- Built-in helper functions (`jsonOk`, `jsonErr`).

### Drawer Resizer Drag Handle
- Drawer ke left border ko pakad kar mouse se **380px se 720px** tak drag kiya ja sakta hai.

---

## 5. System Modals aur Dialogs

### 1. Deploy Custom Action Confirmation Modal (`DeployConfirmModal`)
- **Kab open hota hai:** Jab aap Ready Card par **`Deploy Live`** button click karte hain.
- **Design:**
  - Top par Blue Rocket icon (`Rocket`).
  - Heading: *"Deploy Custom Action"*.
  - Subheading: *"Confirm or update the action name before publishing live to Workflow Canvas."*
  - **Action Name Input:** Yahan aap action ka final display name edit ya confirm kar sakte hain.
- **Buttons:**
  - `Cancel`: Modal band karta hai bina deploy kiye.
  - `Deploy` (Blue Rocket Button): Action ko **Live** banata hai aur canvas par inject karta hai.

### 2. Rename Action Modal
- Left catalog ke 3-dots menu se open hota hai. Action ka naam instant rename karne ke liye.

### 3. Delete Confirmation Modal (`ConfirmModal`)
- Left catalog ke 3-dots menu se **Delete** choose karne par open hota hai.
- Danger red button (`Delete Action`) ke sath taaki galti se koi important action delete na ho.

### 4. Fullscreen Code Viewer Modal (`CodeViewerModal`)
- Code ko poori screen par full modal view mein inspect karne ke liye.

---

## 6. Workflow Canvas Integration (End-User Ka Experience)

Action Builder mein live deploy hone ke baad, Workflow Editor (`/workflows/editor`) par iska experience kaisa hota hai:

### App Drawer Category Filter Pill: `Private Actions (N)`
- Jab canvas par user kisi node par click karta hai, to **Step 1: Choose App** drawer open hota hai.
- Category pills mein standard categories ke sath **`Private Actions`** pill aati hai.
- Ispe click karte hi aapke banaye huye saare live custom actions filter ho jaate hain.

### Private Action Cards in Canvas Drawer
- **Universal Zap Icon (⚡):** Third-party apps ke logo ke bajaye clean golden Zap icon hota hai.
- **Action Name:** Action ka human-friendly task name (jaise `Execute Webhook Action`, `Delete Sheet`).
- **Subtitle:** Clear label: `Private Action`.
- **Badge:** Green `Live` status badge.

### Canvas Node Appearance
- Vertical aur Horizontal dono canvas views mein node par custom action name aur Zap icon bind ho jaata hai.

### Setup Details Drawer aur Layered Variable Picker
- **Setup Drawer (`Step 2: Setup Details`):** Yahan token, endpoint aur parameter inputs aate hain.
- **Variable Picker (Eye/Tag Icon):**
  - Input field ke right side mein Eye/Tag icon hota hai.
  - Ispe click karte hi **Variable Picker Modal** open hota hai jahan se aap pichhle trigger ka output (jaise `{{trigger.body.id}}`) 1-click mein map kar sakte hain.
  - **Layering Architecture:** Variable Picker React Portal ke zariye direct `document.body` par `zIndex: 150` ke sath mount hota hai, jisse yeh hamesha Setup Drawer (`zIndex: 70`) ke smooth aage open hota hai.

---

## 7. Comprehensive Interactive Element Matrix

| Component / Button | Location | Icon | Primary Kaam (Function) | Click Karne Par Kya Hota Hai? |
| :--- | :--- | :--- | :--- | :--- |
| **`+ New` Button** | Left Catalog Header | `Plus` | Naya action draft shuru karna | Studio blank Hero View mein switch ho jaata hai |
| **`PanelLeftClose`** | Left Catalog / Studio | `PanelLeftClose` | Left catalog ko collapse karna | Catalog 0px width par smoothly hide ho jaata hai |
| **Search Bar Input** | Left Catalog | `Search` | Actions ko instant filter karna | Auto-fill shield ke sath real-time search |
| **Action Card** | Left Catalog | — | Action ko active select karna | Card highlight hota hai aur chat/code load hoti hai |
| **3-Dots Menu** | Action Card (Hover) | `MoreVertical` | Extra options kholna | Dropdown khulta hai: Rename, Toggle Live, Delete |
| **Suggestion Chip** | Center Hero View | App Icons | Starter prompt auto-fill karna | Click karte hi prompt seedha AI ko chala jaata hai |
| **Thinking Accordion** | Chat Stream | `ChevronDown` | AI reasoning steps dekhna | Thinking time (e.g. 12.8s) expand/collapse hota hai |
| **`View Code` Button** | Ready to Deploy Card | `Code2` | Generated code inspect karna | Right drawer ka `View Code` tab open ho jaata hai |
| **`Test Action` Button**| Ready to Deploy Card | `Play` | Action ko sandbox mein test karna | Right drawer ka `Test Action` tab open ho jaata hai |
| **`Deploy Live` Button**| Ready to Deploy Card | `Rocket` / `Check` | Action ko canvas mein live bhejna | `DeployConfirmModal` popup khul jaata hai |
| **Typewriter Input** | Bottom Prompt Dock | `|` cursor | Prompt ya cURL paste karna | Live typing animation chalti hai jo user type karne par pause hoti hai |
| **Send Button** | Bottom Prompt Dock | `ArrowUp` | Prompt AI ko bhejna | AI generation start hoti hai |
| **`Wide Mode` Button** | Right Drawer Header | `Maximize2` | Drawer ko bada karna | Width 460px se 720px mein toggle hoti hai |
| **Eye Toggle Button** | Right Drawer Auth Box | `Eye` / `EyeOff` | Secret token reveal/hide karna | Input type password ↔ text switch hota hai |
| **`Run Test Request`** | Right Drawer Sandbox | `Play` | Actual API request bhejna | Spinner chalta hai aur real latency/status dikhti hai |
| **`Copy JSON` Button** | Right Drawer Sandbox | `Copy` / `Check` | API response copy karna | Clipboard par copy hota hai aur green check aata hai |
| **`Deploy` Button** | Deploy Modal | `Rocket` | Action ko Live confirm karna | Action status `live` banta hai aur canvas mein sync hota hai |
| **`Variable Picker`** | Canvas Setup Drawer | `Eye` / `Tag` | Upstream step variables map karna| Modal direct drawer ke aage `zIndex: 150` par open hota hai |

---

*Automate Workflows Documentation Team — September 2026*
