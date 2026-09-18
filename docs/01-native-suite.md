# 01 — Native Suite Nodes

> Native apps built into the Automate Workflows platform. For actions, they authenticate via **API Key / Token** (from Settings > API & Webhooks, just like Automate Workflows Chatflow / Automate Workflows Forms in Automate Workflows). Triggers use instant Webhook URLs.

---

## 📱 Automate Chats

| Property | Value |
|----------|-------|
| **App ID** | `automate-chats` |
| **Icon** | `MessageSquare` |
| **Category** | Native Suite |
| **Auth Type** | API Key / Token |
| **Sync Mode** | Webhook URL (Automate Workflows-Style) |
| **Notes** | Automate Workflows Chatflow-style Webhook trigger URL. API Token for WhatsApp actions (Settings > API & Webhooks). |

### 🔗 How to Setup Webhook in Automate Chats (Automate Workflows Chatflow-Style)
1. Add **Automate Chats** as Step 1 (Trigger) and select target event (e.g. `New WhatsApp Message Received`).
2. Copy the unique **Webhook Capture URL** from the setup panel.
3. In Automate Chats dashboard, navigate to **Settings > API & Webhooks > + Add Webhook**.
4. Paste the Webhook URL into the endpoint field, select your event, and toggle status to **Active**.
5. **Simple Response (Auto-Flattening)**:
   - **Simple (`Yes` — Default)**: Automatically flattens incoming messages into accessible tokens like `{{step_1.sender_phone}}`, `{{step_1.message_text}}`, `{{step_1.sender_name}}`.
   - **Advanced (`No`)**: Retains raw nested WhatsApp Cloud API JSON structure.
6. Click **Simulate Test Event** in Automate Workflows to capture sample payload and map downstream variables immediately!


### ⚡ Triggers (4)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_wa_msg` | New WhatsApp Message Received | Fires when a customer sends a message to WhatsApp Business number | Instant |
| 2 | `wa_msg_status` | Message Status Changed | Fires when sent/delivered/read/failed status updates | Instant |
| 3 | `new_opt_in` | Customer Opted-In | Fires when customer scans QR code or opts into WhatsApp dispatches | Instant |
| 4 | `button_clicked` | Template CTA Button Clicked | Fires when user taps interactive button inside WhatsApp message | Instant |

### ▶️ Actions (5)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `send_wa_template` | Send WhatsApp Template Message | Sends an approved template message with custom params |
| 2 | `send_wa_session` | Send WhatsApp Session Message | Sends a direct text/media message within 24h window |
| 3 | `send_interactive_list` | Send Interactive Radio List | Sends selectable radio button menu to customer |
| 4 | `add_contact_tag` | Add / Update Contact Tag | Assigns tags to customer profile for segmentation |
| 5 | `update_chat_status` | Assign / Close Support Chat | Assigns conversation thread to support agent or resolves ticket |

### 📋 Action Schema: Send WhatsApp Template Message

**Action ID:** `send_wa_template`

| Field ID | Label | Type | Required | Placeholder | Helper Text | Supports Mapping |
|----------|-------|------|----------|-------------|-------------|:----------------:|
| `recipient_phone` | Recipient Phone (+ Country Code) | text | ✅ | `+91 9876543210 or {{step_1.phone}}` | Include country code with no spaces or symbols | ✅ |
| `template_name` | Approved Template Name | select | ✅ | — | — | ✅ |
| `param_1` | Template Variable {{1}} | text | ❌ | `e.g. {{step_1.name}}` | Substituted into the first placeholder of the template body | ✅ |
| `param_2` | Template Variable {{2}} | text | ❌ | `e.g. {{step_1.order_id}}` | — | ✅ |
| `header_media_url` | Header Image / PDF URL | text | ❌ | `https://assets.store.com/banner.jpg` | Optional media header for template | ✅ |

**Template Name Options:**
| Value | Label |
|-------|-------|
| `order_confirmation_v2` | order_confirmation_v2 (Order Placed) |
| `lead_welcome_gift` | lead_welcome_gift (Welcome Discount) |
| `appointment_reminder` | appointment_reminder (Meeting Sync) |

**Sample Output:**
```json
{
  "message_id": "wamid.HBgLMTU1NTAxOTIA...",
  "recipient": "+91 9876543210",
  "status": "queued"
}
```

### How It Works

