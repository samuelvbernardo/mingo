import type { IBaseModel } from "../BaseModel"

export interface IUser extends IBaseModel {
  name: string
  email: string
  password: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

export interface IUserDTO {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
}

export type CreateUserInput = {
  name: string
  email: string
  password: string
  avatar?: string
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">>
