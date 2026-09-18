# 08 — Generic Connectors Nodes

> Universal webhook and HTTP request connectors for integrating with any external service.

---

## 🔗 Webhook — Catch Hook

| Property | Value |
|----------|-------|
| **App ID** | `webhook-catch` |
| **Icon** | `Webhook` |
| **Category** | Generic Connectors |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Generates unique unguessable URL per workflow. Field list auto-detected. |

### ⚡ Triggers (1)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `catch_raw_webhook` | Webhook Received (POST/GET) | Listens for raw JSON payload at unique endpoint URL | Instant |

### ▶️ Actions

> This node has **no actions**. It serves exclusively as a trigger to receive incoming webhooks from external systems.

### How It Works

1. **Unique Endpoint URL**: Generates a dedicated webhook endpoint (e.g. `https://connect.automateworkflows.com/webhook-listener/webhook/wh_step_1_webhook-catch`) with 1-click clipboard copy.
2. **Simple Response (Auto-Flattening)**:
   * **Simple (Yes - Recommended)**: Automatically flattens nested JSON hierarchies into clean tokens like `{{step_1.customer_email}}` or `{{step_1.payload_payment_amount}}`.
   * **Advance (No)**: Keeps raw nested objects and arrays intact for code execution and advanced routing.
3. **1-Click Test Simulation**: Test variables and data mapping immediately with the **Simulate Test Event** button without waiting for third-party dispatches.
4. **Data Mapping**: All parsed fields instantly become available as variable chips across downstream action steps.

---

## 🌐 HTTP Request — Send

| Property | Value |
|----------|-------|
| **App ID** | `http-request` |
| **Icon** | `Globe` |
| **Category** | Generic Connectors |
| **Auth Type** | None |
| **Sync Mode** | Instant |
| **Notes** | Configure GET/POST/PUT/DELETE, headers, auth, and JSON body directly. |

### ⚡ Triggers

> This node has **no triggers**. It is used exclusively as an action step to call external APIs.

### ▶️ Actions (3)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `send_custom_http` | Custom API Request (GET/POST/PUT/DELETE) | Calls any external API endpoint and returns parsed JSON |
| 2 | `send_graphql_request` | Send GraphQL Query or Mutation | Dispatches GraphQL request with variables |
| 3 | `send_multipart_form` | Send Multipart Form Data (File Upload) | Dispatches form-data payload with file attachment |

### How It Works

1. **Configure Method**: Choose HTTP method (GET, POST, PUT, PATCH, DELETE)
2. **Set URL**: Enter the target API endpoint, using variables from previous steps
3. **Add Authentication**: Select from Bearer Token, Basic Auth, API Key Header, or None
4. **Set Body**: Provide JSON request payload with variable mappings
5. **Custom Parameters & Headers**: Define custom HTTP headers (`Idempotency-Key`, `X-Correlation-ID`, `X-Tenant-ID`) or query string parameters with full `{{step_N.var}}` mapping support (see [Custom Parameters & Headers](./11-custom-parameters-and-headers.md)).
6. **Parse Response**: Returned JSON is auto-parsed and made available as step output variables

---

*← [Previous: Support](./07-support.md) | [Back to Index](./README.md) | [Next: Flow Control →](./09-flow-control.md)*
