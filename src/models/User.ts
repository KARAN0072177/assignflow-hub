import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "STUDENT" | "TEACHER";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["STUDENT", "TEACHER"],
      required: true,
      immutable: true, // 🔒 role can NEVER change
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in Next.js hot reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;