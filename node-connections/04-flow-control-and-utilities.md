# 04 — Flow Control, Generic Connectors & Utilities Architecture

> Detailed guide covering authentication, payload transformation, variable generation, and field population for **Generic Connectors**, **Flow Control Engines**, and **Built-in Utilities**.

---

## 1. 🪝 Generic Connectors

### ⚡ Webhook — Catch Hook
- **Auth Type:** `None` (Zero-configuration public URL with optional Secret Token)
- **URL Format:**
  `https://connect.automateworkflows.com/webhook-listener/webhook/<unique_guid>`
- **Payload Ingestion:**
  - Accepts any HTTP `POST`, `PUT`, or `GET` request from any third-party SaaS or custom server.
  - Automatically parses `application/json`, `application/x-www-form-urlencoded`, and raw text.
  - Generates top-level and nested variable tokens dynamically from whatever keys the sender transmits:
    - If sender posts: `{ "order_id": 991, "customer": { "email": "a@b.com" } }`
    - Populates: `{{step_1.order_id}}`, `{{step_1.customer_email}}`

### 🌐 Custom API Request (HTTP Client)
- **Auth Type:** Configurable per request:
  - **No Auth**: Public REST endpoints
  - **Bearer Token**: Injects `Authorization: Bearer <token>`
  - **Basic Auth**: Injects `Authorization: Basic base64(user:pass)`
  - **Custom Headers**: Injects key-value pairs (e.g. `X-API-Key: secret`)
- **Variable Output Generation:**
  - Executes outbound HTTP request (GET, POST, PUT, DELETE, PATCH).
  - Captures response status code (`{{step_2.status_code}}`), latency (`{{step_2.latency_ms}}`), and parses JSON response body into variable tokens.

---

## 2. 🔀 Flow Control Engines

### ⏱️ Scheduler
- **Auth Type:** `None` (Internal Cron Scheduler)
- **Execution:** Runs in a distributed job queue matching cron expressions or standard intervals.
- **Output Variables:**
  - `{{step_1.scheduled_run_id}}` → Unique execution hash
  - `{{step_1.next_trigger_time}}` → ISO 8601 timestamp of upcoming run
  - `{{step_1.timezone}}` → Configured timezone (e.g. `Asia/Kolkata`)

### 🔍 Filter
- **Auth Type:** `None` (Local Rule Evaluator)
- **Execution:** Evaluates multi-condition AND/OR rules against mapped variables:
  ```
  IF ({{step_1.amount}} > 500) AND ({{step_1.status}} == "paid")
  ```
- **Behavior:**
  - If condition passes: Workflow proceeds to next step with `{{step_2.filter_matched}} = true`.
  - If condition fails: Workflow cleanly pauses/stops with execution log marking `Status: Filtered Out`.

### 🔀 Router (Multi-Branching Engine)
- **Auth Type:** `None` (Multi-Route Evaluator)
- **Execution:** Evaluates rules across independent branches (Route A, Route B, Fallback).
- **Sub-Action Isolation:** Each route branch maintains its own isolated child steps collection (`routeASteps`, `routeBSteps`, nested recursive branches).
- **Output Variables:**
  - `{{step_2.selected_branch}}` → Name of the matched branch (e.g. `"Route A — VIP Customers"`)
  - `{{step_2.branch_matched}}` → `true` / `false`

### ⏳ Delay (Queue & Timer)
- **Auth Type:** `None` (Timer Scheduler)
- **Modes:**
  - **Delay For:** Pauses workflow for `N` minutes, hours, or days.
  - **Delay Until:** Pauses until a specified calendar timestamp `YYYY-MM-DDTHH:mm:ss`.
  - **Rate Limiter Queue:** Throttles downstream dispatches (e.g. Max 10 messages per minute).
- **Output Variables:**
  - `{{step_2.delayed_until}}` → Resumption timestamp
  - `{{step_2.status}}` → `"COMPLETED"`

### 🔁 Iterator / Loop & Aggregator
- **Auth Type:** `None` (Array Processing Engine)
- **Data Source:** Consumes raw arrays (e.g. `{{step_1.line_items}}` from Shopify or Webhook).
- **Execution:** Sequentially executes nested steps for each array element.
- **Output Variables (Per Iteration):**
  - `{{step_2.current_item}}` → Active item object
  - `{{step_2.index}}` → Zero-based index (`0`, `1`, `2`)
  - `{{step_2.is_first}}` → `true` for first element
  - `{{step_2.is_last}}` → `true` for final element
  - `{{step_2.total_count}}` → Array length
