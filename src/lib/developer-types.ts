export type DeveloperAppStatus =
  | "draft"
  | "private"
  | "in_review"
  | "changes_requested"
  | "public_beta"
  | "published"

export type AuthType = "none" | "parameters" | "api_key" | "bearer_token" | "basic_auth" | "oauth2"

export interface AuthParameterField {
  id: string
  key: string
  label?: string
  type?: "string" | "number" | "boolean" | "dropdown"
  required?: boolean
  helpText?: string
  placeholder?: string
}

export interface AuthHeaderField {
  id: string
  key: string
  value?: string
  description?: string
}

export interface ParametersAuthConfig {
  showParameters?: boolean
  parameters: AuthParameterField[]
  showHeaders?: boolean
  headers: AuthHeaderField[]
}

export interface SecretVariable {
  id: string
  key: string
  value: string
  description?: string
}

export interface UserCredentialField {
  id: string
  key: string
  label: string
  type: "text" | "password"
  required: boolean
  helpText?: string
  placeholder?: string
}

export interface DeveloperAuth {
  type: AuthType
  enableMultiAuth?: boolean
  parametersConfig?: ParametersAuthConfig
  apiKeyConfig?: {
    headerOrQuery: "header" | "query"
    paramName: string
    valuePrefix?: string // e.g. "Bearer "
  }
  oauth2Config?: {
    authorizeUrl: string
    accessTokenUrl: string
    refreshUrl?: string
    clientId: string
    clientSecret: string
    scopes: string
    pkceEnabled: boolean
  }
  basicAuthConfig?: {
    usernameLabel: string
    passwordLabel: string
    helpText?: string
  }
  userFields: UserCredentialField[]
  connectionTest: {
    method: "GET" | "POST"
    url: string
    expectedStatus?: number
  }
  connectionLabelTemplate: string // e.g. "{{email}} ({{account_name}})"
}

export type TriggerType = "webhook" | "polling"

export interface DeveloperTrigger {
  id: string
  key: string
  name: string
  description: string
  status?: "private" | "public"
  tutorialUrl?: string
  type: TriggerType
  webhookConfig?: {
    setupType: "instant_catch" | "rest_hook"
    tutorialUrl?: string
    instructions?: string
    helpText?: string
    subscribeMethod?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH"
    subscribeUrl?: string
    unsubscribeMethod?: "DELETE" | "POST"
    unsubscribeUrl?: string
    sampleHeaders?: { key: string; value: string }[]
  }
  pollingConfig?: {
    endpointUrl: string
    deduplicationField: string // e.g. "id" or "created_at"
    frequencyMinutes: number // 1, 5, 15
  }
  sampleFields: { key: string; label: string; type: string; sampleValue: string }[]
  inbuiltActionSteps?: {
    id: string
    inbuiltActionId: string
    purpose?: string
    saved?: boolean
  }[]
  isMultiStep?: boolean
  multiStepConfig?: {
    enabled?: boolean
    steps: {
      id: string
      name?: string
      type?: "api_request" | "inbuilt_action"
      inbuiltActionId?: string
      targetId?: string
      endpointUrl?: string
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
      outputKey?: string
      mappedParams?: { key: string; value: string }[]
      considerStatusCode?: boolean
      saved?: boolean
    }[]
  }
}

export type InbuiltActionType =
  | "dropdown_and_custom_fields"
  | "multi_step"
  | "app_auth_validator"
  | "webhook_validator"
  | "delete_webhook"
  | "delete_connection"

export type MultiStepExecutionTiming =
  | "each_execution"
  | "post_webhook_setup"
  | "post_webhook_trigger"

