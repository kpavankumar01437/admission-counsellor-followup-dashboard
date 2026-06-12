import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Clock, Phone, RefreshCw, Users } from "lucide-react";
import {
  getAnalyticsFunnel,
  getAnalyticsSummary,
  getMonthlyTrend,
  getOverdueFollowUps,
  getTodayFollowUps,
  getErrorMessage,
  logFollowUp,
  recalculatePriority
} from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import StatusBadge from "../components/Common/StatusBadge";
import EmptyState from "../components/Common/EmptyState";
import ChartFrame from "../components/Common/ChartFrame";
import { formatDate } from "../utils/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const SummaryCard = ({ label, value, icon: Icon, tone = "indigo" }) => {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const MarkCalledModal = ({ lead, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    outcome: "answered",
    notes: "",
    next_follow_up_date: "",
    status_changed_to: "contacted"
  });

  const mutation = useMutation({
    mutationFn: () => logFollowUp(lead.id, form),
    onSuccess: () => {
      toast.success("Follow-up logged");
      queryClient.invalidateQueries();
      onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-950">Mark Called: {lead.parent_name}</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Outcome
            <select
              value={form.outcome}
              onChange={(event) => setForm((current) => ({ ...current, outcome: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              {["answered", "no-answer", "callback-requested", "interested", "not-interested", "admitted", "rescheduled"].map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Status
            <select
              value={form.status_changed_to}
              onChange={(event) => setForm((current) => ({ ...current, status_changed_to: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              {["contacted", "demo-scheduled", "follow-up", "admitted", "not-interested", "lost"].map((status) => (
                <option key={status} value={status}>
                  {status.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows="3"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Next Follow-up Date
            <input
              type="date"
              value={form.next_follow_up_date}
              onChange={(event) => setForm((current) => ({ ...current, next_follow_up_date: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Save Call
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [activeLead, setActiveLead] = useState(null);
  const summaryQuery = useQuery({ queryKey: ["analytics", "summary"], queryFn: getAnalyticsSummary });
  const funnelQuery = useQuery({ queryKey: ["analytics", "funnel"], queryFn: getAnalyticsFunnel });
  const monthlyQuery = useQuery({ queryKey: ["analytics", "monthly"], queryFn: getMonthlyTrend });
  const todayQuery = useQuery({ queryKey: ["followups", "today"], queryFn: getTodayFollowUps });
  const overdueQuery = useQuery({ queryKey: ["followups", "overdue"], queryFn: getOverdueFollowUps });

  const recalcMutation = useMutation({
    mutationFn: recalculatePriority,
    onSuccess: (data) => {
      toast.success(`${data.updated} leads updated`);
      queryClient.invalidateQueries();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (summaryQuery.isLoading) {
    return <LoadingSpinner label="Loading dashboard" />;
  }

  const summary = summaryQuery.data || {};
  const today = todayQuery.data || [];
  const overdue = overdueQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <p className="text-sm text-slate-500">Admissions funnel, follow-up alerts, and counsellor workload in one place.</p>
        <button
          type="button"
          onClick={() => recalcMutation.mutate()}
          disabled={recalcMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Recalculate Priority
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Leads" value={summary.total_leads || 0} icon={Users} />
        <SummaryCard label="Conversion Rate" value={`${summary.conversion_rate || 0}%`} icon={CheckCircle2} tone="emerald" />
        <SummaryCard label="Pending Today" value={summary.pending_followups_today || 0} icon={Clock} tone="amber" />
        <SummaryCard label="Overdue" value={summary.overdue_count || 0} icon={AlertTriangle} tone={summary.overdue_count > 0 ? "red" : "indigo"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Funnel by Stage</h2>
          <div className="mt-4">
            <ChartFrame>
              {({ width, height }) => (
              <BarChart width={width} height={height} data={funnelQuery.data || []} layout="vertical" margin={{ left: 35 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 6, 6, 0]} />
              </BarChart>
              )}
            </ChartFrame>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Monthly Lead Trend</h2>
          <div className="mt-4">
            <ChartFrame>
              {({ width, height }) => (
              <LineChart width={width} height={height} data={monthlyQuery.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
              )}
            </ChartFrame>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-slate-950">Today's Follow-ups</h2>
          <div className="mt-4 overflow-auto">
            {today.length === 0 ? (
              <EmptyState title="No follow-ups due today" />
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Parent</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {today.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-semibold text-slate-900">{lead.parent_name}</td>
                      <td className="px-3 py-3 text-slate-600">{lead.parent_phone}</td>
                      <td className="px-3 py-3">
                        <StatusBadge value={lead.status} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge value={lead.priority} type="priority" />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setActiveLead(lead)}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Mark Called
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-red-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-red-700">Overdue Alerts</h2>
          <div className="mt-4 space-y-3">
            {overdue.length === 0 ? (
              <p className="text-sm text-slate-500">No overdue leads.</p>
            ) : (
              overdue.map((lead) => (
                <div key={lead.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="font-semibold text-red-900">{lead.parent_name}</p>
                  <p className="text-sm text-red-700">{lead.parent_phone}</p>
                  <p className="mt-1 text-xs text-red-600">Due: {formatDate(lead.next_follow_up_date)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {activeLead && <MarkCalledModal lead={activeLead} onClose={() => setActiveLead(null)} />}
    </div>
  );
};

export default Dashboard;
