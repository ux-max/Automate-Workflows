# Automate Workflows — Developer Platform Documentation

Welcome to the comprehensive, in-depth documentation for the **Automate Workflows Developer Platform** (also known as **"Create Custom App"**).

This platform enables engineers, SaaS vendors, and workflow automation specialists to build, configure, test, and publish custom visual connectors without writing brittle glue code or running bespoke server infrastructure.

---

## 🌟 Latest Platform & UX Enhancements (v2.0)

1. **Step-by-Step "How to Use" Guidance Modals**: Every tab, configuration drawer, and security dialog contains structured 3-part guidance (*What this does*, *How Developer Sets It Up*, and *How End-Users Experience It*).
2. **Full-Width Responsive UI**: Form fields and data tables span the complete workspace width without artificial container bottlenecks.
3. **Ghost Icon Action Controls**: Uncluttered, compact icon-only action bars across all tabs.
4. **Comprehensive In-Built Actions Architecture**:
   - 6 specialized Inbuilt Action Types (`dropdown_and_custom_fields`, `multi_step`, `app_auth_validator`, `webhook_validator`, `delete_webhook`, `delete_connection`).
   - 3 Multi-Step Execution Timings (`each_execution`, `post_webhook_setup`, `post_webhook_trigger_event`).
   - Active Dependency Graph with deletion protection preventing accidental breaks.
   - HTTP Response Header extraction (`Receive Headers` for pagination, links, and locations).
   - Zero Task Credit consumption policy.
5. **Triple-Layer Developer Sandbox**: Live API inspector console, canvas workspace testing, and private beta invite tokens.

---

## 📚 Documentation Structure

The documentation is organized into two complete, standalone language suites:

### 🇬🇧 English Documentation (`/en/`)
Comprehensive, production-grade technical references and architectural specifications:
1. [**01. Platform Overview & Architecture**](./en/01-platform-overview-and-architecture.md)
   - Core concepts, app architecture, catalog hierarchy, and system lifecycle.
2. [**02. Authentication Schemes & Field Specifications**](./en/02-authentication-schemes-and-fields.md)
   - Exhaustive breakdown of all 5 auth schemes: OAuth 2.0, Parameters, Bearer Token, Basic Auth, and No Auth.
   - Every input field, parameter row, connection test URL, and label template.
3. [**03. Triggers: Webhooks & Polling Engine**](./en/03-triggers-webhooks-and-polling.md)
   - Instant Catch Webhooks, REST Hooks (API-based), and Periodic Polling.
   - Live Webhook Listener, deduplication keys, and output variable schemas.
4. [**04. Actions: HTTP Methods, Headers & Dynamic Parameters**](./en/04-actions-http-methods-and-parameters.md)
   - Action operations, HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
   - Reusable Parameter Drawers, Header Drawers, data types, and Zero-JSON test detection.
5. [**05. Environment Secrets, Sandbox Testing & Publishing**](./en/05-secrets-sandbox-and-lifecycle-publishing.md)
   - Secure variable storage (`{{common.KEY}}`), interactive testing sandbox, private beta distribution, and admin audit console.
6. [**06. In-Built Actions, Dynamic Dropdowns & Hierarchical Nesting**](./en/06-inbuilt-actions-and-dynamic-dependencies.md)
   - Deep dive into In-built Actions, dynamic dropdowns, metadata custom field resolvers, and chaining dependent dropdowns.
7. [**07. In-Built Actions: UI/UX Design & Component Implementation Guide**](./en/07-inbuilt-actions-ui-ux-design-and-implementation.md)
   - Complete visual wireframes, drawer layouts, conditional form controls for all 6 types, dependency tree views, and canvas experience.
8. [**08. Displaying & Linking In-Built Actions in the Actions Tab**](./en/08-displaying-and-linking-inbuilt-actions-in-actions-tab.md)
   - How In-built Actions live in the unified Actions Table, filter tabs, dual action buttons, parameter linking, input mapping, and "Used In" reverse lookups.
9. [**09. Complete Master Working Guide to In-Built Actions**](./en/09-complete-inbuilt-actions-working-guide.md)
   - **Master Reference Guide**: End-to-end mechanics, 6 types, multi-step execution timings (`post_webhook_trigger_event`), payload hydration engine, cascading chains, deletion safety blockers, and real-world case studies.

