import React, { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTasksQuery, useCompleteTaskMutation } from "../../hooks/queries/useTasks";
import { toggleCreatePopup, setSelectedTask } from "../../redux/uiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBolt } from "@fortawesome/free-solid-svg-icons";
import ReactDOM from "react-dom";

const TaskDetail = React.lazy(() => import("../task/taskDetail"));
const CreateTask = React.lazy(() => import("../task/CreateTask"));

const EXP_BY_PRIORITY = { low: 10, medium: 25, high: 50 };
const COIN_BY_PRIORITY = { low: 5, medium: 10, high: 20 };

function MissionRow({ task, onComplete, onTaskClick, isCompleting, isFading }) {
  const isDone = task.status === "completed";
  const exp = EXP_BY_PRIORITY[task.priority] ?? 10;
  const coin = COIN_BY_PRIORITY[task.priority] ?? 5;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl border ${
        isCompleting
          ? "border-emerald-600 bg-emerald-500/10"
          : isDone
          ? "border-emerald-600 bg-emerald-500/10"
          : "border-purpleNormal hover:border-purpleBorder"
      } ${isFading ? "opacity-0" : "opacity-100"}`}
      style={{
        transition: isCompleting
          ? "border-color 300ms ease, background-color 300ms ease, opacity 400ms ease"
          : "border-color 200ms ease, background-color 200ms ease",
      }}
    >
      <button
        onClick={() => !isDone && !isCompleting && onComplete(task._id)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          isDone || isCompleting
            ? "bg-emerald-500 border-emerald-500"
            : "border-gray-500 hover:border-purpleBorder"
        }`}
        aria-label={isDone ? "Completed" : "Mark complete"}
      >
        {(isDone || isCompleting) && <span className="text-white text-xs leading-none">✓</span>}
      </button>

      <button
        className="flex-1 text-left min-w-0"
        onClick={() => onTaskClick(task)}
      >
        <p className={`text-xl font-medium uppercase truncate ${isDone ? "text-gray-400 line-through" : "text-white"}`}>
          {task.title}
        </p>
      </button>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="flex items-center gap-1  px-2 py-1 rounded-full bg-purpleNormal  border border-purpleBorder text-white whitespace-nowrap">
          + {exp} EXP
        </span>
        <span className="flex items-center gap-1  px-2 py-1 rounded-full bg-amber-300 border bg-opacity-20 border-amber-300 text-amber-300 whitespace-nowrap"

        >
           + {coin} Coin
        </span>
      </div>
    </div>
  );
}

function DailyMissionsPanel() {
  const dispatch = useDispatch();
  const { selectedTask, isCreate } = useSelector((state) => state.ui);
  const { data: tasks = [] } = useTasksQuery({ status: "pending" });
  const completeMutation = useCompleteTaskMutation();
  const [completing, setCompleting] = React.useState(new Set());
  const [fading, setFading] = React.useState(new Set());

  const missions = tasks.slice(0, 5);
  const totalExp = missions.reduce((sum, t) => sum + (EXP_BY_PRIORITY[t.priority] ?? 10), 0);

  const handleComplete = (id) => {
    setCompleting((prev) => new Set(prev).add(id));

    setTimeout(() => setFading((prev) => new Set(prev).add(id)), 600);

    setTimeout(() => {
      completeMutation.mutate(id, {
        onError: () => {
          setCompleting((prev) => { const n = new Set(prev); n.delete(id); return n; });
          setFading((prev) => { const n = new Set(prev); n.delete(id); return n; });
        },
      });
    }, 1000);
  };
  const handleTaskClick = (task) => dispatch(setSelectedTask(task));
  const handleCloseDetail = () => dispatch(setSelectedTask(null));
  const handleOpenCreate = () => dispatch(toggleCreatePopup());

  return (
    <>
      <div className="rounded-3xl border-2 border-purpleNormal bg-purpleMain p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h2 className="text-white text-4xl tracking-wider font-bold">Daily Missions</h2>
            <p className="text-gray-400 text-xl mt-0.5">
              Finish missions to feed{" "}
              <span className="text-slime-purple text-xl font-semibold">{totalExp} EXP</span>{" "}
              into your slime today.
            </p>
          </div>
          {missions.length > 0 && (
            <span className="text-gray-400 text-xl whitespace-nowrap flex-shrink-0">
              {missions.length} left
            </span>
          )}
        </div>

        {/* Mission rows */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[240px] pr-4">
          {missions.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-2xl">All missions cleared!</p>
          ) : (
            missions.map((task) => (
              <MissionRow
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onTaskClick={handleTaskClick}
                isCompleting={completing.has(task._id)}
                isFading={fading.has(task._id)}
              />
            ))
          )}
        </div>

        {/* New mission */}
        <button
          onClick={handleOpenCreate}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-purpleNormal text-gray-400 text-xl hover:border-purpleBorder hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          New mission
        </button>
      </div>

      {/* Task detail portal */}
      {selectedTask &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content">
              <Suspense fallback={null}>
                <TaskDetail onClose={handleCloseDetail} />
              </Suspense>
            </div>
          </div>,
          document.body
        )}

      {/* Create task portal */}
      {isCreate &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content">
              <Suspense fallback={null}>
                <CreateTask onClose={handleOpenCreate} />
              </Suspense>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default DailyMissionsPanel;
