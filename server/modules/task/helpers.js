const Category = require("../../Models/Category");
const { STATUS_ORDER, PRIORITY_ORDER } = require("../../shared/utils/taskConstants");
const { ServiceError } = require("../../shared/errors");

const compareTasksForFlatList = (a, b) => {
  const statusComp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  if (statusComp !== 0) return statusComp;
  return (
    PRIORITY_ORDER.indexOf(a.priority || "low") -
    PRIORITY_ORDER.indexOf(b.priority || "low")
  );
};

const lookupCategoryByName = async (name, userId, guestId) => {
  const cat = await Category.findOne({
    categoryName: name,
    $or: [{ user: userId }, { guestId }],
  }).lean();
  return cat ? cat._id : null;
};

module.exports = { ServiceError, compareTasksForFlatList, lookupCategoryByName };
