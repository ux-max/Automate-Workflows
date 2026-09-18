# 02 — CRM & Commerce Integration Guide

> Detailed guide covering authentication, raw platform JSON ingestion, variable flattening, and field mapping for **HubSpot**, **Pipedrive**, **Shopify**, and **Razorpay**.

---

## 1. 🟧 HubSpot CRM

### Authentication Architecture (Dual Trigger vs. Action Model)

Like Automate Workflows, HubSpot utilizes two distinct connection protocols depending on whether it is used as a **Trigger** or an **Action**:

| Role | Protocol | How It Connects | Why It Works This Way |
|:---|:---|:---|:---|
| **TRIGGER (Step 1)** | **Automate Workflows-Style Webhook URL** | Zero-verification dedicated Capture URL pasted into HubSpot Workflow / Webhook tool. | **Inbound Push**: HubSpot sends data *to* Automate Workflows. No write credentials or account keys needed to receive data. |
| **ACTION (Step 2+)** | **OAuth 2.0 Handshake** | 1-click authorization redirect with HubSpot portal. | **Outbound Write**: Automate Workflows writes records *into* your private CRM database, requiring explicit permission scopes. |

- **Required OAuth 2.0 Scopes:**
  `crm.objects.contacts.write`, `crm.objects.deals.write`, `crm.objects.companies.write`
- **Header Injection for Outbound API Dispatches:**
  ```http
  Authorization: Bearer ya29.oauth_hubspot_token...
  Content-Type: application/json
  ```
- **Fallback / Alternative:** Also supports Private App Access Tokens (`pat-na1-...`) for private enterprise accounts without public marketplace redirection.

### Raw Platform JSON Ingested (Webhook POST):
```json
[
  {
    "eventId": 100,
    "subscriptionId": 89412,
    "portalId": 9812450,
    "occurredAt": 1788269112000,
    "subscriptionType": "contact.creation",
    "attemptNumber": 0,
    "objectId": 541092,
    "properties": {
      "email": { "value": "rahul.sharma@techcorp.io" },
      "firstname": { "value": "Rahul" },
      "lastname": { "value": "Sharma" },
      "phone": { "value": "+919876543210" },
      "company": { "value": "TechCorp Logistics" },
      "lifecyclestage": { "value": "lead" }
    }
  }
]
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.objectId}}` | Contact ID (VID) | `number` | `541092` |
| `{{step_1.email}}` | Contact Email | `string` | `"rahul.sharma@techcorp.io"` |
| `{{step_1.firstname}}` | First Name | `string` | `"Rahul"` |
| `{{step_1.lastname}}` | Last Name | `string` | `"Sharma"` |
| `{{step_1.phone}}` | Phone | `string` | `"+919876543210"` |
| `{{step_1.company}}` | Company | `string` | `"TechCorp Logistics"` |
| `{{step_1.lifecyclestage}}` | Lifecycle Stage | `string` | `"lead"` |

---

## 2. 🟢 Pipedrive CRM

### Authentication Architecture
- **Auth Type:** `API Token` (Personal API Key)
- **Header / Query Injection:**
  ```http
  https://api.pipedrive.com/v1/deals?api_token=9a8b7c6d5e...
  ```
- **Connection Model:** Stored per organization portal domain (e.g. `yourcompany.pipedrive.com`).

### Raw Platform JSON Ingested (Webhook POST):
```json
{
  "v": 1,
  "matches_filters": { "current": [] },
  "meta": {
    "action": "added",
    "object": "deal",
    "id": 8920,
    "company_id": 4120
  },
  "current": {
    "id": 8920,
    "title": "Enterprise Cloud Migration — 150 Seats",
    "value": 45000,
    "currency": "USD",
    "stage_id": 2,
    "status": "open",
    "person_id": {
      "name": "Devin Wright",
      "email": [{ "value": "devin@wrightindustries.com", "primary": true }],
      "phone": [{ "value": "+1 555-0198", "primary": true }]
    }
  }
}
```

