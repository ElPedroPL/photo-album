import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // zahashowane hasło
});

export default mongoose.models.User || mongoose.model("User", userSchema);
