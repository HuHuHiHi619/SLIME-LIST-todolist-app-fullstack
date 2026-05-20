const { handleError } = require("../../controllers/helperController");
const categoryService = require("./service");

const sendServiceError = (res, error) => {
  if (error.name === "ServiceError") {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return null;
};

exports.getCategory = async (req, res) => {
  try {
    const categoryList = await categoryService.getCategories(req);
    return res.status(categoryList.length === 0 ? 201 : 200).json(categoryList);
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Failed to get category");
  }
};

exports.createCategory = async (req, res) => {
  try {
    const savedCategory = await categoryService.createCategory(req);
    return res.status(200).json(savedCategory);
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Failed to create category");
  }
};

exports.removedCategory = async (req, res) => {
  try {
    const removedCategory = await categoryService.removeCategory(req);
    return res.status(200).json({ message: "Remove category succesful", removedCategory });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Cannot remove category");
  }
};
