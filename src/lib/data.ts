export interface AppConnection {
  id: string
  name: string
  icon: string
  category: string
  authType: "Internal SSO" | "OAuth 2.0" | "API Key" | "Bot Token" | "None" | "Private App Token"
  triggers: { id: string; name: string; description: string; type: "instant" | "polling" | "schedule" }[]
  actions: { id: string; name: string; description: string }[]
  syncMode: "Webhook" | "Polling" | "Instant"
  notes?: string
}

export interface UserConnection {
  id: string
  appId: string
  appName: string
  accountLabel: string
  status: "Active" | "Needs reauthorization" | "Disconnected"
  lastUsed: string
  authType: string
}

export interface RouteBranch {
  id: string
  name: string
  appId: string
  appName: string
  eventId: string
  eventName: string
  conditionText?: string
  steps?: WorkflowStep[]
}

export interface WorkflowStep {
  id: string
  type: "trigger" | "action" | "filter" | "delay" | "router"
  appId: string
  appName: string
  eventId: string
  eventName: string
  connectionId?: string
  fieldMappings: Record<string, string>
  testOutput?: any
  status?: "configured" | "unmapped" | "testing" | "error"
  routes?: RouteBranch[]
  isNewStep?: boolean
  customParameters?: { id: string; key: string; value: string }[]
}

export interface Workflow {
  id: string
  name: string
  status: "On" | "Off" | "Draft"
  lastRunStatus: "success" | "error" | "queued" | "never"
  lastRunDate: string
  updatedAt: string
  steps: WorkflowStep[]
  taskCountThisMonth: number
  folder?: string
}

export interface RunHistoryItem {
  id: string
  workflowId: string
  workflowName: string
  timestamp: string
  triggerSource: string
  status: "success" | "error" | "queued"
  duration: string
  failedStepIndex?: number
  errorMessage?: string
  stepLogs: {
    stepId: string
    stepName: string
    appName: string
    appId?: string
    status: "success" | "error" | "skipped"
    duration?: string
    inputPayload: any
    outputPayload: any
    errorDetails?: string
  }[]
}

export interface Template {
  id: string
  title: string
  description: string
  category: "Lead Capture" | "CRM Sync" | "Notifications" | "E-Commerce" | "Customer Support" | "Personal Productivity"
  apps: string[]
  triggerSummary: string
  actionSummary: string
  stepCount: number
  about?: string
  savings?: {
    money?: string
    time?: string
  }
  author?: string
  setupGuide?: string[]
  steps?: WorkflowStep[]
}

