# 04 — Communication & Notifications Nodes

> Messaging and email notification integrations for team alerts and customer outreach.

---

## #️⃣ Slack

| Property | Value |
|----------|-------|
| **App ID** | `slack` |
| **Icon** | `Hash` |
| **Category** | Communication / Notifications |
| **Auth Type** | OAuth 2.0 |
| **Sync Mode** | Instant |
| **Notes** | Actions call Slack Web API directly with block formatting support. |

### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_channel_msg` | New Message Posted to Channel | Fires when new message arrives in public/private channel | Instant |
| 2 | `new_reaction` | New Reaction Added (Emoji) | Fires when user adds target reaction emoji to message | Instant |
| 3 | `new_file_uploaded` | New File Uploaded to Workspace | Fires when document/media is posted in Slack | Instant |

### ▶️ Actions (6)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `send_channel_msg` | Send Channel Message | Posts message to selected Slack channel |
| 2 | `send_dm` | Send Direct Message | Sends DM to specific user |
| 3 | `post_block_msg` | Post Formatted Block Layout | Posts rich JSON block layout message with buttons |
| 4 | `upload_file` | Upload File / Document | Attaches file directly to channel thread |
| 5 | `set_topic` | Update Channel Topic or Canvas | Modifies topic string for team channel |
| 6 | `create_channel` | Create Public/Private Channel | Creates new Slack channel for project or deal |

### 📋 Action Schema: Send Channel Message

**Action ID:** `send_channel_msg`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `channel_id` | Channel Name | select | ✅ | ✅ |
| `message_text` | Message Content | textarea | ✅ | ✅ |
| `bot_name` | Custom Bot Name | text | ❌ | ✅ |
| `icon_emoji` | Bot Avatar Emoji | text | ❌ | ✅ |

**Channel Options:**
| Value | Label |
|-------|-------|
| `general` | # general |
| `leads-feed` | # leads-feed (Real-time) |
| `orders-alerts` | # orders-alerts |
| `dev-ops` | # dev-ops-alerts |

**Sample Output:**
```json
{
  "ok": true,
  "channel": "C049281ABC",
  "ts": "1725451200.001920",
  "message_url": "https://slack.com/archives/C049281ABC/p1725451200"
}
```

### 📋 Action Schema: Send Direct Message to User

**Action ID:** `send_direct_message`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `user_id` | User Email / Member ID | text | ✅ | ✅ |
| `message_text` | Direct Message Content | textarea | ✅ | ✅ |
| `bot_name` | Bot Name | text | ❌ | ✅ |

**Sample Output:**
```json
{
  "ok": true,
  "channel": "D049281XYZ",
  "ts": "1725451205.002100"
}
```

### How It Works

1. **OAuth 2.0 Bot Authorization**: Connects with 1-click OAuth to install the Automate Workflows app to your Slack workspace.
2. **API-Driven Instant Triggers**: Webhook subscriptions are automatically registered via Slack's Events API in the background. No manual webhook URLs need to be copied into Slack.
3. **Rich Message Formatting**: Send standard messages, direct messages, or rich Block Kit interactive components with dynamic variable tokens.
4. **Channel & Workspace Control**: Create dedicated deal/incident channels, manage topics, and upload files directly.

---

## ✉️ Gmail

| Property | Value |
|----------|-------|
| **App ID** | `gmail` |
| **Icon** | `Mail` |
| **Category** | Communication / Notifications |
| **Auth Type** | OAuth 2.0 |
| **Sync Mode** | Polling |
| **Notes** | Sends via user's authenticated address to ensure deliverability. |

### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_email_matching` | New Email Received (Matching Label) | Fires when new email arrives matching query/label | Polling |
| 2 | `new_star_email` | New Starred Email | Fires when user stars an email thread | Polling |
| 3 | `new_attachment` | New Email with Attachment Received | Fires when email containing file is delivered | Polling |

