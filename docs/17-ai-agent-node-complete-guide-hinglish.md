# AI Agent Node — Complete Architecture, Configuration & Working Guide (Hinglish Edition)

> **Automate Workflows Ke Autonomous AI Agent Node Ka A-to-Z Master Guide (Hinglish Edition)**
> 
> *Har ek field ki detailed description, kyu use karte hain (Why), kab use karna chahiye (When), ReAct reasoning mechanics, tool orchestration, session memory, guardrails aur real-world business use cases ka complete Hinglish manual.*

---

## 📑 Table of Contents (Vishay Suchi)

1. [AI Agent Node Kya Hai? (Overview aur Concept)](#1-ai-agent-node-kya-hai-overview-aur-concept)
   - [Normal Workflow Steps vs Autonomous AI Agent](#normal-workflow-steps-vs-autonomous-ai-agent)
   - [Humein AI Agent Node Ki Kyu Zaroorat Hai? (Why We Use It)](#humein-ai-agent-node-ki-kyu-zaroorat-hai-why-we-use-it)
   - [Kab Use Karein aur Kab Use Na Karein (When to Use vs When Not to Use)](#kab-use-karein-aur-kab-use-na-karein)
2. [AI Agent Node Ka Internal Working Mechanism (How It Works)](#2-ai-agent-node-ka-internal-working-mechanism)
   - [ReAct (Thought ➔ Action ➔ Observation) Cycle](#react-thought--action--observation-cycle)
   - [Dynamic Tool Calling aur Function Arguments Ingestion](#dynamic-tool-calling-aur-arguments-ingestion)
   - [Variables Mapping Pipeline (`Press /`)](#variables-mapping-pipeline-press-)
3. [Drawer Header Controls aur Info Guide Modal](#3-drawer-header-controls-aur-info-guide-modal)
   - [Information Icon (`Info`) aur Help Modal System](#information-icon-info-aur-help-modal-system)
   - [Canvas Node Identity aur Status Badges](#canvas-node-identity-aur-status-badges)
4. [Har Field Ka Detailed Breakdown: Tab 1 — Brain & Goal](#4-har-field-ka-detailed-breakdown-tab-1--brain--goal)
   - [Field 1: Agent Name / Role (Persona Title)](#field-1-agent-name--role-persona-title)
   - [Field 2: AI Reasoning Model (Model Selection)](#field-2-ai-reasoning-model-model-selection)
   - [Field 3: Agent Instructions & Rules (System Persona & Presets)](#field-3-agent-instructions--rules-system-persona--presets)
   - [Field 4: What Should the Agent Do? (Goal Prompt)](#field-4-what-should-the-agent-do-goal-prompt)
5. [Har Field Ka Detailed Breakdown: Tab 2 — Equipped Apps & Tools](#5-har-field-ka-detailed-breakdown-tab-2--equipped-apps--tools)
   - [Tools Equip Karna (Catalog Apps & Private Actions)](#tools-equip-karna-catalog-apps--private-actions)
   - [Tool Active / Inactive Switch Toggle](#tool-active--inactive-switch-toggle)
   - [When Should the Agent Use This Tool? (Tool Guidance Description)](#when-should-the-agent-use-this-tool-tool-guidance-description)
   - [Ask for Human Approval Before Running This Tool (Safety Switch)](#ask-for-human-approval-before-running-this-tool-safety-switch)
   - [Embedded Human Approval Node Settings (Approver Email, Subject, Timeout, Live Preview)](#embedded-human-approval-node-settings)
6. [Har Field Ka Detailed Breakdown: Tab 3 — Memory](#6-har-field-ka-detailed-breakdown-tab-3--memory)
   - [Field 1: Session ID (Conversation Identifier)](#field-1-session-id-conversation-identifier)
   - [Field 2: Memory Strategy (Recent Messages vs Full Session vs No Memory)](#field-2-memory-strategy)
   - [Field 3: Window Size (Recent Messages Count)](#field-3-window-size-recent-messages-count)
7. [Har Field Ka Detailed Breakdown: Tab 4 — Safety & Limits](#7-har-field-ka-detailed-breakdown-tab-4--safety--limits)
   - [Field 1: Maximum Steps per Run (Loop Prevention)](#field-1-maximum-steps-per-run-loop-prevention)
   - [Field 2: Fallback Message (if stuck)](#field-2-fallback-message-if-stuck)
   - [Field 3: Agent Test Run Simulator (Live Preview Engine)](#field-3-agent-test-run-simulator-live-preview-engine)
8. [Real-World Business Blueprints (Step-by-Step Use Cases)](#8-real-world-business-blueprints)
   - [Blueprint 1: 24/7 Autonomous E-Commerce Support Assistant](#blueprint-1-247-autonomous-e-commerce-support-assistant)
   - [Blueprint 2: High-Value B2B Lead Qualifier & CRM Router](#blueprint-2-high-value-b2b-lead-qualifier--crm-router)
   - [Blueprint 3: Smart Data Cleansing & Deduplication Agent](#blueprint-3-smart-data-cleansing--deduplication-agent)
9. [Best Practices, Prompting Tips aur Common Mistakes](#9-best-practices-prompting-tips-aur-common-mistakes)

---

## 1. AI Agent Node Kya Hai? (Overview aur Concept)

Automate Workflows ka **AI Agent Node** ek super-intelligent autonomous action node hai. 

Aam taur par kisi automation workflow mein har step fixed hota hai — jaise *"Jab email aaye, toh template #2 reply bhejo"*. Lekin agar customer ne email mein kuch ajeeb likh diya, ya order number doosri line mein likh diya, toh purana automation confuse ho jaata hai ya galat kaam kar deta hai.

**AI Agent Node ek smart human assistant ki tarah kaam karta hai.** Yeh input ko dhyan se padhta hai, situation ko samajhta hai, dimaag lagata hai (reasoning), aur fir zaroorat padne par aapke doosre apps (Shopify, Slack, Google Sheets, Gmail) ko khud call karke problem solve karta hai.

### Normal Workflow Steps vs Autonomous AI Agent

| Comparison | Normal Workflow Step (Triggers/Actions) | Autonomous AI Agent Node |
| :--- | :--- | :--- |
| **Dimaag / Faisla (Decision Making)** | **0%** — Bilkul rigid. Jo pehle se set hai bas wahi karega. | **100%** — Context ko analyze karke khud best action choose karta hai. |
| **Input Flexibility** | Rigid format chahiye hota hai. Thoda sa format badla toh crash. | Messy natural language, Hinglish, typo-filled text, sab handle kar leta hai. |
| **Tools Calling** | 1 step = sirf 1 fix app call kar sakta hai. | 1 single node zaroorat ke hisab se 0, 1, 2 ya 4 apps ko call kar sakta hai. |
| **Branching / Conditions** | 10 conditions ke liye 10 alag `Router` branches banani padti hain. | Ek hi node ke andar bina kisi complex branching ke sab faisla le leta hai. |
| **Human Safety** | Agar automated refund galat bhej diya toh bachaane ka koi easy tarika nahi. | Sensitive kaam (jaise refund ya delete) ke liye turant human approval maangta hai. |

### Humein AI Agent Node Ki Kyu Zaroorat Hai? (Why We Use It)

1. **Complex Router Sprawling Khatam:** Agar aap customer support ya lead triage automate kar rahe hain, toh traditional builders mein 20 alag router branches banani padti hain jo canvas ko messy bana deti hain. AI Agent node yeh saara kaam akele ek hi box mein kar deta hai.
2. **Dynamic Multi-App Workflows:** Ek hi run mein AI Shopify par order dhoond sakta hai, FedEx ka tracking status dekh sakta hai, Slack par internal team ko notify kar sakta hai aur customer ko custom reply likh sakta hai.
3. **Conversational Memory:** Customer ko baar-baar apna order number ya naam batane ki zaroorat nahi padti; agent unki pichli baatein yaad rakhta hai.

### Kab Use Karein aur Kab Use Na Karein

#### ✅ Kab Use Karein:
- Jab customer messages, support emails ya feedback form ko samajhna aur respond karna ho.
- B2B leads ko score karna ho aur criteria ke hisab se sahi sales rep ko alert karna ho.
- Unstructured text (jaise resume, email body, invoice text) se clean data extract karna ho.
- Aise workflows jisme situation dekh kar faisla lena ho ki kaunsa tool chalana hai.

#### ❌ Kab Use Na Karein:
- **Simple 1-to-1 sync:** E.g., *"Jab Google Form submit ho, toh row Google Sheets mein add karo."* Isme AI ki zaroorat nahi hai, normal action faster aur sasta padega.
- **Bulk Data Migration:** Agar 1 lakh records ek database se doosre mein copy karne hain, toh standard API connectors use karein.

---

## 2. AI Agent Node Ka Internal Working Mechanism

AI Agent node **ReAct (Reasoning + Acting)** architecture par chalta hai:

```
[Customer Query / Trigger Data]
              │
              ▼
    1. THOUGHT (Dimaag Lagana)
       "Customer order #8921 ka status maang raha hai. 
        Mere paas Shopify tool hai. Main pehle order check karunga."
              │
              ▼
    2. ACTION (Tool Chalana)
       Shopify.getOrderDetails(order_id: "8921")
              │
              ▼
    3. OBSERVATION (Nateeja Dekhna)
       Tool ne bataya: Status = "Dispatched", Tracking = "DTDC-4819"
              │
              ▼
    4. SYNTHESIS (Final Reply)
       "Aapka order dispatch ho chuka hai aur 2 din mein deliver hoga!"
```

1. **Prompt Ingestion:** Trigger se data aata hai (jaise `{{step_1.message_body}}`).
2. **Thought Phase:** AI model analyze karta hai ki goal pura karne ke liye kya karna padega.
3. **Action Phase:** Agent decide karta hai ki kaunsa tool call karna hai aur uske arguments khud generate karta hai.
4. **Observation Phase:** Tool se jo data laut ta hai, model use padhta hai. Agar goal pura ho gaya toh final answer banata hai; agar aur tools ki zaroorat ho toh cycle repeat karta hai.
5. **Human-in-the-Loop Check:** Agar kisi tool par human approval laga hai, toh workflow wahi pause ho jaata hai aur manager ko notification jaata hai.

---

## 3. Drawer Header Controls aur Info Guide Modal

AI Agent drawer ke top header mein clean aur intuitive controls diye gaye hain:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [Bot Icon]  AI Agent Setup  [(i) Info Icon]                [Maximize]  [Close X]│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Information Icon (`Info`) aur Help Modal System

- **Location:** `AI Agent Setup` title ke theek bagal mein information icon (`Info`) diya gaya hai.
- **Click Karne Par Kya Hota Hai:** Ek modern modal popup open hota hai jo user ko plain, simple language mein sikhata hai ki:
  - AI Agent node kya hai aur yeh normal action se kaise alag hai.
  - E-Commerce, Sales aur Operations ke 3 practical real-world examples.
  - Brain, Tools, Memory aur Guardrails ko 4 simple steps mein kaise configure karein.
- **Design System Integration:** Yeh modal platform ke core [`Modal`](file:///c:/Users/DELL/Desktop/Automate%20Workflows/src/components/ui/modal.tsx) component se bana hai, jisme backdrop blur, dark/light theme aur ESC key support in-built hai.

---

## 4. Har Field Ka Detailed Breakdown: Tab 1 — Brain & Goal

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Brain & Goal   │   🛠️ Tools (3)   │   💾 Memory   │   🛡️ Guardrails            │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Agent Name / Role                                    Name on workflow canvas     │
│ [ Customer Support & Lead Triager                                              ] │
│ What job is this agent doing? (e.g. Customer Support, Lead Qualifier).           │
│                                                                                  │
│ AI Reasoning Model                                             ● Ready & Active  │
│ [ OpenAI GPT-4o (Recommended — Fast & Smart)                                 ▼ ] │
│ The AI brain that reads your prompt, makes smart decisions, and runs tools.      │
│                                                                                  │
│ Agent Instructions & Rules                                   How it should behave│
│ Presets: [ Support & Refund Triage ] [ Lead Qualification ] [ Data Harmonizer ]  │
│ [ You are an autonomous AI Agent in Automate Workflows...                      ] │
│ Give the agent clear guidelines on how to talk, what rules to follow.            │
│                                                                                  │
│ What should the agent do? (Goal Prompt) *                             [Press /]  │
│ [ Evaluate inquiry from {{step_1.sender_email}} and execute required steps...  ] │
│ The main task for the agent to complete. Supports dynamic variables with /.      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Field 1: Agent Name / Role (Persona Title)

- **UI Label:** `Agent Name / Role`
- **Subtext:** *"What job is this agent doing? (e.g. Customer Support, Lead Qualifier, Refund Checker)."*
- **Badge:** `Name on workflow canvas`
- **Kyu Use Karte Hain (Why):**
  - Workflow canvas par iss step ka naam dikhane ke liye aur execution logs mein isko identify karne ke liye.
  - Saath hi, LLM ko yeh pata chalta hai ki uska primary professional role kya hai.
- **Kab Use Karna Chahiye (When):**
  - Hamesha! Apne workflow ko readable rakhne ke liye yahan clear naam likhein jaise `Customer Support Assistant` ya `Refund Verification Bot`.

---

### Field 2: AI Reasoning Model (Model Selection)

- **UI Label:** `AI Reasoning Model`
- **Subtext:** *"The AI brain that reads your prompt, makes smart decisions, and runs your equipped tools."*
- **Badge:** `● Ready & Active` (Green pulse indicator)
- **Available Models & Inka Use Kab Karein:**
  1. **OpenAI GPT-4o (`gpt-4o`) — Recommended Standard:**
     - *Sabse best all-rounder:* Fast execution, smart reasoning aur accurate tool calling.
     - *Kab use karein:* General support, multi-tool workflows, customer communication.
  2. **Anthropic Claude 3.5 Sonnet (`claude-3-5-sonnet`) — Deep Reasoning:**
     - *Coding aur deep logic mein best:* Instructions ko sabse zyada strictly follow karta hai.
     - *Kab use karein:* Policy checking, legal/financial compliance, ya complex data extraction.
  3. **Google Gemini 1.5 Pro (`gemini-1-5-pro`) — Huge Context Window (2M Tokens):**
     - *Massive reading capacity:* Badi PDF files, lambe conversation logs ya catalog ko read kar sakta hai.
     - *Kab use karein:* Document analysis ya lambi research queries.
  4. **OpenAI GPT-4o Mini (`gpt-4o-mini`) — Fast & Cost-Effective:**
     - *Super fast aur sasta:* Simple classification aur basic categorization ke liye.
     - *Kab use karein:* High-volume, low-complexity tasks.

---

### Field 3: Agent Instructions & Rules (System Persona & Presets)

- **UI Label:** `Agent Instructions & Rules`
- **Subtext:** *"Give the agent clear guidelines on how to talk, what rules to follow, and what answers to give."*
- **Badge:** `How it should behave`
- **Kyu Use Karte Hain (Why):**
  - Yeh agent ka "Constitution" (niyam pustika) hai. Isme aap agent ko batate hain ki use kisse politely baat karni hai, kya rules follow karne hain, aur kaunse bounds cross nahi karne.
- **Kab Use Karna Chahiye (When):**
  - Har agent mein instructions likhna zaroori hai. Bina rules ke agent behek sakta hai ya galat assumptions le sakta hai.
- **1-Click Built-in Presets:**
  - **Support & Refund Triage:** Customer order lookup + $100 se upar refund par human approval ka rule set kar deta hai.
  - **Lead Qualification Agent:** B2B lead ko company size aur job title se score karta hai aur Slack par alert bhejta hai.
  - **Data Sync & Harmonizer:** User input ko clean karta hai aur cross-system duplicate check karta hai.
  - **Autonomous IT Helpdesk:** Password resets, access requests aur doc searches handle karta hai.

---

### Field 4: What Should the Agent Do? (Goal Prompt)

- **UI Label:** `What should the agent do? (Goal Prompt) *`
- **Subtext:** *"The main task for the agent to complete. You can type instructions and add variables from previous steps with /."*
- **Feature:** `Press /` button dabane se variable picker open hota hai.
- **Kyu Use Karte Hain (Why):**
  - Yeh is specific run ka main task hota hai. Isme trigger ka dynamic data (jaise customer ka message ya form ka text) pass kiya jaata hai.
- **Kab Use Karna Chahiye (When):**
  - Hamesha required hai! Bina goal ke agent ko pata nahi chalega ki use is baar kya kaam karna hai.
- **Example:**
  `"Evaluate inquiry from {{step_1.customer_email}}: '{{step_1.message_body}}'. Look up order in Shopify and reply with shipment details."`

---

## 5. Har Field Ka Detailed Breakdown: Tab 2 — Equipped Apps & Tools

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Brain & Goal   │   🛠️ Tools (3)   │   💾 Memory   │   🛡️ Safety & Limits       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Equipped Apps & Tools                                         [ + Equip Tool ]   │
│ Select apps (like Shopify, Slack, Gmail) this agent is allowed to use.           │
│                                                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Slack]  Slack: Send Message                   [Slack] [Active Toggle] [Trash]│
│ │ action: send_channel_msg                                                     │ │
│ │ When should the agent use this tool?                                         │ │
│ │ [ Post real-time updates and alerts to the team Slack channel.             ] │ │
│ │ 🛡️ Ask for your approval before running this tool            [ Toggle: OFF ] │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Shopify]  Shopify: Cancel Order             [Shopify] [Active Toggle] [Trash]│
│ │ action: cancel_order                                                         │ │
│ │ When should the agent use this tool?                                         │ │
│ │ [ Call this tool only when a customer explicitly requests cancellation.    ] │ │
│ │ 🛡️ Ask for your approval before running this tool            [ Toggle: ON  ] │ │
│ │                                                                              │ │
│ │ ┌──────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 👤 manager@company.com  •  24 Hours timeout                [ Configure ] │ │ │
│ │ └──────────────────────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Tools Equip Karna (Catalog Apps & Private Actions)

- **Button:** `+ Equip Tool`
- **Kya Hota Hai:** Ek modal open hota hai jisme se aap:
  1. Standard apps (Shopify, Slack, Google Sheets, Gmail, HubSpot, etc.) choose kar sakte hain.
  2. Apne **Action Builder** ke zariye banaye gaye custom **Private Actions** ko bhi equip kar sakte hain.
- **Kyu Use Karte Hain:**
  - AI bina tools ke sirf baatein kar sakta hai. Tools equip karne se use software mein kaam karne ki taaqat milti hai.

---

### Tool Active / Inactive Switch Toggle

- **UI Element:** Card ke right side mein `Active` switch.
- **Kyu Use Karte Hain:**
  - Agar aap kisi tool ko temporary band karna chahte hain bina use delete kiye, toh switch off kar dein. Testing ke time yeh bohot kaam aata hai.

---

### When Should the Agent Use This Tool? (Tool Guidance Description)

- **UI Label:** `When should the agent use this tool?`
- **Kyu Sabse Zaroori Field Hai (Most Important):**
  - AI model issi description ko padh kar decide karta hai ki yeh tool kab chalana hai. Agar description galat ya khali hoga, toh agent galat tool call kar dega ya confuse ho jayega.
- **Example:**
  - ❌ *Bura Description:* `"Slack tool"`
  - ✅ *Acha Description:* `"Call this tool to post an urgent alert in #order-issues whenever a customer complains about damaged goods."`

---

### Ask for Human Approval Before Running This Tool (Safety Switch)

- **UI Element:** Har tool card ke niche shield icon ke saath toggle: `Ask for your approval before running this tool`.
- **Zero Cognitive Load Design:**
  - Drawer ko clean aur light rakhne ke liye, toggle ON karne par saara form drawer ke andar expand nahi hota.
  - Iski jagah drawer card par sirf ek compact 1-line status pill aur `Configure` button dikhta hai.
  - Toggle ON karte hi ya `Configure` button dabate hi ek dedicated **Human Approval Modal drawer ke bahar** open ho jaata hai.
- **Kab Use Karein:**
  - Read-only tools par **OFF** rakhein.
  - Money, Delete, ya Public Email bhejne wale tools par **ON** rakhein.

---

### External Human Approval Configuration Modal (Drawer Ke Bahar)

Jab aap approval toggle ON karte hain ya `Configure` button par click karte hain, toh screen ke center mein clean **Modal** open hota hai:

1. **Approver Email Address:**
   - Reviewer ka email address (supports variable mapping jaise `{{step_1.manager_email}}`).
   - Standard `Press /` button se aap variable picker open kar sakte hain.
2. **Approval Email Subject:**
   - Email ka subject line (default: `Action Required: Approve ${tool.name}`).
3. **Reviewer Context & Details:**
   - Multiline notes field jisme dynamic variables pass karke email body mein reviewer ko full context diya ja sakta hai.
4. **Expiration Timeout:**
   - `1 Hour (Urgent Approvals)`
   - `24 Hours (Standard Default)`
   - `7 Days (Extended Window)`
   - Agar is time limit mein reviewer approve ya reject nahi karta, toh workflow expire hokar safe fallback message trigger kar deta hai.
5. **Live Approval Email Preview & Send Test:**
   - **Preview Approval Email & Send Test** button par click karne par hamara standard `EmailApprovalPreviewModal` open hota hai.
   - Yahan aap responsive Desktop aur Mobile email layout inspect kar sakte hain, custom decision buttons dekh sakte hain aur live test email direct apne inbox mein bhej kar test kar sakte hain.

---

## 6. Har Field Ka Detailed Breakdown: Tab 3 — Memory

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Brain & Goal   │   🛠️ Tools (3)   │   💾 Memory   │   🛡️ Guardrails            │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Session ID (Conversation Identifier)                                  [Press /]  │
│ [ {{step_1.customer_email}}                                                    ] │
│ Keeps track of conversations with the same person so the agent remembers chats.  │
│                                                                                  │
│ How much conversation history should the agent remember?                         │
│ [ Recent Messages (Remembers last few turns)                                  ▼ ] │
│ Controls whether the agent recalls previous customer questions or starts fresh.  │
│                                                                                  │
│ Window Size (Recent Messages)                                        10 messages │
│ [ 10 Messages (Recommended Standard)                                         ▼ ] │
│ Only keeps the last few messages in memory to keep responses fast and focused.   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Field 1: Session ID (Conversation Identifier)

- **UI Label:** `Session ID (Conversation Identifier)`
- **Subtext:** *"Keeps track of conversations with the same person (e.g. customer email or phone number) so the agent remembers previous chats."*
- **Kyu Use Karte Hain (Why):**
  - Yeh conversation ka unique ID (khata number) hota hai. Iski madad se agent pehchaan leta hai ki wahi customer dubara baat kar raha hai.
- **Kab Use Karein:**
  - Jab workflow email support, WhatsApp bot, ya web chat se juda ho. Yahan `{{step_1.sender_email}}` ya `{{step_1.phone_number}}` pass karein.
- **Agar Khali Chhod Diya Toh Kya Hoga?**
  - Har execution ek naye customer ki tarah chalegi, pichli baatein yaad nahi rahengi.

---

### Field 2: Memory Strategy

- **UI Label:** `How much conversation history should the agent remember?`
- **3 Options:**
  1. **Recent Messages (Window — Recommended):**
     - Sirf aakhri kuch baatein yaad rakhta hai. Token cost kam rehti hai aur agent fast rehta hai.
  2. **Full Session:**
     - Shuru se lekar aakhri tak saari baatein yaad rakhta hai. Complex consulting ya legal dialogues ke liye best hai.
  3. **No Memory:**
     - Memory band kar deta hai. Ek-baar chalne wale tasks ke liye perfect.

---

### Field 3: Window Size (Recent Messages Count)

- **Options:** `5`, `10`, `15`, `20` Messages.
- **Default:** `10 Messages` (Recommended)
- **Kyu Use Karte Hain:**
  - Zyada messages bhejenge toh token kharch badhega aur response slow hoga. 10 messages context ke liye best balance provide karta hai.

---

## 7. Har Field Ka Detailed Breakdown: Tab 4 — Safety & Limits

Yeh tab aapke workflow ko infinite loops, bade API bills aur unexpected tool errors se safe rakhne ke liye hard boundary set karta hai.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Brain & Goal   │   🛠️ Tools (3)   │   💾 Memory   │   🛡️ Safety & Limits       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Maximum Steps per Run                                                    5 steps │
│ [ 5 Steps (Recommended Default)                                               ▼ ] │
│ Limits how many actions the agent can take at once to prevent infinite loops.    │
│                                                                                  │
│ Fallback Message (if stuck)                                                      │
│ [ I was unable to complete the task within the allowed execution steps...      ] │
│ What the agent will reply if it cannot complete the goal or runs out of steps.   │
│                                                                                  │
│ Agent Test Run Simulator                                [ ▶ Run Test Simulation ]│
│ Preview how the agent thinks, makes decisions, and runs tools in real-time.      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Field 1: Maximum Steps per Run (Loop Prevention)

- **UI Label:** `Maximum Steps per Run`
- **Subtext:** *"Limits how many actions the agent can take at once to prevent infinite loops and save costs."*
- **Options:** `3`, `5`, `8`, `12` steps.
- **Kyu Use Karte Hain (Why):**
  - Agar kisi tool mein error aa gaya, toh AI bina control ke baar-baar us tool ko call karke infinite loop mein phas sakta hai aur aapka bill badha sakta hai. Yeh setting hard-limit laga deti hai.
- **Kab Kaunsa Choose Karein:**
  - `3 Steps:` Strict aur fast (sirf 1 lookup ke liye).
  - `5 Steps:` **Default**. 90% business tasks ke liye kaafi hota hai.
  - `8 ya 12 Steps:` Jab 3 se zyada apps ko ek saath call karna ho.

---

### Field 2: Fallback Message (if stuck)

- **UI Label:** `Fallback Message (if stuck)`
- **Subtext:** *"What the agent will reply if it cannot complete the goal or runs out of allowed steps."*
- **Kyu Use Karte Hain:**
  - Agar external app ka server down ho ya agent allowed steps mein task poora na kar paaye, toh customer ko kharab error message na dikhe, balki ek polite aur professional message mile:
  - *Example:* `"Main abhi aapki request poori nahi kar paya. Hamari support team ko alert bhej diya gaya hai, wo jald aapse sampark karenge."`

---

### Field 3: Agent Test Run Simulator (Live Preview Engine)

- **UI Label:** `Agent Test Run Simulator`
- **Button:** `▶ Run Simulation`
- **Subtext:** *"Preview how the agent thinks, makes decisions, and runs tools in real-time."*
- **Kaise Use Karein:**
  - Workflow ko publish karne se pehle is button par click karein. Yeh screen par live Thought ➔ Action ➔ Observation ka cycle dikhata hai taaki aap verify kar sakein ki agent sahi tools call kar raha hai.

---

## 8. Real-World Business Blueprints

### Blueprint 1: 24/7 Autonomous E-Commerce Support Assistant

```
[Trigger: Customer Support Email / WhatsApp]
              │
              ▼
[AI Agent: "Order Resolution Assistant"]
  ├── Model: GPT-4o
  ├── Tools:
  │     1. Shopify: Get Order By Email
  │     2. Shopify: Issue Refund (Requires Approval: ON)
  │     3. Slack: Alert Support Team
  ├── Goal: "Evaluate inquiry from {{step_1.customer_email}}. If asking for tracking, check Shopify and reply. If requesting refund, pause for approval."
  └── Memory: Session ID = {{step_1.customer_email}}, Window = 10
              │
              ▼
[Action: Gmail Send Reply]
  └── Content: {{step_2.output}}
```

---

### Blueprint 2: High-Value B2B Lead Qualifier & CRM Router

```
[Trigger: Website Form Submission]
              │
              ▼
[AI Agent: "B2B Sales Qualifier"]
  ├── Model: GPT-4o
  ├── Tools:
  │     1. HubSpot: Create Deal
  │     2. Slack: Post to #enterprise-deals
  ├── Instructions: "Score leads. If employee count > 50, mark as High Priority, create deal, and ping account executive."
  └── Goal: "Analyze {{step_1.company_size}} and {{step_1.budget}}."
              │
              ▼
[Action: Send Calendar Booking Link]
```

---

### Blueprint 3: Smart Data Cleansing & Deduplication Agent

```
[Trigger: Inbound Webhook / Partner API]
              │
              ▼
[AI Agent: "Data Sanitizer"]
  ├── Model: Claude 3.5 Sonnet
  ├── Tools:
  │     1. Google Sheets: Search Duplicate Email
  │     2. Google Sheets: Append Row
  ├── Goal: "Clean messy address strings, convert phone numbers to +91 international format, check for duplicate emails, and log clean rows."
  └── Guardrails: Max Steps = 5
```

---

## 9. Best Practices, Prompting Tips aur Common Mistakes

1. **Tool Description Ko Kabhi Khali Na Chhodein:** Hamesha specific likhein ki tool kab chalana hai.
2. **Dynamic Variables Zaroor Use Karein:** Goal prompt mein hamesha `Press /` karke trigger variables (jaise `{{step_1.body}}`) link karein.
3. **Pehle Simulator Mein Test Karein:** Workflow publish karne se pehle Guardrails tab mein simulator chala kar check karein.
4. **Human Approval On Rakhein:** Paison ke len-den ya data delete karne wale tools par hamesha human approval enable rakhein.
5. **Memory Window Ko 10 Par Rakhein:** 10 messages ka window speed aur cost dono ke hisab se ideal rehta hai.
