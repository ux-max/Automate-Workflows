# 10 — Utility Nodes

> Data transformation, custom code execution, API connectors, and human-in-the-loop approval nodes.

---

## ✏️ Text Formatter

| Property | Value |
|----------|-------|
| **App ID** | `text-formatter` |
| **Icon** | `Type` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Split, transform, extract, or replace text strings. |

### ▶️ Actions (5)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `split_text` | Split Text String | Splits text by separator (comma, space, etc.) |
| 2 | `change_case` | Transform Casing (UPPER/lower/Title) | Converts text to UPPERCASE, lowercase, or Title Case |
| 3 | `find_replace` | Find & Replace Text | Replaces target pattern or string in text |
| 4 | `extract_email_url` | Extract Email, URL or Phone Number | Parses text to extract valid contact patterns |
| 5 | `truncate_text` | Truncate Character Length (...) | Limits text length with trailing ellipsis |

### 📋 Action Schema: Split Text String

**Action ID:** `split_text`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `transform_type` | Transformation Operation | select | ✅ | `split` | ✅ |
| `input_text` | Source Text | textarea | ✅ | — | ✅ |
| `separator` | Split Delimiter / Separator | text | ❌ | — | ✅ |
| `segment_index` | Segment Item to Return | select | ❌ | `first` | ✅ |

**Segment Options:** First Item, Last Item, All Items (Array)

**Sample Output:**
```json
{
  "result": ["John", "Doe", "Engineering"],
  "first_item": "John",
  "last_item": "Engineering",
  "item_count": 3
}
```

### 📋 Action Schema: Transform Casing

**Action ID:** `change_case`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `transform_type` | Transformation Operation | select | ✅ | `change_case` | ✅ |
| `input_text` | Source Text | textarea | ✅ | — | ✅ |
| `target_casing` | Target Casing Format | select | ❌ | `upper` | ✅ |

**Casing Options:** UPPERCASE, lowercase, Title Case, Capitalize First Letter Only

**Sample Output:**
```json
{
  "transformed_text": "JOHN DOE",
  "original_text": "john doe",
  "casing": "upper"
}
```

### 📋 Action Schema: Find & Replace Text

**Action ID:** `find_replace`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `transform_type` | Transformation Operation | select | ✅ | `find_replace` | ✅ |
| `input_text` | Source Text | textarea | ✅ | — | ✅ |
| `find_text` | Find Text | text | ✅ | — | ✅ |
| `replace_text` | Replace With | text | ❌ | — | ✅ |
| `case_sensitive` | Match Case Sensitive? | select | ❌ | `False` | ✅ |
| `replace_all` | Replace All Occurrences? | select | ❌ | `True` | ✅ |

**Sample Output:**
```json
{
  "result_text": "Order status: APPROVED for customer Alex",
  "replacements_made": 1,
  "find": "PENDING",
  "replace": "APPROVED"
}
```

### 📋 Action Schema: Extract Email, URL or Phone

**Action ID:** `extract_email_url`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `transform_type` | Transformation Operation | select | ✅ | `extract_url` | ✅ |
| `input_text` | Source Text | textarea | ✅ | — | ✅ |
| `extract_format` | Pattern to Extract | select | ❌ | `url` | ✅ |
| `return_format` | Match Return Option | select | ❌ | `first` | ✅ |

**Extract Format Options:** Website URL, Email Address, Phone Number  
**Return Options:** First Match (Single String), All Matches (Array List)

**Sample Output:**
```json
{
  "extracted_value": "https://automate.io",
  "pattern_type": "url",
  "match_count": 1,
  "success": true
}
```

### 📋 Action Schema: Truncate Character Length

**Action ID:** `truncate_text`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `transform_type` | Transformation Operation | select | ✅ | `truncate` | ✅ |
| `text` | Text | textarea | ✅ | — | ✅ |
| `max_length` | Max Length | number | ❌ | `20` | ✅ |
| `skip_characters` | Skip Characters | number | ❌ | — | ✅ |
| `append_ellipsis` | Append Ellipsis? | select | ❌ | `True` | ✅ |
| `append_ellipsis_text` | Append Ellipsis Text | text | ❌ | `...` | ✅ |

