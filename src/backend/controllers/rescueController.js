const pool = require("../utils/db");

const createRescueRequest = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { reason, priority } = req.body;

    const allowedPriorities = [
      "low",
      "medium",
      "high",
      "critical"
    ];

    if (!reason || !priority) {
      return res.status(400).json({
        success: false,
        message: "Reason and priority are required"
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority"
      });
    }

    const complaintResult = await pool.query(
      "SELECT id FROM complaints WHERE id = $1",
      [complaintId]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const result = await pool.query(
      `INSERT INTO escalations
       (complaint_id, triggered_by, reason, priority, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        complaintId,
        req.user.role,
        reason,
        priority,
        "open"
      ]
    );

    res.status(201).json({
      success: true,
      message: "Rescue request created successfully",
      escalation: result.rows[0]
    });
  } catch (error) {
    console.error("Create rescue request error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createRescueRequest
};