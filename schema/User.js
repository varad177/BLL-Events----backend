import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema(
  {
    
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: String,
    fullname: {
      type: String,
    },
    mobno: {
      type: Number,
    },
    role: {
      type: String,
    },
    tasks: [{ type: String }],
  },
  {
    timestamps: {
      createdAt: "joinedAt",
    },
  }
);

export default mongoose.model("users", userSchema);
