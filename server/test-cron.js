const mongoose = require('mongoose');
const { updateOverdueTasks, resetDailyStreakStatus } = require('./job/cronJob');
require('dotenv').config(); // ถ้าคุณใช้ dotenv

async function runTasks() {
  try {
    // เชื่อมต่อกับ MongoDB ก่อน
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    console.log('Starting update overdue tasks...');
    await updateOverdueTasks();
    
    console.log('Starting reset daily streak status...');
    await resetDailyStreakStatus();
    
    console.log('All tasks completed successfully');
    
    // ปิดการเชื่อมต่อเมื่อเสร็จ
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error running scheduled tasks:', error);
  }
}

runTasks();