export interface DeveloperInbuiltAction {
  id: string
  key: string
  name: string
  description?: string
  type: InbuiltActionType
  multiStepExecutesAt?: MultiStepExecutionTiming
  receiveHeaders?: boolean
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  endpointUrl: string
  parentDependencyKey?: string
  dropdownMode?: "dynamic" | "static" | "custom_fields"
  staticOptions?: { label: string; value: string }[]
  responseArrayPath?: string
  labelKey?: string
  valueKey?: string
  headers?: { id?: string; key: string; value: string }[]
  queryParams?: { key: string; value: string }[]
  bodyType?: "none" | "json" | "form_data" | "raw"
  bodyParameters?: { key: string; value: string }[]
  multiSteps?: {
    id: string
    name: string
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    endpointUrl: string
    outputKey: string
  }[]
  webhookValidationMode?: "echo_challenge" | "hmac_sha256" | "two_step_verify"
  challengeParamName?: string
  verifyTokenParamName?: string
  linkedTriggerId?: string
  webhookIdParam?: string
  nestedSteps?: {
    id: string
    inbuiltActionId: string
    saved?: boolean
  }[]
  usedInActionIds?: string[]
  authType?: "no_auth" | "inherit_app_auth" | "basic_auth" | "bearer_token" | "api_key"
  enableHeaders?: boolean
  enableParameters?: boolean
  parameters?: {
    id: string
    type: "query" | "body" | "path" | "header"
    key: string
    value: string
    label?: string
    dataType?: "string" | "number" | "boolean" | "dropdown" | "array" | "object" | "file" | string
    required?: boolean
    description?: string
    defaultValue?: string
    paramSourceType?: "dynamic" | "static"
    dynamicKeyField?: string
    responseParamKey?: string
    testValue?: string
    fieldType?: string
  }[]
  enableRawJson?: boolean
  rawJsonBody?: string
  enableSelectTransform?: boolean
  selectTransformConfig?: {
    mode?: "pick" | "rename" | "template"
    expression?: string
  }
  enableObjectToArray?: boolean
  objectToArrayConfig?: {
    responseKey?: string
    labelKey?: string
    valueKey?: string
    parentDependencyKey?: string
  }
}

export interface ActionInputField {
  id: string
  key: string
  label: string
  type: "string" | "number" | "boolean" | "dropdown" | "date" | "file"
  required: boolean
  helpText?: string
  placeholder?: string
  defaultValue?: string
  dropdownConfig?: {
    mode: "static" | "dynamic"
    staticOptions?: { label: string; value: string }[]
    dynamicConfig?: {
      endpointUrl?: string
      valueKey?: string
      labelKey?: string
      inbuiltActionId?: string
      parentDependencyKey?: string
    }
  }
}

export interface ActionParameterMapping {
  id: string
  paramName: string
  mappedFieldOrToken: string // e.g. "{{input.email}}" or "{{connection.apiKey}}"
}

export interface DeveloperAction {
  id: string
  key: string
  name: string
  description: string
  status?: "private" | "public"
  tutorialUrl?: string
  authType?: "no_auth" | "inherit_app_auth" | "basic_auth" | "bearer_token" | "api_key"
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  endpointUrl: string
  headers: { id: string; key: string; value: string; description?: string }[]
  inputFields: ActionInputField[]
  bodyParameters: ActionParameterMapping[]
  sampleResponseFields: { key: string; label: string; type: string; sampleValue: string }[]
  enableHeaders?: boolean
  enableBodyParams?: boolean
  inbuiltActionSteps?: {
    id: string
    inbuiltActionId: string
    purpose?: string
    saved?: boolean
  }[]
  isMultiStep?: boolean
  multiStepConfig?: {
    enabled?: boolean
    steps: {
      id: string
      name?: string
      type?: "api_request" | "inbuilt_action"
      inbuiltActionId?: string
      targetId?: string
      endpointUrl?: string
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
      outputKey?: string
      mappedParams?: { key: string; value: string }[]
      considerStatusCode?: boolean
      saved?: boolean
    }[]
  }
}

export interface DeveloperApp {
  id: string
  name: string
  slug: string
  description: string
  tagline: string
  category: string
  logoIcon: string // Icon name or SVG/image URL
  brandColor: string // Hex code e.g. #2563EB
  version: string // e.g. "1.0.0"
  status: DeveloperAppStatus
  baseApiUrl: string
  websiteUrl?: string
  documentationUrl?: string
  privacyPolicyUrl?: string
  supportEmail?: string
  author: {
    name: string
    email: string
    company?: string
    isVerified?: boolean
  }
  secrets: SecretVariable[]
  authentication: DeveloperAuth
  triggers: DeveloperTrigger[]
  actions: DeveloperAction[]
  inbuiltActions?: DeveloperInbuiltAction[]
  distribution: {
    inviteToken: string
    inviteUrl: string
    maxTesters: number
    activeInstalls: number
    betaTesters: { email: string; acceptedAt: string; status: "active" | "revoked" }[]
  }
  reviewSubmission?: {
    submittedAt?: string
    reviewerTestAccount?: {
      usernameOrEmail: string
      passwordOrKey: string
      environmentUrl?: string
    }
    reviewerNotes?: string
    reviewedBy?: string
    reviewedAt?: string
    decision?: "approved" | "changes_requested"
    feedbackNotes?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ValidationItem {
  id: string
  title: string
  description: string
  status: "pass" | "fail" | "warning"
  remediation?: string
}
