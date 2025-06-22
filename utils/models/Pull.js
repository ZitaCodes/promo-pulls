import mongoose from "mongoose";

const pullSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pulls_used: { type: Number, default: 0 },
  pull_limit: { type: Number, default: 26 },
  last_reset: { type: Date, default: () => new Date() }
});

export default mongoose.models.Pull || mongoose.model("Pull", pullSchema);