// 18 Launch Apps Specification (from Section 8.8 of PRD)
// 29 Production Apps Specification Catalog Standard
export const MVP_APPS: AppConnection[] = [
  {
    id: "automate-chats",
    name: "Automate Chats",
    icon: "MessageSquare",
    category: "Native Suite",
    authType: "API Key",
    syncMode: "Webhook",
    notes: "Native Chatflow Webhook trigger URL. API Token for WhatsApp actions (Settings > API & Webhooks).",
    triggers: [
      { id: "new_wa_msg", name: "New WhatsApp Message Received", description: "Fires when a customer sends a message to WhatsApp Business number", type: "instant" },
      { id: "wa_msg_status", name: "Message Status Changed", description: "Fires when sent/delivered/read/failed status updates", type: "instant" },
      { id: "new_opt_in", name: "Customer Opted-In", description: "Fires when customer scans QR code or opts into WhatsApp dispatches", type: "instant" },
      { id: "button_clicked", name: "Template CTA Button Clicked", description: "Fires when user taps interactive button inside WhatsApp message", type: "instant" }
    ],
    actions: [
      { id: "send_wa_template", name: "Send WhatsApp Template Message", description: "Sends an approved template message with custom params" },
      { id: "send_wa_session", name: "Send WhatsApp Session Message", description: "Sends a direct text/media message within 24h window" },
      { id: "send_interactive_list", name: "Send Interactive Radio List", description: "Sends selectable radio button menu to customer" },
      { id: "add_contact_tag", name: "Add / Update Contact Tag", description: "Assigns tags to customer profile for segmentation" },
      { id: "update_chat_status", name: "Assign / Close Support Chat", description: "Assigns conversation thread to support agent or resolves ticket" }
    ]
  },
  {
    id: "automate-forms",
    name: "Automate Forms",
    icon: "FileText",
    category: "Native Suite",
    authType: "API Key",
    syncMode: "Webhook",
    notes: "Native Form Webhook trigger URL. API Token for form lifecycle actions (Settings > API & Webhooks).",
    triggers: [
      { id: "new_form_sub", name: "New Form Submission", description: "Fires when a user submits any form in Automate Forms", type: "instant" },
      { id: "form_field_updated", name: "Partial Field Updated", description: "Fires on multi-step form progress", type: "instant" },
      { id: "form_abandoned", name: "Form Abandonment (Lead Saved)", description: "Fires when user starts filling form but leaves before final submit", type: "instant" }
    ],
    actions: [
      { id: "create_form_link", name: "Generate Prefilled Form Link", description: "Generates unique prefilled URL for customer dispatches" },
      { id: "disable_form", name: "Pause / Close Form Submissions", description: "Toggles form status to inactive when quota is reached" }
    ]
  },
  {
    id: "google-forms",
    name: "Google Forms",
    icon: "CheckSquare",
    category: "Lead Capture & Forms",
    authType: "None",
    syncMode: "Webhook",
    notes: "Direct Webhook trigger URL. Zero authentication required. Inbound responses trigger workflows instantly. (Trigger-Only node; use Google Sheets for recording data).",
    triggers: [
      { id: "new_gform_response", name: "New Form Response Submitted", description: "Fires instantly when a response is submitted via Webhook URL", type: "instant" },
      { id: "response_updated", name: "Existing Response Edited", description: "Fires instantly when respondent modifies submitted answer via Webhook", type: "instant" }
    ],
    actions: []
  },
  {
    id: "typeform",
    name: "Typeform",
    icon: "HelpCircle",
    category: "Lead Capture & Forms",
    authType: "OAuth 2.0",
    syncMode: "Instant",
    notes: "1-Click OAuth 2.0 handshake for automated webhook registration (Triggers) and action APIs.",
    triggers: [
      { id: "new_typeform_sub", name: "New Response Submitted", description: "Fires in real-time when Typeform submission is completed", type: "instant" },
      { id: "partial_typeform_sub", name: "Partial Response Saved", description: "Fires on intermediate page progress", type: "instant" }
    ],
    actions: [
      { id: "create_typeform_entry", name: "Pre-fill Typeform Submission", description: "Generates custom prefilled URL" },
      { id: "get_typeform_report", name: "Fetch Form Analytics Report", description: "Fetches completion rate & drop-off metrics" },
      { id: "create_typeform_via_api", name: "Create Form Shell via API", description: "Generates new Typeform definition via API" },
      { id: "delete_typeform_response", name: "Delete Response Data Record", description: "Purges specific submission for GDPR compliance" }
    ]
  },
  {
    id: "hubspot",
    name: "HubSpot",
    icon: "Users",
    category: "CRM / Sales",
    authType: "OAuth 2.0",
    syncMode: "Webhook",
    notes: "Direct Webhook trigger URL. OAuth 2.0 authorization for CRM actions.",
    triggers: [
      { id: "new_contact", name: "New Contact Created", description: "Fires when a new contact is added in HubSpot", type: "instant" },
      { id: "contact_updated", name: "Contact Property Updated", description: "Fires when lifecycle stage or custom property changes", type: "instant" },
      { id: "deal_stage_changed", name: "Deal Stage Changed", description: "Fires when a deal moves to a new pipeline stage", type: "instant" },
      { id: "new_company", name: "New Company Created", description: "Fires when organization record is added", type: "instant" },
      { id: "new_ticket", name: "New Support Ticket Created", description: "Fires when customer files helpdesk ticket", type: "instant" }
    ],
    actions: [
      { id: "create_update_contact", name: "Create or Update Contact (Upsert)", description: "Upserts contact using email as unique identifier" },
      { id: "create_deal", name: "Create Deal", description: "Creates a new deal associated with contact" },
      { id: "update_deal_stage", name: "Update Deal Stage / Amount", description: "Moves deal between pipeline stages" },
      { id: "create_company", name: "Create or Associate Company", description: "Links contact to company domain" },
      { id: "add_timeline_event", name: "Add Note or Timeline Activity", description: "Logs call, email, or meeting note under contact timeline" },
      { id: "update_contact_lifecycle", name: "Update Contact Lifecycle Stage", description: "Promotes contact to Lead, MQL, SQL, or Customer" }
    ]
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    icon: "Table",
    category: "CRM / Sales",
    authType: "OAuth 2.0",
    syncMode: "Polling",
    notes: "Headers from row 1 auto-read for variable field mapping.",
    triggers: [
      { id: "new_row_added", name: "New Row Appended", description: "Fires when a new row is appended to worksheet", type: "polling" },
      { id: "new_updated_row", name: "New or Updated Row", description: "Fires when existing cell or row is edited", type: "polling" },
      { id: "new_worksheet", name: "New Worksheet Tab Created", description: "Fires when new tab is added to spreadsheet", type: "polling" }
    ],
    actions: [
      { id: "add_row", name: "Add Row", description: "Appends a new row to specified spreadsheet tab" },
      { id: "update_row", name: "Update Row", description: "Finds and updates a row by column lookup value" },
      { id: "lookup_row", name: "Lookup Row (Enrichment)", description: "Searches for matching row data for enrichment" },
      { id: "delete_row", name: "Delete Row in Worksheet", description: "Removes target row matching key value" },
      { id: "clear_row", name: "Clear Row Cell Contents", description: "Clears cell values while maintaining formatting" },
      { id: "create_worksheet", name: "Create New Worksheet Tab", description: "Adds fresh tab with header columns" },
      { id: "batch_add_rows", name: "Batch Insert Multiple Rows", description: "Appends array of multiple rows in a single API call" }
    ]
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    icon: "Target",
    category: "CRM / Sales",
    authType: "API Key",
    syncMode: "Webhook",
    notes: "Direct Webhook trigger URL. Personal API Token for actions.",
    triggers: [
      { id: "new_pipedrive_deal", name: "New Deal Created", description: "Fires when deal is created in Pipedrive", type: "instant" },
      { id: "deal_stage_moved", name: "Deal Stage Changed", description: "Fires when deal is moved between stages", type: "instant" },
      { id: "deal_won", name: "Deal Marked as Won", description: "Fires when deal status changes to Won", type: "instant" },
      { id: "deal_lost", name: "Deal Marked as Lost", description: "Fires when deal status changes to Lost", type: "instant" },
      { id: "new_person", name: "New Person Added", description: "Fires when contact person record is created", type: "instant" }
    ],
    actions: [
      { id: "create_person", name: "Create or Update Person", description: "Adds contact person to Pipedrive" },
      { id: "create_pipedrive_deal", name: "Create Deal", description: "Creates deal in pipeline" },
      { id: "update_deal", name: "Update Deal Custom Property", description: "Modifies deal value, owner, or stage" },
      { id: "add_note", name: "Add Activity Note to Deal", description: "Appends sales call or meeting note" },
      { id: "create_activity", name: "Schedule Activity / Call Task", description: "Creates follow-up activity reminder for sales rep" }
    ]
  },
  {
    id: "slack",
    name: "Slack",
    icon: "Hash",
    category: "Communication / Notifications",
    authType: "OAuth 2.0",
    syncMode: "Instant",
    notes: "Actions call Slack Web API directly with block formatting support.",
    triggers: [
      { id: "new_channel_msg", name: "New Message Posted to Channel", description: "Fires when new message arrives in public/private channel", type: "instant" },
      { id: "new_reaction", name: "New Reaction Added (Emoji)", description: "Fires when user adds target reaction emoji to message", type: "instant" },
      { id: "new_file_uploaded", name: "New File Uploaded to Workspace", description: "Fires when document/media is posted in Slack", type: "instant" }
    ],
    actions: [
      { id: "send_channel_msg", name: "Send Channel Message", description: "Posts message to selected Slack channel" },
      { id: "send_dm", name: "Send Direct Message", description: "Sends DM to specific user" },
      { id: "post_block_msg", name: "Post Formatted Block Layout", description: "Posts rich JSON block layout message with buttons" },
      { id: "upload_file", name: "Upload File / Document", description: "Attaches file directly to channel thread" },
      { id: "set_topic", name: "Update Channel Topic or Canvas", description: "Modifies topic string for team channel" },
      { id: "create_channel", name: "Create Public/Private Channel", description: "Creates new Slack channel for project or deal" }
    ]
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: "Mail",
    category: "Communication / Notifications",
    authType: "OAuth 2.0",
    syncMode: "Polling",
    notes: "Sends via user's authenticated address to ensure deliverability.",
    triggers: [
      { id: "new_email_matching", name: "New Email Received (Matching Label)", description: "Fires when new email arrives matching query/label", type: "polling" },
      { id: "new_star_email", name: "New Starred Email", description: "Fires when user stars an email thread", type: "polling" },
      { id: "new_attachment", name: "New Email with Attachment Received", description: "Fires when email containing file is delivered", type: "polling" }
    ],
    actions: [
      { id: "send_email", name: "Send Email (with Attachments)", description: "Sends email with optional attachment" },
      { id: "create_draft", name: "Create Email Draft", description: "Saves draft in user inbox for review" },
      { id: "add_label", name: "Add Label to Email Thread", description: "Applies category label to message" },
      { id: "reply_email", name: "Reply to Email Thread", description: "Replies directly in existing thread" },
      { id: "mark_as_read", name: "Mark Email as Read / Unread", description: "Updates read status on target thread" }
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "Send",
    category: "Communication / Notifications",
    authType: "Bot Token",
    syncMode: "Webhook",
    notes: "Bot token created via @BotFather. Instant Telegram setWebhook call.",
    triggers: [
      { id: "new_telegram_msg", name: "New Message Sent to Bot", description: "Fires when user sends message to bot", type: "instant" },
      { id: "new_chat_member", name: "New Member Joined Group", description: "Fires when new user enters group chat", type: "instant" },
      { id: "callback_query", name: "Inline Keyboard Button Tapped", description: "Fires when user taps interactive menu button", type: "instant" }
    ],
    actions: [
      { id: "send_telegram_msg", name: "Send Text Message via Bot", description: "Sends message or alert to Telegram group/chat" },
      { id: "send_photo", name: "Send Photo / Document", description: "Dispatches image or PDF attachment" },
      { id: "kick_chat_member", name: "Ban or Restrict Chat Member", description: "Removes offending user from group" },
      { id: "pin_message", name: "Pin Message in Group Chat", description: "Pins important announcement at top of chat" }
    ]
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: "ShoppingBag",
    category: "Commerce",
    authType: "API Key",
    syncMode: "Webhook",
    notes: "Direct Webhook trigger URL. Admin API Access Token for store actions.",
    triggers: [
      { id: "new_order", name: "New Order Created", description: "Fires when customer completes order checkout", type: "instant" },
      { id: "order_fulfilled", name: "Order Fulfilled", description: "Fires when order fulfillment status changes", type: "instant" },
      { id: "order_cancelled", name: "Order Cancelled / Refunded", description: "Fires when order is cancelled or refunded", type: "instant" },
      { id: "new_customer", name: "New Customer Registered", description: "Fires when customer account is created", type: "instant" },
      { id: "low_inventory", name: "Low Stock Inventory Level Alert", description: "Fires when product inventory drops below safety threshold", type: "instant" }
    ],
    actions: [
      { id: "add_order_note", name: "Add Internal Order Note", description: "Appends internal note to Shopify order" },
      { id: "update_order_tags", name: "Update Order Tags", description: "Adds or removes tags on order" },
      { id: "create_discount_code", name: "Generate Custom Discount Coupon", description: "Creates unique promo code" },
      { id: "update_inventory", name: "Adjust Product Stock Quantity", description: "Updates available inventory count" },
      { id: "create_product", name: "Create New Product Catalog Item", description: "Adds product title, price, and SKU" }
    ]
  },
  {
    id: "razorpay",
    name: "Razorpay",
    icon: "CreditCard",
    category: "Commerce",
    authType: "API Key",
    syncMode: "Webhook",
    notes: "Direct Webhook trigger URL. Key ID + Key Secret for payments.",
    triggers: [
      { id: "payment_captured", name: "Payment Captured", description: "Fires when payment is successfully charged", type: "instant" },
      { id: "payment_failed", name: "Payment Failed", description: "Fires on transaction error/decline", type: "instant" },
      { id: "refund_created", name: "Refund Processed", description: "Fires when refund is issued to customer", type: "instant" },
      { id: "subscription_charged", name: "Recurring Subscription Charged", description: "Fires on automated subscription billing renewal", type: "instant" }
    ],
    actions: [
      { id: "create_payment_link", name: "Create Sharable Payment Link", description: "Generates sharable payment link URL" },
      { id: "issue_refund", name: "Issue Partial or Full Refund", description: "Triggers refund for charge ID" },
      { id: "cancel_subscription", name: "Cancel Customer Subscription", description: "Cancels auto-renewing subscription" },
      { id: "create_order", name: "Create Payment Order ID", description: "Generates Razorpay order token for checkout integration" }
    ]
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: "Calendar",
    category: "Scheduling / Productivity",
    authType: "OAuth 2.0",
    syncMode: "Polling",
    notes: "Timezone inherited from calendar settings.",
    triggers: [
      { id: "new_event_created", name: "New Event Created", description: "Fires when new calendar event is scheduled", type: "polling" },
      { id: "event_starting_soon", name: "Event Starting Soon Alert", description: "Fires 15 mins before scheduled event start", type: "polling" },
      { id: "event_updated", name: "Event Details Updated", description: "Fires when event time or location is modified", type: "polling" }
    ],
    actions: [
      { id: "create_event", name: "Create Event (with Google Meet)", description: "Adds event to selected calendar with video call link" },
      { id: "update_event", name: "Update Event Time or Location", description: "Reschedules existing calendar entry" },
      { id: "add_attendee", name: "Add Attendee to Event", description: "Invites guest email to existing event" },
      { id: "delete_event", name: "Cancel Calendar Event", description: "Removes event and notifies guests" }
    ]
  },
  {
    id: "calendly",
    name: "Calendly",
    icon: "Clock",
    category: "Scheduling / Productivity",
    authType: "OAuth 2.0",
    syncMode: "Webhook",
    notes: "OAuth 2.0 authentication. Webhooks registered automatically via Calendly API v2.",
    triggers: [
      { id: "meeting_booked", name: "New Meeting Booked", description: "Fires when invitee schedules a Calendly event", type: "instant" },
      { id: "meeting_canceled", name: "Meeting Canceled by Invitee", description: "Fires when event is canceled", type: "instant" },
      { id: "invitee_rescheduled", name: "Invitee Rescheduled Meeting", description: "Fires when meeting time is shifted", type: "instant" }
    ],
    actions: [
      { id: "get_user_availability", name: "Fetch Available Booking Slots", description: "Checks user calendar for open availability" },
      { id: "cancel_event_calendly", name: "Cancel Scheduled Booking", description: "Cancels event via Calendly v2 API" },
      { id: "create_single_booking_link", name: "Create Single-Use Booking Link", description: "Generates one-time booking URL" }
    ]
  },
  {
    id: "freshdesk",
    name: "Freshdesk",
    icon: "Headphones",
    category: "Support",
    authType: "API Key",
    syncMode: "Webhook",
    notes: "Direct Webhook trigger URL. API key + domain for actions.",
    triggers: [
      { id: "new_ticket", name: "New Ticket Created", description: "Fires when customer submits a support ticket", type: "instant" },
      { id: "ticket_status_changed", name: "Ticket Status Changed", description: "Fires when status updates to Pending, Resolved, or Closed", type: "instant" },
      { id: "new_ticket_reply", name: "Customer Replied to Ticket", description: "Fires when customer sends new message thread", type: "instant" }
    ],
    actions: [
      { id: "create_ticket", name: "Create Support Ticket", description: "Creates support ticket in helpdesk" },
      { id: "add_ticket_note", name: "Add Note or Reply to Ticket", description: "Appends internal note or reply to ticket" },
      { id: "update_ticket_status", name: "Close / Resolve Ticket", description: "Marks ticket as resolved" },
      { id: "assign_agent", name: "Assign Ticket to Support Agent", description: "Transfers ticket ownership" },
      { id: "update_ticket_priority", name: "Update Ticket Priority (Urgent/High)", description: "Escalates priority level for SLA compliance" }
    ]
  },
  {
    id: "webhook-catch",
    name: "Webhook — Catch Hook",
    icon: "Webhook",
    category: "Generic Connectors",
    authType: "None",
    syncMode: "Instant",
    notes: "Generates unique unguessable URL per workflow. Field list auto-detected.",
    triggers: [
      { id: "catch_raw_webhook", name: "Webhook Received (POST/GET)", description: "Listens for raw JSON payload at unique endpoint URL", type: "instant" }
    ],
    actions: []
  },
  {
    id: "http-request",
    name: "HTTP Request — Send",
    icon: "Globe",
    category: "Generic Connectors",
    authType: "None",
    syncMode: "Instant",
    notes: "Configure GET/POST/PUT/DELETE, headers, auth, and JSON body directly.",
    triggers: [],
    actions: [
      { id: "send_custom_http", name: "Custom API Request (GET/POST/PUT/DELETE)", description: "Calls any external API endpoint and returns parsed JSON" },
      { id: "send_graphql_request", name: "Send GraphQL Query or Mutation", description: "Dispatches GraphQL request with variables" },
      { id: "send_multipart_form", name: "Send Multipart Form Data (File Upload)", description: "Dispatches form-data payload with file attachment" }
    ]
  },
  {
    id: "scheduler",
    name: "Scheduler",
    icon: "Clock",
    category: "Flow Control",
    authType: "None",
    syncMode: "Instant",
    notes: "Cron-like interval schedule (e.g., every 15 mins, daily at 9am).",
    triggers: [
      { id: "cron_schedule", name: "Schedule Trigger (Interval / Cron)", description: "Fires automatically based on set frequency or cron schedule", type: "schedule" }
    ],
    actions: [
      { id: "delay_next_cron", name: "Skip or Delay Next Scheduled Run", description: "Pauses next scheduled execution cycle" },
      { id: "pause_schedule_timer", name: "Pause / Resume Recurring Schedule", description: "Toggles recurring schedule status" }
    ]
  },

  // --- FLOW CONTROL CORE APPS ---
  {
    id: "filter",
    name: "Filter",
    icon: "Filter",
    category: "Flow Control",
    authType: "None",
    syncMode: "Instant",
    notes: "Conditional rule evaluator. Stops execution if IF/THEN rules fail.",
    triggers: [],
    actions: [
      { id: "apply_filter_rules", name: "Only Continue If... (AND/OR Logic)", description: "Evaluates conditional AND/OR rules before proceeding" },
      { id: "filter_regex", name: "Filter by Regex Pattern", description: "Matches field value against regular expression" },
      { id: "filter_date_range", name: "Filter by Date Range", description: "Validates if timestamp falls within start/end dates" }
    ]
  },
  {
    id: "router",
    name: "Router",
    icon: "GitFork",
    category: "Flow Control",
    authType: "None",
    syncMode: "Instant",
    notes: "Multi-branch routing engine for parallel execution paths.",
    triggers: [],
    actions: [
      { id: "route_branches", name: "Conditional Multi-Branching (Route A/B/C)", description: "Splits workflow into multiple conditional routes" },
      { id: "fallback_route", name: "Default Fallback Catch-All Branch", description: "Executes if no previous route conditions match" }
    ]
  },
  {
    id: "delay",
    name: "Delay",
    icon: "Hourglass",
    category: "Flow Control",
    authType: "None",
    syncMode: "Instant",
    notes: "Pauses workflow for duration or until specified date/time.",
    triggers: [],
    actions: [
      { id: "delay_duration", name: "Delay For (Duration)", description: "Pauses workflow execution for minutes, hours, or days" },
      { id: "delay_until", name: "Delay Until (Date/Time)", description: "Pauses workflow until specific timestamp" },
      { id: "delay_queue", name: "Rate Limiter Delay Queue", description: "Throttles dispatches to maximum N requests per minute" }
    ]
  },
  {
    id: "iterator",
    name: "Iterator / Loop",
    icon: "Repeat",
    category: "Flow Control",
    authType: "None",
    syncMode: "Instant",
    notes: "Loops through array items to perform sub-actions.",
    triggers: [],
    actions: [
      { id: "loop_array_items", name: "Loop Through Line Items Array", description: "Iterates over line items array for bulk processing" },
      { id: "aggregate_items", name: "Aggregate Items into Single Array", description: "Combines individual step outputs into single summary list" }
    ]
  },

  // --- UTILITIES CORE APPS ---
  {
    id: "text-formatter",
    name: "Text Formatter",
    icon: "Type",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Split, transform, extract, or replace text strings.",
    triggers: [],
    actions: [
      { id: "split_text", name: "Split Text String", description: "Splits text by separator (comma, space, etc.)" },
      { id: "change_case", name: "Transform Casing (UPPER/lower/Title)", description: "Converts text to UPPERCASE, lowercase, or Title Case" },
      { id: "find_replace", name: "Find & Replace Text", description: "Replaces target pattern or string in text" },
      { id: "extract_email_url", name: "Extract Email, URL or Phone Number", description: "Parses text to extract valid contact patterns" },
      { id: "truncate_text", name: "Truncate Character Length (...)", description: "Limits text length with trailing ellipsis" }
    ]
  },
  {
    id: "datetime-formatter",
    name: "DateTime Formatter",
    icon: "Calendar",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Format timestamps, add/subtract time, and convert timezones.",
    triggers: [],
    actions: [
      { id: "format_date", name: "Format Timestamp & Timezone", description: "Converts date format and timezones" },
      { id: "add_subtract_time", name: "Add / Subtract Time (Hours/Days)", description: "Adds or subtracts hours/days from timestamp" },
      { id: "time_difference", name: "Calculate Time Difference", description: "Computes duration between two timestamps" },
      { id: "current_timestamp", name: "Generate Current Unix/ISO Timestamp", description: "Returns live date object at run time" }
    ]
  },
  {
    id: "number-formatter",
    name: "Number Formatter",
    icon: "Calculator",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Perform math operations, currency formatting, and rounding.",
    triggers: [],
    actions: [
      { id: "spreadsheet_formulas", name: "Spreadsheet Formulas (Excel / Google Sheets Style)", description: "Evaluates standard spreadsheet formulas like SUM, AVERAGE, IF, ROUND, DAYS, RANDBETWEEN, etc." },
      { id: "math_operation", name: "Math Formula Calculation (+, -, *, /)", description: "Evaluates arithmetic math expressions" },
      { id: "format_currency", name: "Format Currency / Number ($ / ₹ / €)", description: "Formats number to currency standard" },
      { id: "round_number", name: "Round Up / Round Down Precision", description: "Rounds number to specified decimal places" },
      { id: "random_number", name: "Generate Random Number / OTP", description: "Generates random integer within range" }
    ]
  },
  {
    id: "api-webhook",
    name: "API",
    icon: "Code2",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Send custom HTTP requests to any REST API endpoint (GET/POST/PUT/DELETE).",
    triggers: [],
    actions: [
      { id: "send_custom_http", name: "Custom API Request (GET/POST/PUT/DELETE)", description: "Sends custom HTTP request with JSON payload" },
      { id: "custom_graphql", name: "Send GraphQL Query or Mutation", description: "Dispatches GraphQL request to endpoint" }
    ]
  },
  {
    id: "webhook",
    name: "Webhook",
    icon: "Webhook",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Catch incoming real-time webhook payloads from any external service.",
    triggers: [
      { id: "catch_raw_webhook", name: "Catch Webhook (Instant)", description: "Listens for raw JSON payload at unique endpoint URL", type: "instant" },
      { id: "catch_webhook_headers", name: "Catch Webhook with Headers", description: "Captures full request body along with HTTP headers", type: "instant" }
    ],
    actions: [
      { id: "custom_webhook_response", name: "Custom Webhook Response", description: "Returns custom HTTP status code & JSON response to the webhook caller" }
    ]
  },
  {
    id: "code-runner",
    name: "Code Runner (JS/Python)",
    icon: "FileCode",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Run custom JavaScript (Node.js 20) or Python 3.11 code.",
    triggers: [],
    actions: [
      { id: "run_javascript", name: "Run JavaScript (Node.js 20)", description: "Executes custom JavaScript code block" },
      { id: "run_python", name: "Run Python 3.11 Script", description: "Executes custom Python script block" }
    ]
  },
  {
    id: "lookup-table",
    name: "Lookup Table",
    icon: "Table2",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Map key-value pairs with fallback defaults.",
    triggers: [],
    actions: [
      { id: "lookup_mapping", name: "Lookup Key Value Pair", description: "Finds value matching key from mapping table" },
      { id: "dynamic_dictionary", name: "Dynamic Dictionary Token Swap", description: "Swaps key tokens dynamically" }
    ]
  },
  {
    id: "human-approval",
    name: "Human in the Loop",
    icon: "UserCheck",
    category: "Utilities",
    authType: "None",
    syncMode: "Instant",
    notes: "Pauses workflow until team member approves or rejects.",
    triggers: [],
    actions: [
      { id: "wait_for_approval", name: "Request Email Approval", description: "Pauses execution until team member approves via email/link" },
      { id: "request_user_input", name: "Pause Workflow for Manual Form Fill", description: "Pauses workflow until team member inputs required data" }
    ]
  }
]

/**
 * Apps that support external account authentication & credentials storage.
 * Excludes built-in utilities, flow control engines, and generic local connectors (which have authType: "None").
 */
export const CONNECTABLE_APPS: AppConnection[] = MVP_APPS.filter(
  (app) =>
    app.authType !== "None" &&
    app.category !== "Flow Control" &&
    app.category !== "Utilities" &&
    app.category !== "Generic Connectors"
)

// Seed User Connections Manager
export const INITIAL_USER_CONNECTIONS: UserConnection[] = [
  { id: "conn_1", appId: "automate-chats", appName: "Automate Chats", accountLabel: "Automate Chats #1 (+1 555-0192)", status: "Active", lastUsed: "2 mins ago", authType: "API Key" },
  { id: "conn_2", appId: "automate-forms", appName: "Automate Forms", accountLabel: "Automate Forms #1 (Lead Gen Forms)", status: "Active", lastUsed: "10 mins ago", authType: "API Key" },
  { id: "conn_3", appId: "google-sheets", appName: "Google Sheets", accountLabel: "marketing-leads@company.com", status: "Active", lastUsed: "1 hour ago", authType: "OAuth 2.0" },
  { id: "conn_4", appId: "hubspot", appName: "HubSpot", accountLabel: "Production Portal (Hub ID: 89412)", status: "Active", lastUsed: "Yesterday", authType: "OAuth 2.0" },
  { id: "conn_5", appId: "slack", appName: "Slack", accountLabel: "Growth Team Workspace", status: "Active", lastUsed: "3 hours ago", authType: "OAuth 2.0" },
  { id: "conn_6", appId: "shopify", appName: "Shopify", accountLabel: "store.myshopify.com", status: "Needs reauthorization", lastUsed: "5 days ago", authType: "OAuth 2.0" },
  { id: "conn_7", appId: "typeform", appName: "Typeform", accountLabel: "Corporate Typeform Workspace", status: "Active", lastUsed: "4 hours ago", authType: "OAuth 2.0" }
]

// Seed Workflows
export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "wf_1",
    name: "Automate Form Lead → WhatsApp Welcome & HubSpot CRM Sync",
    status: "On",
    lastRunStatus: "success",
    lastRunDate: "5 mins ago",
    updatedAt: "2 hours ago",
    taskCountThisMonth: 1420,
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "automate-forms",
        appName: "Automate Forms",
        eventId: "new_form_sub",
        eventName: "New Form Submission",
        connectionId: "conn_2",
        status: "configured",
        fieldMappings: { form_id: "form_lead_gen_2026" },
        testOutput: {
          submission_id: "sub_98412",
          first_name: "Rahul",
          last_name: "Sharma",
          email: "rahul.sharma@example.com",
          phone: "+91 98765 43210",
          company: "TechPulse India",
          created_at: "2026-09-01T10:45:00Z"
        }
      },
      {
        id: "step_2",
        type: "action",
        appId: "automate-chats",
        appName: "Automate Chats",
        eventId: "send_wa_template",
        eventName: "Send WhatsApp Template Message",
        connectionId: "conn_1",
        status: "configured",
        fieldMappings: {
          phone: "{{1.phone}}",
          template_name: "welcome_onboarding_v1",
          param_1: "{{1.first_name}}",
          param_2: "{{1.company}}"
        },
        testOutput: {
          message_id: "wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSRDk4MkE3RjA5QkI1QjA0MzAA",
          status: "sent",
          recipient: "+91 98765 43210"
        }
      },
      {
        id: "step_3",
        type: "action",
        appId: "hubspot",
        appName: "HubSpot",
        eventId: "create_update_contact",
        eventName: "Create or Update Contact",
        connectionId: "conn_4",
        status: "configured",
        fieldMappings: {
          email: "{{1.email}}",
          firstname: "{{1.first_name}}",
          lastname: "{{1.last_name}}",
          phone: "{{1.phone}}",
          company: "{{1.company}}",
          lifecyclestage: "lead"
        },
        testOutput: {
          vid: 541092,
          isNew: true,
          portalId: 89412
        }
      },
      {
        id: "step_4",
        type: "action",
        appId: "slack",
        appName: "Slack",
        eventId: "send_channel_msg",
        eventName: "Send Channel Message",
        connectionId: "conn_5",
        status: "configured",
        fieldMappings: {
          channel: "#sales-alerts",
          message: "🎉 New Lead Captured! *{{1.first_name}} {{1.last_name}}* from *{{1.company}}*. WhatsApp welcome message dispatched."
        },
        testOutput: {
          ok: true,
          ts: "1725187500.000200",
          channel: "C054812"
        }
      }
    ]
  },
  {
    id: "wf_2",
    name: "Shopify Order Created → Google Sheets Row & Slack Notification",
    status: "On",
    lastRunStatus: "success",
    lastRunDate: "12 mins ago",
    updatedAt: "1 day ago",
    taskCountThisMonth: 840,
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "shopify",
        appName: "Shopify",
        eventId: "new_order",
        eventName: "New Order Created",
        connectionId: "conn_6",
        status: "configured",
        fieldMappings: { store: "mybrand.myshopify.com" },
        testOutput: { order_number: "#1094", total_price: "149.00", customer_name: "Priya Patel" }
      },
      {
        id: "step_2",
        type: "action",
        appId: "google-sheets",
        appName: "Google Sheets",
        eventId: "add_row",
        eventName: "Add Row",
        connectionId: "conn_3",
        status: "configured",
        fieldMappings: { spreadsheet: "Sales Ledger 2026", col_A: "{{1.order_number}}", col_B: "{{1.customer_name}}", col_C: "{{1.total_price}}" }
      }
    ]
  },
  {
    id: "wf_3",
    name: "Freshdesk High Priority Ticket Alert → WhatsApp to On-Call Tech",
    status: "Off",
    lastRunStatus: "never",
    lastRunDate: "Never",
    updatedAt: "3 days ago",
    taskCountThisMonth: 0,
    steps: []
  }
]

