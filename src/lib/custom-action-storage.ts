import { CustomActionItem } from "./custom-action-types"

export const INITIAL_CUSTOM_ACTIONS: CustomActionItem[] = [
  {
    id: "ca_custom_api_webhook",
    appId: "custom-api",
    appName: "Custom API",
    actionId: "execute_webhook",
    actionName: "Execute Webhook Action",
    description: "Custom integration action generated via AI prompts",
    status: "draft",
    authType: "bearer_token",
    authLabel: "Custom API Access Token / API Key",
    authPlaceholder: "••••••••••••••••••••••••••••",
    authHelpUrl: "https://api.service.com/v1/docs",
    fields: [
      {
        id: "endpoint_url",
        label: "endpoint_url",
        type: "text",
        required: true,
        placeholder: "https://api.service.com/v1/resource",
        helperText: "Target webhook URL accepting signed POST requests",
        supportsMapping: true
      },
      {
        id: "payload_json",
        label: "payload_json",
        type: "textarea",
        required: false,
        placeholder: '{"key": "value"}',
        helperText: "Raw JSON payload or template variables",
        supportsMapping: true
      }
    ],
    generatedCode: `// ── Helpers ──
function jsonOk(data) { return { statusCode: 200, statusMessage: 'OK', success: true, ...data }; }
function jsonErr(message, code, debug) { return { statusCode: code || 400, statusMessage: message, success: false, error: message, ...(debug ? { _debug: debug } : {}) }; }

// ── Action: Send Slack Message ──
async function handleSendMessage(body, headers) {
  const token = headers['x-slack-bot-token'] || headers['X-Slack-Bot-Token'] || process.env.SLACK_BOT_TOKEN;
  if (!token) return jsonErr('Missing required credential: X-Slack-Bot-Token header or SLACK_BOT_TOKEN env', 401);

  const channel = body.channel;
  const text = body.text;
  if (!channel) return jsonErr('Missing required field: channel', 400);
  if (!text) return jsonErr('Missing required field: text', 400);

  const payload = { channel, text };
  if (body.username) payload.username = body.username;
  if (body.icon_emoji) payload.icon_emoji = body.icon_emoji;
  if (body.icon_url) payload.icon_url = body.icon_url;
  if (body.blocks) payload.blocks = body.blocks;

  const res = await
  fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return res.json();
}`,
    messages: [
      {
        id: "msg_custom_1",
        sender: "user",
        timestamp: "02:58 PM",
        content: "Create a custom API action to POST contact details with HMAC signature to an external CRM webhook"
      },
      {
        id: "msg_custom_2",
        sender: "assistant",
        timestamp: "02:58 PM",
        thinkingSeconds: 12.8,
        content: "I have prepared the handler for Execute Webhook Action with parameter validation and secure credentials handling.",
        diffSummary: {
          title: "Here's what I'll change",
          totalLines: 70,
          steps: [
            {
              id: "diff_c1",
              lineNumber: 48,
              description: "Implemented handler for Execute Webhook Action",
              type: "add"
            },
            {
              id: "diff_c2",
              lineNumber: 64,
              description: "Added parameter validation and error boundary checks",
              type: "add"
            }
          ]
        },
        isDeployed: true
      }
    ],
    testHistory: [
      {
        id: "test_run_c1",
        timestamp: "02:58 PM",
        status: 200,
        statusText: "OK",
        latencyMs: 157,
        requestPayload: {
          endpoint_url: "https://api.service.com/v1/resource",
          payload_json: '{"key": "value"}'
        },
        responsePayload: {
          success: true,
          app: "Custom API",
          action: "execute webhook action",
          spreadsheetId: "1BuMvX0XRA5nFMdKv8cIR7grmUUqntbx74QgVF2upmx"
        }
      }
    ],
    createdAt: "02:58 PM",
    updatedAt: "02:58 PM"
  },
  {
    id: "ca_google_sheets_delete",
    appId: "google-sheets",
    appName: "Google Sheets",
    actionId: "delete_sheet",
    actionName: "Delete Sheet",
    description: "Delete sheets and manage columns in Google Sheets spreadsheets.",
    status: "draft",
    authType: "oauth2",
    authLabel: "Google OAuth Access Token",
    authPlaceholder: "ya29.a0AfH6SMBx12aBcDeFgHiJkLmNoPqRsTuVwXyZ...",
    authHelpUrl: "https://developers.google.com/identity/protocols/oauth2",
    fields: [
      {
        id: "spreadsheet_id",
        label: "Spreadsheet ID",
        type: "text",
        required: true,
        placeholder: "1BuMvX0XRA5nFMdKv8cIR7grmUUqntbx74QgVF2upmx",
        helperText: "Enter the Google Sheets spreadsheet ID.",
        supportsMapping: true
      },
      {
        id: "sheet_id",
        label: "Sheet ID",
        type: "text",
        required: true,
        placeholder: "0 or numeric sheet tab ID",
        helperText: "Enter the specific sheet ID to delete from the spreadsheet.",
        supportsMapping: true
      }
    ],
    generatedCode: `// ── Helpers ──
function jsonOk(data) { return { statusCode: 200, statusMessage: 'OK', success: true, ...data }; }
function jsonErr(message, code, debug) { return { statusCode: code || 400, statusMessage: message, success: false, error: message, ...(debug ? { _debug: debug } : {}) }; }

// ── Action: Google Sheets Delete Sheet ──
async function handleDeleteSheet(body, headers) {
  const token = headers['x-google-oauth-token'] || headers['Authorization'] || process.env.GOOGLE_SHEETS_TOKEN;
  if (!token) return jsonErr('Missing required credential: OAuth access token', 401);

  const spreadsheetId = body.spreadsheet_id;
  const sheetId = body.sheet_id;
  if (!spreadsheetId) return jsonErr('Missing required field: spreadsheet_id', 400);
  if (sheetId === undefined) return jsonErr('Missing required field: sheet_id', 400);

  const payload = {
    requests: [
      {
        deleteSheet: {
          sheetId: parseInt(sheetId, 10) || 0
        }
      }
    ]
  };

  const res = await
  fetch('https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(spreadsheetId) + ':batchUpdate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return res.json();
}`,
    messages: [
      {
        id: "msg_1",
        sender: "user",
        timestamp: "Sep 28, 2026, 12:10 PM",
        content: "Add handleAddColumns function for adding columns to a sheet and add case 2 in switch statement"
      },
      {
        id: "msg_2",
        sender: "assistant",
        timestamp: "Sep 28, 2026, 12:11 PM",
        thinkingSeconds: 14.9,
        content: "I have analyzed the Google Sheets REST v4 documentation and prepared the batchUpdate schema modifications.",
        diffSummary: {
          title: "Here's what I'll change",
          totalLines: 78,
          steps: [
            {
              id: "diff_1",
              lineNumber: 57,
              description: "Add handleAddColumns function for adding columns to a sheet",
              type: "add"
            },
            {
              id: "diff_2",
              lineNumber: 69,
              description: "Add case 2 for handleAddColumns in switch statement",
              type: "add"
            }
          ]
        },
        isDeployed: true
      }
    ],
    testHistory: [
      {
        id: "test_run_1",
        timestamp: "Sep 28, 2026, 12:15 PM",
        status: 200,
        statusText: "OK",
        latencyMs: 184,
        requestPayload: {
          spreadsheet_id: "1BuMvX0XRA5nFMdKv8cIR7grmUUqntbx74QgVF2upmx",
          sheet_id: "1429801"
        },
        responsePayload: {
          success: true,
          spreadsheetId: "1BuMvX0XRA5nFMdKv8cIR7grmUUqntbx74QgVF2upmx",
          deletedSheetId: "1429801",
          replies: [{}],
          executedAt: "2026-09-28T12:15:32.482Z"
        }
      }
    ],
    createdAt: "Sep 28, 2026, 12:11 PM",
    updatedAt: "Sep 28, 2026, 12:16 PM"
  },
  {
    id: "ca_slack_send_message",
    appId: "slack",
    appName: "Slack",
    actionId: "send_channel_message",
    actionName: "Send Channel Message",
    description: "Sends a rich formatted message to a Slack channel with optional block kit elements.",
    status: "draft",
    authType: "bearer_token",
    authLabel: "Slack Bot User OAuth Token",
    authPlaceholder: "xoxb-1234567890-1234567890123-abcdef...",
    authHelpUrl: "https://api.slack.com/methods/chat.postMessage",
    fields: [
      {
        id: "channel",
        label: "channel",
        type: "text",
        required: true,
        placeholder: "C0123456789",
        helperText: "Slack channel ID or name",
        supportsMapping: true
      },
      {
        id: "text",
        label: "text",
        type: "textarea",
        required: true,
        placeholder: "Hello from Automate Workflows!",
        helperText: "Primary fallback text or notification message",
        supportsMapping: true
      }
    ],
    generatedCode: `// ── Helpers ──
function jsonOk(data) { return { statusCode: 200, statusMessage: 'OK', success: true, ...data }; }
function jsonErr(message, code, debug) { return { statusCode: code || 400, statusMessage: message, success: false, error: message, ...(debug ? { _debug: debug } : {}) }; }

// ── Action: Send Slack Message ──
async function handleSendMessage(body, headers) {
  const token = headers['x-slack-bot-token'] || headers['X-Slack-Bot-Token'] || process.env.SLACK_BOT_TOKEN;
  if (!token) return jsonErr('Missing required credential: X-Slack-Bot-Token header or SLACK_BOT_TOKEN env', 401);

  const channel = body.channel;
  const text = body.text;
  if (!channel) return jsonErr('Missing required field: channel', 400);
  if (!text) return jsonErr('Missing required field: text', 400);

  const payload = { channel, text };
  if (body.username) payload.username = body.username;
  if (body.icon_emoji) payload.icon_emoji = body.icon_emoji;
  if (body.icon_url) payload.icon_url = body.icon_url;
  if (body.blocks) payload.blocks = body.blocks;

  const res = await
  fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return res.json();
}`,
    messages: [
      {
        id: "msg_slack_1",
        sender: "user",
        timestamp: "Sep 27, 2026, 4:20 PM",
        content: "Create a custom Slack action to send chat messages with custom usernames and blocks"
      },
      {
        id: "msg_slack_2",
        sender: "assistant",
        timestamp: "Sep 27, 2026, 4:21 PM",
        thinkingSeconds: 8.4,
        content: "Implemented handleSendMessage using Slack Web API chat.postMessage with token authentication.",
        diffSummary: {
          title: "Created Slack Action Handler",
          totalLines: 31,
          steps: [
            {
              id: "diff_s1",
              lineNumber: 6,
              description: "Implemented handleSendMessage with chat.postMessage API",
              type: "add"
            }
          ]
        },
        isDeployed: true
      }
    ],
    testHistory: [],
    createdAt: "Sep 27, 2026, 4:21 PM",
    updatedAt: "Sep 27, 2026, 4:30 PM"
  }
]

const STORAGE_KEY = "automate_custom_actions_v4"

export function getCustomActions(): CustomActionItem[] {
  if (typeof window === "undefined") {
    return INITIAL_CUSTOM_ACTIONS
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOM_ACTIONS))
    return INITIAL_CUSTOM_ACTIONS
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CUSTOM_ACTIONS
  } catch {
    return INITIAL_CUSTOM_ACTIONS
  }
}

export function saveCustomAction(action: CustomActionItem): CustomActionItem[] {
  const current = getCustomActions()
  const existingIdx = current.findIndex((a) => a.id === action.id)
  let updated: CustomActionItem[]

  if (existingIdx !== -1) {
    updated = current.map((a) => (a.id === action.id ? { ...action, updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : a))
  } else {
    updated = [action, ...current]
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }
  return updated
}

export function deleteCustomAction(id: string): CustomActionItem[] {
  const current = getCustomActions()
  const updated = current.filter((a) => a.id !== id)
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }
  return updated
}
