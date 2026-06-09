const petService = require("./service");

const getPet = async (req, res) => {
  try {
    // Fix: auth middleware sets req.user.id, not req.user._id
    const userId  = req.user?.id;
    const guestId = req.guestId;
    const pet = await petService.getPet({ userId, guestId });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPet };
