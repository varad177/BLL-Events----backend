import mongoose, { Schema } from "mongoose";

const passRecipientSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
    },
    mobno: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type:Boolean,
      default: false,
    },
    passID: {
      type: Schema.Types.ObjectId,
      ref: "passModel",
    },
  },
  {
    timestamps: {
      createdAt: "sendedAt",
    },
  }
);

export default mongoose.model("passUser", passRecipientSchema);
