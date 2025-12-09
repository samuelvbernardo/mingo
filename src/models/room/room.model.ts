import mongoose, { Schema, type Model } from "mongoose"
import type { IRoom } from "./room.types"
import { applyBaseSchema, baseSchemaOptions } from "../BaseModel"

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [100, "Room name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdBy: {
      type: String,
      required: [true, "Creator is required"],
      ref: "User",
      index: true,
    },
    members: [
      {
        type: String,
        ref: "User",
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    maxMembers: {
      type: Number,
      default: null,
    },
  },
  baseSchemaOptions,
)

applyBaseSchema(roomSchema)

roomSchema.index({ createdBy: 1, createdAt: -1 })
roomSchema.index({ members: 1 })
roomSchema.index({ isPrivate: 1 })

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>("Room", roomSchema)
