import mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  fName: String,
  lName: String,
  email: String,
  password: String,
});

const Users = mongoose.model('Users', UsersSchema);

export default Users;
