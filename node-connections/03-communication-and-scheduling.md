# 03 — Communication, Scheduling & Productivity Integration Guide

> Detailed guide covering authentication, raw platform JSON ingestion, variable flattening, and field mapping for **Slack**, **Gmail**, **Telegram**, **Google Sheets**, **Google Calendar**, **Calendly**, and **Freshdesk**.

---

## 1. 💬 Slack

### Authentication Architecture
- **Auth Type:** `OAuth 2.0 Handshake`
- **Required Bot Scopes:**
  `chat:write`, `channels:read`, `groups:read`, `users:read`, `reactions:write`
- **Header Injection:**
  ```http
  Authorization: Bearer xoxb-98124-4124...
  Content-Type: application/json; charset=utf-8
  ```

### Raw Platform JSON Ingested (`message.channels` Event):
```json
{
  "token": "one_time_verification_token",
  "team_id": "T05912401",
  "event": {
    "type": "message",
    "channel": "C054812",
    "user": "U0124128",
    "text": "New lead incoming from Website Contact Form!",
    "ts": "1788269112.001400",
    "blocks": []
  }
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.channel_id}}` | Channel ID | `string` | `"C054812"` |
| `{{step_1.user_id}}` | User ID | `string` | `"U0124128"` |
| `{{step_1.text}}` | Message Content | `string` | `"New lead incoming from Website Contact Form!"` |
| `{{step_1.timestamp}}` | Message Timestamp (ts) | `string` | `"1788269112.001400"` |

---

## 2. ✉️ Gmail

### Authentication Architecture
- **Auth Type:** `OAuth 2.0 Handshake`
- **Required Scopes:**
  `https://www.googleapis.com/auth/gmail.send`
  `https://www.googleapis.com/auth/gmail.readonly`
  `https://www.googleapis.com/auth/gmail.modify`
- **Sync Mechanism:** Google Pub/Sub push notification or automated periodic list polling.

### Raw Platform JSON Ingested (Gmail API Message Object):
```json
{
  "id": "18f92a104b2c910a",
  "threadId": "18f92a104b2c910a",
  "snippet": "Hello team, can you please share the updated pricing deck for Q4?",
  "payload": {
    "headers": [
      { "name": "From", "value": "Claire Dupont <claire@acmeglobal.fr>" },
      { "name": "To", "value": "sales@automate-workflows.app" },
      { "name": "Subject", "value": "Pricing Deck Request — Acme Global" },
      { "name": "Date", "value": "Tue, 8 Sep 2026 14:20:00 +0200" }
    ],
    "body": {
      "data": "SGVsbG8gdGVhbSwgY2FuIHlvdSBwbGVhc2Ugc2hhcmUgdGhlIHVwZGF0ZWQgcHJpY2luZyBkZWNrIGZvciBRND8="
    }
  }
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.from}}` | Sender Full String | `string` | `"Claire Dupont <claire@acmeglobal.fr>"` |
| `{{step_1.from_email}}` | Sender Email Only | `string` | `"claire@acmeglobal.fr"` |
| `{{step_1.from_name}}` | Sender Name | `string` | `"Claire Dupont"` |
| `{{step_1.subject}}` | Email Subject | `string` | `"Pricing Deck Request — Acme Global"` |
| `{{step_1.body}}` | Decoded Plain Text Body | `string` | `"Hello team, can you please share..."` |
| `{{step_1.message_id}}` | Gmail Message ID | `string` | `"18f92a104b2c910a"` |

---

## 3. ✈️ Telegram

### Authentication Architecture
- **Auth Type:** `Bot Token`
- **Setup Flow:**
  1. User talks to `@BotFather` on Telegram and executes `/newbot`.
  2. BotFather returns token: `791240182:AAH9kL81_xKm...`.
  3. User saves token in Automate Workflows.
  4. Platform automatically invokes Telegram API:
     ```http
     POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://connect.automateworkflows.com/telegram/<hash>
     ```

### Raw Platform JSON Ingested (Telegram Update POST):
```json
{
  "update_id": 98124018,
  "message": {
    "message_id": 412,
    "from": {
      "id": 89124019,
      "is_bot": false,
      "first_name": "Marcus",
      "username": "marcus_dev"
    },
    "chat": {
      "id": -1001928410294,
      "title": "Ops Alerts Channel",
      "type": "supergroup"
    },
    "date": 1788269112,
    "text": "/status warehouse dispatch"
  }
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.chat_id}}` | Telegram Chat ID | `number` | `-1001928410294` |
| `{{step_1.sender_id}}` | User ID | `number` | `89124019` |
| `{{step_1.username}}` | Username | `string` | `"marcus_dev"` |
| `{{step_1.text}}` | Message Text | `string` | `"/status warehouse dispatch"` |
| `{{step_1.message_id}}` | Message ID | `number` | `412` |

---

## 4. 📊 Google Sheets

### Authentication Architecture
- **Auth Type:** `OAuth 2.0 Handshake`
- **Required Scopes:**
  `https://www.googleapis.com/auth/spreadsheets`
  `https://www.googleapis.com/auth/drive.readonly`
- **Dynamic Header Detection:** Reads Row 1 of the chosen sheet to dynamically generate column variable tokens in real time!

