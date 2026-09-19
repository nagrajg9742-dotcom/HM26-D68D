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

const respondToVerificationRequest = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status, note } = req.body;
    const officerId = req.user.id;

    if (!["verified", "reopened"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be verified or reopened"
      });
    }

    const requestResult = await pool.query(
      `SELECT *
       FROM verification_requests
       WHERE complaint_id = $1
       AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [complaintId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending verification request found"
      });
    }

    const verificationRequest = requestResult.rows[0];

    const complaintResult = await pool.query(
      "SELECT * FROM complaints WHERE id = $1",
      [complaintId]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const complaint = complaintResult.rows[0];

    if (complaint.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Only resolved complaints can be verified or reopened"
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const updatedComplaint = await client.query(
        `UPDATE complaints
         SET status = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, complaintId]
      );

      await client.query(
        `UPDATE verification_requests
         SET status = $1,
             responded_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [status, verificationRequest.id]
      );

      await client.query(
        `INSERT INTO complaint_status_history
         (complaint_id, old_status, new_status, changed_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          complaintId,
          complaint.status,
          status,
          officerId,
          note || null
        ]
      );

      await client.query(
        `INSERT INTO notifications
         (user_id, complaint_id, title, message)
         VALUES ($1, $2, $3, $4)`,
        [
          complaint.citizen_id,
          complaint.id,
          "Complaint verification updated",
          `Your complaint "${complaint.title}" has been marked as ${status}.`
        ]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `Complaint ${status} successfully`,
        complaint: updatedComplaint.rows[0]
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Respond to verification request error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createVerificationRequest,
  respondToVerificationRequest
};
