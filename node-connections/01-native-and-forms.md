# 01 — Native Suite & Form Builders Integration Guide

> Detailed guide covering authentication, raw platform JSON ingestion, variable flattening, and field mapping for **Automate Chats**, **Automate Forms**, **Google Forms**, and **Typeform**.

---

## 1. 💬 Automate Chats (WhatsApp Business Platform)

### Authentication Architecture
- **Auth Type:** `API Key` / `System User Token`
- **Header Injection:**
  ```http
  Authorization: Bearer EAAJx791...
  Content-Type: application/json
  ```
- **Connection Storage:** Securely holds Cloud API Account ID, Business Account ID, and Phone Number ID in the user connection manager (`UserConnection`).

### Raw Platform JSON Ingested (Webhook POST):
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "10492194820194",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550192",
              "phone_number_id": "10982149182"
            },
            "contacts": [
              {
                "profile": { "name": "Rahul Sharma" },
                "wa_id": "919876543210"
              }
            ],
            "messages": [
              {
                "from": "919876543210",
                "id": "wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSRDk4MkE3RjA5QkI1QjA0MzAA",
                "timestamp": "1788269112",
                "text": { "body": "Hi, I am interested in Enterprise workflow automation plans." },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### How It Populates In Automate Workflows:
The Ingestion Engine extracts and flattens the deep Meta JSON tree into intuitive variables:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.sender_phone}}` | Sender Phone Number | `string` | `"+91 98765 43210"` |
| `{{step_1.sender_name}}` | Sender Profile Name | `string` | `"Rahul Sharma"` |
| `{{step_1.message_body}}` | Incoming Message Text | `string` | `"Hi, I am interested in Enterprise workflow automation plans."` |
| `{{step_1.message_id}}` | WhatsApp Message ID | `string` | `"wamid.HBgLOTE5ODc2..."` |
| `{{step_1.timestamp}}` | Epoch Timestamp | `number` | `1788269112` |

---

## 2. 📋 Automate Forms (Native Lead Generation Forms)

### Authentication Architecture
- **Auth Type:** `API Key` (Zero-config native protocol)
- **Security:** In-platform signature verification with origin check.

### Raw Platform JSON Ingested (Webhook POST):
```json
{
  "event": "form_submission",
  "form_id": "form_lead_gen_2026",
  "submission_id": "sub_9841203",
  "submitted_at": "2026-09-08T10:15:00.000Z",
  "answers": {
    "full_name": "Anita Roy",
    "business_email": "anita@royenterprises.com",
    "phone": "+919812345678",
    "company_size": "50-200",
    "annual_budget": 25000,
    "requirements": "Need CRM sync and custom webhook dispatches."
  },
  "metadata": {
    "ip_address": "103.21.244.2",
    "source_url": "https://automate.app/landing/forms"
  }
}
```

### How It Populates In Automate Workflows:
Every question ID in `answers` is unpacked into a first-class variable token:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.submission_id}}` | Submission ID | `string` | `"sub_9841203"` |
| `{{step_1.full_name}}` | Full Name | `string` | `"Anita Roy"` |
| `{{step_1.business_email}}` | Business Email | `string` | `"anita@royenterprises.com"` |
| `{{step_1.phone}}` | Phone Number | `string` | `"+919812345678"` |
| `{{step_1.company_size}}` | Company Size | `string` | `"50-200"` |
| `{{step_1.annual_budget}}` | Annual Budget | `number` | `25000` |
| `{{step_1.requirements}}` | Requirements Notes | `string` | `"Need CRM sync and custom..."` |

---

## 3. 📝 Google Forms

### Authentication Architecture
- **Auth Type:** `None` (Zero Authentication Required — Automate Workflows-Style Webhook URL)
- **Role:** **Trigger-Only Node** (Actions are intentionally disallowed, exactly matching Automate Workflows)
- **Sync Mechanism:** Instant HTTP POST Webhook listener `https://connect.automateworkflows.com/webhook-listener/webhook/wh_{stepId}_google-forms`
- **Setup Flow:**
  1. Copy the unique Webhook Capture URL from the workflow trigger setup drawer.
  2. In your Google Form, open **Script editor** (or open the linked Google Sheet > **Extensions > Apps Script**).
  3. Paste the trigger script pointing to the Webhook Capture URL with event `On form submit` (or install the free Automate Workflows Webhook Add-on).
  4. Submit a live form response. The webhook listener captures and parses the answers in milliseconds.

> [!NOTE]
> **Why Google Forms Has No Actions (Automate Workflows Parity):**
> 1. **Intake Interface, Not a Database:** Google Forms is an inbound questionnaire UI designed for humans. Machine workflows do not fill out survey questionnaires.
> 2. **No Public Response Submission API:** Google’s official Forms API explicitly does not provide a public endpoint for external programmatic response submission (to prevent bot spam and reCAPTCHA bypass).
> 3. **Google Sheets is the Actual Action:** Every Google Form can store its responses in a linked Google Sheet. If a workflow needs to record data, use **Google Sheets (`Add New Row`)**, which writes to the exact same sheet cleanly, rapidly, and without API hurdles.

