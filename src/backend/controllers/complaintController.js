const pool = require("../utils/db");

// =====================================================
// CREATE COMPLAINT
// =====================================================
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

    // -------------------------------------------------
    // 1. REQUIRED FIELD VALIDATION
    // -------------------------------------------------
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

    // -------------------------------------------------
    // 2. LOCATION VALIDATION
    // -------------------------------------------------
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location coordinates"
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude. Latitude must be between -90 and 90."
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude. Longitude must be between -180 and 180."
      });
    }

    // -------------------------------------------------
    // 3. INAPPROPRIATE LANGUAGE CHECK
    // -------------------------------------------------
    const blockedWords = [
      "fuck",
      "shit",
      "bitch",
      "asshole",
      "idiot",
      "stupid"
    ];

    const textToCheck =
      `${title} ${description}`.toLowerCase();

    const containsBlockedWord = blockedWords.some((word) =>
      textToCheck.includes(word)
    );

    if (containsBlockedWord) {
      return res.status(400).json({
        success: false,
        message: "Complaint contains inappropriate language"
      });
    }

    // -------------------------------------------------
    // 4. DUPLICATE COMPLAINT DETECTION
    // -------------------------------------------------
    const duplicateResult = await pool.query(
      `SELECT id, title, created_at
       FROM complaints
       WHERE citizen_id = $1
         AND category = $2
         AND LOWER(TRIM(title)) = LOWER(TRIM($3))
         AND latitude IS NOT NULL
         AND longitude IS NOT NULL
         AND ABS(latitude - $4) <= 0.005
         AND ABS(longitude - $5) <= 0.005
         AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 1`,
      [
        citizen_id,
        category,
        title,
        lat,
        lng
      ]
    );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Possible duplicate complaint detected",
        duplicate_complaint_id: duplicateResult.rows[0].id
      });
    }

    // -------------------------------------------------
    // 5. INSERT COMPLAINT
    // -------------------------------------------------
    const result = await pool.query(
      `INSERT INTO complaints
       (
         citizen_id,
         title,
         description,
         category,
         latitude,
         longitude,
         location_accuracy,
         location_captured_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        citizen_id,
        title,
        description,
        category,
        lat,
        lng,
        location_accuracy || null
      ]
    );

    const complaint = result.rows[0];

    // -------------------------------------------------
    // 6. INITIAL STATUS HISTORY
    // -------------------------------------------------
    await pool.query(
      `INSERT INTO complaint_status_history
       (
         complaint_id,
         old_status,
         new_status,
         changed_by,
         note
       )
       VALUES ($1, $2, $3, $4, $5)`,
      [
        complaint.id,
        null,
        complaint.status,
        citizen_id,
        "Complaint submitted"
      ]
    );

    // -------------------------------------------------
    // 7. SUCCESS RESPONSE
    // -------------------------------------------------
    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint
    });

  } catch (error) {
    console.error(
      "Create complaint error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// GET ALL COMPLAINTS
// =====================================================
const getComplaints = async (req, res) => {
  try {
    let result;

    // Citizen sees only their complaints
    if (req.user.role === "citizen") {

      result = await pool.query(
        `SELECT
           c.*,
           u.name AS citizen_name,
           u.email AS citizen_email
         FROM complaints c
         JOIN users u
           ON c.citizen_id = u.id
         WHERE c.citizen_id = $1
         ORDER BY c.created_at DESC`,
        [req.user.id]
      );

    } else {

      // Officers/Admins see all complaints
      result = await pool.query(
        `SELECT
           c.*,
           u.name AS citizen_name,
           u.email AS citizen_email
         FROM complaints c
         JOIN users u
           ON c.citizen_id = u.id
         ORDER BY c.created_at DESC`
      );
    }

    res.json({
      success: true,
      complaints: result.rows
    });

  } catch (error) {

    console.error(
      "Get complaints error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// GET COMPLAINT BY ID
// =====================================================
const getComplaintById = async (req, res) => {
  try {

    const complaintId = req.params.id;

    const result = await pool.query(
      `SELECT
         c.*,
         u.name AS citizen_name,
         u.email AS citizen_email
       FROM complaints c
       JOIN users u
         ON c.citizen_id = u.id
       WHERE c.id = $1`,
      [complaintId]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const complaint = result.rows[0];

    // Citizens can view only their own complaints
    if (
      req.user.role === "citizen" &&
      complaint.citizen_id !== req.user.id
    ) {

      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this complaint"
      });
    }

    res.json({
      success: true,
      complaint: complaint
    });

  } catch (error) {

    console.error(
      "Get complaint by ID error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// UPDATE COMPLAINT STATUS
// =====================================================
const updateComplaintStatus = async (req, res) => {
  try {

    const { status, note } = req.body;

    const complaintId = req.params.id;

    const changedBy = req.user.id;

    const allowedStatuses = [
      "submitted",
      "assigned",
      "in_progress",
      "resolved",
      "verified",
      "reopened",
      "closed"
    ];

    // -------------------------------------------------
    // STATUS VALIDATION
    // -------------------------------------------------
    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid complaint status"
      });
    }

    // -------------------------------------------------
    // GET COMPLAINT
    // -------------------------------------------------
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

    const oldStatus = complaint.status;

    // -------------------------------------------------
    // UPDATE STATUS
    // -------------------------------------------------
    const updatedResult = await pool.query(
      `UPDATE complaints
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [
        status,
        complaintId
      ]
    );

    // -------------------------------------------------
    // CREATE NOTIFICATION
    // -------------------------------------------------
    const notificationTitle =
      "Complaint status updated";

    const notificationMessage =
      `Your complaint "${complaint.title}" status has been changed from ` +
      `"${oldStatus}" to "${status}".`;

    await pool.query(
      `INSERT INTO notifications
       (
         user_id,
         complaint_id,
         title,
         message
       )
       VALUES ($1, $2, $3, $4)`,
      [
        complaint.citizen_id,
        complaint.id,
        notificationTitle,
        notificationMessage
      ]
    );

    // -------------------------------------------------
    // STATUS HISTORY
    // -------------------------------------------------
    await pool.query(
      `INSERT INTO complaint_status_history
       (
         complaint_id,
         old_status,
         new_status,
         changed_by,
         note
       )
       VALUES ($1, $2, $3, $4, $5)`,
      [
        complaintId,
        oldStatus,
        status,
        changedBy,
        note || null
      ]
    );

    // -------------------------------------------------
    // SUCCESS RESPONSE
    // -------------------------------------------------
    res.json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: updatedResult.rows[0]
    });

  } catch (error) {

    console.error(
      "Update complaint status error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================


// =====================================================
// CITIZEN VERIFICATION
// =====================================================
const verifyComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status } = req.body;

    if (!["verified", "reopened"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status"
      });
    }

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

    // Only the citizen who created the complaint can verify it
    if (req.user.role === "citizen" && complaint.citizen_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this complaint"
      });
    }

    const oldStatus = complaint.status;

    const updatedResult = await pool.query(
      `UPDATE complaints
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, complaintId]
    );

    await pool.query(
      `INSERT INTO complaint_status_history
       (
         complaint_id,
         old_status,
         new_status,
         changed_by,
         note
       )
       VALUES ($1, $2, $3, $4, $5)`,
      [
        complaintId,
        oldStatus,
        status,
        req.user.id,
        status === "verified"
          ? "Citizen verified the resolution"
          : "Citizen reported that the issue is not resolved"
      ]
    );

    res.json({
      success: true,
      message:
        status === "verified"
          ? "Complaint resolution verified"
          : "Complaint reopened",
      complaint: updatedResult.rows[0]
    });

  } catch (error) {
    console.error(
      "Verify complaint error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  verifyComplaint
};