"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowUp, Check, Calendar, Mic, X, Loader2 } from "lucide-react"
import { AppIcon } from "@/components/ui/app-icon"
import { useTheme } from "@/context/ThemeContext"

const PROMPT_TEXT = "When an invoice arrives in Gmail, extract data with AI and log to Google Sheets"

export function WorkflowBuilderShowcase() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const wireBaseStroke = isDark ? "rgba(255,255,255,0.14)" : "rgba(100,116,139,0.32)"
  const handleInactiveFill = isDark ? "#18181b" : "#E2E8F0"
  const handleInactiveStroke = isDark ? "#52525b" : "#94A3B8"

  // Animation Phases:
  // 0: Typing prompt in bottom bar (0.0s - 1.4s)
  // 1: Mouse cursor glides in & clicks "Start building" (1.4s - 2.0s)
  // 2: Electric surge builds nodes sequentially on canvas (2.0s - 3.1s)
  // 3: Active running state with glowing streaming energy (3.1s - 8.5s)
  const [phase, setPhase] = useState<number>(0)
  const [typedChars, setTypedChars] = useState<number>(0)
  const [isClicking, setIsClicking] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(0)

  // Refs for tracking layout coordinates and responsive scaling
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number>(1)
  const [offsetY, setOffsetY] = useState<number>(210)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        // Base canvas coordinate width: 760px
        const calculatedScale = Math.min(1.0, Math.max(0.65, (w - 10) / 760))
        setScale(calculatedScale)
      }

      if (containerRef.current && bottomRef.current) {
        const canvasRect = containerRef.current.getBoundingClientRect()
        const bottomRect = bottomRef.current.getBoundingClientRect()
        const canvasCenterY = canvasRect.top + canvasRect.height / 2
        const bottomCenterY = bottomRect.top + bottomRect.height / 2
        const diff = bottomCenterY - canvasCenterY
        if (diff > 40) {
          setOffsetY(diff)
        }
      }
    }

    updateDimensions()
    const timer = setTimeout(updateDimensions, 80)
    const ro = new ResizeObserver(updateDimensions)
    if (containerRef.current) ro.observe(containerRef.current)
    if (bottomRef.current) ro.observe(bottomRef.current)
    window.addEventListener("resize", updateDimensions)

    return () => {
      clearTimeout(timer)
      ro.disconnect()
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (phase === 0) {
      setActiveStep(0)
      setIsClicking(false)
      if (typedChars === 0) {
        timer = setTimeout(() => {
          setTypedChars(1)
        }, 650)
      } else if (typedChars < PROMPT_TEXT.length) {
        timer = setTimeout(() => {
          setTypedChars((prev) => prev + 1)
        }, 18)
      } else {
        timer = setTimeout(() => setPhase(1), 380)
      }
    } else if (phase === 1) {
      timer = setTimeout(() => {
        setIsClicking(true)
        timer = setTimeout(() => {
          setPhase(2)
        }, 220)
      }, 500)
    } else if (phase === 2) {
      // The AI card glides down smoothly; nodes appear sequentially
      const t1 = setTimeout(() => setActiveStep(1), 200) // Gmail appears
      const t2 = setTimeout(() => setActiveStep(2), 520) // AI Agent appears & wire illuminates
      const t3 = setTimeout(() => setActiveStep(3), 850) // Router appears & wire branches
      const t4 = setTimeout(() => setActiveStep(4), 1180) // Sheets & Calendar appear, cards slide in
      const t5 = setTimeout(() => setPhase(3), 1650) // Streaming active running state begins

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
        clearTimeout(t5)
      }
    } else if (phase === 3) {
      timer = setTimeout(() => {
        setActiveStep(0)
        setTypedChars(0)
        setPhase(0)
      }, 7000)
    }

    return () => clearTimeout(timer)
  }, [phase, typedChars])

  const currentDisplayPrompt = PROMPT_TEXT.slice(0, typedChars)
  const isWorkflowActive = phase === 3 || activeStep >= 1

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden rounded-r-3xl lg:rounded-r-[32px] bg-slate-100/90 dark:bg-[#151518] text-slate-900 dark:text-white p-6 md:p-8 lg:p-10 select-none transition-colors duration-300">
      {/* Background Dot Grid (Pure Neutral Monochrome) */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${isDark ? "opacity-[0.24]" : "opacity-[0.28]"}`}
          style={{
            backgroundImage: isDark
              ? `radial-gradient(rgba(255, 255, 255, 0.36) 1px, transparent 1px)`
              : `radial-gradient(rgba(71, 85, 105, 0.35) 1px, transparent 1px)`,
            backgroundSize: "22px 22px"
          }}
        />
      </div>

      {/* Unified Column Container: Header, Workflow Canvas, and Bottom AI Card all align along the same vertical axis */}
      <div className="relative z-10 w-full max-w-[760px] mx-auto flex flex-col justify-between h-full my-auto">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER: Large, Bold & Prominent */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 w-full shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold tracking-wide uppercase shadow-2xs transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span>Discover Automate AI Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px] font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-snug transition-colors">
            Build workflows by simply describing them
          </h2>

          <p className="text-xs sm:text-sm md:text-[14.5px] text-slate-600 dark:text-slate-400 font-normal leading-relaxed transition-colors">
            Watch natural language transform into multi-step automations with real app integrations and conditional routing in real time.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. UPPER/MIDDLE: THE WORKFLOW GRAPH CANVAS (760 x 270 COORDINATE GRID) */}
        {/* ========================================================================= */}
        <div ref={containerRef} className="w-full flex items-center justify-start overflow-visible my-auto py-2">
          <div
            style={{
              width: 760 * scale,
              height: 270 * scale,
            }}
            className="relative overflow-visible shrink-0"
          >
            <div
              style={{
                width: 760,
                height: 270,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="absolute top-0 left-0 select-none pointer-events-none"
            >
              {/* SVG LAYER: Connecting Wires, Handles & Glowing Energy Pulses */}
              <svg
                viewBox="0 0 760 270"
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-25"
              >
                <defs>
                  <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-blue" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* WIRE 1: Gmail (56, 135) -> AI (145, 135) */}
                {activeStep >= 2 && (
                  <>
                    <line x1="56" y1="135" x2="145" y2="135" stroke={wireBaseStroke} strokeWidth="2.8" strokeDasharray="4 4" />
                    <motion.line
                      x1="56"
                      y1="135"
                      x2="145"
                      y2="135"
                      stroke="#10B981"
                      strokeWidth="2.8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                    <circle r="4.5" fill="#34D399" filter="url(#glow-emerald)">
                      <animateMotion path="M 56 135 L 145 135" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* WIRE 2: AI (201, 135) -> Router (290, 135) */}
                {activeStep >= 3 && (
                  <>
                    <line x1="201" y1="135" x2="290" y2="135" stroke={wireBaseStroke} strokeWidth="2.8" strokeDasharray="4 4" />
                    <motion.line
                      x1="201"
                      y1="135"
                      x2="290"
                      y2="135"
                      stroke="#8B5CF6"
                      strokeWidth="2.8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                    <circle r="4.5" fill="#C084FC" filter="url(#glow-purple)">
                      <animateMotion path="M 201 135 L 290 135" dur="1.2s" repeatCount="indefinite" begin="0.25s" />
                    </circle>
                  </>
                )}

                {/* WIRE 3: Router (346, 135) -> Sheets (430, 65) */}
                {activeStep >= 4 && (
                  <>
                    <path d="M 346 135 C 398 135, 383 65, 430 65" fill="none" stroke={wireBaseStroke} strokeWidth="2.8" strokeDasharray="4 4" />
                    <motion.path
                      d="M 346 135 C 398 135, 383 65, 430 65"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    />
                    <circle r="4.5" fill="#34D399" filter="url(#glow-emerald)">
                      <animateMotion path="M 346 135 C 398 135, 383 65, 430 65" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                    </circle>
                  </>
                )}

                {/* WIRE 4: Router (346, 135) -> Calendar (430, 205) */}
                {activeStep >= 4 && (
                  <>
                    <path d="M 346 135 C 398 135, 383 205, 430 205" fill="none" stroke={wireBaseStroke} strokeWidth="2.8" strokeDasharray="4 4" />
                    <motion.path
                      d="M 346 135 C 398 135, 383 205, 430 205"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    />
                    <circle r="4.5" fill="#60A5FA" filter="url(#glow-blue)">
                      <animateMotion path="M 346 135 C 398 135, 383 205, 430 205" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                    </circle>
                  </>
                )}

                {/* WIRE 5: Sheets (486, 65) -> Table Card (525, 65) */}
                {activeStep >= 4 && (
                  <>
                    <line x1="486" y1="65" x2="525" y2="65" stroke={wireBaseStroke} strokeWidth="2.4" strokeDasharray="3 3" />
                    <motion.line
                      x1="486"
                      y1="65"
                      x2="525"
                      y2="65"
                      stroke="#10B981"
                      strokeWidth="2.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
                    />
                    <circle r="4" fill="#34D399" filter="url(#glow-emerald)">
                      <animateMotion path="M 486 65 L 525 65" dur="0.8s" repeatCount="indefinite" begin="0.8s" />
                    </circle>
                  </>
                )}

                {/* WIRE 6: Calendar (486, 205) -> Event Card (525, 205) */}
                {activeStep >= 4 && (
                  <>
                    <line x1="486" y1="205" x2="525" y2="205" stroke={wireBaseStroke} strokeWidth="2.4" strokeDasharray="3 3" />
                    <motion.line
                      x1="486"
                      y1="205"
                      x2="525"
                      y2="205"
                      stroke="#3B82F6"
                      strokeWidth="2.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
                    />
                    <circle r="4" fill="#60A5FA" filter="url(#glow-blue)">
                      <animateMotion path="M 486 205 L 525 205" dur="0.8s" repeatCount="indefinite" begin="0.8s" />
                    </circle>
                  </>
                )}

                {/* CONTACT HANDLE DOTS */}
                {/* Gmail Output */}
                {activeStep >= 1 && (
                  <circle cx="56" cy="135" r="4.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.8" />
                )}
                
                {/* AI Input & Output */}
                {activeStep >= 2 && (
                  <>
                    <circle cx="145" cy="135" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="201" cy="135" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" />
                  </>
                )}
                
                {/* Router Input & Output */}
                {activeStep >= 3 && (
                  <>
                    <circle cx="290" cy="135" r="4.5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="346" cy="135" r="4.5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.8" />
                  </>
                )}
                
                {/* Sheets Input & Output */}
                {activeStep >= 4 && (
                  <>
                    <circle cx="430" cy="65" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="486" cy="65" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="525" cy="65" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  </>
                )}

                {/* Calendar Input & Output */}
                {activeStep >= 4 && (
                  <>
                    <circle cx="430" cy="205" r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="486" cy="205" r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="525" cy="205" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                  </>
                )}
              </svg>

              {/* HTML NODES LAYER (PROMINENT 56px NODES) */}

              {/* NODE 1: GMAIL TRIGGER -> Left Edge: 0, Top: 135 */}
              <div
                className="absolute pointer-events-none z-20"
                style={{ left: 0, top: 135, transform: "translateY(-28px)" }}
              >
                <motion.div
                  initial={false}
                  animate={activeStep >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
                  transition={{ type: "spring", damping: 20, stiffness: 280 }}
                  style={{ transformOrigin: "28px 28px" }}
                  className="flex flex-col items-start"
                >
                  {/* Floating Badge (Above Gmail, Aligned Flush Left with Icon) */}
                  <AnimatePresence>
                    {(phase === 3 || activeStep >= 1) && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: [0, -4, 0], scale: 1 }}
                        transition={{
                          opacity: { duration: 0.25 },
                          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute -top-14 left-0 z-30 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/95 dark:bg-[#121215]/95 border border-red-200 dark:border-red-500/30 shadow-lg dark:shadow-xl backdrop-blur-md whitespace-nowrap"
                      >
                        <div className="w-5 h-5 rounded-md bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                          <AppIcon appId="gmail" size={13} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Invoice received</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Subject: INV-2024-047</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121215] border-2 flex items-center justify-center p-2.5 shadow-md dark:shadow-lg transition-colors duration-300 border-red-500/90 shadow-red-500/25">
                    <AppIcon appId="gmail" size={28} />
                  </div>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-2 text-left leading-tight whitespace-nowrap">Invoice received</span>
                  <span className="text-[9.5px] text-slate-500 uppercase tracking-wider font-bold text-left">TRIGGER</span>
                </motion.div>
              </div>

              {/* NODE 2: AI AGENT -> Center: (173, 135) */}
              <div
                className="absolute pointer-events-none z-20"
                style={{ left: 173, top: 135, transform: "translate(-50%, -28px)" }}
              >
                <motion.div
                  initial={false}
                  animate={activeStep >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
                  transition={{ type: "spring", damping: 20, stiffness: 280 }}
                  style={{ transformOrigin: "center 28px" }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121215] border-2 flex items-center justify-center p-2.5 shadow-md dark:shadow-lg transition-colors duration-300 border-emerald-500/90 shadow-emerald-500/30">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-wider">AI</span>
                  </div>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-2 text-center leading-tight whitespace-nowrap">Extract & check</span>
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400/90 uppercase tracking-wider font-bold">AI AGENT</span>
                </motion.div>
              </div>

              {/* NODE 3: ROUTER -> Center: (318, 135) */}
              <div
                className="absolute pointer-events-none z-20"
                style={{ left: 318, top: 135, transform: "translate(-50%, -28px)" }}
              >
                <motion.div
                  initial={false}
                  animate={activeStep >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
                  transition={{ type: "spring", damping: 20, stiffness: 280 }}
                  style={{ transformOrigin: "center 28px" }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121215] border-2 flex items-center justify-center p-2.5 shadow-md dark:shadow-lg transition-colors duration-300 border-purple-500/90 shadow-purple-500/30">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="18" r="2" fill="currentColor" />
                      <circle cx="18" cy="6" r="2" fill="currentColor" />
                      <circle cx="18" cy="18" r="2" fill="currentColor" />
                      <path d="M8 18h4a4 4 0 004-4V8" />
                      <path d="M8 18h8" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-2 text-center leading-tight whitespace-nowrap">Discrepancy?</span>
                  <span className="text-[9.5px] text-purple-600 dark:text-purple-400/90 uppercase tracking-wider font-bold">BRANCH</span>
                </motion.div>
              </div>

              {/* NODE 4: GOOGLE SHEETS -> Center: (458, 65) */}
              <div
                className="absolute pointer-events-none z-20"
                style={{ left: 458, top: 65, transform: "translate(-50%, -28px)" }}
              >
                <motion.div
                  initial={false}
                  animate={activeStep >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
                  transition={{ type: "spring", damping: 20, stiffness: 280 }}
                  style={{ transformOrigin: "center 28px" }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121215] border-2 flex items-center justify-center p-2.5 shadow-md transition-colors duration-300 border-emerald-500/90 shadow-emerald-500/30">
                    <AppIcon appId="googlesheets" size={26} />
                  </div>
                  <span className="text-[11.5px] text-slate-800 dark:text-slate-200 font-semibold mt-1.5 text-center whitespace-nowrap">Flag invoice</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">Google Sheets</span>
                </motion.div>
              </div>

              {/* FLOATING SPREADSHEET TABLE CARD -> Left: 525px, Top: 65px */}
              <div
                className="absolute z-30 pointer-events-none"
                style={{ left: 525, top: 65, transform: "translateY(-50%)" }}
              >
                <AnimatePresence>
                  {(phase === 3 || activeStep >= 4) && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="w-[235px] min-w-[235px] rounded-xl bg-white/95 dark:bg-[#121215]/95 border border-emerald-300 dark:border-emerald-500/40 p-3 shadow-xl dark:shadow-2xl backdrop-blur-md select-none"
                    >
                      <div className="grid grid-cols-[88px_50px_1fr] gap-1 pb-1.5 mb-1.5 border-b border-slate-200 dark:border-white/10 font-bold text-slate-500 dark:text-slate-400 text-[9.5px] uppercase tracking-wider whitespace-nowrap">
                        <span>Invoice</span>
                        <span>Date</span>
                        <span className="text-right">Discrepa...</span>
                      </div>

                      <div className="space-y-1.5 font-medium whitespace-nowrap">
                        <div className="grid grid-cols-[88px_50px_1fr] gap-1 items-center">
                          <span className="font-mono text-slate-700 dark:text-slate-300 text-[10.5px]">INV-2024-045</span>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px]">May 14</span>
                          <span className="text-slate-400 dark:text-slate-500 text-right text-[10.5px] pr-1">—</span>
                        </div>
                        <div className="grid grid-cols-[88px_50px_1fr] gap-1 items-center">
                          <span className="font-mono text-slate-700 dark:text-slate-300 text-[10.5px]">INV-2024-046</span>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px]">May 21</span>
                          <span className="text-slate-400 dark:text-slate-500 text-right text-[10.5px] pr-1">—</span>
                        </div>
                        <div className="grid grid-cols-[88px_50px_1fr] gap-1 items-center text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-transparent px-1.5 py-1 rounded">
                          <span className="font-mono text-[10.5px]">INV-2024-047</span>
                          <span className="text-[10px]">May 29</span>
                          <span className="text-right flex justify-end items-center text-emerald-600 dark:text-emerald-400 pr-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* NODE 5: GOOGLE CALENDAR -> Center: (458, 205) */}
              <div
                className="absolute pointer-events-none z-20"
                style={{ left: 458, top: 205, transform: "translate(-50%, -28px)" }}
              >
                <motion.div
                  initial={false}
                  animate={activeStep >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
                  transition={{ type: "spring", damping: 20, stiffness: 280 }}
                  style={{ transformOrigin: "center 28px" }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121215] border-2 flex items-center justify-center p-2.5 shadow-md transition-colors duration-300 border-blue-500/90 shadow-blue-500/30">
                    <AppIcon appId="googlecalendar" size={26} />
                  </div>
                  <span className="text-[11.5px] text-slate-800 dark:text-slate-200 font-semibold mt-1.5 text-center whitespace-nowrap">Add to Calendar</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">Google Calendar</span>
                </motion.div>
              </div>

              {/* FLOATING EVENT PREVIEW CARD -> Left: 525px, Top: 205px */}
              <div
                className="absolute z-30 pointer-events-none"
                style={{ left: 525, top: 205, transform: "translateY(-50%)" }}
              >
                <AnimatePresence>
                  {(phase === 3 || activeStep >= 4) && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                      className="w-[215px] min-w-[215px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/95 dark:bg-[#121215]/95 border border-blue-200 dark:border-blue-500/40 shadow-xl backdrop-blur-md whitespace-nowrap"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-tight">Event created</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Payment due · Jun 15</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DOWNSIDE (BELOW): THE CANVAS FLOATING AI BUILDER UI (THEME-ADAPTIVE) */}
        {/* ========================================================================= */}
        <div ref={bottomRef} className="relative z-20 w-full pt-1.5 pb-1 shrink-0">
        <motion.div
          animate={{
            y: phase >= 2 ? 0 : -offsetY,
            scale: phase >= 2 ? 1 : 1.03,
          }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative group z-30"
        >
          {/* Ambient Diffused Outer Glow */}
          <div className="absolute -inset-[3px] rounded-[22px] ai-ambient-gradient opacity-35 dark:opacity-60 blur-md pointer-events-none transition-opacity duration-500" />

          {/* Animated Colorful Border Ring Along the Sides */}
          <div className="absolute -inset-[1.5px] rounded-[18px] ai-ambient-gradient opacity-60 dark:opacity-85 pointer-events-none transition-opacity duration-500" />

          {/* Main Card Surface - Adapts to Light / Dark Mode Seamlessly */}
          <div className="relative z-20 bg-white/95 dark:bg-[#121215]/95 border border-slate-200/80 dark:border-zinc-800 backdrop-blur-xl shadow-xl dark:shadow-2xl rounded-2xl p-4 sm:p-5 transition-colors duration-300">
            {/* Prompt Text Input Area showing simulated typing */}
            <div className="min-h-[56px] text-sm sm:text-base md:text-[16px] text-slate-900 dark:text-slate-100 font-normal leading-relaxed flex items-start">
              {currentDisplayPrompt ? (
                <span>
                  {currentDisplayPrompt}
                  {phase === 0 && (
                    <span className="inline-block w-2 h-4.5 ml-0.5 bg-blue-600 dark:bg-blue-400 animate-pulse align-middle" />
                  )}
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  Describe what you want to automate...
                  <span className="inline-block w-2 h-4.5 bg-blue-600 dark:bg-blue-400 animate-pulse" />
                </span>
              )}
            </div>

            {/* Bottom Toolbar Row */}
            <div className="flex items-center justify-between pt-3 mt-1.5 border-t border-slate-200/90 dark:border-white/10 transition-colors">
              {/* Left: Microphone */}
              <div
                className="h-8.5 w-8.5 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="Voice input"
              >
                <Mic className="h-4.5 w-4.5" />
              </div>

              {/* Right: Start Building Button + Dismiss */}
              <div className="relative flex items-center space-x-2">
                <motion.button
                  onClick={() => {
                    if (phase < 2) {
                      setTypedChars(PROMPT_TEXT.length)
                      setIsClicking(true)
                      setTimeout(() => setPhase(2), 150)
                    }
                  }}
                  animate={isClicking ? { scale: 0.92 } : { scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${
                    phase === 2
                      ? "bg-blue-600 text-white shadow-blue-500/30 ring-2 ring-blue-400/50"
                      : phase === 3
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
                      : currentDisplayPrompt
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {phase === 2 ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Building workflow...</span>
                    </>
                  ) : phase === 3 ? (
                    <>
                      <Check className="h-4 w-4 text-white" />
                      <span>Built on Canvas!</span>
                    </>
                  ) : (
                    <>
                      <span>Start building</span>
                      <ArrowUp className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                <div className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors">
                  <X className="h-4 w-4" />
                </div>

                {/* ANIMATED MOUSE CURSOR: Glides in during Phase 1 and clicks the button */}
                <AnimatePresence>
                  {phase === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 55, y: 35 }}
                      animate={{
                        opacity: 1,
                        x: 20,
                        y: 8,
                        scale: isClicking ? 0.82 : 1
                      }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute z-50 pointer-events-none"
                      style={{ top: "0px", left: "0px" }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="drop-shadow-2xl">
                        <path
                          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36z"
                          fill={isDark ? "#0F172A" : "#FFFFFF"}
                          stroke={isDark ? "#FFFFFF" : "#0F172A"}
                          strokeWidth="1.8"
                        />
                      </svg>
                      {/* Click Pulse Ripple */}
                      {isClicking && (
                        <motion.div
                          initial={{ scale: 0.3, opacity: 1 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-blue-400/60"
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Disclaimer Caption (Exact same as canvas AI assistant) */}
        <motion.p
          animate={{
            opacity: phase >= 2 ? 0.75 : 0,
            y: phase >= 2 ? 0 : 4,
          }}
          transition={{ duration: 0.4 }}
          className="text-[11px] text-slate-500 dark:text-slate-400/80 text-center mt-2.5 select-none transition-colors"
        >
          AI can make mistakes. Please double-check responses.
        </motion.p>
      </div>
    </div>
  </div>
  )
}
