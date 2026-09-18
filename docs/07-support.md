# 07 — Support Nodes

> Help desk and customer support ticket management integrations.

---

## 🎧 Freshdesk

| Property | Value |
|----------|-------|
| **App ID** | `freshdesk` |
| **Icon** | `Headphones` |
| **Category** | Support |
| **Auth Type** | API Key (Actions) / None (Webhook Trigger) |
| **Sync Mode** | Webhook URL (Automate Workflows-Style) |
| **Notes** | Instant Webhook trigger URL. API key + domain for actions. |

### 🔗 How to Setup Webhook in Freshdesk (Automate Workflows-Style)
1. Add Freshdesk as Step 1 (Trigger) and select target event (e.g. `New Ticket Created`).
2. Copy the unique **Webhook Capture URL** provided in the setup panel.
3. In Freshdesk, go to **Admin > Automations > Ticket Creation (or Ticket Updates) > New Rule**.
4. Set execution conditions, and under Actions select **Trigger Webhook**.
5. Set Request Type to **POST**, Encoding to **JSON**, and paste the URL.
6. **Simple Response (Auto-Flattening)**:
   - **Simple (`Yes` — Default)**: Flattens ticket properties into direct tokens like `{{step_1.ticket_id}}`, `{{step_1.subject}}`, `{{step_1.requester_email}}`, `{{step_1.priority}}`.
   - **Advanced (`No`)**: Retains raw nested Freshdesk event payload.
7. Click **Simulate Test Event** in Automate Workflows to test downstream variable mapping immediately!
8. **Actions Authentication**: For helpdesk operations (Create Ticket, Add Note, Resolve Ticket), enter your **Freshdesk API Key** (found in **Profile Settings > Your API Key**) and your Freshdesk domain URL (`https://yourcompany.freshdesk.com`).


### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_ticket` | New Ticket Created | Fires when customer submits a support ticket | Instant |
| 2 | `ticket_status_changed` | Ticket Status Changed | Fires when status updates to Pending, Resolved, or Closed | Instant |
| 3 | `new_ticket_reply` | Customer Replied to Ticket | Fires when customer sends new message thread | Instant |

### ▶️ Actions (5)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `create_ticket` | Create Support Ticket | Creates support ticket in helpdesk |
| 2 | `add_ticket_note` | Add Note or Reply to Ticket | Appends internal note or reply to ticket |
| 3 | `update_ticket_status` | Close / Resolve Ticket | Marks ticket as resolved |
| 4 | `assign_agent` | Assign Ticket to Support Agent | Transfers ticket ownership |
| 5 | `update_ticket_priority` | Update Ticket Priority (Urgent/High) | Escalates priority level for SLA compliance |

### 📋 Action Schema: Create Support Ticket

**Action ID:** `create_ticket`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `subject` | Ticket Subject | text | ✅ | — | ✅ |
| `description` | Issue Description / Message | textarea | ✅ | — | ✅ |
| `requester_email` | Requester Email | text | ✅ | — | ✅ |
| `priority` | Ticket Priority | select | ✅ | — | ✅ |
| `status` | Ticket Status | select | ❌ | `2` (Open) | ✅ |

**Priority Options:**
| Value | Label |
|-------|-------|
| `1` | Low Priority |
| `2` | Medium Priority |
| `3` | High Priority |
| `4` | Urgent (SLA 1-Hour) |

**Status Options:**
| Value | Label |
|-------|-------|
| `2` | Open |
| `3` | Pending |
| `4` | Resolved |

**Sample Output:**
```json
{
  "ticket_id": 104921,
  "priority": "Urgent",
  "status": "Open",
  "created_at": "2026-09-04T10:30:00Z"
}
```

### How It Works

1. **Automate Workflows-Style Webhook Dispatch**: Freshdesk automation rules trigger outgoing HTTP POST webhooks to your dedicated endpoint URL instantly when tickets are opened, replied to, or updated.
2. **Normalized Support Attributes**: Flattens ticket ID, requester contact information, ticket priority, and body content into clean step tokens.
3. **Escalation & SLA Automation**: Connect inbound tickets to Slack notifications, WhatsApp agent alerts, or priority auto-escalations.
4. **Bi-Directional Helpdesk Actions**: Create tickets from form submissions, append resolution notes, assign tickets to specific agents, or close tickets upon payment confirmation.

---

*← [Previous: Scheduling & Productivity](./06-scheduling-productivity.md) | [Back to Index](./README.md) | [Next: Generic Connectors →](./08-generic-connectors.md)*

