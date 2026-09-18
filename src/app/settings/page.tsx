"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  Code2,
  Database,
  Plus,
  Copy,
  Check,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Search,
  Lock,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Star,
  MoreVertical,
  User,
  Bell,
  CheckCircle2,
  Save,
  Hash,
  AlertCircle,
  KeyRound,
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Mail,
  Send,
  RotateCw,
  XCircle,
  Info,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Drawer } from "@/components/ui/drawer"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useTableSelection, TableCheckbox } from "@/components/ui/table-bulk-actions"
import { SearchControlBar } from "@/components/ui/search-control-bar"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"

interface CustomVariable {
  id: string
  key: string
  value: string
  type: "String" | "Number" | "Boolean" | "Secret"
  scope: "Custom" | "System"
  isSecret?: boolean
  description?: string
  lastModified: string
}

export interface PermissionSet {
  // Workflows
  canCreateWorkflows: boolean
  canEditWorkflows: boolean
  canDeleteWorkflows: boolean
  canPublishWorkflows: boolean
  canTestWorkflows: boolean

  // Connections
  canViewConnections: boolean
  canCreateConnections: boolean
  canDeleteConnections: boolean

  // History
  canViewHistory: boolean
  canReplayRuns: boolean
  canExportLogs: boolean

  // Variables & Secrets
  canViewVariables: boolean
  canManageVariables: boolean
  canRevealSecrets: boolean

  // Team & Workspace
  canViewTeam: boolean
  canInviteMembers: boolean
  canManageRoles: boolean
  canManageBilling: boolean
}

export interface RoleDefinition {
  id: string
  name: string
  description: string
  isSystem: boolean
  badgeColorClass: string
  permissions: PermissionSet
}

export interface TeamMember {
  id: string
  name: string
  email: string
  roleId: string
  status: "Active" | "Pending" | "Suspended"
  twoFactorEnabled: boolean
  joinedAt: string
  isCurrentUser?: boolean
}

export interface TeamInvitation {
  id: string
  email: string
  roleId: string
  sentAt: string
  expiresInDays: number
}

export interface SecurityAuditLog {
  id: string
  actorName: string
  actorEmail: string
  action: string
  target: string
  ipAddress: string
  timestamp: string
}

export const PERMISSION_GROUPS = [
  {
    category: "Workflow Management",
    permissions: [
      { key: "canCreateWorkflows", label: "Create Workflows", desc: "Build new multi-step automation workflows" },
      { key: "canEditWorkflows", label: "Edit Workflows", desc: "Modify steps, parameters, and triggers" },
      { key: "canDeleteWorkflows", label: "Delete Workflows", desc: "Permanently delete workflows" },
      { key: "canPublishWorkflows", label: "Publish / Activate", desc: "Toggle live status and production runs" },
      { key: "canTestWorkflows", label: "Test Run Workflows", desc: "Execute ad-hoc manual and trigger tests" }
    ]
  },
  {
    category: "App Connections & Auth",
    permissions: [
      { key: "canViewConnections", label: "View Connections", desc: "Inspect authorized app accounts" },
      { key: "canCreateConnections", label: "Connect New Apps", desc: "Authorize OAuth and API token credentials" },
      { key: "canDeleteConnections", label: "Revoke Connections", desc: "Disconnect and delete connected accounts" }
    ]
  },
  {
    category: "History, Logs & Auditing",
    permissions: [
      { key: "canViewHistory", label: "View Run Logs", desc: "Inspect execution states and node payloads" },
      { key: "canReplayRuns", label: "Replay Failed Runs", desc: "Re-execute historical workflow runs" },
      { key: "canExportLogs", label: "Export Audit Logs", desc: "Download run logs and security traces as CSV" }
    ]
  },
  {
    category: "Variables & Secrets",
    permissions: [
      { key: "canViewVariables", label: "View Variables", desc: "Reference global environment keys" },
      { key: "canManageVariables", label: "Manage Variables", desc: "Create, edit, and delete environment variables" },
      { key: "canRevealSecrets", label: "Reveal Secrets", desc: "Unmask hidden sensitive tokens and keys" }
    ]
  },
  {
    category: "Team & Workspace Administration",
    permissions: [
      { key: "canViewTeam", label: "View Team Directory", desc: "See workspace members and their roles" },
      { key: "canInviteMembers", label: "Invite Members", desc: "Send invitations to new team members" },
      { key: "canManageRoles", label: "Manage Roles & RBAC", desc: "Create, modify, and assign user roles" },
      { key: "canManageBilling", label: "Manage Billing", desc: "Access subscription tiers, seats, and payment receipts" }
    ]
  }
]

const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: "role_owner",
    name: "Owner",
    description: "Full workspace control, billing ownership, member delegation, and account management.",
    isSystem: true,
    badgeColorClass: "border-amber-400 bg-amber-50 text-amber-800 font-bold dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700/60",
    permissions: {
      canCreateWorkflows: true,
      canEditWorkflows: true,
      canDeleteWorkflows: true,
      canPublishWorkflows: true,
      canTestWorkflows: true,
      canViewConnections: true,
      canCreateConnections: true,
      canDeleteConnections: true,
      canViewHistory: true,
      canReplayRuns: true,
      canExportLogs: true,
      canViewVariables: true,
      canManageVariables: true,
      canRevealSecrets: true,
      canViewTeam: true,
      canInviteMembers: true,
      canManageRoles: true,
      canManageBilling: true
    }
  },
  {
    id: "role_admin",
    name: "Admin",
    description: "Create & edit all workflows, manage credentials, and invite members. Cannot transfer ownership.",
    isSystem: true,
    badgeColorClass: "bg-blue-50 text-blue-700 border-blue-200 font-bold dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/60",
    permissions: {
      canCreateWorkflows: true,
      canEditWorkflows: true,
      canDeleteWorkflows: true,
      canPublishWorkflows: true,
      canTestWorkflows: true,
      canViewConnections: true,
      canCreateConnections: true,
      canDeleteConnections: true,
      canViewHistory: true,
      canReplayRuns: true,
      canExportLogs: true,
      canViewVariables: true,
      canManageVariables: true,
      canRevealSecrets: true,
      canViewTeam: true,
      canInviteMembers: true,
      canManageRoles: false,
      canManageBilling: false
    }
  },
  {
    id: "role_member",
    name: "Member (Builder)",
    description: "Create, test, and publish workflows using authorized connections. Cannot manage billing or team.",
    isSystem: true,
    badgeColorClass: "bg-slate-100 text-slate-700 border-slate-200 font-bold dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    permissions: {
      canCreateWorkflows: true,
      canEditWorkflows: true,
      canDeleteWorkflows: false,
      canPublishWorkflows: true,
      canTestWorkflows: true,
      canViewConnections: true,
      canCreateConnections: true,
      canDeleteConnections: false,
      canViewHistory: true,
      canReplayRuns: true,
      canExportLogs: false,
      canViewVariables: true,
      canManageVariables: false,
      canRevealSecrets: false,
      canViewTeam: true,
      canInviteMembers: false,
      canManageRoles: false,
      canManageBilling: false
    }
  },
  {
    id: "role_viewer",
    name: "Viewer",
    description: "Read-only access to workflows and run execution logs. Cannot edit or trigger workflows.",
    isSystem: true,
    badgeColorClass: "text-slate-600 border-slate-300 font-medium dark:text-slate-300 dark:border-slate-700 dark:bg-slate-800/50",
    permissions: {
      canCreateWorkflows: false,
      canEditWorkflows: false,
      canDeleteWorkflows: false,
      canPublishWorkflows: false,
      canTestWorkflows: false,
      canViewConnections: true,
      canCreateConnections: false,
      canDeleteConnections: false,
      canViewHistory: true,
      canReplayRuns: false,
      canExportLogs: true,
      canViewVariables: true,
      canManageVariables: false,
      canRevealSecrets: false,
      canViewTeam: true,
      canInviteMembers: false,
      canManageRoles: false,
      canManageBilling: false
    }
  }
]

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "mem_1",
    name: "Himanshu Pundir",
    email: "himanshu@automate.com",
    roleId: "role_owner",
    status: "Active",
    twoFactorEnabled: true,
    joinedAt: "Jan 12, 2025",
    isCurrentUser: true
  },
  {
    id: "mem_2",
    name: "Sarah Jenkins",
    email: "sarah.j@acme.com",
    roleId: "role_admin",
    status: "Active",
    twoFactorEnabled: true,
    joinedAt: "Mar 04, 2025"
  },
  {
    id: "mem_3",
    name: "Alex Rivera",
    email: "alex.r@acme.com",
    roleId: "role_member",
    status: "Active",
    twoFactorEnabled: false,
    joinedAt: "Apr 18, 2025"
  },
  {
    id: "mem_4",
    name: "Elena Rostova",
    email: "elena@partner.io",
    roleId: "role_viewer",
    status: "Active",
    twoFactorEnabled: true,
    joinedAt: "May 22, 2025"
  },
  {
    id: "mem_5",
    name: "Marcus Vance",
    email: "marcus.v@finance.com",
    roleId: "role_viewer",
    status: "Active",
    twoFactorEnabled: true,
    joinedAt: "Jun 09, 2025"
  }
]

