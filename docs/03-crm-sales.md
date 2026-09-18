# 03 — CRM & Sales Nodes

> Customer relationship management and sales pipeline integrations.

---

## 👥 HubSpot

| Property | Value |
|----------|-------|
| **App ID** | `hubspot` |
| **Icon** | `Users` |
| **Category** | CRM / Sales |
| **Auth Type** | OAuth 2.0 Handshake (Actions) / None (Webhook Trigger) |
| **Sync Mode** | Webhook URL (Automate Workflows-Style) |
| **Notes** | Instant Webhook trigger URL. OAuth 2.0 authorization for CRM actions (with Private App Token fallback). |

### 🔗 How to Setup Webhook in HubSpot (Automate Workflows-Style)
1. Add HubSpot as Step 1 (Trigger) and select your target event (e.g. `New Contact Created`).
2. Copy the unique **Webhook Capture URL** provided in the setup panel.
3. In HubSpot, navigate to **Automation > Workflows > Create Workflow > From scratch**.
4. Set the enrollment trigger matching the event (e.g. Contact enrollment trigger).
5. Add action: **Send a webhook** (POST) and paste the URL.
6. **Simple Response (Auto-Flattening)**:
   - **Simple (`Yes` — Default)**: Automatically flattens nested contact properties into top-level tokens like `{{step_1.email}}`, `{{step_1.firstname}}`, and `{{step_1.lifecyclestage}}`.
   - **Advanced (`No`)**: Retains raw nested HubSpot JSON payload.
7. Click **Simulate Test Event** in Automate Workflows to test and map contact fields downstream immediately!
8. **Actions Authentication**: When configuring HubSpot as an **Action** (e.g. Create Contact, Update Deal Stage), connect securely via **OAuth 2.0** with scopes `crm.objects.contacts.write`, `crm.objects.deals.write`, and `crm.objects.companies.write` (or use a Private App Access Token).


### ⚡ Triggers (5)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_contact` | New Contact Created | Fires when a new contact is added in HubSpot | Instant |
| 2 | `contact_updated` | Contact Property Updated | Fires when lifecycle stage or custom property changes | Instant |
| 3 | `deal_stage_changed` | Deal Stage Changed | Fires when a deal moves to a new pipeline stage | Instant |
| 4 | `new_company` | New Company Created | Fires when organization record is added | Instant |
| 5 | `new_ticket` | New Support Ticket Created | Fires when customer files helpdesk ticket | Instant |

### ▶️ Actions (6)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `create_update_contact` | Create or Update Contact (Upsert) | Upserts contact using email as unique identifier |
| 2 | `create_deal` | Create Deal | Creates a new deal associated with contact |
| 3 | `update_deal_stage` | Update Deal Stage / Amount | Moves deal between pipeline stages |
| 4 | `create_company` | Create or Associate Company | Links contact to company domain |
| 5 | `add_timeline_event` | Add Note or Timeline Activity | Logs call, email, or meeting note under contact timeline |
| 6 | `update_contact_lifecycle` | Update Contact Lifecycle Stage | Promotes contact to Lead, MQL, SQL, or Customer |

### 📋 Action Schema: Create or Update Contact

**Action ID:** `create_update_contact`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `contact_email` | Contact Email (Primary Key) | text | ✅ | ✅ |
| `first_name` | First Name | text | ✅ | ✅ |
| `last_name` | Last Name | text | ❌ | ✅ |
| `phone` | Phone Number | text | ❌ | ✅ |
| `lifecycle_stage` | Lifecycle Stage | select | ❌ | ✅ |
| `company_name` | Company / Domain | text | ❌ | ✅ |

**Lifecycle Stage Options:**
| Value | Label |
|-------|-------|
| `lead` | Lead |
| `marketingqualifiedlead` | Marketing Qualified Lead (MQL) |
| `salesqualifiedlead` | Sales Qualified Lead (SQL) |
| `customer` | Customer |