### How It Populates In Automate Workflows:

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.deal_id}}` | Deal ID | `number` | `8920` |
| `{{step_1.title}}` | Deal Title | `string` | `"Enterprise Cloud Migration — 150 Seats"` |
| `{{step_1.value}}` | Deal Amount | `number` | `45000` |
| `{{step_1.currency}}` | Currency | `string` | `"USD"` |
| `{{step_1.person_name}}` | Primary Person Name | `string` | `"Devin Wright"` |
| `{{step_1.person_email}}` | Primary Person Email | `string` | `"devin@wrightindustries.com"` |
| `{{step_1.stage_id}}` | Pipeline Stage ID | `number` | `2` |

---

## 3. 🛍️ Shopify

### Authentication Architecture
- **Auth Type:** `Admin API Access Token` (`X-Shopify-Access-Token`)
- **Webhook Signature Security:** `X-Shopify-Hmac-Sha256` HMAC-SHA256 signature calculated against the shared app secret.
- **Webhook Endpoint:** Dedicated Automate Workflows-style capture URL pasted into Shopify Admin → Settings → Notifications → Webhooks.

### Raw Platform JSON Ingested (`orders/paid` Webhook):
```json
{
  "id": 591240192841,
  "name": "#1042",
  "email": "customer@shoponline.com",
  "created_at": "2026-09-08T12:00:00-04:00",
  "current_total_price": "149.99",
  "currency": "USD",
  "financial_status": "paid",
  "customer": {
    "id": 8912412,
    "first_name": "Elena",
    "last_name": "Rostova",
    "phone": "+14155552671"
  },
  "line_items": [
    {
      "id": 9812401,
      "title": "Ultra-Light Carbon Trekking Pole",
      "quantity": 2,
      "price": "65.00",
      "sku": "TRK-CARB-01"
    },
    {
      "id": 9812402,
      "title": "Waterproof Storage Sack",
      "quantity": 1,
      "price": "19.99",
      "sku": "BAG-WP-10L"
    }
  ],
  "shipping_address": {
    "city": "San Francisco",
    "province_code": "CA",
    "country_code": "US",
    "zip": "94107"
  }
}
```

### How It Populates In Automate Workflows:

#### Simple Response Mode (`Yes`):
Nested objects are cleanly flattened for 1-click variable mapping:
- `{{step_1.id}}` → `591240192841` (Order ID)
- `{{step_1.name}}` → `"#1042"` (Order Name)
- `{{step_1.total_price}}` → `"149.99"`
- `{{step_1.customer_first_name}}` → `"Elena"`
- `{{step_1.customer_phone}}` → `"+14155552671"`
- `{{step_1.shipping_city}}` → `"San Francisco"`
- `{{step_1.line_items_0_title}}` → `"Ultra-Light Carbon Trekking Pole"`

#### Advanced Response Mode (`No`):
Preserves `{{step_1.line_items}}` as a raw array:
```json
[
  { "title": "Ultra-Light Carbon Trekking Pole", "quantity": 2, "price": "65.00" },
  { "title": "Waterproof Storage Sack", "quantity": 1, "price": "19.99" }
]
```
*Directly consumable by the **Iterator / Loop** node for line-item processing.*

---

## 4. 💳 Razorpay Payments

### Authentication Architecture
- **Auth Type:** `Key ID` & `Key Secret` (HTTP Basic Auth)
- **Header Injection:**
  ```http
  Authorization: Basic cnpfcF9saXZlX2tleTpzZWNyZXRWYWx1ZQ==
  ```
- **Webhook Verification:** `X-Razorpay-Signature` HMAC-SHA256 signature calculated against webhook secret.

### Raw Platform JSON Ingested (`payment.captured` Webhook):
```json
{
  "entity": "event",
  "account_id": "acc_G912aK91",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_O8192aKms901",
        "amount": 249900,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_EKm9182a",
        "method": "upi",
        "email": "vikram.singh@delhitechnologies.in",
        "contact": "+919871234567",
        "fee": 4998,
        "tax": 899,
        "error_code": null,
        "created_at": 1788269112
      }
    }
  }
}
```

### How It Populates In Automate Workflows:
The Razorpay parser intelligently converts monetary amounts from smallest currency units (paise) to standard units (INR):

| Variable Token | Display Label | Data Type | Extracted Value |
|:---|:---|:---:|:---|
| `{{step_1.payment_id}}` | Payment ID | `string` | `"pay_O8192aKms901"` |
| `{{step_1.amount}}` | Amount (Normalized) | `number` | `2499.00` |
| `{{step_1.raw_amount}}` | Amount in Paise | `number` | `249900` |
| `{{step_1.currency}}` | Currency | `string` | `"INR"` |
| `{{step_1.method}}` | Payment Method | `string` | `"upi"` |
| `{{step_1.payer_email}}` | Payer Email | `string` | `"vikram.singh@delhitechnologies.in"` |
| `{{step_1.payer_phone}}` | Payer Phone | `string` | `"+919871234567"` |
| `{{step_1.status}}` | Payment Status | `string` | `"captured"` |

---

*← [Back: Native & Forms](./01-native-and-forms.md) | [Back to Master Index](./README.md) | [Next: Communication & Scheduling →](./03-communication-and-scheduling.md)*
