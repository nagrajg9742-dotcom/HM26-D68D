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
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
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

const getOfficerDashboard = async (req, res) => {
  try {
    const officerId = req.user.id;

    const totalResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaints`
    );

    const assignedResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaint_assignments
       WHERE officer_id = $1
       AND status = 'active'`,
      [officerId]
    );

    const openResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaints c
       JOIN complaint_assignments ca
         ON c.id = ca.complaint_id
       WHERE ca.officer_id = $1
       AND ca.status = 'active'
       AND c.status NOT IN ('resolved', 'verified', 'closed')`,
      [officerId]
    );

    const overdueResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaints c
       JOIN complaint_assignments ca
         ON c.id = ca.complaint_id
       WHERE ca.officer_id = $1
       AND ca.status = 'active'
       AND c.sla_deadline < CURRENT_TIMESTAMP
       AND c.status NOT IN ('resolved', 'verified', 'closed')`,
      [officerId]
    );

    const highRiskResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaints
       WHERE priority IN ('high', 'critical')`
    );

    // Rescue count temporarily defaults to 0 so a missing/problematic
    // escalations table cannot break the entire officer dashboard.
    const rescueResult = {
      rows: [{ count: 0 }]
    };

    const resolvedResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaints
       WHERE status = 'resolved'`
    );

    const reopenedResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaints
       WHERE status = 'reopened'`
    );

    const verifiedResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM complaints
       WHERE status = 'verified'`
    );

    res.json({
      success: true,
      dashboard: {
        total_complaints: Number(totalResult.rows[0].count),
        assigned_complaints: Number(assignedResult.rows[0].count),
        open_complaints: Number(openResult.rows[0].count),
        overdue_complaints: Number(overdueResult.rows[0].count),
        high_risk_complaints: Number(highRiskResult.rows[0].count),
        active_rescue_cases: Number(rescueResult.rows[0].count),
        resolved_complaints: Number(resolvedResult.rows[0].count),
        reopened_complaints: Number(reopenedResult.rows[0].count),
        verified_complaints: Number(verifiedResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error("Officer dashboard error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getAnalytics,
  getOfficerDashboard
};