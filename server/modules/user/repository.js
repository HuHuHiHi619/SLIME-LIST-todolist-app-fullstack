const User = require("../../Models/User");

const findByUsername = (username) => User.findOne({ username });

const findByUsernameWithPassword = (username) =>
  User.findOne({ username }).select("+password");

// Full hydrated document — used by token refresh
const findById = (id) => User.findById(id);

// Without password — used for profile reads
const findByIdSafe = (id) => User.findById(id).select("-password");

const createUser = (data) => new User(data).save();

module.exports = {
  findByUsername,
  findByUsernameWithPassword,
  findById,
  findByIdSafe,
  createUser,
};
