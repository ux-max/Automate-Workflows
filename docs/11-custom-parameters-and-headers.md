# Custom Parameters & Headers — Architecture, Purpose & Enterprise Use Cases

> **Complete guide explaining why Custom Parameters & Headers exist, how they solve the static schema bottleneck, how dynamic variable mapping works, and real-world implementation examples across CRMs, APIs, E-Commerce, and Human-in-the-Loop approval workflows.**

---

## 📌 Executive Summary

In modern integration and automation platforms (such as **Automate Workflows**, **Automate Workflows**, **Zapier**, and **Make**), every action node presents standard, predefined input fields (e.g., *Customer Email*, *First Name*, *Amount*, *Message Text*).

However, real-world enterprise workflows frequently interact with:
1. **Custom fields** added by businesses in their CRM, ERP, or Helpdesk systems (e.g., `lead_score`, `utm_campaign`, `preferred_language`, `tax_id`).
2. **Custom HTTP headers** required by third-party APIs for idempotency, distributed tracing, security, or tenant routing (e.g., `Idempotency-Key`, `X-Correlation-ID`, `X-Tenant-ID`).
3. **Dynamic decision metadata** in approval workflows (**Human in the Loop**), where approvers need contextual information (e.g., *Expense Category*, *Vendor Name*, *Cost Center*) that varies from organization to organization.
4. **Beta API flags & undocumented query parameters** released by third-party platforms before the iPaaS UI is officially updated.

The **Custom Parameters & Headers** section provides a **universal, zero-code extensibility bridge** that lets users define arbitrary key-value pairs with full dynamic variable mapping (`{{step_N.var}}`) without waiting for integration schema releases.

---

## 🖼️ UI Context: Where It Appears

In the Automate Workflows Action Configuration Drawer, below the main action fields, you find:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Custom Parameters & Headers                                           │
│  Add optional key-value parameters with variable mapping support       │
│                                                     [+ Add Parameter]  │
├────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │ Parameter Key         │  │ Value or {{step_1}}   │  │ [Press /]   │ │
│  └───────────────────────┘  └───────────────────────┘  └─────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

When you click **`+ Add Parameter`**, you can define any key name, map static or dynamic values, and repeat for as many custom parameters or headers as needed.

---

## 🚀 5 Primary Enterprise Use Cases

### 1. Custom CRM Properties (HubSpot, Pipedrive, Salesforce, Zoho)
- **The Problem**: Standard CRM action schemas only show default properties (First Name, Last Name, Email, Phone, Company). But in HubSpot or Pipedrive, companies create hundreds of custom properties unique to their sales operations (e.g., `lead_score`, `demo_booked_date`, `industry_vertical`, `referral_source`, `contract_tier`).
- **How Custom Parameters Solves It**:
  - Instead of filing a feature request for new schema fields, users simply add custom parameters:
    - **Key**: `lead_score`  
      **Value**: `{{step_2.calculated_score}}`
    - **Key**: `utm_campaign`  
      **Value**: `{{step_1.utm_campaign}}`
    - **Key**: `onboarding_priority`  
      **Value**: `Tier-1 Enterprise`
  - When the workflow executes, the engine injects these keys directly into HubSpot's `properties` payload:
    ```json
    {
      "properties": {
        "email": "sarah.connor@cyberdyne.com",
        "firstname": "Sarah",
        "lastname": "Connor",
        "lead_score": "88",
        "utm_campaign": "q3_security_webinar",
        "onboarding_priority": "Tier-1 Enterprise"
      }
    }
    ```

---

### 2. Custom HTTP Headers (APIs, Webhooks, Microservices)
- **The Problem**: When connecting custom REST APIs or internal webhooks via the **API / Webhook** node or third-party webhooks, APIs often enforce strict HTTP header specifications that aren't part of standard form fields.
- **How Custom Parameters & Headers Solves It**:
  - **Idempotency Keys**: Guaranteeing financial transactions or database inserts are never processed twice if network timeouts cause an automated retry:
    - **Key**: `Idempotency-Key`  
      **Value**: `{{step_1.order_id}}`
  - **Distributed Tracing**: Carrying correlation IDs across distributed microservices:
    - **Key**: `X-Correlation-ID`  
      **Value**: `{{step_1.trace_id}}`
    - **Key**: `X-Request-ID`  
      **Value**: `req_{{step_1.timestamp}}`
  - **Multi-Tenant Routing**: Directing traffic to the correct tenant database:
    - **Key**: `X-Tenant-ID`  
      **Value**: `org_corp_8829`
  - **Custom Security Headers**:
    - **Key**: `X-Webhook-Secret`  
      **Value**: `whsec_9948274a81bf0`
    - **Key**: `Accept-Language`  
      **Value**: `en-IN, en-US;q=0.9`

