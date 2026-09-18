import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: "right" | "bottom"
  title?: string
  description?: string
  header?: React.ReactNode
  hideCloseButton?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  footer?: React.ReactNode
  zIndex?: number
}

const Drawer: React.FC<DrawerProps> = ({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  header,
  hideCloseButton,
  children,
  className,
  style,
  footer,
  zIndex = 50,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex }}>
      {/* Backdrop (Closes drawer on outside click) */}
      <div 
        className={cn(
          "fixed inset-0 transition-opacity",
          zIndex > 50 ? "bg-slate-950/30 backdrop-blur-[1px]" : "bg-transparent"
        )}
        onClick={() => onOpenChange(false)}
      />

      {side === "right" ? (
        <div className="fixed top-4 bottom-4 right-4 flex pl-4" style={{ zIndex }}>
          <div style={style} className={cn("w-[640px] max-w-[92vw] shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-right duration-300 text-slate-900 dark:text-slate-100", className)}>
            {/* Header: custom header, or default title/description header, or none */}
            {header ? (
              header
            ) : (title || description) ? (
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80 rounded-t-2xl shrink-0">
                <div>
                  {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
                  {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
                </div>
                {!hideCloseButton && (
                  <button
                    onClick={() => onOpenChange(false)}
                    className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ) : null}
            {/* Body */}
            <div
              className="flex-1 overflow-y-auto p-6 scrollbar-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {children}
            </div>
            {/* Fixed / Static Footer */}
            {footer && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-b-2xl shrink-0 z-20">
                {footer}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-xl animate-in slide-in-from-bottom duration-300 z-50 text-slate-900 dark:text-slate-100">
          {header ? (
            header
          ) : (
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 rounded-t-xl shrink-0">
              <div className="flex items-center space-x-2">
                <div className="h-1.5 w-12 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
                {title && <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-2">{title}</h3>}
              </div>
              {!hideCloseButton && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
          {footer && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { Drawer }
