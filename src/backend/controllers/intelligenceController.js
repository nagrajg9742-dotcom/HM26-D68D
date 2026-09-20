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


// ===============================
// HEALTH ENGINE
// ===============================
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

    if (
      complaint.status === "resolved" ||
      complaint.status === "verified"
    ) {
      health = "completed";
    } else if (
      ageHours > 72 ||
      complaint.priority === "critical"
    ) {
      health = "critical";
    } else if (
      ageHours > 24 ||
      complaint.priority === "high"
    ) {
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


// ===============================
// RISK PREDICTION
// ===============================
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

    // 1. Complaint age
    const ageHours =
      (Date.now() - new Date(complaint.created_at).getTime()) / 3600000;

    if (ageHours > 24) score += 15;
    if (ageHours > 48) score += 20;
    if (ageHours > 72) score += 25;


    // 2. Time since last update/activity
    const updatedAt =
      complaint.updated_at || complaint.created_at;

    const inactiveHours =
      (Date.now() - new Date(updatedAt).getTime()) / 3600000;

    if (inactiveHours > 24) score += 10;
    if (inactiveHours > 48) score += 15;


    // 3. Priority
    if (complaint.priority === "high") {
      score += 15;
    }

    if (complaint.priority === "critical") {
      score += 25;
    }


    // 4. Current status
    if (complaint.status === "submitted") {
      score += 10;
    }


    // 5. Rescue activity
    if (complaint.rescue_count > 0) {
      score += 15;
    }


    // 6. Evidence
    if (complaint.evidence_count === 0) {
      score += 5;
    }


    // 7. Complaint history
    const historyResult = await pool.query(
      `SELECT COUNT(*)::int AS history_count
       FROM complaint_status_history
       WHERE complaint_id = $1`,
      [complaint.id]
    );

    const historyCount =
      historyResult.rows[0].history_count;

    // No recorded status activity
    if (historyCount === 0) {
      score += 10;
    }


    // 8. Category + location pattern
    let nearbyCategoryComplaints = 0;

    if (
      complaint.category &&
      complaint.latitude !== null &&
      complaint.longitude !== null
    ) {
      const locationResult = await pool.query(
        `SELECT COUNT(*)::int AS complaint_count
         FROM complaints
         WHERE id <> $1
           AND category = $2
           AND latitude IS NOT NULL
           AND longitude IS NOT NULL
           AND ABS(latitude - $3) <= 0.01
           AND ABS(longitude - $4) <= 0.01`,
        [
          complaint.id,
          complaint.category,
          complaint.latitude,
          complaint.longitude
        ]
      );

      nearbyCategoryComplaints =
        locationResult.rows[0].complaint_count;


      // Repeated complaints of the same
      // category in the same area
      if (nearbyCategoryComplaints >= 3) {
        score += 10;
      }

      if (nearbyCategoryComplaints >= 5) {
        score += 10;
      }
    }


    // Keep score between 0 and 100
    score = Math.min(score, 100);


    // Risk level
    const level =
      score >= 70
        ? "high"
        : score >= 40
        ? "medium"
        : "low";


    // Response
    res.json({
      success: true,
      complaint_id: complaint.id,
      risk_score: score,
      risk_level: level,
      age_hours: Math.round(ageHours * 10) / 10,
      inactive_hours: Math.round(inactiveHours * 10) / 10,
      category: complaint.category,
      history_count: historyCount,
      nearby_category_complaints:
        nearbyCategoryComplaints,
      prediction:
        "This complaint may be at risk of being forgotten if no action is taken."
    });

  } catch (error) {
    console.error(
      "Risk prediction error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ===============================
// RISK EXPLANATION
// ===============================
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
    console.error(
      "Risk explanation error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ===============================
// RESCUE DETECTION
// ===============================
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
    console.error(
      "Rescue detection error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ===============================
// EVIDENCE ASSISTANCE
// ===============================
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
    console.error(
      "Evidence assistance error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ===============================
// EXPORTS
// ===============================
module.exports = {
  healthEngine,
  riskPrediction,
  riskExplanation,
  rescueDetection,
  evidenceAssistance
};