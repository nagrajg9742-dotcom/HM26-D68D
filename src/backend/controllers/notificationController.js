const pool = require("../utils/db");

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         n.*,
         c.title AS complaint_title
       FROM notifications n
       LEFT JOIN complaints c ON n.complaint_id = c.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1
         AND user_id = $2
       RETURNING *`,
      [notificationId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification: result.rows[0]
    });
  } catch (error) {
    console.error("Mark notification error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead
};