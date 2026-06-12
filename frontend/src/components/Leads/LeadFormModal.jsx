import { useState } from "react";
import { X } from "lucide-react";

const initialState = {
  parent_name: "",
  parent_phone: "",
  parent_email: "",
  child_name: "",
  child_age: "",
  program_interest: "",
  source: "phone",
  priority: "medium",
  counsellor_id: "",
  notes: ""
};

const sources = ["walk-in", "website", "referral", "whatsapp", "phone", "social-media"];
const priorities = ["high", "medium", "low"];

const LeadFormModal = ({ open, onClose, onSubmit, counsellors = [], isAdmin = false }) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.parent_name.trim()) nextErrors.parent_name = "Parent name is required";
    if (!form.parent_phone.trim()) nextErrors.parent_phone = "Phone number is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        child_age: form.child_age ? Number(form.child_age) : null,
        counsellor_id: form.counsellor_id || undefined
      });
      setForm(initialState);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 ${
      errors[field] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-950">New Lead</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Parent Name*
            <input value={form.parent_name} onChange={(event) => update("parent_name", event.target.value)} className={fieldClass("parent_name")} />
            {errors.parent_name && <span className="mt-1 block text-xs text-red-600">{errors.parent_name}</span>}
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Phone*
            <input value={form.parent_phone} onChange={(event) => update("parent_phone", event.target.value)} className={fieldClass("parent_phone")} />
            {errors.parent_phone && <span className="mt-1 block text-xs text-red-600">{errors.parent_phone}</span>}
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Email
            <input type="email" value={form.parent_email} onChange={(event) => update("parent_email", event.target.value)} className={fieldClass("parent_email")} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Child Name
            <input value={form.child_name} onChange={(event) => update("child_name", event.target.value)} className={fieldClass("child_name")} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Child Age
            <input type="number" min="1" max="8" value={form.child_age} onChange={(event) => update("child_age", event.target.value)} className={fieldClass("child_age")} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Program Interest
            <input value={form.program_interest} onChange={(event) => update("program_interest", event.target.value)} className={fieldClass("program_interest")} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Source
            <select value={form.source} onChange={(event) => update("source", event.target.value)} className={fieldClass("source")}>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Priority
            <select value={form.priority} onChange={(event) => update("priority", event.target.value)} className={fieldClass("priority")}>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          {isAdmin && (
            <label className="text-sm font-semibold text-slate-700">
              Counsellor Assign
              <select value={form.counsellor_id} onChange={(event) => update("counsellor_id", event.target.value)} className={fieldClass("counsellor_id")}>
                <option value="">Auto / current user</option>
                {counsellors.map((counsellor) => (
                  <option key={counsellor.id} value={counsellor.id}>
                    {counsellor.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              rows="4"
              className={fieldClass("notes")}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            {submitting ? "Saving..." : "Create Lead"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadFormModal;
