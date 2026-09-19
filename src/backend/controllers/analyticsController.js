const pool = require("../utils/db");

const getAnalytics = async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) AS total FROM complaints"
    );

    const statusResult = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM complaints
       GROUP BY status
       ORDER BY status`
    );

    const categoryResult = await pool.query(
      `SELECT category, COUNT(*) AS count
       FROM complaints
       GROUP BY category
       ORDER BY count DESC`
    );

        const recentResult = await pool.query(
      `SELECT
         DATE(created_at) AS date,
         COUNT(*) AS count
       FROM complaints
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    res.json({
  success: true,
  analytics: {
    total_complaints: Number(totalResult.rows[0].total),
    by_status: statusResult.rows,
    by_category: categoryResult.rows,
    recent_7_days: recentResult.rows
  }
});

  } catch (error) {
    console.error("Analytics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getAnalytics
};