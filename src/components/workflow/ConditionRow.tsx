"use client"

import * as React from "react"
import { Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { VariablePillInput } from "@/components/workflow/VariablePillInput"

export interface PriorVariableOption {
  token: string
  label: string
  stepNumber: number
  appName: string
  sampleValue: string
}

export interface ConditionRowProps {
  id?: string
  field: string
  operator: string
  value: string
  priorVariables: PriorVariableOption[]
  onFieldChange: (field: string) => void
  onOperatorChange: (op: string) => void
  onValueChange: (val: string) => void
  onDelete?: () => void
  onOpenLabelPicker?: () => void
  onOpenVariablePicker?: () => void
}

export const FILTER_OPERATOR_OPTIONS = [
  { value: "equals", label: "Equal to" },
  { value: "not_equals", label: "Does not equal to" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "gt", label: "Greater than (>)" },
  { value: "lt", label: "Less than (<)" },
  { value: "gte", label: "Greater than or equal (>=)" },
  { value: "lte", label: "Less than or equal (<=)" },
  { value: "is_empty", label: "Is empty" },
  { value: "not_empty", label: "Is not empty" }
]

export function ConditionRow({
  field,
  operator = "equals",
  value = "",
  priorVariables = [],
  onFieldChange,
  onOperatorChange,
  onValueChange,
  onDelete,
  onOpenLabelPicker,
  onOpenVariablePicker,
}: ConditionRowProps) {
  const matchedVar = priorVariables.find((v) => v.token === field)
  const displayLabel = matchedVar
    ? `${matchedVar.stepNumber}. ${matchedVar.label}${matchedVar.sampleValue ? ` : ${matchedVar.sampleValue}` : ""}`
    : field || ""

  return (
    <div className="flex items-end space-x-2.5 w-full bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-all">
      {/* 1. Choose Label Box using app standard input styling */}
      <div className="flex-1 min-w-[140px] space-y-1">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1 select-none">
          <span>Choose Label</span>
          <span className="text-red-500 font-bold">*</span>
        </label>
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenLabelPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "/") {
              e.preventDefault()
              onOpenLabelPicker?.()
            }
          }}
          className="relative flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer group select-none"
          title="Click or press / to choose variable from previous step"
        >
          {matchedVar ? (
            <div className="flex items-center space-x-1.5 min-w-0 pr-1">
              <span className="inline-flex items-center text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60 shrink-0">
                {matchedVar.stepNumber}. {matchedVar.label}
              </span>
              {matchedVar.sampleValue && (
                <span className="text-slate-500 dark:text-slate-400 truncate text-[11px] font-normal">
                  : {matchedVar.sampleValue}
                </span>
              )}
            </div>
          ) : displayLabel ? (
            <span className="inline-flex items-center text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60 truncate">
              {displayLabel}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-normal text-xs truncate">
              Select variable...
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0 ml-1" />
        </div>
      </div>

      {/* 2. Filter Type Dropdown using already built Select component */}
      <div className="w-[155px] shrink-0 space-y-1">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block select-none">
          Filter Type
        </label>
        <Select
          value={operator}
          onValueChange={onOperatorChange}
          options={FILTER_OPERATOR_OPTIONS}
          className="h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs"
        />
      </div>

      {/* 3. Value Input using already built VariablePillInput component */}
      <div className="flex-1 min-w-[150px] space-y-1">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block select-none">
          Value
        </label>
        <VariablePillInput
          value={value}
          onChange={onValueChange}
          placeholder="Value or press /"
          supportsMapping={true}
          showPressSlashButton={true}
          multiline={false}
          minHeight="min-h-[36px]"
          className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium shadow-2xs"
          onOpenVariablePicker={onOpenVariablePicker}
        />
      </div>

      {/* 4. Delete Condition Action Button using already built Button component */}
      {onDelete && (
        <div className="shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-9 w-9 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl cursor-pointer"
            title="Delete condition"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
