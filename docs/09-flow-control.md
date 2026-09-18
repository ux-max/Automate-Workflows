# 09 — Flow Control Nodes

> Logic, routing, timing, and looping nodes that control workflow execution flow.

---

## ⏱️ Scheduler

| Property | Value |
|----------|-------|
| **App ID** | `scheduler` |
| **Icon** | `Clock` |
| **Category** | Flow Control |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Cron-like interval schedule (e.g., every 15 mins, daily at 9am). |

### ⚡ Triggers (1)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `cron_schedule` | Schedule Trigger (Interval / Cron) | Fires automatically based on set frequency or cron schedule | Schedule |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `delay_next_cron` | Skip or Delay Next Scheduled Run | Pauses next scheduled execution cycle |
| 2 | `pause_schedule_timer` | Pause / Resume Recurring Schedule | Toggles recurring schedule status |

### 📋 Trigger Schema: Schedule Run Frequency

**Action ID:** `cron_schedule`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `schedule_type` | Schedule Recurrence Type | select | ✅ | — | ✅ |
| `time_of_day` | Execution Time of Day | text | ❌ | — | ✅ |
| `cron_expression` | Cron Expression Syntax | text | ❌ | — | ✅ |
| `timezone` | Scheduler Timezone | select | ✅ | `Asia/Kolkata` | ✅ |

**Schedule Type Options:**
| Value | Label |
|-------|-------|
| `every_day` | Every Day (Daily Recurring) |
| `every_week` | Every Week (Specific Days) |
| `interval` | At Regular Intervals (Minutes/Hours) |
| `once` | Once at Specified Future Timestamp |
| `cron` | Custom Cron Expression |

**Sample Output:**
```json
{
  "scheduled_run_id": "sched_run_8412",
  "next_trigger_time": "2026-09-05T09:00:00+05:30",
  "timezone": "Asia/Kolkata"
}
```

---

## 🔍 Filter

| Property | Value |
|----------|-------|
| **App ID** | `filter` |
| **Icon** | `Filter` |
| **Category** | Flow Control |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Conditional rule evaluator. Stops execution if IF/THEN rules fail. |

### ▶️ Actions (3)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `apply_filter_rules` | Only Continue If... (AND/OR Logic) | Evaluates conditional AND/OR rules before proceeding |
| 2 | `filter_regex` | Filter by Regex Pattern | Matches field value against regular expression |
| 3 | `filter_date_range` | Filter by Date Range | Validates if timestamp falls within start/end dates |

### 📋 Action Schema: Conditional Rule Evaluator

**Action ID:** `apply_filter_rules`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `field` | Target Field / Variable | text | ✅ | — | ✅ |
| `operator` | Comparison Operator | select | ✅ | `equals` | ✅ |
| `value` | Comparison Value | text | ✅ | — | ✅ |

**Comparison Operator Options:**
| Value | Label |
|-------|-------|
| `equals` | Exact Match (Equals) |
| `does_not_equal` | Does Not Equal |
| `contains` | Text Contains |
| `does_not_contain` | Text Does Not Contain |
| `starts_with` | Starts With |
| `greater_than` | Greater Than (>) |
| `less_than` | Less Than (<) |
| `is_not_empty` | Is Not Empty |

**Sample Output:**
```json
{
  "condition_matched": true,
  "evaluated_field": "1000",
  "operator": "greater_than",
  "comparison_value": "500",
  "action": "CONTINUE_WORKFLOW"
}
```

### How It Works

```
          ┌──────────────┐
 Input →  │   FILTER     │
          │  condition?   │
          └──────┬───────┘
                 │
          ┌──────┴──────┐
          ▼             ▼
        TRUE          FALSE
    (continue)    (stop workflow)
```

---

## 🔀 Router

| Property | Value |
|----------|-------|
| **App ID** | `router` |
| **Icon** | `GitFork` |
| **Category** | Flow Control |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Multi-branch routing engine for parallel execution paths. |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `route_branches` | Conditional Multi-Branching (Route A/B/C) | Splits workflow into multiple conditional routes |
| 2 | `fallback_route` | Default Fallback Catch-All Branch | Executes if no previous route conditions match |

