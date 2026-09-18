export interface SchemaOption {
  value: string
  label: string
}

export interface ActionField {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "multi-select" | "number" | "datetime" | "boolean" | "code" | "key-value"
  placeholder?: string
  required?: boolean
  helperText?: string
  options?: SchemaOption[]
  supportsMapping?: boolean
  defaultValue?: any
  dependsOn?: string
}

export interface AppActionSchema {
  appId: string
  actionId: string
  actionName: string
  description: string
  fields: ActionField[]
  sampleOutput: Record<string, any>
}

// -------------------------------------------------------------
// 1. SAAS & INTEGRATION SCHEMAS
// -------------------------------------------------------------

export const CALENDLY_BOOKING_SCHEMA: AppActionSchema = {
  appId: "calendly",
  actionId: "get_user_availability",
  actionName: "Create or Verify Booking",
  description: "Creates an invitee booking record and schedules meeting in Calendly",
  fields: [
    {
      id: "event_type",
      label: "Event Type / Meeting Slug",
      type: "select",
      required: true,
      helperText: "Choose the Calendly event type to schedule or verify",
      options: [
        { value: "30min", label: "30 Minute Product Demo & Walkthrough" },
        { value: "60min", label: "60 Minute Strategy & Onboarding Call" },
        { value: "15min", label: "15 Minute Quick Sync / Support Discovery" },
        { value: "custom", label: "Executive VIP Consultation (Private)" }
      ],
      supportsMapping: true
    },
    {
      id: "invitee_name",
      label: "Invitee Full Name",
      type: "text",
      required: true,
      placeholder: "e.g. Alex Johnson or {{step_1.name}}",
      helperText: "The full name of the attendee who is booking the event",
      supportsMapping: true
    },
    {
      id: "invitee_email",
      label: "Invitee Email Address",
      type: "text",
      required: true,
      placeholder: "e.g. alex@company.com or {{step_1.email}}",
      helperText: "Calendar invite & confirmation will be sent to this email",
      supportsMapping: true
    },
    {
      id: "event_start_time",
      label: "Event Start Time",
      type: "datetime",
      required: true,
      placeholder: "YYYY-MM-DDTHH:mm:ssZ or {{step_1.start_time}}",
      helperText: "Target timestamp in ISO 8601 format",
      supportsMapping: true
    },
    {
      id: "event_end_time",
      label: "Event End Time",
      type: "datetime",
      placeholder: "YYYY-MM-DDTHH:mm:ssZ or {{step_1.end_time}}",
      helperText: "Optional: Leave blank to auto-calculate from event type duration",
      supportsMapping: true
    },
    {
      id: "timezone",
      label: "Invitee Timezone",
      type: "select",
      required: true,
      defaultValue: "UTC",
      helperText: "Timezone in which the event notification will be delivered",
      options: [
        { value: "UTC", label: "UTC (Coordinated Universal Time)" },
        { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
        { value: "America/New_York", label: "America/New_York (EST -5:00)" },
        { value: "America/Los_Angeles", label: "America/Los_Angeles (PST -8:00)" },
        { value: "Europe/London", label: "Europe/London (BST / GMT)" }
      ],
      supportsMapping: true
    },
    {
      id: "meeting_location",
      label: "Meeting Location",
      type: "select",
      helperText: "Select conference room or auto-generate video conferencing link",
      options: [
        { value: "google_meet", label: "Google Meet Video Call" },
        { value: "zoom", label: "Zoom Conferencing Integration" },
        { value: "ms_teams", label: "Microsoft Teams Meeting" },
        { value: "phone_call", label: "Outbound Phone Call (Host calls invitee)" }
      ],
      supportsMapping: true
    },
    {
      id: "guest_emails",
      label: "Additional Guest Emails",
      type: "text",
      placeholder: "e.g. colleague1@co.com, colleague2@co.com",
      helperText: "Comma-separated list of secondary attendees to invite",
      supportsMapping: true
    },
    {
      id: "custom_questions_answers",
      label: "Custom Booking Notes / Questions",
      type: "textarea",
      placeholder: "What would you like to focus on during this call? {{step_1.message}}",
      helperText: "Answers will be visible on the host's calendar invite",
      supportsMapping: true
    },
    {
      id: "phone_reminder",
      label: "Text Reminder Phone Number",
      type: "text",
      placeholder: "e.g. +1 555-0199 or {{step_1.phone}}",
      helperText: "Sends SMS reminder 1 hour prior to scheduled session",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    event_id: "evt_cal_98234",
    status: "active",
    start_time: "2026-09-10T14:30:00Z",
    end_time: "2026-09-10T15:00:00Z",
    meet_url: "https://meet.google.com/abc-defg-hij",
    invitee_name: "Alex Johnson",
    invitee_email: "alex@company.com"
  }
}

export const GOOGLE_CALENDAR_SCHEMA: AppActionSchema = {
  appId: "google-calendar",
  actionId: "create_event",
  actionName: "Create Calendar Event",
  description: "Adds an event to Google Calendar with optional video link",
  fields: [
    {
      id: "calendar_id",
      label: "Calendar",
      type: "select",
      required: true,
      helperText: "Choose target calendar under your Google account",
      options: [
        { value: "primary", label: "Primary Calendar (Default)" },
        { value: "sales_team", label: "Sales & Demo Calendar" },
        { value: "support_ops", label: "Support Shifts & On-Call" }
      ],
      supportsMapping: true
    },
    {
      id: "event_title",
      label: "Event Title / Summary",
      type: "text",
      required: true,
      placeholder: "e.g. Client Onboarding with {{step_1.name}}",
      helperText: "Title visible on calendar invites",
      supportsMapping: true
    },
    {
      id: "start_time",
      label: "Start Date & Time",
      type: "datetime",
      required: true,
      placeholder: "2026-09-10T10:00:00 or {{step_1.date}}",
      helperText: "Start time of the event",
      supportsMapping: true
    },
    {
      id: "end_time",
      label: "End Date & Time",
      type: "datetime",
      required: true,
      placeholder: "2026-09-10T11:00:00",
      helperText: "End time of the event",
      supportsMapping: true
    },
    {
      id: "description",
      label: "Description / Agenda",
      type: "textarea",
      placeholder: "Meeting details, discussion items, and agenda...",
      supportsMapping: true
    },
    {
      id: "attendees",
      label: "Attendee Emails",
      type: "text",
      placeholder: "colleague@domain.com, {{step_1.email}}",
      helperText: "Invited participants will receive an email invitation",
      supportsMapping: true
    },
    {
      id: "add_google_meet",
      label: "Generate Google Meet Link",
      type: "boolean",
      defaultValue: true,
      helperText: "Automatically attach a Google Meet video conference link"
    }
  ],
  sampleOutput: {
    event_id: "gcal_evt_7721",
    html_link: "https://calendar.google.com/event?eid=gcal_evt_7721",
    hangout_link: "https://meet.google.com/xyz-qwer-tyu",
    status: "confirmed"
  }
}

export const GOOGLE_CALENDAR_QUICK_ADD_SCHEMA: AppActionSchema = {
  appId: "google-calendar",
  actionId: "quick_add_event",
  actionName: "Quick Add Event (Natural Language)",
  description: "Creates calendar event using natural language string",
  fields: [
    {
      id: "calendar_id",
      label: "Calendar",
      type: "select",
      required: true,
      options: [
        { value: "primary", label: "Primary Calendar (Default)" },
        { value: "sales_team", label: "Sales & Demo Calendar" }
      ],
      supportsMapping: true
    },
    {
      id: "quick_add_text",
      label: "Event Description (Natural Language)",
      type: "text",
      required: true,
      placeholder: "e.g. Lunch with {{step_1.name}} tomorrow at 1pm at Bistro",
      helperText: "Google will automatically parse the date, time, and title from this text",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    event_id: "gcal_quick_9912",
    summary: "Lunch with Alex tomorrow at 1pm",
    status: "confirmed"
  }
}

export const GOOGLE_SHEETS_SCHEMA: AppActionSchema = {
  appId: "google-sheets",
  actionId: "add_row",
  actionName: "Add Row to Spreadsheet",
  description: "Appends a new record to Google Sheets worksheet",
  fields: [
    {
      id: "spreadsheet_id",
      label: "Spreadsheet",
      type: "select",
      required: true,
      helperText: "Select the target Google Sheet from your Google Drive",
      options: [
        { value: "sheet_leads_2026", label: "2026 Master Leads & Conversions" },
        { value: "sheet_orders_db", label: "E-Commerce Customer Orders DB" },
        { value: "sheet_feedback_log", label: "Product Feedback & Feature Requests" }
      ],
      supportsMapping: true
    },
    {
      id: "worksheet_id",
      label: "Worksheet Tab",
      type: "select",
      required: true,
      helperText: "Select tab name within the spreadsheet",
      options: [
        { value: "Sheet1", label: "Sheet1 (Default)" },
        { value: "Raw_Submissions", label: "Raw Submissions" },
        { value: "Qualified_Prospects", label: "Qualified Prospects" }
      ],
      supportsMapping: true
    },
    {
      id: "col_name",
      label: "Column: Full Name",
      type: "text",
      required: true,
      placeholder: "e.g. {{step_1.name}}",
      supportsMapping: true
    },
    {
      id: "col_email",
      label: "Column: Email Address",
      type: "text",
      required: true,
      placeholder: "e.g. {{step_1.email}}",
      supportsMapping: true
    },
    {
      id: "col_phone",
      label: "Column: Phone Number",
      type: "text",
      placeholder: "e.g. {{step_1.phone}}",
      supportsMapping: true
    },
    {
      id: "col_amount",
      label: "Column: Amount / Value",
      type: "text",
      placeholder: "e.g. {{step_1.amount}}",
      supportsMapping: true
    },
    {
      id: "col_notes",
      label: "Column: Notes & Timestamp",
      type: "textarea",
      placeholder: "Order placed via {{step_1.source}} at {{step_1.time}}",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    row_number: 142,
    spreadsheet_id: "sheet_leads_2026",
    updated_cells: 5,
    status: "SUCCESS"
  }
}

export const GOOGLE_SHEETS_UPDATE_ROW_SCHEMA: AppActionSchema = {
  appId: "google-sheets",
  actionId: "update_row",
  actionName: "Update Existing Row",
  description: "Modifies cell values on an existing row number in Google Sheets",
  fields: [
    {
      id: "spreadsheet_id",
      label: "Spreadsheet",
      type: "select",
      required: true,
      options: [
        { value: "sheet_leads_2026", label: "2026 Master Leads & Conversions" },
        { value: "sheet_orders_db", label: "E-Commerce Customer Orders DB" }
      ],
      supportsMapping: true
    },
    {
      id: "worksheet_id",
      label: "Worksheet Tab",
      type: "select",
      required: true,
      options: [
        { value: "Sheet1", label: "Sheet1 (Default)" },
        { value: "Raw_Submissions", label: "Raw Submissions" }
      ],
      supportsMapping: true
    },
    {
      id: "row_index",
      label: "Row Index / Row Number",
      type: "number",
      required: true,
      placeholder: "e.g. 142 or {{step_1.row_number}}",
      helperText: "The 1-based row number to update in the spreadsheet",
      supportsMapping: true
    },
    {
      id: "col_amount",
      label: "Update: Amount / Value",
      type: "text",
      placeholder: "{{step_1.amount}}",
      supportsMapping: true
    },
    {
      id: "col_notes",
      label: "Update: Notes",
      type: "textarea",
      placeholder: "Updated at {{step_1.timestamp}}",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    row_number: 142,
    updated_cells: 2,
    status: "UPDATED"
  }
}

export const GOOGLE_SHEETS_LOOKUP_ROW_SCHEMA: AppActionSchema = {
  appId: "google-sheets",
  actionId: "lookup_row",
  actionName: "Lookup / Search Row",
  description: "Finds a matching row in a worksheet by searching a column value",
  fields: [
    {
      id: "spreadsheet_id",
      label: "Spreadsheet",
      type: "select",
      required: true,
      options: [
        { value: "sheet_leads_2026", label: "2026 Master Leads & Conversions" },
        { value: "sheet_orders_db", label: "E-Commerce Customer Orders DB" }
      ],
      supportsMapping: true
    },
    {
      id: "worksheet_id",
      label: "Worksheet Tab",
      type: "select",
      required: true,
      options: [
        { value: "Sheet1", label: "Sheet1" }
      ],
      supportsMapping: true
    },
    {
      id: "lookup_column",
      label: "Lookup Column Name",
      type: "select",
      required: true,
      options: [
        { value: "Email Address", label: "Email Address" },
        { value: "Order ID", label: "Order ID" },
        { value: "Customer Name", label: "Customer Name" }
      ],
      supportsMapping: true
    },
    {
      id: "lookup_value",
      label: "Lookup Search Value",
      type: "text",
      required: true,
      placeholder: "e.g. {{step_1.email}}",
      helperText: "The value to search for in the lookup column",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    found: true,
    row_number: 88,
    name: "Alex Johnson",
    email: "alex@company.com",
    amount: "450"
  }
}

export const GMAIL_SCHEMA: AppActionSchema = {
  appId: "gmail",
  actionId: "send_email",
  actionName: "Send Email Message",
  description: "Dispatches an email through your connected Google Workspace account",
  fields: [
    {
      id: "recipient_to",
      label: "To (Recipient Email)",
      type: "text",
      required: true,
      placeholder: "e.g. client@company.com or {{step_1.email}}",
      helperText: "Primary destination email address",
      supportsMapping: true
    },
    {
      id: "recipient_cc",
      label: "Cc / Bcc Emails",
      type: "text",
      placeholder: "colleague@company.com",
      helperText: "Comma-separated list of secondary addresses",
      supportsMapping: true
    },
    {
      id: "subject",
      label: "Email Subject",
      type: "text",
      required: true,
      placeholder: "Your Invoice #{{step_1.order_id}} is Ready",
      supportsMapping: true
    },
    {
      id: "body_content",
      label: "Email Message Body",
      type: "textarea",
      required: true,
      placeholder: "Hello {{step_1.name}},\n\nThank you for choosing us! Your order #{{step_1.order_id}} has been received...",
      helperText: "Supports plain text and rich HTML formatting",
      supportsMapping: true
    },
    {
      id: "attachment_url",
      label: "Attachment Public URL",
      type: "text",
      placeholder: "https://storage.cdn.com/invoices/inv_998.pdf",
      helperText: "Direct download link to file attachment (max 25MB)",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    message_id: "msg_gm_18f921ab98",
    thread_id: "th_98124ab",
    labels: ["SENT"],
    delivered_to: "client@company.com"
  }
}

export const SLACK_SCHEMA: AppActionSchema = {
  appId: "slack",
  actionId: "send_channel_msg",
  actionName: "Send Slack Channel Message",
  description: "Posts a notification or block alert to a Slack channel",
  fields: [
    {
      id: "channel_id",
      label: "Channel Name",
      type: "select",
      required: true,
      helperText: "Target Slack channel for notification",
      options: [
        { value: "general", label: "# general" },
        { value: "leads-feed", label: "# leads-feed (Real-time)" },
        { value: "orders-alerts", label: "# orders-alerts" },
        { value: "dev-ops", label: "# dev-ops-alerts" }
      ],
      supportsMapping: true
    },
    {
      id: "message_text",
      label: "Message Content",
      type: "textarea",
      required: true,
      placeholder: "🚀 *New Order Captured!*\n• Customer: {{step_1.name}}\n• Value: ${{step_1.amount}}\n• Items: {{step_1.items}}",
      helperText: "Supports Slack markdown (*bold*, _italics_, `code`, links)",
      supportsMapping: true
    },
    {
      id: "bot_name",
      label: "Custom Bot Name",
      type: "text",
      placeholder: "Automate Bot",
      helperText: "Display sender name for the bot",
      supportsMapping: true
    },
    {
      id: "icon_emoji",
      label: "Bot Avatar Emoji",
      type: "text",
      placeholder: ":bell: or :rocket:",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    ok: true,
    channel: "C049281ABC",
    ts: "1725451200.001920",
    message_url: "https://slack.com/archives/C049281ABC/p1725451200"
  }
}

export const SLACK_DIRECT_MSG_SCHEMA: AppActionSchema = {
  appId: "slack",
  actionId: "send_direct_message",
  actionName: "Send Direct Message to User",
  description: "Posts a direct message to an individual Slack user by email or user ID",
  fields: [
    {
      id: "user_id",
      label: "User Email / Member ID",
      type: "text",
      required: true,
      placeholder: "e.g. colleague@company.com or U0123456789",
      helperText: "Slack email or Member ID of the recipient user",
      supportsMapping: true
    },
    {
      id: "message_text",
      label: "Direct Message Content",
      type: "textarea",
      required: true,
      placeholder: "Hi {{step_1.name}}, here is your update regarding order #{{step_1.order_id}}",
      helperText: "Supports Slack markdown formatting",
      supportsMapping: true
    },
    {
      id: "bot_name",
      label: "Bot Name",
      type: "text",
      placeholder: "Automate Notifications",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    ok: true,
    channel: "D049281XYZ",
    ts: "1725451205.002100"
  }
}

export const SHOPIFY_SCHEMA: AppActionSchema = {
  appId: "shopify",
  actionId: "add_order_note",
  actionName: "Update Order / Add Note",
  description: "Modifies order metadata, notes, or fulfillment tags in Shopify",
  fields: [
    {
      id: "order_id",
      label: "Shopify Order ID",
      type: "text",
      required: true,
      placeholder: "e.g. {{step_1.order_id}} or 5129481920",
      helperText: "Numerical ID of the Shopify order",
      supportsMapping: true
    },
    {
      id: "order_note",
      label: "Internal Staff Note",
      type: "textarea",
      placeholder: "Verified via WhatsApp CRM by {{step_1.agent_name}} on {{step_1.timestamp}}",
      helperText: "Visible inside Shopify admin order timeline",
      supportsMapping: true
    },
    {
      id: "order_tags",
      label: "Order Tags to Add",
      type: "text",
      placeholder: "VIP_CUSTOMER, PRIORITY_SHIP, PROCESSED",
      helperText: "Comma-separated tags for filtering in Shopify",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    order_id: "5129481920",
    note_added: true,
    tags: ["VIP_CUSTOMER", "PROCESSED"],
    status: "SUCCESS"
  }
}

export const PIPEDRIVE_SCHEMA: AppActionSchema = {
  appId: "pipedrive",
  actionId: "create_pipedrive_deal",
  actionName: "Create Deal & Contact",
  description: "Adds a prospective deal to a sales pipeline in Pipedrive",
  fields: [
    {
      id: "deal_title",
      label: "Deal Title",
      type: "text",
      required: true,
      placeholder: "{{step_1.company}} — Enterprise License",
      supportsMapping: true
    },
    {
      id: "deal_value",
      label: "Deal Value / Currency",
      type: "number",
      required: true,
      placeholder: "5000",
      helperText: "Estimated revenue value for pipeline forecast",
      supportsMapping: true
    },
    {
      id: "stage_id",
      label: "Pipeline Stage",
      type: "select",
      required: true,
      options: [
        { value: "lead_in", label: "Stage 1: Lead In / Qualified" },
        { value: "contact_made", label: "Stage 2: Contact Made" },
        { value: "demo_scheduled", label: "Stage 3: Demo Scheduled" },
        { value: "proposal_sent", label: "Stage 4: Proposal Sent" }
      ],
      supportsMapping: true
    },
    {
      id: "person_name",
      label: "Contact Person Name",
      type: "text",
      required: true,
      placeholder: "{{step_1.name}}",
      supportsMapping: true
    },
    {
      id: "person_email",
      label: "Contact Email",
      type: "text",
      placeholder: "{{step_1.email}}",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    deal_id: 8492,
    stage: "demo_scheduled",
    value: 5000,
    status: "open"
  }
}

export const FRESHDESK_SCHEMA: AppActionSchema = {
  appId: "freshdesk",
  actionId: "create_ticket",
  actionName: "Create Support Ticket",
  description: "Logs a customer inquiry or support incident in Freshdesk",
  fields: [
    {
      id: "subject",
      label: "Ticket Subject",
      type: "text",
      required: true,
      placeholder: "Urgent issue with Order #{{step_1.order_id}}",
      supportsMapping: true
    },
    {
      id: "description",
      label: "Issue Description / Message",
      type: "textarea",
      required: true,
      placeholder: "Customer {{step_1.name}} reported: {{step_1.message}}",
      supportsMapping: true
    },
    {
      id: "requester_email",
      label: "Requester Email",
      type: "text",
      required: true,
      placeholder: "{{step_1.email}}",
      supportsMapping: true
    },
    {
      id: "priority",
      label: "Ticket Priority",
      type: "select",
      required: true,
      options: [
        { value: "1", label: "Low Priority" },
        { value: "2", label: "Medium Priority" },
        { value: "3", label: "High Priority" },
        { value: "4", label: "Urgent (SLA 1-Hour)" }
      ],
      supportsMapping: true
    },
    {
      id: "status",
      label: "Ticket Status",
      type: "select",
      defaultValue: "2",
      options: [
        { value: "2", label: "Open" },
        { value: "3", label: "Pending" },
        { value: "4", label: "Resolved" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    ticket_id: 104921,
    priority: "Urgent",
    status: "Open",
    created_at: "2026-09-04T10:30:00Z"
  }
}

export const RAZORPAY_SCHEMA: AppActionSchema = {
  appId: "razorpay",
  actionId: "create_payment_link",
  actionName: "Create Payment Link",
  description: "Generates an instant sharable Razorpay checkout payment link",
  fields: [
    {
      id: "amount",
      label: "Amount (in standard units, e.g. 999.00)",
      type: "number",
      required: true,
      placeholder: "e.g. {{step_1.total_price}} or 999",
      helperText: "Will be converted to smallest currency unit (paise/cents) automatically",
      supportsMapping: true
    },
    {
      id: "currency",
      label: "Currency",
      type: "select",
      required: true,
      defaultValue: "INR",
      options: [
        { value: "INR", label: "INR (Indian Rupee ₹)" },
        { value: "USD", label: "USD (US Dollar $)" },
        { value: "EUR", label: "EUR (Euro €)" }
      ],
      supportsMapping: true
    },
    {
      id: "customer_name",
      label: "Customer Name",
      type: "text",
      required: true,
      placeholder: "{{step_1.name}}",
      supportsMapping: true
    },
    {
      id: "customer_email",
      label: "Customer Email",
      type: "text",
      placeholder: "{{step_1.email}}",
      supportsMapping: true
    },
    {
      id: "customer_phone",
      label: "Customer Phone (+ Country Code)",
      type: "text",
      placeholder: "+91 9876543210",
      supportsMapping: true
    },
    {
      id: "receipt_id",
      label: "Internal Receipt / Reference ID",
      type: "text",
      placeholder: "inv_rec_{{step_1.id}}",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    payment_link_id: "plink_H3892kf92",
    short_url: "https://rzp.io/i/Xy78aZ",
    amount: 99900,
    currency: "INR",
    status: "created"
  }
}

export const TELEGRAM_SCHEMA: AppActionSchema = {
  appId: "telegram",
  actionId: "send_telegram_msg",
  actionName: "Send Telegram Message",
  description: "Dispatches a message to a user or Telegram group channel",
  fields: [
    {
      id: "chat_id",
      label: "Chat ID / Group Channel ID",
      type: "text",
      required: true,
      placeholder: "@my_channel or -100123456789",
      helperText: "ID of the target Telegram chat, group, or channel",
      supportsMapping: true
    },
    {
      id: "message_text",
      label: "Message Content",
      type: "textarea",
      required: true,
      placeholder: "📢 *Alert:* New signup from {{step_1.name}} ({{step_1.email}})",
      supportsMapping: true
    },
    {
      id: "parse_mode",
      label: "Formatting Syntax",
      type: "select",
      defaultValue: "Markdown",
      options: [
        { value: "Markdown", label: "Markdown (Bold *, Italic _, Links)" },
        { value: "HTML", label: "HTML (<b>bold</b>, <code>code</code>)" },
        { value: "None", label: "Plain Text (No Parsing)" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    ok: true,
    message_id: 4892,
    date: 1725451200
  }
}

export const TYPEFORM_SCHEMA: AppActionSchema = {
  appId: "typeform",
  actionId: "create_typeform_entry",
  actionName: "Prefill Typeform Link",
  description: "Generates custom prefilled respondent URL",
  fields: [
    {
      id: "form_id",
      label: "Typeform Form Shell",
      type: "select",
      required: true,
      options: [
        { value: "tf_lead_gen", label: "Customer Onboarding Survey (v2)" },
        { value: "tf_feedback", label: "Post-Purchase NPS Rating" },
        { value: "tf_support", label: "Technical Diagnostic Form" }
      ],
      supportsMapping: true
    },
    {
      id: "prefill_name",
      label: "Prefill: Full Name",
      type: "text",
      placeholder: "{{step_1.name}}",
      supportsMapping: true
    },
    {
      id: "prefill_email",
      label: "Prefill: Email Address",
      type: "text",
      placeholder: "{{step_1.email}}",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    prefilled_url: "https://form.typeform.com/to/tf_lead_gen#name=Alex&email=alex@co.com",
    status: "ready"
  }
}

export const TYPEFORM_TRIGGER_SCHEMA: AppActionSchema = {
  appId: "typeform",
  actionId: "new_typeform_sub",
  actionName: "New Response Submitted",
  description: "Triggers in real-time via OAuth 2.0 automated webhook registration when a respondent submits a form",
  fields: [
    {
      id: "form_id",
      label: "Form *",
      type: "select",
      required: true,
      helperText: "Select the Typeform form from your connected account",
      options: [
        { value: "tf_lead_gen", label: "Client Onboarding & Project Scope Survey (tf_lead_gen)" },
        { value: "tf_feedback", label: "Post-Purchase NPS Rating (tf_feedback)" },
        { value: "tf_support", label: "Technical Diagnostic Form (tf_support)" }
      ],
      defaultValue: "tf_lead_gen"
    },
    {
      id: "simple_response",
      label: "Simple Response",
      type: "select",
      required: false,
      helperText: "When enabled, form question answers are automatically flattened into clean variable tokens",
      options: [
        { label: "Yes (Recommended - Flatten JSON into simple variable keys)", value: "yes" },
        { label: "No (Advanced - Retain nested JSON objects and arrays)", value: "no" }
      ],
      defaultValue: "yes"
    }
  ],
  sampleOutput: {
    event_id: "evt_tf_98124",
    event_type: "form_response",
    form_id: "tf_lead_gen",
    token: "resp_token_9812409",
    submitted_at: "2026-09-10T11:20:00Z",
    client_name: "Marcus Vance",
    client_email: "marcus.vance@fintech.io",
    budget_tier: "$50,000 - $100,000",
    service_interested: "Enterprise Automation Platform",
    project_timeline: "Immediate (within 30 days)"
  }
}

export const TYPEFORM_PARTIAL_TRIGGER_SCHEMA: AppActionSchema = {
  appId: "typeform",
  actionId: "partial_typeform_sub",
  actionName: "Partial Response Saved",
  description: "Triggers in real-time via OAuth 2.0 when a respondent drops off or completes an intermediate form step",
  fields: [
    {
      id: "form_id",
      label: "Form *",
      type: "select",
      required: true,
      helperText: "Select the Typeform form from your connected account",
      options: [
        { value: "tf_lead_gen", label: "Client Onboarding & Project Scope Survey (tf_lead_gen)" },
        { value: "tf_feedback", label: "Post-Purchase NPS Rating (tf_feedback)" },
        { value: "tf_support", label: "Technical Diagnostic Form (tf_support)" }
      ],
      defaultValue: "tf_lead_gen"
    },
    {
      id: "simple_response",
      label: "Simple Response",
      type: "select",
      required: false,
      options: [
        { label: "Yes (Recommended - Flatten JSON into simple variable keys)", value: "yes" },
        { label: "No (Advanced - Retain nested JSON objects and arrays)", value: "no" }
      ],
      defaultValue: "yes"
    }
  ],
  sampleOutput: {
    event_id: "evt_tf_part_491",
    form_id: "tf_lead_gen",
    last_screen_viewed: "screen_3_budget",
    email_collected: "marcus.vance@fintech.io",
    progress_percent: 65,
    timestamp: "2026-09-10T11:18:00Z"
  }
}

export const HUBSPOT_SCHEMA: AppActionSchema = {
  appId: "hubspot",
  actionId: "create_update_contact",
  actionName: "Create or Update Contact",
  description: "Upserts a contact record in HubSpot CRM using email identifier",
  fields: [
    {
      id: "contact_email",
      label: "Contact Email (Primary Key)",
      type: "text",
      required: true,
      placeholder: "{{step_1.email}}",
      helperText: "Used as unique identifier to prevent duplicate records",
      supportsMapping: true
    },
    {
      id: "first_name",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "{{step_1.first_name}}",
      supportsMapping: true
    },
    {
      id: "last_name",
      label: "Last Name",
      type: "text",
      placeholder: "{{step_1.last_name}}",
      supportsMapping: true
    },
    {
      id: "phone",
      label: "Phone Number",
      type: "text",
      placeholder: "{{step_1.phone}}",
      supportsMapping: true
    },
    {
      id: "lifecycle_stage",
      label: "Lifecycle Stage",
      type: "select",
      options: [
        { value: "lead", label: "Lead" },
        { value: "marketingqualifiedlead", label: "Marketing Qualified Lead (MQL)" },
        { value: "salesqualifiedlead", label: "Sales Qualified Lead (SQL)" },
        { value: "customer", label: "Customer" }
      ],
      supportsMapping: true
    },
    {
      id: "company_name",
      label: "Company / Domain",
      type: "text",
      placeholder: "{{step_1.company}}",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    contact_id: "vid_9281204",
    is_new: true,
    lifecycle_stage: "lead",
    status: "SUCCESS"
  }
}

export const AUTOMATE_CHATS_SCHEMA: AppActionSchema = {
  appId: "automate-chats",
  actionId: "send_wa_template",
  actionName: "Send WhatsApp Template Message",
  description: "Dispatches pre-approved WhatsApp Business message to customer",
  fields: [
    {
      id: "recipient_phone",
      label: "Recipient Phone (+ Country Code)",
      type: "text",
      required: true,
      placeholder: "+91 9876543210 or {{step_1.phone}}",
      helperText: "Include country code with no spaces or symbols",
      supportsMapping: true
    },
    {
      id: "template_name",
      label: "Approved Template Name",
      type: "select",
      required: true,
      options: [
        { value: "order_confirmation_v2", label: "order_confirmation_v2 (Order Placed)" },
        { value: "lead_welcome_gift", label: "lead_welcome_gift (Welcome Discount)" },
        { value: "appointment_reminder", label: "appointment_reminder (Meeting Sync)" }
      ],
      supportsMapping: true
    },
    {
      id: "param_1",
      label: "Template Variable {{1}}",
      type: "text",
      placeholder: "e.g. {{step_1.name}}",
      helperText: "Substituted into the first placeholder of the template body",
      supportsMapping: true
    },
    {
      id: "param_2",
      label: "Template Variable {{2}}",
      type: "text",
      placeholder: "e.g. {{step_1.order_id}}",
      supportsMapping: true
    },
    {
      id: "header_media_url",
      label: "Header Image / PDF URL",
      type: "text",
      placeholder: "https://assets.store.com/banner.jpg",
      helperText: "Optional media header for template",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    message_id: "wamid.HBgLMTU1NTAxOTIA...",
    recipient: "+91 9876543210",
    status: "queued"
  }
}

// -------------------------------------------------------------
// 2. FLOW CONTROL SCHEMAS (5 MODULES)
// -------------------------------------------------------------

export const SCHEDULER_SCHEMA: AppActionSchema = {
  appId: "scheduler",
  actionId: "cron_schedule",
  actionName: "Schedule Run Frequency",
  description: "Triggers execution at precise intervals, recurring days, or cron times",
  fields: [
    {
      id: "schedule_type",
      label: "Schedule Recurrence Type",
      type: "select",
      required: true,
      options: [
        { value: "every_day", label: "Every Day (Daily Recurring)" },
        { value: "every_week", label: "Every Week (Specific Days)" },
        { value: "interval", label: "At Regular Intervals (Minutes/Hours)" },
        { value: "once", label: "Once at Specified Future Timestamp" },
        { value: "cron", label: "Custom Cron Expression" }
      ],
      supportsMapping: true
    },
    {
      id: "time_of_day",
      label: "Execution Time of Day",
      type: "text",
      placeholder: "09:00 AM",
      helperText: "Format: HH:mm AM/PM",
      supportsMapping: true
    },
    {
      id: "cron_expression",
      label: "Cron Expression Syntax",
      type: "text",
      placeholder: "0 9 * * 1-5 (At 09:00 on every day-of-week from Monday through Friday)",
      helperText: "5-part standard unix cron syntax (minute hour dom month dow)",
      supportsMapping: true
    },
    {
      id: "timezone",
      label: "Scheduler Timezone",
      type: "select",
      required: true,
      defaultValue: "Asia/Kolkata",
      options: [
        { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
        { value: "UTC", label: "UTC (Coordinated Universal Time)" },
        { value: "America/New_York", label: "America/New_York (EST)" },
        { value: "Europe/London", label: "Europe/London (GMT)" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    scheduled_run_id: "sched_run_8412",
    next_trigger_time: "2026-09-05T09:00:00+05:30",
    timezone: "Asia/Kolkata"
  }
}

export const FILTER_SCHEMA: AppActionSchema = {
  appId: "filter",
  actionId: "apply_filter_rules",
  actionName: "Conditional Rule Evaluator",
  description: "Workflow proceeds only if conditional rules match",
  fields: [
    {
      id: "field",
      label: "Target Field / Variable",
      type: "text",
      required: true,
      placeholder: "e.g. {{step_1.amount}} or {{step_1.status}}",
      helperText: "Select upstream variable to inspect",
      supportsMapping: true
    },
    {
      id: "operator",
      label: "Comparison Operator",
      type: "select",
      required: true,
      defaultValue: "equals",
      options: [
        { value: "equals", label: "Exact Match (Equals)" },
        { value: "does_not_equal", label: "Does Not Equal" },
        { value: "contains", label: "Text Contains" },
        { value: "does_not_contain", label: "Text Does Not Contain" },
        { value: "starts_with", label: "Starts With" },
        { value: "greater_than", label: "Greater Than (>)" },
        { value: "less_than", label: "Less Than (<)" },
        { value: "is_not_empty", label: "Is Not Empty" }
      ],
      supportsMapping: true
    },
    {
      id: "value",
      label: "Comparison Value",
      type: "text",
      required: true,
      placeholder: "e.g. 500 or SUCCESS or Active",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    condition_matched: true,
    evaluated_field: "1000",
    operator: "greater_than",
    comparison_value: "500",
    action: "CONTINUE_WORKFLOW"
  }
}

export const ROUTER_SCHEMA: AppActionSchema = {
  appId: "router",
  actionId: "route_branches",
  actionName: "Multi-Branch Router",
  description: "Splits execution into independent conditional sub-branches",
  fields: [
    {
      id: "branch_name",
      label: "Branch Identifier",
      type: "text",
      required: true,
      placeholder: "Route A — High Value Leads",
      supportsMapping: true
    },
    {
      id: "rule_field",
      label: "Filter Variable",
      type: "text",
      required: true,
      placeholder: "{{step_1.amount}}",
      supportsMapping: true
    },
    {
      id: "rule_operator",
      label: "Branch Operator",
      type: "select",
      required: true,
      options: [
        { value: "gt", label: "Greater Than (>)" },
        { value: "equals", label: "Equals" },
        { value: "contains", label: "Contains" }
      ],
      supportsMapping: true
    },
    {
      id: "rule_value",
      label: "Branch Value",
      type: "text",
      required: true,
      placeholder: "1000",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    selected_branch: "Route A",
    branch_matched: true,
    dispatched_sub_actions: 3
  }
}

export const DELAY_FOR_SCHEMA: AppActionSchema = {
  appId: "delay",
  actionId: "delay_for",
  actionName: "Delay For (Duration)",
  description: "Pauses execution for a set duration (minutes, hours, days, weeks)",
  fields: [
    {
      id: "delay_type",
      label: "Delay Mode",
      type: "select",
      required: true,
      defaultValue: "delay_for",
      options: [
        { value: "delay_for", label: "Delay For (Fixed Duration)" },
        { value: "delay_until", label: "Delay Until (Specific Timestamp)" },
        { value: "rate_limiter", label: "Rate Limiter Queue (Throttle)" }
      ],
      supportsMapping: true
    },
    {
      id: "duration_value",
      label: "Delay Duration",
      type: "number",
      required: true,
      placeholder: "15",
      defaultValue: 15,
      helperText: "Enter the number of units to delay execution for",
      supportsMapping: true
    },
    {
      id: "duration_unit",
      label: "Time Unit",
      type: "select",
      required: true,
      defaultValue: "Minutes",
      options: [
        { value: "Minutes", label: "Minutes" },
        { value: "Hours", label: "Hours" },
        { value: "Days", label: "Days" },
        { value: "Weeks", label: "Weeks" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    delayed_for: "15 Minutes",
    resumed_at: "2026-09-04T12:45:01Z",
    status: "COMPLETED"
  }
}

export const DELAY_UNTIL_SCHEMA: AppActionSchema = {
  appId: "delay",
  actionId: "delay_until",
  actionName: "Delay Until (Timestamp)",
  description: "Pauses execution until an exact scheduled future timestamp",
  fields: [
    {
      id: "delay_type",
      label: "Delay Mode",
      type: "select",
      required: true,
      defaultValue: "delay_until",
      options: [
        { value: "delay_for", label: "Delay For (Fixed Duration)" },
        { value: "delay_until", label: "Delay Until (Specific Timestamp)" },
        { value: "rate_limiter", label: "Rate Limiter Queue (Throttle)" }
      ],
      supportsMapping: true
    },
    {
      id: "target_timestamp",
      label: "Target Date & Time",
      type: "datetime",
      required: true,
      placeholder: "2026-09-10T15:00:00Z or {{step_1.event_time}}",
      helperText: "Execution will pause until this exact ISO 8601 date & time",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    delayed_until: "2026-09-10T15:00:00Z",
    resumed_at: "2026-09-10T15:00:01Z",
    status: "COMPLETED"
  }
}

export const DELAY_RATE_LIMIT_SCHEMA: AppActionSchema = {
  appId: "delay",
  actionId: "rate_limiter",
  actionName: "Rate Limiter Queue",
  description: "Throttles throughput to prevent third-party API rate limits",
  fields: [
    {
      id: "delay_type",
      label: "Delay Mode",
      type: "select",
      required: true,
      defaultValue: "rate_limiter",
      options: [
        { value: "delay_for", label: "Delay For (Fixed Duration)" },
        { value: "delay_until", label: "Delay Until (Specific Timestamp)" },
        { value: "rate_limiter", label: "Rate Limiter Queue (Throttle)" }
      ],
      supportsMapping: true
    },
    {
      id: "max_runs",
      label: "Max Executions Allowed",
      type: "number",
      defaultValue: 10,
      placeholder: "10",
      helperText: "Maximum number of workflow executions in the given window",
      supportsMapping: true
    },
    {
      id: "time_window",
      label: "Per Time Window",
      type: "select",
      defaultValue: "Minute",
      options: [
        { value: "Minute", label: "Per Minute" },
        { value: "Hour", label: "Per Hour" },
        { value: "Day", label: "Per Day" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    rate_limit: "10/Minute",
    queue_status: "PASSED"
  }
}

export const DELAY_SCHEMA: AppActionSchema = DELAY_FOR_SCHEMA

export const ITERATOR_SCHEMA: AppActionSchema = {
  appId: "iterator",
  actionId: "loop_array_items",
  actionName: "Iterate Line Items Array",
  description: "Executes subsequent steps once for each item in a JSON array",
  fields: [
    {
      id: "array_data",
      label: "Array Source Data",
      type: "textarea",
      required: true,
      placeholder: "{{step_1.line_items}} or [{\"item\": \"Shoes\", \"qty\": 2}]",
      helperText: "Select an array output from an earlier step or supply JSON list",
      supportsMapping: true
    },
    {
      id: "max_iterations",
      label: "Safety Limit (Max Iterations)",
      type: "number",
      defaultValue: 50,
      helperText: "Prevents runaway loops on large datasets (max: 200)",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    current_item: { id: "p_101", title: "Running Shoes", price: 89.99, quantity: 1 },
    index: 0,
    is_first: true,
    is_last: false,
    total_count: 3
  }
}

export const ITERATOR_AGGREGATE_SCHEMA: AppActionSchema = {
  appId: "iterator",
  actionId: "aggregate_items",
  actionName: "Aggregate Items into Single Array",
  description: "Combines outputs from looped iterations into a single consolidated summary array or formatted text list",
  fields: [
    {
      id: "source_step",
      label: "Array Source / Items Variable",
      type: "textarea",
      required: true,
      placeholder: "{{step_2.current_item}} or select step variables from picker",
      helperText: "Map the outputs from the loop step that you want to consolidate",
      supportsMapping: true
    },
    {
      id: "aggregation_format",
      label: "Aggregation Output Format",
      type: "select",
      required: true,
      defaultValue: "comma_separated",
      options: [
        { value: "comma_separated", label: "Comma Separated Values (CSV)" },
        { value: "new_line", label: "Line-by-Line Plain Text (\\n)" },
        { value: "bullet_list", label: "HTML / Markdown Bullet List (• )" },
        { value: "json_array", label: "Standard JSON Array ([{...}, {...}])" }
      ],
      helperText: "Choose how the aggregated list items should be formatted for downstream steps",
      supportsMapping: false
    },
    {
      id: "fields_to_aggregate",
      label: "Target Field Keys (Optional)",
      type: "text",
      placeholder: "e.g. title, price, quantity (leave empty to aggregate entire object)",
      helperText: "Specify comma-separated keys to pluck, or leave blank to combine all fields",
      supportsMapping: true
    },
    {
      id: "filter_empty",
      label: "Filter Null / Empty Values",
      type: "select",
      defaultValue: "yes",
      options: [
        { value: "yes", label: "Yes (Skip blank and null entries)" },
        { value: "no", label: "No (Keep all items)" }
      ],
      helperText: "Automatically removes empty or undefined entries from final aggregated output",
      supportsMapping: false
    }
  ],
  sampleOutput: {
    aggregated_count: 3,
    aggregated_text: "1. Running Shoes ($89.99)\n2. Training Shorts ($35.00)\n3. Sports Water Bottle ($15.50)",
    aggregated_array: [
      { id: "p_101", title: "Running Shoes", price: 89.99 },
      { id: "p_102", title: "Training Shorts", price: 35.00 },
      { id: "p_103", title: "Sports Water Bottle", price: 15.50 }
    ],
    execution_status: "SUCCESS"
  }
}


// -------------------------------------------------------------
// 3. UTILITY SCHEMAS (7 MODULES)
// -------------------------------------------------------------

export const TEXT_TRANSFORM_OPTIONS: SchemaOption[] = [
  { value: "split", label: "Split Text by Delimiter" },
  { value: "extract_url", label: "Extract Website URL" },
  { value: "extract_email", label: "Extract Email Address" },
  { value: "extract_phone", label: "Extract Phone Number" },
  { value: "change_case", label: "Change Text Case (UPPER / lower / Title)" },
  { value: "find_replace", label: "Find & Replace Text" },
  { value: "truncate", label: "Truncate Character Length" }
]

export const TEXT_FORMATTER_TRUNCATE_SCHEMA: AppActionSchema = {
  appId: "text-formatter",
  actionId: "truncate_text",
  actionName: "Truncate Character Length (...)",
  description: "Limits text length with trailing ellipsis or custom text",
  fields: [
    {
      id: "transform_type",
      label: "Transformation Operation",
      type: "select",
      required: true,
      defaultValue: "truncate",
      options: TEXT_TRANSFORM_OPTIONS,
      supportsMapping: true
    },
    {
      id: "text",
      label: "Text",
      type: "textarea",
      required: true,
      placeholder: "Enter the text you would like to truncate here. E.g. The stars twinkled in the night sky, painting it with their celestial glow. The moon hung like a silver lantern, illuminating the quiet streets below.",
      helperText: "Enter the text you would like to truncate here. E.g. The stars twinkled in the night sky, painting it with their celestial glow. The moon hung like a silver lantern, illuminating the quiet streets below.",
      supportsMapping: true
    },
    {
      id: "max_length",
      label: "Max Length",
      type: "number",
      defaultValue: 20,
      placeholder: "20",
      helperText: "Enter the maximum length (number of characters) of the text should be. The default value is 20.",
      supportsMapping: true
    },
    {
      id: "skip_characters",
      label: "Skip Characters",
      type: "number",
      placeholder: "0",
      helperText: "Enter the value for skip characters here. It will skip the first N characters in the text. E.g. 10.",
      supportsMapping: true
    },
    {
      id: "append_ellipsis",
      label: "Append Ellipsis?",
      type: "select",
      defaultValue: "True",
      options: [
        { value: "True", label: "True" },
        { value: "False", label: "False" }
      ],
      helperText: "Choose or map an option for append ellipsis option here. If selected to true, it will add the below text value to the end of the string.",
      supportsMapping: true
    },
    {
      id: "append_ellipsis_text",
      label: "Append Ellipsis Text",
      type: "text",
      defaultValue: "...",
      placeholder: "... (3 dots)",
      helperText: "Enter the append ellipsis text here. It will add this text at the end of the truncated string. The default value is ... (3 dots). E.g. Read more, Learn more.",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    truncated_text: "The stars twinkled in...",
    original_text: "The stars twinkled in the night sky, painting it with their celestial glow.",
    char_count: 24,
    ellipsis_applied: true
  }
}

export const TEXT_FORMATTER_EXTRACT_SCHEMA: AppActionSchema = {
  appId: "text-formatter",
  actionId: "extract_email_url",
  actionName: "Extract Email, URL or Phone Number",
  description: "Parses text to extract valid contact patterns, emails, or links",
  fields: [
    {
      id: "transform_type",
      label: "Transformation Operation",
      type: "select",
      required: true,
      defaultValue: "extract_url",
      options: TEXT_TRANSFORM_OPTIONS,
      supportsMapping: true
    },
    {
      id: "input_text",
      label: "Source Text",
      type: "textarea",
      required: true,
      placeholder: "Check our website at https://automate.io or email us at support@example.com",
      helperText: "The text string containing emails, URLs, or phone numbers to extract",
      supportsMapping: true
    },
    {
      id: "extract_format",
      label: "Pattern to Extract",
      type: "select",
      defaultValue: "url",
      options: [
        { value: "url", label: "Website URL (http:// or https://)" },
        { value: "email", label: "Email Address (name@domain.com)" },
        { value: "phone", label: "Phone Number (+1 555-0199 / digits)" }
      ],
      helperText: "Choose the target regex entity to parse and extract",
      supportsMapping: true
    },
    {
      id: "return_format",
      label: "Match Return Option",
      type: "select",
      defaultValue: "first",
      options: [
        { value: "first", label: "First Match (Single String)" },
        { value: "all", label: "All Matches (Array List)" }
      ],
      helperText: "Return the first matched entity or a collection of all matches",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    extracted_value: "https://automate.io",
    pattern_type: "url",
    match_count: 1,
    success: true
  }
}

export const TEXT_FORMATTER_CHANGE_CASE_SCHEMA: AppActionSchema = {
  appId: "text-formatter",
  actionId: "change_case",
  actionName: "Transform Casing (UPPER/lower/Title)",
  description: "Converts text to UPPERCASE, lowercase, or Title Case",
  fields: [
    {
      id: "transform_type",
      label: "Transformation Operation",
      type: "select",
      required: true,
      defaultValue: "change_case",
      options: TEXT_TRANSFORM_OPTIONS,
      supportsMapping: true
    },
    {
      id: "input_text",
      label: "Source Text",
      type: "textarea",
      required: true,
      placeholder: "e.g. hello world or {{step_1.customer_name}}",
      helperText: "The text you want to transform letter casing for",
      supportsMapping: true
    },
    {
      id: "target_casing",
      label: "Target Casing Format",
      type: "select",
      defaultValue: "upper",
      options: [
        { value: "upper", label: "UPPERCASE (e.g. JOHN DOE)" },
        { value: "lower", label: "lowercase (e.g. john doe)" },
        { value: "title", label: "Title Case (e.g. John Doe)" },
        { value: "capitalize", label: "Capitalize First Letter Only" }
      ],
      helperText: "Select which casing format to apply to the text",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    transformed_text: "JOHN DOE",
    original_text: "john doe",
    casing: "upper"
  }
}

export const TEXT_FORMATTER_FIND_REPLACE_SCHEMA: AppActionSchema = {
  appId: "text-formatter",
  actionId: "find_replace",
  actionName: "Find & Replace Text",
  description: "Replaces target pattern or string in text",
  fields: [
    {
      id: "transform_type",
      label: "Transformation Operation",
      type: "select",
      required: true,
      defaultValue: "find_replace",
      options: TEXT_TRANSFORM_OPTIONS,
      supportsMapping: true
    },
    {
      id: "input_text",
      label: "Source Text",
      type: "textarea",
      required: true,
      placeholder: "Order status: PENDING for customer Alex",
      helperText: "The original text string to perform find and replace on",
      supportsMapping: true
    },
    {
      id: "find_text",
      label: "Find Text",
      type: "text",
      required: true,
      placeholder: "PENDING",
      helperText: "The string or phrase to find",
      supportsMapping: true
    },
    {
      id: "replace_text",
      label: "Replace With",
      type: "text",
      placeholder: "APPROVED",
      helperText: "The replacement text",
      supportsMapping: true
    },
    {
      id: "case_sensitive",
      label: "Match Case Sensitive?",
      type: "select",
      defaultValue: "False",
      options: [
        { value: "False", label: "False (Ignore Case)" },
        { value: "True", label: "True (Strict Case)" }
      ],
      supportsMapping: true
    },
    {
      id: "replace_all",
      label: "Replace All Occurrences?",
      type: "select",
      defaultValue: "True",
      options: [
        { value: "True", label: "True (All Occurrences)" },
        { value: "False", label: "False (First Occurrence Only)" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    result_text: "Order status: APPROVED for customer Alex",
    replacements_made: 1,
    find: "PENDING",
    replace: "APPROVED"
  }
}

export const TEXT_FORMATTER_SPLIT_SCHEMA: AppActionSchema = {
  appId: "text-formatter",
  actionId: "split_text",
  actionName: "Split Text String",
  description: "Splits text by separator (comma, space, etc.)",
  fields: [
    {
      id: "transform_type",
      label: "Transformation Operation",
      type: "select",
      required: true,
      defaultValue: "split",
      options: TEXT_TRANSFORM_OPTIONS,
      supportsMapping: true
    },
    {
      id: "input_text",
      label: "Source Text",
      type: "textarea",
      required: true,
      placeholder: "{{step_1.customer_notes}} or John,Doe,Engineering",
      helperText: "The text string to split into separate pieces",
      supportsMapping: true
    },
    {
      id: "separator",
      label: "Split Delimiter / Separator",
      type: "text",
      placeholder: ", or space or \\n",
      helperText: "Character to split string by (e.g. comma, space)",
      supportsMapping: true
    },
    {
      id: "segment_index",
      label: "Segment Item to Return",
      type: "select",
      defaultValue: "first",
      options: [
        { value: "first", label: "First Item" },
        { value: "last", label: "Last Item" },
        { value: "all", label: "All Items (Array)" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    result: ["John", "Doe", "Engineering"],
    first_item: "John",
    last_item: "Engineering",
    item_count: 3
  }
}

export const TEXT_FORMATTER_SCHEMA: AppActionSchema = TEXT_FORMATTER_SPLIT_SCHEMA

export const DATETIME_FORMATTER_FORMAT_SCHEMA: AppActionSchema = {
  appId: "datetime-formatter",
  actionId: "format_date",
  actionName: "DateTime & Timezone Converter",
  description: "Converts timestamp formats, shifts dates, and adjusts timezones",
  fields: [
    {
      id: "date_operation",
      label: "DateTime Operation",
      type: "select",
      required: true,
      defaultValue: "format_date",
      options: [
        { value: "format_date", label: "Format Timestamp & Timezone" },
        { value: "add_subtract_time", label: "Add / Subtract Time (Hours/Days)" },
        { value: "time_difference", label: "Calculate Time Difference" },
        { value: "current_timestamp", label: "Generate Current Unix/ISO Timestamp" }
      ],
      supportsMapping: true
    },
    {
      id: "input_date",
      label: "Input Timestamp String",
      type: "text",
      required: true,
      placeholder: "{{step_1.created_at}} or 2026-09-04T12:00:00Z",
      supportsMapping: true
    },
    {
      id: "to_format",
      label: "Target Output Format",
      type: "select",
      required: true,
      defaultValue: "DD/MM/YYYY HH:mm",
      options: [
        { value: "DD/MM/YYYY HH:mm", label: "DD/MM/YYYY HH:mm (e.g. 04/09/2026 18:30)" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO Date)" },
        { value: "MMMM DD, YYYY", label: "MMMM DD, YYYY (Verbose, e.g. September 04, 2026)" },
        { value: "X", label: "Unix Epoch Seconds Timestamp" }
      ],
      supportsMapping: true
    },
    {
      id: "from_timezone",
      label: "Source Timezone",
      type: "select",
      defaultValue: "UTC",
      options: [
        { value: "UTC", label: "UTC" },
        { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
        { value: "America/New_York", label: "America/New_York (EST)" }
      ],
      supportsMapping: true
    },
    {
      id: "to_timezone",
      label: "Destination Timezone",
      type: "select",
      defaultValue: "Asia/Kolkata",
      options: [
        { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
        { value: "UTC", label: "UTC" },
        { value: "America/New_York", label: "America/New_York (EST)" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    formatted_date: "04/09/2026 18:30",
    timezone: "Asia/Kolkata",
    epoch_seconds: 1725451200
  }
}

export const DATETIME_FORMATTER_ADD_SUBTRACT_SCHEMA: AppActionSchema = {
  appId: "datetime-formatter",
  actionId: "add_subtract_time",
  actionName: "Add / Subtract Time (Hours/Days)",
  description: "Adds or subtracts hours, days, or weeks from a timestamp",
  fields: [
    {
      id: "date_operation",
      label: "DateTime Operation",
      type: "select",
      required: true,
      defaultValue: "add_subtract_time",
      options: [
        { value: "format_date", label: "Format Timestamp & Timezone" },
        { value: "add_subtract_time", label: "Add / Subtract Time (Hours/Days)" },
        { value: "time_difference", label: "Calculate Time Difference" },
        { value: "current_timestamp", label: "Generate Current Unix/ISO Timestamp" }
      ],
      supportsMapping: true
    },
    {
      id: "input_date",
      label: "Base Timestamp",
      type: "text",
      required: true,
      placeholder: "{{step_1.created_at}} or 2026-09-04T10:00:00Z",
      supportsMapping: true
    },
    {
      id: "operation_type",
      label: "Operation (Add / Subtract)",
      type: "select",
      defaultValue: "add",
      options: [
        { value: "add", label: "Add (+)" },
        { value: "subtract", label: "Subtract (-)" }
      ],
      supportsMapping: true
    },
    {
      id: "amount",
      label: "Amount Number",
      type: "number",
      defaultValue: 1,
      placeholder: "1",
      supportsMapping: true
    },
    {
      id: "unit",
      label: "Time Unit",
      type: "select",
      defaultValue: "Days",
      options: [
        { value: "Minutes", label: "Minutes" },
        { value: "Hours", label: "Hours" },
        { value: "Days", label: "Days" },
        { value: "Weeks", label: "Weeks" },
        { value: "Months", label: "Months" }
      ],
      supportsMapping: true
    },
    {
      id: "to_format",
      label: "Output Format",
      type: "select",
      defaultValue: "YYYY-MM-DD HH:mm:ss",
      options: [
        { value: "YYYY-MM-DD HH:mm:ss", label: "YYYY-MM-DD HH:mm:ss" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
        { value: "X", label: "Unix Epoch Seconds" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    result_date: "2026-09-05 10:00:00",
    shifted_by: "+1 Days"
  }
}

export const DATETIME_FORMATTER_DIFF_SCHEMA: AppActionSchema = {
  appId: "datetime-formatter",
  actionId: "time_difference",
  actionName: "Calculate Time Difference",
  description: "Computes elapsed time or duration between two timestamps",
  fields: [
    {
      id: "date_operation",
      label: "DateTime Operation",
      type: "select",
      required: true,
      defaultValue: "time_difference",
      options: [
        { value: "format_date", label: "Format Timestamp & Timezone" },
        { value: "add_subtract_time", label: "Add / Subtract Time (Hours/Days)" },
        { value: "time_difference", label: "Calculate Time Difference" },
        { value: "current_timestamp", label: "Generate Current Unix/ISO Timestamp" }
      ],
      supportsMapping: true
    },
    {
      id: "start_date",
      label: "Start Timestamp",
      type: "text",
      required: true,
      placeholder: "2026-09-01T08:00:00Z",
      supportsMapping: true
    },
    {
      id: "end_date",
      label: "End Timestamp",
      type: "text",
      required: true,
      placeholder: "2026-09-04T12:00:00Z",
      supportsMapping: true
    },
    {
      id: "duration_unit",
      label: "Output Unit",
      type: "select",
      defaultValue: "Hours",
      options: [
        { value: "Minutes", label: "Minutes" },
        { value: "Hours", label: "Hours" },
        { value: "Days", label: "Days" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    difference: 76,
    unit: "Hours"
  }
}

export const DATETIME_FORMATTER_CURRENT_SCHEMA: AppActionSchema = {
  appId: "datetime-formatter",
  actionId: "current_timestamp",
  actionName: "Generate Current Unix/ISO Timestamp",
  description: "Returns live date and time object at run time",
  fields: [
    {
      id: "date_operation",
      label: "DateTime Operation",
      type: "select",
      required: true,
      defaultValue: "current_timestamp",
      options: [
        { value: "format_date", label: "Format Timestamp & Timezone" },
        { value: "add_subtract_time", label: "Add / Subtract Time (Hours/Days)" },
        { value: "time_difference", label: "Calculate Time Difference" },
        { value: "current_timestamp", label: "Generate Current Unix/ISO Timestamp" }
      ],
      supportsMapping: true
    },
    {
      id: "to_format",
      label: "Format",
      type: "select",
      defaultValue: "ISO_8601",
      options: [
        { value: "ISO_8601", label: "ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
        { value: "X", label: "Unix Epoch Seconds" }
      ],
      supportsMapping: true
    },
    {
      id: "to_timezone",
      label: "Timezone",
      type: "select",
      defaultValue: "UTC",
      options: [
        { value: "UTC", label: "UTC" },
        { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    current_time: new Date().toISOString(),
    epoch: Math.floor(Date.now() / 1000)
  }
}

export const DATETIME_FORMATTER_SCHEMA: AppActionSchema = DATETIME_FORMATTER_FORMAT_SCHEMA

export const NUMBER_FORMATTER_SPREADSHEET_SCHEMA: AppActionSchema = {
  appId: "number-formatter",
  actionId: "spreadsheet_formulas",
  actionName: "Spreadsheet Formulas (Excel / Google Sheets Style)",
  description: "Evaluates standard spreadsheet formulas like SUM, AVERAGE, IF, ROUND, DAYS, RANDBETWEEN, etc.",
  fields: [
    {
      id: "number_operation",
      label: "Number Operation",
      type: "select",
      required: true,
      defaultValue: "spreadsheet",
      options: [
        { value: "spreadsheet", label: "Spreadsheet Formulas (Excel / Google Sheets Style)" },
        { value: "math", label: "Math Formula Calculation (+, -, *, /)" },
        { value: "currency", label: "Format Currency / Number ($ / ₹ / €)" },
        { value: "round", label: "Round Up / Round Down Precision" },
        { value: "random", label: "Generate Random Number / OTP" }
      ],
      supportsMapping: true
    },
    {
      id: "formula",
      label: "Formula",
      type: "text",
      required: true,
      placeholder: "=SUM({{step_1.amount}}, 150)",
      helperText: "Enter the spreadsheet formula you want to execute (e.g., =SUM(A, B), =ROUND(A, 2), =IF(A > 100, 'High', 'Low'), =RANDBETWEEN(100, 999), =DAYS(end, start)). You can map dynamic tags from previous steps into the formula.",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    result: 1250,
    formula: "=SUM(1100, 150)",
    status: "SUCCESS"
  }
}

export const NUMBER_FORMATTER_MATH_SCHEMA: AppActionSchema = {
  appId: "number-formatter",
  actionId: "math_operation",
  actionName: "Math & Number Calculator",
  description: "Evaluates mathematical formulas and expressions",
  fields: [
    {
      id: "number_operation",
      label: "Number Operation",
      type: "select",
      required: true,
      defaultValue: "math",
      options: [
        { value: "spreadsheet", label: "Spreadsheet Formulas (Excel / Google Sheets Style)" },
        { value: "math", label: "Math Formula Calculation (+, -, *, /)" },
        { value: "currency", label: "Format Currency / Number ($ / ₹ / €)" },
        { value: "round", label: "Round Up / Round Down Precision" },
        { value: "random", label: "Generate Random Number / OTP" }
      ],
      supportsMapping: true
    },
    {
      id: "expression",
      label: "Formula / Math Expression",
      type: "text",
      required: true,
      placeholder: "{{step_1.amount}} * 1.18 + 50",
      helperText: "Supports standard arithmetic operators +, -, *, /, %, ()",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    result: 1226,
    expression: "1000 * 1.18 + 46",
    is_valid: true
  }
}

export const NUMBER_FORMATTER_CURRENCY_SCHEMA: AppActionSchema = {
  appId: "number-formatter",
  actionId: "format_currency",
  actionName: "Format Currency / Number ($ / ₹ / €)",
  description: "Formats number to international currency standard with regional locale and pattern controls",
  fields: [
    {
      id: "number_operation",
      label: "Number Operation",
      type: "select",
      required: true,
      defaultValue: "currency",
      options: [
        { value: "spreadsheet", label: "Spreadsheet Formulas (Excel / Google Sheets Style)" },
        { value: "math", label: "Math Formula Calculation (+, -, *, /)" },
        { value: "currency", label: "Format Currency / Number ($ / ₹ / €)" },
        { value: "round", label: "Round Up / Round Down Precision" },
        { value: "random", label: "Generate Random Number / OTP" }
      ],
      supportsMapping: true
    },
    {
      id: "amount",
      label: "Number to Format",
      type: "text",
      required: true,
      placeholder: "4000 or {{step_1.amount}}",
      helperText: "Enter the numeric amount you would like to format as a currency (e.g. 12345, 4000.50) or map from previous step.",
      supportsMapping: true
    },
    {
      id: "currency_code",
      label: "Currency Code",
      type: "select",
      required: true,
      defaultValue: "USD",
      helperText: "Select standard 3-letter ISO currency code (e.g. USD, INR, EUR, GBP, AED) or toggle Map to bind dynamically.",
      options: [
        { value: "USD", label: "USD ($ - United States Dollar)" },
        { value: "INR", label: "INR (₹ - Indian Rupee)" },
        { value: "EUR", label: "EUR (€ - Euro)" },
        { value: "GBP", label: "GBP (£ - British Pound)" },
        { value: "AED", label: "AED (د.إ - UAE Dirham)" },
        { value: "CAD", label: "CAD ($ - Canadian Dollar)" },
        { value: "AUD", label: "AUD ($ - Australian Dollar)" },
        { value: "JPY", label: "JPY (¥ - Japanese Yen)" },
        { value: "SGD", label: "SGD ($ - Singapore Dollar)" },
        { value: "CHF", label: "CHF (CHF - Swiss Franc)" },
        { value: "CNY", label: "CNY (¥ - Chinese Yuan)" },
        { value: "SAR", label: "SAR (﷼ - Saudi Riyal)" },
        { value: "QAR", label: "QAR (﷼ - Qatari Riyal)" },
        { value: "KWD", label: "KWD (د.ك - Kuwaiti Dinar)" },
        { value: "BHD", label: "BHD (.د.ب - Bahraini Dinar)" },
        { value: "OMR", label: "OMR (﷼ - Omani Rial)" },
        { value: "NZD", label: "NZD ($ - New Zealand Dollar)" },
        { value: "HKD", label: "HKD ($ - Hong Kong Dollar)" },
        { value: "SEK", label: "SEK (kr - Swedish Krona)" },
        { value: "NOK", label: "NOK (kr - Norwegian Krone)" },
        { value: "DKK", label: "DKK (kr - Danish Krone)" },
        { value: "BRL", label: "BRL (R$ - Brazilian Real)" },
        { value: "MXN", label: "MXN ($ - Mexican Peso)" },
        { value: "ZAR", label: "ZAR (R - South African Rand)" },
        { value: "RUB", label: "RUB (₽ - Russian Ruble)" },
        { value: "TRY", label: "TRY (₺ - Turkish Lira)" },
        { value: "KRW", label: "KRW (₩ - South Korean Won)" },
        { value: "THB", label: "THB (฿ - Thai Baht)" },
        { value: "IDR", label: "IDR (Rp - Indonesian Rupiah)" },
        { value: "MYR", label: "MYR (RM - Malaysian Ringgit)" },
        { value: "PHP", label: "PHP (₱ - Philippine Peso)" },
        { value: "VND", label: "VND (₫ - Vietnamese Dong)" },
        { value: "PLN", label: "PLN (zł - Polish Zloty)" },
        { value: "ILS", label: "ILS (₪ - Israeli Shekel)" },
        { value: "EGP", label: "EGP (E£ - Egyptian Pound)" },
        { value: "NGN", label: "NGN (₦ - Nigerian Naira)" },
        { value: "KES", label: "KES (KSh - Kenyan Shilling)" },
        { value: "PKR", label: "PKR (₨ - Pakistani Rupee)" },
        { value: "BDT", label: "BDT (৳ - Bangladeshi Taka)" }
      ],
      supportsMapping: true
    },
    {
      id: "currency_locale",
      label: "Currency Locale",
      type: "select",
      required: true,
      defaultValue: "en-US",
      options: [
        { value: "en-US", label: "English (United States) — e.g. $1,234.56" },
        { value: "en-IN", label: "English (India) — e.g. ₹1,00,000.00 (Lakhs & Crores)" },
        { value: "en-GB", label: "English (United Kingdom) — e.g. £1,234.56" },
        { value: "de-DE", label: "German (Germany) — e.g. 1.234,56 € (Period thousands, comma decimal)" },
        { value: "fr-FR", label: "French (France) — e.g. 1 234,56 € (Space thousands, comma decimal)" },
        { value: "ja-JP", label: "Japanese (Japan) — e.g. ¥1,235 (Zero decimal default)" },
        { value: "ar-AE", label: "Arabic (UAE) — e.g. 1,234.56 د.إ" },
        { value: "es-ES", label: "Spanish (Spain) — e.g. 1.234,56 €" },
        { value: "it-IT", label: "Italian (Italy) — e.g. 1.234,56 €" },
        { value: "pt-BR", label: "Portuguese (Brazil) — e.g. R$ 1.234,56" },
        { value: "nl-NL", label: "Dutch (Netherlands) — e.g. € 1.234,56" },
        { value: "zh-CN", label: "Chinese (China) — e.g. ¥1,234.56" },
        { value: "en-AU", label: "English (Australia) — e.g. $1,234.56" },
        { value: "en-CA", label: "English (Canada) — e.g. $1,234.56" }
      ],
      helperText: "Choose or map the currency locale. This determines regional grouping (e.g. Indian Lakhs vs Western Millions, or Comma vs Period decimals).",
      supportsMapping: true
    },
    {
      id: "currency_format",
      label: "Currency Format Pattern",
      type: "select",
      required: true,
      defaultValue: "¤#,##0.00",
      options: [
        // 1. Standard Symbol Before
        { value: "¤#,##0.00", label: "¤#,##0.00 — Symbol Before with 2 Decimals (e.g. $4,000.00 / ₹4,000.00)" },
        { value: "¤#,##0", label: "¤#,##0 — Symbol Before without Decimals (e.g. $4,000 / ₹4,000)" },
        { value: "¤#,##0.##", label: "¤#,##0.## — Symbol Before with Optional Decimals (e.g. $4,000 or $4,000.50)" },
        { value: "¤#,##0.000", label: "¤#,##0.000 — Symbol Before with 3 Decimals (e.g. $4,000.000 / د.ك4,000.000)" },
        
        // 2. Symbol Before with Space
        { value: "¤ #,##0.00", label: "¤ #,##0.00 — Symbol Before with Space & 2 Decimals (e.g. $ 4,000.00)" },
        { value: "¤ #,##0", label: "¤ #,##0 — Symbol Before with Space, No Decimals (e.g. $ 4,000)" },
        { value: "¤ #,##0.##", label: "¤ #,##0.## — Symbol Before with Space & Optional Decimals (e.g. $ 4,000.50)" },

        // 3. Symbol After with Space
        { value: "#,##0.00 ¤", label: "#,##0.00 ¤ — Symbol After with Space & 2 Decimals (e.g. 4.000,00 €)" },
        { value: "#,##0 ¤", label: "#,##0 ¤ — Symbol After with Space, No Decimals (e.g. 4.000 €)" },
        { value: "#,##0.## ¤", label: "#,##0.## ¤ — Symbol After with Space & Optional Decimals (e.g. 4.000,50 €)" },

        // 4. Symbol After without Space
        { value: "#,##0.00¤", label: "#,##0.00¤ — Symbol After without Space & 2 Decimals (e.g. 4,000.00€)" },
        { value: "#,##0¤", label: "#,##0¤ — Symbol After without Space, No Decimals (e.g. 4,000€)" },
        { value: "#,##0.##¤", label: "#,##0.##¤ — Symbol After without Space & Optional Decimals (e.g. 4,000.50€)" },

        // 5. Numeric Only (No Symbol)
        { value: "#,##0.00", label: "#,##0.00 — Numeric Only with 2 Decimals (e.g. 4,000.00)" },
        { value: "#,##0", label: "#,##0 — Numeric Only without Decimals (e.g. 4,000)" },
        { value: "#,##0.##", label: "#,##0.## — Numeric Only with Optional Decimals (e.g. 4,000.50 or 4,000)" },
        { value: "#,##0.000", label: "#,##0.000 — Numeric Only with 3 Decimals (e.g. 4,000.000)" },
        { value: "0.00", label: "0.00 — Plain Number with 2 Decimals, No Thousands Separator (e.g. 4000.00)" },
        { value: "0", label: "0 — Plain Integer, No Separator or Decimals (e.g. 4000)" },

        // 6. ISO 3-Letter Code
        { value: "¤¤ #,##0.00", label: "¤¤ #,##0.00 — 3-Letter Code Before with 2 Decimals (e.g. USD 4,000.00)" },
        { value: "¤¤ #,##0", label: "¤¤ #,##0 — 3-Letter Code Before without Decimals (e.g. USD 4,000)" },
        { value: "#,##0.00 ¤¤", label: "#,##0.00 ¤¤ — 3-Letter Code After with 2 Decimals (e.g. 4,000.00 USD)" },
        { value: "#,##0 ¤¤", label: "#,##0 ¤¤ — 3-Letter Code After without Decimals (e.g. 4,000 USD)" },

        // 7. Accounting / Financial (Parentheses for Negative)
        { value: "¤#,##0.00;(¤#,##0.00)", label: "¤#,##0.00;(¤#,##0.00) — Accounting Format with Symbol (Parentheses for Negative: ($4,000.00))" },
        { value: "#,##0.00;(#,##0.00)", label: "#,##0.00;(#,##0.00) — Accounting Format without Symbol ((4,000.00))" }
      ],
      helperText: "Choose standard display pattern or toggle Map to bind dynamically.",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    formatted_currency: "$4,000.00",
    amount: 4000,
    currency_code: "USD",
    currency_locale: "en-US",
    currency_symbol: "$",
    raw_number: 4000,
    status: "SUCCESS"
  }
}

export const NUMBER_FORMATTER_ROUND_SCHEMA: AppActionSchema = {
  appId: "number-formatter",
  actionId: "round_number",
  actionName: "Round Up / Round Down Precision",
  description: "Rounds number to specified decimal places or nearest integer",
  fields: [
    {
      id: "number_operation",
      label: "Number Operation",
      type: "select",
      required: true,
      defaultValue: "round",
      options: [
        { value: "spreadsheet", label: "Spreadsheet Formulas (Excel / Google Sheets Style)" },
        { value: "math", label: "Math Formula Calculation (+, -, *, /)" },
        { value: "currency", label: "Format Currency / Number ($ / ₹ / €)" },
        { value: "round", label: "Round Up / Round Down Precision" },
        { value: "random", label: "Generate Random Number / OTP" }
      ],
      supportsMapping: true
    },
    {
      id: "input_number",
      label: "Input Number",
      type: "text",
      required: true,
      placeholder: "145.892",
      supportsMapping: true
    },
    {
      id: "round_direction",
      label: "Rounding Direction",
      type: "select",
      defaultValue: "nearest",
      options: [
        { value: "nearest", label: "Round to Nearest" },
        { value: "ceil", label: "Round Up (Ceil)" },
        { value: "floor", label: "Round Down (Floor)" }
      ],
      supportsMapping: true
    },
    {
      id: "precision",
      label: "Decimal Places Precision",
      type: "number",
      defaultValue: 2,
      supportsMapping: true
    }
  ],
  sampleOutput: {
    rounded: 145.89,
    original: 145.892
  }
}

export const NUMBER_FORMATTER_RANDOM_SCHEMA: AppActionSchema = {
  appId: "number-formatter",
  actionId: "random_number",
  actionName: "Generate Random Number / OTP",
  description: "Generates a random integer or security code within a range",
  fields: [
    {
      id: "number_operation",
      label: "Number Operation",
      type: "select",
      required: true,
      defaultValue: "random",
      options: [
        { value: "spreadsheet", label: "Spreadsheet Formulas (Excel / Google Sheets Style)" },
        { value: "math", label: "Math Formula Calculation (+, -, *, /)" },
        { value: "currency", label: "Format Currency / Number ($ / ₹ / €)" },
        { value: "round", label: "Round Up / Round Down Precision" },
        { value: "random", label: "Generate Random Number / OTP" }
      ],
      supportsMapping: true
    },
    {
      id: "min_value",
      label: "Minimum Value",
      type: "number",
      defaultValue: 100000,
      placeholder: "100000",
      supportsMapping: true
    },
    {
      id: "max_value",
      label: "Maximum Value",
      type: "number",
      defaultValue: 999999,
      placeholder: "999999",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    random_number: 481920,
    range: "100000 - 999999"
  }
}

export const NUMBER_FORMATTER_SCHEMA: AppActionSchema = NUMBER_FORMATTER_SPREADSHEET_SCHEMA

export const API_WEBHOOK_SCHEMA: AppActionSchema = {
  appId: "api-webhook",
  actionId: "send_custom_http",
  actionName: "Custom HTTP REST API Request",
  description: "Dispatches authenticated HTTP requests to any third-party REST API",
  fields: [
    {
      id: "method",
      label: "HTTP Method",
      type: "select",
      required: true,
      defaultValue: "POST",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "PATCH", label: "PATCH" },
        { value: "DELETE", label: "DELETE" }
      ],
      supportsMapping: true
    },
    {
      id: "endpoint_url",
      label: "API Endpoint URL",
      type: "text",
      required: true,
      placeholder: "https://api.external.com/v1/orders/{{step_1.id}}",
      supportsMapping: true
    },
    {
      id: "auth_type",
      label: "Authentication Type",
      type: "select",
      defaultValue: "bearer",
      options: [
        { value: "none", label: "No Authentication" },
        { value: "bearer", label: "Bearer Token" },
        { value: "basic", label: "Basic Auth (Username/Password)" },
        { value: "header", label: "Custom API Key Header" }
      ],
      supportsMapping: true
    },
    {
      id: "auth_token",
      label: "Bearer Token / API Key",
      type: "text",
      placeholder: "sec_token_98412...",
      supportsMapping: true
    },
    {
      id: "request_body",
      label: "JSON Request Payload",
      type: "textarea",
      placeholder: "{\n  \"email\": \"{{step_1.email}}\",\n  \"status\": \"APPROVED\"\n}",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    status_code: 200,
    status_text: "OK",
    latency_ms: 148,
    data: {
      success: true,
      id: "resp_99812",
      message: "Order successfully synced"
    }
  }
}

export const API_SCHEMA: AppActionSchema = API_WEBHOOK_SCHEMA

export const WEBHOOK_TRIGGER_SCHEMA: AppActionSchema = {
  appId: "webhook",
  actionId: "catch_raw_webhook",
  actionName: "Catch Webhook (Instant)",
  description: "Captures real-time incoming HTTP POST/GET requests at a dedicated endpoint URL",
  fields: [
    {
      id: "simple_response",
      label: "Simple Response",
      type: "select",
      required: true,
      defaultValue: "yes",
      options: [
        { value: "yes", label: "Yes (Recommended - Flatten JSON into simple variables)" },
        { value: "no", label: "No (Advanced - Retain nested JSON objects and arrays)" }
      ],
      helperText: "When 'Yes', nested JSON structures are automatically flattened into easy-to-use variables."
    },
    {
      id: "http_method",
      label: "Accepted HTTP Method",
      type: "select",
      defaultValue: "POST",
      options: [
        { value: "POST", label: "POST (Standard Webhook payload)" },
        { value: "GET", label: "GET (Query parameter URL parameters)" },
        { value: "ANY", label: "ANY (Accept both POST and GET requests)" }
      ],
      helperText: "HTTP request method to listen for from the external service."
    }
  ],
  sampleOutput: {
    event_id: "evt_live_89124",
    event_type: "checkout.session.completed",
    timestamp: "2026-09-07T11:15:00Z",
    customer_name: "Alex Johnson",
    customer_email: "alex.johnson@example.com",
    customer_phone: "+1 555-0199",
    order_id: "ord_99824",
    order_amount: 149.50,
    currency: "USD",
    payment_status: "PAID",
    source_channel: "Direct Webhook",
    line_items_count: 2
  }
}

export const WEBHOOK_HEADERS_SCHEMA: AppActionSchema = {
  appId: "webhook",
  actionId: "catch_webhook_headers",
  actionName: "Catch Webhook with Headers",
  description: "Captures full request body along with HTTP headers (Authorization, X-Signature, User-Agent)",
  fields: [
    {
      id: "simple_response",
      label: "Simple Response",
      type: "select",
      required: true,
      defaultValue: "yes",
      options: [
        { value: "yes", label: "Yes (Recommended - Flatten JSON into simple variables)" },
        { value: "no", label: "No (Advanced - Retain nested JSON objects and arrays)" }
      ],
      helperText: "When 'Yes', nested JSON structures are automatically flattened into easy-to-use variables."
    },
    {
      id: "capture_headers",
      label: "Capture Request Headers",
      type: "select",
      defaultValue: "all",
      options: [
        { value: "all", label: "All Headers (Authorization, Content-Type, Signatures)" },
        { value: "custom", label: "Security & Signature Headers Only" }
      ]
    }
  ],
  sampleOutput: {
    event_id: "evt_live_89124",
    customer_name: "Alex Johnson",
    customer_email: "alex.johnson@example.com",
    order_amount: 149.50,
    headers_authorization: "Bearer sec_live_tok_99182",
    headers_user_agent: "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
    headers_content_type: "application/json",
    headers_x_signature: "sha256=d3b07384d113edec49eaa6238ad5ff00"
  }
}

export const WEBHOOK_RESPONSE_SCHEMA: AppActionSchema = {
  appId: "webhook",
  actionId: "custom_webhook_response",
  actionName: "Custom Webhook Response",
  description: "Returns custom HTTP status code & JSON response to the webhook caller",
  fields: [
    {
      id: "response_code",
      label: "HTTP Status Code",
      type: "select",
      required: true,
      defaultValue: "200",
      options: [
        { value: "200", label: "200 OK (Request succeeded)" },
        { value: "201", label: "201 Created" },
        { value: "202", label: "202 Accepted (Queued for execution)" },
        { value: "400", label: "400 Bad Request" },
        { value: "404", label: "404 Not Found" }
      ],
      supportsMapping: true
    },
    {
      id: "response_content_type",
      label: "Response Content-Type",
      type: "select",
      defaultValue: "application/json",
      options: [
        { value: "application/json", label: "application/json (JSON Object)" },
        { value: "text/plain", label: "text/plain (Raw String)" },
        { value: "text/html", label: "text/html (HTML Snippet)" }
      ]
    },
    {
      id: "response_body",
      label: "Custom Response Body",
      type: "textarea",
      placeholder: "{\n  \"status\": \"success\",\n  \"message\": \"Webhook processed for {{step_1.customer_email}}\",\n  \"execution_id\": \"{{step_1.event_id}}\"\n}",
      supportsMapping: true,
      helperText: "JSON or text payload returned immediately to the calling application."
    }
  ],
  sampleOutput: {
    status_code: 200,
    response_delivered: true,
    sent_at: "2026-09-07T11:15:00Z",
    caller_ip: "54.187.205.235"
  }
}

export const WEBHOOK_SCHEMA: AppActionSchema = WEBHOOK_TRIGGER_SCHEMA

export const CODE_RUNNER_SCHEMA: AppActionSchema = {
  appId: "code-runner",
  actionId: "run_javascript",
  actionName: "Execute Custom JavaScript",
  description: "Runs custom JavaScript (Node.js 20) with variable input injection",
  fields: [
    {
      id: "input_variables",
      label: "Input Variables Mapping (JSON / Key-Value)",
      type: "text",
      placeholder: "amount: {{step_1.amount}}, email: {{step_1.email}}",
      helperText: "Variables become available under the global `inputData` object",
      supportsMapping: true
    },
    {
      id: "code_snippet",
      label: "JavaScript Code Body",
      type: "code",
      required: true,
      defaultValue: `// Access mapped variables via inputData object
const baseAmount = Number(inputData.amount || 100);
const taxAmount = baseAmount * 0.18;
const grandTotal = baseAmount + taxAmount;

return {
  base: baseAmount,
  tax: taxAmount,
  total: grandTotal,
  timestamp: new Date().toISOString()
};`,
      helperText: "Must end with a return statement returning an object or primitive"
    }
  ],
  sampleOutput: {
    base: 100,
    tax: 18,
    total: 118,
    timestamp: "2026-09-04T12:00:00.000Z",
    execution_ms: 12
  }
}

export const CODE_RUNNER_PYTHON_SCHEMA: AppActionSchema = {
  appId: "code-runner",
  actionId: "run_python",
  actionName: "Run Python 3.11 Script",
  description: "Executes custom Python 3.11 code with variable input dictionary injection",
  fields: [
    {
      id: "input_variables",
      label: "Input Variables Mapping (JSON / Key-Value)",
      type: "text",
      placeholder: "amount: {{step_1.amount}}, email: {{step_1.email}}",
      helperText: "Variables become available inside the Python script via the `input_data` dictionary",
      supportsMapping: true
    },
    {
      id: "code_snippet",
      label: "Python 3.11 Script Body",
      type: "code",
      required: true,
      defaultValue: `# Access mapped variables via input_data dictionary
base_amount = float(input_data.get("amount", 100))
tax_amount = round(base_amount * 0.18, 2)
grand_total = round(base_amount + tax_amount, 2)

# Return final results by defining the 'output' dictionary
output = {
    "base": base_amount,
    "tax": tax_amount,
    "total": grand_total,
    "status": "SUCCESS"
}`,
      helperText: "Assign the output dictionary to the global `output` variable"
    }
  ],
  sampleOutput: {
    base: 100,
    tax: 18,
    total: 118,
    status: "SUCCESS",
    execution_ms: 15
  }
}

export const LOOKUP_TABLE_SCHEMA: AppActionSchema = {
  appId: "lookup-table",
  actionId: "lookup_mapping",
  actionName: "Lookup Key Value Matcher",
  description: "Translates abbreviations, IDs, or codes to full human labels",
  fields: [
    {
      id: "lookup_key",
      label: "Lookup Key Variable",
      type: "text",
      required: true,
      placeholder: "{{step_1.country_code}}",
      supportsMapping: true
    },
    {
      id: "table_pairs",
      label: "Mapping Dictionary",
      type: "textarea",
      defaultValue: "US=United States\nIN=India\nUK=United Kingdom\nCA=Canada\nAU=Australia",
      helperText: "Format: KEY=VALUE per line",
      supportsMapping: true
    },
    {
      id: "fallback_value",
      label: "Fallback Default (If Key Not Found)",
      type: "text",
      defaultValue: "Other / International",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    matched_key: "IN",
    resolved_value: "India",
    matched: true
  }
}

export const DYNAMIC_DICTIONARY_SCHEMA: AppActionSchema = {
  appId: "lookup-table",
  actionId: "dynamic_dictionary",
  actionName: "Dynamic Dictionary Token Swap",
  description: "Replaces multiple template placeholder tokens with mapped dictionary values",
  fields: [
    {
      id: "source_text",
      label: "Source Template String with Placeholders",
      type: "textarea",
      required: true,
      placeholder: "Dear {{TITLE}} {{LAST_NAME}}, your invoice #{{INV_NUM}} for ${{AMOUNT}} is ready.",
      helperText: "Text string containing tokens like {{KEY}} to be replaced",
      supportsMapping: true
    },
    {
      id: "dictionary_tokens",
      label: "Replacement Dictionary (KEY=VALUE per line)",
      type: "textarea",
      required: true,
      defaultValue: "TITLE=Mr.\nLAST_NAME={{step_1.last_name}}\nINV_NUM=INV-9902\nAMOUNT=1,250",
      helperText: "Specify replacement values. Format: TOKEN=REPLACEMENT per line",
      supportsMapping: true
    },
    {
      id: "match_mode",
      label: "Matching Sensitivity",
      type: "select",
      defaultValue: "case_insensitive",
      options: [
        { value: "case_insensitive", label: "Case-Insensitive (Replaces {{NAME}} and {{name}})" },
        { value: "exact", label: "Exact Match Only (Strict Case)" },
        { value: "word_boundary", label: "Whole Word Tokens Only" }
      ],
      supportsMapping: true
    },
    {
      id: "unmatched_strategy",
      label: "Unmatched Tokens Handling",
      type: "select",
      defaultValue: "keep",
      options: [
        { value: "keep", label: "Keep Original Placeholder (e.g. leave {{CUSTOM_ID}} as-is)" },
        { value: "remove", label: "Remove Unmatched Tokens (Replace with empty string)" },
        { value: "fallback", label: "Replace with Fallback Value" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    rendered_text: "Dear Mr. Johnson, your invoice #INV-9902 for $1,250 is ready.",
    tokens_replaced_count: 4,
    unmatched_count: 0
  }
}

export const HUMAN_APPROVAL_SCHEMA: AppActionSchema = {
  appId: "human-approval",
  actionId: "wait_for_approval",
  actionName: "Request Email Approval",
  description: "Pauses workflow until team member reviews and approves via link",
  fields: [
    {
      id: "approver_email",
      label: "Approver Email Address",
      type: "text",
      required: true,
      placeholder: "manager@company.com or {{step_1.manager_email}}",
      supportsMapping: true
    },
    {
      id: "approval_title",
      label: "Approval Request Subject",
      type: "text",
      required: true,
      placeholder: "Review Discount Request for {{step_1.name}}",
      supportsMapping: true
    },
    {
      id: "approval_notes",
      label: "Details & Context for Reviewer",
      type: "textarea",
      placeholder: "Customer has requested a custom tier discount of ${{step_1.amount}}.",
      supportsMapping: true
    },
    {
      id: "approve_button_label",
      label: "Approve Button Label",
      type: "text",
      defaultValue: "Approve",
      placeholder: "e.g. Approve, Accept Quote, or Authorize {{step_1.amount}}",
      helperText: "Custom label for the positive approval button in the email (supports variable mapping)",
      supportsMapping: true
    },
    {
      id: "reject_button_label",
      label: "Reject Button Label",
      type: "text",
      defaultValue: "Reject",
      placeholder: "e.g. Reject, Decline Request, or Request Revisions",
      helperText: "Custom label for the rejection button in the email (supports variable mapping)",
      supportsMapping: true
    },
    {
      id: "timeout_duration",
      label: "Expiration Timeout",
      type: "select",
      defaultValue: "24_hours",
      options: [
        { value: "1_hour", label: "1 Hour" },
        { value: "24_hours", label: "24 Hours" },
        { value: "7_days", label: "7 Days" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    decision: "APPROVED",
    approver: "manager@company.com",
    button_clicked: "Approve",
    approved_at: "2026-09-04T12:15:00Z"
  }
}

export const HUMAN_INPUT_FORM_SCHEMA: AppActionSchema = {
  appId: "human-approval",
  actionId: "request_user_input",
  actionName: "Pause Workflow for Manual Form Fill",
  description: "Pauses workflow and prompts a team member to fill in missing information",
  fields: [
    {
      id: "assigned_user_email",
      label: "Assigned User / Reviewer Email",
      type: "text",
      required: true,
      placeholder: "ops-manager@company.com or {{step_1.agent_email}}",
      helperText: "The team member who receives the notification to fill out the form",
      supportsMapping: true
    },
    {
      id: "form_title",
      label: "Task / Form Title",
      type: "text",
      required: true,
      placeholder: "Enter Shipping Tracking Number for Order #{{step_1.order_id}}",
      supportsMapping: true
    },
    {
      id: "form_instructions",
      label: "Instructions & Context for Assignee",
      type: "textarea",
      placeholder: "Please verify warehouse dispatch status and enter the carrier tracking code.",
      helperText: "Displayed directly on the manual input form interface",
      supportsMapping: true
    },
    {
      id: "fields_to_collect",
      label: "Form Fields to Collect",
      type: "text",
      required: true,
      defaultValue: "Tracking Number, Carrier Name, Dispatched Date:date, Notes:textarea",
      helperText: "Define the form fields to collect from assignees. Click \"+ Add Blank Field\" to configure field names, types, choices, and validation.",
      supportsMapping: true
    },
    {
      id: "timeout_duration",
      label: "Form Expiration Timeout",
      type: "select",
      defaultValue: "24_hours",
      options: [
        { value: "1_hour", label: "1 Hour" },
        { value: "12_hours", label: "12 Hours" },
        { value: "24_hours", label: "24 Hours" },
        { value: "3_days", label: "3 Days" },
        { value: "7_days", label: "7 Days" }
      ],
      supportsMapping: true
    }
  ],
  sampleOutput: {
    status: "COMPLETED",
    submitted_by: "ops-manager@company.com",
    submitted_at: "2026-09-08T10:15:00Z",
    form_data: {
      tracking_number: "TRK-98214-US",
      carrier_name: "FedEx Express",
      dispatched_date: "2026-09-08"
    }
  }
}

export const AUTOMATE_FORMS_LINK_SCHEMA: AppActionSchema = {
  appId: "automate-forms",
  actionId: "create_form_link",
  actionName: "Generate Prefilled Form Link",
  description: "Generates a unique prefilled URL for customer submissions",
  fields: [
    {
      id: "form_id",
      label: "Select Automate Form",
      type: "select",
      required: true,
      defaultValue: "form_lead_capture",
      options: [
        { value: "form_lead_capture", label: "VIP Lead Intake Form (Organization Default)" },
        { value: "form_customer_feedback", label: "Post-Purchase Customer CSAT Survey" },
        { value: "form_support_onboarding", label: "Client Enterprise Onboarding Questionnaire" },
        { value: "form_event_registration", label: "Webinar & Product Demo Registration" }
      ],
      supportsMapping: true
    },
    {
      id: "prefill_answers",
      label: "Prefilled Answers (Key=Value per line)",
      type: "textarea",
      placeholder: "first_name={{step_1.first_name}}\nemail={{step_1.email}}\ncompany={{step_1.company}}",
      helperText: "Pre-populates fields so the recipient doesn't have to retype existing data",
      supportsMapping: true
    },
    {
      id: "link_expiry_days",
      label: "Link Validity Duration",
      type: "select",
      defaultValue: "7_days",
      options: [
        { value: "24_hours", label: "24 Hours" },
        { value: "3_days", label: "3 Days" },
        { value: "7_days", label: "7 Days" },
        { value: "30_days", label: "30 Days" },
        { value: "no_expiry", label: "Never Expire" }
      ],
      supportsMapping: true
    },
    {
      id: "single_use",
      label: "Single-Use Link (Invalidate after submission)",
      type: "boolean",
      defaultValue: true,
      helperText: "Ensures the link cannot be submitted more than once"
    }
  ],
  sampleOutput: {
    form_id: "form_lead_capture",
    prefilled_url: "https://forms.automate.io/f/vip-lead?token=sec_98124&email=client@co.com",
    expires_at: "2026-09-15T12:00:00Z",
    status: "GENERATED"
  }
}

export const AUTOMATE_FORMS_DISABLE_SCHEMA: AppActionSchema = {
  appId: "automate-forms",
  actionId: "disable_form",
  actionName: "Pause / Close Form Submissions",
  description: "Toggles form status to inactive when quotas are reached or deadlines pass",
  fields: [
    {
      id: "form_id",
      label: "Select Automate Form",
      type: "select",
      required: true,
      defaultValue: "form_lead_capture",
      options: [
        { value: "form_lead_capture", label: "VIP Lead Intake Form (Organization Default)" },
        { value: "form_customer_feedback", label: "Post-Purchase Customer CSAT Survey" },
        { value: "form_support_onboarding", label: "Client Enterprise Onboarding Questionnaire" },
        { value: "form_event_registration", label: "Webinar & Product Demo Registration" }
      ],
      supportsMapping: true
    },
    {
      id: "close_reason",
      label: "Closure Message Displayed to Visitors",
      type: "textarea",
      defaultValue: "Thank you for your interest! This form is now closed as maximum capacity has been reached.",
      supportsMapping: true
    },
    {
      id: "redirect_url",
      label: "Redirect URL (Optional)",
      type: "text",
      placeholder: "https://mycompany.com/registration-closed",
      helperText: "Optional page to redirect visitors when visiting closed form link",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    form_id: "form_lead_capture",
    status: "CLOSED",
    closed_at: "2026-09-08T10:15:00Z"
  }
}

export const GOOGLE_FORMS_CREATE_SCHEMA: AppActionSchema = {
  appId: "google-forms",
  actionId: "create_gform",
  actionName: "Create Blank Google Form",
  description: "Generates a new form shell under connected Google Drive account",
  fields: [
    {
      id: "form_title",
      label: "Google Form Title",
      type: "text",
      required: true,
      placeholder: "Q4 Customer Satisfaction Survey {{step_1.campaign_name}}",
      supportsMapping: true
    },
    {
      id: "form_description",
      label: "Form Description / Subtitle",
      type: "textarea",
      placeholder: "Please take 2 minutes to provide feedback on your recent purchase.",
      supportsMapping: true
    },
    {
      id: "collect_emails",
      label: "Collect Respondent Email Addresses",
      type: "boolean",
      defaultValue: true
    },
    {
      id: "allow_edit_response",
      label: "Allow Respondents to Edit After Submission",
      type: "boolean",
      defaultValue: false
    }
  ],
  sampleOutput: {
    form_id: "1FAIpQLSc98F12aBcDeFgHiJkLmNoPqRsTuVwXyZ",
    form_url: "https://docs.google.com/forms/d/e/1FAIpQLSc98F12a/viewform",
    edit_url: "https://docs.google.com/forms/d/1FAIpQLSc98F12a/edit",
    title: "Q4 Customer Satisfaction Survey"
  }
}

export const GOOGLE_FORMS_RESPONSES_SCHEMA: AppActionSchema = {
  appId: "google-forms",
  actionId: "get_gform_responses",
  actionName: "Fetch All Form Responses",
  description: "Retrieves submitted response data for analysis and export",
  fields: [
    {
      id: "form_id",
      label: "Google Form ID or Public URL",
      type: "text",
      required: true,
      placeholder: "1FAIpQLSc98F12a or https://docs.google.com/forms/d/...",
      helperText: "Paste the Google Form ID or edit link",
      supportsMapping: true
    },
    {
      id: "filter_since",
      label: "Fetch Responses Submitted Since",
      type: "datetime",
      placeholder: "YYYY-MM-DDTHH:mm:ssZ or {{step_1.last_sync_time}}",
      helperText: "Leave blank to fetch all historical responses",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    total_responses: 42,
    latest_response_id: "resp_gform_98124",
    respondent_email: "alex@company.com",
    submitted_at: "2026-09-08T09:30:00Z"
  }
}

export const GOOGLE_FORMS_SUBMIT_SCHEMA: AppActionSchema = {
  appId: "google-forms",
  actionId: "submit_gform_response",
  actionName: "Submit Form Response Programmatically",
  description: "Posts form submission programmatically via Google Forms API",
  fields: [
    {
      id: "form_id",
      label: "Google Form ID or View URL",
      type: "text",
      required: true,
      placeholder: "1FAIpQLSc98F12a or https://docs.google.com/forms/d/e/...",
      supportsMapping: true
    },
    {
      id: "field_answers",
      label: "Question Answers (Entry ID or Label = Value)",
      type: "textarea",
      required: true,
      placeholder: "Full Name={{step_1.name}}\nEmail={{step_1.email}}\nFeedback Rating=5",
      helperText: "Format: Question Title or entry.123456=Answer Value per line",
      supportsMapping: true
    }
  ],
  sampleOutput: {
    response_id: "resp_sub_89124",
    status: "SUBMITTED",
    submitted_at: "2026-09-08T10:15:00Z"
  }
}

export const GOOGLE_FORMS_SETTINGS_SCHEMA: AppActionSchema = {
  appId: "google-forms",
  actionId: "update_gform_settings",
  actionName: "Update Form Settings & Title",
  description: "Modifies Google Form title, description, and confirmation message",
  fields: [
    {
      id: "form_id",
      label: "Google Form ID",
      type: "text",
      required: true,
      placeholder: "1FAIpQLSc98F12a",
      supportsMapping: true
    },
    {
      id: "updated_title",
      label: "New Form Title",
      type: "text",
      placeholder: "Updated Lead Intake Survey",
      supportsMapping: true
    },
    {
      id: "confirmation_message",
      label: "Post-Submission Confirmation Message",
      type: "textarea",
      placeholder: "Thank you! Your response has been recorded. Our team will contact you shortly.",
      supportsMapping: true
    },
    {
      id: "is_quiz",
      label: "Enable Quiz Grading Mode",
      type: "boolean",
      defaultValue: false
    }
  ],
  sampleOutput: {
    form_id: "1FAIpQLSc98F12a",
    updated: true,
    status: "SAVED"
  }
}

export const GOOGLE_FORMS_SCHEMA: AppActionSchema = GOOGLE_FORMS_CREATE_SCHEMA

// --- SHOPIFY ACTION SCHEMAS ---
export const SHOPIFY_UPDATE_TAGS_SCHEMA: AppActionSchema = {
  appId: "shopify",
  actionId: "update_order_tags",
  actionName: "Update Order Tags",
  description: "Adds, replaces, or removes tags on a Shopify order",
  fields: [
    { id: "order_id", label: "Order ID", type: "text", required: true, placeholder: "{{step_1.id}} or 51239847291", helperText: "Shopify internal numeric order identifier", supportsMapping: true },
    { id: "tags_to_add", label: "Tags to Add", type: "text", required: true, placeholder: "VIP_CUSTOMER, PRIORITY_SHIP, PROCESSED", helperText: "Comma-separated list of tags to append to the order", supportsMapping: true },
    { id: "tags_to_remove", label: "Tags to Remove (Optional)", type: "text", placeholder: "PENDING_REVIEW, UNVERIFIED", helperText: "Comma-separated list of tags to delete from the order", supportsMapping: true }
  ],
  sampleOutput: { order_id: "51239847291", updated_tags: ["VIP_CUSTOMER", "PRIORITY_SHIP", "PROCESSED"], status: "UPDATED" }
}

export const SHOPIFY_DISCOUNT_SCHEMA: AppActionSchema = {
  appId: "shopify",
  actionId: "create_discount_code",
  actionName: "Generate Custom Discount Coupon",
  description: "Creates a unique discount coupon code in Shopify",
  fields: [
    { id: "discount_code", label: "Discount Code", type: "text", required: true, placeholder: "SAVE20-{{step_1.customer_id}}", helperText: "Unique voucher promo code for customers to redeem at checkout", supportsMapping: true },
    { id: "discount_type", label: "Discount Type", type: "select", required: true, defaultValue: "percentage", options: [{ value: "percentage", label: "Percentage (%)" }, { value: "fixed_amount", label: "Fixed Currency Amount ($ / ₹)" }, { value: "free_shipping", label: "Free Shipping" }], helperText: "Type of discount to apply", supportsMapping: false },
    { id: "discount_value", label: "Discount Value", type: "number", required: true, placeholder: "20", helperText: "Percentage discount or monetary deduction amount", supportsMapping: true }
  ],
  sampleOutput: { discount_id: "disc_991823", code: "SAVE20", value: 20, type: "percentage" }
}

export const SHOPIFY_INVENTORY_SCHEMA: AppActionSchema = {
  appId: "shopify",
  actionId: "update_inventory",
  actionName: "Adjust Product Stock Quantity",
  description: "Updates inventory level for a specific product variant",
  fields: [
    { id: "inventory_item_id", label: "Inventory Item ID", type: "text", required: true, placeholder: "{{step_1.inventory_item_id}} or 41092831", helperText: "Shopify inventory item ID of the product variant", supportsMapping: true },
    { id: "adjustment_quantity", label: "Quantity Adjustment (+ / -)", type: "number", required: true, placeholder: "-1 or 50", helperText: "Positive number to add stock, negative number to deduct stock", supportsMapping: true }
  ],
  sampleOutput: { inventory_item_id: "41092831", available: 42, adjustment: -1 }
}

export const SHOPIFY_PRODUCT_SCHEMA: AppActionSchema = {
  appId: "shopify",
  actionId: "create_product",
  actionName: "Create New Product Catalog Item",
  description: "Publishes a new merchandise product to Shopify catalog",
  fields: [
    { id: "product_title", label: "Product Title", type: "text", required: true, placeholder: "Vintage Washed Cotton Cap", helperText: "Public listing title of the product", supportsMapping: true },
    { id: "product_price", label: "Price ($ / ₹)", type: "number", required: true, placeholder: "29.99", helperText: "Selling price for default variant", supportsMapping: true },
    { id: "product_description", label: "Product Description", type: "textarea", placeholder: "<p>100% premium cotton cap with adjustable brass strap.</p>", helperText: "HTML or plain text body description of the product", supportsMapping: true }
  ],
  sampleOutput: { product_id: "prod_781290", title: "Vintage Washed Cotton Cap", price: 29.99, status: "ACTIVE" }
}

// --- GMAIL ACTION SCHEMAS ---
export const GMAIL_CREATE_DRAFT_SCHEMA: AppActionSchema = {
  appId: "gmail",
  actionId: "create_draft",
  actionName: "Create Email Draft",
  description: "Creates an unsent email draft in Gmail mailbox for manual review before sending",
  fields: [
    { id: "to", label: "Recipient Email Address", type: "text", required: true, placeholder: "{{step_1.email}} or client@acme.com", helperText: "Draft recipient email address", supportsMapping: true },
    { id: "subject", label: "Email Subject", type: "text", required: true, placeholder: "Follow-up: Proposal for {{step_1.company_name}}", helperText: "Subject line of the email draft", supportsMapping: true },
    { id: "body_html", label: "Email Body Content (HTML or Plain Text)", type: "textarea", required: true, placeholder: "<p>Hi {{step_1.first_name}},</p><p>Drafted proposal details...</p>", helperText: "Body of the draft email", supportsMapping: true }
  ],
  sampleOutput: { draft_id: "draft_18f2a9e01b", message_id: "msg_draft_99182", thread_id: "thread_draft_1120" }
}

export const GMAIL_ADD_LABEL_SCHEMA: AppActionSchema = {
  appId: "gmail",
  actionId: "add_label",
  actionName: "Add Label to Email Thread",
  description: "Applies a custom folder label or category tag to a Gmail message thread",
  fields: [
    { id: "message_id", label: "Message ID / Thread ID", type: "text", required: true, placeholder: "{{step_1.id}} or 18f2a9e01b4c92", helperText: "Target Gmail message or thread ID", supportsMapping: true },
    { id: "label_name", label: "Label Name", type: "text", required: true, placeholder: "High Priority Leads", helperText: "Label tag to attach to the thread", supportsMapping: true }
  ],
  sampleOutput: { message_id: "18f2a9e01b4c92", labels_added: ["High Priority Leads"], status: "LABELED" }
}

export const GMAIL_REPLY_SCHEMA: AppActionSchema = {
  appId: "gmail",
  actionId: "reply_email",
  actionName: "Reply to Email Thread",
  description: "Sends a direct reply into an existing Gmail conversation thread",
  fields: [
    { id: "thread_id", label: "Thread ID", type: "text", required: true, placeholder: "{{step_1.thread_id}} or 18f2a9e01b4c92", helperText: "Conversation thread ID to reply within", supportsMapping: true },
    { id: "reply_body", label: "Reply Message Body", type: "textarea", required: true, placeholder: "Hi {{step_1.first_name}},\n\nThank you for reaching out! We received your request.", helperText: "Text or HTML response to add to the thread", supportsMapping: true }
  ],
  sampleOutput: { thread_id: "18f2a9e01b4c92", reply_id: "msg_reply_881920", status: "SENT" }
}

export const GMAIL_MARK_READ_SCHEMA: AppActionSchema = {
  appId: "gmail",
  actionId: "mark_as_read",
  actionName: "Mark Email as Read / Unread",
  description: "Updates read/unread flag on incoming Gmail message",
  fields: [
    { id: "message_id", label: "Message ID", type: "text", required: true, placeholder: "{{step_1.id}} or 18f2a9e01b4c92", helperText: "Unique message ID to modify", supportsMapping: true },
    { id: "status_flag", label: "Status Flag", type: "select", required: true, defaultValue: "read", options: [{ value: "read", label: "Mark as Read" }, { value: "unread", label: "Mark as Unread" }], helperText: "Choose target read status", supportsMapping: false }
  ],
  sampleOutput: { message_id: "18f2a9e01b4c92", is_read: true }
}

// --- SLACK ACTION SCHEMAS ---
export const SLACK_BLOCK_MSG_SCHEMA: AppActionSchema = {
  appId: "slack",
  actionId: "post_block_msg",
  actionName: "Post Formatted Block Layout",
  description: "Renders rich interactive Slack Block Kit message with sections and buttons",
  fields: [
    { id: "channel", label: "Channel Name or ID", type: "text", required: true, placeholder: "#sales-alerts or C01234567", helperText: "Public or private channel to post Block Kit JSON", supportsMapping: true },
    { id: "blocks_json", label: "Slack Blocks JSON Payload", type: "textarea", required: true, placeholder: "[{\"type\": \"section\", \"text\": {\"type\": \"mrkdwn\", \"text\": \"*New Lead:* {{step_1.name}}\"}}]", helperText: "Valid Slack Block Kit array JSON structure", supportsMapping: true }
  ],
  sampleOutput: { ok: true, channel: "C01234567", ts: "1689230912.019200" }
}

export const SLACK_UPLOAD_FILE_SCHEMA: AppActionSchema = {
  appId: "slack",
  actionId: "upload_file",
  actionName: "Upload File / Document",
  description: "Shares a file or PDF invoice attachment into a Slack channel",
  fields: [
    { id: "channel", label: "Channel Name or ID", type: "text", required: true, placeholder: "#invoices or C01234567", helperText: "Destination channel for file", supportsMapping: true },
    { id: "file_url", label: "File URL / Media Link", type: "text", required: true, placeholder: "{{step_1.invoice_pdf_url}}", helperText: "Direct downloadable URL or document file link", supportsMapping: true },
    { id: "initial_comment", label: "Comment / Message", type: "text", placeholder: "Attached invoice for order {{step_1.id}}", helperText: "Message attached to the uploaded file", supportsMapping: true }
  ],
  sampleOutput: { ok: true, file_id: "F01928301", name: "invoice.pdf" }
}

export const SLACK_SET_TOPIC_SCHEMA: AppActionSchema = {
  appId: "slack",
  actionId: "set_topic",
  actionName: "Update Channel Topic or Canvas",
  description: "Updates channel header topic banner description",
  fields: [
    { id: "channel", label: "Channel Name or ID", type: "text", required: true, placeholder: "#operations", helperText: "Channel to modify topic for", supportsMapping: true },
    { id: "topic", label: "New Topic Description", type: "text", required: true, placeholder: "Sprint 42 Focus: Onboarding | On-call: @john", helperText: "Banner topic string for channel header", supportsMapping: true }
  ],
  sampleOutput: { ok: true, topic: "Sprint 42 Focus" }
}

export const SLACK_CREATE_CHANNEL_SCHEMA: AppActionSchema = {
  appId: "slack",
  actionId: "create_channel",
  actionName: "Create Public/Private Channel",
  description: "Creates a dedicated collaboration channel in Slack workspace",
  fields: [
    { id: "name", label: "Channel Name", type: "text", required: true, placeholder: "deal-{{step_1.account_slug}}", helperText: "Slack channel name (lowercase, no spaces)", supportsMapping: true },
    { id: "is_private", label: "Privacy", type: "select", defaultValue: "public", options: [{ value: "public", label: "Public (Visible to entire team)" }, { value: "private", label: "Private (Invite only)" }], helperText: "Public or private channel", supportsMapping: false }
  ],
  sampleOutput: { ok: true, channel: { id: "C0918239", name: "deal-acme" } }
}

// --- GOOGLE SHEETS ACTION SCHEMAS ---
export const GOOGLE_SHEETS_DELETE_ROW_SCHEMA: AppActionSchema = {
  appId: "google-sheets",
  actionId: "delete_row",
  actionName: "Delete Row in Worksheet",
  description: "Removes specific row line index from a spreadsheet table",
  fields: [
    { id: "spreadsheet_id", label: "Spreadsheet", type: "select", required: true, defaultValue: "sheet_crm_leads", options: [{ value: "sheet_crm_leads", label: "CRM Leads & Inquiries" }, { value: "sheet_orders", label: "E-Commerce Orders Log" }], helperText: "Select Google Sheet", supportsMapping: false },
    { id: "sheet_name", label: "Worksheet Tab", type: "select", required: true, defaultValue: "Sheet1", options: [{ value: "Sheet1", label: "Sheet1" }, { value: "Archive", label: "Archive" }], helperText: "Worksheet tab containing the row", supportsMapping: false },
    { id: "row_number", label: "Row Index Number", type: "number", required: true, placeholder: "{{step_1.row_number}} or 5", helperText: "Exact row line number to remove (1-indexed, headers are row 1)", supportsMapping: true }
  ],
  sampleOutput: { deleted_row: 5, status: "SUCCESS" }
}

export const GOOGLE_SHEETS_CLEAR_ROW_SCHEMA: AppActionSchema = {
  appId: "google-sheets",
  actionId: "clear_row",
  actionName: "Clear Row Cell Contents",
  description: "Clears cell values from row without shifting adjacent rows",
  fields: [
    { id: "spreadsheet_id", label: "Spreadsheet", type: "select", required: true, defaultValue: "sheet_crm_leads", options: [{ value: "sheet_crm_leads", label: "CRM Leads & Inquiries" }, { value: "sheet_orders", label: "E-Commerce Orders Log" }], helperText: "Select Google Sheet", supportsMapping: false },
    { id: "row_number", label: "Row Number to Clear", type: "number", required: true, placeholder: "{{step_1.row_number}} or 12", helperText: "Row number to clear contents from", supportsMapping: true }
  ],
  sampleOutput: { cleared_row: 12, status: "CLEARED" }
}

export const GOOGLE_SHEETS_CREATE_WORKSHEET_SCHEMA: AppActionSchema = {
  appId: "google-sheets",
  actionId: "create_worksheet",
  actionName: "Create New Worksheet Tab",
  description: "Appends a new tab page with custom column headers",
  fields: [
    { id: "spreadsheet_id", label: "Spreadsheet", type: "select", required: true, defaultValue: "sheet_crm_leads", options: [{ value: "sheet_crm_leads", label: "CRM Leads & Inquiries" }, { value: "sheet_orders", label: "E-Commerce Orders Log" }], helperText: "Select target Google Sheet", supportsMapping: false },
    { id: "tab_title", label: "New Sheet Tab Title", type: "text", required: true, placeholder: "Reports_{{step_1.month}} or Q3_Data", helperText: "Name for the newly created worksheet tab", supportsMapping: true },
    { id: "column_headers", label: "Initial Column Headers (CSV)", type: "text", placeholder: "ID, Name, Email, Amount, Timestamp", helperText: "Comma-separated headers for Row 1", supportsMapping: true }
  ],
  sampleOutput: { sheet_id: 1928374, title: "Q3_Data", status: "CREATED" }
}

export const GOOGLE_SHEETS_BATCH_ROWS_SCHEMA: AppActionSchema = {
  appId: "google-sheets",
  actionId: "batch_add_rows",
  actionName: "Batch Insert Multiple Rows",
  description: "Appends multiple rows simultaneously from a structured JSON array",
  fields: [
    { id: "spreadsheet_id", label: "Spreadsheet", type: "select", required: true, defaultValue: "sheet_crm_leads", options: [{ value: "sheet_crm_leads", label: "CRM Leads & Inquiries" }, { value: "sheet_orders", label: "E-Commerce Orders Log" }], helperText: "Target Google Sheet", supportsMapping: false },
    { id: "rows_json_array", label: "Rows Array Data (JSON)", type: "textarea", required: true, placeholder: "{{step_2.aggregated_array}} or [[\"John\", \"john@acme.com\"], [\"Sarah\", \"sarah@acme.com\"]]", helperText: "2D array of rows or array of objects matching sheet headers", supportsMapping: true }
  ],
  sampleOutput: { inserted_rows: 5, updated_range: "Sheet1!A10:E15", status: "SUCCESS" }
}

// --- GOOGLE CALENDAR ACTION SCHEMAS ---
export const GOOGLE_CALENDAR_UPDATE_EVENT_SCHEMA: AppActionSchema = {
  appId: "google-calendar",
  actionId: "update_event",
  actionName: "Update Event Time or Location",
  description: "Modifies schedule timing or room link on an existing Google Calendar event",
  fields: [
    { id: "event_id", label: "Event ID", type: "text", required: true, placeholder: "{{step_1.calendar_event_id}} or c791823ab", helperText: "Unique Google Calendar event ID", supportsMapping: true },
    { id: "start_time", label: "New Start Date/Time", type: "datetime", required: true, placeholder: "YYYY-MM-DDTHH:mm:ss", helperText: "Rescheduled meeting start time", supportsMapping: true },
    { id: "end_time", label: "New End Date/Time", type: "datetime", required: true, placeholder: "YYYY-MM-DDTHH:mm:ss", helperText: "Rescheduled meeting end time", supportsMapping: true },
    { id: "location", label: "Updated Location or Link", type: "text", placeholder: "https://meet.google.com/abc-defg-hij", helperText: "Physical location or video call link", supportsMapping: true }
  ],
  sampleOutput: { event_id: "c791823ab", status: "confirmed", updated: new Date().toISOString() }
}

export const GOOGLE_CALENDAR_ADD_ATTENDEE_SCHEMA: AppActionSchema = {
  appId: "google-calendar",
  actionId: "add_attendee",
  actionName: "Add Attendee to Event",
  description: "Appends participant guest email addresses to a calendar invite",
  fields: [
    { id: "event_id", label: "Event ID", type: "text", required: true, placeholder: "{{step_1.calendar_event_id}}", helperText: "Target Google Calendar event ID", supportsMapping: true },
    { id: "attendee_email", label: "Guest Email Address", type: "text", required: true, placeholder: "{{step_1.email}} or invitee@partner.com", helperText: "Email address to receive calendar invitation", supportsMapping: true }
  ],
  sampleOutput: { event_id: "c791823ab", attendees_count: 3, status: "INVITED" }
}

export const GOOGLE_CALENDAR_DELETE_EVENT_SCHEMA: AppActionSchema = {
  appId: "google-calendar",
  actionId: "delete_event",
  actionName: "Cancel Calendar Event",
  description: "Cancels and deletes an event from Google Calendar and notifies attendees",
  fields: [
    { id: "event_id", label: "Event ID to Delete", type: "text", required: true, placeholder: "{{step_1.calendar_event_id}}", helperText: "ID of event to remove from calendar", supportsMapping: true }
  ],
  sampleOutput: { event_id: "c791823ab", status: "cancelled" }
}

// --- RAZORPAY ACTION SCHEMAS ---
export const RAZORPAY_REFUND_SCHEMA: AppActionSchema = {
  appId: "razorpay",
  actionId: "issue_refund",
  actionName: "Issue Partial or Full Refund",
  description: "Refunds money for an authorized payment transaction",
  fields: [
    { id: "payment_id", label: "Razorpay Payment ID", type: "text", required: true, placeholder: "{{step_1.payment_id}} or pay_J891234912", helperText: "The unique payment ID to refund", supportsMapping: true },
    { id: "amount", label: "Refund Amount (INR)", type: "number", placeholder: "{{step_1.amount}} or 500 (leave empty for full refund)", helperText: "Leave blank to refund full transaction amount, or specify partial refund in INR", supportsMapping: true },
    { id: "refund_reason", label: "Refund Reason / Notes", type: "text", placeholder: "Customer return / cancellation", helperText: "Internal reference reason for audit trail", supportsMapping: true }
  ],
  sampleOutput: { refund_id: "rfnd_H91823901", payment_id: "pay_J891234912", amount: 500, status: "processed" }
}

export const RAZORPAY_CANCEL_SUB_SCHEMA: AppActionSchema = {
  appId: "razorpay",
  actionId: "cancel_subscription",
  actionName: "Cancel Customer Subscription",
  description: "Terminates recurring billing plan for a customer",
  fields: [
    { id: "subscription_id", label: "Subscription ID", type: "text", required: true, placeholder: "{{step_1.sub_id}} or sub_98124912", helperText: "Unique Razorpay subscription identifier", supportsMapping: true },
    { id: "cancel_at_cycle_end", label: "Cancel Timing", type: "select", defaultValue: "immediately", options: [{ value: "immediately", label: "Immediately (Halt Now)" }, { value: "cycle_end", label: "At End of Billing Cycle" }], helperText: "Choose when the subscription access should stop", supportsMapping: false }
  ],
  sampleOutput: { subscription_id: "sub_98124912", status: "cancelled", cancelled_at: new Date().toISOString() }
}

export const RAZORPAY_CREATE_ORDER_SCHEMA: AppActionSchema = {
  appId: "razorpay",
  actionId: "create_order",
  actionName: "Create Payment Order ID",
  description: "Generates an authorized Razorpay Order ID for standard checkout integration",
  fields: [
    { id: "amount", label: "Order Amount (INR)", type: "number", required: true, placeholder: "1499", helperText: "Order charge amount in Indian Rupees (₹)", supportsMapping: true },
    { id: "receipt_id", label: "Receipt / Invoice Reference", type: "text", placeholder: "RCPT-{{step_1.order_id}}", helperText: "Internal order reference number", supportsMapping: true }
  ],
  sampleOutput: { order_id: "order_K8129031", amount: 149900, currency: "INR", status: "created" }
}

// --- TELEGRAM ACTION SCHEMAS ---
export const TELEGRAM_SEND_PHOTO_SCHEMA: AppActionSchema = {
  appId: "telegram",
  actionId: "send_photo",
  actionName: "Send Photo / Document",
  description: "Dispatches image media or document file with caption via Telegram Bot",
  fields: [
    { id: "chat_id", label: "Chat ID", type: "text", required: true, placeholder: "{{step_1.telegram_chat_id}} or -1001928374", helperText: "Target Telegram user or group chat ID", supportsMapping: true },
    { id: "photo_url", label: "Image / Photo URL", type: "text", required: true, placeholder: "{{step_1.receipt_image_url}} or https://...", helperText: "Public URL of the photo to dispatch", supportsMapping: true },
    { id: "caption", label: "Photo Caption (Optional)", type: "textarea", placeholder: "Receipt confirmed for payment {{step_1.id}}", helperText: "Caption text to display beneath the image", supportsMapping: true }
  ],
  sampleOutput: { ok: true, message_id: 19283, type: "photo" }
}

export const TELEGRAM_PIN_MESSAGE_SCHEMA: AppActionSchema = {
  appId: "telegram",
  actionId: "pin_message",
  actionName: "Pin Message in Group Chat",
  description: "Pins high priority message banner to top of group channel",
  fields: [
    { id: "chat_id", label: "Chat ID", type: "text", required: true, placeholder: "-1001928374", helperText: "Telegram group or supergroup chat ID", supportsMapping: true },
    { id: "message_id", label: "Message ID to Pin", type: "number", required: true, placeholder: "{{step_1.message_id}}", helperText: "ID of the message to pin to header", supportsMapping: true }
  ],
  sampleOutput: { ok: true, result: true }
}

export const TELEGRAM_KICK_MEMBER_SCHEMA: AppActionSchema = {
  appId: "telegram",
  actionId: "kick_chat_member",
  actionName: "Ban or Restrict Chat Member",
  description: "Removes or bans an unauthorized member from a group chat",
  fields: [
    { id: "chat_id", label: "Chat ID", type: "text", required: true, placeholder: "-1001928374", helperText: "Telegram group or supergroup ID", supportsMapping: true },
    { id: "user_id", label: "User ID", type: "number", required: true, placeholder: "{{step_1.user_id}}", helperText: "Numeric Telegram user ID to ban/kick", supportsMapping: true }
  ],
  sampleOutput: { ok: true, banned_user_id: 9918239 }
}

// --- FRESHDESK ACTION SCHEMAS ---
export const FRESHDESK_NOTE_SCHEMA: AppActionSchema = {
  appId: "freshdesk",
  actionId: "add_ticket_note",
  actionName: "Add Note or Reply to Ticket",
  description: "Appends internal note or public customer reply to Freshdesk ticket",
  fields: [
    { id: "ticket_id", label: "Ticket ID", type: "number", required: true, placeholder: "{{step_1.ticket_id}} or 10482", helperText: "Numeric Freshdesk ticket number", supportsMapping: true },
    { id: "note_body", label: "Note / Reply Message", type: "textarea", required: true, placeholder: "Customer contacted via WhatsApp. Issue escalated to tier-2.", helperText: "Message content to append", supportsMapping: true },
    { id: "is_private", label: "Visibility", type: "select", defaultValue: "private", options: [{ value: "private", label: "Private Note (Internal Agents Only)" }, { value: "public", label: "Public Reply (Customer Visible)" }], helperText: "Visibility setting for this note", supportsMapping: false }
  ],
  sampleOutput: { ticket_id: 10482, note_id: 991823, status: "ADDED" }
}

export const FRESHDESK_STATUS_SCHEMA: AppActionSchema = {
  appId: "freshdesk",
  actionId: "update_ticket_status",
  actionName: "Close / Resolve Ticket",
  description: "Modifies ticket lifecycle status in Freshdesk",
  fields: [
    { id: "ticket_id", label: "Ticket ID", type: "number", required: true, placeholder: "{{step_1.ticket_id}} or 10482", helperText: "Numeric ticket number", supportsMapping: true },
    { id: "status", label: "Target Status", type: "select", required: true, defaultValue: "resolved", options: [{ value: "open", label: "Open (Pending agent response)" }, { value: "pending", label: "Pending (Awaiting customer)" }, { value: "resolved", label: "Resolved (Solution provided)" }, { value: "closed", label: "Closed (Finalized)" }], helperText: "New status for the ticket", supportsMapping: false }
  ],
  sampleOutput: { ticket_id: 10482, status: "resolved" }
}

export const FRESHDESK_ASSIGN_SCHEMA: AppActionSchema = {
  appId: "freshdesk",
  actionId: "assign_agent",
  actionName: "Assign Ticket to Support Agent",
  description: "Routes ticket assignment to specific agent or group queue",
  fields: [
    { id: "ticket_id", label: "Ticket ID", type: "number", required: true, placeholder: "{{step_1.ticket_id}} or 10482", helperText: "Numeric ticket number", supportsMapping: true },
    { id: "agent_email", label: "Agent Email / ID", type: "text", required: true, placeholder: "support.lead@acme.com", helperText: "Agent email address in Freshdesk", supportsMapping: true }
  ],
  sampleOutput: { ticket_id: 10482, responder_id: 891238, status: "ASSIGNED" }
}

export const FRESHDESK_PRIORITY_SCHEMA: AppActionSchema = {
  appId: "freshdesk",
  actionId: "update_ticket_priority",
  actionName: "Update Ticket Priority (Urgent/High)",
  description: "Escalates urgency level on an active support ticket",
  fields: [
    { id: "ticket_id", label: "Ticket ID", type: "number", required: true, placeholder: "{{step_1.ticket_id}} or 10482", helperText: "Numeric ticket number", supportsMapping: true },
    { id: "priority", label: "Urgency Level", type: "select", required: true, defaultValue: "high", options: [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent (SLA Alert)" }], helperText: "Target priority level", supportsMapping: false }
  ],
  sampleOutput: { ticket_id: 10482, priority: 3, status: "UPDATED" }
}

// --- HUBSPOT ACTION SCHEMAS ---
export const HUBSPOT_CREATE_DEAL_SCHEMA: AppActionSchema = {
  appId: "hubspot",
  actionId: "create_deal",
  actionName: "Create Deal",
  description: "Creates an opportunity deal pipeline record in HubSpot",
  fields: [
    { id: "deal_name", label: "Deal Name", type: "text", required: true, placeholder: "Deal: {{step_1.company}} - New License", helperText: "Title identifier for the deal", supportsMapping: true },
    { id: "deal_amount", label: "Deal Amount ($ / ₹)", type: "number", required: true, placeholder: "5000", helperText: "Monetary pipeline value of the deal", supportsMapping: true },
    { id: "deal_stage", label: "Pipeline Stage", type: "select", required: true, defaultValue: "qualifiedtobuy", options: [{ value: "appointmentscheduled", label: "Appointment Scheduled" }, { value: "qualifiedtobuy", label: "Qualified to Buy" }, { value: "contractsent", label: "Contract Sent" }, { value: "closedwon", label: "Closed Won" }, { value: "closedlost", label: "Closed Lost" }], helperText: "Initial sales pipeline stage", supportsMapping: false }
  ],
  sampleOutput: { deal_id: "deal_891230", deal_name: "Acme Corp Deal", amount: 5000, stage: "qualifiedtobuy" }
}

export const HUBSPOT_UPDATE_STAGE_SCHEMA: AppActionSchema = {
  appId: "hubspot",
  actionId: "update_deal_stage",
  actionName: "Update Deal Stage / Amount",
  description: "Transitions an existing deal to a new stage in pipeline",
  fields: [
    { id: "deal_id", label: "Deal ID", type: "text", required: true, placeholder: "{{step_1.deal_id}} or 891230", helperText: "HubSpot Deal identifier", supportsMapping: true },
    { id: "deal_stage", label: "New Deal Stage", type: "select", required: true, defaultValue: "closedwon", options: [{ value: "appointmentscheduled", label: "Appointment Scheduled" }, { value: "qualifiedtobuy", label: "Qualified to Buy" }, { value: "contractsent", label: "Contract Sent" }, { value: "closedwon", label: "Closed Won" }, { value: "closedlost", label: "Closed Lost" }], helperText: "Target stage to advance deal to", supportsMapping: false }
  ],
  sampleOutput: { deal_id: "891230", stage: "closedwon", status: "UPDATED" }
}

export const HUBSPOT_CREATE_COMPANY_SCHEMA: AppActionSchema = {
  appId: "hubspot",
  actionId: "create_company",
  actionName: "Create or Associate Company",
  description: "Registers a company organization in HubSpot CRM",
  fields: [
    { id: "company_name", label: "Company Name", type: "text", required: true, placeholder: "{{step_1.company}} or Acme Logistics", helperText: "Name of the organization", supportsMapping: true },
    { id: "company_domain", label: "Company Domain / Website", type: "text", placeholder: "acme.com", helperText: "Website domain used for company auto-enrichment", supportsMapping: true }
  ],
  sampleOutput: { company_id: "comp_91823", name: "Acme Logistics", status: "CREATED" }
}

export const HUBSPOT_TIMELINE_SCHEMA: AppActionSchema = {
  appId: "hubspot",
  actionId: "add_timeline_event",
  actionName: "Add Note or Timeline Activity",
  description: "Logs an interaction note, WhatsApp transcript, or call note on a HubSpot contact",
  fields: [
    { id: "contact_id", label: "Contact ID or Email", type: "text", required: true, placeholder: "{{step_1.email}} or 109283", helperText: "Associated contact identifier", supportsMapping: true },
    { id: "note_body", label: "Activity / Note Content", type: "textarea", required: true, placeholder: "Customer inquiry via automated workflow on {{step_1.timestamp}}", helperText: "Activity summary to log", supportsMapping: true }
  ],
  sampleOutput: { event_id: "evt_hubspot_89120", status: "LOGGED" }
}

export const HUBSPOT_LIFECYCLE_SCHEMA: AppActionSchema = {
  appId: "hubspot",
  actionId: "update_contact_lifecycle",
  actionName: "Update Contact Lifecycle Stage",
  description: "Advances lead lifecycle status (e.g. Lead -> Marketing Qualified -> Customer)",
  fields: [
    { id: "contact_id", label: "Contact ID or Email", type: "text", required: true, placeholder: "{{step_1.email}}", helperText: "Contact identifier", supportsMapping: true },
    { id: "lifecycle_stage", label: "Target Lifecycle Stage", type: "select", required: true, defaultValue: "marketingqualifiedlead", options: [{ value: "lead", label: "Lead" }, { value: "marketingqualifiedlead", label: "Marketing Qualified Lead (MQL)" }, { value: "salesqualifiedlead", label: "Sales Qualified Lead (SQL)" }, { value: "opportunity", label: "Opportunity" }, { value: "customer", label: "Customer" }], helperText: "New stage for contact", supportsMapping: false }
  ],
  sampleOutput: { contact_id: "991823", lifecyclestage: "marketingqualifiedlead" }
}

// --- PIPEDRIVE ACTION SCHEMAS ---
export const PIPEDRIVE_CREATE_PERSON_SCHEMA: AppActionSchema = {
  appId: "pipedrive",
  actionId: "create_person",
  actionName: "Create or Update Person",
  description: "Creates a contact person record in Pipedrive CRM",
  fields: [
    { id: "name", label: "Full Name", type: "text", required: true, placeholder: "{{step_1.first_name}} {{step_1.last_name}}", helperText: "Name of the person", supportsMapping: true },
    { id: "email", label: "Email Address", type: "text", placeholder: "{{step_1.email}}", helperText: "Primary contact email", supportsMapping: true },
    { id: "phone", label: "Phone Number", type: "text", placeholder: "{{step_1.phone}}", helperText: "Phone number with country code", supportsMapping: true }
  ],
  sampleOutput: { person_id: 89120, name: "Sarah Connor", status: "CREATED" }
}

export const PIPEDRIVE_UPDATE_DEAL_SCHEMA: AppActionSchema = {
  appId: "pipedrive",
  actionId: "update_deal",
  actionName: "Update Deal Custom Property",
  description: "Modifies deal properties, status, or stage in Pipedrive",
  fields: [
    { id: "deal_id", label: "Deal ID", type: "number", required: true, placeholder: "{{step_1.deal_id}} or 4812", helperText: "Numeric Pipedrive deal ID", supportsMapping: true },
    { id: "status", label: "Deal Status", type: "select", defaultValue: "won", options: [{ value: "open", label: "Open" }, { value: "won", label: "Won" }, { value: "lost", label: "Lost" }], helperText: "Deal outcome status", supportsMapping: false }
  ],
  sampleOutput: { deal_id: 4812, status: "won" }
}

export const PIPEDRIVE_ADD_NOTE_SCHEMA: AppActionSchema = {
  appId: "pipedrive",
  actionId: "add_note",
  actionName: "Add Activity Note to Deal",
  description: "Attaches a rich HTML note to a deal timeline",
  fields: [
    { id: "deal_id", label: "Deal ID", type: "number", required: true, placeholder: "{{step_1.deal_id}}", helperText: "Target deal number", supportsMapping: true },
    { id: "content", label: "Note Content", type: "textarea", required: true, placeholder: "Customer confirmed quote via automated chat.", helperText: "Note body text", supportsMapping: true }
  ],
  sampleOutput: { note_id: 19283, deal_id: 4812, status: "ADDED" }
}

export const PIPEDRIVE_CREATE_ACTIVITY_SCHEMA: AppActionSchema = {
  appId: "pipedrive",
  actionId: "create_activity",
  actionName: "Schedule Activity / Call Task",
  description: "Schedules a phone call, meeting, or follow-up deadline task",
  fields: [
    { id: "subject", label: "Activity Subject", type: "text", required: true, placeholder: "Call {{step_1.name}} regarding quote", helperText: "Activity title", supportsMapping: true },
    { id: "type", label: "Activity Type", type: "select", defaultValue: "call", options: [{ value: "call", label: "Phone Call" }, { value: "meeting", label: "Meeting" }, { value: "task", label: "Task / To-Do" }, { value: "email", label: "Email Follow-up" }], helperText: "Activity classification", supportsMapping: false },
    { id: "deal_id", label: "Associated Deal ID (Optional)", type: "number", placeholder: "{{step_1.deal_id}}", helperText: "Link task directly to deal", supportsMapping: true }
  ],
  sampleOutput: { activity_id: 81923, subject: "Call regarding quote", status: "SCHEDULED" }
}

// --- CALENDLY ACTION SCHEMAS ---
export const CALENDLY_CANCEL_SCHEMA: AppActionSchema = {
  appId: "calendly",
  actionId: "cancel_event_calendly",
  actionName: "Cancel Scheduled Booking",
  description: "Cancels an active Calendly scheduled meeting",
  fields: [
    { id: "event_uuid", label: "Calendly Event UUID", type: "text", required: true, placeholder: "{{step_1.event_uuid}} or e91823ab-...", helperText: "Unique booking UUID string", supportsMapping: true },
    { id: "cancellation_reason", label: "Cancellation Reason", type: "text", placeholder: "Rescheduling requested by client", helperText: "Reason provided to meeting invitee", supportsMapping: true }
  ],
  sampleOutput: { event_uuid: "e91823ab", status: "canceled" }
}

export const CALENDLY_SINGLE_LINK_SCHEMA: AppActionSchema = {
  appId: "calendly",
  actionId: "create_single_booking_link",
  actionName: "Create Single-Use Booking Link",
  description: "Generates an exclusive one-time scheduling link that expires after 1 booking",
  fields: [
    { id: "event_type_slug", label: "Event Type Slug / URL", type: "text", required: true, placeholder: "30-min-discovery or demo", helperText: "Slug of your Calendly meeting type", supportsMapping: true },
    { id: "max_event_count", label: "Maximum Bookings Allowed", type: "number", defaultValue: 1, helperText: "Link invalidates automatically after this many bookings", supportsMapping: false }
  ],
  sampleOutput: { booking_url: "https://calendly.com/d/abc-123/single-booking", expires_at: new Date().toISOString() }
}

// --- TYPEFORM DELETE RESPONSE SCHEMA ---
export const TYPEFORM_DELETE_RESPONSE_SCHEMA: AppActionSchema = {
  appId: "typeform",
  actionId: "delete_typeform_response",
  actionName: "Delete Response Data Record",
  description: "Removes specific respondent submission from Typeform workspace for GDPR / compliance",
  fields: [
    {
      id: "form_id",
      label: "Typeform Form Shell",
      type: "select",
      required: true,
      options: [
        { value: "tf_lead_gen", label: "Customer Onboarding Survey (v2)" },
        { value: "tf_feedback", label: "Post-Purchase NPS Rating" },
        { value: "tf_support", label: "Technical Diagnostic Form" }
      ],
      supportsMapping: false
    },
    {
      id: "response_token",
      label: "Response Token / Submission ID",
      type: "text",
      required: true,
      placeholder: "{{step_1.response_id}} or resp_77189a",
      helperText: "Unique token of the response to permanently purge",
      supportsMapping: true
    }
  ],
  sampleOutput: { deleted_token: "resp_77189a", status: "DELETED" }
}

// --- GRAPHQL & MULTIPART API ACTION SCHEMAS ---
export const GRAPHQL_REQUEST_SCHEMA: AppActionSchema = {
  appId: "api",
  actionId: "custom_graphql",
  actionName: "Send GraphQL Query or Mutation",
  description: "Dispatches GraphQL request with custom query and variables JSON to endpoint",
  fields: [
    {
      id: "graphql_endpoint",
      label: "GraphQL Endpoint URL",
      type: "text",
      required: true,
      placeholder: "https://api.example.com/graphql",
      helperText: "Destination GraphQL API URL",
      supportsMapping: true
    },
    {
      id: "graphql_query",
      label: "Query / Mutation Document",
      type: "textarea",
      required: true,
      placeholder: "query GetUser($id: ID!) {\n  user(id: $id) {\n    name\n    email\n  }\n}",
      helperText: "Valid GraphQL syntax string",
      supportsMapping: true
    },
    {
      id: "graphql_variables",
      label: "Query Variables (JSON)",
      type: "textarea",
      placeholder: "{\n  \"id\": \"{{step_1.user_id}}\"\n}",
      helperText: "Key-value JSON variables matching GraphQL definition",
      supportsMapping: true
    }
  ],
  sampleOutput: { data: { user: { name: "Alex Chen", email: "alex@example.com" } } }
}

export const MULTIPART_FORM_SCHEMA: AppActionSchema = {
  appId: "api",
  actionId: "send_multipart_form",
  actionName: "Send Multipart Form Data (File Upload)",
  description: "Uploads files and binary data with form-data boundary headers",
  fields: [
    {
      id: "endpoint_url",
      label: "Upload Endpoint URL",
      type: "text",
      required: true,
      placeholder: "https://files.acme.com/api/v1/upload",
      supportsMapping: true
    },
    {
      id: "file_url",
      label: "Source File URL",
      type: "text",
      required: true,
      placeholder: "{{step_1.invoice_url}} or https://...",
      helperText: "Direct URL of file attachment to upload",
      supportsMapping: true
    },
    {
      id: "file_key_name",
      label: "Form Field Key Name",
      type: "text",
      defaultValue: "file",
      placeholder: "file or attachment",
      supportsMapping: true
    }
  ],
  sampleOutput: { file_id: "file_891230", upload_status: "SUCCESS" }
}

// --- SCHEDULER ACTION SCHEMAS ---
export const SCHEDULER_DELAY_CRON_SCHEMA: AppActionSchema = {
  appId: "scheduler",
  actionId: "delay_next_cron",
  actionName: "Skip or Delay Next Scheduled Run",
  description: "Postpones the upcoming cron execution by specified duration",
  fields: [
    {
      id: "delay_duration_minutes",
      label: "Postpone Duration (Minutes)",
      type: "number",
      required: true,
      defaultValue: 60,
      placeholder: "60",
      helperText: "Number of minutes to postpone the next scheduled workflow trigger",
      supportsMapping: true
    },
    {
      id: "reason",
      label: "Reason for Postponement",
      type: "text",
      placeholder: "System maintenance in progress",
      supportsMapping: true
    }
  ],
  sampleOutput: { postponed_by_minutes: 60, next_run: new Date(Date.now() + 3600000).toISOString(), status: "POSTPONED" }
}

export const SCHEDULER_PAUSE_TIMER_SCHEMA: AppActionSchema = {
  appId: "scheduler",
  actionId: "pause_schedule_timer",
  actionName: "Pause / Resume Recurring Schedule",
  description: "Temporarily halts or re-activates recurring cron schedule",
  fields: [
    {
      id: "action_state",
      label: "Schedule State",
      type: "select",
      required: true,
      defaultValue: "pause",
      options: [
        { value: "pause", label: "Pause Schedule (Halt Triggers)" },
        { value: "resume", label: "Resume Schedule (Re-activate)" }
      ],
      supportsMapping: false
    },
    {
      id: "pause_duration_hours",
      label: "Auto-Resume After Hours (Optional)",
      type: "number",
      placeholder: "24 (leave blank for manual resume)",
      helperText: "Leave blank to keep paused until manually resumed",
      supportsMapping: true
    }
  ],
  sampleOutput: { state: "paused", status: "HALTED" }
}

// --- FILTER ACTION SCHEMAS ---
export const FILTER_REGEX_SCHEMA: AppActionSchema = {
  appId: "filter",
  actionId: "filter_regex",
  actionName: "Filter by Regex Pattern",
  description: "Validates field value against a regular expression pattern before continuing",
  fields: [
    {
      id: "test_value",
      label: "Input Value to Test",
      type: "text",
      required: true,
      placeholder: "{{step_1.email}} or {{step_1.order_code}}",
      supportsMapping: true
    },
    {
      id: "regex_pattern",
      label: "Regular Expression Pattern",
      type: "text",
      required: true,
      placeholder: "^[A-Z]{3}-[0-9]{4}$",
      helperText: "Regular expression syntax (without enclosing slashes)",
      supportsMapping: true
    },
    {
      id: "case_sensitive",
      label: "Case Sensitive Matching",
      type: "select",
      defaultValue: "no",
      options: [
        { value: "no", label: "No (Case Insensitive - /i)" },
        { value: "yes", label: "Yes (Exact Case)" }
      ],
      supportsMapping: false
    }
  ],
  sampleOutput: { matched: true, passed: true }
}

export const FILTER_DATE_RANGE_SCHEMA: AppActionSchema = {
  appId: "filter",
  actionId: "filter_date_range",
  actionName: "Filter by Date Range",
  description: "Continues workflow only if timestamp falls between start and end window",
  fields: [
    {
      id: "timestamp_to_check",
      label: "Timestamp to Validate",
      type: "datetime",
      required: true,
      placeholder: "{{step_1.created_at}}",
      supportsMapping: true
    },
    {
      id: "start_range",
      label: "Start Date / Time",
      type: "datetime",
      required: true,
      placeholder: "YYYY-MM-DDTHH:mm:ss",
      supportsMapping: true
    },
    {
      id: "end_range",
      label: "End Date / Time",
      type: "datetime",
      required: true,
      placeholder: "YYYY-MM-DDTHH:mm:ss",
      supportsMapping: true
    }
  ],
  sampleOutput: { in_range: true, passed: true }
}

// --- ROUTER ACTION SCHEMAS ---
export const ROUTER_FALLBACK_SCHEMA: AppActionSchema = {
  appId: "router",
  actionId: "fallback_route",
  actionName: "Default Fallback Catch-All Branch",
  description: "Executes only when none of the primary router branch conditions evaluate to true",
  fields: [
    {
      id: "enable_logging",
      label: "Log Fallback Trigger Event",
      type: "select",
      defaultValue: "yes",
      options: [
        { value: "yes", label: "Yes (Log unmatched payload to audit history)" },
        { value: "no", label: "No (Silent execution)" }
      ],
      supportsMapping: false
    },
    {
      id: "fallback_note",
      label: "Audit Note / Category",
      type: "text",
      placeholder: "Unmatched routing condition",
      helperText: "Optional tag for execution logs",
      supportsMapping: true
    }
  ],
  sampleOutput: { branch: "fallback", triggered: true }
}

// -------------------------------------------------------------
// 4. COMPLETE REGISTRY MAP & DYNAMIC FALLBACK GENERATOR
// -------------------------------------------------------------

export const APP_SCHEMAS_MAP: Record<string, AppActionSchema> = {
  "calendly": CALENDLY_BOOKING_SCHEMA,
  "google-calendar": GOOGLE_CALENDAR_SCHEMA,
  "google-sheets": GOOGLE_SHEETS_SCHEMA,
  "gmail": GMAIL_SCHEMA,
  "slack": SLACK_SCHEMA,
  "shopify": SHOPIFY_SCHEMA,
  "pipedrive": PIPEDRIVE_SCHEMA,
  "freshdesk": FRESHDESK_SCHEMA,
  "razorpay": RAZORPAY_SCHEMA,
  "telegram": TELEGRAM_SCHEMA,
  "typeform": TYPEFORM_SCHEMA,
  "google-forms": GOOGLE_FORMS_SCHEMA,
  "hubspot": HUBSPOT_SCHEMA,
  "automate-chats": AUTOMATE_CHATS_SCHEMA,
  "automate-forms": AUTOMATE_FORMS_LINK_SCHEMA,
  "scheduler": SCHEDULER_SCHEMA,
  "filter": FILTER_SCHEMA,
  "router": ROUTER_SCHEMA,
  "delay": DELAY_SCHEMA,
  "iterator": ITERATOR_SCHEMA,
  "text-formatter": TEXT_FORMATTER_SCHEMA,
  "datetime-formatter": DATETIME_FORMATTER_SCHEMA,
  "number-formatter": NUMBER_FORMATTER_SCHEMA,
  "api": API_SCHEMA,
  "api-webhook": API_WEBHOOK_SCHEMA,
  "webhook": WEBHOOK_TRIGGER_SCHEMA,
  "webhook-catch": WEBHOOK_TRIGGER_SCHEMA,
  "code-runner": CODE_RUNNER_SCHEMA,
  "lookup-table": LOOKUP_TABLE_SCHEMA,
  "human-approval": HUMAN_APPROVAL_SCHEMA
}

/**
 * Universal Dynamic Schema Resolver with Operation & Event Awareness
 * Dynamically resolves schemas based on active sub-operation or selected action event.
 */
export function getAppActionSchema(
  appId: string,
  eventId?: string,
  eventName?: string,
  currentMappings?: Record<string, any>
): AppActionSchema {
  const normAppId = appId?.toLowerCase() || ""
  const normEventId = (eventId || "").toLowerCase()
  const customOp = (
    currentMappings?.transform_type ||
    currentMappings?.date_operation ||
    currentMappings?.number_operation ||
    currentMappings?.delay_type ||
    ""
  ).toLowerCase()

  // 1. Text Formatter Dynamic Sub-Operations
  if (normAppId === "text-formatter") {
    const op = customOp || normEventId
    if (op === "truncate" || op === "truncate_text") {
      return TEXT_FORMATTER_TRUNCATE_SCHEMA
    }
    if (op.startsWith("extract") || op === "extract_email_url") {
      return TEXT_FORMATTER_EXTRACT_SCHEMA
    }
    if (op === "change_case") {
      return TEXT_FORMATTER_CHANGE_CASE_SCHEMA
    }
    if (op === "find_replace") {
      return TEXT_FORMATTER_FIND_REPLACE_SCHEMA
    }
    return TEXT_FORMATTER_SPLIT_SCHEMA
  }

  // 2. DateTime Formatter Dynamic Sub-Operations
  if (normAppId === "datetime-formatter") {
    const op = customOp || normEventId
    if (op === "add_subtract_time") {
      return DATETIME_FORMATTER_ADD_SUBTRACT_SCHEMA
    }
    if (op === "time_difference") {
      return DATETIME_FORMATTER_DIFF_SCHEMA
    }
    if (op === "current_timestamp") {
      return DATETIME_FORMATTER_CURRENT_SCHEMA
    }
    return DATETIME_FORMATTER_FORMAT_SCHEMA
  }

  // 3. Number Formatter Dynamic Sub-Operations
  if (normAppId === "number-formatter") {
    const op = customOp || normEventId
    if (op === "spreadsheet_formulas" || op === "spreadsheet") {
      return NUMBER_FORMATTER_SPREADSHEET_SCHEMA
    }
    if (op === "format_currency" || op === "currency") {
      return NUMBER_FORMATTER_CURRENCY_SCHEMA
    }
    if (op === "round_number" || op === "round") {
      return NUMBER_FORMATTER_ROUND_SCHEMA
    }
    if (op === "random_number" || op === "random") {
      return NUMBER_FORMATTER_RANDOM_SCHEMA
    }
    if (op === "math_operation" || op === "math") {
      return NUMBER_FORMATTER_MATH_SCHEMA
    }
    return NUMBER_FORMATTER_SPREADSHEET_SCHEMA
  }

  // 4. Delay Module Dynamic Sub-Operations
  if (normAppId === "delay") {
    const op = customOp || normEventId
    if (op === "delay_until") {
      return DELAY_UNTIL_SCHEMA
    }
    if (op === "rate_limiter" || op === "delay_queue") {
      return DELAY_RATE_LIMIT_SCHEMA
    }
    return DELAY_FOR_SCHEMA
  }

  // 5. Iterator / Loop Dynamic Sub-Operations
  if (normAppId === "iterator") {
    if (normEventId === "aggregate_items" || normEventId === "aggregate") {
      return ITERATOR_AGGREGATE_SCHEMA
    }
    return ITERATOR_SCHEMA
  }

  // 6. Shopify Actions
  if (normAppId === "shopify") {
    if (normEventId === "update_order_tags") return SHOPIFY_UPDATE_TAGS_SCHEMA
    if (normEventId === "create_discount_code") return SHOPIFY_DISCOUNT_SCHEMA
    if (normEventId === "update_inventory") return SHOPIFY_INVENTORY_SCHEMA
    if (normEventId === "create_product") return SHOPIFY_PRODUCT_SCHEMA
    if (normEventId === "add_order_note" || !normEventId) return SHOPIFY_SCHEMA
  }

  // 7. Gmail Actions
  if (normAppId === "gmail") {
    if (normEventId === "create_draft") return GMAIL_CREATE_DRAFT_SCHEMA
    if (normEventId === "add_label") return GMAIL_ADD_LABEL_SCHEMA
    if (normEventId === "reply_email") return GMAIL_REPLY_SCHEMA
    if (normEventId === "mark_as_read") return GMAIL_MARK_READ_SCHEMA
    if (normEventId === "send_email" || !normEventId) return GMAIL_SCHEMA
  }

  // 8. Slack Actions
  if (normAppId === "slack") {
    if (normEventId === "send_dm" || normEventId === "send_direct_message") return SLACK_DIRECT_MSG_SCHEMA
    if (normEventId === "post_block_msg") return SLACK_BLOCK_MSG_SCHEMA
    if (normEventId === "upload_file") return SLACK_UPLOAD_FILE_SCHEMA
    if (normEventId === "set_topic") return SLACK_SET_TOPIC_SCHEMA
    if (normEventId === "create_channel") return SLACK_CREATE_CHANNEL_SCHEMA
    if (normEventId === "send_channel_msg" || !normEventId) return SLACK_SCHEMA
  }

  // 9. Google Sheets Actions
  if (normAppId === "google-sheets") {
    if (normEventId === "update_row") return GOOGLE_SHEETS_UPDATE_ROW_SCHEMA
    if (normEventId === "lookup_row") return GOOGLE_SHEETS_LOOKUP_ROW_SCHEMA
    if (normEventId === "delete_row") return GOOGLE_SHEETS_DELETE_ROW_SCHEMA
    if (normEventId === "clear_row") return GOOGLE_SHEETS_CLEAR_ROW_SCHEMA
    if (normEventId === "create_worksheet") return GOOGLE_SHEETS_CREATE_WORKSHEET_SCHEMA
    if (normEventId === "batch_add_rows") return GOOGLE_SHEETS_BATCH_ROWS_SCHEMA
    if (normEventId === "add_row" || !normEventId) return GOOGLE_SHEETS_SCHEMA
  }

  // 10. Google Calendar Actions
  if (normAppId === "google-calendar") {
    if (normEventId === "quick_add_event") return GOOGLE_CALENDAR_QUICK_ADD_SCHEMA
    if (normEventId === "update_event") return GOOGLE_CALENDAR_UPDATE_EVENT_SCHEMA
    if (normEventId === "add_attendee") return GOOGLE_CALENDAR_ADD_ATTENDEE_SCHEMA
    if (normEventId === "delete_event") return GOOGLE_CALENDAR_DELETE_EVENT_SCHEMA
    if (normEventId === "create_event" || !normEventId) return GOOGLE_CALENDAR_SCHEMA
  }

  // 11. Razorpay Actions
  if (normAppId === "razorpay") {
    if (normEventId === "issue_refund") return RAZORPAY_REFUND_SCHEMA
    if (normEventId === "cancel_subscription") return RAZORPAY_CANCEL_SUB_SCHEMA
    if (normEventId === "create_order") return RAZORPAY_CREATE_ORDER_SCHEMA
    if (normEventId === "create_payment_link" || !normEventId) return RAZORPAY_SCHEMA
  }

  // 12. Telegram Actions
  if (normAppId === "telegram") {
    if (normEventId === "send_photo") return TELEGRAM_SEND_PHOTO_SCHEMA
    if (normEventId === "pin_message") return TELEGRAM_PIN_MESSAGE_SCHEMA
    if (normEventId === "kick_chat_member") return TELEGRAM_KICK_MEMBER_SCHEMA
    if (normEventId === "send_telegram_msg" || !normEventId) return TELEGRAM_SCHEMA
  }

  // 13. Freshdesk Actions
  if (normAppId === "freshdesk") {
    if (normEventId === "add_ticket_note") return FRESHDESK_NOTE_SCHEMA
    if (normEventId === "update_ticket_status") return FRESHDESK_STATUS_SCHEMA
    if (normEventId === "assign_agent") return FRESHDESK_ASSIGN_SCHEMA
    if (normEventId === "update_ticket_priority") return FRESHDESK_PRIORITY_SCHEMA
    if (normEventId === "create_ticket" || !normEventId) return FRESHDESK_SCHEMA
  }

  // 14. HubSpot Actions
  if (normAppId === "hubspot") {
    if (normEventId === "create_deal") return HUBSPOT_CREATE_DEAL_SCHEMA
    if (normEventId === "update_deal_stage") return HUBSPOT_UPDATE_STAGE_SCHEMA
    if (normEventId === "create_company") return HUBSPOT_CREATE_COMPANY_SCHEMA
    if (normEventId === "add_timeline_event") return HUBSPOT_TIMELINE_SCHEMA
    if (normEventId === "update_contact_lifecycle") return HUBSPOT_LIFECYCLE_SCHEMA
    if (normEventId === "create_update_contact" || !normEventId) return HUBSPOT_SCHEMA
  }

  // 15. Pipedrive Actions
  if (normAppId === "pipedrive") {
    if (normEventId === "create_person") return PIPEDRIVE_CREATE_PERSON_SCHEMA
    if (normEventId === "update_deal") return PIPEDRIVE_UPDATE_DEAL_SCHEMA
    if (normEventId === "add_note") return PIPEDRIVE_ADD_NOTE_SCHEMA
    if (normEventId === "create_activity") return PIPEDRIVE_CREATE_ACTIVITY_SCHEMA
    if (normEventId === "create_pipedrive_deal" || !normEventId) return PIPEDRIVE_SCHEMA
  }

  // 16. Calendly Actions
  if (normAppId === "calendly") {
    if (normEventId === "cancel_event_calendly") return CALENDLY_CANCEL_SCHEMA
    if (normEventId === "create_single_booking_link") return CALENDLY_SINGLE_LINK_SCHEMA
    if (normEventId === "get_user_availability" || !normEventId) return CALENDLY_BOOKING_SCHEMA
  }

  // 17. Typeform Actions & Triggers
  if (normAppId === "typeform") {
    if (normEventId === "new_typeform_sub") return TYPEFORM_TRIGGER_SCHEMA
    if (normEventId === "partial_typeform_sub") return TYPEFORM_PARTIAL_TRIGGER_SCHEMA
    if (normEventId === "delete_typeform_response") return TYPEFORM_DELETE_RESPONSE_SCHEMA
    if (normEventId === "create_typeform_entry" || !normEventId) return TYPEFORM_SCHEMA
  }

  // 18. API & HTTP Request Actions
  if (normAppId === "api" || normAppId === "api-webhook" || normAppId === "http-request") {
    if (normEventId === "custom_graphql" || normEventId === "send_graphql_request") return GRAPHQL_REQUEST_SCHEMA
    if (normEventId === "send_multipart_form") return MULTIPART_FORM_SCHEMA
    if (normEventId === "send_custom_http" || !normEventId) return API_SCHEMA
  }

  // 19. Scheduler Actions
  if (normAppId === "scheduler") {
    if (normEventId === "delay_next_cron") return SCHEDULER_DELAY_CRON_SCHEMA
    if (normEventId === "pause_schedule_timer") return SCHEDULER_PAUSE_TIMER_SCHEMA
    if (normEventId === "cron_schedule" || !normEventId) return SCHEDULER_SCHEMA
  }

  // 20. Filter Actions
  if (normAppId === "filter") {
    if (normEventId === "filter_regex") return FILTER_REGEX_SCHEMA
    if (normEventId === "filter_date_range") return FILTER_DATE_RANGE_SCHEMA
    if (normEventId === "apply_filter_rules" || !normEventId) return FILTER_SCHEMA
  }

  // 21. Router Actions
  if (normAppId === "router") {
    if (normEventId === "fallback_route") return ROUTER_FALLBACK_SCHEMA
    if (normEventId === "route_branches" || !normEventId) return ROUTER_SCHEMA
  }

  // 22. Webhook Dynamic Triggers & Actions
  if (normAppId === "webhook" || normAppId === "webhook-catch") {
    if (normEventId === "catch_webhook_headers") {
      return WEBHOOK_HEADERS_SCHEMA
    }
    if (normEventId === "custom_webhook_response") {
      return WEBHOOK_RESPONSE_SCHEMA
    }
    return WEBHOOK_TRIGGER_SCHEMA
  }

  // 23. Human in the Loop (Approval vs Manual Form Fill)
  if (normAppId === "human-approval") {
    if (normEventId === "request_user_input") {
      return HUMAN_INPUT_FORM_SCHEMA
    }
    return HUMAN_APPROVAL_SCHEMA
  }

  // 24. Code Runner (Node.js 20 vs Python 3.11)
  if (normAppId === "code-runner") {
    if (normEventId === "run_python") {
      return CODE_RUNNER_PYTHON_SCHEMA
    }
    return CODE_RUNNER_SCHEMA
  }

  // 25. Lookup Table (Key-Value Matcher vs Dynamic Dictionary Token Swap)
  if (normAppId === "lookup-table") {
    if (normEventId === "dynamic_dictionary") {
      return DYNAMIC_DICTIONARY_SCHEMA
    }
    return LOOKUP_TABLE_SCHEMA
  }

  // 26. Automate Forms (Prefilled Link vs Disable Form)
  if (normAppId === "automate-forms") {
    if (normEventId === "disable_form") {
      return AUTOMATE_FORMS_DISABLE_SCHEMA
    }
    return AUTOMATE_FORMS_LINK_SCHEMA
  }

  // 27. Google Forms (Create Form, Fetch Responses, Submit Response, Settings)
  if (normAppId === "google-forms") {
    if (normEventId === "get_gform_responses") {
      return GOOGLE_FORMS_RESPONSES_SCHEMA
    }
    if (normEventId === "submit_gform_response") {
      return GOOGLE_FORMS_SUBMIT_SCHEMA
    }
    if (normEventId === "update_gform_settings") {
      return GOOGLE_FORMS_SETTINGS_SCHEMA
    }
    return GOOGLE_FORMS_CREATE_SCHEMA
  }

  // Check static map ONLY if actionId matches or no specific action requested
  const existing = APP_SCHEMAS_MAP[appId] || (normAppId === "api" ? API_SCHEMA : undefined)
  if (existing && (!normEventId || existing.actionId.toLowerCase() === normEventId)) {
    return existing
  }

  // Universal Dynamic Action Generator: Context-aware schema for any other or custom action event
  const cleanAppName = appId ? appId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Application"
  const cleanActionName = eventName || normEventId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Perform Action"

  // Context-aware field generation based on action intent:
  const isDeleteOrCancel = /delete|remove|cancel|purge|discard|archive/i.test(normEventId)
  const isLookupOrGet = /get|fetch|lookup|search|find|query|read|check/i.test(normEventId)
  const isSendOrNotify = /send|notify|post|alert|message|dispatch|push/i.test(normEventId)
  const isUpdateOrEdit = /update|edit|modify|patch|change|set|adjust/i.test(normEventId)

  let generatedFields: ActionField[] = []

  if (isDeleteOrCancel) {
    generatedFields = [
      {
        id: "target_id",
        label: `${cleanAppName} Record / ID to Delete`,
        type: "text",
        required: true,
        placeholder: `{{step_1.id}} or unique identifier`,
        helperText: `Specify the unique ID of the record in ${cleanAppName} to remove`,
        supportsMapping: true
      },
      {
        id: "cancellation_reason",
        label: "Reason / Notes (Optional)",
        type: "text",
        placeholder: "Cancelled via automated workflow",
        helperText: "Audit reason for this deletion",
        supportsMapping: true
      },
      {
        id: "permanent_delete",
        label: "Permanent Deletion",
        type: "select",
        defaultValue: "no",
        options: [
          { value: "no", label: "Soft Delete / Move to Trash" },
          { value: "yes", label: "Permanent Deletion (Irreversible)" }
        ],
        supportsMapping: false
      }
    ]
  } else if (isLookupOrGet) {
    generatedFields = [
      {
        id: "lookup_query",
        label: "Search Key / Lookup Term",
        type: "text",
        required: true,
        placeholder: `{{step_1.email}} or lookup value`,
        helperText: `Value to search for in ${cleanAppName}`,
        supportsMapping: true
      },
      {
        id: "lookup_field",
        label: "Field to Search By",
        type: "text",
        placeholder: "email or id or reference_code",
        helperText: "Name of the property or column to match against",
        supportsMapping: true
      },
      {
        id: "result_limit",
        label: "Maximum Results",
        type: "number",
        defaultValue: 1,
        helperText: "Limit number of matching records returned",
        supportsMapping: false
      }
    ]
  } else if (isSendOrNotify) {
    generatedFields = [
      {
        id: "destination_recipient",
        label: "Recipient / Destination",
        type: "text",
        required: true,
        placeholder: `{{step_1.recipient}} or channel/user ID`,
        helperText: `Destination endpoint, email, or chat room in ${cleanAppName}`,
        supportsMapping: true
      },
      {
        id: "message_payload",
        label: "Message Content / Payload",
        type: "textarea",
        required: true,
        placeholder: `New alert triggered from step 1:\n{{step_1.data}}`,
        helperText: "Message body or text content to dispatch",
        supportsMapping: true
      },
      {
        id: "media_attachment_url",
        label: "Attachment / Media URL (Optional)",
        type: "text",
        placeholder: "{{step_1.file_url}} or https://...",
        helperText: "Optional file attachment or image URL to include",
        supportsMapping: true
      }
    ]
  } else if (isUpdateOrEdit) {
    generatedFields = [
      {
        id: "record_id",
        label: `${cleanAppName} Record ID to Update`,
        type: "text",
        required: true,
        placeholder: `{{step_1.id}} or 9182390`,
        helperText: `Specify the existing record ID in ${cleanAppName} to update`,
        supportsMapping: true
      },
      {
        id: "updated_fields_json",
        label: "Fields to Update (JSON or Key-Value)",
        type: "textarea",
        required: true,
        placeholder: `{\n  "status": "PROCESSED",\n  "custom_note": "{{step_1.summary}}"\n}`,
        helperText: "Specify the properties and their new values",
        supportsMapping: true
      },
      {
        id: "return_updated_record",
        label: "Return Full Updated Record",
        type: "select",
        defaultValue: "yes",
        options: [
          { value: "yes", label: "Yes (Include updated record in step output)" },
          { value: "no", label: "No (Status confirmation only)" }
        ],
        supportsMapping: false
      }
    ]
  } else {
    // Default Create / Execute Action fields
    generatedFields = [
      {
        id: "title_or_name",
        label: `${cleanActionName} Title / Name`,
        type: "text",
        required: true,
        placeholder: `{{step_1.name}} or new record title`,
        helperText: `Primary title or name for this ${cleanActionName}`,
        supportsMapping: true
      },
      {
        id: "details_content",
        label: "Description / Payload Details",
        type: "textarea",
        required: true,
        placeholder: `Enter details or map variables: {{step_1.description}}`,
        helperText: "Detailed data or parameters to submit",
        supportsMapping: true
      },
      {
        id: "category_status",
        label: "Status / Category Tag",
        type: "text",
        placeholder: "ACTIVE or PRIORITY",
        helperText: "Optional status or tag to attach to this item",
        supportsMapping: true
      }
    ]
  }

  return {
    appId,
    actionId: eventId || "default_action",
    actionName: cleanActionName,
    description: `Execute ${cleanActionName} in ${cleanAppName}`,
    fields: generatedFields,
    sampleOutput: {
      success: true,
      app: cleanAppName,
      action: cleanActionName,
      executed_at: new Date().toISOString(),
      id: "gen_res_" + Math.random().toString(36).substring(2, 9)
    }
  }
}

