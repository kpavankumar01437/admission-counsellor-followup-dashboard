import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Activity, ClipboardCheck, Lightbulb, RefreshCw, School, Users } from "lucide-react";
import {
  createReferral,
  createWorkflowEvent,
  getErrorMessage,
  getOperationalRecommendations,
  getOperationsSummary,
  getReferrals,
  getSeatAvailability,
  getWorkflowEvents,
  saveSeatAvailability
} from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import EmptyState from "../components/Common/EmptyState";
import { formatDateTime } from "../utils/format";

const sourceOptions = [
  { value: "teacher-dashboard", label: "Teacher Dashboard" },
  { value: "daycare-routine", label: "Daycare Routine Entry" },
  { value: "classroom-activity", label: "Classroom Activity" },
  { value: "centre-admin-panel", label: "Centre Admin Panel" },
  { value: "counsellor-follow-up", label: "Counsellor Follow-up" }
];

const statusOptions = ["new", "in-review", "action-needed", "completed"];
const priorityOptions = ["high", "medium", "low"];

const humanize = (value = "") => value.toString().replace(/-/g, " ");

const SummaryTile = ({ label, value, icon: Icon, tone = "indigo" }) => {
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

const Pill = ({ value, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    "action-needed": "bg-red-100 text-red-700",
    "in-review": "bg-indigo-100 text-indigo-700",
    new: "bg-blue-100 text-blue-700"
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tones[tone] || tones.slate}`}>{humanize(value)}</span>;
};

const Operations = () => {
  const queryClient = useQueryClient();
  const [eventForm, setEventForm] = useState({
    source: "teacher-dashboard",
    child_name: "",
    parent_email: "",
    title: "",
    details: "",
    status: "new",
    priority: "medium",
    owner_type: "teacher"
  });
  const [seatForm, setSeatForm] = useState({
    program: "Nursery",
    academic_year: "2026-27",
    total_seats: "24",
    filled_seats: "18"
  });
  const [referralForm, setReferralForm] = useState({
    referred_parent_name: "",
    referred_parent_phone: "",
    referred_child_name: "",
    referral_source: "",
    status: "new",
    reward_status: "pending"
  });

  const summaryQuery = useQuery({ queryKey: ["operations", "summary"], queryFn: getOperationsSummary });
  const eventsQuery = useQuery({ queryKey: ["operations", "events"], queryFn: () => getWorkflowEvents() });
  const seatsQuery = useQuery({ queryKey: ["operations", "seats"], queryFn: getSeatAvailability });
  const referralsQuery = useQuery({ queryKey: ["operations", "referrals"], queryFn: getReferrals });
  const recommendationsQuery = useQuery({ queryKey: ["operations", "recommendations"], queryFn: getOperationalRecommendations });

  const invalidateOperations = () => {
    queryClient.invalidateQueries({ queryKey: ["operations"] });
  };

  const eventMutation = useMutation({
    mutationFn: createWorkflowEvent,
    onSuccess: () => {
      toast.success("Workflow record saved");
      setEventForm((current) => ({ ...current, child_name: "", parent_email: "", title: "", details: "" }));
      invalidateOperations();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const seatMutation = useMutation({
    mutationFn: saveSeatAvailability,
    onSuccess: () => {
      toast.success("Seat availability updated");
      invalidateOperations();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const referralMutation = useMutation({
    mutationFn: createReferral,
    onSuccess: () => {
      toast.success("Referral saved");
      setReferralForm((current) => ({ ...current, referred_parent_name: "", referred_parent_phone: "", referred_child_name: "", referral_source: "" }));
      invalidateOperations();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (summaryQuery.isLoading) {
    return <LoadingSpinner label="Loading operations" />;
  }

  const summary = summaryQuery.data || {};
  const events = eventsQuery.data || [];
  const seats = seatsQuery.data || [];
  const referrals = referralsQuery.data || [];
  const recommendations = recommendationsQuery.data || [];

  const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Smart Prototype Layer</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">School Operations Workflow</h1>
          <p className="mt-1 text-sm text-slate-500">Teacher, daycare, classroom, parent portal, referrals, seats, and admission action history in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => invalidateOperations()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Workflow Records" value={summary.total_events || 0} icon={Activity} />
        <SummaryTile label="Action Needed" value={summary.action_needed || 0} icon={ClipboardCheck} tone={summary.action_needed > 0 ? "red" : "emerald"} />
        <SummaryTile label="Available Seats" value={summary.available_seats || 0} icon={School} tone="emerald" />
        <SummaryTile label="Open Referrals" value={summary.open_referrals || 0} icon={Users} tone="amber" />
      </div>

      <section className="rounded-lg border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-indigo-700" />
          <h2 className="text-lg font-bold text-slate-950">Rule-Based Recommendations</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recommendations.map((item) => (
            <div key={`${item.type}-${item.title}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <Pill value={item.priority} tone={item.priority} />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Input Source Entry</h2>
          <p className="mt-1 text-sm text-slate-500">Use this for teacher dashboard, daycare routine, classroom activity, centre admin, or counsellor updates.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              eventMutation.mutate(eventForm);
            }}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <label className="text-sm font-semibold text-slate-700">
              Source Screen
              <select value={eventForm.source} onChange={(event) => setEventForm((current) => ({ ...current, source: event.target.value }))} className={inputClass}>
                {sourceOptions.map((source) => (
                  <option key={source.value} value={source.value}>{source.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Child Name
              <input value={eventForm.child_name} onChange={(event) => setEventForm((current) => ({ ...current, child_name: event.target.value }))} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Parent Email
              <input type="email" value={eventForm.parent_email} onChange={(event) => setEventForm((current) => ({ ...current, parent_email: event.target.value }))} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Title*
              <input required value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Status
              <select value={eventForm.status} onChange={(event) => setEventForm((current) => ({ ...current, status: event.target.value }))} className={inputClass}>
                {statusOptions.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Priority
              <select value={eventForm.priority} onChange={(event) => setEventForm((current) => ({ ...current, priority: event.target.value }))} className={inputClass}>
                {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Details
              <textarea value={eventForm.details} onChange={(event) => setEventForm((current) => ({ ...current, details: event.target.value }))} rows="3" className={inputClass} />
            </label>
            <button type="submit" disabled={eventMutation.isPending} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 md:col-span-2">
              Save Workflow Record
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Seat Availability</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              seatMutation.mutate({
                ...seatForm,
                total_seats: Number(seatForm.total_seats),
                filled_seats: Number(seatForm.filled_seats)
              });
            }}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <label className="text-sm font-semibold text-slate-700">
              Program
              <input value={seatForm.program} onChange={(event) => setSeatForm((current) => ({ ...current, program: event.target.value }))} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Academic Year
              <input value={seatForm.academic_year} onChange={(event) => setSeatForm((current) => ({ ...current, academic_year: event.target.value }))} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Total Seats
              <input type="number" min="0" value={seatForm.total_seats} onChange={(event) => setSeatForm((current) => ({ ...current, total_seats: event.target.value }))} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Filled Seats
              <input type="number" min="0" value={seatForm.filled_seats} onChange={(event) => setSeatForm((current) => ({ ...current, filled_seats: event.target.value }))} className={inputClass} />
            </label>
            <button type="submit" disabled={seatMutation.isPending} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 md:col-span-2">
              Update Seats
            </button>
          </form>

          <div className="mt-5 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Program</th>
                  <th className="px-3 py-3">Year</th>
                  <th className="px-3 py-3">Filled</th>
                  <th className="px-3 py-3">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seats.map((seat) => (
                  <tr key={seat.id}>
                    <td className="px-3 py-3 font-semibold text-slate-950">{seat.program}</td>
                    <td className="px-3 py-3 text-slate-600">{seat.academic_year}</td>
                    <td className="px-3 py-3 text-slate-600">{seat.filled_seats}/{seat.total_seats}</td>
                    <td className="px-3 py-3">
                      <Pill value={seat.available_seats} tone={seat.available_seats <= 3 ? "high" : "low"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Referral Tracking</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            referralMutation.mutate(referralForm);
          }}
          className="mt-5 grid gap-4 md:grid-cols-3"
        >
          <label className="text-sm font-semibold text-slate-700">
            Referred Parent*
            <input required value={referralForm.referred_parent_name} onChange={(event) => setReferralForm((current) => ({ ...current, referred_parent_name: event.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Phone
            <input value={referralForm.referred_parent_phone} onChange={(event) => setReferralForm((current) => ({ ...current, referred_parent_phone: event.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Child Name
            <input value={referralForm.referred_child_name} onChange={(event) => setReferralForm((current) => ({ ...current, referred_child_name: event.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Referral Source
            <input value={referralForm.referral_source} onChange={(event) => setReferralForm((current) => ({ ...current, referral_source: event.target.value }))} className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Status
            <select value={referralForm.status} onChange={(event) => setReferralForm((current) => ({ ...current, status: event.target.value }))} className={inputClass}>
              {["new", "contacted", "converted", "closed"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Reward Status
            <select value={referralForm.reward_status} onChange={(event) => setReferralForm((current) => ({ ...current, reward_status: event.target.value }))} className={inputClass}>
              {["not-applicable", "pending", "issued"].map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
            </select>
          </label>
          <button type="submit" disabled={referralMutation.isPending} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 md:col-span-3">
            Save Referral
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Action History</h2>
        <div className="mt-4 overflow-auto">
          {events.length === 0 ? (
            <EmptyState title="No workflow records yet" />
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Child</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 capitalize text-slate-600">{humanize(event.source)}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-950">{event.title}</p>
                      {event.details && <p className="mt-1 max-w-xl text-xs text-slate-500">{event.details}</p>}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{event.child_name || "-"}</td>
                    <td className="px-3 py-3"><Pill value={event.status} tone={event.status} /></td>
                    <td className="px-3 py-3"><Pill value={event.priority} tone={event.priority} /></td>
                    <td className="px-3 py-3 text-slate-600">{formatDateTime(event.updated_at || event.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Referral History</h2>
        <div className="mt-4 overflow-auto">
          {referrals.length === 0 ? (
            <EmptyState title="No referrals yet" />
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Parent</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Child</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 font-semibold text-slate-950">{referral.referred_parent_name}</td>
                    <td className="px-3 py-3 text-slate-600">{referral.referred_parent_phone || "-"}</td>
                    <td className="px-3 py-3 text-slate-600">{referral.referred_child_name || "-"}</td>
                    <td className="px-3 py-3"><Pill value={referral.status} /></td>
                    <td className="px-3 py-3"><Pill value={referral.reward_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Operations;
