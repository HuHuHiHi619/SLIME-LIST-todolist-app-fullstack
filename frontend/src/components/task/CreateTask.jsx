import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFormTask, addSteps, removeStep } from "../../redux/formSlice";
import { useCreateTaskMutation } from "../../hooks/queries/useTasks";
import FadeUpContainer from "../animation/FadeUpContainer";
import { toDayISO } from "../../functions/date";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faPlus, faCheck, faBolt, faCalendarAlt, faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  PRIORITY_CONFIG,
  EXP_BY_PRIORITY,
  COIN_BY_PRIORITY,
  getDeadlineMeta,
} from "../../constants/taskConstants";

const PRIORITIES = ["low", "medium", "high"];

const DEADLINE_OPTIONS = [
  { label: "Today",    days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In a week", days: 7 },
];

const PRESET_CATEGORIES = [
  { name: "Work",     color: "#9999E3" },
  { name: "Study",    color: "#5B8DEF" },
  { name: "Health",   color: "#2BB795" },
  { name: "Personal", color: "#E06AC4" },
];

function optionISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDayISO(d);
}

function CreateTask({ onClose }) {
  const dispatch = useDispatch();
  const { formTask, progress } = useSelector((state) => state.form);
  const createMutation = useCreateTaskMutation();
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const menuContainerRef = useRef(null);

  const selectedPriority = formTask.priority || "low";
  const pConfig = PRIORITY_CONFIG[selectedPriority];
  const exp  = EXP_BY_PRIORITY[selectedPriority];
  const coin = COIN_BY_PRIORITY[selectedPriority];
  const deadlineLabel = getDeadlineMeta(formTask.deadline)?.label ?? "Today";

  useEffect(() => {
    function handleOutside(e) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

  const validator = () => {
    setError("");
    if (!formTask.title) { setError("Title is required."); return false; }
    if (formTask.title.length > 50) { setError("Title cannot be more than 50 characters."); return false; }
    if ((formTask.note || "").length > 200) { setError("Note cannot be more than 200 characters."); return false; }
    if (currentStep.length > 50) { setError("Step cannot be more than 50 characters."); return false; }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFormTask({ [name]: value }));
  };

  const handleAddStep = (e) => {
    if (e.key === "Enter" && currentStep.trim() !== "") {
      e.preventDefault();
      dispatch(addSteps({ label: currentStep, completed: false }));
      setCurrentStep("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validator()) return;
    createMutation.mutate(
      { ...formTask, priority: selectedPriority, progress },
      {
        onSuccess: () => onClose(),
        onError: () => setError("Failed to create task. Please try again."),
      }
    );
  };

  return (
    <FadeUpContainer>
      <div className="bg-darkBackground p-6 rounded-3xl w-[560px] max-w-full">
        <form onSubmit={handleSubmit}>

          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold">New Task</p>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Create a mission</h2>

          {/* Task name */}
          <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold mb-2">Task Name</p>
          <input
            type="text"
            name="title"
            placeholder="What needs doing?"
            value={formTask.title}
            onChange={handleInputChange}
            autoComplete="off"
            className="w-full text-base bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purpleBorder mb-4"
          />

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          {/* Details — 3 dropdowns in one row */}
          <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold mb-2">Details</p>
          <div className="flex gap-2 mb-4" ref={menuContainerRef}>

            {/* Priority */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => toggleMenu("priority")}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pConfig.dot }} />
                <span className="flex-1 text-left truncate">
                  {pConfig.label.charAt(0) + pConfig.label.slice(1).toLowerCase()} priority
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-gray-400 text-xs flex-shrink-0 transition-transform duration-200 ${openMenu === "priority" ? "rotate-180" : ""}`}
                />
              </button>
              {openMenu === "priority" && (
                <div className="absolute z-30 top-full mt-1 w-full bg-darkBackground border border-white/10 rounded-xl shadow-xl overflow-hidden">
                  {PRIORITIES.map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    const isActive = selectedPriority === p;
                    return (
                      <div
                        key={p}
                        onClick={() => { dispatch(setFormTask({ priority: p })); setOpenMenu(null); }}
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${isActive ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
                        <span className="flex-1">
                          {cfg.label.charAt(0) + cfg.label.slice(1).toLowerCase()} priority
                        </span>
                        {isActive && <FontAwesomeIcon icon={faCheck} className="text-xs text-purple-400" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => toggleMenu("category")}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PRESET_CATEGORIES.find(c => c.name === formTask.category)?.color ?? "#4b5563" }}
                />
                <span className={`flex-1 text-left truncate ${formTask.category ? "text-white" : "text-gray-400"}`}>
                  {formTask.category || "Category"}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-gray-400 text-xs flex-shrink-0 transition-transform duration-200 ${openMenu === "category" ? "rotate-180" : ""}`}
                />
              </button>
              {openMenu === "category" && (
                <div className="absolute z-30 top-full mt-1 w-full bg-darkBackground border border-white/10 rounded-xl shadow-xl overflow-hidden">
                  <div
                    onClick={() => { dispatch(setFormTask({ category: "" })); setOpenMenu(null); }}
                    className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${!formTask.category ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-600" />
                    <span className="flex-1">No category</span>
                    {!formTask.category && <FontAwesomeIcon icon={faCheck} className="text-xs text-purple-400" />}
                  </div>
                  {PRESET_CATEGORIES.map(({ name, color }) => {
                    const isActive = formTask.category === name;
                    return (
                      <div
                        key={name}
                        onClick={() => { dispatch(setFormTask({ category: name })); setOpenMenu(null); }}
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${isActive ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="flex-1">{name}</span>
                        {isActive && <FontAwesomeIcon icon={faCheck} className="text-xs text-purple-400" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deadline */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => toggleMenu("deadline")}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="text-amber-400 text-xs flex-shrink-0" />
                <span className="flex-1 text-left truncate">{deadlineLabel}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-gray-400 text-xs flex-shrink-0 transition-transform duration-200 ${openMenu === "deadline" ? "rotate-180" : ""}`}
                />
              </button>
              {openMenu === "deadline" && (
                <div className="absolute z-30 top-full mt-1 w-full bg-darkBackground border border-white/10 rounded-xl shadow-xl overflow-hidden">
                  {DEADLINE_OPTIONS.map(({ label, days }) => {
                    const iso = optionISO(days);
                    const isActive = days === 0
                      ? !formTask.deadline || formTask.deadline === iso
                      : formTask.deadline === iso;
                    return (
                      <div
                        key={label}
                        onClick={() => { dispatch(setFormTask({ deadline: iso })); setOpenMenu(null); }}
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${isActive ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                      >
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 text-xs flex-shrink-0" />
                        <span className="flex-1">{label}</span>
                        {isActive && <FontAwesomeIcon icon={faCheck} className="text-xs text-purple-400" />}
                      </div>
                    );
                  })}
                  <div className="px-3 pt-2 pb-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-1.5">Pick a date</p>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formTask.deadline ? formTask.deadline.split("T")[0] : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          dispatch(setFormTask({ deadline: toDayISO(new Date(e.target.value)) }));
                          setOpenMenu(null);
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purpleBorder"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Note */}
          <textarea
            name="note"
            placeholder="Add a note..."
            value={formTask.note || ""}
            onChange={handleInputChange}
            rows={2}
            className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:border-purpleBorder resize-none mb-4"
          />

          {/* Reward preview */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-6">
            <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold">Reward on Complete</p>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold">Subtasks</p>
              <span className="text-xs text-gray-500">optional</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a step, then Enter"
                value={currentStep}
                onChange={(e) => setCurrentStep(e.target.value)}
                onKeyDown={handleAddStep}
                autoComplete="off"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purpleBorder"
              />
              <button
                type="button"
                onClick={() => {
                  if (currentStep.trim()) {
                    dispatch(addSteps({ label: currentStep, completed: false }));
                    setCurrentStep("");
                  }
                }}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-purpleBorder hover:bg-purpleBorder/80 text-white flex-shrink-0 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {progress.steps.length === 0 && (
              <div className="flex items-center justify-center px-4 py-4 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm">
                No subtasks yet — add steps to break this mission down.
              </div>
            )}
            {progress.steps.length > 0 && (
              <ul className="flex flex-col gap-2">
                {progress.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-md border-2 border-gray-600 flex-shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-white">{step.label}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(removeStep(i))}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-purpleBorder hover:bg-purpleBorder/80 text-white font-semibold text-base transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faCheck} />
            {createMutation.isPending ? "Creating..." : "Create Task"}
          </button>

        </form>
      </div>
    </FadeUpContainer>
  );
}

export default CreateTask;
