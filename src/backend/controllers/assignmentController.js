const pool = require("../utils/db");

const assignComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { officer_id } = req.body;
    const assignedBy = req.user.id;

    if (!officer_id) {
      return res.status(400).json({
        success: false,
        message: "officer_id is required"
      });
    }

    const complaint = await pool.query(
      "SELECT id FROM complaints WHERE id = $1",
      [complaintId]
    );

    if (complaint.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const officer = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'officer'",
      [officer_id]
    );

    if (officer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }

    await pool.query(
      `UPDATE complaint_assignments
       SET status = 'reassigned'
       WHERE complaint_id = $1
       AND status = 'active'`,
      [complaintId]
    );

    const result = await pool.query(
      `INSERT INTO complaint_assignments
       (complaint_id, officer_id, assigned_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [complaintId, officer_id, assignedBy]
    );

    await pool.query(
      `UPDATE complaints
       SET status = 'assigned',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [complaintId]
    );

    res.status(201).json({
      success: true,
      message: "Complaint assigned successfully",
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error("Assign complaint error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getAssignedComplaints = async (req, res) => {
  try {
    const officerId = req.user.id;

    const result = await pool.query(
      `SELECT c.*, ca.assigned_at, ca.status AS assignment_status
       FROM complaints c
       JOIN complaint_assignments ca
         ON c.id = ca.complaint_id
       WHERE ca.officer_id = $1
       AND ca.status = 'active'
       ORDER BY ca.assigned_at DESC`,
      [officerId]
    );

    res.json({
      success: true,
      complaints: result.rows
    });
  } catch (error) {
    console.error("Get assigned complaints error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  assignComplaint,
  getAssignedComplaints
};