### 📋 Action Schema: Multi-Branch Router

**Action ID:** `route_branches`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `branch_name` | Branch Identifier | text | ✅ | ✅ |
| `rule_field` | Filter Variable | text | ✅ | ✅ |
| `rule_operator` | Branch Operator | select | ✅ | ✅ |
| `rule_value` | Branch Value | text | ✅ | ✅ |

**Branch Operator Options:**
| Value | Label |
|-------|-------|
| `gt` | Greater Than (>) |
| `equals` | Equals |
| `contains` | Contains |

**Sample Output:**
```json
{
  "selected_branch": "Route A",
  "branch_matched": true,
  "dispatched_sub_actions": 3
}
```

### How It Works

```
                ┌──────────────┐
    Input  →    │    ROUTER    │
                └──────┬───────┘
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Route A       Route B     Fallback
   (amount>1000)  (type=VIP)  (catch-all)
     │               │             │
     ▼               ▼             ▼
   Action A       Action B     Action C
```

---

## ⏳ Delay

| Property | Value |
|----------|-------|
| **App ID** | `delay` |
| **Icon** | `Hourglass` |
| **Category** | Flow Control |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Pauses workflow for duration or until specified date/time. |

### ▶️ Actions (3)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `delay_duration` | Delay For (Duration) | Pauses workflow execution for minutes, hours, or days |
| 2 | `delay_until` | Delay Until (Date/Time) | Pauses workflow until specific timestamp |
| 3 | `delay_queue` | Rate Limiter Delay Queue | Throttles dispatches to maximum N requests per minute |

### 📋 Action Schema: Delay For (Duration)

**Action ID:** `delay_for`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `delay_type` | Delay Mode | select | ✅ | `delay_for` | ✅ |
| `duration_value` | Delay Duration | number | ✅ | `15` | ✅ |
| `duration_unit` | Time Unit | select | ✅ | `Minutes` | ✅ |

**Delay Mode Options:**
| Value | Label |
|-------|-------|
| `delay_for` | Delay For (Fixed Duration) |
| `delay_until` | Delay Until (Specific Timestamp) |
| `rate_limiter` | Rate Limiter Queue (Throttle) |

**Time Unit Options:** Minutes, Hours, Days, Weeks

**Sample Output:**
```json
{
  "delayed_for": "15 Minutes",
  "resumed_at": "2026-09-04T12:45:01Z",
  "status": "COMPLETED"
}
```

### 📋 Action Schema: Delay Until (Timestamp)

**Action ID:** `delay_until`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `delay_type` | Delay Mode | select | ✅ | ✅ |
| `target_timestamp` | Target Date & Time | datetime | ✅ | ✅ |

**Sample Output:**
```json
{
  "delayed_until": "2026-09-10T15:00:00Z",
  "resumed_at": "2026-09-10T15:00:01Z",
  "status": "COMPLETED"
}
```

### 📋 Action Schema: Rate Limiter Queue

**Action ID:** `rate_limiter`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `delay_type` | Delay Mode | select | ✅ | `rate_limiter` | ✅ |
| `max_runs` | Max Executions Allowed | number | ❌ | `10` | ✅ |
| `time_window` | Per Time Window | select | ❌ | `Minute` | ✅ |

**Time Window Options:** Per Minute, Per Hour, Per Day

**Sample Output:**
```json
{
  "rate_limit": "10/Minute",
  "queue_status": "PASSED"
}
```

---

## 🔁 Iterator / Loop

| Property | Value |
|----------|-------|
| **App ID** | `iterator` |
| **Icon** | `Repeat` |
| **Category** | Flow Control |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Loops through array items to perform sub-actions. |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `loop_array_items` | Loop Through Line Items Array | Iterates over line items array for bulk processing |
| 2 | `aggregate_items` | Aggregate Items into Single Array | Combines individual step outputs into single summary list |

### 📋 Action Schema: Iterate Line Items Array

