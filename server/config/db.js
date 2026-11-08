const mongoose = require('mongoose');

// Disable buffering so queries fail immediately with clear 503 instead of freezing for 10-30s
mongoose.set('bufferCommands', false);

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
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n💡 [College FSD Guide - MongoDB Connection]');
    console.log('1. In MongoDB Atlas: Go to Network Access and add IP 0.0.0.0/0 (Allow Access from Anywhere).');
    console.log('2. Check that your user credentials in MONGODB_URI are correct.\n');
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
