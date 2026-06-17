const statusClasses = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-800",
  "demo-scheduled": "bg-purple-100 text-purple-700",
  "demo-visited": "bg-orange-100 text-orange-700",
  "follow-up": "bg-indigo-100 text-indigo-700",
  admitted: "bg-emerald-100 text-emerald-700",
  "not-interested": "bg-slate-100 text-slate-700",
  lost: "bg-red-100 text-red-700"
};

const priorityClasses = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700"
};

const StatusBadge = ({ value, type = "status" }) => {
  const classes = type === "priority" ? priorityClasses : statusClasses;
  const fallback = type === "priority" ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700";
  const label = value ? String(value).replace(/-/g, " ") : "unassigned";

  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-4 capitalize ${classes[value] || fallback}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
