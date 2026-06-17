import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarPlus, PhoneCall, WandSparkles } from "lucide-react";
import {
  bookTour,
  getCallScript,
  getErrorMessage,
  getLead,
  getTourSlots,
  logFollowUp,
  updateLeadStatus
} from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import StatusBadge from "../components/Common/StatusBadge";
import { formatDate, formatDateTime } from "../utils/format";

const statusOptions = ["new", "contacted", "demo-scheduled", "demo-visited", "follow-up", "admitted", "not-interested", "lost"];

const LogCallModal = ({ leadId, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    outcome: "answered",
    status_changed_to: "contacted",
    duration_mins: "",
    notes: "",
    next_action: "",
    next_follow_up_date: ""
  });

  const mutation = useMutation({
    mutationFn: () =>
      logFollowUp(leadId, {
        ...form,
        duration_mins: form.duration_mins ? Number(form.duration_mins) : null
      }),
    onSuccess: () => {
      toast.success("Follow-up logged");
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-950">Log Follow-up Call</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Outcome
            <select value={form.outcome} onChange={(event) => setForm((current) => ({ ...current, outcome: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {["answered", "no-answer", "callback-requested", "interested", "not-interested", "admitted", "rescheduled"].map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Status
            <select value={form.status_changed_to} onChange={(event) => setForm((current) => ({ ...current, status_changed_to: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Duration Minutes
            <input type="number" min="0" value={form.duration_mins} onChange={(event) => setForm((current) => ({ ...current, duration_mins: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Next Follow-up
            <input type="date" value={form.next_follow_up_date} onChange={(event) => setForm((current) => ({ ...current, next_follow_up_date: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Next Action
            <input value={form.next_action} onChange={(event) => setForm((current) => ({ ...current, next_action: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Notes
            <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows="4" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Save Follow-up
          </button>
        </div>
      </div>
    </div>
  );
};

const BookTourModal = ({ leadId, onClose }) => {
  const queryClient = useQueryClient();
  const [slotId, setSlotId] = useState("");
  const slotsQuery = useQuery({ queryKey: ["tour-slots", "available"], queryFn: () => getTourSlots({ days: 30 }) });
  const mutation = useMutation({
    mutationFn: () => bookTour({ lead_id: leadId, slot_id: Number(slotId) }),
    onSuccess: () => {
      toast.success("Tour booked");
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["tour-slots"] });
      onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-950">Book Demo Tour</h2>
        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Available Slot
          <select value={slotId} onChange={(event) => setSlotId(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">Choose slot</option>
            {(slotsQuery.data || []).map((slot) => (
              <option key={slot.id} value={slot.id}>
                {formatDate(slot.slot_date)} at {slot.slot_time} ({slot.available_count} available)
              </option>
            ))}
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button type="button" disabled={!slotId || mutation.isPending} onClick={() => mutation.mutate()} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

const LeadDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [logOpen, setLogOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [script, setScript] = useState("");

  const leadQuery = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLead(id)
  });

  const statusMutation = useMutation({
    mutationFn: (status) => updateLeadStatus(id, { status, note: `Status updated to ${status}` }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const scriptMutation = useMutation({
    mutationFn: () => getCallScript(id),
    onSuccess: (data) => setScript(data.script),
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (leadQuery.isLoading) {
    return <LoadingSpinner label="Loading lead" />;
  }

  if (!leadQuery.data) {
    return <p className="text-sm text-slate-500">Lead not found.</p>;
  }

  const lead = leadQuery.data;

  return (
    <div className="space-y-6">
      <Link to="/leads" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{lead.parent_name}</h2>
              <p className="mt-1 text-slate-500">
                {lead.child_name || "Child"} {lead.child_age ? `- ${lead.child_age} years` : ""} | {lead.program_interest || "Program not set"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <StatusBadge value={lead.status} />
              <StatusBadge value={lead.priority} type="priority" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Detail label="Phone" value={lead.parent_phone} />
            <Detail label="Email" value={lead.parent_email || "-"} />
            <Detail label="Source" value={lead.source?.replace(/-/g, " ")} />
            <Detail label="Counsellor" value={lead.counsellor_name || "Unassigned"} />
            <Detail label="Next Follow-up" value={formatDate(lead.next_follow_up_date)} />
            <Detail label="Created" value={formatDateTime(lead.created_at)} />
            <Detail label="Address" value={lead.address || "-"} wide />
            <Detail label="Notes" value={lead.notes || "-"} wide />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-950">Actions</h3>
          <div className="mt-4 space-y-3">
            <select
              value={lead.status}
              onChange={(event) => statusMutation.mutate(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/-/g, " ")}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setLogOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              <PhoneCall className="h-4 w-4" />
              Log Call
            </button>
            <button type="button" onClick={() => setTourOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              <CalendarPlus className="h-4 w-4" />
              Book Tour
            </button>
            <button type="button" onClick={() => scriptMutation.mutate()} className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              <WandSparkles className="h-4 w-4" />
              Generate Call Script
            </button>
          </div>
        </div>
      </section>

      {script && (
        <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
          <h3 className="font-bold text-indigo-950">AI Call Script</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm leading-6 text-slate-700">{script}</pre>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-950">Follow-up Timeline</h3>
          <div className="mt-5 space-y-5">
            {(lead.follow_ups || []).length === 0 ? (
              <p className="text-sm text-slate-500">No follow-ups logged yet.</p>
            ) : (
              lead.follow_ups.map((item) => (
                <div key={item.id} className="relative border-l-2 border-indigo-200 pl-4">
                  <span className="absolute -left-2 top-0 h-3 w-3 rounded-full bg-indigo-600" />
                  <p className="text-sm font-semibold text-slate-950">
                    {item.outcome.replace(/-/g, " ")} {item.status_changed_to ? `- ${item.status_changed_to.replace(/-/g, " ")}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(item.created_at)} by {item.counsellor_name}
                  </p>
                  {item.notes && <p className="mt-2 text-sm text-slate-600">{item.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-950">Tour Booking</h3>
          <div className="mt-4 space-y-3">
            {(lead.tour_bookings || []).length === 0 ? (
              <p className="text-sm text-slate-500">No tour booked yet.</p>
            ) : (
              lead.tour_bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-950">
                      {formatDate(booking.slot_date)} at {booking.slot_time}
                    </p>
                    <StatusBadge value={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Booked by {booking.booked_by_name || "Counsellor"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {logOpen && <LogCallModal leadId={id} onClose={() => setLogOpen(false)} />}
      {tourOpen && <BookTourModal leadId={Number(id)} onClose={() => setTourOpen(false)} />}
    </div>
  );
};

const Detail = ({ label, value, wide = false }) => (
  <div className={wide ? "md:col-span-2" : ""}>
    <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
    <p className="mt-1 text-sm text-slate-800">{value}</p>
  </div>
);

export default LeadDetail;