---

### 🇮🇳 Hinglish Documentation (`/hinglish/`)
Aasani se samajhne yogya, detailed Hinglish guide (Hindi + English terminology) har ek builder ke liye:
1. [**01. Platform Overview & Architecture**](./hinglish/01-platform-overview-aur-architecture.md)
   - Developer Platform kya hai, iski zaroorat kyun hai, aur yeh Automate Workflows/Zapier jaise platform se kaise compare karta hai.
2. [**02. Authentication Schemes Aur Har Ek Field Ka Matlab**](./hinglish/02-authentication-schemes-aur-har-field-ki-detail.md)
   - Har ek Auth scheme (OAuth 2.0, Parameters, Bearer Token, Basic Auth, No Auth) ka step-by-step working.
   - Har field kahan se milti hai, kisme kya bharna hai, aur Multi-Auth kya hota hai.
3. [**03. Triggers: Webhooks Aur Polling Deep Dive**](./hinglish/03-triggers-webhooks-aur-polling-deep-dive.md)
   - Instant Catch Webhooks, REST Hook subscription, aur Polling ka practical use case.
   - Webhook Response Capture kaise hota hai aur Output Variables workflow mein kaise use hote hain.
4. [**04. Actions: HTTP Methods, Headers Aur Parameters Ka Working**](./hinglish/04-actions-http-methods-aur-parameters-deep-dive.md)
   - Action kaise banayein, HTTP methods (`POST`, `GET`, etc.), URL endpoints.
   - Parameter Drawer aur Header Drawer ke andar har ek setting ka matlab.
5. [**05. Environment Secrets, Sandbox Testing Aur Publishing Lifecycle**](./hinglish/05-secrets-sandbox-aur-publishing-lifecycle.md)
   - Environment Secrets (`{{common.KEY}}`), Beta Testing Links, Admin Review aur Store Verification.
6. [**06. In-Built Actions, Dynamic Dropdowns Aur Hierarchical Nesting**](./hinglish/06-inbuilt-actions-aur-dynamic-dependencies.md)
   - In-built Actions kya hote hain, Dynamic Dropdowns kaise banate hain, aur ek In-built Action ke andar doosra kaise nest karte hain.
7. [**07. In-Built Actions Ko UI Par Kaise Dikhayein (UI/UX Guide)**](./hinglish/07-inbuilt-actions-ko-ui-par-kaise-dikhayein.md)
   - Developer Platform me Inbuilt Action Drawer ka layout, 6 types ke conditional forms, dependency visualization aur canvas loading states.
8. [**08. Actions Tab Mein In-Built Actions Kaise Dikhayein Aur Use Karein**](./hinglish/08-actions-tab-mein-inbuilt-actions-kaise-use-karein.md)
   - Actions Table me Inbuilt actions ko dikhana, `[IN-BUILT]` badge, dual buttons, Standard Action ke parameter se link karna, aur reverse "Used In" visibility.
9. [**09. In-Built Actions Ka Complete Working Guide (Master Blueprint)**](./hinglish/09-inbuilt-actions-ka-complete-working-guide.md)
   - **Master Guide**: In-built actions ka A to Z working, 6 specialized types, Multi-Step execution timings (`post_webhook_trigger_event`), payload hydration, cascading dropdown chains, zero task credits policy, aur live case studies.

---

## 🚀 Quick Reference: Core URLs

| Resource | Route | Purpose |
| :--- | :--- | :--- |
| **Developer Hub** | `/developer` | Application list (Table & Grid view), Search, Filtering, Create Drawer |
| **App Builder** | `/developer/apps/[appId]` | Multi-tab configuration (Overview, Auth, Triggers, Actions, In-built Actions, Sandbox, Sharing, Publish) |
| **Tester Invite Portal** | `/developer/invite/[token]` | Self-service onboarding for private beta testers |
| **Admin Review Console**| `/developer/admin` | Security audit, live verification tester, Public Beta / Verified partner approvals |

---

*Documentation Version 2.0.0 — Automate Workflows Developer Platform.*
