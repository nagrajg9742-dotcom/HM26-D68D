const pool = require("../utils/db");

const createComplaint = async (req, res) => {
  try {
   const {
  title,
  description,
  category,
  latitude,
  longitude,
  location_accuracy
} = req.body;

const citizen_id = req.user.id;

    if (
      !citizen_id ||
      !title ||
      !description ||
      !category ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required complaint details are missing"
      });
    }

    const result = await pool.query(
      `INSERT INTO complaints
       (citizen_id, title, description, category, latitude, longitude, location_accuracy, location_captured_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        citizen_id,
        title,
        description,
        category,
        latitude,
        longitude,
        location_accuracy || null
      ]
    );

    const complaint = result.rows[0];

    await pool.query(
      `INSERT INTO complaint_status_history
       (complaint_id, old_status, new_status, changed_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        complaint.id,
        null,
        complaint.status,
        citizen_id,
        "Complaint submitted"
      ]
    );

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint
    });
  } catch (error) {
    console.error("Create complaint error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         c.*,
         u.name AS citizen_name,
         u.email AS citizen_email
       FROM complaints c
       JOIN users u ON c.citizen_id = u.id
       ORDER BY c.created_at DESC`
    );

    res.json({
      success: true,
      complaints: result.rows
    });
  } catch (error) {
    console.error("Get complaints error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints
};