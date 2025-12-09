import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { MessageService } from "@/models/message/message.service"
import { getServerSession } from "@/lib/auth/auth"

export async function POST(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getServerSession()
    const { roomId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    await MessageService.markRoomAsRead(roomId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MESSAGES_READ_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
