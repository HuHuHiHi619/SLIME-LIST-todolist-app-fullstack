const Pet = require("../../Models/Pet");

const findByUser   = (userId)  => Pet.findOne({ userId });
const findByGuest  = (guestId) => Pet.findOne({ guestId });
const createForUser  = (userId)  => Pet.create({ userId });
const createForGuest = (guestId) => Pet.create({ guestId });
const save = (pet) => pet.save();

module.exports = { findByUser, findByGuest, createForUser, createForGuest, save };
