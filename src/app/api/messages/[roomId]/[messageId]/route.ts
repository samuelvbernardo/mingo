import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { MessageService } from "@/models/message/message.service"
import { RoomService } from "@/models/room/room.service"
import { getServerSession } from "@/lib/auth/auth"
import { pusherServer } from "@/lib/pusher/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const session = await getServerSession()
    const { roomId, messageId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
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

    const message = await MessageService.findById(messageId)
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Verify message belongs to user
    if (message.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedMessage = await MessageService.updateMessage(messageId, { content })

    // Broadcast update via Pusher
    await pusherServer.trigger(`room-${roomId}`, "MESSAGE_UPDATED", updatedMessage)

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error("[MESSAGE_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const session = await getServerSession()
    const { roomId, messageId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const room = await RoomService.findById(roomId)
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (!room.members.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const message = await MessageService.findById(messageId)
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Verify message belongs to user
    if (message.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await MessageService.deleteMessage(messageId)

    // Broadcast deletion via Pusher
    await pusherServer.trigger(`room-${roomId}`, "MESSAGE_DELETED", { messageId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MESSAGE_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
