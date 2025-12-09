import mongoose, { Schema, type Model } from "mongoose"
import type { IUser } from "./user.types"
import { applyBaseSchema, baseSchemaOptions } from "../BaseModel"

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  baseSchemaOptions,
)

applyBaseSchema(userSchema)

userSchema.index({ email: 1 })
userSchema.index({ isOnline: 1 })

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
