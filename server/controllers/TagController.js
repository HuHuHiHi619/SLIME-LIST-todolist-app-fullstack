
const Tag = require("../Models/Tag");

exports.createTag = async () => {
  try {
    const tag = new Tag({ tagName: "low" }); // ตัวอย่าง tag
    await tag.save();
    console.log("Tag created:", tag);
  } catch (error) {
    console.error("Error creating tag:", error);
  }
};

exports.getTag = async () => {
  try{
    const tagList = await Tag.find()
  } catch(error){
    console.error("Error getting tag:", error)
  }
}


