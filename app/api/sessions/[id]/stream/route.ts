import { type NextRequest } from "next/server"
import { getTimerSession } from "@/lib/timer-session"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let lastJson = ""

      const send = (data: unknown) => {
        const json = JSON.stringify(data)
        controller.enqueue(encoder.encode(`data: ${json}\n\n`))
        lastJson = json
      }

      // Send initial session data
      try {
        const session = await getTimerSession(params.id)
        if (!session) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "not_found" })}\n\n`))
          controller.close()
          return
        }
        send({ session })
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "fetch_failed" })}\n\n`))
        controller.close()
        return
      }

      // Poll MongoDB and push changes
      const interval = setInterval(async () => {
        try {
          const session = await getTimerSession(params.id)
          const json = JSON.stringify({ session })
          if (json !== lastJson) {
            send({ session })
          }
        } catch {
          // ignore transient errors
        }
      }, 200)

      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