**Sample Output:**
```json
{
  "truncated_text": "The stars twinkled in...",
  "original_text": "The stars twinkled in the night sky...",
  "char_count": 24,
  "ellipsis_applied": true
}
```

---

## 📅 DateTime Formatter

| Property | Value |
|----------|-------|
| **App ID** | `datetime-formatter` |
| **Icon** | `Calendar` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Format timestamps, add/subtract time, and convert timezones. |

### ▶️ Actions (4)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `format_date` | Format Timestamp & Timezone | Converts date format and timezones |
| 2 | `add_subtract_time` | Add / Subtract Time (Hours/Days) | Adds or subtracts hours/days from timestamp |
| 3 | `time_difference` | Calculate Time Difference | Computes duration between two timestamps |
| 4 | `current_timestamp` | Generate Current Unix/ISO Timestamp | Returns live date object at run time |

### 📋 Action Schema: Format Timestamp & Timezone

**Action ID:** `format_date`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `date_operation` | DateTime Operation | select | ✅ | `format_date` | ✅ |
| `input_date` | Input Timestamp String | text | ✅ | — | ✅ |
| `to_format` | Target Output Format | select | ✅ | `DD/MM/YYYY HH:mm` | ✅ |
| `from_timezone` | Source Timezone | select | ❌ | `UTC` | ✅ |
| `to_timezone` | Destination Timezone | select | ❌ | `Asia/Kolkata` | ✅ |

**Output Format Options:**
| Value | Example |
|-------|---------|
| `DD/MM/YYYY HH:mm` | 04/09/2026 18:30 |
| `YYYY-MM-DD` | 2026-09-04 |
| `MMMM DD, YYYY` | September 04, 2026 |
| `X` | Unix Epoch Seconds |

**Sample Output:**
```json
{
  "formatted_date": "04/09/2026 18:30",
  "timezone": "Asia/Kolkata",
  "epoch_seconds": 1725451200
}
```

### 📋 Action Schema: Add / Subtract Time

**Action ID:** `add_subtract_time`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `date_operation` | DateTime Operation | select | ✅ | `add_subtract_time` | ✅ |
| `input_date` | Base Timestamp | text | ✅ | — | ✅ |
| `operation_type` | Operation (Add / Subtract) | select | ❌ | `add` | ✅ |
| `amount` | Amount Number | number | ❌ | `1` | ✅ |
| `unit` | Time Unit | select | ❌ | `Days` | ✅ |
| `to_format` | Output Format | select | ❌ | `YYYY-MM-DD HH:mm:ss` | ✅ |

**Sample Output:**
```json
{
  "result_date": "2026-09-05 10:00:00",
  "shifted_by": "+1 Days"
}
```

### 📋 Action Schema: Calculate Time Difference

**Action ID:** `time_difference`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `date_operation` | DateTime Operation | select | ✅ | `time_difference` | ✅ |
| `start_date` | Start Timestamp | text | ✅ | — | ✅ |
| `end_date` | End Timestamp | text | ✅ | — | ✅ |
| `duration_unit` | Output Unit | select | ❌ | `Hours` | ✅ |

**Sample Output:**
```json
{
  "difference": 76,
  "unit": "Hours"
}
```

### 📋 Action Schema: Generate Current Timestamp

**Action ID:** `current_timestamp`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `date_operation` | DateTime Operation | select | ✅ | `current_timestamp` | ✅ |
| `to_format` | Format | select | ❌ | `ISO_8601` | ✅ |
| `to_timezone` | Timezone | select | ❌ | `UTC` | ✅ |

**Sample Output:**
```json
{
  "current_time": "2026-09-08T10:45:00.000Z",
  "epoch": 1725789900
}
```

---

## 🔢 Number Formatter

| Property | Value |
|----------|-------|
| **App ID** | `number-formatter` |
| **Icon** | `Calculator` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Perform math operations, currency formatting, and rounding. |

