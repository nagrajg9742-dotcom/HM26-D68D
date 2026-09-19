const pool = require("../utils/db");

const uploadEvidence = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const uploadedBy = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Evidence file is required"
      });
    }

    const fileName = req.file.originalname;
    const fileUrl = `/uploads/evidence/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO evidence
       (complaint_id, uploaded_by, file_name, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        complaintId,
        uploadedBy,
        fileName,
        fileUrl
      ]
    );

    res.status(201).json({
      success: true,
      message: "Evidence uploaded successfully",
      evidence: result.rows[0]
    });
  } catch (error) {
    console.error("Upload evidence error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getEvidence = async (req, res) => {
  try {
    const complaintId = req.params.id;

    const result = await pool.query(
      `SELECT
         e.*,
         u.name AS uploaded_by_name
       FROM evidence e
       JOIN users u ON e.uploaded_by = u.id
       WHERE e.complaint_id = $1
       ORDER BY e.uploaded_at DESC`,
      [complaintId]
    );

    res.json({
      success: true,
      evidence: result.rows
    });
  } catch (error) {
    console.error("Get evidence error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  uploadEvidence,
  getEvidence
};