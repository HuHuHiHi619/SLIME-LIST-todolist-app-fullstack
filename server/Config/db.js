const mongoose = require('mongoose');

const connectDb = async () => {
    try{
        await mongoose.connect('mongodb://localhost:27017/TimeBackend')
        console.log('Database was connected!');
    } catch(error){
        console.error(error);
    }
}

module.exports = connectDb;