### ▶️ Actions (5)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `spreadsheet_formulas` | Spreadsheet Formulas (Excel / Google Sheets Style) | Evaluates SUM, AVERAGE, IF, ROUND, DAYS, RANDBETWEEN, etc. |
| 2 | `math_operation` | Math Formula Calculation (+, -, *, /) | Evaluates arithmetic math expressions |
| 3 | `format_currency` | Format Currency / Number ($ / ₹ / €) | Formats number to currency standard |
| 4 | `round_number` | Round Up / Round Down Precision | Rounds number to specified decimal places |
| 5 | `random_number` | Generate Random Number / OTP | Generates random integer within range |

### 📋 Action Schema: Spreadsheet Formulas

**Action ID:** `spreadsheet_formulas`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `number_operation` | Number Operation | select | ✅ | ✅ |
| `formula` | Formula | text | ✅ | ✅ |

> Supported formulas: `=SUM()`, `=AVERAGE()`, `=IF()`, `=ROUND()`, `=DAYS()`, `=RANDBETWEEN()`, etc.

**Sample Output:**
```json
{
  "result": 1250,
  "formula": "=SUM(1100, 150)",
  "status": "SUCCESS"
}
```

### 📋 Action Schema: Math Formula Calculation

**Action ID:** `math_operation`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `number_operation` | Number Operation | select | ✅ | ✅ |
| `expression` | Formula / Math Expression | text | ✅ | ✅ |

**Sample Output:**
```json
{
  "result": 1226,
  "expression": "1000 * 1.18 + 46",
  "is_valid": true
}
```

### 📋 Action Schema: Format Currency

**Action ID:** `format_currency`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `number_operation` | Number Operation | select | ✅ | `currency` | ✅ |
| `amount` | Number to Format | text | ✅ | — | ✅ |
| `currency_code` | Currency Code | select | ✅ | `USD` | ✅ |
| `currency_locale` | Currency Locale | select | ✅ | `en-US` | ✅ |
| `currency_format` | Currency Format Pattern | select | ✅ | `¤#,##0.00` | ✅ |

> Supports **38 currencies** (USD, INR, EUR, GBP, AED, JPY, etc.) and **14 locales** with comprehensive format patterns including symbol position, decimal precision, and accounting formats.

**Sample Output:**
```json
{
  "formatted_currency": "$4,000.00",
  "amount": 4000,
  "currency_code": "USD",
  "currency_locale": "en-US",
  "currency_symbol": "$",
  "raw_number": 4000,
  "status": "SUCCESS"
}
```

### 📋 Action Schema: Round Number

**Action ID:** `round_number`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `number_operation` | Number Operation | select | ✅ | `round` | ✅ |
| `input_number` | Input Number | text | ✅ | — | ✅ |
| `round_direction` | Rounding Direction | select | ❌ | `nearest` | ✅ |
| `precision` | Decimal Places Precision | number | ❌ | `2` | ✅ |

**Rounding Options:** Round to Nearest, Round Up (Ceil), Round Down (Floor)

**Sample Output:**
```json
{
  "rounded": 145.89,
  "original": 145.892
}
```

### 📋 Action Schema: Generate Random Number / OTP

**Action ID:** `random_number`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `number_operation` | Number Operation | select | ✅ | `random` | ✅ |
| `min_value` | Minimum Value | number | ❌ | `100000` | ✅ |
| `max_value` | Maximum Value | number | ❌ | `999999` | ✅ |

**Sample Output:**
```json
{
  "random_number": 481920,
  "range": "100000 - 999999"
}
```

---

## 🔌 API (Custom HTTP)

| Property | Value |
|----------|-------|
| **App ID** | `api-webhook` |
| **Icon** | `Code2` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Send custom HTTP requests to any REST API endpoint. |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `send_custom_http` | Custom API Request (GET/POST/PUT/DELETE) | Sends custom HTTP request with JSON payload |
| 2 | `custom_graphql` | Send GraphQL Query or Mutation | Dispatches GraphQL request to endpoint |

### 📋 Action Schema: Custom HTTP REST API Request

