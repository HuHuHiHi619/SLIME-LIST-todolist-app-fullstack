
const cron = require('node-cron');
const Tasks = require('../Models/Tasks');



const checkOverdueTasks = () => {
  cron.schedule('0 0 * * *', async () => {  // รันทุกวันตอนเที่ยงคืน
    await updateOverdueTasks();
  });
};

// manual
const updateOverdueTasks = async () => {
  const currentDate = new Date();

  try {
    const overdueTasks = await Tasks.find({ 
      deadline: { $lt: currentDate },
      status: { $ne: 'completed' } 
    });

    overdueTasks.forEach(async (task) => {
      task.status = 'failed';  // เปลี่ยนสถานะเป็น failed เมื่อเกิน deadline
      await task.save();
    });

    console.log(`Updated ${overdueTasks.length} overdue tasks.`);
  } catch (error) {
    console.error('Error updating overdue tasks:', error);
  }
};

module.exports = { checkOverdueTasks, updateOverdueTasks };
