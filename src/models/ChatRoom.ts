import { Schema, model, Types } from 'mongoose';
import { BaseModel } from './BaseModel';

const ChatRoomSchema = new Schema({
  ...BaseModel,
  name: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  members: [{ type: Types.ObjectId, ref: 'User' }],
});

export default model('ChatRoom', ChatRoomSchema);