**Sample Output:**
```json
{
  "contact_id": "vid_9281204",
  "is_new": true,
  "lifecycle_stage": "lead",
  "status": "SUCCESS"
}
```

---

## 📊 Google Sheets

| Property | Value |
|----------|-------|
| **App ID** | `google-sheets` |
| **Icon** | `Table` |
| **Category** | CRM / Sales |
| **Auth Type** | OAuth 2.0 |
| **Sync Mode** | Polling |
| **Notes** | Headers from row 1 auto-read for variable field mapping. |

### ⚡ Triggers (3)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_row_added` | New Row Appended | Fires when a new row is appended to worksheet | Polling |
| 2 | `new_updated_row` | New or Updated Row | Fires when existing cell or row is edited | Polling |
| 3 | `new_worksheet` | New Worksheet Tab Created | Fires when new tab is added to spreadsheet | Polling |

### ▶️ Actions (7)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `add_row` | Add Row | Appends a new row to specified spreadsheet tab |
| 2 | `update_row` | Update Row | Finds and updates a row by column lookup value |
| 3 | `lookup_row` | Lookup Row (Enrichment) | Searches for matching row data for enrichment |
| 4 | `delete_row` | Delete Row in Worksheet | Removes target row matching key value |
| 5 | `clear_row` | Clear Row Cell Contents | Clears cell values while maintaining formatting |
| 6 | `create_worksheet` | Create New Worksheet Tab | Adds fresh tab with header columns |
| 7 | `batch_add_rows` | Batch Insert Multiple Rows | Appends array of multiple rows in a single API call |

### 📋 Action Schema: Add Row to Spreadsheet

**Action ID:** `add_row`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `spreadsheet_id` | Spreadsheet | select | ✅ | ✅ |
| `worksheet_id` | Worksheet Tab | select | ✅ | ✅ |
| `col_name` | Column: Full Name | text | ✅ | ✅ |
| `col_email` | Column: Email Address | text | ✅ | ✅ |
| `col_phone` | Column: Phone Number | text | ❌ | ✅ |
| `col_amount` | Column: Amount / Value | text | ❌ | ✅ |
| `col_notes` | Column: Notes & Timestamp | textarea | ❌ | ✅ |

**Sample Output:**
```json
{
  "row_number": 142,
  "spreadsheet_id": "sheet_leads_2026",
  "updated_cells": 5,
  "status": "SUCCESS"
}
```

### 📋 Action Schema: Update Existing Row

**Action ID:** `update_row`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `spreadsheet_id` | Spreadsheet | select | ✅ | ✅ |
| `worksheet_id` | Worksheet Tab | select | ✅ | ✅ |
| `row_index` | Row Index / Row Number | number | ✅ | ✅ |
| `col_amount` | Update: Amount / Value | text | ❌ | ✅ |
| `col_notes` | Update: Notes | textarea | ❌ | ✅ |

**Sample Output:**
```json
{
  "row_number": 142,
  "updated_cells": 2,
  "status": "UPDATED"
}
```

### 📋 Action Schema: Lookup / Search Row

**Action ID:** `lookup_row`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `spreadsheet_id` | Spreadsheet | select | ✅ | ✅ |
| `worksheet_id` | Worksheet Tab | select | ✅ | ✅ |
| `lookup_column` | Lookup Column Name | select | ✅ | ✅ |
| `lookup_value` | Lookup Search Value | text | ✅ | ✅ |

**Sample Output:**
```json
{
  "found": true,
  "row_number": 88,
  "name": "Alex Johnson",
  "email": "alex@company.com",
  "amount": "450"
}
```

### How It Works

