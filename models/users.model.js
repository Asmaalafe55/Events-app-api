import mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  description: String,
  // <<<<<<< HEAD
  // avatar: String,
  // image: String,
  // address: String,
  // birthdate: Date,
  // gender: String,
  // =======
  avatarUrl: String,
  // >>>>>>> bd4e75f2b7bdae1f82f3e198e3111e6842339172
});

const Users = mongoose.model('Users', UsersSchema);

export default Users;
