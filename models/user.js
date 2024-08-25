import mongoose  from 'mongoose'

const userSchema = new mongoose.Schema({
  NNI: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: false },
  username: { type: String, required: true, unique: false },
  password: { type: String, required: true },
});

const User = new  mongoose.model('users', userSchema);
export default User