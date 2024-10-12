const mongoose = require('mongoose');


const loginHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    }
},{timestamps: true});

module.exports = mongoose.model('LoginHistory',loginHistorySchema)