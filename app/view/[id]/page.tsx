"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TimerDisplay } from "@/components/timer-display"
import type { TimerSession } from "@/lib/timer-session"

export default function ViewerPage() {
  const params = useParams<{ id: string }>()
  const [session, setSession] = useState<TimerSession | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch session data
  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch timer session")
      }

      const data = await response.json()
      setSession(data.session)
    } catch (err) {
      setError("Failed to fetch timer session")
    }
  }

  // Start polling for updates
  useEffect(() => {
    fetchSession()

    const interval = setInterval(fetchSession, 500) // Poll every 500 milliseconds

    return () => {
      clearInterval(interval)
    }
  }, [params.id])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black text-white">
        <p>Timer not found or unavailable</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-transparent">
        {/* Empty div for loading state - keeps it clean for OBS */}
      </div>
    )
  }

  return (
    <TimerDisplay
      mode={session.mode}
      isRunning={session.isRunning}
      duration={session.duration}
      startTime={session.startTime}
      pausedAt={session.pausedAt}
      showMilliseconds={session.showMilliseconds}
      fontSize={session.fontSize}
      theme={session.theme}
      className="w-full h-screen"
      textColor={session.textColor}
      backgroundColor="transparent"
      showBorder={false}
      borderColor="white"
      textShadow={false}
    />
  )
}

