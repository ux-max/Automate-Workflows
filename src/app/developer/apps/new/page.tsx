"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CreateAppWizardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect directly to Developer Hub with create drawer triggered
    router.replace("/developer?create=true")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Opening Developer Hub creation drawer...</p>
      </div>
    </div>
  )
}
