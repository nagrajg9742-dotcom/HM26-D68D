const pool = require("../utils/db");

const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.name AS user_name, u.email AS user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC`
    );

    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error("Get audit logs error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const createAuditLog = async (userId, action, entityType, entityId, details = {}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs
       (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, entityType || null, entityId || null, details]
    );
  } catch (error) {
    console.error("Create audit log error:", error.message);
  }
};

module.exports = {
  getAuditLogs,
  createAuditLog
};
