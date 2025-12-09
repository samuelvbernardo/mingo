import { Message } from "./message.model"
import type { CreateMessageInput, IMessageDTO, UpdateMessageInput } from "./message.types"

export class MessageService {
  static async createMessage(data: CreateMessageInput): Promise<IMessageDTO> {
    const message = await Message.create({
      ...data,
      readBy: [data.userId],
    })

    return this.toDTO(await message.populate("userId", "name avatar"))
  }

  static async findByRoomId(
    roomId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: IMessageDTO[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      Message.find({ roomId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("userId", "name avatar"),
      Message.countDocuments({ roomId }),
    ])

    return {
      messages: messages.reverse().map(this.toDTO),
      total,
      hasMore: skip + messages.length < total,
    }
  }

  static async findById(messageId: string): Promise<IMessageDTO | null> {
    const message = await Message.findById(messageId).populate("userId", "name avatar")
    return message ? this.toDTO(message) : null
  }

  static async updateMessage(messageId: string, data: UpdateMessageInput): Promise<IMessageDTO | null> {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { content: data.content, isEdited: true, editedAt: new Date() },
      { new: true },
    ).populate("userId", "name avatar")

    return message ? this.toDTO(message) : null
  }

  static async deleteMessage(messageId: string): Promise<boolean> {
    const result = await Message.findByIdAndDelete(messageId)
    return !!result
  }

  static async markAsRead(messageId: string, userId: string): Promise<void> {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { readBy: userId },
    })
  }

  static async markRoomAsRead(roomId: string, userId: string): Promise<void> {
    await Message.updateMany({ roomId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } })
  }

  static async getUnreadCount(roomId: string, userId: string): Promise<number> {
    return await Message.countDocuments({
      roomId,
      readBy: { $ne: userId },
      userId: { $ne: userId },
    })
  }

  static toDTO(message: any): IMessageDTO {
    return {
      id: message._id.toString(),
      roomId: message.roomId,
      userId: message.userId._id?.toString() || message.userId,
      userName: message.userId.name,
      userAvatar: message.userId.avatar,
      content: message.content,
      type: message.type,
      attachment: message.attachment,
      readBy: message.readBy,
      replyTo: message.replyTo,
      isEdited: message.isEdited || false,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }
  }
}

