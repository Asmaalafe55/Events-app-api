import mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  description: String,
  avatarUrl: String,  
});

const Users = mongoose.model('Users', UsersSchema);

export default Users;
