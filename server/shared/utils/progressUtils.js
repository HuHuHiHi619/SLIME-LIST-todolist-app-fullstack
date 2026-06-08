const processProgress = (progress) => {
  if (progress && typeof progress === "object") {
    if (Array.isArray(progress.steps)) {
      progress.steps = progress.steps.map((step) => {
        if (typeof step.label !== "string" || step.label.length > 100) {
          throw new Error("Invalid label: must be a string with max length 100");
        }
        return {
          label: step.label.trim(),
          completed: step.completed === "true" || step.completed === true,
        };
      });
    } else {
      throw new Error("Invalid steps format");
    }

    progress.totalSteps = progress.steps.length;
    if (progress.steps.length === 0) {
      progress.allStepsCompleted = false;
    } else {
      progress.allStepsCompleted =
        progress.totalSteps > 0 && progress.steps.every((step) => step.completed);
    }

    return progress;
  } else {
    throw new Error("Invalid progress data");
  }
};

const calculateProgress = (task) => {
  if (task.progress && task.progress.steps) {
    const totalSteps = task.progress.steps.length || 0;
    const completedSteps = task.progress.steps.filter((step) => step.completed).length;
    const progressPercentage = totalSteps === 0 ? 0 : (completedSteps / totalSteps) * 100;
    return {
      ...task,
      progress: {
        ...task.progress,
        completedSteps,
        progressPercentage,
      },
    };
  }
  return task;
};

module.exports = { processProgress, calculateProgress };
