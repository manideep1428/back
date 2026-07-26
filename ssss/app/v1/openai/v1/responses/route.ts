import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key") || ""
    const apiKey = authHeader.replace("Bearer ", "").trim()

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized: Missing API Key" }, { status: 401 })
    }

    const backendUrl = process.env.EC2_BACKEND_URL || "http://localhost:3000"
    const targetUrl = `${backendUrl}/v1/responses`

    const bodyText = await req.text()

    const upstreamRes = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "text/event-stream",
      },
      body: bodyText,
    })

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text()
      return new Response(errText, {
        status: upstreamRes.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("OpenAI Responses Proxy Gateway Error:", error)
    return NextResponse.json(
      { error: "Internal Gateway Error", details: error?.message },
      { status: 500 }
    )
  }
}
