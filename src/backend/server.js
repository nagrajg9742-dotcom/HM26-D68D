require("dotenv").config();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CivicTrack backend running on port ${PORT}`);
});