1. **OAuth 2.0 Authorization**: Connects via official Google OAuth 2.0 consent to read and write Google Spreadsheets.
2. **Polling Engine**: Periodically checks worksheets (1–5 min intervals) to identify newly appended rows or modified cells.
3. **Dynamic Header Detection**: The first row (headers) of your sheet is dynamically extracted to provide structured mapping chips for every column in the sheet.
4. **CRUD Actions**: Full suite of row appending, cell updating, value lookups, batch row insertion, and sheet tab creation.

---

## 🎯 Pipedrive

| Property | Value |
|----------|-------|
| **App ID** | `pipedrive` |
| **Icon** | `Target` |
| **Category** | CRM / Sales |
| **Auth Type** | API Key (Actions) / None (Webhook Trigger) |
| **Sync Mode** | Webhook URL (Automate Workflows-Style) |
| **Notes** | Instant Webhook trigger URL. Personal API Token for actions. |

### 🔗 How to Setup Webhook in Pipedrive (Automate Workflows-Style)
1. Copy the **Webhook Capture URL** from the trigger setup drawer.
2. In Pipedrive, go to **Company settings > Tools and apps > Webhooks > + Create a new webhook**.
3. Set Event Action (`added` / `updated`) and Event Object (`deal` / `person`).
4. Paste the Webhook URL into the **Endpoint URL** input and click Save.
5. **Simple Response (Auto-Flattening)**:
   - **Simple (`Yes` — Default)**: Automatically flattens nested deal and contact person objects into clean tokens like `{{step_1.title}}`, `{{step_1.value}}`, `{{step_1.person_name}}`.
   - **Advanced (`No`)**: Retains raw nested Pipedrive JSON payload.
6. Click **Simulate Test Event** in Automate Workflows to test and map fields downstream immediately!
7. **Actions Authentication**: For pipeline actions (Create Deal, Add Note, Schedule Activity), enter your Pipedrive **Personal API Token** (**Personal preferences > API**).


### ⚡ Triggers (5)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_pipedrive_deal` | New Deal Created | Fires when deal is created in Pipedrive | Instant |
| 2 | `deal_stage_moved` | Deal Stage Changed | Fires when deal is moved between stages | Instant |
| 3 | `deal_won` | Deal Marked as Won | Fires when deal status changes to Won | Instant |
| 4 | `deal_lost` | Deal Marked as Lost | Fires when deal status changes to Lost | Instant |
| 5 | `new_person` | New Person Added | Fires when contact person record is created | Instant |

### ▶️ Actions (5)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `create_person` | Create or Update Person | Adds contact person to Pipedrive |
| 2 | `create_pipedrive_deal` | Create Deal | Creates deal in pipeline |
| 3 | `update_deal` | Update Deal Custom Property | Modifies deal value, owner, or stage |
| 4 | `add_note` | Add Activity Note to Deal | Appends sales call or meeting note |
| 5 | `create_activity` | Schedule Activity / Call Task | Creates follow-up activity reminder for sales rep |

### 📋 Action Schema: Create Deal & Contact

**Action ID:** `create_pipedrive_deal`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `deal_title` | Deal Title | text | ✅ | ✅ |
| `deal_value` | Deal Value / Currency | number | ✅ | ✅ |
| `stage_id` | Pipeline Stage | select | ✅ | ✅ |
| `person_name` | Contact Person Name | text | ✅ | ✅ |
| `person_email` | Contact Email | text | ❌ | ✅ |

**Pipeline Stage Options:**
| Value | Label |
|-------|-------|
| `lead_in` | Stage 1: Lead In / Qualified |
| `contact_made` | Stage 2: Contact Made |
| `demo_scheduled` | Stage 3: Demo Scheduled |
| `proposal_sent` | Stage 4: Proposal Sent |

**Sample Output:**
```json
{
  "deal_id": 8492,
  "stage": "demo_scheduled",
  "value": 5000,
  "status": "open"
}
```

---

*← [Previous: Lead Capture & Forms](./02-lead-capture-forms.md) | [Back to Index](./README.md) | [Next: Communication & Notifications →](./04-communication-notifications.md)*