// Seed Templates (Section 8.8 / 16-17)
export const SEED_TEMPLATES: Template[] = [
  {
    id: "tpl_1",
    title: "New Form Submission → WhatsApp Welcome Message",
    description: "Instantly send a WhatsApp welcome message to leads submitting an Automate Form.",
    category: "Lead Capture",
    apps: ["automate-forms", "automate-chats"],
    triggerSummary: "Automate Forms: New Submission",
    actionSummary: "Automate Chats: Send Template Message",
    stepCount: 2,
    savings: {
      money: "$780/year",
      time: "24 hours"
    },
    about: "Instantly welcome new leads by sending a personalized WhatsApp message the second they submit an inquiry through your Automate Form. This workflow guarantees a response time under 1 minute, increasing conversion rates by over 40% and keeping potential customers engaged without requiring manual follow-ups.",
    author: "Automate Workflows Team • Updated Recently",
    setupGuide: [
      "Select or create your Automate Form with contact fields (Name, Phone, Email).",
      "Connect your Automate Chats WhatsApp Business number.",
      "Map form fields into your pre-approved WhatsApp welcome template message.",
      "Test the trigger and activate your workflow."
    ],
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "automate-forms",
        appName: "Automate Forms",
        eventId: "new_submission",
        eventName: "1. New Form Submission",
        status: "configured",
        fieldMappings: { form_id: "lead_inquiry_form" }
      },
      {
        id: "step_2",
        type: "action",
        appId: "automate-chats",
        appName: "Automate Chats",
        eventId: "send_template",
        eventName: "2. Send WhatsApp Welcome Message",
        status: "configured",
        fieldMappings: { template_name: "welcome_intro_v1" }
      }
    ]
  },
  {
    id: "tpl_2",
    title: "Form Submission → WhatsApp Message + HubSpot Contact Creation",
    description: "Capture leads, send a personalized WhatsApp intro, and record contact details in HubSpot CRM.",
    category: "CRM Sync",
    apps: ["automate-forms", "automate-chats", "hubspot"],
    triggerSummary: "Automate Forms: New Submission",
    actionSummary: "Automate Chats + HubSpot Create Contact",
    stepCount: 3,
    savings: {
      money: "$1,450/year",
      time: "38 hours"
    },
    about: "When an inbound lead fills out a form, this automation immediately registers or updates their record in HubSpot CRM with tags and lifecycle stage, then reaches out to them on WhatsApp with a personalized welcome message. Eliminates manual data entry between your marketing and sales stacks.",
    author: "Automate Workflows Team • Updated Recently",
    setupGuide: [
      "Connect your Automate Form account and select the target form.",
      "Authenticate your HubSpot CRM OAuth account.",
      "Link your Automate Chats WhatsApp Business account.",
      "Configure field mappings for Lead Name, Email, and Phone number.",
      "Turn on the automation and verify with a test submission."
    ],
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "automate-forms",
        appName: "Automate Forms",
        eventId: "new_submission",
        eventName: "1. New Form Submission",
        status: "configured",
        fieldMappings: { form_id: "demo_request_form" }
      },
      {
        id: "step_2",
        type: "action",
        appId: "hubspot",
        appName: "HubSpot",
        eventId: "create_update_contact",
        eventName: "2. Create or Update HubSpot Contact",
        status: "configured",
        fieldMappings: { email: "{{step_1.email}}", firstname: "{{step_1.name}}" }
      },
      {
        id: "step_3",
        type: "action",
        appId: "automate-chats",
        appName: "Automate Chats",
        eventId: "send_template",
        eventName: "3. Send WhatsApp Intro Message",
        status: "configured",
        fieldMappings: { recipient: "{{step_1.phone}}" }
      }
    ]
  },
  {
    id: "tpl_3",
    title: "Shopify New Order → Slack Channel Alert & Google Sheets Log",
    description: "Notify sales team on Slack and record order details in Google Sheets spreadsheet.",
    category: "E-Commerce",
    apps: ["shopify", "slack", "google-sheets"],
    triggerSummary: "Shopify: New Order Created",
    actionSummary: "Slack + Google Sheets Add Row",
    stepCount: 3,
    savings: {
      money: "$2,100/year",
      time: "52 hours"
    },
    about: "Keep your sales, operations, and fulfillment teams perfectly synchronized. Every time a new order is paid in your Shopify store, this automation automatically posts a formatted order summary into your team's Slack #orders channel and appends a real-time record in a Google Sheets tracking spreadsheet for bookkeeping.",
    author: "Automate Workflows Team • Updated Recently",
    setupGuide: [
      "Connect your Shopify store using your API credentials or OAuth.",
      "Authenticate Slack and choose the target notification channel (#orders).",
      "Connect Google Sheets and select your sales spreadsheet and worksheet tab.",
      "Map order number, customer name, total amount, and line items.",
      "Activate the workflow to start capturing sales in real-time."
    ],
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "shopify",
        appName: "Shopify",
        eventId: "order_created",
        eventName: "1. New Order Paid",
        status: "configured",
        fieldMappings: { store_id: "main_store" }
      },
      {
        id: "step_2",
        type: "action",
        appId: "slack",
        appName: "Slack",
        eventId: "send_channel_message",
        eventName: "2. Post Alert to #orders Channel",
        status: "configured",
        fieldMappings: { channel: "#orders", text: "New Order {{step_1.order_number}} for {{step_1.total_price}}" }
      },
      {
        id: "step_3",
        type: "action",
        appId: "google-sheets",
        appName: "Google Sheets",
        eventId: "add_row",
        eventName: "3. Append Row to Sales Ledger",
        status: "configured",
        fieldMappings: { spreadsheetId: "sales_ledger_2026", sheetName: "Orders" }
      }
    ]
  },
  {
    id: "tpl_4",
    title: "Freshdesk Urgent Ticket → WhatsApp Escalation",
    description: "Alert on-call tech support engineers on WhatsApp when high-priority tickets are created.",
    category: "Customer Support",
    apps: ["freshdesk", "automate-chats"],
    triggerSummary: "Freshdesk: New Ticket",
    actionSummary: "Automate Chats: Send Session Message",
    stepCount: 2,
    savings: {
      money: "$920/year",
      time: "18 hours"
    },
    about: "Escalate critical customer support issues with zero lag. When a high-priority ticket is created or updated in Freshdesk, this workflow instantly sends an emergency escalation notification to your on-call engineers via WhatsApp so severe incidents are triaged in seconds.",
    author: "Automate Workflows Team • Updated Recently",
    setupGuide: [
      "Connect your Freshdesk domain and API key.",
      "Set up the trigger criteria to match Urgent / High severity tickets.",
      "Authenticate your Automate Chats WhatsApp account.",
      "Configure recipient phone numbers for the on-call support team.",
      "Save and test with a sample urgent ticket."
    ],
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "freshdesk",
        appName: "Freshdesk",
        eventId: "new_ticket",
        eventName: "1. High Priority Ticket Filed",
        status: "configured",
        fieldMappings: { priority: "urgent" }
      },
      {
        id: "step_2",
        type: "action",
        appId: "automate-chats",
        appName: "Automate Chats",
        eventId: "send_session_message",
        eventName: "2. Dispatch WhatsApp Alert to On-Call",
        status: "configured",
        fieldMappings: { message: "CRITICAL: Ticket #{{step_1.ticket_id}} filed: {{step_1.subject}}" }
      }
    ]
  },
  {
    id: "tpl_5",
    title: "Catch Webhook → Multi-App Dispatch",
    description: "Generic HTTP POST endpoint to ingest JSON payloads from any legacy software.",
    category: "Notifications",
    apps: ["webhook", "filter", "slack", "gmail"],
    triggerSummary: "Webhook Catch Hook",
    actionSummary: "Slack DM + Gmail Send Email",
    stepCount: 4,
    savings: {
      money: "$1,150/year",
      time: "30 hours"
    },
    about: "A universal HTTP endpoint designed to ingest JSON payloads from third-party services, custom backends, or legacy software. Once received, the payload is filtered for valid status and dispatched simultaneously to Slack team channels and via Gmail notifications to responsible stakeholders.",
    author: "Automate Workflows Team • Updated Recently",
    setupGuide: [
      "Copy the unique Webhook endpoint URL generated for this workflow.",
      "Send a sample JSON test payload from your external app or Postman.",
      "Set your filtering condition (e.g. status === 'active' or amount > 100).",
      "Connect Slack and Gmail to dispatch notifications.",
      "Activate the webhook listener."
    ],
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "webhook",
        appName: "Webhook",
        eventId: "catch_hook",
        eventName: "1. Catch Inbound JSON Webhook",
        status: "configured",
        fieldMappings: {}
      },
      {
        id: "step_2",
        type: "action",
        appId: "filter",
        appName: "Filter",
        eventId: "condition_filter",
        eventName: "2. Validate Payload Conditions",
        status: "configured",
        fieldMappings: { condition: "{{step_1.status}} == 'success'" }
      },
      {
        id: "step_3",
        type: "action",
        appId: "slack",
        appName: "Slack",
        eventId: "send_channel_message",
        eventName: "3. Notify Team in Slack",
        status: "configured",
        fieldMappings: { channel: "#alerts" }
      },
      {
        id: "step_4",
        type: "action",
        appId: "gmail",
        appName: "Gmail",
        eventId: "send_email",
        eventName: "4. Send Confirmation Email",
        status: "configured",
        fieldMappings: { to: "team@example.com" }
      }
    ]
  },
  {
    id: "tpl_6",
    title: "Daily Schedule & Task Briefing",
    description: "Every weekday morning, gather weather, Google Calendar meetings, and tasks into a consolidated briefing.",
    category: "Personal Productivity",
    apps: ["schedule", "http", "calendar", "gmail"],
    triggerSummary: "Schedule: Every Weekday at 8:00 AM",
    actionSummary: "Weather + Google Calendar + Gmail Morning Digest",
    stepCount: 4,
    savings: {
      money: "$1,260/year",
      time: "46 hours"
    },
    about: "This automation acts like a personal daily assistant that prepares a clear morning overview for you. Every weekday morning at a chosen time, it automatically gathers the most important information you need to start your day without opening multiple apps. First, it checks the weather forecast for your location and summarizes today's expected conditions. Then, it looks at your Google Calendar to see what meetings or events you have scheduled for the day. After that, it reviews your pending tasks to collect all items that are due today and emails you a clean, formatted briefing via Gmail.",
    author: "Automate Workflows Team • Jan 18",
    setupGuide: [
      "Configure the daily trigger schedule (e.g. 8:00 AM every weekday).",
      "Set your city location coordinates for the weather forecast API.",
      "Connect your Google Calendar account to pull today's events.",
      "Authenticate your Gmail address to receive the daily briefing."
    ],
    steps: [
      {
        id: "step_1",
        type: "trigger",
        appId: "schedule",
        appName: "Schedule",
        eventId: "cron_schedule",
        eventName: "1. Every Day (8:00 AM)",
        status: "configured",
        fieldMappings: { cron: "0 8 * * 1-5" }
      },
      {
        id: "step_2",
        type: "action",
        appId: "http",
        appName: "HTTP",
        eventId: "http_get",
        eventName: "2. Get Forecast Weather API",
        status: "configured",
        fieldMappings: { url: "https://api.weather.com/v1/forecast" }
      },
      {
        id: "step_3",
        type: "action",
        appId: "calendar",
        appName: "Google Calendar",
        eventId: "get_events",
        eventName: "3. Get Today Events",
        status: "configured",
        fieldMappings: { timeMin: "today_start", timeMax: "today_end" }
      },
      {
        id: "step_4",
        type: "action",
        appId: "gmail",
        appName: "Gmail",
        eventId: "send_email",
        eventName: "4. Send Daily Briefing Email",
        status: "configured",
        fieldMappings: { subject: "Morning Briefing - {{date}}" }
      }
    ]
  }
]

