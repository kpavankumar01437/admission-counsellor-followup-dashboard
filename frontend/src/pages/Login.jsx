import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, School } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
 
const Login = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
 
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
 
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
            <School className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-bold">FirstCry Intellitots</p>
            <p className="text-sm text-slate-300">Admission follow-up system</p>
          </div>
        </div>
 
        <div className="max-w-md">
          <div className="mb-8 grid grid-cols-2 gap-4">
            {["Enquiry", "Demo", "Follow-up", "Admission"].map((stage) => (
              <div key={stage} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <p className="text-sm text-slate-300">{stage}</p>
                <div className="mt-3 h-2 rounded-full bg-indigo-500" />
              </div>
            ))}
          </div>
          <h1 className="text-4xl font-bold">Track every parent enquiry from first call to confirmed admission.</h1>
          <p className="mt-4 text-slate-300">
            Counsellors get reminders, centre heads get accountability, and parents get timely follow-up.
          </p>
        </div>
 
        <p className="text-sm text-slate-400">Internship Project | Aurora Deemed University x NIAT</p>
      </section>
 
      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Counsellor Login</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your registered email and password to continue.</p>
          </div>
 
          <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Enter your email address"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            required
          />
 
          <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter your password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
 
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
 
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/" className="font-semibold text-slate-500 hover:text-slate-700">
              Public parent portal
            </Link>
            <span className="font-semibold text-slate-500">Staff-only access</span>
          </div>
        </form>
      </section>
    </div>
  );
};
 
export default Login;
