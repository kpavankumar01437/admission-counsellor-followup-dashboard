import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  School,
  UserCog,
  Users,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/leads", label: "Leads", icon: ClipboardList },
  { to: "/follow-ups", label: "Follow-ups", icon: Users },
  { to: "/tours", label: "Tours", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 }
];

const Sidebar = ({ open, onClose, onOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const links = isAdmin ? [...baseLinks, { to: "/counsellors", label: "Counsellors", icon: UserCog }] : baseLinks;

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="fixed left-4 top-4 z-40 rounded-md bg-slate-900 p-2 text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
              <School className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold">FirstCry Intellitots</p>
              <p className="text-xs text-slate-400">Admissions CRM</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-sm font-semibold">{user?.name || "Counsellor"}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
            <p className="mt-1 text-xs capitalize text-indigo-200">{user?.role?.replace("_", " ")}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
