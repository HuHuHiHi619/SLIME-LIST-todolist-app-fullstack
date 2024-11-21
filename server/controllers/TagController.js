const { isValidObjectId, default: mongoose, Types } = require("mongoose");
const Tag = require("../Models/Tag");
const { handleError } = require("../controllers/helperController");
const {
  Types: { ObjectId },
} = require("mongoose");

exports.getTag = async (req, res) => {
  try {
    const { id } = req.params;
    const formatUser =
      req.user && isValidObjectId(req.user.id)
        ? new Types.ObjectId(req.user.id)
        : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : req.guestId
      ? { guestId: req.guestId }
      : {};

    if (!userFilter) {
      return res.status(400).json({ error: "Unauthorized" });
    }
    if (id) {
      if (!formatId) {
        return res.status(400).json({ error: "Invalid tag id" });
      }
      userFilter._id = formatId;
    }

    const taglists = await Tag.find(userFilter);
    console.log("Tag list:", taglists);
    if (taglists.length === 0) {
      return res.status(201).json({});
    }

    return res.status(200).json(taglists);
  } catch (error) {
    handleError(res, error, "Error get tags");
  }
};

exports.createTag = async (req, res) => {
  try {
    const { tagName } = req.body;

    if (!tagName) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const formatUser =
      req.user && isValidObjectId(req.user.id)
        ? new Types.ObjectId(req.user.id)
        : null;

    const newTag = new Tag({
      tagName,
      user: formatUser || null,
      guestId: req.guestId || null,
    });
    const savedTag = await newTag.save();
    console.log("Create new tag successful!", savedTag);
    return res.status(201).send(savedTag);
  } catch (error) {
    handleError(res, error, "Cannot create a tag !");
  }
};

exports.removeTag = async (req, res) => {
  try {
    const { id } = req.params;
    const formatUser =
      req.user && isValidObjectId(req.user)
        ? new Types.ObjectId(req.user.id)
        : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : req.guestId
      ? { guestId: req.guestId }
      : null;
    console.log("req.id", id);
    console.log("formatid", formatId);
    const removedTag = await Tag.findByIdAndDelete({
      _id: formatId,
      ...userFilter,
    });

    if (!removedTag) {
      return res.status(400).json({ error: "Cannot find and delete tag" });
    }
    return res
      .status(200)
      .json({ message: "Removed tag successful", removedTag });
  } catch (error) {
    handleError(res, error, "Cannot remove category");
  }
};
