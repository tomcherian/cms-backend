import mongoose, { Document, Schema } from "mongoose";

export interface IMember extends Document {
  name: string;
  phone: string;
  teamLead: mongoose.Types.ObjectId;
  active: boolean;
}

const memberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true },
    phone: { type: String },
    teamLead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IMember>("Member", memberSchema);