const INITIAL_INVITATIONS: TeamInvitation[] = [
  {
    id: "inv_1",
    email: "david.c@acme.com",
    roleId: "role_member",
    sentAt: "2 days ago",
    expiresInDays: 5
  }
]

const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: "log_1",
    actorName: "Himanshu Pundir",
    actorEmail: "himanshu@automate.com",
    action: "member.invited",
    target: "david.c@acme.com (Role: Member)",
    ipAddress: "103.212.144.12",
    timestamp: "2 days ago"
  },
  {
    id: "log_2",
    actorName: "Sarah Jenkins",
    actorEmail: "sarah.j@acme.com",
    action: "role.updated",
    target: "Elena Rostova -> Viewer",
    ipAddress: "49.207.218.84",
    timestamp: "May 22, 2025"
  },
  {
    id: "log_3",
    actorName: "Himanshu Pundir",
    actorEmail: "himanshu@automate.com",
    action: "auth.two_factor_enabled",
    target: "Personal Account Security",
    ipAddress: "103.212.144.12",
    timestamp: "Jan 12, 2025"
  }
]

const INITIAL_VARIABLES: CustomVariable[] = [
  {
    id: "var_1",
    key: "COMPANY_SUPPORT_EMAIL",
    value: "support@automate.com",
    type: "String",
    scope: "Custom",
    isSecret: false,
    description: "Global fallback customer support email address",
    lastModified: "2 hours ago"
  },
  {
    id: "var_2",
    key: "SLACK_ALERT_WEBHOOK_URL",
    value: "https://hooks.slack.com/services/T00/B00/X009921",
    type: "Secret",
    scope: "Custom",
    isSecret: true,
    description: "Production Slack incoming webhook endpoint secret token",
    lastModified: "1 day ago"
  },
  {
    id: "var_3",
    key: "MAX_RETRY_ATTEMPTS",
    value: "3",
    type: "Number",
    scope: "Custom",
    isSecret: false,
    description: "Global maximum automatic step execution retry limit",
    lastModified: "3 days ago"
  },
  {
    id: "sys_1",
    key: "SYSTEM_CURRENT_TIMESTAMP",
    value: "{{NOW_ISO_8601}}",
    type: "String",
    scope: "System",
    isSecret: false,
    description: "ISO timestamp of current workflow execution start",
    lastModified: "System Managed"
  },
  {
    id: "sys_2",
    key: "SYSTEM_WORKFLOW_RUN_ID",
    value: "{{EXECUTION_UUID}}",
    type: "String",
    scope: "System",
    isSecret: false,
    description: "Unique execution identifier token for current run",
    lastModified: "System Managed"
  },
  {
    id: "sys_3",
    key: "SYSTEM_WORKSPACE_ID",
    value: "ws_aut_99218",
    type: "String",
    scope: "System",
    isSecret: false,
    description: "Unique account workspace ID tag",
    lastModified: "System Managed"
  }
]

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const activeTabFromUrl = searchParams.get("tab") || "account"
  const [activeTab, setActiveTab] = useState(activeTabFromUrl)

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  // Profile Form State
  const [name, setName] = useState("Himanshu Product Lead")
  const [email, setEmail] = useState("himanshu@automate.com")
  const [savedToast, setSavedToast] = useState(false)

  // Notification State
  const [notifyOnFailure, setNotifyOnFailure] = useState(true)
  const [notifyOnQuotaWarning, setNotifyOnQuotaWarning] = useState(true)
  const [notifyOnTeammate, setNotifyOnTeammate] = useState(false)
  const [slackChannel, setSlackChannel] = useState("#sales-alerts")

  // Security & Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccessToast, setPasswordSuccessToast] = useState(false)

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "bg-slate-200", text: "text-slate-400" }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-rose-500", text: "text-rose-600" }
    if (score === 2) return { score: 50, label: "Fair", color: "bg-amber-500", text: "text-amber-600" }
    if (score === 3) return { score: 75, label: "Good", color: "bg-blue-600", text: "text-blue-600" }
    return { score: 100, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccessToast(false)

    if (!currentPassword) {
      setPasswordError("Please enter your current password.")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation password do not match.")
      return
    }

    // Success
    setPasswordSuccessToast(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => {
      setPasswordSuccessToast(false)
    }, 4000)
  }

  // Team & RBAC Module State
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS)
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES)
  const [invitations, setInvitations] = useState<TeamInvitation[]>(INITIAL_INVITATIONS)
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(INITIAL_AUDIT_LOGS)
  const [activeTeamView, setActiveTeamView] = useState<"members" | "roles" | "invites">("members")
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [memberRoleFilter, setMemberRoleFilter] = useState("all")
  const [teamToastMessage, setTeamToastMessage] = useState<string | null>(null)

  // Invite Member Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRoleId, setInviteRoleId] = useState("role_member")
  const [inviteError, setInviteError] = useState("")

  // Change Role Modal State
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false)
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<TeamMember | null>(null)
  const [newTargetRoleId, setNewTargetRoleId] = useState("")

  // Create / Edit Custom Role Modal State
  const [customRoleModalOpen, setCustomRoleModalOpen] = useState(false)
  const [systemRolesDrawerOpen, setSystemRolesDrawerOpen] = useState(false)
  const [viewingCustomRole, setViewingCustomRole] = useState<RoleDefinition | null>(null)
  const [rolesSubTab, setRolesSubTab] = useState<"system" | "custom">("system")
  const systemRoles = useMemo(() => roles.filter((r) => r.isSystem), [roles])
  const customRoles = useMemo(() => roles.filter((r) => !r.isSystem), [roles])
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [customRoleName, setCustomRoleName] = useState("")
  const [customRoleDescription, setCustomRoleDescription] = useState("")
  const [customRolePermissions, setCustomRolePermissions] = useState<PermissionSet>({
    canCreateWorkflows: true,
    canEditWorkflows: true,
    canDeleteWorkflows: false,
    canPublishWorkflows: false,
    canTestWorkflows: true,
    canViewConnections: true,
    canCreateConnections: false,
    canDeleteConnections: false,
    canViewHistory: true,
    canReplayRuns: false,
    canExportLogs: false,
    canViewVariables: true,
    canManageVariables: false,
    canRevealSecrets: false,
    canViewTeam: true,
    canInviteMembers: false,
    canManageRoles: false,
    canManageBilling: false
  })
  const [customRoleError, setCustomRoleError] = useState("")

  // Delete Confirm Modal State (Members, Roles, Invites)
  const [teamDeleteModalState, setTeamDeleteModalState] = useState<{
    open: boolean
    type: "member" | "role" | "invite"
    id?: string
    title: string
    description: string
  }>({ open: false, type: "member", title: "", description: "" })

  const showTeamToast = (msg: string) => {
    setTeamToastMessage(msg)
    setTimeout(() => setTeamToastMessage(null), 3500)
  }

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
      const matchesRole = memberRoleFilter === "all" || m.roleId === memberRoleFilter
      return matchesSearch && matchesRole
    })
  }, [members, memberSearchQuery, memberRoleFilter])

  // Handlers for Team Member Management
  const handleOpenInviteModal = () => {
    setInviteEmail("")
    setInviteRoleId("role_member")
    setInviteError("")
    setInviteModalOpen(true)
  }

  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError("")
    const trimmed = inviteEmail.trim().toLowerCase()
    if (!trimmed || !trimmed.includes("@")) {
      setInviteError("Please enter a valid email address.")
      return
    }

    if (members.some((m) => m.email.toLowerCase() === trimmed)) {
      setInviteError("A member with this email address already exists.")
      return
    }

    if (invitations.some((i) => i.email.toLowerCase() === trimmed)) {
      setInviteError("An invitation is already pending for this email address.")
      return
    }

    const assignedRole = roles.find((r) => r.id === inviteRoleId)
    const newInvite: TeamInvitation = {
      id: "inv_" + Date.now(),
      email: trimmed,
      roleId: inviteRoleId,
      sentAt: "Just now",
      expiresInDays: 7
    }

    setInvitations((prev) => [newInvite, ...prev])
    setAuditLogs((prev) => [
      {
        id: "log_" + Date.now(),
        actorName: "Himanshu Pundir",
        actorEmail: "himanshu@automate.com",
        action: "member.invited",
        target: `${trimmed} (Role: ${assignedRole?.name || "Member"})`,
        ipAddress: "103.212.144.12",
        timestamp: "Just now"
      },
      ...prev
    ])

    setInviteModalOpen(false)
    showTeamToast(`Invitation sent to ${trimmed}!`)
  }

  const handleResendInvitation = (inv: TeamInvitation) => {
    setInvitations((prev) =>
      prev.map((item) => (item.id === inv.id ? { ...item, sentAt: "Just now" } : item))
    )
    showTeamToast(`Invitation resent to ${inv.email}!`)
  }

  const handleOpenChangeRole = (member: TeamMember) => {
    setSelectedMemberForRole(member)
    setNewTargetRoleId(member.roleId)
    setChangeRoleModalOpen(true)
  }

  const handleConfirmChangeRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberForRole) return
    const targetRole = roles.find((r) => r.id === newTargetRoleId)

    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMemberForRole.id ? { ...m, roleId: newTargetRoleId } : m
      )
    )

    setAuditLogs((prev) => [
      {
        id: "log_" + Date.now(),
        actorName: "Himanshu Pundir",
        actorEmail: "himanshu@automate.com",
        action: "role.updated",
        target: `${selectedMemberForRole.name} -> ${targetRole?.name || newTargetRoleId}`,
        ipAddress: "103.212.144.12",
        timestamp: "Just now"
      },
      ...prev
    ])

    setChangeRoleModalOpen(false)
    showTeamToast(`Role updated for ${selectedMemberForRole.name}!`)
  }

  const handleRequestRemoveMember = (member: TeamMember) => {
    if (member.roleId === "role_owner") return
    setTeamDeleteModalState({
      open: true,
      type: "member",
      id: member.id,
      title: `Remove ${member.name}?`,
      description: `Are you sure you want to remove ${member.name} (${member.email}) from this workspace? They will immediately lose access to all workflows, connections, and logs.`
    })
  }

  const handleRequestRevokeInvite = (invite: TeamInvitation) => {
    setTeamDeleteModalState({
      open: true,
      type: "invite",
      id: invite.id,
      title: "Cancel Invitation?",
      description: `Revoke the pending invitation sent to ${invite.email}. The invitation link will immediately become invalid.`
    })
  }

  // Handlers for Custom Roles Management
  const handleOpenCreateRole = () => {
    setEditingRoleId(null)
    setCustomRoleName("")
    setCustomRoleDescription("")
    setCustomRolePermissions({
      canCreateWorkflows: true,
      canEditWorkflows: true,
      canDeleteWorkflows: false,
      canPublishWorkflows: false,
      canTestWorkflows: true,
      canViewConnections: true,
      canCreateConnections: false,
      canDeleteConnections: false,
      canViewHistory: true,
      canReplayRuns: false,
      canExportLogs: false,
      canViewVariables: true,
      canManageVariables: false,
      canRevealSecrets: false,
      canViewTeam: true,
      canInviteMembers: false,
      canManageRoles: false,
      canManageBilling: false
    })
    setCustomRoleError("")
    setCustomRoleModalOpen(true)
  }

  const handleOpenEditRole = (role: RoleDefinition) => {
    if (role.isSystem) return
    setEditingRoleId(role.id)
    setCustomRoleName(role.name)
    setCustomRoleDescription(role.description)
    setCustomRolePermissions({ ...role.permissions })
    setCustomRoleError("")
    setCustomRoleModalOpen(true)
  }

  const handleSaveCustomRole = (e: React.FormEvent) => {
    e.preventDefault()
    setCustomRoleError("")
    const trimmedName = customRoleName.trim()
    if (!trimmedName) {
      setCustomRoleError("Role name is required.")
      return
    }

    if (
      roles.some(
        (r) =>
          r.name.toLowerCase() === trimmedName.toLowerCase() &&
          r.id !== editingRoleId
      )
    ) {
      setCustomRoleError("A role with this name already exists.")
      return
    }

    if (editingRoleId) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRoleId
            ? {
                ...r,
                name: trimmedName,
                description: customRoleDescription.trim(),
                permissions: customRolePermissions
              }
            : r
        )
      )
      setAuditLogs((prev) => [
        {
          id: "log_" + Date.now(),
          actorName: "Himanshu Pundir",
          actorEmail: "himanshu@automate.com",
          action: "role.updated",
          target: `Custom Role: ${trimmedName}`,
          ipAddress: "103.212.144.12",
          timestamp: "Just now"
        },
        ...prev
      ])
      showTeamToast(`Role "${trimmedName}" updated!`)
    } else {
      const newRole: RoleDefinition = {
        id: "role_custom_" + Date.now(),
        name: trimmedName,
        description:
          customRoleDescription.trim() || "Custom workspace permission set.",
        isSystem: false,
        badgeColorClass: "border-indigo-300 bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-700/60",
        permissions: customRolePermissions
      }
      setRoles((prev) => [...prev, newRole])
      setAuditLogs((prev) => [
        {
          id: "log_" + Date.now(),
          actorName: "Himanshu Pundir",
          actorEmail: "himanshu@automate.com",
          action: "role.created",
          target: `Custom Role: ${trimmedName}`,
          ipAddress: "103.212.144.12",
          timestamp: "Just now"
        },
        ...prev
      ])
      showTeamToast(`Custom role "${trimmedName}" created!`)
    }

    setCustomRoleModalOpen(false)
    setRolesSubTab("custom")
  }

  const handleRequestDeleteRole = (role: RoleDefinition) => {
    if (role.isSystem) return
    const membersWithRole = members.filter((m) => m.roleId === role.id)
    if (membersWithRole.length > 0) {
      setTeamDeleteModalState({
        open: true,
        type: "role",
        id: undefined,
        title: "Cannot Delete Role",
        description: `This role is currently assigned to ${membersWithRole.length} member(s). Please reassign those members to another role before deleting.`
      })
      return
    }

    setTeamDeleteModalState({
      open: true,
      type: "role",
      id: role.id,
      title: `Delete Role "${role.name}"?`,
      description: `Are you sure you want to delete the custom role "${role.name}"? This action cannot be undone.`
    })
  }

  const handleConfirmTeamDelete = () => {
    if (teamDeleteModalState.type === "member" && teamDeleteModalState.id) {
      const memberToRemove = members.find((m) => m.id === teamDeleteModalState.id)
      setMembers((prev) => prev.filter((m) => m.id !== teamDeleteModalState.id))
      if (memberToRemove) {
        setAuditLogs((prev) => [
          {
            id: "log_" + Date.now(),
            actorName: "Himanshu Pundir",
            actorEmail: "himanshu@automate.com",
            action: "member.removed",
            target: `${memberToRemove.name} (${memberToRemove.email})`,
            ipAddress: "103.212.144.12",
            timestamp: "Just now"
          },
          ...prev
        ])
        showTeamToast(`Member ${memberToRemove.name} removed from workspace.`)
      }
    } else if (teamDeleteModalState.type === "invite" && teamDeleteModalState.id) {
      setInvitations((prev) => prev.filter((i) => i.id !== teamDeleteModalState.id))
      showTeamToast("Invitation cancelled.")
    } else if (teamDeleteModalState.type === "role" && teamDeleteModalState.id) {
      const roleToDelete = roles.find((r) => r.id === teamDeleteModalState.id)
      setRoles((prev) => prev.filter((r) => r.id !== teamDeleteModalState.id))
      if (viewingCustomRole?.id === teamDeleteModalState.id) {
        setViewingCustomRole(null)
      }
      if (roleToDelete) {
        setAuditLogs((prev) => [
          {
            id: "log_" + Date.now(),
            actorName: "Himanshu Pundir",
            actorEmail: "himanshu@automate.com",
            action: "role.deleted",
            target: `Custom Role: ${roleToDelete.name}`,
            ipAddress: "103.212.144.12",
            timestamp: "Just now"
          },
          ...prev
        ])
        showTeamToast(`Role "${roleToDelete.name}" deleted.`)
      }
    }
  }

  // Variables Manager State
  const [variables, setVariables] = useState<CustomVariable[]>(INITIAL_VARIABLES)
  const [varSearchQuery, setVarSearchQuery] = useState("")
  const [varFilterScope, setVarFilterScope] = useState<"All" | "Custom" | "System">("All")
  const [copiedVarKey, setCopiedVarKey] = useState<string | null>(null)
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({})
  const [starredRows, setStarredRows] = useState<Record<string, boolean>>({})
  const [activeMenuVarId, setActiveMenuVarId] = useState<string | null>(null)

  // Filter Popover & Dynamic Criteria State
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [varFilterType, setVarFilterType] = useState<"All" | "String" | "Number" | "Boolean" | "Secret">("All")
  const [starredOnly, setStarredOnly] = useState(false)

  // Add/Edit Variable Modal State
  const [addVarModalOpen, setAddVarModalOpen] = useState(false)
  const [editingVarId, setEditingVarId] = useState<string | null>(null)
  const [varKey, setVarKey] = useState("")
  const [varValue, setVarValue] = useState("")
  const [varType, setVarType] = useState<"String" | "Number" | "Boolean" | "Secret">("String")
  const [varDescription, setVarDescription] = useState("")

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3000)
  }

  const handleCopyTag = (keyName: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const tag = `{{var.${keyName}}}`
    navigator.clipboard.writeText(tag)
    setCopiedVarKey(keyName)
    setTimeout(() => setCopiedVarKey(null), 2000)
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleOpenAddVarModal = () => {
    setEditingVarId(null)
    setVarKey("")
    setVarValue("")
    setVarType("String")
    setVarDescription("")
    setAddVarModalOpen(true)
  }

  const handleOpenEditVarModal = (v: CustomVariable) => {
    setEditingVarId(v.id)
    setVarKey(v.key)
    setVarValue(v.value)
    setVarType(v.type)
    setVarDescription(v.description || "")
    setAddVarModalOpen(true)
    setActiveMenuVarId(null)
  }

  const handleSaveVariable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!varKey.trim()) return

    const sanitizedKey = varKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_")

    if (editingVarId) {
      setVariables(
        variables.map((v) =>
          v.id === editingVarId
            ? {
                ...v,
                key: sanitizedKey,
                value: varValue,
                type: varType,
                isSecret: varType === "Secret",
                description: varDescription,
                lastModified: "Just now"
              }
            : v
        )
      )
    } else {
      const newVar: CustomVariable = {
        id: `var_${Date.now()}`,
        key: sanitizedKey,
        value: varValue,
        type: varType,
        scope: "Custom",
        isSecret: varType === "Secret",
        description: varDescription || "User custom dynamic variable",
        lastModified: "Just now"
      }
      setVariables([newVar, ...variables])
    }

    setAddVarModalOpen(false)
    setVarKey("")
    setVarValue("")
  }

  // Delete Variable Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean
    mode: "single" | "bulk"
    varId?: string
    varKey?: string
    count?: number
  }>({ open: false, mode: "single" })

  const requestDeleteVariable = (varId: string, varKey: string) => {
    setActiveMenuVarId(null)
    setDeleteModalState({ open: true, mode: "single", varId, varKey })
  }

  const requestBulkDelete = () => {
    if (selectedCount === 0) return
    setActiveMenuVarId(null)
    setDeleteModalState({
      open: true,
      mode: "bulk",
      count: selectedCount
    })
  }

  const handleConfirmDeleteVariable = () => {
    if (deleteModalState.mode === "bulk") {
      const count = selectedIds.length
      setVariables((prev) => prev.filter((v) => !selectedIds.includes(v.id)))
      clearSelection()
    } else if (deleteModalState.varId) {
      setVariables((prev) => prev.filter((v) => v.id !== deleteModalState.varId))
    }
  }

  const toggleRevealSecret = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredVariables = useMemo(() => {
    return variables.filter((v) => {
      const matchesSearch =
        v.key.toLowerCase().includes(varSearchQuery.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(varSearchQuery.toLowerCase()))
      const matchesScope = varFilterScope === "All" ? true : v.scope === varFilterScope
      return matchesSearch && matchesScope
    })
  }, [variables, varSearchQuery, varFilterScope])

  const variableIds = useMemo(
    () => filteredVariables.map((v) => v.id),
    [filteredVariables]
  )

  const {
    selectedIds,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    selectedCount
  } = useTableSelection(variableIds)

  const customVarsCount = variables.filter((v) => v.scope === "Custom").length
  const systemVarsCount = variables.filter((v) => v.scope === "System").length

  return (
    <div className="p-3 sm:p-4 bg-slate-100/80 dark:bg-slate-950 min-h-[calc(100vh-4rem)] font-sans select-none relative">
      {/* Premium Floating Pure White Main Canvas Container */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 md:p-7 rounded-[22px] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              Settings & Configuration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Manage your profile, global variables, and alert notifications.
            </p>
          </div>

          {savedToast && (
            <Badge variant="success" className="space-x-1 py-1.5 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Settings Saved Successfully!</span>
            </Badge>
          )}

          {passwordSuccessToast && (
            <Badge variant="success" className="space-x-1 py-1.5 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Password Changed Successfully!</span>
            </Badge>
          )}

          {teamToastMessage && (
            <Badge variant="blue" className="space-x-1 py-1.5 px-3 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{teamToastMessage}</span>
            </Badge>
          )}
        </div>

        {/* Dynamic Tabs Container (Driven by SettingsSubSidebar) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* TAB 1: Profile & Account (Screen 21) */}
          <TabsContent value="account" className="space-y-6 animate-in fade-in zoom-in-95">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Personal Profile Information</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Update your name, primary email address, and authentication method.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Full Name</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Account Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <span>Connected Google SSO</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Linked to google-oauth: himanshu@automate.com</p>
                  </div>

                  <Button type="submit" className="space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Account Profile</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Variables Manager */}
          <TabsContent value="variables" className="space-y-6 animate-in fade-in zoom-in-95">
            {/* Action Bar + Top KPI Metrics Cards */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Variables Manager</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create custom variables that can be used to store and manipulate data within your workflows.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {selectedCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestBulkDelete}
                    className="border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-300 font-bold text-xs space-x-1.5 shadow-none h-9 px-3.5 cursor-pointer animate-in fade-in"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span>Delete ({selectedCount})</span>
                  </Button>
                )}

                <Button size="default" className="space-x-2" onClick={handleOpenAddVarModal}>
                  <Plus className="h-4 w-4" />
                  <span>Add Variable</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Total Variables */}
              <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
                    {variables.length}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                    Total Variables
                  </span>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-500 dark:text-amber-400 flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
                  <Database className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
              </Card>

              {/* Card 2: Total Custom Variables */}
              <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
                    {customVarsCount}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                    Total Custom Variables
                  </span>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
                  <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </Card>

              {/* Card 3: Total System Variables */}
              <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
                    {systemVarsCount}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                    System Constants
                  </span>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
                  <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </Card>
            </div>

            {/* Search & Scope Switcher Control Bar (Unified SearchControlBar) */}
            <SearchControlBar
              searchQuery={varSearchQuery}
              onSearchChange={setVarSearchQuery}
              placeholder="Search variables by name or key..."
              showFiltersButton={false}
            >
              <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 p-1 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0 px-1">
                {(["All", "Custom", "System"] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setVarFilterScope(sc)}
                    className={`px-3 py-1 rounded text-xs transition-colors font-semibold cursor-pointer ${
                      varFilterScope === sc
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    {sc === "All" ? "All Variables" : sc === "Custom" ? "Custom" : "System Constants"}
                  </button>
                ))}
              </div>
            </SearchControlBar>

            {/* Custom Variables Data Table */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-visible rounded-xl relative z-10 space-y-3">
              <div className="overflow-x-auto overflow-y-visible min-h-[360px] pb-10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <TableCheckbox
                          checked={isAllSelected}
                          indeterminate={isPartiallySelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all variables"
                        />
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          <span>Variable Name & Copy Tag</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Value</th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          <span>Type</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Scope</th>
                      <th className="py-3 px-4">
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          <span>Last Modified</span>
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4 w-10 text-center">⭐</th>
                      <th className="py-3 px-4 text-center w-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 relative">
                    {filteredVariables.map((v, rowIdx) => {
                      const isRevealed = revealedSecrets[v.id]
                      const tagSyntax = `{{var.${v.key}}}`
                      const isCopied = copiedVarKey === v.key
                      const openUpward = rowIdx === filteredVariables.length - 1 && filteredVariables.length > 3

                      return (
                        <tr
                          key={v.id}
                          className={`transition-colors group relative ${
                            isSelected(v.id) ? "bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-50/70 dark:hover:bg-blue-950/60" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <TableCheckbox
                              checked={isSelected(v.id)}
                              onChange={() => toggleSelect(v.id)}
                              aria-label={`Select ${v.key}`}
                            />
                          </td>

                          {/* Key & Copy Tag */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-7 w-7 rounded-lg bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs">
                                {`{x}`}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs tracking-tight">
                                  {v.key}
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={(e) => handleCopyTag(v.key, e)}
                                    className="font-mono text-[10px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
                                    title="Click to copy variable placeholder"
                                  >
                                    <span>{tagSyntax}</span>
                                    {isCopied ? (
                                      <Check className="h-3 w-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-slate-400" />
                                    )}
                                  </button>
                                  {isCopied && (
                                    <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Value */}
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                            {v.isSecret && !isRevealed ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-400 font-bold tracking-widest">•••••••••••••••</span>
                                <button
                                  onClick={(e) => toggleRevealSecret(v.id, e)}
                                  className="text-slate-400 hover:text-slate-700 p-1"
                                  title="Reveal Secret Value"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-800 break-all max-w-xs">
                                  {v.value}
                                </span>
                                {v.isSecret && (
                                  <button
                                    onClick={(e) => toggleRevealSecret(v.id, e)}
                                    className="text-slate-400 hover:text-slate-700 p-1"
                                    title="Hide Secret Value"
                                  >
                                    <EyeOff className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                v.type === "Secret"
                                  ? "destructive"
                                  : v.type === "Number"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {v.type}
                            </Badge>
                          </td>

                          {/* Scope */}
                          <td className="py-3.5 px-4">
                            {v.scope === "System" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
                                System Global
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/90">
                                Account Scope
                              </span>
                            )}
                          </td>

                          {/* Last Modified */}
                          <td className="py-3.5 px-4 text-slate-500 font-normal text-[11px]">
                            {v.lastModified}
                          </td>

                          {/* Star Favorite */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => handleToggleStar(v.id, e)}>
                            <Star className={`h-4 w-4 cursor-pointer transition-colors ${starredRows[v.id] ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-slate-500"}`} />
                          </td>

                          {/* Options Menu with Upward/Downward Auto-Positioning & z-[100] */}
                          <td className="py-3.5 px-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                              onClick={() => setActiveMenuVarId(activeMenuVarId === v.id ? null : v.id)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            {activeMenuVarId === v.id && (
                              <div className={`absolute right-4 z-[100] w-44 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 text-xs text-left animate-in fade-in zoom-in-95 ${openUpward ? "bottom-full mb-1" : "top-10"}`}>
                                <button
                                  onClick={() => handleCopyTag(v.key)}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                >
                                  <Copy className="h-3.5 w-3.5 text-blue-600" />
                                  <span>Copy Tag</span>
                                </button>

                                {v.scope === "Custom" && (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditVarModal(v)}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                    >
                                      <Edit2 className="h-3.5 w-3.5 text-emerald-600" />
                                      <span>Edit Variable</span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100" />

                                    <button
                                      onClick={() => requestDeleteVariable(v.id, v.key)}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors font-semibold cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                      <span>Delete Variable</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="py-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-normal">Showing 1–{filteredVariables.length} of {filteredVariables.length} variables</span>

                <div className="flex items-center space-x-2 w-36">
                  <Select
                    value="25"
                    options={[
                      { value: "25", label: "25 per page" },
                      { value: "50", label: "50 per page" },
                      { value: "100", label: "100 per page" }
                    ]}
                    className="text-xs h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Notifications (Screen 22) */}
          <TabsContent value="notifications" className="space-y-6 animate-in fade-in zoom-in-95">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Workflow Failure & Limit Alerts</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Configure email & Slack channels for automated system alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-w-lg">
                <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Workflow Execution Failure Alert</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Send instant alert when any step fails in a live workflow</p>
                    </div>
                    <Switch checked={notifyOnFailure} onCheckedChange={setNotifyOnFailure} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Task Quota Warning (80% / 100%)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Notify when task usage approaches monthly limit</p>
                    </div>
                    <Switch checked={notifyOnQuotaWarning} onCheckedChange={setNotifyOnQuotaWarning} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Teammate Invitation Notifications</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Receive email when new members accept workspace invite</p>
                    </div>
                    <Switch checked={notifyOnTeammate} onCheckedChange={setNotifyOnTeammate} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <Hash className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    <span>Slack Alert Channel Picker</span>
                  </label>
                  <Select value={slackChannel} onChange={(e) => setSlackChannel(e.target.value)}>
                    <option value="#sales-alerts">#sales-alerts (Connected Workspace)</option>
                    <option value="#dev-alerts">#dev-alerts</option>
                    <option value="#general">#general</option>
                  </Select>
                </div>

                <Button type="button" className="space-x-2" onClick={handleSaveProfile}>
                  <Save className="h-4 w-4" />
                  <span>Save Notification Preferences</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Security & Password Management */}
          <TabsContent value="security" className="space-y-6 animate-in fade-in zoom-in-95">
            {/* Password Change Card */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                      <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Change Password</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Update your account password. We recommend choosing a strong password with a mix of letters, numbers, and symbols.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Last changed 2 months ago
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                  {passwordError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Current Password</label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your current password..."
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">New Password</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new strong password (min 8 chars)..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Dynamic Password Strength Meter */}
                    {newPassword && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                          <span className={`font-bold ${passwordStrength.text}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 rounded-full transition-all ${newPassword.length >= 8 ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"}`} />
                          <div className={`h-full flex-1 rounded-full transition-all ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"}`} />
                          <div className={`h-full flex-1 rounded-full transition-all ${/\d/.test(newPassword) ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"}`} />
                          <div className={`h-full flex-1 rounded-full transition-all ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"}`} />
                        </div>
                        <ul className="text-[10px] text-slate-400 dark:text-slate-400 space-y-0.5 pt-0.5">
                          <li className={newPassword.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                            • At least 8 characters
                          </li>
                          <li className={/\d/.test(newPassword) && /[A-Z]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                            • Contains uppercase letter & number
                          </li>
                          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                            • Contains special symbol (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Confirm New Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword && (
                      <p className={`text-[10px] font-medium ${newPassword === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                        {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="space-x-2">
                      <KeyRound className="h-4 w-4" />
                      <span>Update Password</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Team Members & RBAC Permissions */}
          <TabsContent value="team" className="space-y-6 animate-in fade-in zoom-in-95">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Workspace Admins</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {members.filter((m) => m.roleId === "role_owner" || m.roleId === "role_admin").length}
                  </span>
                  <Badge variant="success" className="text-[10px]">Privileged</Badge>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Owner & Admin roles</p>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Invites</span>
                  <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {invitations.length}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40">
                    Awaiting Join
                  </Badge>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Valid for 7 days</p>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Configured Roles</span>
                  <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {roles.length}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40">
                    {roles.filter((r) => !r.isSystem).length} Custom
                  </Badge>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {roles.filter((r) => r.isSystem).length} System, {roles.filter((r) => !r.isSystem).length} Custom
                </p>
              </Card>
            </div>

            {/* Sub-View Navigation Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-1.5 bg-slate-100/90 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTeamView("members")}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTeamView === "members"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Members ({members.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTeamView("roles")}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTeamView === "roles"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Roles & Matrix ({roles.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTeamView("invites")}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTeamView === "invites"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Pending ({invitations.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2.5">
                {activeTeamView === "roles" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSystemRolesDrawerOpen(true)}
                      className="space-x-1.5 font-medium cursor-pointer"
                    >
                      <Info className="h-4 w-4 text-slate-500" />
                      <span>Know more about System Roles</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleOpenCreateRole}
                      className="space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Custom Role</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleOpenInviteModal}
                    className="space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Invite Member</span>
                  </Button>
                )}
              </div>
            </div>

            {/* VIEW 1: Team Members Directory */}
            {activeTeamView === "members" && (
              <div className="space-y-4">
                {/* Search & Filter Control Bar (Unified SearchControlBar) */}
                <SearchControlBar
                  searchQuery={memberSearchQuery}
                  onSearchChange={setMemberSearchQuery}
                  placeholder="Search members by name or email..."
                  chip={
                    memberRoleFilter !== "all"
                      ? {
                          label: "Role is",
                          value: roles.find((r) => r.id === memberRoleFilter)?.name || memberRoleFilter,
                          onRemove: () => setMemberRoleFilter("all")
                        }
                      : null
                  }
                  showFiltersButton={false}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-48">
                      <Select
                        value={memberRoleFilter}
                        onChange={(e) => setMemberRoleFilter(e.target.value)}
                        className="h-8 bg-slate-50 dark:bg-slate-800 font-semibold text-xs border-slate-200 dark:border-slate-700 dark:text-slate-200"
                      >
                        <option value="all">All Roles ({roles.length})</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block whitespace-nowrap">
                      Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredMembers.length}</span> of {members.length} members
                    </div>
                  </div>
                </SearchControlBar>

                {/* Members Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                  <Table>
                    <TableHeader className="bg-slate-50/75 dark:bg-slate-800/80">
                      <TableRow className="border-b border-slate-200 dark:border-slate-800">
                        <TableHead className="w-[320px] text-xs font-semibold text-slate-600 dark:text-slate-300">Member</TableHead>
                        <TableHead className="w-[180px] text-xs font-semibold text-slate-600 dark:text-slate-300">Role</TableHead>
                        <TableHead className="w-[160px] text-xs font-semibold text-slate-600 dark:text-slate-300">Joined</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.length === 0 ? (
                        <TableRow className="border-b border-slate-200 dark:border-slate-800">
                          <TableCell colSpan={4} className="h-32 text-center text-xs text-slate-400 dark:text-slate-500">
                            No team members match the search and filter criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMembers.map((member) => {
                          const roleDef = roles.find((r) => r.id === member.roleId)
                          const initials = member.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()

                          return (
                            <TableRow key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
                              <TableCell className="py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{member.name}</span>
                                      {member.isCurrentUser && (
                                        <Badge variant="blue" className="text-[9px] py-0 px-1.5 h-4">
                                          You
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{member.email}</span>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${roleDef?.badgeColorClass || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"}`}>
                                  {roleDef?.name || member.roleId}
                                </span>
                              </TableCell>

                              <TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400">
                                {member.joinedAt}
                              </TableCell>

                              <TableCell className="py-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {member.roleId === "role_owner" ? (
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic pr-2">
                                      Workspace Owner
                                    </span>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenChangeRole(member)}
                                        className="h-7 px-2.5 text-xs font-medium cursor-pointer"
                                      >
                                        Change Role
                                      </Button>
                                      {!member.isCurrentUser && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleRequestRemoveMember(member)}
                                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 cursor-pointer"
                                          title="Remove from Workspace"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* VIEW 2: Roles Catalog & Granular Permission Matrix */}
            {activeTeamView === "roles" && (
              <div className="space-y-6">
                {/* Sub-Tab Switcher: System Roles vs Custom Roles */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setRolesSubTab("system")}
                      className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        rolesSubTab === "system"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>System Roles ({systemRoles.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRolesSubTab("custom")}
                      className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        rolesSubTab === "custom"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Custom Roles ({customRoles.length})</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {rolesSubTab === "system"
                      ? "Default built-in platform security roles (immutable)."
                      : `${customRoles.length} custom role${customRoles.length === 1 ? "" : "s"} with tailored access control.`}
                  </div>
                </div>

                {/* SUB-VIEW A: System Roles Permission Matrix */}
                {rolesSubTab === "system" && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          System Roles Permission Matrix
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Cross-comparison of active capabilities for built-in platform roles.
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-900 shadow-2xs">
                      <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                          <TableRow className="border-b border-slate-200 dark:border-slate-800">
                            <TableHead className="min-w-[280px] text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Capability / Permission
                            </TableHead>
                            {systemRoles.map((r) => (
                              <TableHead
                                key={r.id}
                                className="text-center min-w-[130px] text-xs font-semibold text-slate-700 dark:text-slate-300"
                              >
                                <div className="flex flex-col items-center gap-0.5">
                                  <span>{r.name}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">System Role</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {PERMISSION_GROUPS.map((group) => (
                            <React.Fragment key={group.category}>
                              <TableRow className="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                                <TableCell
                                  colSpan={systemRoles.length + 1}
                                  className="py-2 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide"
                                >
                                  {group.category}
                                </TableCell>
                              </TableRow>
                              {group.permissions.map((p) => (
                                <TableRow key={p.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800/70">
                                  <TableCell className="py-2.5 px-4">
                                    <div className="space-y-0.5">
                                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{p.label}</div>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.desc}</div>
                                    </div>
                                  </TableCell>
                                  {systemRoles.map((r) => {
                                    const allowed = r.permissions[p.key as keyof PermissionSet]
                                    return (
                                      <TableCell key={r.id} className="py-2.5 text-center">
                                        {allowed ? (
                                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                          </span>
                                        ) : (
                                          <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                                        )}
                                      </TableCell>
                                    )
                                  })}
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW B: Custom Roles Table & Tap-to-Inspect Permissions */}
                {rolesSubTab === "custom" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Custom Roles ({customRoles.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Workspace-specific roles with tailored permission policies. Tap any role to view its granular access permissions in the drawer.
                      </p>
                    </div>

                    {customRoles.length === 0 ? (
                      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-3 shadow-2xs">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                          <Shield className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 max-w-md mx-auto">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Custom Roles Configured</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Create custom roles to grant tailored combinations of workflow, connection, and workspace administrative permissions.
                          </p>
                        </div>
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={handleOpenCreateRole}
                            className="space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Create Your First Custom Role</span>
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                        <Table>
                          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
                            <TableRow className="border-b border-slate-200 dark:border-slate-800">
                              <TableHead className="min-w-[220px] text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Role Name
                              </TableHead>
                              <TableHead className="min-w-[260px] text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Description
                              </TableHead>
                              <TableHead className="min-w-[140px] text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
                                Assigned Members
                              </TableHead>
                              <TableHead className="min-w-[150px] text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
                                Permissions
                              </TableHead>
                              <TableHead className="min-w-[140px] text-xs font-semibold text-slate-700 dark:text-slate-300 text-right pr-4">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customRoles.map((role) => {
                              const assignedMembers = members.filter((m) => m.roleId === role.id)
                              const grantedCount = Object.values(role.permissions).filter(Boolean).length

                              return (
                                <TableRow
                                  key={role.id}
                                  onClick={() => setViewingCustomRole(role)}
                                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 transition-colors cursor-pointer group"
                                >
                                  {/* Role Name */}
                                  <TableCell className="py-3.5 px-4">
                                    <div>
                                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {role.name}
                                      </div>
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                        Click to view permissions
                                      </span>
                                    </div>
                                  </TableCell>

                                  {/* Description */}
                                  <TableCell className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[300px] truncate">
                                    {role.description || "Custom workspace permission set."}
                                  </TableCell>

                                  {/* Assigned Members */}
                                  <TableCell className="py-3.5 px-4 text-center">
                                    <span className="inline-flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                      <Users className="h-3 w-3 text-slate-400" />
                                      <span>
                                        {assignedMembers.length}{" "}
                                        {assignedMembers.length === 1 ? "member" : "members"}
                                      </span>
                                    </span>
                                  </TableCell>

                                  {/* Permissions Count */}
                                  <TableCell className="py-3.5 px-4 text-center">
                                    <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 px-2.5 py-1 rounded-full">
                                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>{grantedCount} of 18 active</span>
                                    </span>
                                  </TableCell>

                                  {/* Actions */}
                                  <TableCell
                                    className="py-3.5 px-4 text-right pr-4"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-end space-x-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setViewingCustomRole(role)}
                                        className="h-7 px-2 text-[11px] space-x-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer"
                                      >
                                        <Eye className="h-3 w-3" />
                                        <span>View</span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleOpenEditRole(role)}
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                        title="Edit Role"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRequestDeleteRole(role)}
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                        title="Delete Role"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: Pending Invitations */}
            {activeTeamView === "invites" && (
              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                  <Table>
                    <TableHeader className="bg-slate-50/75 dark:bg-slate-800/80">
                      <TableRow className="border-b border-slate-200 dark:border-slate-800">
                        <TableHead className="w-[280px] text-xs font-semibold text-slate-600 dark:text-slate-300">Invited Recipient</TableHead>
                        <TableHead className="w-[180px] text-xs font-semibold text-slate-600 dark:text-slate-300">Assigned Role</TableHead>
                        <TableHead className="w-[140px] text-xs font-semibold text-slate-600 dark:text-slate-300">Sent At</TableHead>
                        <TableHead className="w-[140px] text-xs font-semibold text-slate-600 dark:text-slate-300">Expires</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.length === 0 ? (
                        <TableRow className="border-b border-slate-200 dark:border-slate-800">
                          <TableCell colSpan={5} className="h-32 text-center text-xs text-slate-400 dark:text-slate-500">
                            No pending invitations. Click "Invite Member" above to invite teammates.
                          </TableCell>
                        </TableRow>
                      ) : (
                        invitations.map((invite) => {
                          const assignedRole = roles.find((r) => r.id === invite.roleId)

                          return (
                            <TableRow key={invite.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                              <TableCell className="py-3">
                                <div className="flex items-center space-x-2.5">
                                  <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                    <Mail className="h-4 w-4" />
                                  </div>
                                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{invite.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${assignedRole?.badgeColorClass || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"}`}>
                                  {assignedRole?.name || invite.roleId}
                                </span>
                              </TableCell>
                              <TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400">
                                {invite.sentAt}
                              </TableCell>
                              <TableCell className="py-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                In {invite.expiresInDays} days
                              </TableCell>
                              <TableCell className="py-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResendInvitation(invite)}
                                    className="h-7 px-2.5 text-xs font-medium space-x-1 cursor-pointer"
                                  >
                                    <RotateCw className="h-3 w-3" />
                                    <span>Resend</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRequestRevokeInvite(invite)}
                                    className="h-7 px-2.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 cursor-pointer"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal Dialog: Add / Edit Variable */}
        <Dialog open={addVarModalOpen} onOpenChange={setAddVarModalOpen}>
          <DialogHeader>
            <DialogTitle>{editingVarId ? "Edit Custom Variable" : "Create New Custom Variable"}</DialogTitle>
            <DialogDescription>
              Define dynamic key-value variables that can be referenced across all workflow step mappings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveVariable} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Variable Key Name</label>
              <Input
                type="text"
                placeholder="e.g. COMPANY_SUPPORT_EMAIL or SLACK_TOKEN"
                value={varKey}
                onChange={(e) => setVarKey(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400 font-mono">
                Auto-formats to SNAKE_CASE. Reference as {`{{var.${varKey.trim().toUpperCase() || "KEY"}}}`}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Variable Value</label>
              <Input
                type={varType === "Secret" ? "password" : "text"}
                placeholder="Enter variable value..."
                value={varValue}
                onChange={(e) => setVarValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Variable Type</label>
              <Select
                value={varType}
                onChange={(e) => setVarType(e.target.value as any)}
              >
                <option value="String">String (Text)</option>
                <option value="Number">Number (Numeric)</option>
                <option value="Boolean">Boolean (True/False)</option>
                <option value="Secret">Secret / Masked Token</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
              <Input
                type="text"
                placeholder="Describe what this variable is used for..."
                value={varDescription}
                onChange={(e) => setVarDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddVarModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingVarId ? "Update Variable" : "Save Variable"}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>

        {/* Reusable Alert Confirmation Modal for Variable Deletion */}
        <ConfirmModal
          open={deleteModalState.open}
          onOpenChange={(open) => setDeleteModalState((prev) => ({ ...prev, open }))}
          title={deleteModalState.mode === "bulk" ? `Delete ${deleteModalState.count} Variables?` : "Delete Variable?"}
          description={
            deleteModalState.mode === "bulk"
              ? `Are you sure you want to delete ${deleteModalState.count} selected variables? Any workflows referencing them in their mappings will no longer receive their values.`
              : "Are you sure you want to delete this custom variable? Any workflows referencing this variable in their mappings will no longer receive its value."
          }
          itemName={deleteModalState.mode === "bulk" ? undefined : deleteModalState.varKey}
          itemCount={deleteModalState.mode === "bulk" ? deleteModalState.count : undefined}
          confirmText={deleteModalState.mode === "bulk" ? `Delete ${deleteModalState.count} Variables` : "Delete Variable"}
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDeleteVariable}
        />

        {/* Modal: Invite Member */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an email invitation to collaborate on workflows in this workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvitation} className="space-y-4 my-2">
            {inviteError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <span>{inviteError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign Role</label>
              <Select
                value={inviteRoleId}
                onChange={(e) => setInviteRoleId(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isSystem ? "(System)" : "(Custom)"}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {roles.find((r) => r.id === inviteRoleId)?.description}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-200">Seat Allocation</div>
              <div>This invitation will claim 1 of your 10 available team seats upon acceptance.</div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="space-x-1.5">
                <Send className="h-4 w-4" />
                <span>Send Invitation</span>
              </Button>
            </DialogFooter>
          </form>
        </Dialog>

        {/* Side Drawer: Create / Edit Custom Role */}
        <Drawer
          open={customRoleModalOpen}
          onOpenChange={setCustomRoleModalOpen}
          side="right"
          title={editingRoleId ? "Edit Custom Role" : "Create Custom Role"}
          description="Define tailored workspace capabilities by toggling granular permissions across workflows, connections, and security settings."
          footer={
            <div className="flex items-center justify-end space-x-3 w-full">
              <Button type="button" variant="outline" onClick={() => setCustomRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="custom-role-form">
                {editingRoleId ? "Save Changes" : "Create Role"}
              </Button>
            </div>
          }
        >
          <form id="custom-role-form" onSubmit={handleSaveCustomRole} className="space-y-5">
            {customRoleError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <span>{customRoleError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role Name</label>
              <Input
                type="text"
                placeholder="e.g. Workflow Auditor or QA Engineer"
                value={customRoleName}
                onChange={(e) => setCustomRoleName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <Input
                type="text"
                placeholder="Briefly describe who should have this role and what they can do..."
                value={customRoleDescription}
                onChange={(e) => setCustomRoleDescription(e.target.value)}
              />
            </div>

            {/* Grouped Permission Toggles */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Granular Permissions
              </div>

              {PERMISSION_GROUPS.map((group) => (
                <div key={group.category} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    {group.category}
                  </div>
                  <div className="space-y-2.5">
                    {group.permissions.map((p) => {
                      const isChecked = !!customRolePermissions[p.key as keyof PermissionSet]
                      return (
                        <div
                          key={p.key}
                          className="flex items-center justify-between gap-4 py-1"
                        >
                          <div className="space-y-0.5">
                            <label
                              htmlFor={`perm_${p.key}`}
                              className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer block"
                            >
                              {p.label}
                            </label>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                              {p.desc}
                            </span>
                          </div>
                          <Switch
                            id={`perm_${p.key}`}
                            checked={isChecked}
                            onCheckedChange={(val) =>
                              setCustomRolePermissions((prev) => ({
                                ...prev,
                                [p.key]: val
                              }))
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </form>
        </Drawer>

        {/* Modal: Change Member Role */}
        <Dialog open={changeRoleModalOpen} onOpenChange={setChangeRoleModalOpen}>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update permissions and workspace privileges for {selectedMemberForRole?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmChangeRole} className="space-y-4 my-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedMemberForRole?.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{selectedMemberForRole?.email}</div>
              <div className="pt-1 flex items-center space-x-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Current Role:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${roles.find((r) => r.id === selectedMemberForRole?.roleId)?.badgeColorClass || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"}`}>
                  {roles.find((r) => r.id === selectedMemberForRole?.roleId)?.name}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select New Role</label>
              <Select
                value={newTargetRoleId}
                onChange={(e) => setNewTargetRoleId(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isSystem ? "(System)" : "(Custom)"}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {roles.find((r) => r.id === newTargetRoleId)?.description}
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setChangeRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </Dialog>

        {/* Modal: Team Delete / Revoke Confirm */}
        <ConfirmModal
          open={teamDeleteModalState.open}
          onOpenChange={(open) => setTeamDeleteModalState((prev) => ({ ...prev, open }))}
          title={teamDeleteModalState.title}
          description={teamDeleteModalState.description}
          confirmText={teamDeleteModalState.id ? "Proceed" : "Understood"}
          cancelText="Close"
          variant="danger"
          onConfirm={() => {
            if (teamDeleteModalState.id) {
              handleConfirmTeamDelete()
            }
          }}
        />

        {/* Side Drawer: System Roles Guide */}
        <Drawer
          open={systemRolesDrawerOpen}
          onOpenChange={setSystemRolesDrawerOpen}
          side="right"
          title="System Roles & Permissions Guide"
          description="Workspace roles govern access to workflows, app connections, global variables, and member delegation."
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                System roles are built-in and immutable.
              </span>
              <Button type="button" variant="outline" onClick={() => setSystemRolesDrawerOpen(false)}>
                Close Guide
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {roles
              .filter((r) => r.isSystem)
              .map((role) => {
                const assignedMembers = members.filter((m) => m.roleId === role.id)
                const isOwner = role.id === "role_owner"
                const isAdmin = role.id === "role_admin"
                const isMember = role.id === "role_member"
                const isViewer = role.id === "role_viewer"

                return (
                  <div
                    key={role.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${role.badgeColorClass}`}>
                            {role.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {isOwner ? "Protected" : "Default"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                          {role.description}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {assignedMembers.length} {assignedMembers.length === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Key Capabilities:
                      </div>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        {isOwner && (
                          <>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Full control over all workflows and app integrations</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Manage workspace subscription, invoices, and payment tiers</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Delegate roles and remove team members</span>
                            </li>
                          </>
                        )}
                        {isAdmin && (
                          <>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Create, edit, publish, and delete all team workflows</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Authorize and revoke shared OAuth connections</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Invite new team members and assign roles</span>
                            </li>
                          </>
                        )}
                        {isMember && (
                          <>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Build, test, and publish automation workflows</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Connect new apps using personal/shared credentials</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Replay failed execution runs</span>
                            </li>
                          </>
                        )}
                        {isViewer && (
                          <>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Inspect workflow configuration and step parameters (read-only)</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>View execution history and node step payloads</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Export audit execution logs to CSV</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )
              })}
          </div>
        </Drawer>

        {/* Side Drawer: Custom Role Access Permissions */}
        <Drawer
          open={!!viewingCustomRole}
          onOpenChange={(open) => {
            if (!open) setViewingCustomRole(null)
          }}
          side="right"
          title={viewingCustomRole ? viewingCustomRole.name : "Role Permissions"}
          description="Granular view of all granted and restricted permissions for this custom role."
          footer={
            viewingCustomRole && (
              <div className="flex items-center justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const roleToDelete = viewingCustomRole
                    setViewingCustomRole(null)
                    handleRequestDeleteRole(roleToDelete)
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50 cursor-pointer text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  <span>Delete Role</span>
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewingCustomRole(null)}
                    className="cursor-pointer"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const roleToEdit = viewingCustomRole
                      setViewingCustomRole(null)
                      handleOpenEditRole(roleToEdit)
                    }}
                    className="space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Permissions</span>
                  </Button>
                </div>
              </div>
            )
          }
        >
          {viewingCustomRole && (
            <div className="space-y-6">
              {/* Role Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{viewingCustomRole.name}</h4>
                    <Badge variant="outline" className="text-[10px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 font-mono">
                      Custom Role
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {viewingCustomRole.description || "No specific role description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Members</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {members.filter((m) => m.roleId === viewingCustomRole.id).length} Active Members
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Granted Rights</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {Object.values(viewingCustomRole.permissions).filter(Boolean).length} / 18 Allowed
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions grouped by category */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Access Permissions Breakdown
                  </h5>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {Object.values(viewingCustomRole.permissions).filter(Boolean).length} of 18 active
                  </span>
                </div>

                {PERMISSION_GROUPS.map((group) => {
                  const grantedInGroup = group.permissions.filter(
                    (p) => viewingCustomRole.permissions[p.key as keyof PermissionSet]
                  ).length

                  return (
                    <div
                      key={group.category}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"
                    >
                      {/* Group Header */}
                      <div className="bg-slate-50/80 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                          {group.category}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            grantedInGroup > 0
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {grantedInGroup} / {group.permissions.length} Enabled
                        </Badge>
                      </div>

                      {/* Group Permissions List */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {group.permissions.map((p) => {
                          const isAllowed = viewingCustomRole.permissions[p.key as keyof PermissionSet]
                          return (
                            <div
                              key={p.key}
                              className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <div className="space-y-0.5">
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{p.label}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.desc}</div>
                              </div>

                              <div className="shrink-0">
                                {isAllowed ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                    <span>Granted</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                                    <Lock className="h-2.5 w-2.5 opacity-60" />
                                    <span>Restricted</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </div>
  )
}
