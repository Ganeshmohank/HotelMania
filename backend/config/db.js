const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = "mongodb+srv://mohankancherla519:nPdoiGx51WRHit9R@cluster1.ueedc.mongodb.net/booktable?retryWrites=true&w=majority";
    await mongoose.connect(mongoURI); // ✅ clean and compatible with latest drivers
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