---

### 3. Human in the Loop / Approval Workflows (The Exact UI in Screenshot)
- **The Problem**: In the **Human in the Loop** action, an approval email or notification is dispatched to an executive or department head with **Approve** and **Reject** buttons.  
  However, no executive will approve an expense, discount, or leave request with just a title and email—they require **rich contextual business data**!
- **How Custom Parameters & Headers Solves It**:
  - You attach custom contextual metadata parameters:
    - **Key**: `Expense Amount` → **Value**: `₹{{step_1.amount}}`
    - **Key**: `Department` → **Value**: `{{step_1.department}}`
    - **Key**: `Vendor Name` → **Value**: `{{step_1.vendor_name}}`
    - **Key**: `Cost Center` → **Value**: `CC-FIN-104`
    - **Key**: `Urgency` → **Value**: `High (SLA: 4 Hours)`
    - **Key**: `Invoice URL` → **Value**: `{{step_1.invoice_pdf_url}}`
  - **What the Approver Sees**: In the live approval email and dashboard task card, the engine automatically renders an elegant metadata table displaying all custom parameters with their resolved values, giving the manager complete confidence to click **Approve**.

```
┌────────────────────────────────────────────────────────────────┐
│ 📩 APPROVAL REQUEST: High-Value Vendor Payment                 │
├────────────────────────────────────────────────────────────────┤
│ Request Details & Context:                                     │
│ • Expense Amount: ₹1,45,000                                    │
│ • Department: Engineering Infrastructure                       │
│ • Vendor Name: AWS Cloud Services                              │
│ • Cost Center: CC-FIN-104                                      │
│ • Urgency: High (SLA: 4 Hours)                                 │
│                                                                │
│ [  ✓ Approve Request  ]        [  ✕ Decline Request  ]         │
└────────────────────────────────────────────────────────────────┘
```

---

### 4. E-Commerce & Payment Gateways (Shopify, Razorpay)
- **The Problem**: In Shopify or Razorpay, businesses need to attach custom order attributes, line-item notes, delivery instructions, or GSTIN compliance details.
- **How Custom Parameters Solves It**:
  - **Shopify Custom Attributes**:
    - **Key**: `note_attributes[gift_message]` → **Value**: `{{step_1.custom_gift_note}}`
    - **Key**: `note_attributes[delivery_slot]` → **Value**: `Evening (6 PM - 9 PM)`
  - **Razorpay Custom Notes**:
    - **Key**: `notes[gstin]` → **Value**: `{{step_1.customer_gstin}}`
    - **Key**: `notes[internal_ref]` → **Value**: `PO-{{step_1.po_number}}`
  - When the checkout or invoice is generated, the custom metadata is safely attached and searchable in merchant dashboards.

---

### 5. Zero-Code API Extensibility & Future-Proofing
- **The Problem**: SaaS platforms update their REST APIs frequently. If Slack adds an optional parameter `reply_broadcast: true`, or Zoom adds `auto_recording: cloud`, users would normally have to wait weeks for an integration platform to update its hardcoded UI forms.
- **How Custom Parameters Solves It**:
  - Power users do not have to wait. They click `+ Add Parameter`, type the new API parameter name, map their values, and immediately utilize the newly released API capabilities.

---

## ⚡ How Variable Mapping Works in Custom Parameters

Custom Parameters support the exact same powerful variable mapping syntax as primary action fields:

### 1. Dynamic Variable Tokens
Insert any prior step's variable using the variable picker or curly-brace syntax:
- **`{{step_1.customer_email}}`** → Replaced at runtime with `"rahul@example.com"`
- **`{{step_2.calculated_total}}`** → Replaced at runtime with `1450.50`

### 2. Static Values
Any fixed string or number entered without curly braces is passed literally:
- **`Tier-1`** → Passed literally as `"Tier-1"`
- **`true`** → Passed literally as boolean `true` or `"true"`

