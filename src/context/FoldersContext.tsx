"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export const DEFAULT_FOLDERS: string[] = [
  "Himanshu Pundir (Personal)",
  "Client Automations",
  "Marketing Campaigns",
  "E-Commerce Sync"
]

export const INITIAL_WORKFLOW_LOCATIONS: Record<string, string> = {
  wf_1: "Himanshu Pundir (Personal)",
  wf_2: "Himanshu Pundir (Personal)"
  // wf_3 has no folder assigned (unassigned default)
}

interface FoldersContextType {
  folders: string[]
  addFolder: (folderName: string) => boolean
  workflowLocations: Record<string, string>
  moveWorkflow: (wfId: string, folderName: string) => void
  isFoldersSubSidebarOpen: boolean
  setIsFoldersSubSidebarOpen: (open: boolean) => void
  toggleFoldersSubSidebar: () => void
  selectedFolder: string
  setSelectedFolder: (folder: string) => void
  selectFolderAndNavigate: (folder: string) => void
  getFolderWorkflowCount: (folder: string) => number
}

const FoldersContext = createContext<FoldersContextType | undefined>(undefined)

function FoldersProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS)
  const [workflowLocations, setWorkflowLocations] = useState<Record<string, string>>(INITIAL_WORKFLOW_LOCATIONS)
  const [isFoldersSubSidebarOpen, setIsFoldersSubSidebarOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string>("All Folders")

  // Sync with URL query parameter when ?folder=... is present
  useEffect(() => {
    const urlFolder = searchParams.get("folder")
    if (urlFolder) {
      const decoded = decodeURIComponent(urlFolder)
      setSelectedFolder(decoded)
      setIsFoldersSubSidebarOpen(true)
    } else if (pathname === "/chat" || pathname === "/workflows") {
      // If navigating to base chat/workflows without folder query param, stay on All Folders
      if (!urlFolder && selectedFolder !== "All Folders" && !searchParams.has("folder")) {
        setSelectedFolder("All Folders")
      }
      if (pathname === "/chat") {
        setIsFoldersSubSidebarOpen(false)
      }
    } else if (!pathname.startsWith("/workflows")) {
      setIsFoldersSubSidebarOpen(false)
    }
  }, [searchParams, pathname])

  const toggleFoldersSubSidebar = () => {
    setIsFoldersSubSidebarOpen((prev) => !prev)
  }

  const addFolder = (folderName: string): boolean => {
    const trimmed = folderName.trim()
    if (!trimmed || folders.includes(trimmed)) return false
    setFolders((prev) => [...prev, trimmed])
    return true
  }

  const moveWorkflow = (wfId: string, folderName: string) => {
    setWorkflowLocations((prev) => ({ ...prev, [wfId]: folderName }))
  }

  const selectFolderAndNavigate = (folderName: string) => {
    setSelectedFolder(folderName)
    const targetQuery = folderName === "All Folders" ? "" : `?folder=${encodeURIComponent(folderName)}`
    // User rule: Always open the Workflows page when clicking any folder, never on the Dashboard page!
    router.push(`/workflows${targetQuery}`)
  }

  const getFolderWorkflowCount = (folderName: string): number => {
    if (folderName === "All Folders") {
      const allKnownWfIds = new Set(["wf_1", "wf_2", "wf_3", ...Object.keys(workflowLocations)])
      return allKnownWfIds.size
    }
    return Object.values(workflowLocations).filter((f) => Boolean(f) && f === folderName).length
  }

  return (
    <FoldersContext.Provider
      value={{
        folders,
        addFolder,
        workflowLocations,
        moveWorkflow,
        isFoldersSubSidebarOpen,
        setIsFoldersSubSidebarOpen,
        toggleFoldersSubSidebar,
        selectedFolder,
        setSelectedFolder,
        selectFolderAndNavigate,
        getFolderWorkflowCount
      }}
    >
      {children}
    </FoldersContext.Provider>
  )
}

export function FoldersProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <FoldersProviderInner>{children}</FoldersProviderInner>
    </React.Suspense>
  )
}

export function useFolders() {
  const context = useContext(FoldersContext)
  if (!context) {
    throw new Error("useFolders must be used within a FoldersProvider")
  }
  return context
}
