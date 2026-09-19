const pool = require("../utils/db");

const getComplaint = async (id) => {
  const result = await pool.query(
    `SELECT c.*,
            COUNT(e.id)::int AS evidence_count,
            COUNT(es.id)::int AS rescue_count
     FROM complaints c
     LEFT JOIN evidence e ON e.complaint_id = c.id
     LEFT JOIN escalations es ON es.complaint_id = c.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );

  return result.rows[0];
};

const healthEngine = async (req, res) => {
  try {
    const complaint = await getComplaint(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const ageHours =
      (Date.now() - new Date(complaint.created_at).getTime()) / 3600000;

    let health = "healthy";

    if (complaint.status === "resolved" || complaint.status === "verified") {
      health = "completed";
    } else if (ageHours > 72 || complaint.priority === "critical") {
      health = "critical";
    } else if (ageHours > 24 || complaint.priority === "high") {
      health = "at_risk";
    }

    res.json({
      success: true,
      complaint_id: complaint.id,
      health,
      age_hours: Math.round(ageHours * 10) / 10
    });
  } catch (error) {
    console.error("Health engine error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const riskPrediction = async (req, res) => {
  try {
    const complaint = await getComplaint(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    let score = 20;

    if (complaint.priority === "high") score += 25;
    if (complaint.priority === "critical") score += 45;
    if (complaint.status === "submitted") score += 10;
    if (complaint.rescue_count > 0) score += 20;
    if (complaint.evidence_count === 0) score += 5;

    score = Math.min(score, 100);

    const level =
      score >= 70 ? "high" :
      score >= 40 ? "medium" :
      "low";

    res.json({
      success: true,
      complaint_id: complaint.id,
      risk_score: score,
      risk_level: level
    });
  } catch (error) {
    console.error("Risk prediction error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const riskExplanation = async (req, res) => {
  try {
    const complaint = await getComplaint(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const factors = [];

    if (complaint.priority === "critical") {
      factors.push("Critical priority");
    } else if (complaint.priority === "high") {
      factors.push("High priority");
    }

    if (complaint.rescue_count > 0) {
      factors.push("Rescue request exists");
    }

    if (complaint.evidence_count === 0) {
      factors.push("No evidence uploaded");
    }

    res.json({
      success: true,
      complaint_id: complaint.id,
      factors
    });
  } catch (error) {
    console.error("Risk explanation error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const rescueDetection = async (req, res) => {
  try {
    const complaint = await getComplaint(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const detected =
      complaint.priority === "critical" ||
      complaint.priority === "high" ||
      complaint.rescue_count > 0;

    res.json({
      success: true,
      complaint_id: complaint.id,
      rescue_required: detected
    });
  } catch (error) {
    console.error("Rescue detection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const evidenceAssistance = async (req, res) => {
  try {
    const complaint = await getComplaint(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    res.json({
      success: true,
      complaint_id: complaint.id,
      evidence_count: complaint.evidence_count,
      recommendation:
        complaint.evidence_count === 0
          ? "Upload supporting evidence if available"
          : "Evidence is available for review"
    });
  } catch (error) {
    console.error("Evidence assistance error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  healthEngine,
  riskPrediction,
  riskExplanation,
  rescueDetection,
  evidenceAssistance
};
