"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Plus, Trash2, ListPlus, Code2, Eye, Sliders } from "lucide-react"
import FormFieldModal from "./FormFieldModal"

export interface FormFieldItem {
  id: string
  label: string
  type: "text" | "number" | "date" | "textarea" | "select" | "multi-select" | "boolean" | "file"
  options?: string
  required?: boolean
}

interface HumanFormFieldsBuilderProps {
  value: string
  onChange: (val: string) => void
}

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "📝 Text (Single-line input)" },
  { value: "number", label: "🔢 Number (Numeric input)" },
  { value: "date", label: "📅 Date (Date picker)" },
  { value: "textarea", label: "📄 Textarea (Multi-line notes)" },
  { value: "select", label: "🔽 Category - Single select" },
  { value: "multi-select", label: "📑 Category - Multi select" },
  { value: "boolean", label: "☑️ Checkbox (Yes / No toggle)" },
  { value: "file", label: "📎 File Upload (Photo / Doc)" }
]


/**
 * Splits a comma-separated string while respecting brackets like select[A, B, C]
 */
function splitTopLevelCommas(str: string): string[] {
  const results: string[] = []
  let current = ""
  let inBracket = false

  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === "[") inBracket = true
    else if (ch === "]") inBracket = false

    if (ch === "," && !inBracket) {
      if (current.trim()) results.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }

  if (current.trim()) results.push(current.trim())
  return results
}

let fieldIdCounter = 0
function generateFieldId(): string {
  fieldIdCounter += 1
  return `fld_${Date.now()}_${fieldIdCounter}_${Math.random().toString(36).substring(2, 7)}`
}

function parseRawFields(raw: string, existingFields?: FormFieldItem[]): FormFieldItem[] {
  if (!raw || !raw.trim()) {
    if (existingFields !== undefined && existingFields.length === 0) {
      return []
    }
    return [
      { id: existingFields?.[0]?.id || generateFieldId(), label: "Tracking Number", type: "text", required: false },
      { id: existingFields?.[1]?.id || generateFieldId(), label: "Carrier Name", type: "text", required: false },
      { id: existingFields?.[2]?.id || generateFieldId(), label: "Dispatched Date", type: "date", required: false },
      { id: existingFields?.[3]?.id || generateFieldId(), label: "Notes", type: "textarea", required: false }
    ]
  }

  const parts = splitTopLevelCommas(raw)
  return parts.map((part, idx) => {
    const existing = existingFields?.[idx]
    const id = existing?.id || generateFieldId()

    // 1. Check for multi-select[Options] or multiselect[Options]
    const multiMatch = part.match(/^([^:]*):(multi-select|multiselect)\[(.*)\]$/i)
    if (multiMatch) {
      const rawLbl = multiMatch[1].trim()
      const isReq = rawLbl.endsWith("*") || existing?.required || false
      const label = isReq ? rawLbl.replace(/\*$/, "").trim() : rawLbl
      return {
        id,
        label,
        type: "multi-select",
        options: multiMatch[3].trim(),
        required: isReq
      }
    }

    // 2. Check for select[Options]
    const selectMatch = part.match(/^([^:]*):select\[(.*)\]$/i)
    if (selectMatch) {
      const rawLbl = selectMatch[1].trim()
      const isReq = rawLbl.endsWith("*") || existing?.required || false
      const label = isReq ? rawLbl.replace(/\*$/, "").trim() : rawLbl
      return {
        id,
        label,
        type: "select",
        options: selectMatch[2].trim(),
        required: isReq
      }
    }

    // 3. Check for Name:type
    const typeMatch = part.match(/^([^:]*):(text|number|date|textarea|longtext|select|multi-select|multiselect|boolean|checkbox|file)$/i)
    if (typeMatch) {
      let t = typeMatch[2].toLowerCase()
      if (t === "longtext") t = "textarea"
      if (t === "checkbox") t = "boolean"
      if (t === "multiselect") t = "multi-select"
      const rawLbl = typeMatch[1].trim()
      const isReq = rawLbl.endsWith("*") || existing?.required || false
      const label = isReq ? rawLbl.replace(/\*$/, "").trim() : rawLbl
      return {
        id,
        label,
        type: t as FormFieldItem["type"],
        options: (t === "select" || t === "multi-select") ? (existing?.options || "Option 1, Option 2, Option 3") : undefined,
        required: isReq
      }
    }

    // 4. Plain text
    const rawPart = part.trim()
    const isReq = rawPart.endsWith("*") || existing?.required || false
    const label = isReq ? rawPart.replace(/\*$/, "").trim() : rawPart
    return {
      id,
      label,
      type: "text",
      required: isReq
    }
  })
}

