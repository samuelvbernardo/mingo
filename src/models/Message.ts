import { Schema, model, Types } from 'mongoose';
import { BaseModel } from './BaseModel';

const MessageSchema = new Schema({
  ...BaseModel,
  chatRoom: { type: Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

export default model('Message', MessageSchema);
