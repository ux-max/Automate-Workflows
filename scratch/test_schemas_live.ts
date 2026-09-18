import { getAppActionSchema } from "../src/lib/action-schemas";

const testCases: { appId: string; eventId?: string; expectedActionId: string; expectedField: string }[] = [
  // Iterator
  { appId: "iterator", eventId: "loop_array_items", expectedActionId: "loop_array_items", expectedField: "array_data" },
  { appId: "iterator", eventId: "aggregate_items", expectedActionId: "aggregate_items", expectedField: "aggregation_format" },

  // Shopify
  { appId: "shopify", eventId: "add_order_note", expectedActionId: "add_order_note", expectedField: "note_text" },
  { appId: "shopify", eventId: "update_order_tags", expectedActionId: "update_order_tags", expectedField: "tags_to_add" },
  { appId: "shopify", eventId: "create_discount_code", expectedActionId: "create_discount_code", expectedField: "discount_code" },
  { appId: "shopify", eventId: "update_inventory", expectedActionId: "update_inventory", expectedField: "adjustment_quantity" },
  { appId: "shopify", eventId: "create_product", expectedActionId: "create_product", expectedField: "product_title" },

  // Gmail
  { appId: "gmail", eventId: "send_email", expectedActionId: "send_email", expectedField: "to" },
  { appId: "gmail", eventId: "create_draft", expectedActionId: "create_draft", expectedField: "subject" },
  { appId: "gmail", eventId: "add_label", expectedActionId: "add_label", expectedField: "label_name" },
  { appId: "gmail", eventId: "reply_email", expectedActionId: "reply_email", expectedField: "reply_body" },
  { appId: "gmail", eventId: "mark_as_read", expectedActionId: "mark_as_read", expectedField: "status_flag" },

  // Slack
  { appId: "slack", eventId: "send_channel_msg", expectedActionId: "send_channel_msg", expectedField: "channel" },
  { appId: "slack", eventId: "send_dm", expectedActionId: "send_dm", expectedField: "user_id" },
  { appId: "slack", eventId: "post_block_msg", expectedActionId: "post_block_msg", expectedField: "blocks_json" },
  { appId: "slack", eventId: "upload_file", expectedActionId: "upload_file", expectedField: "file_url" },
  { appId: "slack", eventId: "set_topic", expectedActionId: "set_topic", expectedField: "topic" },
  { appId: "slack", eventId: "create_channel", expectedActionId: "create_channel", expectedField: "is_private" },

  // Google Sheets
  { appId: "google-sheets", eventId: "add_row", expectedActionId: "add_row", expectedField: "col_name" },
  { appId: "google-sheets", eventId: "update_row", expectedActionId: "update_row", expectedField: "row_index" },
  { appId: "google-sheets", eventId: "lookup_row", expectedActionId: "lookup_row", expectedField: "lookup_column" },
  { appId: "google-sheets", eventId: "delete_row", expectedActionId: "delete_row", expectedField: "row_number" },
  { appId: "google-sheets", eventId: "clear_row", expectedActionId: "clear_row", expectedField: "row_number" },
  { appId: "google-sheets", eventId: "create_worksheet", expectedActionId: "create_worksheet", expectedField: "tab_title" },
  { appId: "google-sheets", eventId: "batch_add_rows", expectedActionId: "batch_add_rows", expectedField: "rows_json_array" },

  // Google Calendar
  { appId: "google-calendar", eventId: "create_event", expectedActionId: "create_event", expectedField: "event_title" },
  { appId: "google-calendar", eventId: "quick_add_event", expectedActionId: "quick_add_event", expectedField: "quick_add_text" },
  { appId: "google-calendar", eventId: "update_event", expectedActionId: "update_event", expectedField: "event_id" },
  { appId: "google-calendar", eventId: "add_attendee", expectedActionId: "add_attendee", expectedField: "attendee_email" },
  { appId: "google-calendar", eventId: "delete_event", expectedActionId: "delete_event", expectedField: "event_id" },

  // Razorpay
  { appId: "razorpay", eventId: "create_payment_link", expectedActionId: "create_payment_link", expectedField: "amount" },
  { appId: "razorpay", eventId: "issue_refund", expectedActionId: "issue_refund", expectedField: "payment_id" },
  { appId: "razorpay", eventId: "cancel_subscription", expectedActionId: "cancel_subscription", expectedField: "subscription_id" },
  { appId: "razorpay", eventId: "create_order", expectedActionId: "create_order", expectedField: "amount" },

  // Telegram
  { appId: "telegram", eventId: "send_telegram_msg", expectedActionId: "send_telegram_msg", expectedField: "message_text" },
  { appId: "telegram", eventId: "send_photo", expectedActionId: "send_photo", expectedField: "photo_url" },
  { appId: "telegram", eventId: "pin_message", expectedActionId: "pin_message", expectedField: "message_id" },
  { appId: "telegram", eventId: "kick_chat_member", expectedActionId: "kick_chat_member", expectedField: "user_id" },

  // Freshdesk
  { appId: "freshdesk", eventId: "create_ticket", expectedActionId: "create_ticket", expectedField: "subject" },
  { appId: "freshdesk", eventId: "add_ticket_note", expectedActionId: "add_ticket_note", expectedField: "note_body" },
  { appId: "freshdesk", eventId: "update_ticket_status", expectedActionId: "update_ticket_status", expectedField: "status" },
  { appId: "freshdesk", eventId: "assign_agent", expectedActionId: "assign_agent", expectedField: "agent_email" },
  { appId: "freshdesk", eventId: "update_ticket_priority", expectedActionId: "update_ticket_priority", expectedField: "priority" },

  // HubSpot
  { appId: "hubspot", eventId: "create_update_contact", expectedActionId: "create_update_contact", expectedField: "contact_email" },
  { appId: "hubspot", eventId: "create_deal", expectedActionId: "create_deal", expectedField: "deal_name" },
  { appId: "hubspot", eventId: "update_deal_stage", expectedActionId: "update_deal_stage", expectedField: "deal_stage" },
  { appId: "hubspot", eventId: "create_company", expectedActionId: "create_company", expectedField: "company_name" },
  { appId: "hubspot", eventId: "add_timeline_event", expectedActionId: "add_timeline_event", expectedField: "note_body" },
  { appId: "hubspot", eventId: "update_contact_lifecycle", expectedActionId: "update_contact_lifecycle", expectedField: "lifecycle_stage" },

  // Pipedrive
  { appId: "pipedrive", eventId: "create_person", expectedActionId: "create_person", expectedField: "name" },
  { appId: "pipedrive", eventId: "create_pipedrive_deal", expectedActionId: "create_pipedrive_deal", expectedField: "deal_title" },
  { appId: "pipedrive", eventId: "update_deal", expectedActionId: "update_deal", expectedField: "deal_id" },
  { appId: "pipedrive", eventId: "add_note", expectedActionId: "add_note", expectedField: "content" },
  { appId: "pipedrive", eventId: "create_activity", expectedActionId: "create_activity", expectedField: "subject" },

  // Calendly
  { appId: "calendly", eventId: "get_user_availability", expectedActionId: "get_user_availability", expectedField: "event_type" },
  { appId: "calendly", eventId: "cancel_event_calendly", expectedActionId: "cancel_event_calendly", expectedField: "event_uuid" },
  { appId: "calendly", eventId: "create_single_booking_link", expectedActionId: "create_single_booking_link", expectedField: "event_type_slug" },

  // Typeform
  { appId: "typeform", eventId: "create_typeform_entry", expectedActionId: "create_typeform_entry", expectedField: "form_id" },
  { appId: "typeform", eventId: "delete_typeform_response", expectedActionId: "delete_typeform_response", expectedField: "response_token" },

  // Scheduler
  { appId: "scheduler", eventId: "cron_schedule", expectedActionId: "cron_schedule", expectedField: "cron_expression" },
  { appId: "scheduler", eventId: "delay_next_cron", expectedActionId: "delay_next_cron", expectedField: "delay_duration_minutes" },
  { appId: "scheduler", eventId: "pause_schedule_timer", expectedActionId: "pause_schedule_timer", expectedField: "action_state" },

  // Filter
  { appId: "filter", eventId: "apply_filter_rules", expectedActionId: "apply_filter_rules", expectedField: "field" },
  { appId: "filter", eventId: "filter_regex", expectedActionId: "filter_regex", expectedField: "regex_pattern" },
  { appId: "filter", eventId: "filter_date_range", expectedActionId: "filter_date_range", expectedField: "timestamp_to_check" },

  // Router
  { appId: "router", eventId: "route_branches", expectedActionId: "route_branches", expectedField: "branch_name" },
  { appId: "router", eventId: "fallback_route", expectedActionId: "fallback_route", expectedField: "fallback_note" },

  // Custom / Unregistered action
  { appId: "custom-crm", eventId: "delete_account", expectedActionId: "delete_account", expectedField: "target_id" },
  { appId: "custom-crm", eventId: "search_customer", expectedActionId: "search_customer", expectedField: "lookup_query" },
  { appId: "custom-crm", eventId: "send_push_notification", expectedActionId: "send_push_notification", expectedField: "destination_recipient" },
  { appId: "custom-crm", eventId: "update_preferences", expectedActionId: "update_preferences", expectedField: "record_id" }
];

let failed = 0;
for (const tc of testCases) {
  const schema = getAppActionSchema(tc.appId, tc.eventId);
  const hasExpectedField = schema.fields.some(f => f.id === tc.expectedField);
  const actionMatch = schema.actionId === tc.expectedActionId;
  if (!actionMatch || !hasExpectedField) {
    console.error(`FAILED: ${tc.appId} -> ${tc.eventId}: expected actionId '${tc.expectedActionId}', got '${schema.actionId}'. Expected field '${tc.expectedField}', found: [${schema.fields.map(f => f.id).join(', ')}]`);
    failed++;
  } else {
    console.log(`PASSED: ${tc.appId} -> ${tc.eventId} correctly resolves to '${schema.actionName}' with fields: [${schema.fields.map(f => f.id).join(', ')}]`);
  }
}

console.log(`\nResults: ${testCases.length - failed}/${testCases.length} PASSED.`);
if (failed > 0) process.exit(1);
