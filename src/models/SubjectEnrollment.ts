import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubjectEnrollment extends Document {
  subjectId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  joinedAt: Date;
}

const SubjectEnrollmentSchema = new Schema<ISubjectEnrollment>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// 🔒 Prevent duplicate joins (CRITICAL)
SubjectEnrollmentSchema.index(
  { subjectId: 1, studentId: 1 },
  { unique: true }
);

// Prevent model overwrite in dev
const SubjectEnrollment: Model<ISubjectEnrollment> =
  mongoose.models.SubjectEnrollment ||
  mongoose.model<ISubjectEnrollment>(
    "SubjectEnrollment",
    SubjectEnrollmentSchema
  );

export default SubjectEnrollment;