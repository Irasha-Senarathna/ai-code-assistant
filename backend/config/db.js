const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    // Guard: if MONGO_URI not provided or still contains placeholder, skip connect
    if (!uri || uri.includes("<") || uri.includes("your_password") || uri.trim() === "") {
      console.warn("⚠️ MONGO_URI missing or contains placeholder. Skipping MongoDB connection.");
      return;
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error);
    // Do not exit process in dev — allow the app to run without DB.
    // If you want the process to exit on DB errors, uncomment the next line.
    // process.exit(1);
  }
};

module.exports = connectDB;