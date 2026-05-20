const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const uri = process.env.MONGO_URI;
        console.log(`Connecting to MongoDB with ${process.env.NODE_ENV} environment`);
        if (!uri) throw new Error("MONGO_URI is undefined");
        await mongoose.connect(uri);
        console.log('Database was connected!');
    } catch (error) {
        console.error(error);
    }
}

module.exports = connectDb;