**Action ID:** `send_custom_http`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `method` | HTTP Method | select | ✅ | `POST` | ✅ |
| `endpoint_url` | API Endpoint URL | text | ✅ | — | ✅ |
| `auth_type` | Authentication Type | select | ❌ | `bearer` | ✅ |
| `auth_token` | Bearer Token / API Key | text | ❌ | — | ✅ |
| `request_body` | JSON Request Payload | textarea | ❌ | — | ✅ |

**HTTP Method Options:** GET, POST, PUT, PATCH, DELETE  
**Auth Options:** No Authentication, Bearer Token, Basic Auth, Custom API Key Header

**Sample Output:**
```json
{
  "status_code": 200,
  "status_text": "OK",
  "latency_ms": 148,
  "data": {
    "success": true,
    "id": "resp_99812",
    "message": "Order successfully synced"
  }
}
```

---

## 🔗 Webhook (Utility)

| Property | Value |
|----------|-------|
| **App ID** | `webhook` |
| **Icon** | `Webhook` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Catch incoming real-time webhook payloads from any external service. |

### ⚡ Triggers (2)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `catch_raw_webhook` | Catch Webhook (Instant) | Listens for raw JSON payload at unique endpoint URL | Instant |
| 2 | `catch_webhook_headers` | Catch Webhook with Headers | Captures full request body along with HTTP headers | Instant |

### 📋 Trigger Schema: Catch Webhook (Instant)

**Action ID:** `catch_raw_webhook`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `simple_response` | Simple Response | select | ✅ | `yes` | ❌ |
| `http_method` | Accepted HTTP Method | select | ❌ | `POST` | ❌ |

**Sample Output:**
```json
{
  "event_id": "evt_live_89124",
  "event_type": "checkout.session.completed",
  "timestamp": "2026-09-07T11:15:00Z",
  "customer_name": "Alex Johnson",
  "customer_email": "alex.johnson@example.com",
  "order_amount": 149.50,
  "currency": "USD",
  "payment_status": "PAID"
}
```

### 📋 Trigger Schema: Catch Webhook with Headers

**Action ID:** `catch_webhook_headers`

| Field ID | Label | Type | Required | Default |
|----------|-------|------|----------|---------|
| `simple_response` | Simple Response | select | ✅ | `yes` |
| `capture_headers` | Capture Request Headers | select | ❌ | `all` |

**Sample Output:**
```json
{
  "event_id": "evt_live_89124",
  "customer_name": "Alex Johnson",
  "order_amount": 149.50,
  "headers_authorization": "Bearer sec_live_tok_99182",
  "headers_user_agent": "Stripe/1.0",
  "headers_content_type": "application/json",
  "headers_x_signature": "sha256=d3b07384d113edec49eaa6238ad5ff00"
}
```

### 📋 Action Schema: Custom Webhook Response

**Action ID:** `custom_webhook_response`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `response_code` | HTTP Status Code | select | ✅ | `200` | ✅ |
| `response_content_type` | Response Content-Type | select | ❌ | `application/json` | ❌ |
| `response_body` | Custom Response Body | textarea | ❌ | — | ✅ |

**Sample Output:**
```json
{
  "status_code": 200,
  "response_delivered": true,
  "sent_at": "2026-09-07T11:15:00Z",
  "caller_ip": "54.187.205.235"
}
```

### How It Works

1. **Universal Webhook Endpoint**: Generates an isolated, secure webhook URL for receiving real-time data from any third-party app, SaaS platform, or custom backend.
2. **Simple vs. Advanced Response**: Toggle between automatically flattened dot-notation variables (Simple) and raw nested JSON structures (Advanced).
3. **HTTP Header Ingestion**: With `catch_webhook_headers`, capture auth headers, HMAC signatures, IP addresses, and user-agent metadata alongside the JSON payload.
4. **Synchronous Webhook Response**: Respond directly to the external calling service with customizable HTTP status codes (`200 OK`, `202 Accepted`, `400 Bad Request`) and dynamic JSON bodies.

---

## 💻 Code Runner (JS / Python)

