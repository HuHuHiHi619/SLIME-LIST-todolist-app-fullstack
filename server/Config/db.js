const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => {
    try{
        const uri = process.env.MONGO_URI
        const localUri = process.env.LOCAL_URI
        
        if(!uri) {
            throw new Error (" undefined")
        }
        await mongoose.connect(uri)
        console.log('Database was connected!');
    } catch(error){
        console.error(error);
    }
}

module.exports = connectDb;