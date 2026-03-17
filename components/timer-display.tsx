import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { TimerMode, TimerTheme, TextColor, BackgroundColor } from "@/lib/timer-session"

interface TimerDisplayProps {
  mode: TimerMode
  isRunning: boolean
  startTime?: number
  pausedAt?: number
  duration?: number
  showMilliseconds: boolean
  fontSize: number
  theme: TimerTheme
  textColor: TextColor
  backgroundColor: BackgroundColor
  showBorder: boolean
  borderColor: TextColor
  textShadow: boolean
  className?: string
}

export function TimerDisplay({
  mode,
  isRunning,
  startTime,
  pausedAt,
  duration,
  showMilliseconds,
  fontSize,
  theme,
  textColor,
  backgroundColor,
  showBorder,
  borderColor,
  textShadow,
  className,
}: TimerDisplayProps) {
  const [displayTime, setDisplayTime] = useState("00:00:00")
  const [animationFrame, setAnimationFrame] = useState<number | null>(null)

  // Helper to format time
  const formatTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor((timeMs % 1000) / 10)

    const pad = (num: number) => num.toString().padStart(2, "0")
    
    if (showMilliseconds) {
      return `${hours > 0 ? `${pad(hours)}:` : ""}${pad(minutes)}:${pad(seconds)}.${pad(ms)}`
    } else {
      return `${hours > 0 ? `${pad(hours)}:` : ""}${pad(minutes)}:${pad(seconds)}`
    }
  }

  // Update time display
  const updateTime = () => {
    const now = Date.now()
    let timeToDisplay = 0

    if (mode === "clock") {
      const date = new Date()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const seconds = date.getSeconds()
      const ms = showMilliseconds ? date.getMilliseconds() : 0
      
      const pad = (num: number) => num.toString().padStart(2, "0")
      setDisplayTime(
        showMilliseconds
          ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(Math.floor(ms / 10))}`
          : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      )
    } else if (mode === "stopwatch") {
      if (isRunning && startTime) {
        timeToDisplay = Math.max(0, now - startTime)
      } else if (pausedAt && startTime) {
        timeToDisplay = Math.max(0, pausedAt - startTime)
      }
      setDisplayTime(formatTime(timeToDisplay))
    } else if (mode === "countdown") {
      if (duration) {
        if (isRunning && startTime) {
          const elapsed = now - startTime
          timeToDisplay = Math.max(0, duration - elapsed)
          
          // Stop the timer if countdown reaches zero
          if (timeToDisplay <= 0) {
            setDisplayTime("00:00:00")
            return
          }
        } else if (pausedAt && startTime) {
          const elapsed = pausedAt - startTime
          timeToDisplay = Math.max(0, duration - elapsed)
        } else {
          timeToDisplay = duration
        }
        setDisplayTime(formatTime(timeToDisplay))
      }
    }

    setAnimationFrame(requestAnimationFrame(updateTime))
  }

  useEffect(() => {
    updateTime()
    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [mode, isRunning, startTime, pausedAt, duration, showMilliseconds])

  // Determine container and text classes based on theme
  const getContainerClasses = () => {
    if (theme === "green-screen") {
      return "bg-green-500"
    } else if (theme === "custom") {
      const bgColorClasses = {
        "black": "bg-black",
        "white": "bg-white",
        "green": "bg-green-500",
        "red": "bg-red-500",
        "blue": "bg-blue-500",
        "yellow": "bg-yellow-500",
        "purple": "bg-purple-500",
        "orange": "bg-orange-500",
        "transparent": "bg-transparent"
      }
      return bgColorClasses[backgroundColor] || "bg-black"
    } else {
      return theme === "light" ? "bg-white" : "bg-black"
    }
  }

  const getTextClasses = () => {
    if (theme === "custom") {
      const textColorClasses = {
        "white": "text-white",
        "black": "text-black",
        "green": "text-green-500",
        "red": "text-red-500",
        "blue": "text-blue-500",
        "yellow": "text-yellow-500",
        "purple": "text-purple-500",
        "orange": "text-orange-500"
      }
      return textColorClasses[textColor] || "text-white"
    } else {
      return theme === "light" ? "text-black" : "text-white"
    }
  }

  const getBorderClasses = () => {
    if (!showBorder) return ""
    
    const borderColorClasses = {
      "white": "border-white",
      "black": "border-black",
      "green": "border-green-500",
      "red": "border-red-500",
      "blue": "border-blue-500",
      "yellow": "border-yellow-500",
      "purple": "border-purple-500",
      "orange": "border-orange-500"
    }
    
    return `border-4 ${borderColorClasses[borderColor] || "border-white"}`
  }

  const getTextShadowClass = () => {
    return textShadow ? "text-shadow" : ""
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-full font-mono",
        getContainerClasses(),
        getBorderClasses(),
        className
      )}
    >
      <div
        className={cn(
          "tabular-nums",
          getTextClasses(),
          getTextShadowClass()
        )}
        style={{ fontSize: `${fontSize}px` }}
      >
        {displayTime}
      </div>
    </div>
  )
}