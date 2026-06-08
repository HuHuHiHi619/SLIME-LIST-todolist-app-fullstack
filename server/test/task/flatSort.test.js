const { compareTasksForFlatList } = require("../../modules/task/helpers");

const sortTasks = (tasks) => [...tasks].sort(compareTasksForFlatList);
const names = (tasks) => tasks.map((t) => t.name);

describe("compareTasksForFlatList", () => {
  it("orders by status first: pending → completed → failed", () => {
    const tasks = [
      { name: "f", status: "failed", priority: "high" },
      { name: "c", status: "completed", priority: "high" },
      { name: "p", status: "pending", priority: "low" },
    ];
    expect(names(sortTasks(tasks))).toEqual(["p", "c", "f"]);
  });

  it("orders by priority high → medium → low within the same status", () => {
    const tasks = [
      { name: "lo", status: "pending", priority: "low" },
      { name: "hi", status: "pending", priority: "high" },
      { name: "md", status: "pending", priority: "medium" },
    ];
    expect(names(sortTasks(tasks))).toEqual(["hi", "md", "lo"]);
  });

  it("treats a missing priority as 'low'", () => {
    const tasks = [
      { name: "none", status: "pending" },
      { name: "hi", status: "pending", priority: "high" },
    ];
    expect(names(sortTasks(tasks))).toEqual(["hi", "none"]);
  });
});
