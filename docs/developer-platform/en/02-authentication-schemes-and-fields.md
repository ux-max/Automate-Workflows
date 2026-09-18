# 02 — Authentication Schemes & Field Specifications

The Authentication engine ensures that end-user credentials (API keys, OAuth tokens, passwords) are gathered cleanly, verified against live API endpoints, encrypted at rest, and injected automatically into every Trigger and Action execution.

In the App Builder, authentication is organized into **4 Sequential Steps**:
- **Step 1**: Select Authentication Type
- **Step 2**: Configuration (OAuth 2.0, Parameters, or Basic Auth)
- **Step 3**: User Credentials (Visual Fields for End-Users)
- **Step 4**: Connection Verification & Label Templating *(Auto-hidden when No Auth is selected)*

---

## 1. Supported Authentication Schemes

The platform supports five standardized authentication schemes with unified blue line icons:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Authentication Schemes                            │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. OAuth 2.0                   │ User authorization redirect code flow │
│ 2. Parameters                  │ Custom Query/Path/Body parameter rows │
│ 3. Bearer Token                │ Header Bearer token + Multi-Auth      │
│ 4. Basic Authentication        │ Base64 username:password headers      │
│ 5. No Authentication           │ Open public APIs (hides Steps 2, 3, 4)│
└────────────────────────────────┴───────────────────────────────────────┘
```

> [!NOTE]
> In the Create Custom App drawer and AuthTab Step 1, all auth options use standardized blue line icons (`Globe`, `Key`, `Lock`, `ShieldCheck`), matching the platform's visual design system. Legacy API Key options have been consolidated under **Parameters**.

---

## 2. Deep Dive: Scheme 1 — OAuth 2.0 (User Authorization)

### Overview & Working
OAuth 2.0 handles user-level authorization without the end-user ever revealing their account password to Automate Workflows.
1. When an end-user connects their account in a workflow, Automate Workflows launches a popup window directing them to the service's **Authorization URL**.
2. The user consents to the requested scopes.
3. The third-party service redirects back to Automate Workflows' Redirect/Callback URL with an authorization code (`?code=XYZ`).
4. Automate Workflows exchanges the authorization code for an `access_token` (and `refresh_token`) via a `POST` request to the **Access Token URL**.
5. When the `access_token` expires, Automate Workflows uses the `refresh_token` to silently obtain a new token without disturbing the user.

### Step 2 Input Fields & Specifications

| Field Name | Technical Key | Where to Find It | Purpose & Under-the-Hood Behavior |
| :--- | :--- | :--- | :--- |
| **Authorization URL** | `authorizeUrl` | 3rd Party Developer Console (e.g. `https://accounts.google.com/o/oauth2/v2/auth`) | The browser endpoint where the user is redirected to log in and approve application permissions. |
| **Access Token URL** | `accessTokenUrl` | 3rd Party API Documentation | The backend endpoint where Automate Workflows sends a `POST` request containing `client_id`, `client_secret`, `code`, and `grant_type=authorization_code`. |
| **Refresh URL** | `refreshUrl` (Optional) | 3rd Party API Documentation (Often identical to Access Token URL) | The endpoint invoked with `grant_type=refresh_token` to silently regenerate an access token upon expiry. |
| **Client ID** | `clientId` | Generated in 3rd Party App Portal when creating an OAuth app | Public identifier representing your connector application. Can reference `{{common.CLIENT_ID}}`. |
| **Client Secret** | `clientSecret` | Generated in 3rd Party App Portal alongside Client ID | Confidential key proving application identity. Best practice: reference `{{common.CLIENT_SECRET}}` from Environment Secrets so it is never exposed in plaintext. |
| **Scopes** | `scopes` | 3rd Party API Documentation | Space or comma-delimited permissions requested from the user (e.g. `crm.objects.contacts.read crm.objects.contacts.write`). |
| **PKCE Enabled** | `pkceEnabled` | API Security Guidelines | *Proof Key for Code Exchange*. Generates a dynamic `code_verifier` and SHA-256 `code_challenge` for modern single-page or high-security OAuth2 servers. |
| **Redirect / Callback URL** | `redirectUri` | System-Generated (`https://automate-workflows.com/api/auth/callback`) | Copy this URL and paste it into the **Allowed Redirect URIs** whitelist in your 3rd-party developer console. |

---

## 3. Deep Dive: Scheme 2 — Parameters (Custom Auth)

### Overview & Working
The **Parameters** scheme is designed for APIs that require authentication tokens, API keys, organization slugs, account IDs, or subdomains passed via **Query Parameters**, **Request Body**, or **URL Path segments**.

### Step 2 Configurations

#### `Set Body/Query/Path Parameters` Checkbox
When enabled, developers visually construct parameter rows that define what information the connector needs:

