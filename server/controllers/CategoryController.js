const { default: mongoose } = require('mongoose');
const Category = require('../Models/Category');
const handleError = require('../controllers/helperController')
const { isValidObjectId, Types } = require('mongoose')

exports.getCategory = async (req,res) => {
    try{
        const {id} = req.params;
        const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null
        const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null
        const userFilter = formatUser ? {user : formatUser} : req.guestId ? {guestId: req.guestId} : {};

        if(!userFilter){
            return res.status(401).json({ error: "Unauthorized" });
          }
      
          if(id){
            if(!formatId) {
              return res.status(400).json({ error: "Invalid task ID" });
            }
            userFilter._id = formatId
          }

        const categoryList = await Category.find(userFilter)
        console.log('Category founded:',categoryList.length)

        if(categoryList.length === 0) {
            return res.status(201).json([])
        }
        return res.status(200).json(categoryList);
    } catch(error) {
        handleError(res,error,'Failed to get category')
    }
}

exports.createCategory = async (req,res) => {
    try {
        const { categoryName  , user } = req.body
        console.log('Request User:', user);
        console.log('Request name:', categoryName);
        console.log('Guest ID in CreateCategory:', req.guestId);
        if(!categoryName) {
            return res.status(400).send({error:'Category name is required'})
        }
        const formatUser = isValidObjectId(user) ? new Types.ObjectId(user) : null;
        console.log(formatUser)
        const newCategory = new Category({
            categoryName,
            user:  formatUser ,
            guestId: req.guestId || null
        });

        const savedCategory = await newCategory.save();
        console.log('Create new category successful!',savedCategory);
        return res.status(200).json(savedCategory)
    }  catch (error) {
        handleError(res,error,'Failed to create category')
    }

}

exports.removedCategory = async (req,res) => {
    try{
        const { id } = req.params;
        const formatUser = isValidObjectId(req.user) ? new Types.ObjectId(req.user.id) : null
        const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null
        const filterUser = formatUser ? {user: formatUser} : req.guestId ? {guestId: req.guestId} : null;
    
        const removedCategory = await Category.findOneAndDelete({
            _id:formatId,
            ...filterUser
        }).exec();
        if(!removedCategory){
            return res.status(400).json({error:'Category not found'})
        }
        return res.status(200).json({message:'Remove category succesful',removedCategory})
    } catch(error){
        handleError(res, error, "Cannot remove category");
    }
   
}