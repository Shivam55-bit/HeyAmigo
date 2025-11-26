const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/socialx";
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB connected successfully....");

    } catch (err) {
        console.error("❌ MongoDB connection failed: ", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