### 3. Hybrid Interpolation (Text + Variables)
Mix static prefixes, delimiters, and variables:
- **`INV-{{step_1.order_id}}-2026`** → Resolves to `"INV-99481-2026"`
- **`Bearer {{step_1.access_token}}`** → Resolves to `"Bearer eyJhbGciOi..."`

### 4. Keyboard Shortcut
Whenever focusing the parameter value input, press **`/`** on your keyboard (or click the **`Press /`** pill button) to open the interactive **Variable Picker Modal**.

---

## ⚙️ How the Engine Processes Parameters at Runtime

When the workflow runs or when you click **Save & Send Test**, the workflow engine performs three automatic processing passes:

```
┌────────────────────────────────────────────────────────┐
│ 1. Token Interpolation Pass                            │
│    Replace {{step_N.field}} with actual runtime values │
└────────────────────────┬───────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────┐
│ 2. Classification & Routing Pass                       │
│    Inspect Key Name:                                   │
│    • Is it a Header? (Starts with X-, Authorization,   │
│      Accept, Content-Type, Idempotency-Key...)         │
│      ➔ Injected into HTTP Request Headers              │
│    • Is it a Body / Metadata Property?                 │
│      ➔ Merged into JSON Request Body / Action Payload  │
└────────────────────────┬───────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────┐
│ 3. Type Coercion & Payload Dispatch                    │
│    Parse booleans ("true" -> true) and numbers,        │
│    then dispatch to third-party API / Task Record      │
└────────────────────────────────────────────────────────┘
```

### Automatic Header vs. Body Routing Table

| Parameter Key Pattern | Routed To | Example |
|-----------------------|-----------|---------|
| `X-*` (e.g. `X-Request-ID`, `X-Tenant-ID`) | **HTTP Headers** | Added as request header |
| `Idempotency-Key` / `idempotency-key` | **HTTP Headers** | Added as request header |
| `Authorization` / `Proxy-Authorization` | **HTTP Headers** | Overrides default auth header |
| `Accept`, `Accept-Language`, `User-Agent` | **HTTP Headers** | Standard HTTP headers |
| `Content-Type` | **HTTP Headers** | Overrides default MIME type |
| Any other key (e.g. `lead_score`, `amount`) | **Request Body / Properties** | Merged into JSON body or CRM properties |

---

## 📊 Comparison: Predefined Action Fields vs. Custom Parameters

| Feature | Predefined Action Fields | Custom Parameters & Headers |
|---------|--------------------------|-----------------------------|
| **Source** | Built-in integration schema | User-defined at runtime |
| **Field Name** | Fixed (e.g., `email`, `amount`) | Arbitrary (any valid string/key) |
| **Variable Mapping Support** | ✅ Full (`{{step_N.var}}`) | ✅ Full (`{{step_N.var}}`) |
| **Keyboard `/` Shortcut** | ✅ Supported | ✅ Supported |
| **HTTP Header Injection** | ❌ Rare (fixed auth only) | ✅ Supported (`X-*`, `Idempotency-Key`) |
| **Custom CRM Properties** | ❌ Limited to standard fields | ✅ Unlimited custom properties |
| **Human in the Loop Context** | ❌ Limited to title & timeout | ✅ Unlimited rich decision metadata |
| **Maintenance** | Requires platform code update | Zero code, instant availability |

---

## 🛠️ Step-by-Step Tutorial (Matching the UI)

1. Open any Action step in the Workflow Canvas (e.g., **Human in the Loop**, **HubSpot**, or **API**).
2. Scroll to the bottom of the Configuration Drawer to the **Custom Parameters & Headers** section.
3. Click **`+ Add Parameter`**.
4. In the left input, type the key name:
   - For CRM custom property: `lead_score`
   - For HTTP header: `Idempotency-Key`
   - For Human-in-the-Loop decision context: `Expense Category`
5. In the right input, type your value or press **`/`** to select an incoming variable from a prior step.
6. Click **Save & Send Test** to execute the action with your custom parameters merged into the test payload.
7. Click **Save & Finish** to persist your configuration.

---

*Related Documentation:*
- [Node Connections & Variable Mapping Architecture](../node-connections/README.md)
- [Variable Mapping Deep Dive](../node-connections/05-variable-mapping-deep-dive.md)
- [Generic Connectors (HTTP Request & Webhook)](./08-generic-connectors.md)
- [Native Suite (Human in the Loop Approval Flow)](./01-native-suite.md)
- [Node Roles & Auth Decisions](../node-roles-and-auth/README.md)
