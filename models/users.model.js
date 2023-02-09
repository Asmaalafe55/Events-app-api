import mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  fName: String,
  lName: String,
  email: String,
  account: String,
});

const Users = mongoose.model('Users', UsersSchema);

export default Users;
