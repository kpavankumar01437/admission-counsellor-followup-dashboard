import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, ClipboardList, LogOut, School } from "lucide-react";
import { getErrorMessage, submitParentPortalUpdate } from "../services/api";

const getStoredParent = () => {
  try {
    const stored = localStorage.getItem("parent");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const ParentPortal = () => {
  const navigate = useNavigate();
  const [parent, setParent] = useState(() => getStoredParent());
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    child_name: "",
    title: "Admission detail update",
    details: "",
    priority: "medium"
  });
  const [loading, setLoading] = useState(false);

  const logoutParent = () => {
    localStorage.removeItem("parentToken");
    localStorage.removeItem("parent");
    setParent(null);
    toast.success("Parent logged out");
    navigate("/parent-login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!parent?.email) {
      toast.error("Parent login is required");
      navigate("/parent-login");
      return;
    }

    setLoading(true);
    try {
      await submitParentPortalUpdate({
        parent_email: parent.email,
        child_name: form.child_name,
        title: form.title,
        details: form.details,
        priority: form.priority
      });
      setSubmitted(true);
      setForm((current) => ({ ...current, child_name: "", details: "" }));
      toast.success("Update sent to school team");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <School className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Parent Portal</h1>
              <p className="text-sm text-slate-500">Send child, admission, daycare, or routine updates to the centre team.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logoutParent}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout Parent
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900">Logged in as parent</p>
              <p className="text-sm text-indigo-700">{parent?.email}</p>
            </div>

            {submitted && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                <div>
                  <p className="font-semibold text-emerald-900">Update submitted</p>
                  <p className="text-sm text-emerald-700">The school team can now view this in Operations action history.</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Child Name
                <input value={form.child_name} onChange={(event) => setForm((current) => ({ ...current, child_name: event.target.value }))} className={inputClass} />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Priority
                <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className={inputClass}>
                  {["high", "medium", "low"].map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">
                Update Title*
                <input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} />
              </label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">
                Details*
                <textarea required value={form.details} onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))} rows="5" className={inputClass} />
              </label>
            </div>

            <button type="submit" disabled={loading} className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700">
              {loading ? "Sending..." : "Send Update"}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <ClipboardList className="h-8 w-8 text-indigo-700" />
              <h2 className="mt-3 font-bold text-slate-950">What can parents update?</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Admission information</p>
                <p>Daycare routine preference</p>
                <p>Classroom or demo feedback</p>
                <p>Contact or child details</p>
              </div>
            </div>
            <Link to="/enquiry" className="block rounded-lg bg-slate-900 p-5 font-semibold text-white hover:bg-slate-800">
              Continue to enquiry form
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;
