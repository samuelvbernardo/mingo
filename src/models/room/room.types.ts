import type { IBaseModel } from "../BaseModel"

export interface IRoom extends IBaseModel {
  name: string
  description?: string
  createdBy: string
  members: string[]
  isPrivate: boolean
  maxMembers?: number
}

export interface IRoomDTO {
  id: string
  name: string
  description?: string
  createdBy: string
  members: string[]
  isPrivate: boolean
  maxMembers?: number
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

export type CreateRoomInput = {
  name: string
  description?: string
  createdBy: string
  isPrivate?: boolean
  maxMembers?: number
}

export type UpdateRoomInput = Partial<Omit<CreateRoomInput, "createdBy">>
