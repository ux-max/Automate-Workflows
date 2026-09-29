# AI Agent Node — Complete Architecture, Configuration & Working Guide (English)

> **Complete Reference Manual for the Autonomous AI Agent Node in Automate Workflows**
> 
> *A comprehensive, field-by-field, tab-by-tab guide explaining how the AI Agent node works, why and when to use each field, underlying ReAct reasoning mechanics, tool orchestration, session memory, guardrails, and real-world business implementations.*

---

## 📑 Table of Contents

1. [Introduction: What is the AI Agent Node?](#1-introduction-what-is-the-ai-agent-node)
   - [Linear Workflows vs. Autonomous AI Agent](#linear-workflows-vs-autonomous-ai-agent)
   - [Why We Use the AI Agent Node](#why-we-use-the-ai-agent-node)
   - [When to Use vs. When NOT to Use](#when-to-use-vs-when-not-to-use)
2. [How the AI Agent Node Works (Under the Hood)](#2-how-the-ai-agent-node-works-under-the-hood)
   - [The ReAct (Reasoning + Acting) Execution Cycle](#the-react-reasoning--acting-execution-cycle)
   - [Dynamic Tool Calling & Parameter Hydration](#dynamic-tool-calling--parameter-hydration)
   - [Variable Mapping Pipeline (`Press /`)](#variable-mapping-pipeline-press-)
3. [Header Controls & Quick Guide Modal](#3-header-controls--quick-guide-modal)
   - [Information Icon (`Info`) & Help Modal](#information-icon-info--help-modal)
   - [Canvas Identity & Status Badges](#canvas-identity--status-badges)
4. [Field-by-Field Reference: Tab 1 — Brain & Goal](#4-field-by-field-reference-tab-1--brain--goal)
   - [Agent Name / Role (Persona Title)](#agent-name--role-persona-title)
   - [AI Reasoning Model](#ai-reasoning-model)
   - [Agent Instructions & Rules (System Persona & Presets)](#agent-instructions--rules-system-persona--presets)
   - [What Should the Agent Do? (Goal Prompt)](#what-should-the-agent-do-goal-prompt)
5. [Field-by-Field Reference: Tab 2 — Equipped Apps & Tools](#5-field-by-field-reference-tab-2--equipped-apps--tools)
   - [Equipping Tools (Catalog Apps & Action Builder Private Actions)](#equipping-tools-catalog-apps--action-builder-private-actions)
   - [Tool Enable/Disable Toggle](#tool-enabledisable-toggle)
   - [When Should the Agent Use This Tool? (Tool Guidance)](#when-should-the-agent-use-this-tool-tool-guidance)
   - [Ask for Human Approval Before Running This Tool](#ask-for-human-approval-before-running-this-tool)
   - [Embedded Human Approval Node Settings (Approver Email, Subject, Timeout, Live Preview)](#embedded-human-approval-node-settings)
6. [Field-by-Field Reference: Tab 3 — Memory](#6-field-by-field-reference-tab-3--memory)
   - [Session ID (Conversation Identifier)](#session-id-conversation-identifier)
   - [Memory Strategy (Recent Messages vs Full Session vs No Memory)](#memory-strategy-recent-messages-vs-full-session-vs-no-memory)
   - [Window Size (Recent Messages Buffer)](#window-size-recent-messages-buffer)
7. [Field-by-Field Reference: Tab 4 — Safety & Limits](#7-field-by-field-reference-tab-4--safety--limits)
   - [Maximum Steps per Run (Loop & Cost Prevention)](#maximum-steps-per-run-loop--cost-prevention)
   - [Fallback Message (Graceful Failure Handler)](#fallback-message-graceful-failure-handler)
   - [Agent Test Run Simulator (Live ReAct Preview Engine)](#agent-test-run-simulator-live-react-preview-engine)
8. [End-to-End Business Implementation Blueprints](#8-end-to-end-business-implementation-blueprints)
   - [Blueprint 1: Autonomous E-Commerce Support Assistant](#blueprint-1-autonomous-e-commerce-support-assistant)
   - [Blueprint 2: High-Value B2B Lead Qualifier & CRM Router](#blueprint-2-high-value-b2b-lead-qualifier--crm-router)
   - [Blueprint 3: Smart Data Cleansing & Deduplication Agent](#blueprint-3-smart-data-cleansing--deduplication-agent)
9. [Best Practices, Prompting Rules & Troubleshooting](#9-best-practices-prompting-rules--troubleshooting)
   - [How to Write Bulletproof Tool Descriptions](#how-to-write-bulletproof-tool-descriptions)
   - [Preventing Infinite Tool Loops](#preventing-infinite-tool-loops)
   - [Cost & Latency Optimization](#cost--latency-optimization)

---

## 1. Introduction: What is the AI Agent Node?

The **AI Agent Node** is an intelligent, autonomous execution node in Automate Workflows. Unlike traditional automation steps that blindly perform a single pre-configured API call, the AI Agent node acts like an **experienced digital team member** embedded directly inside your workflow pipeline.

### Linear Workflows vs. Autonomous AI Agent

| Dimension | Traditional Workflow Step | AI Agent Node |
| :--- | :--- | :--- |
| **Decision Making** | 0% (Strict deterministic rules: *If Trigger X happens, always run Step Y*) | 100% (Evaluates context, formulates plans, and chooses which tool to invoke) |
| **Input Flexibility** | Rigid JSON fields (Breaks if customer formats data differently) | Unstructured natural language, messy text, varying formats, multi-language inputs |
| **Tool Orchestration** | 1 step = 1 fixed API action | 1 node can call 0, 1, 2, or 5 different tools dynamically based on need |
| **Condition Handling** | Requires dozens of complex `Router` branches and nested `Filter` rules | Resolves complex branching internally within a single node |
| **Human Escalation** | Requires manual external ticketing setup | Built-in human approval triggers for sensitive actions (refunds, deletes) |

### Why We Use the AI Agent Node

1. **Eliminate Spaghetti Branching:** In complex business logic (e.g. customer service), handling 10 different customer intents with traditional `Router` nodes requires 10 parallel paths with 30+ separate steps. An AI Agent node handles all 10 intents dynamically inside a single node.
2. **Context-Aware Judgment:** Normal steps cannot read an email and decide whether the user is angry, asking for a status update, or requesting an enterprise quote. The AI Agent analyzes the nuance before taking action.
3. **Multi-Tool Autonomous Execution:** The agent can search Shopify for an order, see that it hasn't shipped yet, look up FedEx tracking, post an alert to Slack, and reply to the customer with an exact delivery date—all within a single execution step.
4. **State & Memory Retention:** With conversational memory enabled, the agent remembers previous interactions with the same customer so customers never have to repeat their order number or issue.

### When to Use vs. When NOT to Use

#### ✅ When to Use:
- Customer inquiry triage and automated resolution.
- Complex inbound lead scoring and dynamic routing based on free-form descriptions.
- Extracting structured data from messy webhook payloads, emails, or PDF text.
- Workflows that need to dynamically decide between 2 to 6 different apps based on real-time findings.
- Guardrailed actions where low-risk requests are resolved instantly, but high-risk actions pause for human approval.

#### ❌ When NOT to Use:
- **Simple 1-to-1 Syncs:** E.g., *"When a Typeform is submitted, add row to Google Sheets."* Use standard native actions for speed and lower latency.
- **Strict High-Frequency ETL:** If you are migrating 500,000 database records per hour, standard API actions or custom code runners are faster and cost-free.

---

## 2. How the AI Agent Node Works (Under the Hood)

The AI Agent node is built upon the **ReAct (Reasoning + Acting)** framework combined with dynamic tool calling:

```
                      ┌──────────────────────────────────────┐
                      │    Trigger / Upstream Variables      │
                      │   e.g. {{step_1.customer_query}}     │
                      └──────────────────┬───────────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │          AI AGENT BRAIN              │
                      │  (GPT-4o / Claude 3.5 / Gemini Pro)  │
                      └──────────────┬──────────────▲────────┘
                                     │              │
                    1. Formulates    │              │ 4. Observes
                       Thought       │              │    Result
                                     ▼              │
                      ┌─────────────────────────────┴────────┐
                      │        TOOL ORCHESTRATOR             │
                      │  Shopify • Slack • Sheets • Private  │
                      └──────────────┬───────────────────────┘
                                     │
                    2. Checks Human  │ Sensitive?
                       Approval      ├──────────► [Pause for Approval]
                                     │ Safe?
                                     ▼
                      ┌──────────────────────────────────────┐
                      │          3. Executes Action          │
                      │   Lookup Order / Send Notification   │
                      └──────────────────┬───────────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │      Final Synthesized Response      │
                      │  Ready for Downstream Workflow Steps │
                      └──────────────────────────────────────┘
```

### The ReAct (Reasoning + Acting) Execution Cycle

1. **Ingestion & Hydration:** The node receives the **Goal Prompt** containing resolved variables from upstream steps (e.g. `{{step_1.sender_email}}`, `{{step_1.message_body}}`).
2. **Context Memory Retrieval:** If a `Session ID` is provided and memory is enabled, the agent queries the conversation store to append recent dialogue history.
3. **Thought Generation:** The model generates internal reasoning: *"The user is asking about order #4810. I have a Shopify tool available to lookup orders. I will call `shopify_get_order` with `order_id: 4810`."*
4. **Action Execution:** The runtime invokes the selected tool with parameters extracted by the LLM.
5. **Observation:** The tool execution result (e.g. `{ status: "shipped", tracking: "1Z999..." }`) is fed back into the model's context window.
6. **Iterate or Finish:** If the goal is met, the agent generates the final synthesized message. If additional information is needed (e.g. notifying Slack), it executes the next tool until finished or until `Max Steps` is reached.

### Dynamic Tool Calling & Parameter Hydration

Equipped tools are exposed to the AI model using structured JSON Schema function definitions. The agent automatically infers the right arguments from the conversation context. For example:
- If a user types *"Please refund $45 on order 9012"*, the agent automatically maps `{ order_id: "9012", amount: 45.00 }` to your refund tool parameters without manual mapping.

### Variable Mapping Pipeline (`Press /`)

Users can press `/` inside the Goal Prompt and Session ID fields to open the layered **Variable Picker**. Upstream variables appear as interactive visual pills that resolve dynamically at runtime during workflow execution.

---

## 3. Header Controls & Quick Guide Modal

The top header bar of the AI Agent Setup Drawer provides immediate access to node identity and documentation:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [Bot Icon]  AI Agent Setup  [(i) Info Icon]                [Maximize]  [Close X]│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Information Icon (`Info`) & Help Modal

- **Location:** Directly to the right of the **"AI Agent Setup"** header label.
- **Interaction:** Clicking opens the **`AIAgentInfoModal`** built using the project's standard `Modal` component.
- **What it Contains:**
  - **Hero Analogy:** Explains the node as a smart digital assistant.
  - **Comparison Tab:** Regular Step vs. AI Agent side-by-side comparison.
  - **Real-World Examples Tab:** Real business scenarios (E-Commerce, B2B Sales, Operations).
  - **The 4 Easy Settings Tab:** Summary of Brain, Tools, Memory, and Guardrails tabs.
  - **Action Button:** *"Got It, Let's Build"* to dismiss and return to workflow building.

---

## 4. Field-by-Field Reference: Tab 1 — Brain & Goal

The **Brain & Goal** tab configures the agent's identity, intelligence model, behavioral boundaries, and primary objective.

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

### Agent Name / Role (Persona Title)

- **UI Label:** `Agent Name / Role`
- **Subtext:** *"What job is this agent doing? (e.g. Customer Support, Lead Qualifier, Refund Checker)."*
- **Badge:** `Name on workflow canvas`
- **Why We Use It:**
  - Identifies this node on the visual workflow canvas and in execution audit logs.
  - Helps the LLM understand its primary professional persona and scope of authority.
- **When We Use It:**
  - Always configure this field so your team and workflow collaborators immediately understand the node's purpose.
- **Recommended Examples:**
  - `E-Commerce Customer Support Bot`
  - `Inbound VIP Lead Qualifier`
  - `IT Access & Password Escalation Bot`
  - `Order Fulfillment & Tracking Assistant`

---

### AI Reasoning Model

- **UI Label:** `AI Reasoning Model`
- **Subtext:** *"The AI brain that reads your prompt, makes smart decisions, and runs your equipped tools."*
- **Badge:** `● Ready & Active` (Emerald indicator)
- **Supported Options:**
  1. **OpenAI GPT-4o (`gpt-4o`) — Recommended Standard:**
     - Best general balance of reasoning intelligence, fast function calling, and speed.
     - *Use when:* General customer support, multi-tool workflows, and sales routing.
  2. **Anthropic Claude 3.5 Sonnet (`claude-3-5-sonnet`) — Deep Reasoning:**
     - Industry-leading coding and complex policy adherence.
     - *Use when:* Strict compliance checking, analyzing complex legal/technical contracts, or tricky data transformation.
  3. **Google Gemini 1.5 Pro (`gemini-1-5-pro`) — Huge Context Window (2M Tokens):**
     - Capable of ingesting massive PDF manuals, entire database dumps, or long conversation histories.
     - *Use when:* RAG document querying, analyzing long email chains, or processing large order catalogs.
  4. **OpenAI GPT-4o Mini (`gpt-4o-mini`) — Fast & Cost-Effective:**
     - Ultra-low latency and minimal cost per run.
     - *Use when:* Simple classification, sentiment tagging, or high-volume low-complexity tasks.

---

### Agent Instructions & Rules (System Persona & Presets)

- **UI Label:** `Agent Instructions & Rules`
- **Subtext:** *"Give the agent clear guidelines on how to talk, what rules to follow, and what answers to give."*
- **Badge:** `How it should behave`
- **Why We Use It:**
  - This is the system prompt that defines the agent's tone, rules, dos and don'ts, constraints, and decision policies.
  - The agent consults these instructions at every step of its reasoning loop.
- **When We Use It:**
  - Always provide clear instructions. Without guidelines, the agent may reply too casually or run tools prematurely.
- **Built-in 1-Click Presets:**
  - **Support & Refund Triage:** Sets persona for customer lookup, polite answers, and flagging refunds over $100 for human approval.
  - **Lead Qualification Agent:** Scores B2B leads by job title and company size, updates CRM, and notifies sales reps in Slack.
  - **Data Sync & Harmonizer:** Cleanses user input fields, matches cross-system records, and deduplicates logs.
  - **Autonomous IT Helpdesk:** Resolves password resets, queries knowledge bases, and escalates access requests.
- **Best Practice Template:**
  ```markdown
  1. Role: You are a friendly customer service assistant for Acme Corp.
  2. Tone: Polite, concise, and helpful. Do not use overly complex jargon.
  3. Verification: Always look up the customer's order in Shopify before answering questions about delivery.
  4. Safety: If an order value exceeds $100 or requires a cancellation, trigger the approval workflow.
  5. Output: Provide an executive summary of actions taken and the final customer reply.
  ```

---

### What Should the Agent Do? (Goal Prompt)

- **UI Label:** `What should the agent do? (Goal Prompt) *`
- **Subtext:** *"The main task for the agent to complete. You can type instructions and add variables from previous steps with /."*
- **Key Feature:** `Press /` button to insert upstream variables as interactive visual pills.
- **Why We Use It:**
  - This is the actual real-time assignment the agent is tasked to solve for this specific workflow run.
- **When We Use It:**
  - Required for every execution. This connects the trigger payload (e.g. incoming message, form submission) to the agent.
- **Examples:**
  - `Evaluate incoming ticket from {{step_1.customer_email}}: "{{step_1.message_body}}". Check order history and reply with status.`
  - `Review new lead {{step_1.lead_name}} from {{step_1.company_domain}}. Determine company size and notify #sales-alerts.`

---

## 5. Field-by-Field Reference: Tab 2 — Equipped Apps & Tools

The **Tools** tab equips your AI agent with capabilities to query external databases, post notifications, or create records across your tech stack.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Brain & Goal   │   🛠️ Tools (3)   │   💾 Memory   │   🛡️ Safety & Limits       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Equipped Apps & Tools                                         [ + Equip Tool ]   │
│ Select apps (like Shopify, Slack, Gmail) this agent is allowed to use.           │
│                                                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Slack Icon]  Slack: Send Message              [Slack] [Active Toggle] [Trash]│
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

### Equipping Tools (Catalog Apps & Action Builder Private Actions)

- **Header Action:** `+ Equip Tool` button.
- **Modal Capabilities:**
  - Search apps by name or category.
  - Choose from standard catalog integrations (Shopify, Slack, Google Sheets, Gmail, HubSpot, etc.).
  - Choose custom **Action Builder Private Actions** deployed by your team.
- **Why We Equip Tools:**
  - An LLM by itself can only generate text. Tools give the agent **hands and feet** to interact with real software.
- **When to Equip Tools:**
  - Only equip the tools necessary for the agent's goal. (Equipping 20 unnecessary tools increases token usage and reasoning latency).

---

### Tool Enable/Disable Toggle

- **UI Element:** `Active` Switch on each tool card.
- **Purpose:** Temporarily disable a tool from the agent's reach without permanently deleting its configuration.
- **When to Use:** Great for testing and staged rollouts (e.g. testing an agent in "read-only" mode before enabling writing/updating actions).

---

### When Should the Agent Use This Tool? (Tool Guidance)

- **UI Label:** `When should the agent use this tool?`
- **Subtext / Placeholder:** `e.g. Call this whenever a customer asks about their order status or shipment...`
- **Why This Field is Critical:**
  - When the AI decides which tool to call, it reads this description. If the description is vague, the agent may call the wrong tool or hallucinate.
- **When to Use:**
  - Always write a concise, specific sentence explaining the trigger condition and required data for this tool.
- **Good vs. Bad Descriptions:**
  - ❌ *Bad:* "Slack tool" (The agent has no idea when to use it).
  - ✅ *Good:* "Call this tool to post an urgent alert in #high-value-leads whenever an enterprise deal over $5,000 is detected."

---

### Ask for Human Approval Before Running This Tool

- **UI Element:** `Ask for your approval before running this tool` switch with shield icon on each tool card.
- **Zero Cognitive Load Design:**
  - To prevent drawer clutter and information overload, turning this toggle ON opens a dedicated **Human Approval Configuration Modal outside the drawer**.
  - On the tool card inside the drawer, only a clean, 1-line summary badge with a `Configure` button is shown (displaying reviewer email and timeout duration).
- **When to Use:**
  - Turn **ON** for write/delete/charge actions that carry business or customer-facing risk.
  - Leave **OFF** for read-only lookups.

---

### External Human Approval Configuration Modal (Outside the Drawer)

When you toggle approval ON or click `Configure`, our design system `Modal` opens in the center of the screen, providing a focused workspace:

1. **Approver Email Address:**
   - Supports variable mapping (`{{step_1.manager_email}}`) or direct email (`manager@company.com`).
   - Standard `Press /` shortcut opens the variable picker.
2. **Approval Email Subject:**
   - Auto-prefilled with `Action Required: Approve ${tool.name}` (editable).
3. **Reviewer Context & Details:**
   - Multiline input supporting variable tokens for passing rich context into the approval request.
4. **Expiration Timeout:**
   - `1 Hour (Urgent Approvals)`
   - `24 Hours (Standard Default)`
   - `7 Days (Extended Window)`
   - If the reviewer does not respond before timeout, the agent gracefully routes to its Fallback Message.
5. **Live Approval Email Preview & Test:**
   - Clicking **Preview Approval Email & Send Test** opens `EmailApprovalPreviewModal` to inspect the responsive email layout and send a test message to your inbox.

---

## 6. Field-by-Field Reference: Tab 3 — Memory

The **Memory** tab configures multi-turn conversational context so the agent recognizes returning customers and remembers prior exchanges.

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

### Session ID (Conversation Identifier)

- **UI Label:** `Session ID (Conversation Identifier)`
- **Subtext:** *"Keeps track of conversations with the same person (e.g. customer email or phone number) so the agent remembers previous chats."*
- **Supports:** Dynamic variables (`Press /`).
- **Why We Use It:**
  - Serves as the unique database key under which dialogue history is stored.
  - If a user sends 3 emails throughout the afternoon, using `{{step_1.customer_email}}` ensures all 3 emails share the same conversational context.
- **Recommended Values:**
  - `{{step_1.customer_email}}` (For email support)
  - `{{step_1.sender_phone}}` (For WhatsApp / SMS support)
  - `{{step_1.user_id}}` (For authenticated web/app chatbots)
- **What Happens If Left Empty?**
  - The node operates statelessly—each execution runs as a brand-new conversation without history.

---

### Memory Strategy

- **UI Label:** `How much conversation history should the agent remember?`
- **Supported Options:**
  1. **Recent Messages (Window — Default & Recommended):**
     - Stores only the most recent *N* messages (sliding window buffer).
     - Keeps token costs low and prevents the model from getting distracted by old, irrelevant chatter.
  2. **Full Session:**
     - Stores the complete conversation history indefinitely.
     - Best for legal dialogues, onboarding sequences, or high-touch consulting chats.
  3. **No Memory (Stateless):**
     - Completely disables memory. Each trigger execution is evaluated in isolation.
     - Best for one-off automated data syncs and single-event webhooks.

---

### Window Size (Recent Messages Buffer)

- **UI Label:** `Window Size (Recent Messages)`
- **Options:** `5`, `10`, `15`, `20` messages.
- **Why We Use It:**
  - Every message stored in memory consumes LLM context tokens. A window of 10 messages provides ample context while keeping latency under 1.5 seconds.

---

## 7. Field-by-Field Reference: Tab 4 — Safety & Limits

The **Safety & Limits** tab protects your business from runaway loops, excessive API bills, and unexpected failures by setting hard execution boundaries.

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

### Maximum Steps per Run (Loop & Cost Prevention)

- **UI Label:** `Maximum Steps per Run`
- **Subtext:** *"Limits how many actions the agent can take at once to prevent infinite loops and save costs."*
- **Options:**
  - `3 Steps:` Strict, fast, low cost. Best for single-tool lookups.
  - `5 Steps (Recommended Default):` Balanced for 90% of business tasks (e.g. Lookup ➔ Reason ➔ Post Notification ➔ Final Reply).
  - `8 Steps:` Multi-tool enterprise tasks (Lookup CRM ➔ Check Inventory ➔ Update Database ➔ Alert Team).
  - `12 Steps:` Deep multi-step data processing.
- **Why We Use It:**
  - If an external tool returns unexpected data, an AI without guardrails might query the tool repeatedly in an infinite loop. This setting hard-stops execution.

---

### Fallback Message (Graceful Failure Handler)

- **UI Label:** `Fallback Message (if stuck)`
- **Subtext:** *"What the agent will reply if it cannot complete the goal or runs out of allowed steps."*
- **Default Copy:**
  `"I was unable to complete the task within the allowed execution steps. A team member has been notified."`
- **Why We Use It:**
  - Guarantees your customer or downstream steps always receive a polite, predictable message even if an external tool API is down or max steps are exhausted.

---

### Agent Test Run Simulator (Live ReAct Preview Engine)

- **UI Label:** `Agent Test Run Simulator`
- **Button:** `▶ Run Simulation` (with real-time spinner)
- **Subtext:** *"Preview how the agent thinks, makes decisions, and runs tools in real-time."*
- **Interactive Trace Stages:**
  1. 💭 **Thought:** `Analyzing input goal: "Evaluate inquiry from customer@email.com...". Context mapped from session.`
  2. ⚡ **Action:** `Executing Tool 1/2: Shopify -> getOrderDetails()`
  3. 🔍 **Observation:** `Tool returned status: Order #5821 - Shipped via FedEx tracking 1Z9999.`
  4. ⚡ **Action:** `Executing Tool 2/2: Slack -> sendChannelMessage()`
  5. 🔍 **Observation:** `Slack message delivered to #customer-alerts.`
  6. ✅ **Final Synthesized Response:** `ReAct Loop successfully resolved goal in 2 tool calls. Output prepared for downstream steps.`
- **Why We Use It:**
  - Allows full verification of agent logic and tool sequencing before publishing workflows live.

---

## 8. End-to-End Business Implementation Blueprints

### Blueprint 1: Autonomous E-Commerce Support Assistant

```
[Trigger: Incoming Email / Chat]
            │
            ▼
[AI Agent: "Customer Support & Order Assistant"]
   ├── Equipped Tools:
   │     1. Shopify: Get Order By Email
   │     2. Shopify: Issue Refund (Requires Approval)
   │     3. Slack: Alert Channel
   ├── Goal: "Identify user intent from {{step_1.body}}. If order status, look up Shopify and reply with tracking. If refund, request approval."
   └── Memory: Session ID = {{step_1.sender_email}}, Window = 10
            │
            ▼
[Action: Gmail Send Reply]
   └── Body = {{step_2.output}}
```

---

### Blueprint 2: High-Value B2B Lead Qualifier & CRM Router

```
[Trigger: Typeform Form Submitted]
            │
            ▼
[AI Agent: "B2B Lead Qualifier"]
   ├── Equipped Tools:
   │     1. Clearbit / Enrichment API
   │     2. HubSpot: Create Deal
   │     3. Slack: Post Message
   ├── Goal: "Analyze {{step_1.company_size}} and {{step_1.use_case}}. If employees > 100, create Enterprise Deal in HubSpot and alert #vip-deals."
   └── Guardrails: Max Steps = 5
            │
            ▼
[Action: Send Calendar Invite to Enterprise Rep]
```

---

### Blueprint 3: Smart Data Cleansing & Deduplication Agent

```
[Trigger: Inbound Webhook / CSV Upload]
            │
            ▼
[AI Agent: "Data Harmonizer & Cleanser"]
   ├── Equipped Tools:
   │     1. Google Sheets: Search Row
   │     2. Google Sheets: Append Row
   │     3. Text Utilities: Format Address
   ├── Goal: "Clean messy address strings, verify no duplicate email exists in Sheet, format phone numbers into international E.164, and log row."
   └── Guardrails: Max Steps = 8
```

---

## 9. Best Practices, Prompting Rules & Troubleshooting

1. **Be Specific in Tool Guidance:** Always tell the tool description *when* to execute and *what inputs* to use. Never leave descriptions blank.
2. **Always Use Session IDs for Conversational Apps:** If your trigger is a chat or email thread, always map `{{step_1.sender_email}}` or `{{step_1.phone_number}}` to Session ID.
3. **Keep Max Steps Conservative:** Start with `5 steps`. If your agent legitimately needs 4 tool calls, increase to `8 steps`.
4. **Use Human Approval for Financial & Deletion Actions:** Always enable *Ask for Human Approval* on tools like `Cancel Order`, `Issue Refund`, `Delete Contact`, or `Drop Database Table`.
5. **Test in the Simulator First:** Use the built-in simulator on the Guardrails tab to preview the Thought ➔ Action ➔ Observation cycle before publishing.