function serializeFields(items: FormFieldItem[]): string {
  return items
    .map((item) => {
      const raw = item.label ? item.label.trim() : ""
      const clean = raw.replace(/\*$/, "")
      const reqMark = item.required ? "*" : ""
      const lbl = clean ? `${clean}${reqMark}` : (raw ? raw : "")

      if (item.type === "multi-select") {
        const opts = item.options?.trim() || "Option 1, Option 2"
        return `${lbl}:multi-select[${opts}]`
      }
      if (item.type === "select") {
        const opts = item.options?.trim() || "Option 1, Option 2"
        return `${lbl}:select[${opts}]`
      }
      if (item.type !== "text") {
        return `${lbl}:${item.type}`
      }
      // When type is text and label is empty (e.g. user selected all and hit backspace),
      // serialize as ":text" so the field is NOT dropped or destroyed!
      if (!lbl) {
        return ":text"
      }
      return lbl
    })
    .join(", ")
}



export const HumanFormFieldsBuilder: React.FC<HumanFormFieldsBuilderProps> = ({
  value,
  onChange
}) => {
  const [fields, setFields] = useState<FormFieldItem[]>(() => parseRawFields(value))
  const [rawMode, setRawMode] = useState(false)
  const [internalRaw, setInternalRaw] = useState(value)
  const lastEmittedRef = useRef<string>(value)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<FormFieldItem | null>(null)

  // Synchronize ONLY when value changes externally (not from our own keystrokes/updates)
  useEffect(() => {
    if (value === lastEmittedRef.current) {
      return
    }
    lastEmittedRef.current = value
    setInternalRaw(value)
    setFields((prev) => parseRawFields(value, prev))
  }, [value])

  const notifyChange = (updated: FormFieldItem[]) => {
    setFields(updated)
    const serialized = serializeFields(updated)
    lastEmittedRef.current = serialized
    setInternalRaw(serialized)
    onChange(serialized)
  }

  // Open modal to add a new blank field
  const handleOpenAddModal = () => {
    setEditingField(null)
    setModalOpen(true)
  }

  // Open modal to edit an existing field
  const handleOpenEditModal = (field: FormFieldItem) => {
    setEditingField(field)
    setModalOpen(true)
  }

  // Save from modal (handles both add and edit)
  const handleSaveModalField = (savedField: FormFieldItem) => {
    if (editingField) {
      const copy = fields.map((f) => (f.id === savedField.id ? savedField : f))
      notifyChange(copy)
    } else {
      notifyChange([...fields, savedField])
    }
  }

  // Add a blank custom field (fallback quick add)
  const handleAddCustomField = () => {
    handleOpenAddModal()
  }

  // Update a field's label
  const handleUpdateLabel = (index: number, newLabel: string) => {
    const copy = [...fields]
    copy[index] = { ...copy[index], label: newLabel }
    notifyChange(copy)
  }

  // Update a field's data type
  const handleUpdateType = (index: number, newType: string) => {
    const copy = [...fields]
    const updatedType = newType as FormFieldItem["type"]
    const needsOptions = updatedType === "select" || updatedType === "multi-select"
    copy[index] = {
      ...copy[index],
      type: updatedType,
      options: needsOptions ? (copy[index].options || "Option 1, Option 2, Option 3") : undefined
    }
    notifyChange(copy)
  }

  // Update dropdown options
  const handleUpdateOptions = (index: number, newOptions: string) => {
    const copy = [...fields]
    copy[index] = { ...copy[index], options: newOptions }
    notifyChange(copy)
  }

  // Delete a field
  const handleDeleteField = (index: number) => {
    const copy = fields.filter((_, i) => i !== index)
    notifyChange(copy)
  }

  // Count summary by type
  const typeSummary = useMemo(() => {
    const counts: Record<string, number> = {}
    fields.forEach((f) => {
      counts[f.type] = (counts[f.type] || 0) + 1
    })
    return Object.entries(counts)
      .map(([t, count]) => `${count} ${t.charAt(0).toUpperCase() + t.slice(1)}`)
      .join(", ")
  }, [fields])

  return (
    <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
      {/* Header and Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <ListPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Interactive Form Field Builder
          </span>
          <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-bold px-1.5 py-0.5 rounded-full">
            {fields.length} Field{fields.length === 1 ? "" : "s"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setRawMode(!rawMode)}
          className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 cursor-pointer transition-colors"
          title="Toggle between Interactive Field Cards and Raw Text string"
        >
          {rawMode ? (
            <>
              <Eye className="h-3 w-3" />
              <span>Card View</span>
            </>
          ) : (
            <>
              <Code2 className="h-3 w-3" />
              <span>Raw Text</span>
            </>
          )}
        </button>
      </div>

      {rawMode ? (
        /* Raw String View (For copy-pasting or manual editing) */
        <div className="space-y-1.5">
          <textarea
            rows={3}
            value={internalRaw}
            onChange={(e) => {
              const val = e.target.value
              setInternalRaw(val)
              lastEmittedRef.current = val
              setFields((prev) => parseRawFields(val, prev))
              onChange(val)
            }}
            placeholder="Field 1, Field 2:date, Field 3:select[A, B], Field 4:multi-select[X, Y]..."
            className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
          />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Edit string directly. Syntax: <code>FieldName:select[A, B]</code>, <code>FieldName:multi-select[X, Y]</code>, <code>FieldName:date</code>.
          </p>
        </div>
      ) : (
        /* Interactive Cards View with Dropdowns */
        <div className="space-y-3">
          {/* Configured Fields List */}
          <div className="space-y-2">
            {fields.length === 0 && (
              <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <p className="font-semibold text-slate-600 dark:text-slate-300">No form fields configured yet.</p>
                <p className="text-[11px]">Click &ldquo;+ Add Blank Field&rdquo; below to configure fields.</p>
              </div>
            )}
            {fields.map((f, index) => (
              <div
                key={f.id || index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-2.5 shadow-2xs transition-all flex items-center space-x-2"
              >
                {/* Field Index Badge */}
                <span className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                  #{index + 1}
                </span>

                {/* Field Label Input */}
                <div className="flex-1">
                  <Input
                    value={f.label}
                    onChange={(e) => handleUpdateLabel(index, e.target.value)}
                    placeholder="Field Label (e.g. Priority or Tags)"
                    className="h-8 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Field Data Type Dropdown */}
                <div className="w-[190px] shrink-0">
                  <Select
                    value={f.type}
                    onChange={(e) => handleUpdateType(index, e.target.value)}
                    options={FIELD_TYPE_OPTIONS}
                    className="h-8 text-xs font-medium text-slate-800 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Edit / Configure in Modal Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(f)}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Configure field details and options in modal"
                >
                  <Sliders className="h-3.5 w-3.5" />
                </button>

                {/* Delete Field Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteField(index)}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete this field"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Field Button & Summary */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Blank Field</span>
            </button>

            {typeSummary && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {typeSummary}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Reusable Expandable Modal for Adding / Editing Form Fields */}
      <FormFieldModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModalField}
        initialField={editingField}
        existingCount={fields.length}
      />
    </div>
  )
}

export default HumanFormFieldsBuilder
