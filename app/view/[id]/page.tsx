"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TimerDisplay } from "@/components/timer-display"
import type { TimerSession } from "@/lib/timer-session"

export default function ViewerPage() {
  const params = useParams<{ id: string }>()
  const [session, setSession] = useState<TimerSession | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to real-time session updates via SSE
  useEffect(() => {
    const eventSource = new EventSource(`/api/sessions/${params.id}/stream`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.error === "not_found") {
          setError("Timer not found")
          eventSource.close()
        } else if (data.session) {
          setSession(data.session)
        }
      } catch {
        // ignore parse errors
      }
    }

    eventSource.onerror = () => {
      setError("Failed to connect to timer session")
      eventSource.close()
    }

    return () => {
      eventSource.close()
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

