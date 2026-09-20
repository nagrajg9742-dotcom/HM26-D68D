const pool = require("../utils/db");

const getPriorityQueue = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              ca.officer_id,
              ca.assigned_at,
              CASE c.priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
              END AS priority_order
       FROM complaints c
       LEFT JOIN complaint_assignments ca
         ON c.id = ca.complaint_id
        AND ca.status = 'active'
       WHERE c.status NOT IN ('closed', 'verified')
       ORDER BY priority_order ASC, c.created_at ASC`
    );

    res.json({
      success: true,
      complaints: result.rows
    });
  } catch (error) {
    console.error("Priority queue error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getPriorityQueue
};
