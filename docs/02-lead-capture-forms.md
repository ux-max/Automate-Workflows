# 02 — Lead Capture & Forms Nodes

> External form builder integrations for capturing leads and collecting responses.

---

## ✅ Google Forms

| Property | Value |
|----------|-------|
| **App ID** | `google-forms` |
| **Icon** | `CheckSquare` |
| **Category** | Lead Capture & Forms |
| **Auth Type** | None (Zero-Auth Webhook Capture URL) |
| **Sync Mode** | Webhook URL (Automate Workflows-Style Instant) |
| **Notes** | Instant Webhook trigger URL. Zero authentication required. Trigger-Only app (write to Google Sheets for actions). |

### ⚡ Triggers (2)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_gform_response` | New Form Response Submitted | Fires instantly when a response is submitted via Webhook URL | Instant |
| 2 | `response_updated` | Existing Response Edited | Fires instantly when respondent modifies submitted answer via Webhook | Instant |

### ▶️ Actions (0)

> [!NOTE]
> **Trigger-Only Node (Why Actions Are Disallowed):**
> In alignment with Automate Workflows, Zapier, and Google API architecture:
> 1. **Google Forms is an intake survey tool**, not a data destination.
> 2. **No Public Programmatic Submit API:** Google does not provide an external automated response submission endpoint (to prevent captcha bypass and spam).
> 3. **Google Sheets is the Actual Action:** Every Google Form can log responses to a linked Google Sheet. To record data in your workflow, use **Google Sheets (`Add New Row`)**, which achieves the exact same result faster and without form UI constraints.

### 🔗 How to Setup Webhook in Google Forms (Automate Workflows-Style)

1. Add **Google Forms** as Step 1 (Trigger) in Automate Workflows.
2. Select your trigger event (e.g. `New Form Response Submitted`).
3. Copy the unique **Webhook Capture URL** from the setup drawer:
   ```text
   https://connect.automateworkflows.com/webhook-listener/webhook/wh_{stepId}_google-forms
   ```
4. In your Google Form, open **Script editor** (⋮ menu > Script editor, or open the linked Google Sheet > Extensions > Apps Script).
5. Paste the webhook forwarder script pointing to this Webhook URL, set trigger to `On form submit`, and save.
6. Submit a test form response, or click **"Simulate Test Event"** in the drawer to capture variable tokens immediately.

### 🔄 Simple Response (Auto-Flattening)
- **Simple (Yes - Recommended)**: Flatten question answers directly into clean variable tokens like `{{step_1.full_name}}`, `{{step_1.respondent_email}}`, `{{step_1.service_requested}}`, and `{{step_1.budget_range}}`.
- **Advanced (No)**: Keeps raw nested JSON payload.

**Sample Inbound Payload:**
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

---

## ❓ Typeform

| Property | Value |
|----------|-------|
| **App ID** | `typeform` |
| **Icon** | `HelpCircle` |
| **Category** | Lead Capture & Forms |
| **Auth Type** | OAuth 2.0 Handshake |
| **Sync Mode** | Instant (OAuth 2.0 Automated Webhook Registration) |
| **Notes** | Pure OAuth 2.0 handshake for automated webhook registration in Triggers and CRM actions (Automate Workflows parity). |

### 🔐 1-Click OAuth 2.0 Setup (Automate Workflows-Style Automated Webhook)

1. In Step 1 (Trigger), select event (e.g. `New Response Submitted`).
2. Click **"Connect Typeform Account"** > **"Authorize & Connect with Typeform"** to grant permission scopes:
   - `forms:read` — View workspace forms and question definitions
   - `webhooks:write` — Automatically register and activate webhook endpoints
   - `responses:read` — Retrieve form submissions and answers
3. Select your target form directly from the dropdown:
   ```text
   Form *: [ Client Onboarding & Project Scope Survey (tf_lead_gen) ▼ ]
   ```
4. Configure **Simple Response** (`Yes` to automatically flatten answers into clean tokens like `{{step_1.client_name}}`, `{{step_1.client_email}}`, `{{step_1.budget_tier}}`).
5. Click **"Save & Send Test Request"**. The platform automatically registers the webhook via Typeform REST API (`PUT /forms/{form_id}/webhooks/automate_wf`) and captures test fields immediately. Zero manual URL copy-pasting required!


### ⚡ Triggers (2)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_typeform_sub` | New Response Submitted | Fires in real-time when Typeform submission is completed | Instant |
| 2 | `partial_typeform_sub` | Partial Response Saved | Fires on intermediate page progress | Instant |

### ▶️ Actions (4)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `create_typeform_entry` | Pre-fill Typeform Submission | Generates custom prefilled URL |
| 2 | `get_typeform_report` | Fetch Form Analytics Report | Fetches completion rate & drop-off metrics |
| 3 | `create_typeform_via_api` | Create Form Shell via API | Generates new Typeform definition via API |
| 4 | `delete_typeform_response` | Delete Response Data Record | Purges specific submission for GDPR compliance |

### 📋 Action Schema: Pre-fill Typeform Submission

**Action ID:** `create_typeform_entry`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `form_id` | Typeform Form Shell | select | ✅ | ✅ |
| `prefill_name` | Prefill: Full Name | text | ❌ | ✅ |
| `prefill_email` | Prefill: Email Address | text | ❌ | ✅ |

**Form Options:**
| Value | Label |
|-------|-------|
| `tf_lead_gen` | Customer Onboarding Survey (v2) |
| `tf_feedback` | Post-Purchase NPS Rating |
| `tf_support` | Technical Diagnostic Form |

**Sample Output:**
```json
{
  "prefilled_url": "https://form.typeform.com/to/tf_lead_gen#name=Alex&email=alex@co.com",
  "status": "ready"
}
```

---

*← [Previous: Native Suite](./01-native-suite.md) | [Back to Index](./README.md) | [Next: CRM & Sales →](./03-crm-sales.md)*
