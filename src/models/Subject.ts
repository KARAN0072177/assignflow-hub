import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubject extends Document {
  name: string;
  teacherId: mongoose.Types.ObjectId;
  joinCode: string;
  isActive: boolean;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    joinCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent model overwrite in Next.js dev
const Subject: Model<ISubject> =
  mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);

export default Subject;