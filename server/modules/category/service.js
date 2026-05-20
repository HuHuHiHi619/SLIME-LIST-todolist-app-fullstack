const { isValidObjectId, Types } = require("mongoose");
const { buildUserFilter } = require("../../shared/utils/userFilter");
const repository = require("./repository");

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ServiceError";
  }
}

const getCategories = async (req) => {
  const { id } = req.params;
  const { userFilter } = buildUserFilter(req);

  if (!userFilter) throw new ServiceError("Unauthorized", 401);

  if (id) {
    if (!isValidObjectId(id)) throw new ServiceError("Invalid category ID");
    userFilter._id = new Types.ObjectId(id);
  }

  const categoryList = await repository.findCategories(userFilter);
  console.log("Category found:", categoryList.length);
  return categoryList;
};

const createCategory = async (req) => {
  const { categoryName } = req.body;
  if (!categoryName) throw new ServiceError("Category name is required");

  const { formatUser } = buildUserFilter(req);

  const saved = await repository.insertCategory({
    categoryName,
    user: formatUser,
    guestId: formatUser ? null : req.guestId,
  });
  console.log("Create new category successful!", saved);
  return saved;
};

const removeCategory = async (req) => {
  const { id } = req.params;
  // Bug fix: original used isValidObjectId(req.user) — passes the whole user
  // object, so formatUser was always null for authenticated users.
  // buildUserFilter uses req.user.id, which is correct.
  const { userFilter } = buildUserFilter(req);
  const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;

  if (!formatId) throw new ServiceError("Invalid category ID");
  if (!userFilter) throw new ServiceError("Unauthorized", 401);

  const removed = await repository.deleteCategory({ _id: formatId, ...userFilter });
  if (!removed) throw new ServiceError("Category not found");
  return removed;
};

module.exports = { getCategories, createCategory, removeCategory, ServiceError };
