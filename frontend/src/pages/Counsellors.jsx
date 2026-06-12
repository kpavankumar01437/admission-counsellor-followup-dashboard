import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { createCounsellor, getCounsellors, getErrorMessage } from "../services/api";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import { formatDate } from "../utils/format";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "Counsellor@123",
  role: "counsellor"
};

const Counsellors = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const counsellorsQuery = useQuery({ queryKey: ["counsellors"], queryFn: getCounsellors });

  const createMutation = useMutation({
    mutationFn: createCounsellor,
    onSuccess: () => {
      toast.success("Counsellor created");
      queryClient.invalidateQueries({ queryKey: ["counsellors"] });
      setOpen(false);
      setForm(initialForm);
    },
    onError: (error) => toast.error(getErrorMessage(error))
  });

  if (counsellorsQuery.isLoading) {
    return <LoadingSpinner label="Loading counsellors" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <p className="text-sm text-slate-500">Manage active counsellor and centre head accounts.</p>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
          New Counsellor
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(counsellorsQuery.data || []).map((counsellor) => (
                <tr key={counsellor.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{counsellor.name}</td>
                  <td className="px-4 py-3 text-slate-600">{counsellor.email}</td>
                  <td className="px-4 py-3 text-slate-600">{counsellor.phone || "-"}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{counsellor.role.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(counsellor.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-950">Create Counsellor</h2>
            <div className="mt-5 grid gap-4">
              <Input label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <Input label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} type="email" />
              <Input label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              <Input label="Password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} type="password" />
              <label className="text-sm font-semibold text-slate-700">
                Role
                <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
                  <option value="counsellor">Counsellor</option>
                  <option value="centre_head">Centre Head</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
                Cancel
              </button>
              <button type="button" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text" }) => (
  <label className="text-sm font-semibold text-slate-700">
    {label}
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
  </label>
);

export default Counsellors;
