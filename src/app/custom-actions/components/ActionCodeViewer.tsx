"use client"

import React, { useState, useMemo } from "react"
import { Copy, Check, ChevronDown, ChevronRight, FileCode } from "lucide-react"

interface ActionCodeViewerProps {
  code: string
  actionName?: string
  className?: string
  showCopy?: boolean
  maxHeight?: string
}

// Token types for syntax highlighting matching Image 2
type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "boolean"
  | "function"
  | "symbol"
  | "identifier"
  | "whitespace"

interface Token {
  type: TokenType
  text: string
}

const KEYWORDS = new Set([
  "async",
  "await",
  "function",
  "return",
  "const",
  "let",
  "var",
  "if",
  "else",
  "throw",
  "new",
  "try",
  "catch",
  "export",
  "default",
  "import",
  "from",
  "typeof",
  "delete",
  "in",
  "instanceof"
])

const BOOLEANS = new Set(["true", "false", "null", "undefined"])

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let cursor = 0

  while (cursor < line.length) {
    const remaining = line.slice(cursor)

    // 1. Line comment
    if (remaining.startsWith("//")) {
      tokens.push({ type: "comment", text: remaining })
      break
    }

    // 2. Whitespace
    const wsMatch = remaining.match(/^\s+/)
    if (wsMatch) {
      tokens.push({ type: "whitespace", text: wsMatch[0] })
      cursor += wsMatch[0].length
      continue
    }

    // 3. String literals (single quotes, double quotes, backticks)
    const strMatch = remaining.match(/^('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/)
    if (strMatch) {
      tokens.push({ type: "string", text: strMatch[0] })
      cursor += strMatch[0].length
      continue
    }

    // 4. Numbers
    const numMatch = remaining.match(/^\b\d+(\.\d+)?\b/)
    if (numMatch) {
      tokens.push({ type: "number", text: numMatch[0] })
      cursor += numMatch[0].length
      continue
    }

    // 5. Word tokens (keywords, booleans, function calls, identifiers)
    const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)
    if (wordMatch) {
      const word = wordMatch[0]
      const afterWord = remaining.slice(word.length)

      if (KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", text: word })
      } else if (BOOLEANS.has(word)) {
        tokens.push({ type: "boolean", text: word })
      } else if (/^\s*\(/.test(afterWord)) {
        tokens.push({ type: "function", text: word })
      } else {
        tokens.push({ type: "identifier", text: word })
      }
      cursor += word.length
      continue
    }

    // 6. Multi-character symbols
    const multiSymbolMatch = remaining.match(/^(\.\.\.|===|!==|==|!=|<=|>=|=>|&&|\|\||\?\?)/)
    if (multiSymbolMatch) {
      tokens.push({ type: "symbol", text: multiSymbolMatch[0] })
      cursor += multiSymbolMatch[0].length
      continue
    }

    // 7. Single-character symbols/operators/punctuation
    const char = remaining[0]
    tokens.push({ type: "symbol", text: char })
    cursor += 1
  }

  return tokens
}

function renderToken(token: Token, key: number) {
  switch (token.type) {
    case "comment":
      // Amber/orange as seen in Image 2 ("// ── Helpers ──")
      return (
        <span key={key} className="text-amber-700 dark:text-amber-400">
          {token.text}
        </span>
      )
    case "string":
      // Crimson/Rose/Red as seen in Image 2 ("'OK'", "'https://...'")
      return (
        <span key={key} className="text-rose-600 dark:text-rose-400">
          {token.text}
        </span>
      )
    case "keyword":
      // Vibrant purple as seen in Image 2 ("function", "return", "async", "const", "if", "await")
      return (
        <span key={key} className="text-purple-600 dark:text-purple-400 font-semibold">
          {token.text}
        </span>
      )
    case "number":
      // Teal/cyan/emerald as seen in Image 2 (200, 400, 401)
      return (
        <span key={key} className="text-emerald-600 dark:text-emerald-400 font-medium">
          {token.text}
        </span>
      )
    case "boolean":
      // Teal/emerald as seen in Image 2 (true, false)
      return (
        <span key={key} className="text-emerald-600 dark:text-emerald-400 font-medium">
          {token.text}
        </span>
      )
    case "function":
      // Bright royal blue as seen in Image 2 ("jsonOk", "handleSendMessage", "fetch")
      return (
        <span key={key} className="text-blue-600 dark:text-blue-400 font-medium">
          {token.text}
        </span>
      )
    case "symbol":
      // Slate symbols: (, ), {, }, [, ], :, ;, ., etc.
      return (
        <span key={key} className="text-slate-600 dark:text-slate-400">
          {token.text}
        </span>
      )
    case "identifier":
      // Deep slate / navy for variable and object property names
      return (
        <span key={key} className="text-slate-800 dark:text-slate-100">
          {token.text}
        </span>
      )
    case "whitespace":
    default:
      return <span key={key}>{token.text}</span>
  }
}

// Determines if a line has a collapsible fold chevron 'v' matching Image 2
function isFoldableLine(line: string, _nextLines: string[]): boolean {
  const trimmed = line.trim()
  if (trimmed.startsWith("//") || !trimmed) return false

  // Image 2 shows fold 'v' on:
  // - Line 6: async function handleSendMessage(...) {
  // - Line 21: const res = await
  // - Line 23: headers: {
  if (
    trimmed.endsWith("{") ||
    trimmed.endsWith("(") ||
    trimmed.includes("function") && trimmed.includes("{") ||
    trimmed.includes("const res = await") ||
    trimmed.startsWith("fetch(") ||
    trimmed.startsWith("headers: {") ||
    trimmed.startsWith("requests: [")
  ) {
    return true
  }

  return false
}

export function ActionCodeViewer({
  code,
  actionName,
  className = "",
  showCopy = true,
  maxHeight
}: ActionCodeViewerProps) {
  const [copied, setCopied] = useState(false)
  const [foldedLines, setFoldedLines] = useState<Record<number, boolean>>({})

  const lines = useMemo(() => code.split("\n"), [code])

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFold = (lineIndex: number) => {
    setFoldedLines((prev) => ({
      ...prev,
      [lineIndex]: !prev[lineIndex]
    }))
  }

  return (
    <div
      className={`relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[#fbfcfd] dark:bg-[#0c1222] shadow-xs select-text overflow-hidden ${className}`}
    >
      {/* Floating Copy Button matching Image 2 top right */}
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
          title={copied ? "Copied to clipboard!" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 pr-0.5">
                Copied
              </span>
            </>
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {/* Code Container with Gutter & Highlighted Code */}
      <div
        className={`p-3.5 sm:p-4.5 font-mono text-[12px] sm:text-[12.5px] leading-[1.75] overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          maxHeight ? maxHeight : ""
        }`}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1
              const foldable = isFoldableLine(line, lines.slice(idx + 1))
              const isFolded = foldedLines[idx]
              const tokens = tokenizeLine(line)

              return (
                <tr
                  key={idx}
                  className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 group transition-colors"
                >
                  {/* Gutter: Line Number & Fold Chevron 'v' */}
                  <td className="w-12 select-none text-right pr-3 align-top text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    <span className="inline-flex items-center justify-end space-x-1">
                      <span className="font-mono text-[11.5px] tabular-nums">{lineNum}</span>
                      {foldable ? (
                        <button
                          type="button"
                          onClick={() => toggleFold(idx)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0 transition-colors cursor-pointer"
                          title={isFolded ? "Expand block" : "Fold block"}
                        >
                          {isFolded ? (
                            <ChevronRight className="h-2.5 w-2.5 inline-block" />
                          ) : (
                            <span className="text-[10px] font-sans font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 leading-none">
                              v
                            </span>
                          )}
                        </button>
                      ) : (
                        <span className="w-2.5 inline-block" />
                      )}
                    </span>
                  </td>

                  {/* Code Line Content with Precise Token Styling */}
                  <td className="pl-1 pr-8 align-top whitespace-pre font-mono">
                    {tokens.length > 0 ? (
                      tokens.map((token, tIdx) => renderToken(token, tIdx))
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
