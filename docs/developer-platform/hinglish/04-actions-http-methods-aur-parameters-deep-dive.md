# 04 — Actions: HTTP Methods, Headers Aur Parameters Deep Dive

**Action** ka matlab hota hai kisi external API mein koi kaam (operation) karwana jab workflow trigger ho. Examples:
- CRM mein naya contact banana.
- Stripe se invoice generate karke customer ko bhejna.
- Slack channel par alert notification post karna.

---

## 1. Action Builder Overview

Jab aap **Add Action** par click karte hain ya existing action edit karte hain, toh full-width **Action Builder Drawer** open hota hai:

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
> Har section (Parameters, Headers, Testing) mein structured guidance modal milta hai jo *What this does*, *How Developer Sets It Up*, aur *How End-Users Experience It* step-by-step explain karta hai.

---

## 2. General Operation Details

| Field Name | Technical Key | Example Value | Description |
| :--- | :--- | :--- | :--- |
| **Action Display Name** | `name` | `Create Contact` | Workflow catalog mein user ko dikhne wala title. |
| **Action Key** | `key` | `create_contact` | Machine identifier (snake_case). Output tokens `{{step.create_contact.field}}` se reference honge. |
| **Action Description** | `description` | `Creates a contact record in Acme CRM.` | Operation ka short description. |
| **HTTP Method** | `method` | `POST` | HTTP verb: `POST`, `GET`, `PUT`, `PATCH`, `DELETE`. |
| **Endpoint URL** | `endpointUrl` | `https://api.acme.com/v1/contacts` | Target API URL. Isme dynamic path placeholders support hote hain (e.g. `{{input.contact_id}}`). |

---

## 3. HTTP Headers Section

Agar API ko custom headers (jaise versioning, tokens, content types) chahiye:
- **Header Key**: Header name (e.g. `Content-Type`, `Accept`).
- **Header Value**: Static value, environment secret (`{{common.KEY}}`), ya auth token (`Bearer {{connection.accessToken}}`).
- **Gear Icon (⚙)**: Header Settings Drawer kholta hai.
- **Ghost Action Buttons**: Compact icon buttons duplicate (`❐`) aur delete (`🗑`) ke liye.

---

## 4. User Input Parameters Aur Field Settings (⚙)

Visual connector banane ka main power hai **Zero-Code Parameter Mapping**. Users se raw JSON mangne ki jagah hum visual input fields banate hain.

### Parameter Rows & Controls
- **Parameter Key**: Attribute key (e.g. `email`, `first_name`, `project_id`).
- **Gear Icon (⚙)**: **Field Settings Drawer** kholta hai.
- **Ghost Action Controls**: Drag handle (`⋮⋮`), duplicate (`❐`), aur delete (`🗑`).

### Field Settings Drawer Ke Options
1. **Field Label** (`label`): User-friendly title (e.g., *Customer Email Address*, *Target Project*).
2. **Field Key** (`key`): Token identifier jo payload mein `{{input.key}}` se map hoga.
3. **Field Type** (`type`): `Text`, `Number`, `Boolean` (Toggle), `Dropdown`.
4. **Options Data Source** (Dropdown ke liye):
   - **Static Options**: Manual key-value list (e.g. `Draft`, `Published`).
   - **Dynamic (In-built Action)**: In-built Actions tab se linked live action jo user ke account se real-time list fetch karega.
5. **Parent Field Dependency**: Cascading dropdown banane ke liye parent field select karein (e.g. *Workspace* select karne par *Project* dropdown reload ho).
6. **Placeholder & Help Hint**: Workflow builder ke liye guidance text.
7. **Required Field Toggle**: Field ko mandatory (`*`) banata hai.

---

## 5. Send Test Request Aur Output Variables

### Test Execution
1. Action Drawer mein **Send Test Request** dabayein.
2. Automate Workflows live test parameters ke saath API ko HTTP call bhejta hai.
3. Console mein HTTP status (`200 OK`), round-trip latency (`142 ms`), aur formatted JSON output preview dikhta hai.

### Output Variables Workflow Mein
Workflow canvas par user ko clean output tokens milte hain:
```
{{step.create_contact.id}}
{{step.create_contact.email}}
```
Bina kisi regex ya scripting ke agle steps mein mapping ho jati hai!

---

*Documentation Version 2.0.0 — Automate Workflows Developer Platform.*
