import { ActionField } from "./action-schemas"

export type CustomActionStatus = "draft" | "live" | "published"

export interface CustomActionDiffStep {
  id: string
  lineNumber: number
  description: string
  type: "add" | "modify" | "delete"
}

export interface CustomActionMessage {
  id: string
  sender: "user" | "assistant"
  timestamp: string
  content: string
  thinkingSeconds?: number
  diffSummary?: {
    title: string
    steps: CustomActionDiffStep[]
    totalLines: number
  }
  isDeployed?: boolean
}

export interface CustomActionTestRun {
  id: string
  timestamp: string
  status: number
  statusText: string
  latencyMs: number
  requestPayload: Record<string, any>
  responsePayload: Record<string, any>
}

export interface CustomActionItem {
  id: string
  appId: string
  appName: string
  actionId: string
  actionName: string
  description: string
  status: CustomActionStatus
  authType: "oauth2" | "api_key" | "bearer_token" | "none"
  authLabel: string
  authPlaceholder: string
  authHelpUrl?: string
  fields: ActionField[]
  generatedCode: string
  messages: CustomActionMessage[]
  testHistory: CustomActionTestRun[]
  createdAt: string
  updatedAt: string
}
