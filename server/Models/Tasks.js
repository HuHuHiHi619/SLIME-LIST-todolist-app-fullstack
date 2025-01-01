const mongoose = require("mongoose");
const { type } = require("os");

const TasksSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxLength: 100 },
    note: { type: String, trim: true, maxLength: 1000 },
    startDate: { type: Date, default: Date.now,required:true },
    deadline: {type: Date},
    category: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    progress: {
      steps: [
        {
          label: {type:String, maxlength:100, trim:true},
          completed: { type: Boolean, default: false },
        },
      ],
      totalSteps: { type: Number, default: 0 },
      allStepsCompleted: { type: Boolean, default: false },
      history: {
        steps:[{
          label:{type:String},
          completed:{type:Boolean},
        }],
        timestamps:{type:Date, default: Date.now},
      }
    },
    tag: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Tag",
     require: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    tryAgainCount: {
      type: Number,
      default: 0,
      max: 3,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
    },
  },
  { timestamps: true }
);

 


module.exports = mongoose.model("Tasks", TasksSchema);
