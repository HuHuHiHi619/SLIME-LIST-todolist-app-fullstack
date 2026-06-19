import { useState, useCallback, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faCalendarAlt, faBolt } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";

import FadeUpContainer from "../animation/FadeUpContainer";

const CATEGORY_COLORS = { Work: "#9999E3", Study: "#5B8DEF", Health: "#2BB795", Personal: "#E06AC4" };
import ProgressBar from "../dashboard/ProgressBar";
import { useCompleteTaskMutation, useUpdateTaskMutation } from "../../hooks/queries/useTasks";
import { setSelectedTask } from "../../redux/uiSlice";
import {
  EXP_BY_PRIORITY,
  COIN_BY_PRIORITY,
  PRIORITY_CONFIG,
  getDeadlineMeta,
} from "../../constants/taskConstants";

function TaskDetail({ onClose }) {
  const dispatch = useDispatch();
  const { selectedTask } = useSelector((state) => state.ui);

  const completeTaskMutation = useCompleteTaskMutation();
  const updateMutation = useUpdateTaskMutation();

  const [steps, setSteps] = useState(selectedTask?.progress?.steps || []);
  const [completingSteps, setCompletingSteps] = useState(new Set());

  const debouncedUpdate = useRef(
    debounce((taskData) => {
      updateMutation.mutate({ taskId: taskData._id, taskData });
    }, 500)
  ).current;

  useEffect(() => {
    setSteps(selectedTask?.progress?.steps || []);
  }, [selectedTask?._id]);

  useEffect(() => {
    return () => debouncedUpdate.flush();
  }, [debouncedUpdate]);

  const handleToggleStep = useCallback(
    (index) => {
      setSteps((prev) => {
        const wasCompleted = prev[index].completed;
        const updated = prev.map((s, i) =>
          i === index ? { ...s, completed: !s.completed } : s
        );
        if (!wasCompleted) {
          setCompletingSteps((c) => new Set(c).add(index));
          setTimeout(
            () => setCompletingSteps((c) => { const n = new Set(c); n.delete(index); return n; }),
            600
          );
        }
        debouncedUpdate({
          _id: selectedTask._id,
          progress: {
            ...selectedTask.progress,
            steps: updated,
            totalSteps: updated.length,
            allStepsCompleted: updated.length > 0 && updated.every((s) => s.completed),
          },
        });
        return updated;
      });
    },
    [selectedTask, debouncedUpdate]
  );

  const handleMarkComplete = () => {
    completeTaskMutation.mutate(selectedTask._id);
    dispatch(setSelectedTask(null));
  };

  if (!selectedTask) return null;

  const priority    = selectedTask.priority || "low";
  const pConfig     = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low;
  const deadlineMeta = getDeadlineMeta(selectedTask.deadline);
  const exp         = EXP_BY_PRIORITY[priority]  ?? 10;
  const coin        = COIN_BY_PRIORITY[priority] ?? 5;
  const categoryName = typeof selectedTask.category === "string"
    ? selectedTask.category
    : selectedTask.category?.categoryName ?? null;
  const categoryColor = CATEGORY_COLORS[categoryName] ?? "#9999E3";

  const totalSteps     = steps.length;
  const completedSteps = steps.filter((s) => s.completed).length;
  const pct            = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <FadeUpContainer>
      <div className="bg-darkBackground p-6 rounded-3xl w-[560px] max-w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold">
            Task Details
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-4">{selectedTask.title}</h2>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{
              backgroundColor: pConfig.dot + "33",
              border: `1px solid ${pConfig.dot}66`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: pConfig.dot }}
            />
            {pConfig.label.charAt(0) + pConfig.label.slice(1).toLowerCase()} priority
          </span>

          {categoryName && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm text-gray-300 bg-white/10 border border-white/10">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColor }} />
              {categoryName}
            </span>
          )}

          {deadlineMeta && (
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/10 border border-white/10"
              style={{ color: deadlineMeta.color }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
              {deadlineMeta.label}
            </span>
          )}
        </div>

        {/* Reward on Complete */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-6">
          <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold">
            Reward on Complete
          </p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-purpleBorder bg-purpleBorder/20 text-purple-300">
              <FontAwesomeIcon icon={faBolt} className="text-xs" />
              +{exp} EXP
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/60 bg-amber-500/10 text-amber-300">
              <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
              +{coin} Coin
            </span>
          </div>
        </div>

        {/* Subtasks */}
        {totalSteps > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white">
                Subtasks{" "}
                <span className="text-gray-400 font-normal">
                  · {completedSteps}/{totalSteps}
                </span>
              </p>
              <span className="text-sm font-semibold" style={{ color: "#A88BFF" }}>
                {pct}%
              </span>
            </div>
            <div className="mb-3">
              <ProgressBar value={pct} />
            </div>
            <ul className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <li
                  key={i}
                  onClick={() => handleToggleStep(i)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer ${
                    step.completed
                      ? "bg-green-500/10 border-green-500/40"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  } ${completingSteps.has(i) ? "scale-[1.01] shadow-[0_0_10px_rgba(34,197,94,0.35)]" : ""}`}
                  style={{
                    transition: completingSteps.has(i)
                      ? "border-color 300ms ease, background-color 300ms ease, transform 300ms ease, box-shadow 300ms ease"
                      : "border-color 200ms ease, background-color 200ms ease, transform 200ms ease",
                  }}
                >
                  <span
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      step.completed
                        ? "border-green-400 bg-green-500"
                        : "border-gray-500"
                    }`}
                  >
                    {step.completed && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-white"
                        style={{ fontSize: 9 }}
                      />
                    )}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      step.completed ? "text-gray-400 line-through" : "text-white"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mark complete */}
        {selectedTask.status === "pending" && (
          <button
            onClick={handleMarkComplete}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-base transition-colors"
          >
            <FontAwesomeIcon icon={faCheck} />
            Mark complete
          </button>
        )}
      </div>
    </FadeUpContainer>
  );
}

export default TaskDetail;
