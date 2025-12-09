import type { Schema } from "mongoose"

export interface IBaseModel {
  _id: string
  createdAt: Date
  updatedAt: Date
  schemaVersion: number
}

export const baseSchemaFields = {
  schemaVersion: {
    type: Number,
    default: 1,
  },
}

export const baseSchemaOptions = {
  timestamps: true,
}

export function applyBaseSchema<T extends Schema>(schema: T): T {
  schema.add(baseSchemaFields)
  return schema
}
