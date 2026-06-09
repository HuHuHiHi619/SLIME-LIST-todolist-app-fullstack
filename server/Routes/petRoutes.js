const router = require("express").Router();
const { getPet } = require("../modules/pet/controller");
const authOptional = require("../middleware/authOptional");
const guestId      = require("../middleware/guestId");

// Fix: authOptional is a factory — must be called with (true) to allow guests through
router.get("/pet", authOptional(true), guestId, getPet);

module.exports = router;
