import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, School, ShieldCheck, UserPlus } from "lucide-react";
import { getErrorMessage, parentLogin, parentSignup } from "../services/api";
 
// ── helpers ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyForm = () => ({ email: "", name: "", phone: "" });
 
// ── component ──────────────────────────────────────────────────
const ParentLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
 
  if (localStorage.getItem("parentToken")) {
    return <Navigate to="/enquiry" replace />;
  }
 
  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };
 
  const switchMode = (next) => {
    setMode(next);
    setForm(emptyForm());
    setErrors({});
  };
 
  const validate = () => {
    const next = {};
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_RE.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (mode === "signup" && !form.name.trim()) {
      next.name = "Full name is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };
 
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await parentLogin({ email: form.email.trim().toLowerCase() });
        toast.success(`Welcome back, ${data.parent.name || "Parent"}!`);
      } else {
        data = await parentSignup({
          email: form.email.trim().toLowerCase(),
          name:  form.name.trim(),
          phone: form.phone.trim() || undefined,
        });
        toast.success("Account created! Redirecting...");
      }
      localStorage.setItem("parentToken", data.token);
      localStorage.setItem("parent", JSON.stringify(data.parent));
      navigate("/enquiry");
    } catch (error) {
      if (mode === "login" && error?.response?.status === 404) {
        setErrors({ email: "No account found with this email. Please sign up first." });
      } else if (mode === "signup" && error?.response?.status === 409) {
        setErrors({ email: "This email is already registered. Please log in instead." });
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };
 
  const inputCls = (field) =>
    `mt-2 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 transition ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;
 
  const isLogin = mode === "login";
 
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
 
      {/* Left branding panel */}
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
            {[
              { step: "01", label: "Create your parent account" },
              { step: "02", label: "Fill the admission enquiry form" },
              { step: "03", label: "Counsellor contacts you within 24 hrs" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-4 rounded-lg border border-indigo-400 bg-indigo-600 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-indigo-700">
                  {step}
                </span>
                <p className="font-semibold">{label}</p>
              </div>
            ))}
          </div>
          <h1 className="text-4xl font-bold">
            Start your child's admission enquiry in three simple steps.
          </h1>
          <p className="mt-4 text-indigo-100">
            Sign up once with your email — then log in anytime to check your enquiry status.
          </p>
        </div>
 
        <p className="text-sm text-indigo-100">For parents and guardians only</p>
      </section>
 
      {/* Right form panel */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
 
          {/* Login / Sign Up tab toggle */}
          <div className="mb-6 flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {[
              { key: "login",  label: "Login",   Icon: ShieldCheck },
              { key: "signup", label: "Sign Up",  Icon: UserPlus    },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchMode(key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${
                  mode === key
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
 
          {/* Form card */}
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                {isLogin ? <ShieldCheck className="h-7 w-7" /> : <UserPlus className="h-7 w-7" />}
              </div>
              <h2 className="text-2xl font-bold text-slate-950">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isLogin
                  ? "Enter your registered email to access your portal."
                  : "Sign up to submit your child's admission enquiry."}
              </p>
            </div>
 
            {/* Email — both modes */}
            <label className="block text-sm font-semibold text-slate-700" htmlFor="parent-email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="parent-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputCls("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
 
            {/* Sign Up only fields */}
            {!isLogin && (
              <>
                <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="parent-name">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="parent-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className={inputCls("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
 
                <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="parent-phone">
                  Phone Number{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="parent-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  className={inputCls("phone")}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </>
            )}
 
            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {isLogin ? <ShieldCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              {loading
                ? (isLogin ? "Logging in…" : "Creating account…")
                : (isLogin ? "Login" : "Create Account & Continue")}
            </button>
 
            {/* Mode switch nudge */}
            <p className="mt-5 text-center text-sm text-slate-500">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Log in instead
                  </button>
                </>
              )}
            </p>
 
            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <Link to="/" className="font-semibold text-slate-500 hover:text-slate-700">
                ← Back to home
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("parentToken");
                  localStorage.removeItem("parent");
                  toast.success("Session cleared");
                }}
                className="font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear session
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
 
export default ParentLogin;
