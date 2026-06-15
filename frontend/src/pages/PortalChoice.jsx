import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, ClipboardList, Mail, School, Users } from "lucide-react";

const PortalChoice = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <School className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950">FirstCry Intellitots</p>
              <p className="text-sm text-slate-500">Admission Counsellor Follow-up Dashboard</p>
            </div>
          </div>
          <p className="hidden rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 sm:block">
            Smart admission workflow prototype
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <section>
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-700">Parent admission portal</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 lg:text-5xl">Start your child admission enquiry online.</h1>
          <p className="mt-4 text-lg text-slate-600">
            Parents and guardians can login with email, submit child details, and share admission updates with the centre team.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Mail className="h-6 w-6 text-indigo-600" />
              <p className="mt-3 font-semibold text-slate-950">Email Login</p>
              <p className="mt-1 text-sm text-slate-500">Simple parent access without password setup.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
              <p className="mt-3 font-semibold text-slate-950">Enquiry Form</p>
              <p className="mt-1 text-sm text-slate-500">Child and programme details captured clearly.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <CalendarCheck className="h-6 w-6 text-indigo-600" />
              <p className="mt-3 font-semibold text-slate-950">Follow-up</p>
              <p className="mt-1 text-sm text-slate-500">The admission team contacts you after submission.</p>
            </div>
          </div>

          <Link
            to="/parent-login"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Continue to Parent Login
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>

        <section className="rounded-lg border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-950">For Parents and Guardians</h2>
          <p className="mt-2 text-slate-600">
            Use this portal to start or update your child admission enquiry. Staff access is maintained separately by the centre.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            {["Submit parent and child details", "Choose programme interest", "Share source and referral information", "Receive follow-up from counsellor"].map((item) => (
              <div key={item} className="rounded-md bg-slate-50 p-3 font-medium">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PortalChoice;
