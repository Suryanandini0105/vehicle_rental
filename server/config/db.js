const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn('⚠️  MONGODB_URI is not set in environment variables.');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n💡 [College FSD Guide - MongoDB Connection]');
    console.log('1. If using MongoDB Atlas: Ensure your MONGODB_URI in server/.env has your username, password, and cluster address.');
    console.log('2. In MongoDB Atlas Network Access: Ensure IP 0.0.0.0/0 (allow from anywhere) is added.');
    console.log('3. If using local MongoDB: Ensure the local mongod service is started (e.g., net start MongoDB).\n');
  }
};

const getDBStatus = () => {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

module.exports = { connectDB, getDBStatus };
