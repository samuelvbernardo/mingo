import { User } from "./user.model"
import type { CreateUserInput, IUserDTO, UpdateUserInput } from "./user.types"
import bcrypt from "bcryptjs"

export class UserService {
  static async createUser(data: CreateUserInput): Promise<IUserDTO> {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await User.create({
      ...data,
      password: hashedPassword,
    })

    return this.toDTO(user)
  }

  static async findByEmail(email: string) {
    return await User.findOne({ email }).select("+password")
  }

  static async findById(id: string): Promise<IUserDTO | null> {
    const user = await User.findById(id)
    return user ? this.toDTO(user) : null
  }

  static async updateUser(id: string, data: UpdateUserInput): Promise<IUserDTO | null> {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    return user ? this.toDTO(user) : null
  }

  static async setOnlineStatus(id: string, isOnline: boolean) {
    return await User.findByIdAndUpdate(
      id,
      {
        isOnline,
        lastSeen: new Date(),
      },
      { new: true },
    )
  }

  static async getOnlineUsers(): Promise<IUserDTO[]> {
    const users = await User.find({ isOnline: true })
    return users.map(this.toDTO)
  }

  static async findByNameOrEmail(query: string, excludeUserId?: string): Promise<IUserDTO[]> {
    const searchQuery: any = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }

    if (excludeUserId) {
      searchQuery._id = { $ne: excludeUserId }
    }

    const users = await User.find(searchQuery).limit(10)
    return users.map(this.toDTO)
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  static toDTO(user: any): IUserDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    }
  }
}