### Raw Platform JSON Ingested (Webhook Inbound POST):
```json
{
  "form_id": "1FAIpQLSc9B1xY-G8L1vBwExampleFormId",
  "form_title": "Customer Intake & Project Inquiry",
  "response_id": "resp_gform_892140",
  "respondent_email": "sarah.connor@example.com",
  "timestamp": "2026-09-10T12:30:00Z",
  "full_name": "Sarah Connor",
  "phone_number": "+1 555-0192",
  "company_name": "Cyberdyne Systems",
  "service_requested": "Enterprise Workflow Automation",
  "budget_range": "$10,000 - $25,000",
  "project_details": "Looking to automate CRM lead capture directly from Google Forms into Slack and HubSpot.",
  "submission_date": "2026-09-10"
}
```

### How It Populates In Automate Workflows:
The webhook capture engine immediately parses the form payload and exposes each field as a typed variable token:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.form_id}}` | Form ID | `string` | `"1FAIpQLSc9B1xY-G8..."` |
| `{{step_1.form_title}}` | Form Title | `string` | `"Customer Intake & Project Inquiry"` |
| `{{step_1.response_id}}` | Response ID | `string` | `"resp_gform_892140"` |
| `{{step_1.respondent_email}}` | Respondent Email | `string` | `"sarah.connor@example.com"` |
| `{{step_1.full_name}}` | Full Name | `string` | `"Sarah Connor"` |
| `{{step_1.phone_number}}` | Phone Number | `string` | `"+1 555-0192"` |
| `{{step_1.company_name}}` | Company Name | `string` | `"Cyberdyne Systems"` |
| `{{step_1.service_requested}}` | Service Requested | `string` | `"Enterprise Workflow Automation"` |
| `{{step_1.budget_range}}` | Budget Range | `string` | `"$10,000 - $25,000"` |
| `{{step_1.project_details}}` | Project Details | `string` | `"Looking to automate CRM lead..."` |
| `{{step_1.timestamp}}` | Submission Timestamp | `string` | `"2026-09-10T12:30:00Z"` |

---

## 4. ⚡ Typeform

### Authentication Architecture
- **Auth Type:** `OAuth 2.0 Handshake` (Pure OAuth 2.0 Flow for both Trigger and Action, exactly matching Automate Workflows)
- **Required Permission Scopes:**
  - `forms:read` — View workspace forms and retrieve question schemas
  - `webhooks:write` — Automatically register and activate webhook endpoints
  - `responses:read` — Read form submissions and respondent answers
- **Why OAuth 2.0 for Both Trigger and Action (Automate Workflows Parity):**
  1. **Automated Webhook Provisioning (Triggers):** When adding Typeform as a Trigger, the platform does **not** ask you to copy/paste raw Webhook URLs. Instead, you connect via OAuth 2.0 and select your form directly from a dropdown (`Select Form: [ Client Onboarding Survey ▼ ]`). Our engine automatically calls Typeform's API:
     ```http
     PUT https://api.typeform.com/forms/{form_id}/webhooks/automate_wf
     Authorization: Bearer <oauth_access_token>
     { "url": "https://connect.automateworkflows.com/webhook-listener/...", "enabled": true }
     ```
     The webhook is created and activated silently via API in milliseconds.
  2. **Outbound API Authorization (Actions):** The exact same OAuth 2.0 connection authorizes Typeform actions (e.g. `create_typeform_entry`, `get_typeform_report`, `create_typeform_via_api`).

### Raw Platform JSON Ingested (OAuth Webhook Dispatch):
```json
{
  "event_id": "01J7...",
  "event_type": "form_response",
  "form_response": {
    "form_id": "ty_f891",
    "token": "a4d8c...",
    "submitted_at": "2026-09-08T11:20:00Z",
    "definition": {
      "id": "ty_f891",
      "title": "Client Onboarding Survey",
      "fields": [
        { "id": "f_email", "ref": "client_email", "title": "What is your corporate email?" },
        { "id": "f_budget", "ref": "budget_tier", "title": "Project Budget" }
      ]
    },
    "answers": [
      {
        "field": { "id": "f_email", "type": "email" },
        "type": "email",
        "email": "marcus.vance@fintech.io"
      },
      {
        "field": { "id": "f_budget", "type": "choice" },
        "type": "choice",
        "choice": { "label": "$50,000 - $100,000" }
      }
    ]
  }
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.client_email}}` | Corporate Email | `string` | `"marcus.vance@fintech.io"` |
| `{{step_1.budget_tier}}` | Project Budget | `string` | `"$50,000 - $100,000"` |
| `{{step_1.form_id}}` | Form ID | `string` | `"ty_f891"` |
| `{{step_1.submitted_at}}` | Submitted At | `string` | `"2026-09-08T11:20:00Z"` |

---

*← [Back to Master Index](./README.md) | [Next: CRM & Commerce →](./02-crm-and-commerce.md)*
