import mongoose, { Schema, Document, Model } from "mongoose";

export type AssignmentStatus = "DRAFT" | "PUBLISHED";

export interface IAssignment extends Document {
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  deadline: Date;

  fileUrl: string;        // where PDF is stored
  fileName: string;       // original file name
  fileType: string;       // application/pdf

  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    deadline: {
      type: Date,
      required: true,
    },

    // 📄 Assignment PDF (teacher uploads)
    fileUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      default: "application/pdf",
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in dev
const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export default Assignment;