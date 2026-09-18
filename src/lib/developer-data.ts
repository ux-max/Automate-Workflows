import { DeveloperApp, ValidationItem } from "./developer-types"

export const INITIAL_DEVELOPER_APPS: DeveloperApp[] = [
  {
    id: "app_acme_crm",
    name: "Acme CRM",
    slug: "acme-crm",
    tagline: "High-velocity B2B sales CRM, pipeline deals & customer sync",
    description: "Connect Acme CRM to automate deal stage progression, customer onboarding, and sales rep alert workflows.",
    category: "CRM",
    logoIcon: "Users",
    brandColor: "#6366F1",
    version: "1.2.0",
    status: "public_beta",
    baseApiUrl: "https://api.acmecrm.io/v2",
    websiteUrl: "https://acmecrm.io",
    documentationUrl: "https://docs.acmecrm.io/api",
    privacyPolicyUrl: "https://acmecrm.io/privacy",
    supportEmail: "developers@acmecrm.io",
    author: {
      name: "Acme Product Team",
      email: "api-partners@acmecrm.io",
      company: "Acme Software Corp",
      isVerified: true,
    },
    secrets: [
      { id: "sec_1", key: "CLIENT_ID", value: "acme_client_live_891230", description: "OAuth 2.0 Application Client ID" },
      { id: "sec_2", key: "CLIENT_SECRET", value: "sec_9941a80c2f34e819b", description: "OAuth 2.0 Production Secret Key" }
    ],
    authentication: {
      type: "oauth2",
      oauth2Config: {
        authorizeUrl: "https://app.acmecrm.io/oauth/authorize",
        accessTokenUrl: "https://api.acmecrm.io/oauth/token",
        refreshUrl: "https://api.acmecrm.io/oauth/token",
        clientId: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        scopes: "contacts:read contacts:write deals:read deals:write",
        pkceEnabled: true,
      },
      userFields: [],
      connectionTest: {
        method: "GET",
        url: "https://api.acmecrm.io/v2/me",
        expectedStatus: 200,
      },
      connectionLabelTemplate: "{{email}} ({{account_name}})",
    },
    triggers: [
      {
        id: "trg_new_deal",
        key: "new_deal_created",
        name: "New Deal Created",
        description: "Triggers instantly when a new deal is opened in any pipeline.",
        type: "webhook",
        webhookConfig: {
          setupType: "rest_hook",
          subscribeUrl: "https://api.acmecrm.io/v2/webhooks/subscribe",
          unsubscribeUrl: "https://api.acmecrm.io/v2/webhooks/{{subscription_id}}",
        },
        sampleFields: [
          { key: "deal_id", label: "Deal ID", type: "number", sampleValue: "84920" },
          { key: "deal_name", label: "Deal Name", type: "string", sampleValue: "Enterprise License - Q3" },
          { key: "amount", label: "Deal Value ($)", type: "number", sampleValue: "45000" },
          { key: "stage", label: "Pipeline Stage", type: "string", sampleValue: "Proposal Sent" },
          { key: "owner_email", label: "Sales Rep Email", type: "string", sampleValue: "sarah@acmecrm.io" }
        ],
      }
    ],
    actions: [
      {
        id: "act_create_contact",
        key: "create_contact",
        name: "Create or Update Contact",
        description: "Creates a new contact record or updates an existing contact by email.",
        method: "POST",
        endpointUrl: "https://api.acmecrm.io/v2/contacts",
        headers: [
          { id: "h1", key: "Content-Type", value: "application/json" },
          { id: "h2", key: "Accept", value: "application/json" }
        ],
        inputFields: [
          { id: "f1", key: "email", label: "Contact Email", type: "string", required: true, helpText: "Primary email address of the customer.", placeholder: "lead@company.com" },
          { id: "f2", key: "first_name", label: "First Name", type: "string", required: false, placeholder: "Alex" },
          { id: "f3", key: "last_name", label: "Last Name", type: "string", required: false, placeholder: "Rivera" },
          {
            id: "f4",
            key: "pipeline_id",
            label: "Assign Pipeline",
            type: "dropdown",
            required: true,
            helpText: "Select which pipeline this lead should enter.",
            dropdownConfig: {
              mode: "dynamic",
              dynamicConfig: {
                endpointUrl: "https://api.acmecrm.io/v2/pipelines",
                valueKey: "id",
                labelKey: "name",
              },
            },
          }
        ],
        bodyParameters: [
          { id: "b1", paramName: "email", mappedFieldOrToken: "{{input.email}}" },
          { id: "b2", paramName: "first_name", mappedFieldOrToken: "{{input.first_name}}" },
          { id: "b3", paramName: "last_name", mappedFieldOrToken: "{{input.last_name}}" },
          { id: "b4", paramName: "pipeline_id", mappedFieldOrToken: "{{input.pipeline_id}}" }
        ],
        sampleResponseFields: [
          { key: "id", label: "Contact ID", type: "number", sampleValue: "99102" },
          { key: "status", label: "Sync Status", type: "string", sampleValue: "created" },
          { key: "created_at", label: "Created Timestamp", type: "string", sampleValue: "2026-09-15T09:30:00Z" }
        ],
      }
    ],
    inbuiltActions: [
      {
        id: "inb_1",
        key: "fetch_workspaces",
        name: "Fetch All Workspaces",
        description: "Retrieves all workspaces to populate workspace dropdowns.",
        type: "dropdown_and_custom_fields",
        method: "GET",
        endpointUrl: "https://api.acmecrm.io/v2/workspaces",
        responseArrayPath: "data.workspaces",
        labelKey: "name",
        valueKey: "id",
        receiveHeaders: false,
        usedInActionIds: ["act_create_contact"],
      },
      {
        id: "inb_2",
        key: "fetch_pipelines",
        name: "Fetch Deal Pipelines",
        description: "Retrieves sales pipelines dependent on the selected workspace.",
        type: "dropdown_and_custom_fields",
        method: "GET",
        endpointUrl: "https://api.acmecrm.io/v2/workspaces/{{workspace_id}}/pipelines",
        parentDependencyKey: "workspace_id",
        responseArrayPath: "data.pipelines",
        labelKey: "title",
        valueKey: "pipeline_id",
        receiveHeaders: true,
        nestedSteps: [
          { id: "step_1", inbuiltActionId: "inb_1", saved: true },
        ],
        usedInActionIds: ["act_create_contact"],
      },
      {
        id: "inb_3",
        key: "datacenter_custom_fields",
        name: "Regional Schema & Custom Fields",
        description: "Chains regional datacenter discovery with contact custom field resolution.",
        type: "multi_step",
        method: "GET",
        endpointUrl: "https://api.acmecrm.io/v2/modules/contacts/custom-fields",
        nestedSteps: [
          { id: "step_1", inbuiltActionId: "inb_1", saved: true },
          { id: "step_2", inbuiltActionId: "inb_2", saved: true },
        ],
        multiSteps: [
          {
            id: "step_1",
            name: "Resolve Datacenter Region",
            method: "GET",
            endpointUrl: "https://api.acmecrm.io/v2/account/datacenter",
            outputKey: "datacenter_url",
          },
          {
            id: "step_2",
            name: "Fetch Tenant Custom Properties",
            method: "GET",
            endpointUrl: "{{step1.datacenter_url}}/crm/properties",
            outputKey: "properties",
          },
        ],
        responseArrayPath: "properties",
        labelKey: "label",
        valueKey: "property_name",
        receiveHeaders: false,
      },
      {
        id: "inb_4",
        key: "auth_validator",
        name: "Acme Auth Ping Validator",
        description: "Verifies user API credentials before saving the connection.",
        type: "app_auth_validator",
        method: "GET",
        endpointUrl: "https://api.acmecrm.io/v2/me",
        receiveHeaders: false,
      },
      {
        id: "inb_5",
        key: "delete_deal_webhook",
        name: "Unsubscribe Deal Webhook",
        description: "Tears down registered webhooks when trigger workflows are disabled or deleted.",
        type: "delete_webhook",
        method: "DELETE",
        endpointUrl: "https://api.acmecrm.io/v2/webhooks/{{webhook_id}}",
        linkedTriggerId: "trg_new_deal",
        webhookIdParam: "webhook_id",
        receiveHeaders: false,
      },
    ],
    distribution: {
      inviteToken: "inv_acme_live_9812",
      inviteUrl: "http://localhost:3000/developer/invite/inv_acme_live_9812",
      maxTesters: 200,
      activeInstalls: 68,
      betaTesters: [
        { email: "john@techstart.io", acceptedAt: "2026-09-02", status: "active" },
        { email: "automation@agencygrowth.com", acceptedAt: "2026-09-05", status: "active" }
      ],
    },
    createdAt: "2026-08-20",
    updatedAt: "2026-09-12",
  },
  {
    id: "app_pulse_metrics",
    name: "Pulse Metrics",
    slug: "pulse-metrics",
    tagline: "Real-time product analytics, conversion funnels & error spikes",
    description: "Dispatch custom events, telemetry counters, and trigger workflows when conversion rates drop or errors spike.",
    category: "Dev Tools",
    logoIcon: "Activity",
    brandColor: "#EC4899",
    version: "1.0.0",
    status: "private",
    baseApiUrl: "https://api.pulsemetrics.dev/v1",
    websiteUrl: "https://pulsemetrics.dev",
    documentationUrl: "https://pulsemetrics.dev/docs",
    supportEmail: "support@pulsemetrics.dev",
    author: {
      name: "Marcus Vance",
      email: "marcus@pulsemetrics.dev",
      company: "Pulse Analytics Inc",
      isVerified: false,
    },
    secrets: [
      { id: "sec_p1", key: "DEFAULT_APP_ID", value: "app_prod_90192", description: "Default organization tracking ID" }
    ],
    authentication: {
      type: "parameters",
      parametersConfig: {
        showParameters: true,
        parameters: [
          {
            id: "param_1",
            key: "X-Pulse-API-Key",
            label: "Pulse API Secret Key",
            type: "string",
            required: true,
            placeholder: "Enter parameter",
            helpText: "Found under Project Settings > API Tokens.",
          },
        ],
        showHeaders: false,
        headers: [],
      },
      apiKeyConfig: {
        headerOrQuery: "header",
        paramName: "X-Pulse-API-Key",
        valuePrefix: "",
      },
      userFields: [
        { id: "uf1", key: "apiKey", label: "Pulse API Secret Key", type: "password", required: true, helpText: "Found under Project Settings > API Tokens.", placeholder: "plse_live_••••••••" }
      ],
      connectionTest: {
        method: "GET",
        url: "https://api.pulsemetrics.dev/v1/auth/verify",
        expectedStatus: 200,
      },
      connectionLabelTemplate: "Pulse ({{project_name}})",
    },
    triggers: [
      {
        id: "trg_metric_spike",
        key: "metric_anomaly_detected",
        name: "Metric Anomaly / Spike Detected",
        description: "Triggers when an error rate or conversion metric violates an alert threshold.",
        type: "polling",
        pollingConfig: {
          endpointUrl: "https://api.pulsemetrics.dev/v1/alerts/feed",
          deduplicationField: "alert_id",
          frequencyMinutes: 5,
        },
        sampleFields: [
          { key: "alert_id", label: "Alert ID", type: "string", sampleValue: "alt_84102" },
          { key: "metric_name", label: "Metric Name", type: "string", sampleValue: "Checkout Error Rate" },
          { key: "current_value", label: "Current Value (%)", type: "number", sampleValue: "14.2" },
          { key: "threshold", label: "Threshold (%)", type: "number", sampleValue: "5.0" }
        ],
      }
    ],
    actions: [
      {
        id: "act_track_event",
        key: "track_custom_event",
        name: "Track Custom Event",
        description: "Logs a product telemetry event with custom properties.",
        method: "POST",
        endpointUrl: "https://api.pulsemetrics.dev/v1/events",
        headers: [
          { id: "ph1", key: "Content-Type", value: "application/json" }
        ],
        inputFields: [
          { id: "pf1", key: "user_id", label: "User ID / Distinct ID", type: "string", required: true, placeholder: "usr_99812" },
          { id: "pf2", key: "event_name", label: "Event Name", type: "string", required: true, placeholder: "Upgrade Plan Clicked" },
          { id: "pf3", key: "plan_tier", label: "Plan Tier", type: "string", required: false, placeholder: "Enterprise" }
        ],
        bodyParameters: [
          { id: "pb1", paramName: "user_id", mappedFieldOrToken: "{{input.user_id}}" },
          { id: "pb2", paramName: "event", mappedFieldOrToken: "{{input.event_name}}" },
          { id: "pb3", paramName: "plan_tier", mappedFieldOrToken: "{{input.plan_tier}}" }
        ],
        sampleResponseFields: [
          { key: "status", label: "Ingest Status", type: "string", sampleValue: "queued" },
          { key: "processed_at", label: "Processed At", type: "string", sampleValue: "2026-09-15T10:14:00Z" }
        ],
      }
    ],
    distribution: {
      inviteToken: "inv_pulse_beta_3310",
      inviteUrl: "http://localhost:3000/developer/invite/inv_pulse_beta_3310",
      maxTesters: 50,
      activeInstalls: 9,
      betaTesters: [
        { email: "dev@analyticslab.co", acceptedAt: "2026-09-10", status: "active" }
      ],
    },
    createdAt: "2026-09-01",
    updatedAt: "2026-09-14",
  },
  {
    id: "app_quicksign",
    name: "QuickSign Documents",
    slug: "quicksign-docs",
    tagline: "Legally binding e-signatures, envelope tracking & PDF generation",
    description: "Send agreements for e-signature, track signer completion, and download signed contracts automatically.",
    category: "Productivity",
    logoIcon: "FileCheck2",
    brandColor: "#10B981",
    version: "1.0.1",
    status: "in_review",
    baseApiUrl: "https://api.quicksign.io/v1",
    websiteUrl: "https://quicksign.io",
    documentationUrl: "https://quicksign.io/developers",
    privacyPolicyUrl: "https://quicksign.io/privacy",
    supportEmail: "integrations@quicksign.io",
    author: {
      name: "Elena Rostova",
      email: "elena@quicksign.io",
      company: "QuickSign Global",
      isVerified: true,
    },
    secrets: [
      { id: "sec_q1", key: "WEBHOOK_SECRET", value: "whsec_live_994821a", description: "HMAC signature secret" }
    ],
    authentication: {
      type: "bearer_token",
      apiKeyConfig: {
        headerOrQuery: "header",
        paramName: "Authorization",
        valuePrefix: "Bearer ",
      },
      userFields: [
        { id: "quf1", key: "token", label: "QuickSign API Bearer Token", type: "password", required: true, helpText: "Generate from QuickSign Dashboard > Security > API Keys." }
      ],
      connectionTest: {
        method: "GET",
        url: "https://api.quicksign.io/v1/account",
        expectedStatus: 200,
      },
      connectionLabelTemplate: "QuickSign ({{company_name}})",
    },
    triggers: [
      {
        id: "trg_envelope_signed",
        key: "envelope_completed",
        name: "Document Envelope Fully Signed",
        description: "Fires in real-time when all required parties complete signing the document.",
        type: "webhook",
        webhookConfig: {
          setupType: "instant_catch",
        },
        sampleFields: [
          { key: "envelope_id", label: "Envelope ID", type: "string", sampleValue: "env_991820" },
          { key: "document_title", label: "Document Title", type: "string", sampleValue: "Master Services Agreement 2026.pdf" },
          { key: "signer_email", label: "Signer Email", type: "string", sampleValue: "client@enterprise.com" },
          { key: "signed_pdf_url", label: "Signed PDF Download Link", type: "string", sampleValue: "https://cdn.quicksign.io/signed/env_991820.pdf" }
        ],
      }
    ],
    actions: [
      {
        id: "act_send_envelope",
        key: "send_envelope_for_signature",
        name: "Send Envelope for Signature",
        description: "Dispatches a contract template to designated recipient emails.",
        method: "POST",
        endpointUrl: "https://api.quicksign.io/v1/envelopes",
        headers: [
          { id: "qh1", key: "Content-Type", value: "application/json" }
        ],
        inputFields: [
          { id: "qf1", key: "title", label: "Document Subject", type: "string", required: true, placeholder: "Please sign MSA" },
          { id: "qf2", key: "signer_email", label: "Signer Email", type: "string", required: true, placeholder: "ceo@client.com" },
          { id: "qf3", key: "signer_name", label: "Signer Full Name", type: "string", required: true, placeholder: "Michael Scott" }
        ],
        bodyParameters: [
          { id: "qb1", paramName: "title", mappedFieldOrToken: "{{input.title}}" },
          { id: "qb2", paramName: "signer_email", mappedFieldOrToken: "{{input.signer_email}}" },
          { id: "qb3", paramName: "signer_name", mappedFieldOrToken: "{{input.signer_name}}" }
        ],
        sampleResponseFields: [
          { key: "envelope_id", label: "Envelope ID", type: "string", sampleValue: "env_new_88190" },
          { key: "status", label: "Envelope Status", type: "string", sampleValue: "sent" }
        ],
      }
    ],
    distribution: {
      inviteToken: "inv_quicksign_review_8842",
      inviteUrl: "http://localhost:3000/developer/invite/inv_quicksign_review_8842",
      maxTesters: 100,
      activeInstalls: 32,
      betaTesters: [],
    },
    reviewSubmission: {
      submittedAt: "2026-09-14T08:00:00Z",
      reviewerTestAccount: {
        usernameOrEmail: "sandbox.reviewer@quicksign.io",
        passwordOrKey: "token_sandbox_test_reviewer_77192",
        environmentUrl: "https://sandbox.quicksign.io",
      },
      reviewerNotes: "Please test with sandbox reviewer token. Pre-populated with 2 templates.",
    },
    createdAt: "2026-08-28",
    updatedAt: "2026-09-14",
  }
]