| Property | Value |
|----------|-------|
| **App ID** | `code-runner` |
| **Icon** | `FileCode` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Run custom JavaScript (Node.js 20) or Python 3.11 code. |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `run_javascript` | Run JavaScript (Node.js 20) | Executes custom JavaScript code block |
| 2 | `run_python` | Run Python 3.11 Script | Executes custom Python script block |

### 📋 Action Schema: Execute JavaScript

**Action ID:** `run_javascript`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `input_variables` | Input Variables Mapping (JSON / Key-Value) | text | ❌ | ✅ |
| `code_snippet` | JavaScript Code Body | code | ✅ | ❌ |

> Variables are available via the global `inputData` object. Must end with a `return` statement.

**Default Code Template:**
```javascript
// Access mapped variables via inputData object
const baseAmount = Number(inputData.amount || 100);
const taxAmount = baseAmount * 0.18;
const grandTotal = baseAmount + taxAmount;

return {
  base: baseAmount,
  tax: taxAmount,
  total: grandTotal,
  timestamp: new Date().toISOString()
};
```

**Sample Output:**
```json
{
  "base": 100,
  "tax": 18,
  "total": 118,
  "timestamp": "2026-09-04T12:00:00.000Z",
  "execution_ms": 12
}
```

### 📋 Action Schema: Run Python 3.11 Script

**Action ID:** `run_python`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `input_variables` | Input Variables Mapping (JSON / Key-Value) | text | ❌ | ✅ |
| `code_snippet` | Python 3.11 Script Body | code | ✅ | ❌ |

> Variables are available via the `input_data` dictionary. Assign results to the global `output` variable.

**Default Code Template:**
```python
# Access mapped variables via input_data dictionary
base_amount = float(input_data.get("amount", 100))
tax_amount = round(base_amount * 0.18, 2)
grand_total = round(base_amount + tax_amount, 2)

# Return final results by defining the 'output' dictionary
output = {
    "base": base_amount,
    "tax": tax_amount,
    "total": grand_total,
    "status": "SUCCESS"
}
```

**Sample Output:**
```json
{
  "base": 100,
  "tax": 18,
  "total": 118,
  "status": "SUCCESS",
  "execution_ms": 15
}
```

---

## 📖 Lookup Table

| Property | Value |
|----------|-------|
| **App ID** | `lookup-table` |
| **Icon** | `Table2` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Map key-value pairs with fallback defaults. |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `lookup_mapping` | Lookup Key Value Pair | Finds value matching key from mapping table |
| 2 | `dynamic_dictionary` | Dynamic Dictionary Token Swap | Swaps key tokens dynamically |

### 📋 Action Schema: Lookup Key Value Matcher

**Action ID:** `lookup_mapping`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `lookup_key` | Lookup Key Variable | text | ✅ | — | ✅ |
| `table_pairs` | Mapping Dictionary | textarea | ❌ | `US=United States...` | ✅ |
| `fallback_value` | Fallback Default | text | ❌ | `Other / International` | ✅ |

> Format: One `KEY=VALUE` per line

**Sample Output:**
```json
{
  "matched_key": "IN",
  "resolved_value": "India",
  "matched": true
}
```

### 📋 Action Schema: Dynamic Dictionary Token Swap

**Action ID:** `dynamic_dictionary`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `source_text` | Source Template String | textarea | ✅ | — | ✅ |
| `dictionary_tokens` | Replacement Dictionary (KEY=VALUE per line) | textarea | ✅ | — | ✅ |
| `match_mode` | Matching Sensitivity | select | ❌ | `case_insensitive` | ✅ |
| `unmatched_strategy` | Unmatched Tokens Handling | select | ❌ | `keep` | ✅ |

**Match Mode Options:** Case-Insensitive, Exact Match Only, Whole Word Tokens Only  
**Unmatched Strategy Options:** Keep Original, Remove Unmatched, Replace with Fallback

**Sample Output:**
```json
{
  "rendered_text": "Dear Mr. Johnson, your invoice #INV-9902 for $1,250 is ready.",
  "tokens_replaced_count": 4,
  "unmatched_count": 0
}
```

---

## 👤 Human in the Loop

