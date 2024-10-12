const Tasks = require('../Models/Tasks')
const { isValidObjectId, Types } = require("mongoose");
const handleError = require('../controllers/helperController');


exports.removeTask = async (req, res) => {
    try {
      const { id } = req.params;
      const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null;
      const formatId = isValidObjectId(id) ? new Types.ObjectId(id): null;
      const userFilter = formatUser ? {user: formatUser} : req.guestId ? {guestId: req.guestId} : null;
  
      if (!formatId) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }
  
      const removedTask = await Tasks.findOneAndDelete({
        _id: formatId,
        ...userFilter,
      }).exec();
      if (!removedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
  
      return res
        .status(200)
        .json({ message: "Task removed successfully", removedTask });
    } catch (error) {
      handleError(res, error, "Failed to remove Task");
    }
  };
  
 
  