import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Search } from "lucide-react";
import { getNotifications, markNotificationRead } from "../../services/api";

const TopBar = ({ title }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationRef = useRef(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ unread: false }),
    refetchInterval: 60000
  });

  const notifications = data?.notifications || [];
  const unread = notifications.filter((notification) => !notification.is_read).length;

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
    []
  );

  useEffect(() => {
    if (!search.trim()) return undefined;
    const timeout = setTimeout(() => {
      navigate(`/leads?search=${encodeURIComponent(search.trim())}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, navigate]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const handleNotificationClick = async (notification) => {
    await markNotificationRead(notification.id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    setOpen(false);

    if (notification.lead_id) {
      navigate(`/leads/${notification.lead_id}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
          <p className="text-sm text-slate-500">{today}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search leads"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate("/leads?new=1")}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Quick Add Lead
          </button>

          <div ref={notificationRef} className="relative z-50">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="relative rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
              aria-label="Notifications"
              aria-expanded={open}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-slate-200 bg-white p-2 shadow-xl sm:w-96">
                <div className="flex items-center justify-between border-b border-slate-100 px-2 py-2">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">{unread} unread</p>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No notifications.</p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full rounded-md p-3 text-left text-sm hover:bg-slate-50 ${
                          notification.is_read ? "text-slate-500" : "bg-indigo-50 text-slate-900"
                        }`}
                      >
                        <p className="font-medium">{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                        {notification.lead_id && <p className="mt-2 text-xs font-semibold text-indigo-700">Open lead</p>}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
