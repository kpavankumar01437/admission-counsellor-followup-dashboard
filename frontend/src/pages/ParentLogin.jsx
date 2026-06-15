import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, School, ShieldCheck } from "lucide-react";
import { getErrorMessage, parentLogin } from "../services/api";

const ParentLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "parent@example.com",
    name: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem("parentToken")) {
    return <Navigate to="/enquiry" replace />;
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await parentLogin({
        email: form.email.trim(),
        name: form.name.trim() || null,
        phone: form.phone.trim() || null
      });

      localStorage.setItem("parentToken", data.token);
      localStorage.setItem("parent", JSON.stringify(data.parent));
      toast.success("Parent login successful");
      navigate("/enquiry");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `mt-2 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
      errors[field] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="hidden bg-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-indigo-700">
            <School className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-bold">FirstCry Intellitots</p>
            <p className="text-sm text-indigo-100">Parent admission portal</p>
          </div>
        </div>

        <div className="max-w-md">
          <div className="mb-8 grid gap-4">
            {["Login with email", "Fill enquiry form", "Counsellor follows up"].map((step) => (
              <div key={step} className="rounded-lg border border-indigo-400 bg-indigo-600 p-4">
                <p className="font-semibold">{step}</p>
              </div>
            ))}
          </div>
          <h1 className="text-4xl font-bold">Start your child admission enquiry in one simple step.</h1>
          <p className="mt-4 text-indigo-100">
            Parent email login helps us connect your enquiry details to the right admission counsellor.
          </p>
        </div>

        <p className="text-sm text-indigo-100">For parents and guardians</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Parent Login</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your email to continue to the admission enquiry form.</p>
          </div>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="parent-email">
            Parent Email*
          </label>
          <input
            id="parent-email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className={inputClass("email")}
          />
          {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}

          <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="parent-name">
            Parent Name
          </label>
          <input
            id="parent-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass("name")}
            placeholder="Optional"
          />

          <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="parent-phone">
            Phone Number
          </label>
          <input
            id="parent-phone"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={inputClass("phone")}
            placeholder="Optional"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            <ShieldCheck className="h-5 w-5" />
            {loading ? "Continuing..." : "Continue to Enquiry"}
          </button>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/login" className="font-semibold text-indigo-700 hover:text-indigo-800">
              Staff login
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("parentToken");
                localStorage.removeItem("parent");
                toast.success("Parent session cleared");
              }}
              className="font-semibold text-slate-500 hover:text-slate-700"
            >
              Reset parent session
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ParentLogin;
