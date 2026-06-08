const { isValidObjectId, Types } = require("mongoose");
const { handleError } = require("../../shared/errors");
const { buildUserFilter } = require("../../shared/utils/userFilter");
const categoryService = require("./service");
const { CreateCategorySchema } = require("./schema");
const { sendServiceError } = require("../../shared/errors");

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { userFilter } = buildUserFilter(req);
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    if (id) {
      if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid category ID" });
      userFilter._id = new Types.ObjectId(id);
    }
    const categoryList = await categoryService.getCategories(userFilter);
    return res.status(200).json(categoryList);
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Failed to get category");
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { formatUser, userFilter } = buildUserFilter(req);
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    const parsed = CreateCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const saved = await categoryService.createCategory({
      categoryName: parsed.data.categoryName,
      formatUser,
      guestId: req.guestId,
    });
    return res.status(200).json(saved);
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Failed to create category");
  }
};

exports.removedCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { userFilter } = buildUserFilter(req);
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    if (!formatId) return res.status(400).json({ error: "Invalid category ID" });
    const removed = await categoryService.removeCategory(formatId, userFilter);
    return res.status(200).json({ message: "Remove category succesful", removedCategory: removed });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Cannot remove category");
  }
};
