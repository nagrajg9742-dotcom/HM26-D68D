const pool = require("../utils/db");

const getStatusHistory = async (req, res) => {
  try {
    const complaintId = req.params.id;

    const complaintResult = await pool.query(
      "SELECT citizen_id FROM complaints WHERE id = $1",
      [complaintId]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const complaint = complaintResult.rows[0];

    if (
      req.user.role === "citizen" &&
      complaint.citizen_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this complaint history"
      });
    }

    const result = await pool.query(
      `SELECT
         h.*,
         u.name AS changed_by_name,
         u.role AS changed_by_role
       FROM complaint_status_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.complaint_id = $1
       ORDER BY h.changed_at ASC`,
      [complaintId]
    );

    res.json({
      success: true,
      history: result.rows
    });
  } catch (error) {
    console.error("Get status history error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getStatusHistory
};