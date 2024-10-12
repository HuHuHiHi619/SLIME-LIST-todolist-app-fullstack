const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {type: String, required: true,trim: true},
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    guestId: {
        type:String,
        default: null
    }
},{timestamps: true});

module.exports = mongoose.model('Category',categorySchema);