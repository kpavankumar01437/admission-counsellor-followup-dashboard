import { ClipboardList } from "lucide-react";

const EmptyState = ({ title = "No data found", actionLabel, onAction }) => {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <ClipboardList className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
