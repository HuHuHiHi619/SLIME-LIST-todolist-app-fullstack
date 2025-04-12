const { isValidObjectId , Types } = require("mongoose");

const Tasks = require("../Models/Tasks");

exports.getTasksCompletedRate = async (req, res) => {
    try {
      const formatUser =
        req.user && isValidObjectId(req.user.id)
          ?  new Types.ObjectId(req.user.id)
          : null;
      const userFilter = formatUser
        ? { user: formatUser }
        : req.guestId
        ? { guestId: req.guestId }
        : {};
      console.log('getTasksCompletedRate user:', userFilter)
      console.log('getting result...')
      
      const result = await Tasks.aggregate([
        {
          $match: userFilter,
        },
        {
          $group: {
            _id:null, // จัดกลุ่มตาม category และใช้ "No Category" ถ้า category เป็น null
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: {
                $cond: {
                  if: { $eq: ["$status", "completed"] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            category: "$_id",
            totalTasks: 1,
            completedTasks: 1,
            completedRate: {
              $multiply: [
                {
                  $divide: [
                    { $ifNull: ["$completedTasks", 0] },
                    { $ifNull: ["$totalTasks", 1] },
                  ],
                },
                100
              ],
            },
          },
        },
      ]);
  
      if (result.length === 0) {
        return res.status(200).json({ message: "No data found" });
      }
      console.log('getTasksCompletedRate result:', result)
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
  

  exports.getTasksCompletedRateByCategory = async (req, res) => {
    try {
      const formatUser =
        req.user && isValidObjectId(req.user.id)
          ?  new Types.ObjectId(req.user.id)
          : null;
      const userFilter = formatUser
        ? { user: formatUser }
        : req.guestId
        ? { guestId: req.guestId }
        : {};
        console.log('getTasksCompletedRateBycategory user:', userFilter)
      const result = await Tasks.aggregate([
        {
          $match: userFilter,
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo"
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $size: "$categoryInfo" },
                then: "$category",
                else: "No Category"
              }
            },
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: {
                $cond: {
                  if: { $eq: ["$status", "completed"] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            category: "$_id",
            totalTasks: 1,
            completedTasks: 1,
            completedRate: {
              $multiply: [
                {
                  $divide: [
                    { $ifNull: ["$completedTasks", 0] },
                    { $ifNull: ["$totalTasks", 1] },
                  ],
                },
                100
              ],
            },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo"
          }
        },
        {
          $unwind: {
            path: "$categoryInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            category: {
              $cond: {
                if: { $eq: ["$category", "No Category"] },
                then: "No Category",
                else: "$categoryInfo.categoryName"
              }
            },
            totalTasks: 1,
            completedTasks: 1,
            completedRate: 1
          }
        },
        {
          $sort: {
            category: 1
          }
        }
      ]);
  
      if (result.length === 0) {
        return res.status(200).json({ message: "No data found" });
      }
      console.log('gettaskcompletedtate by category :', result)
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };

exports.getProgressStepRate = async (req,res) => {
  
  try{
    const { id } = req.query
    const formatUser = req.user && isValidObjectId(req.user.id) ?  new Types.ObjectId(req.user.id) : null
    const formatId = isValidObjectId(id) ?  new Types.ObjectId(id) : null
    const userFilter = formatUser ? { user: formatUser } : req.guestId ? { guestId: req.guestId } : {}
   
    if (!userFilter) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (id) {
      if (!formatId) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      userFilter._id = formatId;
    }
    const task = await Tasks.findOne(userFilter)
    console.log('ss',task)
    const totalSteps = task.progress.totalSteps
    const completedSteps = task.progress.steps.filter((step) => step.completed).length
    const progressPercentage = task.progress?.totalSteps === 0 ? 0 : (completedSteps / totalSteps) * 100
    console.log('completed ss',completedSteps)
    const progressResult = {
      id : task._id,
      title: task.title,
      totalSteps: task.progress.totalSteps,
      completedSteps : completedSteps,
      progressPercentage : progressPercentage
    }
    console.log('RESULT:',progressResult)
    return res.status(200).json(progressResult)
  } catch(error){
    console.error(error)
    return res.status(500).json({error: error.message})
  }
}