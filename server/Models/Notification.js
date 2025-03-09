const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum:[ 'deadline', 'streak' , 'achievement', 'badge', 'error' ],
        required : true
    },
    message:{
        type:String,
        required : true
    },
    isRead: {
        type: Boolean ,
        default : false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
})
module.exports = mongoose.model('Notification',notificationSchema);

