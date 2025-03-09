const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    alreadyCompletedToday: { type: Boolean, default: false },
    currentBadge: {
      type: String,
      enum: ["iron", "bronze", "silver", "gold"],
      default: "iron",
    },
    settings: {
      theme: { type: String, enum: ["light", "dark"], default: "dark" },
      notification: { type: Boolean, default: true },
    },
    imageProfile: {
      type: String,
    },
    lastCompleted: { type: Date },
    notifications: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  },
  { timestamps: true }
);
// hash password ไม่ต้อง hash ซ้ำใน controller
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
