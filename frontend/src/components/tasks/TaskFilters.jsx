import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const SORT_OPTIONS = [
  { value: "deadline", label: "Deadline" },
  { value: "priority", label: "Priority" },
  { value: "created",  label: "Date Created" },
];

const PRIORITY_OPTS = [
  { value: "all",    label: "All" },
  { value: "high",   label: "High",   dot: "#E2553D" },
  { value: "medium", label: "Medium", dot: "#E0A53A" },
  { value: "low",    label: "Low",    dot: "#2BB795" },
];

const STATUS_OPTS = [
  { value: "all",       label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "completed", label: "Completed" },
];

function FilterChip({ value, active, label, count, dot, onClick }) {
  const activeStyle = active && dot ? { backgroundColor: dot } : undefined;
  const activeClass = active && !dot ? "bg-purpleBorder text-white" : active ? "text-white" : "text-gray-300 hover:text-white";

  return (
    <button
      onClick={() => onClick(value)}
      style={activeStyle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeClass}`}
    >
      {dot && !active && (
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      )}
      {label}
      {count != null && active && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">{count}</span>
      )}
      {count != null && !active && (
        <span className="text-xs text-gray-400">{count}</span>
      )}
    </button>
  );
}

function TaskFilters({
  priorityFilter, setPriorityFilter,
  statusFilter,   setStatusFilter,
  sortBy,         setSortBy,
  priorityCounts, statusCounts,
  totalCount,     filteredCount,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl border-2 border-purpleNormal bg-purpleMain p-4">
          <span className="block text-gray-400 text-xs tracking-widest font-semibold mb-3">PRIORITY</span>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTS.map((p) => (
              <FilterChip
                key={p.value}
                value={p.value}
                active={priorityFilter === p.value}
                label={p.label}
                count={p.value === "all" ? totalCount : priorityCounts[p.value]}
                dot={p.dot}
                onClick={setPriorityFilter}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-2xl border-2 border-purpleNormal bg-purpleMain p-4">
          <span className="block text-gray-400 text-xs tracking-widest font-semibold mb-3">STATUS</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTS.map((s) => (
              <FilterChip
                key={s.value}
                value={s.value}
                active={statusFilter === s.value}
                label={s.label}
                count={s.value === "all" ? totalCount : statusCounts[s.value]}
                onClick={setStatusFilter}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">
          Showing{" "}
          <span className="text-[#A88BFF] font-semibold">{filteredCount}</span>
          {" "}of{" "}
          <span className="text-[#A88BFF] font-semibold">{totalCount}</span>
          {" "}tasks
        </span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs tracking-widest">SORT BY</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-purpleNormal border border-purpleNormal text-white text-sm rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-purpleBorder cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faBars}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskFilters;
