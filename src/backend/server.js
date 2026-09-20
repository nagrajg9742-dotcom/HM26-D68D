require("dotenv").config({ path: "../../.env" });

const express = require("express");
const cors = require("cors");
const path = require("path");


const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const statusHistoryRoutes = require("./routes/statusHistoryRoutes");
const rescueRoutes = require("./routes/rescueRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const priorityRoutes = require("./routes/priorityRoutes");
const slaRoutes = require("./routes/slaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const auditRoutes = require("./routes/auditRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");

const app = express();


app.use(cors());
app.use(express.json());


app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
  res.json({
    message: "CivicTrack API is running",
    project: "CivicTrack - Mysuru",
    status: "ok"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CivicTrack backend is healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/complaints", statusHistoryRoutes);
app.use("/api/complaints", rescueRoutes);
app.use("/api/complaints", verificationRoutes);
app.use("/api/complaints", assignmentRoutes);
app.use("/api/priority", priorityRoutes);
app.use("/api/sla", slaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/intelligence", intelligenceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CivicTrack backend running on port ${PORT}`);
});







