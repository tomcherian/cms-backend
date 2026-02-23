import mongoose, { Document, Schema } from "mongoose";
import { AttendanceStatus } from "../types/attendance";

export interface IAttendance extends Document {
  date: Date;
  member: mongoose.Types.ObjectId;
  teamLead: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  reason?: string;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    date: { type: Date, required: true },
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    teamLead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    reason: { type: String },
  },
  { timestamps: true },
);

// Prevent duplicate attendance per day
attendanceSchema.index({ date: 1, member: 1 }, { unique: true });

export default mongoose.model<IAttendance>("Attendance", attendanceSchema);
