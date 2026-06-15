import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, LogOut, School } from "lucide-react";
import { getErrorMessage, submitEnquiry } from "../services/api";

const initialForm = {
  parent_name: "",
  parent_phone: "",
  parent_email: "",
  child_name: "",
  child_age: "",
  program_interest: "",
  source: "website",
  referral_by: "",
  address: ""
};

const getStoredParent = () => {
  try {
    const stored = localStorage.getItem("parent");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const Enquiry = () => {
  const navigate = useNavigate();
  const [parent, setParent] = useState(() => getStoredParent());
  const [form, setForm] = useState(() => {
    const storedParent = getStoredParent();
    return {
      ...initialForm,
      parent_name: storedParent?.name || "",
      parent_phone: storedParent?.phone || "",
      parent_email: storedParent?.email || ""
    };
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.parent_name.trim()) next.parent_name = "Parent name is required";
    if (!form.parent_phone.trim()) next.parent_phone = "Phone number is required";
    if (!form.parent_email.trim()) next.parent_email = "Email is required from parent login";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const logoutParent = () => {
    localStorage.removeItem("parentToken");
    localStorage.removeItem("parent");
    setParent(null);
    toast.success("Parent logged out");
    navigate("/parent-login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitEnquiry({ ...form, child_age: form.child_age ? Number(form.child_age) : null });
      setSubmitted(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
      errors[field] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Thank you!</h1>
          <p className="mt-3 text-slate-600">Our team will contact you within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <School className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">FirstCry Intellitots Admission Enquiry</h1>
            <p className="text-sm text-slate-500">Submit your details and our counsellor will call you.</p>
          </div>
        </div>

        {parent ? (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Parent session active</p>
              <p className="text-sm text-indigo-700">{parent.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/parent-portal"
                className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Parent Portal
              </Link>
              <button
                type="button"
                onClick={logoutParent}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <LogOut className="h-4 w-4" />
                Logout Parent
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Parent login is required for parents. Staff users can still preview this page.{" "}
            <Link to="/parent-login" className="font-semibold underline">
              Go to parent login
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Parent Name*
              <input value={form.parent_name} onChange={(event) => update("parent_name", event.target.value)} className={inputClass("parent_name")} />
              {errors.parent_name && <span className="mt-1 block text-xs text-red-600">{errors.parent_name}</span>}
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Phone*
              <input value={form.parent_phone} onChange={(event) => update("parent_phone", event.target.value)} className={inputClass("parent_phone")} />
              {errors.parent_phone && <span className="mt-1 block text-xs text-red-600">{errors.parent_phone}</span>}
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                value={form.parent_email}
                onChange={(event) => update("parent_email", event.target.value)}
                readOnly={Boolean(parent?.email)}
                className={`${inputClass("parent_email")} ${parent?.email ? "bg-slate-100 text-slate-600" : ""}`}
              />
              {errors.parent_email && <span className="mt-1 block text-xs text-red-600">{errors.parent_email}</span>}
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Child Name
              <input value={form.child_name} onChange={(event) => update("child_name", event.target.value)} className={inputClass("child_name")} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Child Age
              <input type="number" min="1" max="8" value={form.child_age} onChange={(event) => update("child_age", event.target.value)} className={inputClass("child_age")} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Program Interest
              <input value={form.program_interest} onChange={(event) => update("program_interest", event.target.value)} placeholder="Playgroup, Nursery, LKG..." className={inputClass("program_interest")} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Source
              <select value={form.source} onChange={(event) => update("source", event.target.value)} className={inputClass("source")}>
                {["website", "whatsapp", "phone", "walk-in", "referral", "social-media"].map((source) => (
                  <option key={source} value={source}>
                    {source.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              How did you hear about us?
              <input value={form.referral_by} onChange={(event) => update("referral_by", event.target.value)} className={inputClass("referral_by")} />
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Address
              <textarea value={form.address} onChange={(event) => update("address", event.target.value)} rows="3" className={inputClass("address")} />
            </label>
          </div>
          <button type="submit" disabled={loading} className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700">
            {loading ? "Submitting..." : "Submit Enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Enquiry;
