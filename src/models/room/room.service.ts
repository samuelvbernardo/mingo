import { Room } from "./room.model"
import type { CreateRoomInput, IRoomDTO, UpdateRoomInput } from "./room.types"

export class RoomService {
  static async createRoom(data: CreateRoomInput): Promise<IRoomDTO> {
    const room = await Room.create({
      ...data,
      members: [data.createdBy],
    })

    return this.toDTO(room)
  }

  static async findById(id: string): Promise<IRoomDTO | null> {
    const room = await Room.findById(id)
    return room ? this.toDTO(room) : null
  }

  static async findAll(): Promise<IRoomDTO[]> {
    const rooms = await Room.find({ isPrivate: false }).sort({ createdAt: -1 })
    return rooms.map(this.toDTO)
  }

  static async findByUserId(userId: string): Promise<IRoomDTO[]> {
    const rooms = await Room.find({ members: userId }).sort({ updatedAt: -1 })
    return rooms.map(this.toDTO)
  }

  static async updateRoom(id: string, data: UpdateRoomInput): Promise<IRoomDTO | null> {
    const room = await Room.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    return room ? this.toDTO(room) : null
  }

  static async deleteRoom(id: string): Promise<boolean> {
    const result = await Room.findByIdAndDelete(id)
    return !!result
  }

  static async addMember(roomId: string, userId: string): Promise<IRoomDTO | null> {
    const room = await Room.findById(roomId)

    if (!room) return null

    if (room.members.includes(userId)) {
      return this.toDTO(room)
    }

    if (room.maxMembers && room.members.length >= room.maxMembers) {
      throw new Error("Room is full")
    }

    room.members.push(userId)
    await room.save()

    return this.toDTO(room)
  }

  static async removeMember(roomId: string, userId: string): Promise<IRoomDTO | null> {
    const room = await Room.findByIdAndUpdate(roomId, { $pull: { members: userId } }, { new: true })

    return room ? this.toDTO(room) : null
  }

  static toDTO(room: any): IRoomDTO {
    return {
      id: room._id.toString(),
      name: room.name,
      description: room.description,
      createdBy: room.createdBy,
      members: room.members,
      isPrivate: room.isPrivate,
      maxMembers: room.maxMembers,
      memberCount: room.members.length,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }
  }
}
