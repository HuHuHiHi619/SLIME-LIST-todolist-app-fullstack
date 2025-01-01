const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    tagName: { type:String, enum:[ "low" , "medium" , "high"] ,required:true,unique: true },
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    guestId: {
        type:String,
        required: false
    }
},{timestamps:true});

module.exports = mongoose.model('Tag',TagSchema);