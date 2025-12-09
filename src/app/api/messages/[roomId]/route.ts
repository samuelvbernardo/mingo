import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { MessageService } from "@/models/message/message.service"
import { RoomService } from "@/models/room/room.service"
import { getServerSession } from "@/lib/auth/auth"

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getServerSession()
    const { roomId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    await connectDB()

    const room = await RoomService.findById(roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (!room.members.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await MessageService.findByRoomId(roomId, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[MESSAGES_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getServerSession()
    const { roomId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, type, attachment, replyTo } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    await connectDB()

    const room = await RoomService.findById(roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (!room.members.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const message = await MessageService.createMessage({
      roomId,
      userId: session.user.id,
      content,
      type: type || "text",
      attachment,
      replyTo,
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("[MESSAGES_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