- **Paired with Aggregator (`aggregate_items`):**
  - Consolidates loop results into a single formatted CSV string, newline text, markdown bullet list, or JSON array.

---

## 3. 🛠️ Built-in Utilities

### 🔤 Text Formatter
- **Operations:** Truncate text, Transform casing (UPPERCASE, lowercase, Title Case), Find & replace text, Extract Email/URL/Phone via regex, Split text string into parts.
- **Output Variables:**
  - `{{step_2.transformed_text}}` → Processed text string
  - `{{step_2.parts_count}}` → Count of split segments
  - `{{step_2.matched_pattern}}` → Regex extracted match

### 🔢 Number Formatter
- **Operations:** Currency formatting (with custom symbols `$`, `₹`, `€` and decimal precision), Math operations, Excel/Spreadsheet formula parsing (`=SUM({{step_1.val}}, 100)`).
- **Output Variables:**
  - `{{step_2.formatted_number}}` → Formatted string (e.g. `"$1,450.00"`)
  - `{{step_2.calculated_result}}` → Numeric calculation result

### 📅 DateTime Formatter
- **Operations:** Format timestamp into standard date formats (`YYYY-MM-DD`, `DD/MM/YYYY`, `MMMM Do YYYY`), Timezone conversion (e.g. UTC to `Asia/Kolkata`), Add/subtract days/hours.
- **Output Variables:**
  - `{{step_2.formatted_date}}` → Formatted date string
  - `{{step_2.unix_timestamp}}` → Epoch seconds
  - `{{step_2.iso_string}}` → UTC ISO 8601 string

### 💻 Code Runner (Python 3.11 & JavaScript Node.js 20)
- **Auth Type:** `None` (Sandboxed Script Engine)
- **Context Binding:**
  - **Python:** Variables available via the global dictionary `input_data`. Script returns results via the global `output` dictionary.
  - **JavaScript:** Variables available via `inputData` object. Script returns results via standard `return { ... }`.
- **Dynamic Variable Ingestion:**
  - Whatever dictionary/object keys the custom code script returns are automatically parsed and surfaced as first-class variable tokens in the `VariablePicker`!

---

## 4. 👤 Human in the Loop

### ✉️ Request Email Approval (`wait_for_approval`)
- **Auth Type:** `None` (Zero external auth — dispatches via Automate Workflows Mailer service)
- **Configurable Decision Buttons:**
  - `approve_button_label` (default: `"Approve"`, supports dynamic variable mapping e.g. `"Accept Quote #{{step_1.quote_id}}"`)
  - `reject_button_label` (default: `"Reject"`, supports dynamic variable mapping e.g. `"Decline Request"`)
- **Interactive Email Preview & Test Engine:**
  - Real-time drawer badges showing live `✓ [Approve Label]` and `✕ [Reject Label]` pills.
  - Dedicated **Email Approval Preview Modal** featuring:
    - Desktop and Mobile email client mockups.
    - Automatic template variable substitution (`{{step_1.amount}}` → `$1,450.00`).
    - Interactive simulated click feedback.
    - 1-click **Send Preview Message** test action.
- **Workflow Pausing & Resumption:**
  - Workflow pauses at step execution.
  - Approver clicks either button in email.
  - Workflow resumes with output:
    ```json
    {
      "decision": "APPROVED",
      "approver": "manager@company.com",
      "button_clicked": "Approve",
      "approved_at": "2026-09-08T14:30:00Z"
    }
    ```

### 📋 Pause Workflow for Manual Form Fill (`request_user_input`)
- **Auth Type:** `None`
- **Interactive Form Field Builder (`fields_to_collect`):**
  - **Single-Line Drawer Cards**: Field badge `#`, label, type, modal configure button (`Sliders`), delete (`Trash2`).
  - **FormFieldModal (`+ Add Blank Field`)**: Name, input type, category choices manager (`+ Add choice`, `[ × ]`), required toggle.
  - **Supported Types**: Text, Number, Date, Textarea, Category - Single select, Category - Multi select, Checkbox, File upload.
  - **Raw Text Toggle**: Switch between Card View and `</> Raw Text` syntax.
- **Workflow Resumption Output:**
  - When form is submitted by assignee, workflow resumes with structured `form_data` containing all collected inputs mapped to dynamic variable tokens.

---

*← [Back: Communication & Scheduling](./03-communication-and-scheduling.md) | [Back to Master Index](./README.md) | [Next: Variable Mapping Deep-Dive →](./05-variable-mapping-deep-dive.md)*
