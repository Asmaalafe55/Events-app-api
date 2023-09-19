import mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  description: String,
  avatar: String,
  image: String,
  address: String,
  birthdate: Date,
  gender: String,
});

const Users = mongoose.model('Users', UsersSchema);

export default Users;
