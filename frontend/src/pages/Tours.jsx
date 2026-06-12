import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarPlus } from "lucide-react";
import {
  bookTour,
  createTourSlot,
  getErrorMessage,
  getLeads,
  getTourSlots,
  updateTourBooking
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import StatusBadge from "../components/Common/StatusBadge";
import { formatDate } from "../utils/format";

const Tours = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [leadId, setLeadId] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    slot_date: "",
    slot_time: "",
    capacity: 5,
    notes: ""
  });

  const slotsQuery = useQuery({
    queryKey: ["tour-slots", "calendar"],
    queryFn: () => getTourSlots({ include_full: true, days: 30 })
  });
  const leadsQuery = useQuery({
    queryKey: ["leads", "tour-select"],
    queryFn: () => getLeads({ status: "contacted" })
  });

  const bookMutation = useMutation({
    mutationFn: () => bookTour({ lead_id: Number(leadId), slot_id: selectedSlot.id }),
    onSuccess: () => {
      toast.success("Tour booked");
      queryClient.invalidateQueries({ queryKey: ["tour-slots"] });
      setSelectedSlot(null);
      setLeadId("");
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const slotMutation = useMutation({
    mutationFn: () => createTourSlot({ ...slotForm, capacity: Number(slotForm.capacity) }),
    onSuccess: () => {
      toast.success("Slot created");
      queryClient.invalidateQueries({ queryKey: ["tour-slots"] });
      setAddOpen(false);
      setSlotForm({ slot_date: "", slot_time: "", capacity: 5, notes: "" });
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const bookingStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }) => updateTourBooking(bookingId, { status }),
    onSuccess: () => {
      toast.success("Booking updated");
      queryClient.invalidateQueries({ queryKey: ["tour-slots"] });
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  const groupedSlots = useMemo(() => {
    return (slotsQuery.data || []).reduce((groups, slot) => {
      const key = String(slot.slot_date).slice(0, 10);
      groups[key] = groups[key] || [];
      groups[key].push(slot);
      return groups;
    }, {});
  }, [slotsQuery.data]);

  if (slotsQuery.isLoading) {
    return <LoadingSpinner label="Loading tours" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <p className="text-sm text-slate-500">Available demo visit slots for the next 30 days.</p>
        {isAdmin && (
          <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            <CalendarPlus className="h-4 w-4" />
            Add Slot
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groupedSlots).map(([date, slots]) => (
          <section key={date} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">{formatDate(date)}</h2>
            <div className="mt-4 space-y-3">
              {slots.map((slot) => (
                <div key={slot.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{slot.slot_time}</p>
                      <p className="text-sm text-slate-500">
                        {slot.booked_count}/{slot.capacity} booked | {slot.available_count} available
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={slot.available_count <= 0}
                      onClick={() => setSelectedSlot(slot)}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Book
                    </button>
                  </div>
                  {slot.bookings?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {slot.bookings.map((booking) => (
                        <div key={booking.id} className="rounded-md bg-slate-50 p-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">{booking.parent_name}</p>
                              <p className="text-xs text-slate-500">{booking.child_name || "Child"} | {booking.parent_phone}</p>
                            </div>
                            <StatusBadge value={booking.status} />
                          </div>
                          <select
                            value={booking.status}
                            onChange={(event) => bookingStatusMutation.mutate({ bookingId: booking.id, status: event.target.value })}
                            className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            {["confirmed", "visited", "cancelled", "no-show"].map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-950">Book Lead for {formatDate(selectedSlot.slot_date)} at {selectedSlot.slot_time}</h2>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Select Lead
              <select value={leadId} onChange={(event) => setLeadId(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="">Choose contacted lead</option>
                {(leadsQuery.data || []).map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.parent_name} - {lead.child_name || "Child"}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setSelectedSlot(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
                Cancel
              </button>
              <button type="button" disabled={!leadId || bookMutation.isPending} onClick={() => bookMutation.mutate()} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-950">Add Tour Slot</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Date
                <input type="date" value={slotForm.slot_date} onChange={(event) => setSlotForm((current) => ({ ...current, slot_date: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Time
                <input type="time" value={slotForm.slot_time} onChange={(event) => setSlotForm((current) => ({ ...current, slot_time: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Capacity
                <input type="number" min="1" value={slotForm.capacity} onChange={(event) => setSlotForm((current) => ({ ...current, capacity: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Notes
                <input value={slotForm.notes} onChange={(event) => setSlotForm((current) => ({ ...current, notes: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setAddOpen(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
                Cancel
              </button>
              <button type="button" disabled={slotMutation.isPending} onClick={() => slotMutation.mutate()} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Create Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tours;
