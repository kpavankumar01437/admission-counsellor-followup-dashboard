const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const leadsRoutes = require("./routes/leads");
const followupsRoutes = require("./routes/followups");
const toursRoutes = require("./routes/tours");
const analyticsRoutes = require("./routes/analytics");
const enquiryRoutes = require("./routes/enquiry");
const aiRoutes = require("./routes/ai");
const counsellorsRoutes = require("./routes/counsellors");
const notificationsRoutes = require("./routes/notifications");
const { startNotificationService } = require("./services/notificationService");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "Admission Counsellor Follow-up Dashboard API",
      timestamp: new Date().toISOString()
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api", followupsRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/counsellors", counsellorsRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((error, req, res, next) => {
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, error: "CORS origin blocked" });
  }

  console.error(error);
  return res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Admission dashboard API running on port ${PORT}`);
  startNotificationService();
});
