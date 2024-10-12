const mongoose = require('mongoose');

const tryAgainHistorySchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref:'User'
    },
    originalDeadline: {type:Date,required:true},
    newDeadline: {type:Date,required:true}
},{timestamps:true});

module.exports = mongoose.model('TryAgainHistory',tryAgainHistorySchema);