import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FileUp, Plus, Search } from "lucide-react";
import {
  createLead,
  getCounsellors,
  getErrorMessage,
  getLeads,
  importLeads,
  updateLeadStatus
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import StatusBadge from "../components/Common/StatusBadge";
import EmptyState from "../components/Common/EmptyState";
import LeadFormModal from "../components/Leads/LeadFormModal";
import { formatDateTime } from "../utils/format";

const statuses = ["", "new", "contacted", "demo-scheduled", "demo-visited", "follow-up", "admitted", "not-interested", "lost"];
const priorities = ["", "high", "medium", "low"];
const pageSize = 10;

const parseCsv = (text) => {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((value) => value.trim());
  return lines
    .filter(Boolean)
    .map((line) => {
      const values = line.split(",").map((value) => value.trim());
      return headers.reduce((row, header, index) => {
        row[header] = values[index] || "";
        return row;
      }, {});
    });
};

const Leads = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const fileRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const [modalOpen, setModalOpen] = useState(params.get("new") === "1");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: params.get("search") || "",
    status: "",
    priority: "",
    counsellor_id: "",
    date_from: "",
    date_to: ""
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const nextParams = new URLSearchParams(location.search);
    if (nextParams.get("new") === "1") setModalOpen(true);
    if (nextParams.get("search")) {
      setFilters((current) => ({ ...current, search: nextParams.get("search") || "" }));
    }
  }, [location.search]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const cleanFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
    [filters]
  );

  const leadsQuery = useQuery({
    queryKey: ["leads", cleanFilters],
    queryFn: () => getLeads(cleanFilters)
  });

  const counsellorsQuery = useQuery({
    queryKey: ["counsellors"],
    queryFn: getCounsellors,
    enabled: isAdmin
  });

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      toast.success("Lead created");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      navigate("/leads", { replace: true });
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateLeadStatus(id, { status, note: `Quick status changed to ${status}` }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const importMutation = useMutation({
    mutationFn: importLeads,
    onSuccess: (data) => {
      toast.success(`Imported ${data.imported}, skipped ${data.skipped}`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const leads = leadsQuery.data || [];
  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));
  const visible = leads.slice((page - 1) * pageSize, page * pageSize);

  const updateFilter = (field, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importMutation.mutate(parseCsv(text));
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <p className="text-sm text-slate-500">Manage parent enquiries, lead ownership, and funnel progress.</p>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <FileUp className="h-4 w-4" />
            Import CSV
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Lead
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Parent name, child name, phone"
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {statuses.map((status) => (
              <option key={status || "all"} value={status}>
                {status ? status.replace(/-/g, " ") : "All statuses"}
              </option>
            ))}
          </select>
          <select value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {priorities.map((priority) => (
              <option key={priority || "all"} value={priority}>
                {priority || "All priorities"}
              </option>
            ))}
          </select>
          {isAdmin && (
            <select
              value={filters.counsellor_id}
              onChange={(event) => updateFilter("counsellor_id", event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All counsellors</option>
              {(counsellorsQuery.data || []).map((counsellor) => (
                <option key={counsellor.id} value={counsellor.id}>
                  {counsellor.name}
                </option>
              ))}
            </select>
          )}
          <input type="date" value={filters.date_from} onChange={(event) => updateFilter("date_from", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={filters.date_to} onChange={(event) => updateFilter("date_to", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {leadsQuery.isLoading ? (
          <LoadingSpinner label="Loading leads" />
        ) : leads.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No leads found" actionLabel="Add Lead" onAction={() => setModalOpen(true)} />
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Parent Name</th>
                    <th className="px-4 py-3">Child Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Counsellor</th>
                    <th className="px-4 py-3">Last Updated</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-950">{lead.parent_name}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.child_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.parent_phone}</td>
                      <td className="px-4 py-3">
                        <StatusBadge value={lead.status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={lead.priority} type="priority" />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.counsellor_name || "Unassigned"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(lead.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/leads/${lead.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            View
                          </Link>
                          <select
                            defaultValue=""
                            onChange={(event) => event.target.value && statusMutation.mutate({ id: lead.id, status: event.target.value })}
                            className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                          >
                            <option value="">Update</option>
                            {statuses.filter(Boolean).map((status) => (
                              <option key={status} value={status}>
                                {status.replace(/-/g, " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
              <p className="text-slate-500">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, leads.length)} of {leads.length}
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-slate-300 px-3 py-1.5">
                  Previous
                </button>
                <span className="rounded-md bg-slate-100 px-3 py-1.5">
                  {page} / {totalPages}
                </span>
                <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-slate-300 px-3 py-1.5">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <LeadFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          navigate("/leads", { replace: true });
        }}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
        counsellors={counsellorsQuery.data || []}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Leads;
