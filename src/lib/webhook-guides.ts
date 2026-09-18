export interface WebhookEventGuide {
  eventName: string
  targetEventNameInApp: string
  specificSteps?: string[]
  samplePayload: Record<string, any>
}

export interface WebhookAppGuide {
  appId: string
  appName: string
  dashboardTitle: string
  docUrl: string
  generalSteps: string[]
  events: Record<string, WebhookEventGuide>
}

export const WEBHOOK_APP_GUIDES: Record<string, WebhookAppGuide> = {
  "automate-chats": {
    appId: "automate-chats",
    appName: "Automate Chats",
    dashboardTitle: "Automate Chats Webhooks & API Settings",
    docUrl: "https://automateworkflows.com/docs/automate-chats",
    generalSteps: [
      "Log in to your Automate Chats (WhatsApp Cloud) dashboard.",
      "Navigate to 'Settings' (gear icon) > 'API & Webhooks' from the left sidebar.",
      "Click on the '+ Add Webhook' button.",
      "Paste the unique Webhook URL copied above into the 'Webhook URL / Endpoint' field.",
      "Select the trigger event matching your workflow (e.g. 'New WhatsApp Message Received' or 'Message Status Changed').",
      "Click 'Save Webhook' and ensure the webhook status is toggled to 'Active'.",
      "Click on 'Simulate Test Event' below or send a test WhatsApp message to capture variables."
    ],
    events: {
      new_wa_msg: {
        eventName: "New WhatsApp Message Received",
        targetEventNameInApp: "Inbound Message Received (messages/incoming)",
        samplePayload: {
          message_id: "wamid.HBgLMTU1NTAxOTIAMwUCMR...",
          sender_phone: "+91 9876543210",
          sender_name: "Alex Johnson",
          message_text: "Hi, I would like to schedule a product demo call.",
          message_type: "text",
          business_phone_number: "+1 555-0192",
          timestamp: "2026-09-08T10:15:30Z",
          status: "received"
        }
      },
      wa_msg_status: {
        eventName: "Message Status Changed",
        targetEventNameInApp: "Message Delivery Status Update (messages/status)",
        samplePayload: {
          message_id: "wamid.HBgLMTU1NTAxOTIAMwUCMR...",
          recipient_phone: "+91 9876543210",
          status: "read",
          delivered_at: "2026-09-08T10:15:45Z",
          read_at: "2026-09-08T10:16:02Z"
        }
      },
      new_opt_in: {
        eventName: "Customer Opted-In",
        targetEventNameInApp: "Contact Marketing Opt-In (contacts/optin)",
        samplePayload: {
          customer_phone: "+91 9876543210",
          customer_name: "Alex Johnson",
          opt_in_source: "QR_CODE_PROMO",
          opted_in_at: "2026-09-08T10:14:00Z",
          status: "opted_in"
        }
      },
      button_clicked: {
        eventName: "Template CTA Button Clicked",
        targetEventNameInApp: "Interactive Button Tap (messages/button_click)",
        samplePayload: {
          message_id: "wamid.HBgLMTU1NTAxOTIAMwUCMR...",
          button_text: "Book Strategy Call",
          button_payload: "BOOK_STRATEGY_CALL_CTA",
          sender_phone: "+91 9876543210",
          sender_name: "Alex Johnson",
          clicked_at: "2026-09-08T10:16:20Z"
        }
      }
    }
  },
  "automate-forms": {
    appId: "automate-forms",
    appName: "Automate Forms",
    dashboardTitle: "Automate Forms Integration Settings",
    docUrl: "https://automateworkflows.com/docs/automate-forms",
    generalSteps: [
      "Log in to your Automate Forms builder dashboard.",
      "Open your target form and navigate to the 'Integrations & Webhooks' tab.",
      "Click on '+ Add Webhook Endpoint'.",
      "Paste the unique Webhook URL copied above into the 'Webhook Endpoint URL' field.",
      "Select the event (e.g. 'Form Submission Completed').",
      "Click 'Save & Enable Webhook'.",
      "Click 'Simulate Test Event' below to verify question-answer mapping."
    ],
    events: {
      new_form_sub: {
        eventName: "New Form Submission",
        targetEventNameInApp: "Form submission completed (forms/submitted)",
        samplePayload: {
          submission_id: "sub_af_981240",
          form_id: "form_lead_capture",
          form_title: "VIP Lead Intake Form",
          submitted_at: "2026-09-08T11:30:00Z",
          respondent_name: "Alex Johnson",
          respondent_email: "alex.johnson@company.com",
          respondent_phone: "+91 9876543210",
          company_name: "Johnson Enterprises",
          budget: "$5,000 - $10,000"
        }
      },
      form_field_updated: {
        eventName: "Partial Field Updated",
        targetEventNameInApp: "Step progress recorded (forms/step_advance)",
        samplePayload: {
          session_id: "sess_af_4812",
          form_id: "form_lead_capture",
          completed_step: 2,
          total_steps: 4,
          email: "alex.johnson@company.com"
        }
      },
      form_abandoned: {
        eventName: "Form Abandonment (Lead Saved)",
        targetEventNameInApp: "Session dropped before submission (forms/abandoned)",
        samplePayload: {
          session_id: "sess_af_4812",
          form_id: "form_lead_capture",
          email: "alex.johnson@company.com",
          captured_fields_count: 3,
          abandoned_at: "2026-09-08T11:28:00Z"
        }
      }
    }
  },
  "google-forms": {
    appId: "google-forms",
    appName: "Google Forms",
    dashboardTitle: "Google Forms / Sheets Webhook Setup",
    docUrl: "https://automateworkflows.com/docs/google-forms",
    generalSteps: [
      "Open your target Google Form in Google Drive.",
      "Click the three vertical dots (More menu ⋮) > select 'Script editor' (or open the linked Google Sheet > Extensions > Apps Script).",
      "Paste the unique Webhook Capture URL copied above into the Webhook URL field.",
      "Attach the trigger to event 'On form submit' and save the script/add-on.",
      "Submit a live test response in your Google Form, or click 'Simulate Test Event' below to verify incoming variables."
    ],
    events: {
      new_gform_response: {
        eventName: "New Form Response Submitted",
        targetEventNameInApp: "On form submit (Google Forms Inbound Webhook)",
        samplePayload: {
          form_id: "1FAIpQLSc9B1xY-G8L1vBwExampleFormId",
          form_title: "Customer Intake & Project Inquiry",
          response_id: "resp_gform_892140",
          respondent_email: "sarah.connor@example.com",
          timestamp: "2026-09-10T12:30:00Z",
          full_name: "Sarah Connor",
          phone_number: "+1 555-0192",
          company_name: "Cyberdyne Systems",
          service_requested: "Enterprise Workflow Automation",
          budget_range: "$10,000 - $25,000",
          project_details: "Looking to automate CRM lead capture directly from Google Forms into Slack and HubSpot.",
          submission_date: "2026-09-10"
        }
      },
      response_updated: {
        eventName: "Existing Response Edited",
        targetEventNameInApp: "On form edit (Google Forms Response Edit Webhook)",
        samplePayload: {
          form_id: "1FAIpQLSc9B1xY-G8L1vBwExampleFormId",
          form_title: "Customer Intake & Project Inquiry",
          response_id: "resp_gform_892140",
          respondent_email: "sarah.connor@example.com",
          timestamp: "2026-09-10T13:15:00Z",
          full_name: "Sarah Connor",
          phone_number: "+1 555-0192",
          company_name: "Cyberdyne Systems LLC",
          service_requested: "Enterprise Workflow Automation + Custom API Integration",
          budget_range: "$25,000 - $50,000",
          edit_date: "2026-09-10"
        }
      }
    }
  },
  shopify: {
    appId: "shopify",
    appName: "Shopify",
    dashboardTitle: "Shopify Admin Settings",
    docUrl: "https://help.shopify.com/en/manual/apps-and-sales-channels/webhooks",
    generalSteps: [
      "Log in to your Shopify Admin Store dashboard.",
      "Click on 'Settings' (bottom-left gear icon) > 'Notifications'.",
      "Scroll down to the 'Webhooks' section and click the 'Create webhook' button.",
      "Select the Event/Topic specified below from the Event dropdown.",
      "Set Format to 'JSON'.",
      "Paste the unique Webhook URL copied above into the 'URL' field.",
      "Set Webhook API version to latest (e.g. 2024-04 or stable) and click 'Save'."
    ],
    events: {
      new_order: {
        eventName: "New Order Created",
        targetEventNameInApp: "Order creation (orders/create)",
        samplePayload: {
          id: 5491028491,
          email: "customer@example.com",
          total_price: "249.99",
          currency: "USD",
          financial_status: "paid",
          order_number: 1084,
          created_at: "2026-09-08T10:15:30Z",
          customer: {
            first_name: "Sarah",
            last_name: "Connor",
            email: "sarah.connor@example.com",
            phone: "+15552345678"
          },
          shipping_address: {
            city: "Austin",
            province: "Texas",
            country: "United States"
          },
          line_items_count: 2
        }
      },
      order_fulfilled: {
        eventName: "Order Fulfilled",
        targetEventNameInApp: "Order fulfillment (orders/fulfilled)",
        samplePayload: {
          id: 5491028491,
          order_number: 1084,
          tracking_number: "TRK9842109US",
          tracking_company: "FedEx",
          fulfillment_status: "fulfilled",
          customer_email: "sarah.connor@example.com",
          fulfilled_at: "2026-09-08T11:45:00Z"
        }
      },
      order_cancelled: {
        eventName: "Order Cancelled / Refunded",
        targetEventNameInApp: "Order cancellation (orders/cancelled)",
        samplePayload: {
          id: 5491028491,
          order_number: 1084,
          cancel_reason: "customer",
          cancelled_at: "2026-09-08T12:00:00Z",
          refund_amount: "249.99",
          customer_email: "sarah.connor@example.com"
        }
      },
      new_customer: {
        eventName: "New Customer Registered",
        targetEventNameInApp: "Customer creation (customers/create)",
        samplePayload: {
          id: 894120938,
          first_name: "Michael",
          last_name: "Scott",
          email: "m.scott@dundermifflin.com",
          phone: "+15559876543",
          orders_count: 0,
          verified_email: true,
          created_at: "2026-09-08T09:30:00Z"
        }
      },
      low_inventory: {
        eventName: "Low Stock Inventory Level Alert",
        targetEventNameInApp: "Inventory level update (inventory_levels/update)",
        samplePayload: {
          inventory_item_id: 4920194,
          location_id: 10294,
          available_quantity: 3,
          sku: "SHIRT-BLU-M",
          product_title: "Classic Oxford Cotton Shirt",
          threshold_reached: true
        }
      }
    }
  },
  razorpay: {
    appId: "razorpay",
    appName: "Razorpay",
    dashboardTitle: "Razorpay Dashboard",
    docUrl: "https://razorpay.com/docs/webhooks/",
    generalSteps: [
      "Log in to your Razorpay Dashboard (Live or Test mode).",
      "Navigate to 'Settings' in the left navigation sidebar > 'Webhooks'.",
      "Click the '+ Add New Webhook' button.",
      "Paste the unique Webhook URL copied above into the 'Webhook URL' field.",
      "Leave Secret blank or configure your custom signature token.",
      "Under 'Active Events', select the checkbox corresponding to the event below.",
      "Click 'Save' to activate the webhook endpoint."
    ],
    events: {
      payment_captured: {
        eventName: "Payment Captured",
        targetEventNameInApp: "payment.captured",
        samplePayload: {
          entity: "event",
          event: "payment.captured",
          account_id: "acc_RzpLive9812",
          payload: {
            payment: {
              id: "pay_OpL98124019",
              amount: 499900,
              currency: "INR",
              status: "captured",
              order_id: "order_Kj9812049",
              method: "upi",
              email: "rohit.sharma@example.com",
              contact: "+919876543210",
              vpa: "rohit@okhdfcbank",
              created_at: 1788850000
            }
          }
        }
      },
      payment_failed: {
        eventName: "Payment Failed",
        targetEventNameInApp: "payment.failed",
        samplePayload: {
          entity: "event",
          event: "payment.failed",
          payload: {
            payment: {
              id: "pay_Fail98124",
              amount: 149900,
              currency: "INR",
              status: "failed",
              error_code: "BAD_REQUEST_ERROR",
              error_description: "Payment was declined by issuing bank",
              email: "customer@example.com",
              contact: "+919123456789"
            }
          }
        }
      },
      refund_created: {
        eventName: "Refund Processed",
        targetEventNameInApp: "refund.created",
        samplePayload: {
          entity: "event",
          event: "refund.created",
          payload: {
            refund: {
              id: "rfnd_9812048",
              payment_id: "pay_OpL98124019",
              amount: 499900,
              currency: "INR",
              status: "processed",
              speed: "normal",
              created_at: 1788851000
            }
          }
        }
      },
      subscription_charged: {
        eventName: "Recurring Subscription Charged",
        targetEventNameInApp: "subscription.charged",
        samplePayload: {
          entity: "event",
          event: "subscription.charged",
          payload: {
            subscription: {
              id: "sub_Live89124",
              plan_id: "plan_MonthlyPro",
              status: "active",
              current_end: 1791442000,
              charge_at: 1788850000
            }
          }
        }
      }
    }
  },
  hubspot: {
    appId: "hubspot",
    appName: "HubSpot",
    dashboardTitle: "HubSpot Automation / Workflows",
    docUrl: "https://knowledge.hubspot.com/workflows/how-do-i-use-webhooks-with-hubspot-workflows",
    generalSteps: [
      "Log in to your HubSpot Portal.",
      "Navigate to 'Automation' > 'Workflows' > Click 'Create workflow' > 'From scratch'.",
      "Set the Enrollment Trigger (e.g., 'Contact enrollment trigger' matching the event below).",
      "Click the '+' button to add an action > select 'Send a webhook'.",
      "Set Method to 'POST'.",
      "Paste the Webhook URL copied above into the 'Webhook URL' input.",
      "Select 'Include all CRM properties' or customize specific fields > Click 'Save'.",
      "Review and Turn ON the workflow."
    ],
    events: {
      new_contact: {
        eventName: "New Contact Created",
        targetEventNameInApp: "Contact enrollment trigger (Contact created is known)",
        samplePayload: {
          portalId: 89412,
          objectType: "CONTACT",
          objectId: 512089,
          properties: {
            email: "priya.patel@growthtech.io",
            firstname: "Priya",
            lastname: "Patel",
            phone: "+15554321098",
            lifecyclestage: "lead",
            company: "GrowthTech Solutions",
            jobtitle: "VP of Product",
            hs_lead_status: "NEW",
            createdate: "2026-09-08T08:12:00Z"
          }
        }
      },
      contact_updated: {
        eventName: "Contact Property Updated",
        targetEventNameInApp: "Contact property change trigger",
        samplePayload: {
          portalId: 89412,
          objectId: 512089,
          propertyName: "lifecyclestage",
          propertyValue: "marketingqualifiedlead",
          email: "priya.patel@growthtech.io",
          updatedAt: "2026-09-08T09:40:00Z"
        }
      },
      deal_stage_changed: {
        eventName: "Deal Stage Changed",
        targetEventNameInApp: "Deal enrollment trigger (Deal stage is any of...)",
        samplePayload: {
          portalId: 89412,
          dealId: 9812401,
          dealname: "Enterprise Q3 License - Acme Corp",
          amount: 48000,
          pipeline: "default",
          dealstage: "decisionmakerboughtin",
          closedate: "2026-10-15T00:00:00Z",
          hubspot_owner_id: "agent_491"
        }
      },
      new_company: {
        eventName: "New Company Created",
        targetEventNameInApp: "Company enrollment trigger (Company created)",
        samplePayload: {
          portalId: 89412,
          companyId: 449102,
          name: "Acme Cloud Technologies",
          domain: "acmecloud.tech",
          city: "San Francisco",
          industry: "COMPUTER_SOFTWARE",
          numberofemployees: 250
        }
      },
      new_ticket: {
        eventName: "New Support Ticket Created",
        targetEventNameInApp: "Ticket enrollment trigger (Ticket created)",
        samplePayload: {
          portalId: 89412,
          ticketId: 891249,
          subject: "Cannot access SSO SAML login",
          content: "Getting 403 error on dashboard login page",
          hs_ticket_priority: "HIGH",
          hs_pipeline_stage: "1"
        }
      }
    }
  },
  pipedrive: {
    appId: "pipedrive",
    appName: "Pipedrive",
    dashboardTitle: "Pipedrive Tools & Integrations",
    docUrl: "https://pipedrive.readme.io/docs/guide-for-webhooks",
    generalSteps: [
      "Log in to your Pipedrive CRM account.",
      "Click on your profile avatar (top right) > 'Company settings' > 'Tools and apps'.",
      "Click on 'Webhooks' in the sidebar > click '+ Create a new webhook'.",
      "Set Event Action to match the trigger below (e.g., 'added', 'updated').",
      "Set Event Object to the target entity (e.g., 'deal', 'person').",
      "Paste the Webhook URL into the 'Endpoint URL' field.",
      "Leave HTTP auth credentials blank and click 'Save'."
    ],
    events: {
      new_pipedrive_deal: {
        eventName: "New Deal Created",
        targetEventNameInApp: "Event Action: added, Event Object: deal",
        samplePayload: {
          v: 1,
          event: "added.deal",
          current: {
            id: 8491,
            title: "Acme Corp Cloud Migration",
            value: 25000,
            currency: "USD",
            stage_id: 2,
            pipeline_id: 1,
            status: "open",
            person_name: "Johnathan Doe",
            person_email: "j.doe@acme.com",
            org_name: "Acme Global Industries",
            add_time: "2026-09-08 09:15:00"
          }
        }
      },
      deal_stage_moved: {
        eventName: "Deal Stage Changed",
        targetEventNameInApp: "Event Action: updated, Event Object: deal (stage_id)",
        samplePayload: {
          v: 1,
          event: "updated.deal",
          current: {
            id: 8491,
            title: "Acme Corp Cloud Migration",
            stage_id: 4,
            stage_name: "Proposal Sent",
            value: 25000
          },
          previous: {
            stage_id: 2,
            stage_name: "Contact Made"
          }
        }
      },
      deal_won: {
        eventName: "Deal Marked as Won",
        targetEventNameInApp: "Event Action: updated, Event Object: deal (status: won)",
        samplePayload: {
          v: 1,
          event: "updated.deal",
          current: {
            id: 8491,
            title: "Acme Corp Cloud Migration",
            status: "won",
            value: 25000,
            won_time: "2026-09-08 11:30:00"
          }
        }
      },
      deal_lost: {
        eventName: "Deal Marked as Lost",
        targetEventNameInApp: "Event Action: updated, Event Object: deal (status: lost)",
        samplePayload: {
          v: 1,
          event: "updated.deal",
          current: {
            id: 8491,
            title: "Acme Corp Cloud Migration",
            status: "lost",
            lost_reason: "Budget freeze for Q3"
          }
        }
      },
      new_person: {
        eventName: "New Person Added",
        targetEventNameInApp: "Event Action: added, Event Object: person",
        samplePayload: {
          v: 1,
          event: "added.person",
          current: {
            id: 12049,
            name: "Ananya Sharma",
            email: [{ value: "ananya@finscale.io", primary: true }],
            phone: [{ value: "+919811223344", primary: true }],
            org_id: { name: "FinScale Technologies" }
          }
        }
      }
    }
  },
  freshdesk: {
    appId: "freshdesk",
    appName: "Freshdesk",
    dashboardTitle: "Freshdesk Automations",
    docUrl: "https://support.freshdesk.com/en/support/solutions/articles/215555-triggering-webhooks-using-ticket-creation-automation",
    generalSteps: [
      "Log in to your Freshdesk portal as an Admin.",
      "Go to 'Admin' (gear icon) > 'Automations' under Workflows.",
      "Select 'Ticket Creation' (or 'Ticket Updates') > Click 'New Rule'.",
      "Set Conditions (e.g. Type is Question or Priority is High).",
      "Under 'Actions', select 'Trigger Webhook'.",
      "Set Request Type to 'POST' and Encoding to 'JSON'.",
      "Paste the unique Webhook URL into the 'Callback URL' field.",
      "Select 'Simple' or check the ticket properties you wish to send > Click 'Save'."
    ],
    events: {
      new_ticket: {
        eventName: "New Ticket Created",
        targetEventNameInApp: "Automation Action: Trigger Webhook on Ticket Creation",
        samplePayload: {
          ticket_id: 10492,
          ticket_subject: "Payment deducted twice for annual invoice",
          ticket_description: "Customer charged duplicate amounts on credit card",
          ticket_status: "Open",
          ticket_priority: "Urgent",
          ticket_source: "Portal",
          requester_name: "Amitabh Sen",
          requester_email: "amitabh.sen@cloudcorp.org",
          created_at: "2026-09-08T11:00:00Z"
        }
      },
      ticket_status_changed: {
        eventName: "Ticket Status Changed",
        targetEventNameInApp: "Automation Action: Trigger Webhook on Status Update",
        samplePayload: {
          ticket_id: 10492,
          ticket_status: "Resolved",
          previous_status: "Pending",
          resolved_by: "Support Agent Ravi",
          resolution_notes: "Refund processed via Razorpay gateway ID rfnd_98124"
        }
      },
      new_ticket_reply: {
        eventName: "Customer Replied to Ticket",
        targetEventNameInApp: "Automation Action: Trigger Webhook on Ticket Reply",
        samplePayload: {
          ticket_id: 10492,
          last_reply_body: "Thank you, I can confirm the refund has reflected in my account.",
          responder_email: "amitabh.sen@cloudcorp.org",
          reply_timestamp: "2026-09-08T11:45:00Z"
        }
      }
    }
  },
  "webhook-catch": {
    appId: "webhook-catch",
    appName: "Webhook — Catch Hook",
    dashboardTitle: "External App Webhook Settings",
    docUrl: "https://en.wikipedia.org/wiki/Webhook",
    generalSteps: [
      "Copy the unique Webhook URL generated above.",
      "Log in to the external service (Stripe, Jotform, Custom Server, etc.) you want to connect.",
      "Find their 'Webhooks' or 'API Integrations' settings page.",
      "Paste the Webhook URL into their endpoint URL input.",
      "Choose event types to receive and click Save.",
      "Send a test event from the external service or click 'Simulate Test Event' below."
    ],
    events: {
      catch_raw_webhook: {
        eventName: "Catch Webhook (Instant)",
        targetEventNameInApp: "Any Outgoing HTTP POST Webhook",
        samplePayload: {
          event_id: "evt_generic_981240",
          timestamp: "2026-09-08T12:00:00Z",
          customer_name: "Alex Morgan",
          customer_email: "alex.morgan@example.com",
          transaction_amount: 149.50,
          currency: "USD",
          status: "SUCCESS"
        }
      }
    }
  }
}

export const UI_WEBHOOK_APP_IDS = Object.keys(WEBHOOK_APP_GUIDES)

export function isUIWebhookApp(appId: string | undefined): boolean {
  if (!appId) return false
  return UI_WEBHOOK_APP_IDS.includes(appId) || appId === "webhook" || appId === "webhook-catch"
}

export function getWebhookAppGuide(appId: string | undefined, eventId?: string): WebhookAppGuide | null {
  if (!appId) return null
  if (appId === "webhook") appId = "webhook-catch"
  const guide = WEBHOOK_APP_GUIDES[appId]
  return guide || null
}

export function getWebhookEventGuide(appId: string | undefined, eventId?: string): WebhookEventGuide | null {
  const guide = getWebhookAppGuide(appId, eventId)
  if (!guide) return null
  if (eventId && guide.events[eventId]) {
    return guide.events[eventId]
  }
  // Fallback to first event
  const firstKey = Object.keys(guide.events)[0]
  return firstKey ? guide.events[firstKey] : null
}