### Raw Platform JSON Ingested:
```json
{
  "range": "Sheet1!A2:E2",
  "majorDimension": "ROWS",
  "values": [
    ["Anita Roy", "anita@test.com", "+919812345678", "Enterprise", "2026-09-08"]
  ]
}
```

### How It Populates In Automate Workflows:
The column headers from Row 1 (`Full Name`, `Email`, `Phone`, `Plan`, `Date`) become dynamic variable tokens:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.row_number}}` | Row Number | `number` | `2` |
| `{{step_1.full_name}}` | Full Name (Col A) | `string` | `"Anita Roy"` |
| `{{step_1.email}}` | Email (Col B) | `string` | `"anita@test.com"` |
| `{{step_1.phone}}` | Phone (Col C) | `string` | `"+919812345678"` |
| `{{step_1.plan}}` | Plan (Col D) | `string` | `"Enterprise"` |
| `{{step_1.date}}` | Date (Col E) | `string` | `"2026-09-08"` |

---

## 5. 📅 Google Calendar

### Authentication Architecture
- **Auth Type:** `OAuth 2.0 Handshake`
- **Required Scopes:**
  `https://www.googleapis.com/auth/calendar.events`
  `https://www.googleapis.com/auth/calendar.readonly`

### Raw Platform JSON Ingested:
```json
{
  "id": "cal_evt_9812401",
  "status": "confirmed",
  "htmlLink": "https://calendar.google.com/event?eid=...",
  "summary": "Product Strategy Review — Q4 Expansion",
  "description": "Discussing international carrier integrations.",
  "start": { "dateTime": "2026-09-08T15:00:00+05:30" },
  "end": { "dateTime": "2026-09-08T16:00:00+05:30" },
  "organizer": { "email": "vp-product@company.com" },
  "attendees": [
    { "email": "lead-architect@company.com", "responseStatus": "accepted" }
  ]
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.event_id}}` | Calendar Event ID | `string` | `"cal_evt_9812401"` |
| `{{step_1.event_title}}` | Event Title (Summary) | `string` | `"Product Strategy Review — Q4 Expansion"` |
| `{{step_1.start_time}}` | Start Time ISO | `string` | `"2026-09-08T15:00:00+05:30"` |
| `{{step_1.end_time}}` | End Time ISO | `string` | `"2026-09-08T16:00:00+05:30"` |
| `{{step_1.organizer_email}}` | Organizer Email | `string` | `"vp-product@company.com"` |
| `{{step_1.meeting_url}}` | Meeting Link | `string` | `"https://calendar.google.com/..."` |

---

## 6. 📆 Calendly

### Authentication Architecture
- **Auth Type:** `OAuth 2.0 Handshake` **(Pure 1-Click Handshake — No API Key input required)**
- **Header Injection:**
  ```http
  Authorization: Bearer cal_pat_9124a...
  ```
- **Webhook Protocol:** Automatically subscribes via `POST https://api.calendly.com/webhook_subscriptions`.

### Raw Platform JSON Ingested (`invitee.created` Webhook):
```json
{
  "event": "invitee.created",
  "time": "2026-09-08T10:00:00.000Z",
  "payload": {
    "event": "https://api.calendly.com/scheduled_events/evt_841029",
    "name": "David Miller",
    "email": "david.miller@acmeholdings.com",
    "status": "active",
    "timezone": "America/New_York",
    "scheduled_event": {
      "name": "30 Minute Demo & Strategy Session",
      "start_time": "2026-09-12T14:00:00.000000Z",
      "end_time": "2026-09-12T14:30:00.000000Z"
    }
  }
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.invitee_name}}` | Invitee Full Name | `string` | `"David Miller"` |
| `{{step_1.invitee_email}}` | Invitee Email | `string` | `"david.miller@acmeholdings.com"` |
| `{{step_1.event_name}}` | Meeting Type | `string` | `"30 Minute Demo & Strategy Session"` |
| `{{step_1.start_time}}` | Start Time ISO | `string` | `"2026-09-12T14:00:00Z"` |
| `{{step_1.timezone}}` | Invitee Timezone | `string` | `"America/New_York"` |

---

## 7. 🎧 Freshdesk

### Authentication Architecture
- **Auth Type:** `API Key`
- **Header Injection:**
  ```http
  Authorization: Basic base64(apiKey + ":X")
  Content-Type: application/json
  ```

### Raw Platform JSON Ingested (`ticket.created` Webhook):
```json
{
  "ticket": {
    "id": 98142,
    "subject": "Payment Gateway Timeout on Checkout Page",
    "status": 2,
    "priority": 3,
    "requester": {
      "name": "Sarah Jenkins",
      "email": "sarah@acme.com"
    },
    "created_at": "2026-09-08T13:45:00Z"
  }
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.ticket_id}}` | Ticket ID | `number` | `98142` |
| `{{step_1.subject}}` | Ticket Subject | `string` | `"Payment Gateway Timeout on Checkout Page"` |
| `{{step_1.priority}}` | Priority Level | `string` | `"High (3)"` |
| `{{step_1.requester_name}}` | Requester Name | `string` | `"Sarah Jenkins"` |
| `{{step_1.requester_email}}` | Requester Email | `string` | `"sarah@acme.com"` |

---

*← [Back: CRM & Commerce](./02-crm-and-commerce.md) | [Back to Master Index](./README.md) | [Next: Flow Control & Utilities →](./04-flow-control-and-utilities.md)*
