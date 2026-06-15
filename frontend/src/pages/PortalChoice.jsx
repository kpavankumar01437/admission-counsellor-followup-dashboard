import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarCheck, ClipboardList, Mail, School, ShieldCheck, Users } from "lucide-react";

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

      <main className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <section className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-700">Choose your portal</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 lg:text-5xl">
            Two simple faces for one admission system.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Parents submit and update enquiries. Staff manage leads, follow-ups, demos, admissions, reminders, and analytics.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-950">Parent Face</h2>
            <p className="mt-2 text-slate-600">
              For parents and guardians to login with email, submit child admission details, and send updates through the parent portal.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-700">
              <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                <Mail className="h-5 w-5 text-indigo-600" />
                Email-based parent login
              </div>
              <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Admission enquiry form
              </div>
              <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                <CalendarCheck className="h-5 w-5 text-indigo-600" />
                Parent updates and routine information
              </div>
            </div>

            <Link
              to="/parent-login"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Continue as Parent
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-slate-950">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-bold">Staff Face</h2>
            <p className="mt-2 text-slate-300">
              For counsellors, centre heads, and admins to control the admission funnel from enquiry to confirmed admission.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-200">
              <div className="flex items-center gap-3 rounded-md bg-slate-900 p-3">
                <ClipboardList className="h-5 w-5 text-indigo-300" />
                Lead tracking and status history
              </div>
              <div className="flex items-center gap-3 rounded-md bg-slate-900 p-3">
                <CalendarCheck className="h-5 w-5 text-indigo-300" />
                Follow-up reminders and tour bookings
              </div>
              <div className="flex items-center gap-3 rounded-md bg-slate-900 p-3">
                <BarChart3 className="h-5 w-5 text-indigo-300" />
                Analytics, AI scripts, and priority flags
              </div>
            </div>

            <Link
              to="/login"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-semibold text-slate-950 hover:bg-slate-100"
            >
              Continue as Staff
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PortalChoice;
