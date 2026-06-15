import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

const unwrap = async (request) => {
  const response = await request;
  return response.data.data;
};

export const getErrorMessage = (error) => {
  return error.response?.data?.error || error.message || "Something went wrong";
};

export const login = (email, password) => unwrap(api.post("/auth/login", { email, password }));
export const parentLogin = (payload) => unwrap(api.post("/auth/parent-login", payload));
export const getMe = () => unwrap(api.get("/auth/me"));

export const getLeads = (filters = {}) => unwrap(api.get("/leads", { params: filters }));
export const getLead = (id) => unwrap(api.get(`/leads/${id}`));
export const createLead = (payload) => unwrap(api.post("/leads", payload));
export const updateLead = (id, payload) => unwrap(api.patch(`/leads/${id}`, payload));
export const updateLeadStatus = (id, payload) => unwrap(api.patch(`/leads/${id}/status`, payload));
export const assignLead = (id, counsellor_id) => unwrap(api.patch(`/leads/${id}/assign`, { counsellor_id }));
export const importLeads = (leads) => unwrap(api.post("/leads/import", leads));

export const logFollowUp = (leadId, payload) => unwrap(api.post(`/leads/${leadId}/followup`, payload));
export const getFollowUps = (leadId) => unwrap(api.get(`/leads/${leadId}/followups`));
export const getTodayFollowUps = () => unwrap(api.get("/followups/today"));
export const getOverdueFollowUps = () => unwrap(api.get("/followups/overdue"));

export const getAnalyticsSummary = () => unwrap(api.get("/analytics/summary"));
export const getAnalyticsFunnel = () => unwrap(api.get("/analytics/funnel"));
export const getCounsellorStats = () => unwrap(api.get("/analytics/counsellor"));
export const getMonthlyTrend = () => unwrap(api.get("/analytics/monthly"));

export const getTourSlots = (params = {}) => unwrap(api.get("/tours/slots", { params }));
export const createTourSlot = (payload) => unwrap(api.post("/tours/slots", payload));
export const bookTour = (payload) => unwrap(api.post("/tours/book", payload));
export const updateTourBooking = (id, payload) => unwrap(api.patch(`/tours/book/${id}`, payload));

export const getCallScript = (leadId) => unwrap(api.post(`/ai/call-script/${leadId}`));
export const getFollowUpMessage = (leadId) => unwrap(api.get(`/ai/followup-message/${leadId}`));
export const recalculatePriority = () => unwrap(api.post("/ai/recalculate-priority"));
export const submitEnquiry = (payload) => unwrap(api.post("/enquiry", payload));

export const getCounsellors = () => unwrap(api.get("/counsellors"));
export const createCounsellor = (payload) => unwrap(api.post("/counsellors", payload));
export const updateCounsellor = (id, payload) => unwrap(api.patch(`/counsellors/${id}`, payload));

export const getNotifications = (params = {}) => unwrap(api.get("/notifications", { params }));
export const markNotificationRead = (id) => unwrap(api.patch(`/notifications/${id}/read`));
export const markAllNotificationsRead = () => unwrap(api.patch("/notifications/read-all"));
export const scanNotifications = () => unwrap(api.post("/notifications/scan"));

export const getOperationsSummary = () => unwrap(api.get("/operations/summary"));
export const getWorkflowEvents = (params = {}) => unwrap(api.get("/operations/events", { params }));
export const createWorkflowEvent = (payload) => unwrap(api.post("/operations/events", payload));
export const updateWorkflowEventStatus = (id, status) => unwrap(api.patch(`/operations/events/${id}/status`, { status }));
export const submitParentPortalUpdate = (payload) => unwrap(api.post("/operations/parent-update", payload));
export const getSeatAvailability = () => unwrap(api.get("/operations/seat-availability"));
export const saveSeatAvailability = (payload) => unwrap(api.post("/operations/seat-availability", payload));
export const getReferrals = () => unwrap(api.get("/operations/referrals"));
export const createReferral = (payload) => unwrap(api.post("/operations/referrals", payload));
export const getOperationalRecommendations = () => unwrap(api.get("/operations/recommendations"));

export default api;
