# 05 — Secrets, Sandbox Testing & Lifecycle Publishing

Before an integration is released to hundreds of organizations, it must be thoroughly tested, fortified with encrypted environment secrets, validated in beta, and reviewed by platform administrators.

---

## 1. Overview Tab & Environment Secrets (`{{common.KEY}}`)

### Streamlined 2-Step Overview Structure
The **Overview & Secrets** tab (`/developer/apps/[appId]?tab=overview`) uses an intuitive two-step accordion:
- **Step 1: App Identity & Details**:
  - App Logo (SVG/PNG upload up to 25KB, with custom fallback monogram).
  - App Display Name, URL-friendly Slug, and Short Tagline.
  - Primary Category (e.g. `CRM`, `Lead Capture`, `Dev Tools`).
  - Full Description & Use Cases (minimum 20 characters required for pre-flight validation).
  *(Note: Standalone Base API URL and website inputs were removed from the Overview UI to avoid redundancy with action endpoint definitions).*
- **Step 2: Environment Secrets & Common Data**:
  - Encrypted key-value vault for workspace-level credentials, OAuth Client Secrets, and signing keys.

### Adding and Managing Secrets
- **Variable Key**: Uppercase identifier (e.g. `CLIENT_SECRET`, `WEBHOOK_SIGNING_KEY`, `BASE_API_KEY`).
- **Secret Value**: Confidential token. The field includes a visual toggle (`Eye` / `EyeOff`) to mask or reveal values.
- **Description / Reference**: Note describing which environment this secret applies to.
- **Reference Syntax**: Automatically available across all tabs as:
  ```
  {{common.VARIABLE_KEY}}
  ```

### Zero-Code Variable Injection
Any secret stored here can be referenced in:
1. **OAuth 2.0 Credentials**: Set Client Secret to `{{common.CLIENT_SECRET}}`.
2. **Action HTTP Headers**: Set `Authorization` header to `Bearer {{common.API_KEY}}`.
3. **Endpoint URLs / Parameters**: Reference `{{common.SECRET_KEY}}` directly in form fields without exposing plaintext tokens in client bundles.

---

## 2. Testing & Sandbox Engine

The **Testing & Sandbox** tab allows the app developer to test any configured trigger or action in an isolated sandbox before inviting beta testers.

### Interactive Debugger Features
1. **Select Operation**: Choose any configured action or trigger from the dropdown.
2. **Input Test Values**: Enter mock data into the action's visual form fields.
3. **Run Test Request**: Click **Run Live Test**.
4. **Execution Metrics**:
   - HTTP Status: `200 OK`
   - Latency: e.g. `138 ms`
   - Output Variable Pills: Displays each extracted field alongside a **Copy Variable** button that copies the exact workflow token (`{{step.action_key.field_key}}`).

---

## 3. Sharing & Private Beta Distribution

The **Sharing & Testers** tab allows authors to distribute their connector privately to select team members or external beta customers before public catalog listing.

### Beta Access Controls
- **Private Beta Invite Link**:
  - URL format: `https://automate-workflows.com/developer/invite/[token]`
  - Equipped with a **Copy Link** button and a **Regenerate Token** button to invalidate old links if leaked.
- **Max Beta Testers Quota**:
  - Numerical limit restricting how many users can accept the invite link (e.g. 50 or 100 testers).
- **Manual Beta Testers List**:
  - Enter email addresses to grant immediate, direct access.
  - Displays invitation status (`Active`, `Accepted`, `Revoked`) and date accepted.

### Tester Onboarding Flow
When an invited tester clicks the link, they land on the dedicated onboarding screen (`/developer/invite/[token]`):
- Shows app logo, name, author, and capabilities.
- Clicking **Accept Invite & Install App** adds the connector to their workspace's available integrations library.

---

## 4. Pre-Flight Validation & Submission

The **Publish & Review** tab ensures that connectors meet high security, stability, and UX standards before reaching platform users.

### Automated Pre-Flight Checklist
Before submission is unlocked, the platform executes automated validation:
1. **App Logo**: SVG or high-resolution PNG provided (≤ 25KB).
2. **App Details**: App Name, valid Slug, and Description with at least 20 characters.
3. **Authentication**: Auth scheme configured with a valid connection test endpoint.
4. **Capabilities**: Contains at least one valid Trigger or Action.
5. **Secure Endpoints**: All API URLs enforce HTTPS.

### Reviewer Sandbox Credentials
To enable the platform security team to verify the integration, the author provides sandbox test credentials:
- **Test Account Username/Email**: Dedicated sandbox login.
- **Test Account Password/API Key**: Test API token.
- **Environment URL**: Staging or sandbox API endpoint (e.g. `https://sandbox-api.acme.com`).
- **Reviewer Notes**: Special instructions, test account constraints, or 2FA bypass codes.

Submitting the form transitions the app status to **In Review** (`in_review`).

---

## 5. Admin Review Console (`/developer/admin`)

Platform administrators use the **Admin Review Console** to audit submitted connectors:

### Reviewer Inspection Drawer
Clicking **Inspect & Audit** on any application opens the right-hand **Admin Inspection Drawer** (`w-[820px]`):
1. **Application Overview**: Name, author, version, and capabilities breakdown.
2. **Reviewer Sandbox Credentials**: Rendered in a clean, neutral slate card (distracting blue highlights and borders have been removed).
3. **Run Live Verification Test**:
   - Styled as a clean `variant="secondary"` button.
   - Executes an automated synthetic connection test against the author's sandbox URL.
   - Verifies SSL handshake with **TLS 1.3**.
   - Confirms HTTP 200 responses.
4. **Decision Workflow**:
   - **Request Changes**: Rejects submission with actionable feedback notes. App transitions to `changes_requested`.
   - **Approve Connector**: Approves app to `public_beta`. It immediately appears in the general App Catalog.
   - **Promote to Verified Partner**: Styled as a clean `variant="secondary"` action that promotes the app to `published` (Verified Partner status) with verified badges across the marketplace.
