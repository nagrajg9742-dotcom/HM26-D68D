const pool = require("../utils/db");

const createVerificationRequest = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const citizenId = req.user.id;
    const { citizen_note } = req.body;

    const complaintResult = await pool.query(
      "SELECT id, citizen_id, status FROM complaints WHERE id = $1",
      [complaintId]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const complaint = complaintResult.rows[0];

    if (complaint.citizen_id !== citizenId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this complaint"
      });
    }

    if (complaint.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Only resolved complaints can be verified or reopened"
      });
    }

    const existingRequest = await pool.query(
      `SELECT id
       FROM verification_requests
       WHERE complaint_id = $1
       AND status = 'pending'`,
      [complaintId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A verification request is already pending"
      });
    }

    const result = await pool.query(
      `INSERT INTO verification_requests
       (complaint_id, citizen_id, status, citizen_note)
       VALUES ($1, $2, 'pending', $3)
       RETURNING *`,
      [complaintId, citizenId, citizen_note || null]
    );

    res.status(201).json({
      success: true,
      message: "Verification request created successfully",
      request: result.rows[0]
    });
  } catch (error) {
    console.error("Create verification request error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createVerificationRequest
};
