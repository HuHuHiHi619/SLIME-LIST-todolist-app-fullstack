const Tasks = require("../../Models/Tasks");

const findTasks = (filter, populate = []) =>
  Tasks.find(filter).populate(populate).lean().exec();

// Returns a hydrated Mongoose document — callers may call .save() on it
const findTask = (filter) => Tasks.findOne(filter);

const saveTask = (data) => new Tasks(data).save();

const updateTask = (filter, data) =>
  Tasks.findOneAndUpdate(filter, data, { new: true, runValidators: true }).exec();

const deleteTask = (filter) => Tasks.findOneAndDelete(filter).exec();

const deleteManyTasks = (filter) => Tasks.deleteMany(filter);

module.exports = {
  findTasks,
  findTask,
  saveTask,
  updateTask,
  deleteTask,
  deleteManyTasks,
};
