import { Schema, model } from 'mongoose';
import { BaseModel } from './BaseModel';

const UserSchema = new Schema({
  ...BaseModel,
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
});

export default model('User', UserSchema);
