const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => {
    try{
        const uri = process.env.NODE_ENV === 'production' 
        ? process.env.MONGO_URI 
        : process.env.LOCAL_URI;
      
        console.log(`Connecting to MongoDB with ${process.env.NODE_ENV} environment`);
        
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