const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    guestId: { type: String, unique: true, sparse: true },
    exp:            { type: Number, default: 0 },
    level:          { type: Number, default: 0 },
    happiness:      { type: Number, default: 50, min: 0, max: 100 },
    evolutionStage: {
      type: String,
      enum: ["egg", "baby", "teen", "adult"],
      default: "egg",
    },
    lastDecayDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", PetSchema);