### ▶️ Actions (5)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `send_email` | Send Email (with Attachments) | Sends email with optional attachment |
| 2 | `create_draft` | Create Email Draft | Saves draft in user inbox for review |
| 3 | `add_label` | Add Label to Email Thread | Applies category label to message |
| 4 | `reply_email` | Reply to Email Thread | Replies directly in existing thread |
| 5 | `mark_as_read` | Mark Email as Read / Unread | Updates read status on target thread |

### 📋 Action Schema: Send Email Message

**Action ID:** `send_email`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `recipient_to` | To (Recipient Email) | text | ✅ | ✅ |
| `recipient_cc` | Cc / Bcc Emails | text | ❌ | ✅ |
| `subject` | Email Subject | text | ✅ | ✅ |
| `body_content` | Email Message Body | textarea | ✅ | ✅ |
| `attachment_url` | Attachment Public URL | text | ❌ | ✅ |

**Sample Output:**
```json
{
  "message_id": "msg_gm_18f921ab98",
  "thread_id": "th_98124ab",
  "labels": ["SENT"],
  "delivered_to": "client@company.com"
}
```

### How It Works

1. **OAuth 2.0 Security**: Direct authentication via Google OAuth 2.0 with minimal required email scopes.
2. **Polling Engine**: Checks the authenticated mailbox on a 1–5 minute schedule for incoming emails matching specific search queries or labels (e.g. `label:INBOX is:unread`).
3. **Variable Token Extraction**: Extracts sender name, email, subject, body, and attachment links for downstream steps.
4. **Direct Deliverability**: Sends emails from the user's authentic Google address, bypassing third-party SMTP spam filters.

---

## ✈️ Telegram

| Property | Value |
|----------|-------|
| **App ID** | `telegram` |
| **Icon** | `Send` |
| **Category** | Communication / Notifications |
| **Auth Type** | Bot Token |
| **Sync Mode** | Webhook (Instant) |
| **Notes** | Bot token created via @BotFather. Instant Telegram setWebhook call. |

### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_telegram_msg` | New Message Sent to Bot | Fires when user sends message to bot | Instant |
| 2 | `new_chat_member` | New Member Joined Group | Fires when new user enters group chat | Instant |
| 3 | `callback_query` | Inline Keyboard Button Tapped | Fires when user taps interactive menu button | Instant |

### ▶️ Actions (4)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `send_telegram_msg` | Send Text Message via Bot | Sends message or alert to Telegram group/chat |
| 2 | `send_photo` | Send Photo / Document | Dispatches image or PDF attachment |
| 3 | `kick_chat_member` | Ban or Restrict Chat Member | Removes offending user from group |
| 4 | `pin_message` | Pin Message in Group Chat | Pins important announcement at top of chat |

### 📋 Action Schema: Send Telegram Message

**Action ID:** `send_telegram_msg`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `chat_id` | Chat ID / Group Channel ID | text | ✅ | — | ✅ |
| `message_text` | Message Content | textarea | ✅ | — | ✅ |
| `parse_mode` | Formatting Syntax | select | ❌ | `Markdown` | ✅ |

**Formatting Options:**
| Value | Label |
|-------|-------|
| `Markdown` | Markdown (Bold *, Italic _, Links) |
| `HTML` | HTML (`<b>bold</b>`, `<code>code</code>`) |
| `None` | Plain Text (No Parsing) |

**Sample Output:**
```json
{
  "ok": true,
  "message_id": 4892,
  "date": 1725451200
}
```

### How It Works

1. **Bot Token Connection**: Obtain a token from Telegram's `@BotFather` and enter it into Automate Workflows.
2. **Automated Webhook Registration**: The platform calls Telegram's `setWebhook` API in the background. No manual URL pasting is needed.
3. **Instant Message Streaming**: Inbound messages, group join events, and inline keyboard button clicks trigger workflows with sub-second latency.
4. **Chat & Channel Dispatch**: Send markdown/HTML alerts, photos, documents, pin messages, or moderate group members.

---

*← [Previous: CRM & Sales](./03-crm-sales.md) | [Back to Index](./README.md) | [Next: Commerce →](./05-commerce.md)*

