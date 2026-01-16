import mongoose, { Schema, Document, Model } from "mongoose";

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "LOCKED"
  | "GRADED";

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;

  // Student response
  fileUrl?: string;       // S3 URL for uploaded solution
  fileName?: string;
  fileType?: string;

  textAnswer?: string;    // optional text-based answer

  status: SubmissionStatus;

  submittedAt?: Date;
  gradedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 📄 File-based submission (PDF, DOC, etc.)
    fileUrl: {
      type: String,
    },

    fileName: {
      type: String,
    },

    fileType: {
      type: String,
    },

    // ✍️ Optional text submission
    textAnswer: {
      type: String,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "LOCKED", "GRADED"],
      default: "DRAFT",
      index: true,
    },

    submittedAt: {
      type: Date,
    },

    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Enforce one submission per student per assignment
SubmissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true }
);

const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission;