"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  WorkflowTemplateCard,
  WorkflowTemplateCardItem
} from "@/components/templates/WorkflowTemplateCard"
import { cn } from "@/lib/utils"

export interface WorkflowCategorySectionProps {
  title: string
  templates: WorkflowTemplateCardItem[]
  onSelectTemplate: (template: WorkflowTemplateCardItem) => void
  onViewAll?: (categoryTitle: string) => void
}

export function WorkflowCategorySection({
  title,
  templates,
  onSelectTemplate,
  onViewAll
}: WorkflowCategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const timer = setTimeout(checkScroll, 100)
    window.addEventListener("resize", checkScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkScroll)
    }
  }, [templates, checkScroll])

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const offset = direction === "left" ? -340 : 340
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" })
    setTimeout(checkScroll, 350)
  }

  if (!templates || templates.length === 0) return null

  return (
    <section className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h2>

        <div className="flex items-center space-x-1.5">
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewAll(title)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 h-7 px-2.5 mr-1"
            >
              View all
            </Button>
          )}

          {/* Navigation Arrows using Design System Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 shadow-2xs disabled:opacity-30 disabled:pointer-events-none transition-opacity"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 shadow-2xs disabled:opacity-30 disabled:pointer-events-none transition-opacity"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards Row Container with Side Blur / Fade Effects */}
      <div className="relative">
        {/* Left Blur & Fade Edge (Activates on scroll) */}
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 md:w-28 z-10 transition-opacity duration-300",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Color Gradient Overlay for Light and Dark Modes */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent" />
          {/* Real Backdrop Blur Layer with Alpha Gradient Mask */}
          <div
            className="absolute inset-0 backdrop-blur-[6px]"
            style={{
              WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
              maskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)"
            }}
          />
        </div>

        {/* Right Blur & Fade Edge (Activates when more content is available to scroll) */}
        <div
          className={cn(
            "pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-36 z-10 transition-opacity duration-300",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Color Gradient Overlay for Light and Dark Modes */}
          <div className="absolute inset-0 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent" />
          {/* Real Backdrop Blur Layer with Alpha Gradient Mask */}
          <div
            className="absolute inset-0 backdrop-blur-[6px]"
            style={{
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
              maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)"
            }}
          />
        </div>

        {/* Cards Row (Horizontally scrollable with smooth scroll & edge padding) */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-stretch space-x-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {templates.map((tpl) => (
            <WorkflowTemplateCard
              key={tpl.id}
              template={tpl}
              onClick={onSelectTemplate}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
