import { useSummaryQuery, useSummaryByCategoryQuery } from "../../hooks/queries/useSummary";
import { useTasksQuery } from "../../hooks/queries/useTasks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { EXP_BY_PRIORITY, COIN_BY_PRIORITY } from "../../constants/taskConstants";

const CATEGORY_COLORS = [
  "#6D6DFD", "#E37DDE", "#2BB795", "#DEA331", "#31B3DE", "#E22D38", "#B45CFF",
];

function ProgressDonut({ pct, completed, total }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = circ * (pct / 100);

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#363669" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="url(#donut-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
        />
        <defs>
          <linearGradient id="donut-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6D6DFD" />
            <stop offset="100%" stopColor="#CE88FA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white text-xl font-bold">{Math.round(pct)}%</span>
        <span className="text-gray-400 text-xs">{completed}/{total}</span>
      </div>
    </div>
  );
}

function CategoryBar({ name, completed, total, rate, color }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-white text-sm">{name}</span>
        </div>
        <span className="text-gray-400 text-xs">{completed}/{total} · {Math.round(rate)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-purpleNormal overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${rate}%`, background: color }}
        />
      </div>
    </div>
  );
}

function useEarnedToday(tasks) {
  const todayStr = new Date().toDateString();
  return (tasks || [])
    .filter((t) => t.status === "completed" && new Date(t.updatedAt).toDateString() === todayStr)
    .reduce(
      (acc, t) => ({
        exp:  acc.exp  + (EXP_BY_PRIORITY[t.priority]  ?? 0),
        coin: acc.coin + (COIN_BY_PRIORITY[t.priority] ?? 0),
      }),
      { exp: 0, coin: 0 }
    );
}

function TasksSidebar() {
  const { data: summary } = useSummaryQuery();
  const { data: byCategory } = useSummaryByCategoryQuery();
  const { data: rawTasks } = useTasksQuery({});

  const summaryData = Array.isArray(summary) ? summary[0] : null;
  const totalTasks     = summaryData?.totalTasks     ?? 0;
  const completedTasks = summaryData?.completedTasks ?? 0;
  const completedRate  = summaryData?.completedRate  ?? 0;

  const categories = Array.isArray(byCategory) ? byCategory : [];
  const earned = useEarnedToday(Array.isArray(rawTasks) ? rawTasks : []);

  return (
    <div className="rounded-2xl border border-purpleNormal bg-purpleMain p-6">
      <h2 className="text-white text-lg font-bold mb-4">Overall Progress</h2>
      <div className="flex items-center gap-4 mb-4">
        <ProgressDonut pct={completedRate} completed={completedTasks} total={totalTasks} />
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 text-xs tracking-widest font-semibold">EARNED TODAY</p>
          <span className="flex items-center gap-1.5 text-purple-300 font-bold text-base">
            <FontAwesomeIcon icon={faBolt} className="text-sm" />
            {earned.exp} EXP
          </span>
          <span className="flex items-center gap-1.5 text-amber-300 font-bold text-base">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 flex-shrink-0" />
            {earned.coin} Coins
          </span>
        </div>
      </div>

      {categories.length > 0 && (
        <>
          <hr className="border-purpleNormal mt-4 mb-4" />
          <p className="text-gray-400 text-xs tracking-widest font-semibold mb-4">BY CATEGORY</p>
          <div className="flex flex-col gap-4">
            {categories.map((cat, i) => (
              <CategoryBar
                key={cat.category}
                name={cat.category}
                completed={cat.completedTasks}
                total={cat.totalTasks}
                rate={cat.completedRate}
                color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TasksSidebar;