1. **API Token Authentication (Automate Workflows Chatflow-Style)**: For actions, connect your Automate Chats account using an API Token from Settings > API & Webhooks. Multiple phone numbers and accounts can be connected as independent connections (e.g. Automate Chats #1, Automate Chats #2).
2. **Instant Webhook Triggers**: Customer inbound messages, read receipts, template button clicks, and opt-ins trigger workflows instantly via unique Webhook Capture URLs pasted into Automate Chats settings.
3. **Downstream Variable Mapping**: Inbound phone numbers, message text, and button click IDs are instantly available as variable tokens (e.g. `{{step_1.recipient_phone}}`, `{{step_1.message_text}}`).
4. **Interactive Messaging**: Send approved WhatsApp business templates with custom parameters, initiate 24-hour session chats, or dispatch interactive list menus.

---

## 📝 Automate Forms

| Property | Value |
|----------|-------|
| **App ID** | `automate-forms` |
| **Icon** | `FileText` |
| **Category** | Native Suite |
| **Auth Type** | API Key / Token |
| **Sync Mode** | Webhook URL (Automate Workflows-Style) |
| **Notes** | Automate Workflows Form-style Webhook trigger URL. API Token for form lifecycle actions (Settings > API & Webhooks). |

### 🔗 How to Setup Webhook in Automate Forms (Automate Workflows-Style)
1. Add **Automate Forms** as Step 1 (Trigger) and select target event (e.g. `New Form Submission`).
2. Copy the unique **Webhook Capture URL** from the setup panel.
3. In Automate Forms builder, open your target form and go to **Settings > Integrations & Webhooks > + Add Webhook**.
4. Paste the Webhook URL into the endpoint field, choose event `Form Submission Completed`, and click Save.
5. In Automate Workflows, click **Simulate Test Event** to preview flattened questions and responses.


### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_form_sub` | New Form Submission | Fires when a user submits any form in Automate Forms | Instant |
| 2 | `form_field_updated` | Partial Field Updated | Fires on multi-step form progress | Instant |
| 3 | `form_abandoned` | Form Abandonment (Lead Saved) | Fires when user starts filling form but leaves before final submit | Instant |

### ▶️ Actions (2)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `create_form_link` | Generate Prefilled Form Link | Generates unique prefilled URL for customer dispatches |
| 2 | `disable_form` | Pause / Close Form Submissions | Toggles form status to inactive when quota is reached |

### 📋 Action Schema: Generate Prefilled Form Link

**Action ID:** `create_form_link`

| Field ID | Label | Type | Required | Default | Helper Text | Supports Mapping |
|----------|-------|------|----------|---------|-------------|:----------------:|
| `form_id` | Select Automate Form | select | ✅ | `form_lead_capture` | — | ✅ |
| `prefill_answers` | Prefilled Answers (Key=Value per line) | textarea | ❌ | — | Pre-populates fields so the recipient doesn't have to retype existing data | ✅ |
| `link_expiry_days` | Link Validity Duration | select | ❌ | `7_days` | — | ✅ |
| `single_use` | Single-Use Link (Invalidate after submission) | boolean | ❌ | `true` | Ensures the link cannot be submitted more than once | ❌ |

**Form Options:**
| Value | Label |
|-------|-------|
| `form_lead_capture` | VIP Lead Intake Form (Organization Default) |
| `form_customer_feedback` | Post-Purchase Customer CSAT Survey |
| `form_support_onboarding` | Client Enterprise Onboarding Questionnaire |
| `form_event_registration` | Webinar & Product Demo Registration |

**Sample Output:**
```json
{
  "form_id": "form_lead_capture",
  "prefilled_url": "https://forms.automate.io/f/vip-lead?token=sec_98124&email=client@co.com",
  "expires_at": "2026-09-15T12:00:00Z",
  "status": "GENERATED"
}
```

### 📋 Action Schema: Pause / Close Form Submissions

**Action ID:** `disable_form`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `form_id` | Select Automate Form | select | ✅ | `form_lead_capture` | ✅ |
| `close_reason` | Closure Message Displayed to Visitors | textarea | ❌ | "Thank you for your interest!..." | ✅ |
| `redirect_url` | Redirect URL (Optional) | text | ❌ | — | ✅ |

**Sample Output:**
```json
{
  "form_id": "form_lead_capture",
  "status": "CLOSED",
  "closed_at": "2026-09-08T10:15:00Z"
}
```

### How It Works

1. **API Token Authentication (Automate Workflows Form-Style)**: For form actions (prefilled link generation, disabling forms), connect via API Token from Settings > API & Webhooks. Multiple organizations or sub-accounts can be connected as independent connections (e.g. Automate Forms #1, Automate Forms #2).
2. **Instant Webhook Triggers**: Inbound form submissions and abandonment events fire immediately via Webhook Capture URLs configured in the form's Integrations & Webhooks settings.
3. **Dynamic Response Tokens**: Submitted answers, respondent email, IP, and submission timestamps are auto-mapped as variable tokens for CRM and notification steps.
4. **Prefill Generation & Lifecycle Control**: Workflows can generate customized single-use prefilled links for respondents or automatically close intake when a target cap is reached.

---

*← [Back to Index](./README.md) | [Next: Lead Capture & Forms →](./02-lead-capture-forms.md)*