const STORAGE_KEY = "automate_developer_apps"

export function getDeveloperApps(): DeveloperApp[] {
  if (typeof window === "undefined") {
    return INITIAL_DEVELOPER_APPS
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEVELOPER_APPS))
      return INITIAL_DEVELOPER_APPS
    }
    return JSON.parse(raw)
  } catch (e) {
    return INITIAL_DEVELOPER_APPS
  }
}

export function getDeveloperAppById(id: string): DeveloperApp | undefined {
  const apps = getDeveloperApps()
  return apps.find((app) => app.id === id || app.slug === id)
}

export function saveDeveloperApp(app: DeveloperApp): void {
  if (typeof window === "undefined") return
  const apps = getDeveloperApps()
  const index = apps.findIndex((a) => a.id === app.id)
  let updated: DeveloperApp[]
  if (index >= 0) {
    updated = [...apps]
    updated[index] = { ...app, updatedAt: new Date().toISOString().split("T")[0] }
  } else {
    updated = [...apps, app]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function deleteDeveloperApp(id: string): void {
  if (typeof window === "undefined") return
  const apps = getDeveloperApps()
  const updated = apps.filter((a) => a.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function submitAppForReview(id: string, submission: DeveloperApp["reviewSubmission"]): void {
  const app = getDeveloperAppById(id)
  if (!app) return
  const updated: DeveloperApp = {
    ...app,
    status: "in_review",
    reviewSubmission: {
      ...submission,
      submittedAt: new Date().toISOString(),
    },
  }
  saveDeveloperApp(updated)
}

export function adminReviewApp(
  id: string,
  decision: "approved" | "changes_requested",
  feedbackNotes?: string,
  reviewerName: string = "Platform Admin"
): void {
  const app = getDeveloperAppById(id)
  if (!app) return
  const updated: DeveloperApp = {
    ...app,
    status: decision === "approved" ? "public_beta" : "changes_requested",
    reviewSubmission: {
      ...app.reviewSubmission,
      decision,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      feedbackNotes,
    },
  }
  saveDeveloperApp(updated)
}

export function validateAppPreFlight(app: DeveloperApp): ValidationItem[] {
  const items: ValidationItem[] = [
    {
      id: "val_name",
      title: "App Name & Description",
      description: "App has clear title and description (> 20 characters).",
      status: app.name && app.description && app.description.length >= 20 ? "pass" : "fail",
      remediation: "Provide an app name and description of at least 20 characters.",
    },
    {
      id: "val_logo",
      title: "App Icon / Brand Assets",
      description: "App defines an icon and brand accent color.",
      status: app.logoIcon && app.brandColor ? "pass" : "fail",
      remediation: "Pick a brand accent color and app icon.",
    },
    {
      id: "val_base_url",
      title: "HTTPS API Security",
      description: "Base API URL is defined and enforces secure HTTPS protocol.",
      status: app.baseApiUrl && app.baseApiUrl.startsWith("https://") ? "pass" : "fail",
      remediation: "Base API URL must start with 'https://' for end-to-end encryption.",
    },
    {
      id: "val_auth_test",
      title: "Connection Test Endpoint",
      description: "App specifies an active test URL to verify credentials on account connection.",
      status: app.authentication.connectionTest && app.authentication.connectionTest.url ? "pass" : "fail",
      remediation: "Specify a connection test endpoint (e.g. GET /me) in the Authentication tab.",
    },
    {
      id: "val_triggers_actions",
      title: "Triggers & Actions Completeness",
      description: "App provides at least one active Trigger or Action node.",
      status: app.triggers.length > 0 || app.actions.length > 0 ? "pass" : "fail",
      remediation: "Configure at least one Trigger or Action in the builder tabs.",
    },
    {
      id: "val_field_labels",
      title: "Input Field Human Labels",
      description: "All action input fields have human-readable labels and descriptions.",
      status:
        app.actions.every((act) => act.inputFields.every((f) => f.label && f.label.trim().length > 0))
          ? "pass"
          : "fail",
      remediation: "Ensure all input fields in your actions have clear labels.",
    },
  ]
  return items
}

export function getAppByInviteToken(token: string): DeveloperApp | undefined {
  const apps = getDeveloperApps()
  return apps.find((a) => a.distribution.inviteToken === token)
}

export function acceptInviteToken(token: string, userEmail: string = "user@company.com"): boolean {
  const app = getAppByInviteToken(token)
  if (!app) return false
  const alreadyIn = app.distribution.betaTesters.some((t) => t.email === userEmail)
  if (!alreadyIn) {
    const updated: DeveloperApp = {
      ...app,
      distribution: {
        ...app.distribution,
        activeInstalls: app.distribution.activeInstalls + 1,
        betaTesters: [
          ...app.distribution.betaTesters,
          { email: userEmail, acceptedAt: new Date().toISOString().split("T")[0], status: "active" },
        ],
      },
    }
    saveDeveloperApp(updated)
  }
  return true
}

export function developerAppsToAppConnections(devApps: DeveloperApp[]): any[] {
  return devApps.map((dev) => ({
    id: dev.id,
    name: dev.name,
    icon: dev.logoIcon || "Code2",
    category: dev.category || "My Custom Apps (Dev)",
    authType:
      dev.authentication.type === "oauth2"
        ? "OAuth 2.0"
        : dev.authentication.type === "api_key"
        ? "API Key"
        : "None",
    triggers: dev.triggers.map((t) => ({
      id: t.key,
      name: t.name,
      description: t.description,
      type: t.type === "webhook" ? "instant" : "polling",
    })),
    actions: dev.actions.map((a) => ({
      id: a.key,
      name: a.name,
      description: a.description,
    })),
    syncMode: dev.triggers.some((t) => t.type === "webhook") ? "Webhook" : "Polling",
    notes: `Custom Developer App (${dev.status === "published" || dev.status === "public_beta" ? "Verified Beta" : "Private Dev"})`,
    isDeveloperApp: true,
    brandColor: dev.brandColor,
    status: dev.status,
  }))
}
