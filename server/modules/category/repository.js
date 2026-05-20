const Category = require("../../Models/Category");

const findCategories = (filter) => Category.find(filter);

const insertCategory = (data) => new Category(data).save();

const deleteCategory = (filter) => Category.findOneAndDelete(filter).exec();

module.exports = { findCategories, insertCategory, deleteCategory };
