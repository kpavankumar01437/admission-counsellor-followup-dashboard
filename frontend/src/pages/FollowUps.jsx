import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOverdueFollowUps, getTodayFollowUps } from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import StatusBadge from "../components/Common/StatusBadge";
import EmptyState from "../components/Common/EmptyState";
import { formatDate } from "../utils/format";

const FollowUpTable = ({ title, leads, danger = false }) => (
  <section className={`rounded-lg border bg-white shadow-sm ${danger ? "border-red-200" : "border-slate-200"}`}>
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className={`text-lg font-bold ${danger ? "text-red-700" : "text-slate-950"}`}>{title}</h2>
    </div>
    {leads.length === 0 ? (
      <div className="p-6">
        <EmptyState title={`No ${title.toLowerCase()}`} />
      </div>
    ) : (
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Counsellor</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-950">{lead.parent_name}</td>
                <td className="px-4 py-3 text-slate-600">{lead.parent_phone}</td>
                <td className="px-4 py-3 text-slate-600">{lead.counsellor_name || "Unassigned"}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(lead.next_follow_up_date)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={lead.priority} type="priority" />
                </td>
                <td className="px-4 py-3">
                  <Link to={`/leads/${lead.id}`} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

const FollowUps = () => {
  const todayQuery = useQuery({ queryKey: ["followups", "today"], queryFn: getTodayFollowUps });
  const overdueQuery = useQuery({ queryKey: ["followups", "overdue"], queryFn: getOverdueFollowUps });

  if (todayQuery.isLoading || overdueQuery.isLoading) {
    return <LoadingSpinner label="Loading follow-ups" />;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Prioritized follow-up queues for active leads.</p>
      <FollowUpTable title="Due Today" leads={todayQuery.data || []} />
      <FollowUpTable title="Overdue Follow-ups" leads={overdueQuery.data || []} danger />
    </div>
  );
};

export default FollowUps;