**Action ID:** `loop_array_items`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `array_data` | Array Source Data | textarea | ✅ | — | ✅ |
| `max_iterations` | Safety Limit (Max Iterations) | number | ❌ | `50` | ✅ |

> ⚠️ **Safety Limit**: Maximum allowed iterations is 200 to prevent runaway loops on large datasets.
>
> 💡 **Webhook Advanced Response Pairing**: When upstream webhook triggers (e.g. Shopify, Razorpay, or Webhook Catch Hook) have **Advanced Response (`No`)** selected, raw arrays such as `{{step_1.line_items}}` or `{{step_1.items}}` remain unflattened and can be mapped directly into `array_data` for automated bulk row/item processing.

**Sample Output (per iteration):**
```json
{
  "current_item": {
    "id": "p_101",
    "title": "Running Shoes",
    "price": 89.99,
    "quantity": 1
  },
  "index": 0,
  "is_first": true,
  "is_last": false,
  "total_count": 3
}
```

---

### 📋 Action Schema: Aggregate Items into Single Array

**Action ID:** `aggregate_items`

Combines individual outputs or objects produced across loop iterations into a single consolidated summary array or formatted text list.

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `source_step` | Array Source / Items Variable | textarea | ✅ | — | ✅ |
| `aggregation_format` | Aggregation Output Format | select | ✅ | `comma_separated` | ❌ |
| `fields_to_aggregate` | Target Field Keys (Optional) | text | ❌ | — | ✅ |
| `filter_empty` | Filter Null / Empty Values | select | ❌ | `yes` | ❌ |

#### Output Format Options (`aggregation_format`):
- `comma_separated`: Comma-Separated Values (CSV) — e.g. `Running Shoes, Training Shorts, Sports Water Bottle`
- `new_line`: Line-by-Line Plain Text (`\n`) — ideal for WhatsApp, Telegram, or SMS messaging
- `bullet_list`: HTML / Markdown Bullet List (`• `) — ideal for email bodies or Slack notifications
- `json_array`: Standard JSON Array (`[{...}, {...}]`) — ready for downstream bulk API payloads or Google Sheets batch insert

**Sample Output:**
```json
{
  "aggregated_count": 3,
  "aggregated_text": "• Running Shoes ($89.99)\n• Training Shorts ($35.00)\n• Sports Water Bottle ($15.50)",
  "aggregated_array": [
    { "id": "p_101", "title": "Running Shoes", "price": 89.99 },
    { "id": "p_102", "title": "Training Shorts", "price": 35.00 },
    { "id": "p_103", "title": "Sports Water Bottle", "price": 15.50 }
  ],
  "execution_status": "SUCCESS"
}
```

---

### 🔄 How Iterator (Loop) & Aggregator Work Together

```
  ┌─────────────────────────────────┐
  │      TRIGGER: New Order         │  e.g. Shopify Order Paid
  │  line_items: [Item1, Item2, 3]  │  (Raw Array from Webhook)
  └────────────────┬────────────────┘
                   │
  ┌────────────────▼────────────────┐
  │    ITERATOR (loop_array_items)  │  Splits array into individual items
  └────────────────┬────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     │
    Item 1                  (loop)
        │                     │
    Action: Inventory Check   │
        │                     │
    Item 2                  (loop)
        │                     │
    Action: Inventory Check   │
        │                     │
    Item 3                  (done)
        │                     │
    Action: Inventory Check   │
        │
  ┌─────▼───────────────────────────┐
  │   AGGREGATOR (aggregate_items)  │  Combines all outputs back together
  └────────────────┬────────────────┘
                   │
                   ▼ Consolidated text or array
  ┌─────────────────────────────────┐
  │   DISPATCH: Single Summary Msg  │  Slack / Email / Google Sheets Batch
  │   "All 3 items processed: ..."  │  Sent once after loop finishes!
  └─────────────────────────────────┘
```

---

*← [Previous: Generic Connectors](./08-generic-connectors.md) | [Back to Index](./README.md) | [Next: Utilities →](./10-utilities.md)*

