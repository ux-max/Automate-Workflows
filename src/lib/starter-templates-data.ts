import { WorkflowTemplateCardItem } from "@/components/templates/WorkflowTemplateCard"

export const CATEGORY_TABS = [
  "All",
  "Featured",
  "✨ Everyday",
  "Customer Service",
  "Sales",
  "Engineering",
  "Finance",
  "HR",
  "IT",
  "Legal",
  "Marketing",
  "Operations",
  "Product",
  "Agents"
]

export const STARTER_TEMPLATES_BY_CATEGORY: Record<string, WorkflowTemplateCardItem[]> = {
  "Featured": [
    {
      id: "tpl_investor_update",
      title: "Create Investor Update Deck",
      description: "Automatically create, export, and send a polished monthly investor update using real-time data from your core business metrics.",
      timeSaved: "8 hrs/month",
      apps: ["stripe", "googlesheets", "hubspot", "notion", "gmail"],
      category: "Featured",
      tintColor: "purple",
      templateId: "tpl_investor_update"
    },
    {
      id: "tpl_daily_briefing",
      title: "Daily Schedule & Task Briefing",
      description: "Sends a simple daily email that summarizes today's weather, calendar schedule, and to-do tasks in one easy-to-read briefing.",
      timeSaved: "2.5 hrs/week",
      apps: ["googlecalendar", "notion", "weather", "gmail"],
      category: "Featured",
      tintColor: "blue",
      templateId: "tpl_daily_briefing"
    },
    {
      id: "tpl_notion_calendar",
      title: "Sync Notion Databases to Google Calendar",
      description: "This flow automatically syncs Notion CRM entries and deadlines directly to Google Calendar events.",
      timeSaved: "5 hrs/week",
      apps: ["notion", "googlecalendar"],
      category: "Featured",
      tintColor: "sky",
      templateId: "tpl_notion_calendar"
    },
    {
      id: "tpl_youtube_summary",
      title: "Summarize YouTube Videos to Docs",
      description: "This automation pulls YouTube video transcripts, condenses key ideas using AI, and creates a polished Google Docs summary.",
      timeSaved: "4 hrs/week",
      apps: ["openai", "googledocs"],
      category: "Featured",
      tintColor: "indigo",
      templateId: "tpl_youtube_summary"
    },
    {
      id: "tpl_deadline_reminders",
      title: "Daily Task Deadline Reminders",
      description: "Prevents missed deadlines by pulling tasks from Notion and Google Sheets every morning and calculating due alerts.",
      timeSaved: "3 hrs/week",
      apps: ["googlesheets", "notion", "slack"],
      category: "Featured",
      tintColor: "emerald",
      templateId: "tpl_deadline_reminders"
    }
  ],
  "✨ Everyday": [
    {
      id: "tpl_slack_email_alerts",
      title: "Send Slack Alerts for Emails",
      description: "Send automatic Slack notifications when Gmail emails match specific filters like subject, sender, or VIP label.",
      timeSaved: "2 hrs/week",
      apps: ["gmail", "slack"],
      category: "✨ Everyday",
      tintColor: "rose",
      templateId: "tpl_slack_email_alerts"
    },
    {
      id: "tpl_ai_sheet_content",
      title: "Generate AI Content From Sheet Rows",
      description: "Generate AI content automatically from Google Sheets rows and write the enriched results back to the sheet.",
      timeSaved: "7 hrs/week",
      apps: ["googlesheets", "openai"],
      category: "✨ Everyday",
      tintColor: "cyan",
      templateId: "tpl_ai_sheet_content"
    },
    {
      id: "tpl_planner_autopilot",
      title: "Planner assignment autopilot",
      description: "Automatically generate an AI context pack when a Planner task is assigned, notify assignee in Teams, and create tracking.",
      timeSaved: "6 hrs/week",
      apps: ["planner", "openai", "microsoftteams", "todoist", "slack"],
      category: "✨ Everyday",
      tintColor: "purple",
      templateId: "tpl_planner_autopilot"
    },
    {
      id: "tpl_forward_specific_emails",
      title: "Forward Specific Emails Automatically",
      description: "Forward Gmail emails containing a keyword automatically to a chosen email address, saving time and avoiding missed inquiries.",
      timeSaved: "1.5 hrs/week",
      apps: ["gmail"],
      category: "✨ Everyday",
      tintColor: "red",
      templateId: "tpl_forward_specific_emails"
    },
    {
      id: "tpl_sheet_updates_slack",
      title: "Send Sheet Updates to Slack",
      description: "Send instant Slack notifications for every new Google Sheets row, keeping your team updated automatically.",
      timeSaved: "3 hrs/week",
      apps: ["googlesheets", "slack"],
      category: "✨ Everyday",
      tintColor: "teal",
      templateId: "tpl_sheet_updates_slack"
    }
  ],
  "Customer Service": [
    {
      id: "tpl_cs_zendesk_ai",
      title: "Auto-Respond to Zendesk Tickets via AI",
      description: "Instantly draft smart, context-aware responses to new customer tickets using AI and send alert to Slack.",
      timeSaved: "12 hrs/week",
      apps: ["zendesk", "openai", "slack"],
      category: "Customer Service",
      tintColor: "blue",
      templateId: "tpl_cs_zendesk_ai"
    },
    {
      id: "tpl_cs_whatsapp_freshdesk",
      title: "WhatsApp Support Lead to Freshdesk Ticket",
      description: "Convert incoming WhatsApp support messages into actionable support tickets inside Freshdesk automatically.",
      timeSaved: "4 hrs/week",
      apps: ["whatsapp", "freshdesk", "slack"],
      category: "Customer Service",
      tintColor: "emerald",
      templateId: "tpl_cs_whatsapp_freshdesk"
    },
    {
      id: "tpl_cs_survey_slack",
      title: "Customer Satisfaction Survey → Sheets & Slack",
      description: "Collect CSAT responses from Typeform, log scores in Google Sheets, and notify support team on negative ratings.",
      timeSaved: "3 hrs/week",
      apps: ["typeform", "googlesheets", "slack"],
      category: "Customer Service",
      tintColor: "teal",
      templateId: "tpl_cs_survey_slack"
    }
  ],
  "Sales": [
    {
      id: "tpl_sales_whatsapp_hubspot",
      title: "WhatsApp Lead → HubSpot CRM Sync",
      description: "Automatically log incoming WhatsApp leads and update contact lifecycle stages and deals in HubSpot CRM.",
      timeSaved: "6 hrs/week",
      apps: ["whatsapp", "hubspot", "slack"],
      category: "Sales",
      tintColor: "purple",
      templateId: "tpl_2"
    },
    {
      id: "tpl_sales_stripe_pipedrive",
      title: "New Stripe Payment → Pipedrive Deal Won",
      description: "Celebrate won deals! Automatically move Pipedrive deals to Won status when customers pay via Stripe.",
      timeSaved: "3.5 hrs/week",
      apps: ["stripe", "pipedrive", "slack"],
      category: "Sales",
      tintColor: "emerald",
      templateId: "tpl_sales_stripe_pipedrive"
    },
    {
      id: "tpl_sales_form_salesforce",
      title: "Automate Form Submissions → Salesforce Lead",
      description: "Create qualified leads in Salesforce whenever someone completes your high-converting Automate Form.",
      timeSaved: "5 hrs/week",
      apps: ["googleforms", "salesforce", "gmail"],
      category: "Sales",
      tintColor: "sky",
      templateId: "tpl_sales_form_salesforce"
    }
  ],
  "Engineering": [
    {
      id: "tpl_eng_github_slack",
      title: "GitHub Release → Slack Announcement & Notion",
      description: "Post full GitHub release notes to your team's Slack channel and update your public Notion changelog page.",
      timeSaved: "2 hrs/week",
      apps: ["github", "slack", "notion"],
      category: "Engineering",
      tintColor: "slate",
      templateId: "tpl_eng_github_slack"
    },
    {
      id: "tpl_eng_discord_alert",
      title: "Critical System Alert → Discord & Slack Notification",
      description: "Notify on-call engineers across Discord and Slack instantly when server monitoring catches an issue.",
      timeSaved: "4 hrs/week",
      apps: ["discord", "slack", "github"],
      category: "Engineering",
      tintColor: "red",
      templateId: "tpl_eng_discord_alert"
    }
  ],
  "Finance": [
    {
      id: "tpl_fin_stripe_failed",
      title: "Stripe Charge Failed → Slack Alert & Recovery Email",
      description: "Instantly alert finance teams and send friendly dunning recovery emails to customers whose payment failed.",
      timeSaved: "5 hrs/week",
      apps: ["stripe", "slack", "gmail"],
      category: "Finance",
      tintColor: "rose",
      templateId: "tpl_fin_stripe_failed"
    },
    {
      id: "tpl_fin_daily_rev",
      title: "Daily Revenue Report → Slack & Google Sheets",
      description: "Aggregate today's Stripe volume, calculate MRR progression, and post a crisp morning briefing to Slack.",
      timeSaved: "3 hrs/week",
      apps: ["stripe", "googlesheets", "slack"],
      category: "Finance",
      tintColor: "emerald",
      templateId: "tpl_fin_daily_rev"
    }
  ],
  "HR": [
    {
      id: "tpl_hr_onboarding",
      title: "New Employee Onboarding Form → Teams Welcome",
      description: "Generate employee directory profile, trigger Microsoft Teams welcome, and set up Google Drive folders.",
      timeSaved: "4.5 hrs/week",
      apps: ["googleforms", "microsoftteams", "googledrive"],
      category: "HR",
      tintColor: "blue",
      templateId: "tpl_hr_onboarding"
    }
  ],
  "IT": [
    {
      id: "tpl_it_webhook",
      title: "Catch Inbound Webhook → Discord & Slack Notification",
      description: "Process raw JSON payloads from any custom webhook and dispatch clean formatted cards to team channels.",
      timeSaved: "3 hrs/week",
      apps: ["webhook", "discord", "slack"],
      category: "IT",
      tintColor: "emerald",
      templateId: "tpl_it_webhook"
    }
  ],
  "Legal": [
    {
      id: "tpl_legal_contract",
      title: "Contract Signed → Store in Google Drive & Alert Team",
      description: "Automatically back up signed PDFs in secure Google Drive folders and notify legal in Slack.",
      timeSaved: "4 hrs/week",
      apps: ["googledrive", "slack", "gmail"],
      category: "Legal",
      tintColor: "indigo",
      templateId: "tpl_legal_contract"
    }
  ],
  "Marketing": [
    {
      id: "tpl_mkt_form_whatsapp",
      title: "Automate Form Lead → WhatsApp Welcome + Sheets Log",
      description: "Trigger WhatsApp welcome message on new Automate Form submissions and sync lead data to Google Sheets.",
      timeSaved: "3.5 hrs/week",
      apps: ["googleforms", "whatsapp", "googlesheets"],
      category: "Marketing",
      tintColor: "sky",
      templateId: "tpl_1"
    },
    {
      id: "tpl_mkt_blog_social",
      title: "New Blog Post Published → Discord, Slack & Telegram",
      description: "Broadcast new articles across all community channels automatically the moment they go live.",
      timeSaved: "2 hrs/week",
      apps: ["notion", "slack", "discord", "telegram"],
      category: "Marketing",
      tintColor: "indigo",
      templateId: "tpl_mkt_blog_social"
    }
  ],
  "Operations": [
    {
      id: "tpl_ops_shopify_order",
      title: "Shopify Order → Slack Channel & Google Sheets",
      description: "Notify sales team on Slack and record sales data in Google Sheets every time a new Shopify order is placed.",
      timeSaved: "5 hrs/week",
      apps: ["shopify", "slack", "googlesheets"],
      category: "Operations",
      tintColor: "teal",
      templateId: "tpl_3"
    },
    {
      id: "tpl_ops_inventory_alert",
      title: "Inventory Low Stock Alert → Slack & Email Supplier",
      description: "Check Shopify product quantities and automatically email supplier when inventory falls below threshold.",
      timeSaved: "3 hrs/week",
      apps: ["shopify", "slack", "gmail"],
      category: "Operations",
      tintColor: "amber",
      templateId: "tpl_ops_inventory_alert"
    }
  ],
  "Product": [
    {
      id: "tpl_prod_feedback",
      title: "User Feedback Form → Notion Roadmap & Slack #product",
      description: "Categorize user feedback submissions and create structured backlog cards in your Notion roadmap.",
      timeSaved: "4 hrs/week",
      apps: ["typeform", "notion", "slack"],
      category: "Product",
      tintColor: "cyan",
      templateId: "tpl_prod_feedback"
    }
  ],
  "Agents": [
    {
      id: "tpl_agent_research",
      title: "Autonomous Research Agent → Notion Knowledge Base",
      description: "Schedule autonomous web research on market trends, synthesize key findings, and populate Notion docs.",
      timeSaved: "10 hrs/week",
      apps: ["openai", "notion", "slack"],
      category: "Agents",
      tintColor: "purple",
      templateId: "tpl_agent_research"
    }
  ]
}