// Seed Run History Execution Logs (Section 8.6)
export const INITIAL_RUN_HISTORY: RunHistoryItem[] = [
  {
    id: "run_9012",
    workflowId: "wf_1",
    workflowName: "Automate Form Lead → WhatsApp Welcome & HubSpot CRM Sync",
    timestamp: "2026-09-01 10:45:12",
    triggerSource: "Automate Forms Webhook",
    status: "success",
    duration: "1.2s",
    stepLogs: [
      {
        stepId: "step_1",
        stepName: "New Form Submission",
        appName: "Automate Forms",
        appId: "automate-forms",
        status: "success",
        duration: "180ms",
        inputPayload: { form_id: "form_lead_gen_2026", source_url: "https://example.com/signup" },
        outputPayload: { submission_id: "sub_98412", name: "Rahul Sharma", phone: "+919876543210", email: "rahul@example.com", company: "Sharma Tech Solutions", submitted_at: "2026-09-01T10:45:11.890Z" }
      },
      {
        stepId: "step_2",
        stepName: "Send WhatsApp Template Message",
        appName: "Automate Chats",
        appId: "automate-chats",
        status: "success",
        duration: "450ms",
        inputPayload: { phone: "+919876543210", template: "welcome_onboarding_v1", language: "en_US", variable_name: "Rahul Sharma", company: "Automate Workflows" },
        outputPayload: { message_id: "wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSRDk4MkE3RjA5QkI1QjA0MzAA", status: "sent", recipient: "+919876543210", timestamp: 1788269112 }
      },
      {
        stepId: "step_3",
        stepName: "Create or Update Contact",
        appName: "HubSpot",
        appId: "hubspot",
        status: "success",
        duration: "570ms",
        inputPayload: { email: "rahul@example.com", firstname: "Rahul", lastname: "Sharma", phone: "+919876543210", lifecyclestage: "lead", lead_source: "Automate Forms" },
        outputPayload: { vid: 541092, isNew: true, portalId: 9812450, properties: { email: "rahul@example.com", firstname: "Rahul", lastname: "Sharma" } }
      }
    ]
  },
  {
    id: "run_9011",
    workflowId: "wf_1",
    workflowName: "Automate Form Lead → WhatsApp Welcome & HubSpot CRM Sync",
    timestamp: "2026-09-01 09:30:04",
    triggerSource: "Automate Forms Webhook",
    status: "error",
    duration: "0.8s",
    failedStepIndex: 2,
    errorMessage: "HubSpot API Error (401 Unauthorized): Invalid access token or scope missing",
    stepLogs: [
      {
        stepId: "step_1",
        stepName: "New Form Submission",
        appName: "Automate Forms",
        appId: "automate-forms",
        status: "success",
        duration: "190ms",
        inputPayload: { form_id: "form_lead_gen_2026", source_url: "https://example.com/demo" },
        outputPayload: { submission_id: "sub_98401", name: "Anita Roy", phone: "+919812345678", email: "anita@test.com", company: "Roy Enterprises", submitted_at: "2026-09-01T09:30:03.712Z" }
      },
      {
        stepId: "step_2",
        stepName: "Send WhatsApp Template Message",
        appName: "Automate Chats",
        appId: "automate-chats",
        status: "success",
        duration: "380ms",
        inputPayload: { phone: "+919812345678", template: "welcome_onboarding_v1", variable_name: "Anita Roy" },
        outputPayload: { message_id: "wamid.HBgLOTE5ODEyMzQ1Njc4FQIAERgSRDk4MkE3RjA5QkI1QjA0MzAA", status: "sent", recipient: "+919812345678", timestamp: 1788264604 }
      },
      {
        stepId: "step_3",
        stepName: "Create or Update Contact",
        appName: "HubSpot",
        appId: "hubspot",
        status: "error",
        duration: "230ms",
        inputPayload: { email: "anita@test.com", firstname: "Anita", lastname: "Roy", phone: "+919812345678" },
        outputPayload: { error: "INVALID_AUTH", message: "Token expired or revoked by HubSpot organization admin", status: "error", correlationId: "hs_err_891bca7" },
        errorDetails: "HTTP 401 Unauthorized - OAuth access token expired. Reauthorization or reconnect required."
      }
    ]
  },
  {
    id: "run_9010",
    workflowId: "wf_2",
    workflowName: "Shopify New Order → Slack Channel Alert & Google Sheets Row",
    timestamp: "2026-09-01 08:15:30",
    triggerSource: "Shopify Instant Webhook",
    status: "success",
    duration: "1.4s",
    stepLogs: [
      {
        stepId: "step_1",
        stepName: "New Order Created",
        appName: "Shopify",
        appId: "shopify",
        status: "success",
        duration: "210ms",
        inputPayload: { topic: "orders/create", store_domain: "mystore.myshopify.com" },
        outputPayload: { order_id: "ord_1084291", order_number: 1042, customer_name: "Vikram Patel", email: "vikram@example.com", total_price: "249.00", currency: "USD", items_count: 3 }
      },
      {
        stepId: "step_2",
        stepName: "Send Channel Message",
        appName: "Slack",
        appId: "slack",
        status: "success",
        duration: "420ms",
        inputPayload: { channel: "#sales-alerts", text: "🎉 New Order #1042 from Vikram Patel ($249.00 USD)" },
        outputPayload: { ok: true, channel: "C084B91LA", ts: "1788260130.001200", message: { text: "🎉 New Order #1042 from Vikram Patel ($249.00 USD)" } }
      },
      {
        stepId: "step_3",
        stepName: "Add Row to Spreadsheet",
        appName: "Google Sheets",
        appId: "google-sheets",
        status: "success",
        duration: "770ms",
        inputPayload: { spreadsheet_id: "sheet_orders_2026", sheet_name: "Sheet1", row_values: ["1042", "Vikram Patel", "vikram@example.com", "249.00", "USD", "PAID"] },
        outputPayload: { spreadsheetId: "sheet_orders_2026", updatedRange: "Sheet1!A42:F42", updatedRows: 1, updatedColumns: 6 }
      }
    ]
  },
  {
    id: "run_9009",
    workflowId: "wf_3",
    workflowName: "Typeform Feedback → Pipedrive Lead & Gmail Notification",
    timestamp: "2026-08-31 16:22:15",
    triggerSource: "Typeform Webhook",
    status: "error",
    duration: "0.9s",
    failedStepIndex: 1,
    errorMessage: "Pipedrive API Error (429 Rate Limit Exceeded): Too many requests in current 10-second window",
    stepLogs: [
      {
        stepId: "step_1",
        stepName: "New Form Entry",
        appName: "Typeform",
        appId: "typeform",
        status: "success",
        duration: "240ms",
        inputPayload: { form_id: "tf_nps_survey_2026" },
        outputPayload: { response_id: "resp_77189a", respondent_name: "Sara Connor", email: "sara@cyberdyne.io", score: 9, comment: "Love the visual automation builder!" }
      },
      {
        stepId: "step_2",
        stepName: "Create Lead & Contact",
        appName: "Pipedrive",
        appId: "pipedrive",
        status: "error",
        duration: "660ms",
        inputPayload: { title: "Sara Connor (NPS 9)", person_name: "Sara Connor", email: "sara@cyberdyne.io" },
        outputPayload: { success: false, error: "RATE_LIMIT_EXCEEDED", errorCode: 429, retryAfterSeconds: 5 },
        errorDetails: "HTTP 429 Rate Limit Exceeded - 100 requests per 10 seconds limit reached for API token. Backoff required."
      }
    ]
  }
]
