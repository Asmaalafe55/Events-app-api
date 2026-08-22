import mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    description: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    address: { type: String, default: '' },
    birthdate: Date,
    gender: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin', 'organizer'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    registeredEvents: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Users = mongoose.model('Users', UsersSchema);

export default Users;
