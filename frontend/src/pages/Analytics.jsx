import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Download } from "lucide-react";
import { getAnalyticsFunnel, getCounsellorStats, getMonthlyTrend } from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";

const conversionClass = (value) => {
  if (value > 30) return "text-emerald-700 bg-emerald-50";
  if (value > 15) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
};

const Analytics = () => {
  const statsQuery = useQuery({ queryKey: ["analytics", "counsellor"], queryFn: getCounsellorStats });
  const funnelQuery = useQuery({ queryKey: ["analytics", "funnel"], queryFn: getAnalyticsFunnel });
  const monthlyQuery = useQuery({ queryKey: ["analytics", "monthly"], queryFn: getMonthlyTrend });

  const stats = useMemo(() => statsQuery.data || [], [statsQuery.data]);
  const csv = useMemo(() => {
    const header = ["Name", "Total Leads", "Calls Made", "Demos Done", "Admitted", "Conversion %"];
    const rows = stats.map((row) => [
      row.name,
      row.total_leads,
      row.calls_made,
      row.demos_done,
      row.admitted_count,
      row.conversion_rate
    ]);
    return [header, ...rows].map((row) => row.join(",")).join("\n");
  }, [stats]);

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "counsellor-performance.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (statsQuery.isLoading) {
    return <LoadingSpinner label="Loading analytics" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <p className="text-sm text-slate-500">Counsellor performance, funnel conversion, and lead trends.</p>
        <button type="button" onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Counsellor Performance</h2>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Total Leads</th>
                <th className="px-4 py-3">Calls Made</th>
                <th className="px-4 py-3">Demos Done</th>
                <th className="px-4 py-3">Admitted</th>
                <th className="px-4 py-3">Conversion %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{row.name}</td>
                  <td className="px-4 py-3">{row.total_leads}</td>
                  <td className="px-4 py-3">{row.calls_made}</td>
                  <td className="px-4 py-3">{row.demos_done}</td>
                  <td className="px-4 py-3">{row.admitted_count}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${conversionClass(row.conversion_rate)}`}>
                      {row.conversion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Funnel Visualization</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelQuery.data || []} layout="vertical" margin={{ left: 35 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Monthly Trend</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyQuery.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
