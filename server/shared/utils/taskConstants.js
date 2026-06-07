// TASK_STATUSES: valid enum values for schema/validation.
// STATUS_ORDER: display/sort order — kept separate so sort order can change without touching validation.
const TASK_STATUSES = ["pending", "completed", "failed"];
const STATUS_ORDER = ["pending", "completed", "failed"];
const PRIORITIES = ["low", "medium", "high"];
// Sort order: highest priority first. Lowercase to match the schema enum.
const PRIORITY_ORDER = ["high", "medium", "low"];

module.exports = { TASK_STATUSES, STATUS_ORDER, PRIORITIES, PRIORITY_ORDER };
