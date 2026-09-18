"use client"

import * as React from "react"
import { X } from "lucide-react"

interface VariablePillInputProps {
  id?: string
  value?: string
  placeholder?: string
  supportsMapping?: boolean
  multiline?: boolean
  showPressSlashButton?: boolean
  className?: string
  minHeight?: string
  onFocus?: () => void
  onBlur?: () => void
  onChange: (value: string) => void
  onOpenVariablePicker?: () => void
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderTokenPillHTML(tok: string): string {
  const escapedTok = escapeHtml(tok)
  return `<span class="inline-flex items-center space-x-1.5 text-[11px] font-mono bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 my-0.5 mx-0.5 rounded-md border border-blue-200 dark:border-blue-800/70 shadow-2xs select-none align-middle" data-token="${escapedTok}" contenteditable="false"><span>${escapedTok}</span><span data-remove="true" class="text-blue-400 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded p-0.5 ml-0.5 cursor-pointer inline-flex items-center justify-center transition-colors" title="Remove ${escapedTok}"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span></span>`
}

function valueToHTML(val: string): string {
  if (!val) return ""
  const parts = val.split(/(\{\{step_[^}]+\}\})/g)
  return parts
    .map((part) => {
      if (/^\{\{step_[^}]+\}\}$/.test(part)) {
        return renderTokenPillHTML(part)
      }
      return escapeHtml(part).replace(/\n/g, "<br>")
    })
    .join("")
}

function getDomValue(el: HTMLElement | null): string {
  if (!el) return ""
  let result = ""
  const traverse = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || ""
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement
      if (elem.dataset.token) {
        result += elem.dataset.token
      } else if (elem.tagName === "BR") {
        result += "\n"
      } else {
        elem.childNodes.forEach(traverse)
      }
    }
  }
  el.childNodes.forEach(traverse)
  return result
}

export function VariablePillInput({
  id,
  value = "",
  placeholder = "Enter value or press / to map variable...",
  supportsMapping = true,
  multiline = false,
  showPressSlashButton = false,
  className = "",
  minHeight = "min-h-[42px]",
  onFocus,
  onBlur,
  onChange,
  onOpenVariablePicker,
}: VariablePillInputProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const lastValueRef = React.useRef<string>(value)
  const [isFocused, setIsFocused] = React.useState(false)

  // Initialize and synchronize with external value changes (e.g. variable picked from modal)
  React.useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      lastValueRef.current = value
      editorRef.current.innerHTML = valueToHTML(value)
    }
  }, [value])

  // Mount initial content
  React.useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = valueToHTML(value)
      lastValueRef.current = value
    }
  }, [])

  const handleInput = () => {
    if (!editorRef.current) return
    const newVal = getDomValue(editorRef.current)
    lastValueRef.current = newVal
    onChange(newVal)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const removeBtn = target.closest('[data-remove="true"]')
    if (removeBtn) {
      e.preventDefault()
      e.stopPropagation()
      const pill = removeBtn.closest('[data-token]')
      if (pill) {
        pill.remove()
        if (editorRef.current) {
          const newVal = getDomValue(editorRef.current)
          lastValueRef.current = newVal
          onChange(newVal)
        }
      }
      return
    }

    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "/" && !e.ctrlKey && !e.altKey && !e.metaKey && supportsMapping) {
      e.preventDefault()
      onOpenVariablePicker?.()
      return
    }

    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      editorRef.current?.blur()
      return
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    if (!text) return

    // If pasted text has variable tokens, format directly into HTML
    if (/\{\{step_[^}]+\}\}/.test(text)) {
      const current = getDomValue(editorRef.current)
      const combined = current ? `${current} ${text}` : text
      lastValueRef.current = combined
      if (editorRef.current) {
        editorRef.current.innerHTML = valueToHTML(combined)
      }
      onChange(combined)
    } else {
      document.execCommand("insertText", false, text)
      handleInput()
    }
  }

  const isEmpty = !value || value.trim() === ""

  return (
    <div
      className={`relative group w-full cursor-text rounded-xl border transition-all ${
        isFocused
          ? "bg-white dark:bg-slate-900 border-blue-500 ring-1 ring-blue-500 shadow-xs"
          : "bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800"
      } ${className}`}
      onClick={handleClick}
    >
      {isEmpty && (
        <div
          className={`absolute left-2.5 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono pointer-events-none select-none truncate ${
            showPressSlashButton ? "pr-22" : "pr-2.5"
          }`}
        >
          {placeholder}
        </div>
      )}

      <div
        ref={editorRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => {
          setIsFocused(true)
          onFocus?.()
        }}
        onBlur={() => {
          setIsFocused(false)
          onBlur?.()
          if (editorRef.current) {
            const cleaned = getDomValue(editorRef.current)
            if (cleaned !== value) {
              onChange(cleaned)
            }
          }
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={`w-full text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none leading-relaxed p-2.5 ${
          showPressSlashButton ? "pr-22" : "pr-2.5"
        } ${minHeight} max-h-[160px] overflow-y-auto break-words whitespace-pre-wrap select-text`}
      />

      {supportsMapping && showPressSlashButton && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onOpenVariablePicker?.()
          }}
          className="absolute right-1.5 top-1.5 h-6.5 px-2 flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/90 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 hover:border-blue-300 rounded-md transition-all cursor-pointer shadow-2xs group select-none z-10"
          title="Insert variable (or Press / on keyboard)"
        >
          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-500">Press</span>
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 border border-slate-200/90 dark:border-slate-700 group-hover:border-blue-300 rounded text-slate-700 dark:text-slate-200 group-hover:text-blue-700 font-mono font-bold text-[10px] leading-none shadow-2xs">
            /
          </kbd>
        </button>
      )}
    </div>
  )
}

