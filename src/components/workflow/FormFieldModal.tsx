"use client"

import React, { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FormFieldItem } from "./HumanFormFieldsBuilder"
import { Info, X, Plus } from "lucide-react"

export interface FormFieldModalProps {
  open: boolean
  onClose: () => void
  onSave: (field: FormFieldItem) => void
  initialField?: FormFieldItem | null
  existingCount?: number
}

const TYPE_OPTIONS = [
  { value: "text", label: "Short text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Paragraph text" },
  { value: "select", label: "Category - Single select" },
  { value: "multi-select", label: "Category - Multi select" },
  { value: "boolean", label: "Checkbox" },
  { value: "file", label: "File upload" }
]

export const FormFieldModal: React.FC<FormFieldModalProps> = ({
  open,
  onClose,
  onSave,
  initialField,
  existingCount = 0
}) => {
  const [name, setName] = useState("")
  const [type, setType] = useState<FormFieldItem["type"]>("multi-select")
  const [choices, setChoices] = useState<string[]>(["Option 1"])
  const [isRequired, setIsRequired] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialField) {
        setName(initialField.label.replace(/\*$/, "") || "")
        setType(initialField.type || "text")
        setIsRequired(Boolean(initialField.required || initialField.label.endsWith("*")))

        if (initialField.options) {
          const parsed = initialField.options.split(",").map((o) => o.trim()).filter(Boolean)
          setChoices(parsed.length > 0 ? parsed : ["Option 1"])
        } else {
          setChoices(["Option 1"])
        }
      } else {
        setName("")
        setType("multi-select")
        setChoices(["Option 1"])
        setIsRequired(false)
      }
      setError(null)
    }
  }, [open, initialField])

  const handleUpdateChoice = (index: number, val: string) => {
    const updated = [...choices]
    updated[index] = val
    setChoices(updated)
  }

  const handleAddChoice = () => {
    setChoices((prev) => [...prev, `Option ${prev.length + 1}`])
  }

  const handleRemoveChoice = (index: number) => {
    if (choices.length <= 1) return
    setChoices((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Data input name is required.")
      return
    }

    const isCategory = type === "select" || type === "multi-select"
    const validChoices = choices.map((c) => c.trim()).filter(Boolean)
    const optionsString = isCategory
      ? (validChoices.length > 0 ? validChoices.join(", ") : "Option 1")
      : undefined

    const field: FormFieldItem = {
      id: initialField?.id || `fld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      label: trimmed,
      type,
      options: optionsString,
      required: isRequired
    }

    onSave(field)
    onClose()
  }

  const isCategoryType = type === "select" || type === "multi-select"

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title=""
      canExpand={true}
      isExpanded={isExpanded}
      onToggleExpand={setIsExpanded}
      standardWidthClassName="max-w-[420px]"
      expandedWidthClassName="max-w-[620px]"
      className="p-5"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Data input name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <span>Data input name</span>
            <span className="text-amber-600 ml-0.5">*</span>
            <span
              className="inline-flex items-center justify-center ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help"
              title="Label displayed on the form for this data input"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </label>
          <Input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Enter field name"
            className={`h-10 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
              error ? "border-red-400 ring-1 ring-red-300" : ""
            }`}
          />
          {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
        </div>

        {/* Data input type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <span>Data input type</span>
            <span className="text-amber-600 ml-0.5">*</span>
            <span
              className="inline-flex items-center justify-center ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help"
              title="Type of input control shown on the form"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as FormFieldItem["type"])}
            options={TYPE_OPTIONS}
            className="h-10 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 rounded-lg"
          />
        </div>

        {/* Categories (Conditional for Single Select & Multi Select) */}
        {isCategoryType && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center">
              <span>Categories</span>
              <span className="text-amber-600 ml-0.5">*</span>
              <span
                className="inline-flex items-center justify-center ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help"
                title="Options for respondents to choose from"
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {choices.map((choice, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Input
                    value={choice}
                    onChange={(e) => handleUpdateChoice(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="h-10 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 rounded-lg flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveChoice(idx)}
                    disabled={choices.length <= 1}
                    className="h-10 w-10 shrink-0 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Remove option"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddChoice}
              className="mt-1 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1 stroke-[2.5]" />
              <span>Add choice</span>
            </Button>
          </div>
        )}

        {/* Is this data input required? */}
        <div className="flex items-center justify-between pt-1">
          <label
            onClick={() => setIsRequired(!isRequired)}
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center cursor-pointer select-none"
          >
            <span>Is this data input required?</span>
            <span className="text-amber-600 ml-0.5">*</span>
            <span
              className="inline-flex items-center justify-center ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help"
              title="Requires respondent to provide a value before submitting"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </label>
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Bottom Actions: Cancel (Outline) & Save (Primary) */}
        <div className="flex items-center justify-end space-x-2 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!name.trim()}
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default FormFieldModal
