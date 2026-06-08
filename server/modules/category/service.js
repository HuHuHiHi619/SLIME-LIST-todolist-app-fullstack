const repository = require("./repository");
const { ServiceError } = require("../../shared/errors");

const getCategories = async (userFilter) => {
  return repository.findCategories(userFilter);
};

const createCategory = async ({ categoryName, formatUser, guestId }) => {
  return repository.insertCategory({
    categoryName,
    user: formatUser,
    guestId: formatUser ? null : guestId,
  });
};

const removeCategory = async (formatId, userFilter) => {
  const removed = await repository.deleteCategory({ _id: formatId, ...userFilter });
  if (!removed) throw new ServiceError("Category not found");
  return removed;
};

module.exports = { getCategories, createCategory, removeCategory };
