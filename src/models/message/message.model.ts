import mongoose, { Schema, type Model } from "mongoose"
import type { IMessage } from "./message.types"
import { applyBaseSchema, baseSchemaOptions } from "../BaseModel"

const messageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: String,
      required: [true, "Room ID is required"],
      ref: "Room",
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
      index: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio"],
      default: "text",
    },
    attachment: {
      url: String,
      type: String,
      name: String,
      size: Number,
    },
    readBy: [
      {
        type: String,
        ref: "User",
      },
    ],
    replyTo: {
      type: String,
      ref: "Message",
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  baseSchemaOptions,
)

applyBaseSchema(messageSchema)

messageSchema.index({ roomId: 1, createdAt: -1 })
messageSchema.index({ userId: 1, createdAt: -1 })
messageSchema.index({ roomId: 1, userId: 1 })

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema)
