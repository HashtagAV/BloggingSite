const mongoose = require("mongoose");

const connectMongoDB = async (url) => {
    try {
        await mongoose.connect(url);
        console.log("MongoDB connected successfully");
    } catch(error) {
        console.log("mongoDB connection failed: ", error.message);
        process.exit(1);
    }

}

module.exports = connectMongoDB;