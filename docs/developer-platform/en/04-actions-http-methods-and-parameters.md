# 04 — Actions: HTTP Methods, Headers & Dynamic Parameters

An **Action** represents an executable operation in an external API that runs when triggered by a preceding workflow step. Examples include:
- Creating a contact in a CRM.
- Generating and sending an invoice via Stripe.
- Posting an alert message into a Slack channel.
- Querying a database record.

---

## 1. Action Builder Overview

Clicking **Add Action** or editing an existing action opens the full-width **Action Builder Drawer**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Action Builder Drawer                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Operation Details      Display Name, Key, Description, Method & URL │
│ 2. HTTP Headers           Custom headers, static values, common data   │
│ 3. User Input Parameters  Visual form fields & dynamic dropdown links  │
│ 4. Body / Payload Mapping JSON structure & {{input.key}} tags          │
│ 5. Test Execution         Live request runner & response mapping       │
└────────────────────────────────────────────────────────────────────────┘
```

> **Interactive "How to Use" Guidance Modals**:
> Every section (Parameters, Headers, Test execution) contains a structured modal explaining *What this does*, *How Developer Sets It Up*, and *How End-Users Experience It*.

---

## 2. General Operation Details

| Field Name | Technical Key | Example Value | Description & Behavior |
| :--- | :--- | :--- | :--- |
| **Action Display Name** | `name` | `Create Contact` | Title shown in the workflow editor when users browse your app's action catalog. |
| **Action Key** | `key` | `create_contact` | Unique machine identifier (snake_case). Output tokens from this action will be referenced as `{{step.create_contact.field}}`. |
| **Action Description** | `description` | `Creates or updates a contact record in Acme CRM.` | Short subtitle explaining the business purpose of the operation. |
| **HTTP Method** | `method` | `POST` | The HTTP verb: `POST`, `GET`, `PUT`, `PATCH`, `DELETE`. |
| **Endpoint URL** | `endpointUrl` | `https://api.acme.com/v1/contacts` | Target API URL. Supports path parameter templating (e.g. `https://api.acme.com/v1/contacts/{{input.contact_id}}`). |

---

## 3. HTTP Headers Section

Many third-party APIs require custom headers for versioning, content types, tenant routing, or supplemental security signatures.

### Enabling Headers
Check the **HTTP Headers** checkbox.

### Header Rows & Controls
Each header row contains:
- **Header Key Input**: Type standard or custom header names (e.g. `Content-Type`, `Accept`, `X-Workspace-ID`).
- **Header Value Input**: Static values (e.g. `application/json`), secrets (`{{common.KEY}}`), or dynamic tags (`Bearer {{connection.accessToken}}`).
- **Gear Icon (⚙)**: Opens the **Header Settings Drawer**.
- **Ghost Action Controls**: Compact icon-only buttons for duplicate (`❐`) and delete (`🗑`).

---

## 4. User Input Parameters & Field Settings (⚙)

This is the core of visual connector building: **Zero-Code Parameter Mapping**. Instead of asking workflow creators to construct raw JSON payloads, developers define structured input fields that generate intuitive form controls.

### Parameter Rows & Controls
- **Parameter Key Input**: The attribute key (e.g. `email`, `first_name`, `project_id`).
- **Gear Icon (⚙)**: Opens the **Field Settings Drawer**.
- **Ghost Action Controls**: Drag handle (`⋮⋮`), duplicate (`❐`), and delete (`🗑`).

### Field Settings Drawer Options
1. **Field Label** (`label`): User-friendly label (e.g., *Customer Email Address*, *Target Project*).
2. **Field Key** (`key`): Unique identifier referenced as `{{input.key}}`.
3. **Field Type** (`type`):
   - `Text`: Single-line or multi-line string.
   - `Number`: Numbers only (quantities, amounts).
   - `Boolean`: Interactive toggle switch.
   - `Dropdown`: Dropdown list populated with choices.
4. **Options Data Source** (For Dropdowns):
   - **Static Options**: Manual key-value choices (e.g. `Draft`, `Published`).
   - **Dynamic (In-built Action)**: Linked to an In-built Action from the **In-built Actions** tab to fetch real-time items directly from the user's account.
5. **Parent Field Dependency**: Select a parent field to dynamically cascade choices (e.g. selecting *Workspace* refreshes the *Project* dropdown).
6. **Placeholder & Help Hint**: Explanatory guidance displayed to workflow builders.
7. **Required Field Toggle**: Marks the field mandatory (`*`).

---

## 5. Send Test Request & Zero-JSON Sample Output Fields

### Running a Test Call
1. Click **Send Test Request** inside the Action Drawer.
2. Automate Workflows executes a live HTTP request using test parameters against the API.
3. The response console displays:
   - HTTP Status Code (e.g. `200 OK` or `201 Created`).
   - Round-trip latency (e.g. `142 ms`).
   - Formatted JSON response preview and captured HTTP headers.

### Output Variables in Workflows
When a user adds your action into a workflow:
1. They fill out your visual parameter fields.
2. When the action runs, its output variables are accessible to subsequent steps:
   ```
   {{step.create_contact.id}}
   {{step.create_contact.email}}
   ```
No custom scripting or regex parsing is required.

---

*Documentation Version 2.0.0 — Automate Workflows Developer Platform.*