| Property | Value |
|----------|-------|
| **App ID** | `human-approval` |
| **Icon** | `UserCheck` |
| **Category** | Utilities |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Pauses workflow until team member approves or rejects. |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `wait_for_approval` | Request Email Approval | Pauses execution until team member approves via email/link |
| 2 | `request_user_input` | Pause Workflow for Manual Form Fill | Pauses workflow until team member inputs required data |

### 📋 Action Schema: Request Email Approval

**Action ID:** `wait_for_approval`

Pauses workflow execution and dispatches an interactive email to the designated approver with customizable decision action buttons.

| Field ID | Label | Type | Required | Default | Supports Mapping | Description |
|----------|-------|------|:--------:|:-------:|:----------------:|-------------|
| `approver_email` | Approver Email Address | text | ✅ | — | ✅ | Recipient email address for the approval request (e.g. `manager@company.com` or `{{step_1.manager_email}}`) |
| `approval_title` | Approval Request Subject | text | ✅ | — | ✅ | Email subject line with dynamic variable support (e.g. `Review Discount Request for {{step_1.name}}`) |
| `approval_notes` | Details & Context for Reviewer | textarea | ❌ | — | ✅ | Detailed message body explaining context, terms, or order specifics |
| `approve_button_label` | Approve Button Label | text | ❌ | `Approve` | ✅ | Custom text for positive approval button (e.g. `Approve`, `Accept Quote`, `Authorize ${{step_1.amount}}`) |
| `reject_button_label` | Reject Button Label | text | ❌ | `Reject` | ✅ | Custom text for negative rejection button (e.g. `Reject`, `Decline Request`, `Request Changes`) |
| `timeout_duration` | Expiration Timeout | select | ❌ | `24_hours` | ✅ | Duration after which the approval link expires |

**Timeout Options:** 1 Hour, 24 Hours, 7 Days

#### ✉️ Interactive Email Approval Preview & Testing:
- **Live Button Preview Badges**: Configuration drawer immediately shows live Emerald `✓ [Approve Label]` and Rose `✕ [Reject Label]` pills that react in real time as field values or mapped variables change.
- **Interactive Email Preview Modal**:
  - Realistic email client interface showing From, To, Subject, and formatted notes.
  - Template variable resolver that displays realistic sample values (e.g., resolving `{{step_1.amount}}` to `$1,450.00`).
  - Interactive decision buttons: clicking buttons in preview simulates decision recording (`APPROVED` or `REJECTED`) and shows workflow resumption feedback.
  - Device viewport switcher: toggle between **Desktop** and **Mobile** email rendering.
- **Send Preview Message**:
  - Available directly as a 1-click button in the canvas configuration drawer or from within the preview modal.
  - Sends a simulated live preview email with toast feedback to test deliverability and visual appearance.

#### 🏷️ Custom Parameters & Headers (Approval Decision Context):
At the bottom of the drawer, you can add **Custom Parameters & Headers** (`+ Add Parameter`) to supply vital decision context to the approver:
- **Use Case**: Managers cannot make informed decisions with just a title and email. They require structured business context:
  - `Expense Amount`: `₹{{step_1.amount}}`
  - `Department`: `{{step_1.department}}`
  - `Cost Center`: `CC-FIN-104`
  - `Vendor Name`: `{{step_1.vendor}}`
  - `Urgency SLA`: `High (4 Hours)`
- **Approver Experience**: All custom parameters automatically render in the approval email body as a formatted metadata table.
- *Detailed Architecture & Use Cases: See [Custom Parameters & Headers](./11-custom-parameters-and-headers.md).*

**Sample Output:**
```json
{
  "decision": "APPROVED",
  "approver": "manager@company.com",
  "button_clicked": "Approve",
  "approved_at": "2026-09-04T12:15:00Z"
}
```

---

### 📋 Action Schema: Pause for Manual Form Fill

**Action ID:** `request_user_input`

Pauses workflow execution and prompts an assignee to fill in structured form inputs before downstream actions run.