- **Parameter Key**: The exact parameter name expected by the API (e.g. `api_key`, `access_token`, `tenant_id`, `subdomain`).
- **Parameter Settings Drawer (Gear Icon ⚙)**:
  - **Display Label**: Human-readable label shown to the end-user (e.g. `Secret API Token`, `Account Subdomain`).
  - **Field Type**:
    - `Text (String)`: Standard text input.
    - `Password`: Masked input with bullet characters (for sensitive keys).
    - `Number`: Enforces integer or floating-point values.
    - `Boolean`: Renders a toggle switch.
    - `Dropdown`: Renders a select list with predefined values.
  - **Placeholder Text**: Example format shown inside the empty field (e.g. `key_live_••••••••`).
  - **Help Instruction**: Explanatory text beneath the input guiding the user on where to copy the key from their account settings.
  - **Required Field Toggle**: If checked, workflow execution blocks if the user leaves this field blank.
- **Row Operations**:
  - **Duplicate (`❐+`)**: Duplicates the parameter row with all drawer settings intact.
  - **Reorder (`⋮⋮`)**: Drag-and-drop handles to control field display order.
  - **Delete (`🗑`)**: Removes the parameter row.

> [!IMPORTANT]
> Custom HTTP Headers in Step 2 of Authentication were removed to maintain a clean, standardized configuration flow. If an API requires specific custom request headers (like `X-Version` or `Accept`), they are configured inside the **Actions** tab under **HTTP Headers**.

---

## 4. Deep Dive: Scheme 3 — Bearer Token

### Overview & Working
Bearer Token authentication transmits an API secret key, Personal Access Token (PAT), or JWT in the HTTP request header formatted as:
```http
Authorization: Bearer <user_token>
```
The previous rich-text configuration card has been removed in favor of a clean, single-click setup.

### Multi-Auth Feature: `Enable Parameters Auth (Multi-Auth)`
In modern SaaS architectures (such as Automate Workflows, Notion, Stripe), many APIs require **both** a Bearer token in the header **and** tenant/account identifiers in the URL or query string.
- When `Enable Parameters Auth (Multi-Auth)` is checked in Step 1:
  - Automate Workflows automatically attaches `Authorization: Bearer <user_token>` to every request.
  - Step 2 unlocks **Set Body/Query/Path Parameters**, allowing the developer to collect additional parameters (e.g. `account_id`, `workspace_slug`, `region`) and pass them dynamically in API calls.
- When unchecked:
  - Only the Bearer Token is collected and sent in the header.

---

## 5. Deep Dive: Scheme 4 — Basic Authentication

### Overview & Working
Basic Authentication sends credentials as a Base64-encoded string in the `Authorization` header:
```http
Authorization: Basic base64(username:password)
```

### Fields in Step 2 & 3
- **Username Label**: Custom label for the first field (e.g. `API Username`, `Account Email`, `API Key ID`).
- **Password Label**: Custom label for the second field (e.g. `API Password`, `Secret Key`, `Account Token`).
- **Help Instructions**: Guidance text explaining where to generate API user credentials in the target software.

---

## 6. Deep Dive: Scheme 5 — No Authentication (Public API)

### Overview & Working
For open public APIs (e.g., public weather data, currency exchange rate feeds, public blockchain lookups) or internal mock endpoints that do not require credentials:
- Selecting **No Authentication** automatically hides **Step 2 (Configuration)**, **Step 3 (User Credentials)**, and **Step 4 (Connection Verification & Label Templating)**.
- Users can immediately build Triggers and Actions without being prompted for connection accounts.

---

## 7. Step 4: Connection Verification & Label Templating

Except for "No Authentication" (where it is hidden), every authentication scheme includes Step 4 to ensure credentials are valid before saving.

### 1. Connection Verification Endpoint
- **HTTP Method**: `GET` or `POST` (typically `GET`).
- **Test Endpoint URL**: A lightweight endpoint that returns user identity or account profile information (e.g. `https://api.example.com/v1/users/me`, `https://api.example.com/v1/account`).
- **Expected Status Code**: Typically `200` (or `201`/`204`).
- **Under the Hood Execution**: When an end-user clicks **Connect Account**, Automate Workflows sends a live request with their entered credentials to this URL. If it receives the expected status, the connection is marked **Active**. If it receives `401 Unauthorized` or `403 Forbidden`, the user is prompted to correct their credentials.

### 2. Connection Label Template
- **Format**: Dynamic mustache syntax e.g. `{{email}} ({{account_id}})` or `{{workspace_name}}`.
- **Purpose**: When a user connects multiple accounts to the same app (e.g. personal vs. work CRM account), Automate Workflows uses this template to display recognizable names in dropdown account selectors.
