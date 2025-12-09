import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Endpoint WebSocket está ativo. Conecte via cliente Socket.IO.",
    },
    { status: 200 },
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Endpoint WebSocket está ativo. Conecte via cliente Socket.IO.",
    },
    { status: 200 },
  )
}
