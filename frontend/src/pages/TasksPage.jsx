import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck, faXmark, faCalendarAlt, faBolt, faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { useTasksQuery } from "../hooks/queries/useTasks";
import { setSelectedTask, toggleCreatePopup } from "../redux/uiSlice";
import TaskFilters from "../components/tasks/TaskFilters";
import TasksSidebar from "../components/tasks/TasksSidebar";
import CreateTask from "../components/task/CreateTask";
import usePopup from "../hooks/usePopup";
import {
  EXP_BY_PRIORITY,
  COIN_BY_PRIORITY,
  PRIORITY_CONFIG,
  getDeadlineMeta,
} from "../constants/taskConstants";

const TaskDetail = React.lazy(() => import("../components/task/taskDetail"));

function sortTasks(tasks, sortBy) {
  const clone = [...tasks];
  const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
  if (sortBy === "priority") {
    return clone.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2));
  }
  if (sortBy === "deadline") {
    return clone.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }
  // created — default server order (newest first via _id)
  return clone.sort((a, b) => (b._id > a._id ? 1 : -1));
}

// ── TaskRow ───────────────────────────────────────────────────────────────────

function TaskRow({ task, isSelected, onCheck, onClick, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const priority  = task.priority || "low";
  const pConfig   = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low;
  const deadlineMeta = getDeadlineMeta(task.deadline);
  const exp       = EXP_BY_PRIORITY[priority]  ?? 10;
  const coin      = COIN_BY_PRIORITY[priority] ?? 5;
  const hasSteps  = task.progress?.totalSteps > 0;
  const categoryName = typeof task.category === "string"
    ? task.category
    : task.category?.categoryName ?? null;

  return (
    <li
      onClick={(e) => {
        if (e.target.closest("button")) return;
        onClick(task);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer text-white border transition-all duration-200 ${
        isSelected
          ? "bg-purpleActiveTask border-purpleBorder"
          : task.status === "completed"
          ? "bg-completedTask border-purpleNormal hover:bg-completedTheme opacity-50"
          : task.status === "failed"
          ? "bg-failedTask border-purpleNormal"
          : "border-purpleNormal hover:bg-purpleNormal"
      }`}
      style={{ borderLeftColor: pConfig.border, borderLeftWidth: 3 }}
    >
      {/* Left: checkbox + content */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox / status icon */}
        <div className="flex-shrink-0">
          {task.status === "completed" ? (
            <button
              onClick={(e) => { e.stopPropagation(); onCheck(task); }}
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0"
              style={{ borderColor: pConfig.dot }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9, color: pConfig.dot }} />
            </button>
          ) : task.status === "failed" ? (
            <span className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faXmark} className="text-red-500" style={{ fontSize: 9 }} />
            </span>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onCheck(task); }}
              className="w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0"
              style={{ borderColor: pConfig.dot }}
            />
          )}
        </div>

        {/* Title + badges + progress */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate">{task.title}</h3>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* Priority badge */}
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: pConfig.dot }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pConfig.dot }} />
              {pConfig.label}
            </span>

            {/* Category badge */}
            {categoryName && (
              <span className="flex items-center gap-1 text-xs text-gray-300 bg-white/5 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purpleBorder flex-shrink-0" />
                {categoryName}
              </span>
            )}

            {/* Deadline badge */}
            {deadlineMeta && (
              <span className="flex items-center gap-1 text-xs" style={{ color: deadlineMeta.color }}>
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                {deadlineMeta.label}
              </span>
            )}
          </div>

          {/* Subtask progress */}
          {task.status === "pending" && hasSteps && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {Array.from({ length: task.progress.totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-3 rounded-md ${
                    i < task.progress.completedSteps
                      ? "bg-green-500"
                      : "border border-purpleNormal bg-transparent"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {task.progress.completedSteps} of {task.progress.totalSteps} subtasks left
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: EXP pill + delete */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-purpleBorder bg-purpleBorder/20 text-purple-300">
          <FontAwesomeIcon icon={faBolt} className="text-xs" />
          +{exp} EXP
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/60 bg-amber-500/10 text-amber-300">
          <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
          +{coin} Coin
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          className={`transition-opacity duration-200 ${
            task.status !== "pending"
              ? "opacity-0 pointer-events-none"
              : hovered
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-60"
          }`}
        >
          <FontAwesomeIcon icon={faXmark} className="text-lg text-gray-400 hover:text-white" />
        </button>
      </div>
    </li>
  );
}

// ── TasksPage ─────────────────────────────────────────────────────────────────

function TasksPage() {
  const dispatch = useDispatch();
  const { selectedTask, isCreate } = useSelector((state) => state.ui);

  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [sortBy,         setSortBy]         = useState("deadline");

  const { data: rawTasks = [] } = useTasksQuery({});
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];

  const priorityCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    tasks.forEach((t) => { if (t.priority in counts) counts[t.priority]++; });
    return counts;
  }, [tasks]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, completed: 0 };
    tasks.forEach((t) => { if (t.status in counts) counts[t.status]++; });
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);
    if (statusFilter !== "all")   result = result.filter((t) => t.status === statusFilter);
    return sortTasks(result, sortBy);
  }, [tasks, priorityFilter, statusFilter, sortBy]);

  const [visibleCount, setVisibleCount] = useState(10);
  const scrollContainerRef = useRef(null);
  const sentinelRef        = useRef(null);

  // Reset scroll + visible slice when filters/sort change
  useEffect(() => {
    setVisibleCount(10);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [filteredTasks]);

  // Infinite scroll: reveal 10 more when sentinel enters view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount((c) => Math.min(c + 10, filteredTasks.length));
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredTasks.length]);

  const visibleTasks = filteredTasks.slice(0, visibleCount);

  const { handleCloseDetail, handleCompletedTask, handleRemovedTask, popupRef } = usePopup();

  const handleTaskClick = (task) => dispatch(setSelectedTask(task));
  const handleNewTask   = () => dispatch(toggleCreatePopup());

  return (
    <div className="px-6 md:px-10 py-8 min-h-screen">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-gray-400 text-xs tracking-widest font-semibold">MISSION CONTROL</p>
          <h1 className="text-white text-4xl font-bold mt-1">Tasks</h1>
        </div>
        <button
          onClick={handleNewTask}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purpleBorder hover:bg-purpleBorder/80 text-white font-semibold text-sm transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
          New Task
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: filters + task list */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <TaskFilters
            priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
            statusFilter={statusFilter}     setStatusFilter={setStatusFilter}
            sortBy={sortBy}                 setSortBy={setSortBy}
            priorityCounts={priorityCounts} statusCounts={statusCounts}
            totalCount={tasks.length}       filteredCount={filteredTasks.length}
          />

          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
              <p className="text-lg">No tasks match your filters</p>
              <button
                onClick={handleNewTask}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purpleNormal hover:border-purpleBorder text-sm transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} /> Add a task
              </button>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="max-h-[55vh] overflow-y-auto pr-1"
            >
              <ul className="flex flex-col gap-3">
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    isSelected={selectedTask?._id === task._id}
                    onCheck={handleCompletedTask}
                    onClick={handleTaskClick}
                    onDelete={handleRemovedTask}
                  />
                ))}
              </ul>
              {visibleCount < filteredTasks.length && (
                <div ref={sentinelRef} className="h-4" />
              )}
            </div>
          )}
        </div>

        {/* Right: sidebar (hidden on small screens) */}
        <div className="hidden lg:block w-[360px] flex-shrink-0">
          <TasksSidebar />
        </div>
      </div>

      {/* Portal: task detail */}
      {selectedTask &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content">
              <Suspense fallback={<></>}>
                <TaskDetail onClose={handleCloseDetail} />
              </Suspense>
            </div>
          </div>,
          document.body
        )}

      {/* Portal: create task */}
      {isCreate &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content" ref={popupRef}>
              <CreateTask onClose={handleNewTask} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default TasksPage;
