# 06 — Scheduling & Productivity Nodes

> Calendar and appointment scheduling integrations.

---

## 📅 Google Calendar

| Property | Value |
|----------|-------|
| **App ID** | `google-calendar` |
| **Icon** | `Calendar` |
| **Category** | Scheduling / Productivity |
| **Auth Type** | OAuth 2.0 |
| **Sync Mode** | Polling |
| **Notes** | Timezone inherited from calendar settings. |

### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_event_created` | New Event Created | Fires when new calendar event is scheduled | Polling |
| 2 | `event_starting_soon` | Event Starting Soon Alert | Fires 15 mins before scheduled event start | Polling |
| 3 | `event_updated` | Event Details Updated | Fires when event time or location is modified | Polling |

### ▶️ Actions (4)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `create_event` | Create Event (with Google Meet) | Adds event to selected calendar with video call link |
| 2 | `update_event` | Update Event Time or Location | Reschedules existing calendar entry |
| 3 | `add_attendee` | Add Attendee to Event | Invites guest email to existing event |
| 4 | `delete_event` | Cancel Calendar Event | Removes event and notifies guests |

### 📋 Action Schema: Create Calendar Event

**Action ID:** `create_event`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `calendar_id` | Calendar | select | ✅ | — | ✅ |
| `event_title` | Event Title / Summary | text | ✅ | — | ✅ |
| `start_time` | Start Date & Time | datetime | ✅ | — | ✅ |
| `end_time` | End Date & Time | datetime | ✅ | — | ✅ |
| `description` | Description / Agenda | textarea | ❌ | — | ✅ |
| `attendees` | Attendee Emails | text | ❌ | — | ✅ |
| `add_google_meet` | Generate Google Meet Link | boolean | ❌ | `true` | ❌ |

**Calendar Options:**
| Value | Label |
|-------|-------|
| `primary` | Primary Calendar (Default) |
| `sales_team` | Sales & Demo Calendar |
| `support_ops` | Support Shifts & On-Call |

**Sample Output:**
```json
{
  "event_id": "gcal_evt_7721",
  "html_link": "https://calendar.google.com/event?eid=gcal_evt_7721",
  "hangout_link": "https://meet.google.com/xyz-qwer-tyu",
  "status": "confirmed"
}
```

### 📋 Action Schema: Quick Add Event (Natural Language)

**Action ID:** `quick_add_event`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `calendar_id` | Calendar | select | ✅ | ✅ |
| `quick_add_text` | Event Description (Natural Language) | text | ✅ | ✅ |

> 💡 Google will automatically parse the date, time, and title from natural language text (e.g., "Lunch with Alex tomorrow at 1pm at Bistro").

**Sample Output:**
```json
{
  "event_id": "gcal_quick_9912",
  "summary": "Lunch with Alex tomorrow at 1pm",
  "status": "confirmed"
}
```

### How It Works

1. **OAuth 2.0 Integration**: Single-click authorization to access calendars, event scheduling, and availability.
2. **Polling Engine**: Scans primary or secondary calendars every 1–5 minutes to trigger workflows when new events are added, edited, or starting within 15 minutes.
3. **Automated Video Conferencing**: When creating events, Google Meet links are generated automatically and returned in output variables (`{{step_2.hangout_link}}`).
4. **Natural Language Quick Add**: Supports parsing phrases like "Strategy call with Alex at 3pm tomorrow" directly into structured calendar entries.

---

## 🕐 Calendly

| Property | Value |
|----------|-------|
| **App ID** | `calendly` |
| **Icon** | `Clock` |
| **Category** | Scheduling / Productivity |
| **Auth Type** | OAuth 2.0 |
| **Sync Mode** | Webhook (API-Only / Automated) |
| **Notes** | Calendly has no user dashboard for pasting webhook URLs. Webhooks are registered automatically via Calendly OAuth 2.0 API (`POST /webhook_subscriptions`). |

### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `meeting_booked` | New Meeting Booked | Fires when invitee schedules a Calendly event | Instant |
| 2 | `meeting_canceled` | Meeting Canceled by Invitee | Fires when event is canceled | Instant |
| 3 | `invitee_rescheduled` | Invitee Rescheduled Meeting | Fires when meeting time is shifted | Instant |

### ▶️ Actions (3)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `get_user_availability` | Fetch Available Booking Slots | Checks user calendar for open availability |
| 2 | `cancel_event_calendly` | Cancel Scheduled Booking | Cancels event via Calendly v2 API |
| 3 | `create_single_booking_link` | Create Single-Use Booking Link | Generates one-time booking URL |

### 📋 Action Schema: Create or Verify Booking

**Action ID:** `get_user_availability`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `event_type` | Event Type / Meeting Slug | select | ✅ | — | ✅ |
| `invitee_name` | Invitee Full Name | text | ✅ | — | ✅ |
| `invitee_email` | Invitee Email Address | text | ✅ | — | ✅ |
| `event_start_time` | Event Start Time | datetime | ✅ | — | ✅ |
| `event_end_time` | Event End Time | datetime | ❌ | — | ✅ |
| `timezone` | Invitee Timezone | select | ✅ | `UTC` | ✅ |
| `meeting_location` | Meeting Location | select | ❌ | — | ✅ |
| `guest_emails` | Additional Guest Emails | text | ❌ | — | ✅ |
| `custom_questions_answers` | Custom Booking Notes / Questions | textarea | ❌ | — | ✅ |
| `phone_reminder` | Text Reminder Phone Number | text | ❌ | — | ✅ |

**Event Type Options:**
| Value | Label |
|-------|-------|
| `30min` | 30 Minute Product Demo & Walkthrough |
| `60min` | 60 Minute Strategy & Onboarding Call |
| `15min` | 15 Minute Quick Sync / Support Discovery |
| `custom` | Executive VIP Consultation (Private) |

**Meeting Location Options:**
| Value | Label |
|-------|-------|
| `google_meet` | Google Meet Video Call |
| `zoom` | Zoom Conferencing Integration |
| `ms_teams` | Microsoft Teams Meeting |
| `phone_call` | Outbound Phone Call (Host calls invitee) |

**Sample Output:**
```json
{
  "event_id": "evt_cal_98234",
  "status": "active",
  "start_time": "2026-09-10T14:30:00Z",
  "end_time": "2026-09-10T15:00:00Z",
  "meet_url": "https://meet.google.com/abc-defg-hij",
  "invitee_name": "Alex Johnson",
  "invitee_email": "alex@company.com"
}
```

### How It Works

1. **Why Pure OAuth 2.0 (No Manual Webhook Input)**: Calendly does not offer a user dashboard interface to paste webhook URLs. Authentication is handled exclusively via **OAuth 2.0** with no API Key input prompt in the workflow builder.
2. **Automated Background Webhook Subscription**: Upon user connection, Automate Workflows makes an authenticated API call (`POST /webhook_subscriptions`) to register webhook listeners for `invitee.created`, `invitee.canceled`, and rescheduling events automatically.
3. **Instant Event Triggering**: Booking confirmations and cancelations stream directly into workflows in real time.
4. **Clean Invitee Tokens**: Exposes invitee full name, email, scheduled meeting time, meeting link, and custom booking questions for downstream actions.
5. **Programmatic Scheduling**: Fetch host availability slots or generate single-use private booking links via actions.

---

*← [Previous: Commerce](./05-commerce.md) | [Back to Index](./README.md) | [Next: Support →](./07-support.md)*