| Field ID | Label | Type | Required | Default | Supports Mapping | Description |
|----------|-------|------|:--------:|:-------:|:----------------:|-------------|
| `assigned_user_email` | Assigned User / Reviewer Email | text | ✅ | — | ✅ | Team member email notified to complete the form |
| `form_title` | Task / Form Title | text | ✅ | — | ✅ | Header title displayed on the manual input form interface |
| `form_instructions` | Instructions & Context for Assignee | textarea | ❌ | — | ✅ | Guidance or instructions shown to the form filler |
| `fields_to_collect` | Form Fields to Collect | text | ✅ | `Tracking Number, Carrier Name, Dispatched Date:date, Notes:textarea` | ✅ | Form field definitions configured via the visual builder or raw syntax |
| `timeout_duration` | Form Expiration Timeout | select | ❌ | `24_hours` | ✅ | Expiration duration for the form submission link |

**Timeout Options:** 1 Hour, 12 Hours, 24 Hours, 3 Days, 7 Days

#### 🛠️ Interactive Form Field Builder (`fields_to_collect`):
The node configuration drawer provides a visual, card-based field management interface:
- **Single-Line Field Cards**: Uniform drawer rows displaying `#` index badges, editable field label inputs, data type selectors, modal configuration button (`Sliders`), and delete button (`Trash2`).
- **Expandable Form Field Modal (`+ Add Blank Field`)**:
  - **Data input name**: Label of the input field.
  - **Data input type**: Select from 8 native data types.
  - **Category Choices Manager**: For single select and multi-select dropdowns, add/remove choices with `+ Add choice` and `[ × ]` tags.
  - **Is Required Checkbox**: Enforce mandatory completion before form submission.
- **Dual View Modes**:
  - **Card View** *(Default)*: Visual card list with interactive configuration.
  - **Raw Text View (`</> Raw Text`)**: Direct string editing using comma-separated syntax for bulk import/export.

#### 🎛️ Supported Field Data Types:

| Data Type | Syntax Example | Rendered Form Component | Description |
| :--- | :--- | :--- | :--- |
| **Text** *(Default)* | `Carrier Name` or `Customer Name:text` | Single-line text input | Short alphanumeric text |
| **Number** | `Item Quantity:number` or `Shipping Cost:number` | Numeric input | Number input with step controls |
| **Date** | `Dispatched Date:date` | Native date picker | Date selection calendar (`YYYY-MM-DD`) |
| **Textarea** | `Special Notes:textarea` | Multi-line text box | Long paragraphs, instructions, or notes |
| **Category - Single select** | `Priority:select[Low, Medium, High, VIP]` | Single dropdown select | User picks exactly one option |
| **Category - Multi select** | `Order Tags:multi-select[VIP, Fragile, COD]` | Multi-select dropdown tags | User selects multiple options |
| **Checkbox / Boolean** | `Passed Quality Check:boolean` | Toggle switch / checkbox | Binary `true` / `false` flag |
| **File / Photo** | `Packaging Photo:file` | File upload dropzone | Document or photo upload |

**Sample Output:**
```json
{
  "status": "COMPLETED",
  "submitted_by": "ops-manager@company.com",
  "submitted_at": "2026-09-08T10:15:00Z",
  "form_data": {
    "tracking_number": "TRK-98214-US",
    "carrier_name": "FedEx Express",
    "dispatched_date": "2026-09-08",
    "priority": "VIP",
    "order_tags": ["VIP", "Fragile"]
  }
}
```

### How It Works

```
  ┌──────────────┐
  │   WORKFLOW    │
  │   Step N      │
  └──────┬───────┘
         │
  ┌──────▼───────┐
  │   HUMAN IN   │ → Email sent with custom Approve/Reject buttons or form link
  │   THE LOOP   │
  │   (PAUSED)   │ ← Waits for human response (previewable & testable)
  └──────┬───────┘
         │
    ┌────┴────┐
    ▼         ▼
 APPROVED   REJECTED
    │         │
    ▼         ▼
  Step N+1  Stop/Alt
```

---

*← [Previous: Flow Control](./09-flow-control.md) | [Back to Index](./README.md)*
