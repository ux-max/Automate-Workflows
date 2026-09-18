# 03 — Triggers: Webhooks & Polling Engine

A **Trigger** is an event listener that initiates a workflow. Whenever a specified event occurs in a third-party application (e.g., a new lead is captured, an invoice is paid, or a user signs up), the Trigger receives the event data and starts downstream workflow action steps.

---

## 1. Trigger Types Overview

Automate Workflows supports **three Trigger architectures**:

| Trigger Architecture | Category Key | Speed | Recommended For |
| :--- | :--- | :--- | :--- |
| **Webhooks Setup by Instructions** | `webhook_instructions` | Real-time (Instant) | Apps with manual webhook UI in their admin settings (e.g. Stripe, GitHub, Shopify, Typeform). |
| **Webhooks Setup by API Request** | `webhook_api` | Real-time (Instant) | Apps supporting programmatic subscription via REST Hooks (e.g. Mailchimp, Asana, Zoom). |
| **Polling to Check New Data** | `polling` | 5–15 Minute Interval | Legacy APIs lacking native webhook support. |

---

## 2. Trigger Configuration Drawer Fields

Clicking **Add Trigger** or editing an existing trigger opens the right-hand **Trigger Builder Drawer**:

### 1. General Identification Fields

- **Trigger Display Name** (`name`):
  - *Example*: `New Customer Created`, `Form Submission Received`.
  - *Purpose*: The user-facing title shown in the workflow editor's trigger selection menu.
- **Trigger Key** (`key`):
  - *Example*: `new_customer_created`.
  - *Purpose*: The machine identifier. It is auto-generated from the name in lower snake_case. Variables produced by this step will be referenced in workflows as `{{step.new_customer_created.field}}`.
- **Trigger Description** (`description`):
  - *Example*: `Triggers automatically whenever a new customer account is registered in your system.`
  - *Purpose*: Subtitle displayed to users to clarify when this trigger executes.
- **Trigger Type Select**:
  - Dropdown selecting between:
    1. `Webhooks Setup by Instructions (Highly Recommended)`
    2. `Webhooks Setup by API Request (Recommended)`
    3. `Polling to Check New Data (Not Recommended)`

---

## 3. Deep Dive: Mode 1 — Webhooks Setup by Instructions (Instant Catch)

### Architecture
In this mode, Automate Workflows provides a dedicated, high-availability webhook listener endpoint. The end-user copies this URL and pastes it into the 3rd-party application's webhook settings dashboard.

```
┌─────────────────────────┐         HTTP POST JSON         ┌─────────────────────────┐
│   3rd Party Application  │ ────────────────────────────>  │ Automate Workflows Hook │
│  (e.g., Stripe, Shopify) │    Real-time Event Payload    │   /api/hooks/catch/...  │
└─────────────────────────┘                                └─────────────────────────┘
```

### Configuration & Live Testing Tools
1. **Webhook Listener URL**:
   - System-generated URL formatted as:
     `https://automate-workflows.com/api/hooks/catch/app_slug/trg_id`
   - Equipped with an instant **Copy URL** button.
2. **Live Webhook Capture Listener**:
   - Click **Capture Webhook Response**: The listener enters an active polling state (`Waiting for Webhook Response...`).
   - The developer or user triggers a test event in the third-party app (or clicks **Send Test Ping Now** or sends a cURL request in Postman to the copied URL).
   - Once received, the platform displays a green success banner:
     `✓ Sample Webhook Captured! Output fields updated below.`
   - The payload keys (e.g. `event_type`, `record_id`, `email`, `status`, `deal_value`) are **automatically parsed** and populated into the **Trigger Output Variables Table**.

---

## 4. Deep Dive: Mode 2 — Webhooks Setup by API Request (REST Hooks)

### Architecture
When an end-user turns on a workflow, Automate Workflows automatically calls the 3rd-party service's API to register the webhook. When the workflow is paused or deleted, Automate Workflows automatically calls the unregister endpoint.

### Configuration Fields
- **HTTP Method**:
  - `POST` (Standard), `GET`, `PUT`, `DELETE`, `PATCH`.
- **API Endpoint URL**:
  - *Example*: `https://api.yourdomain.com/v1/webhooks` or `https://api.service.com/v2/subscriptions`.
  - The endpoint where subscription payloads are sent.
- **Payload Schema Under the Hood**:
  - Automate Workflows sends the target webhook URL and event name:
    ```json
    {
      "target_url": "https://automate-workflows.com/api/hooks/catch/...",
      "event": "contact.created"
    }
    ```
- **Send Test Request Action**:
  - Live test runner button inside the drawer.
  - Sends a test subscription to verify that the third-party endpoint responds with `200 OK` or `201 Created`.
  - Automatically parses the JSON response and maps the returned keys into output variables.

---

## 5. Deep Dive: Mode 3 — Polling to Check New Data

### Architecture
If a third-party service has no webhook infrastructure, the platform uses an automated cron worker to poll the API for new records at scheduled intervals.

### Configuration Fields
- **Polling Query URL**:
  - *Example*: `https://api.acme.com/v1/records?sort=created_at&order=desc`.
  - Must return an array of objects or an object containing a list.
- **Polling Frequency**:
  - `Every 5 minutes (Recommended)`
  - `Every 10 minutes`
  - `Every 15 minutes`
- **Deduplication Field Key**:
  - *Example*: `id`, `uuid`, or `updated_at`.
  - *Critical Purpose*: The engine remembers the deduplication keys of previously processed records. Only records with newly observed IDs will trigger workflow executions, preventing infinite loops or duplicate tasks.
- **Send Test Request Action**:
  - Calls the polling endpoint, previews the latest array item, and creates output variables from its properties.

---

## 6. Trigger Output Variables Table

Every trigger maintains a schema of output variables that downstream workflow steps can consume:

| Column | Description | Example |
| :--- | :--- | :--- |
| **Field Key** | Machine key used in mustache interpolation | `customer_email`, `total_amount` |
| **Display Label** | Friendly label in visual variable dropdowns | `Customer Email`, `Order Total ($)` |
| **Data Type** | Type descriptor | `string`, `number`, `boolean`, `date` |
| **Sample Value** | Fallback value shown during workflow construction | `alex.hunter@company.com`, `1850.00` |

### How Variables Are Used in Workflows
When a workflow user configures subsequent actions, clicking on any field displays an interactive token pill picker containing all output variables:
```
{{step.new_customer_created.customer_email}}
{{step.new_customer_created.deal_value}}
```
No manual JSON extraction or coding is required.
