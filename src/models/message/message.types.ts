import type { IBaseModel } from "../BaseModel"

export type MessageType = "text" | "image" | "file" | "audio"

export interface IAttachment {
  url: string
  type: string
  name: string
  size: number
}

export interface IMessage extends IBaseModel {
  roomId: string
  userId: string
  content: string
  type: MessageType
  attachment?: IAttachment
  readBy: string[]
  replyTo?: string
  isEdited: boolean
  editedAt?: Date
}

export interface IMessageDTO {
  id: string
  roomId: string
  userId: string
  userName?: string
  userAvatar?: string
  content: string
  type: MessageType
  attachment?: IAttachment
  readBy: string[]
  replyTo?: string
  isEdited: boolean
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type CreateMessageInput = {
  roomId: string
  userId: string
  content: string
  type?: MessageType
  attachment?: IAttachment
  replyTo?: string
}

export type UpdateMessageInput = {
  content: string
}