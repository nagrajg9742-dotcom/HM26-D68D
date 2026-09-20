const pool = require("../utils/db");

const setSlaDeadline = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { hours } = req.body;

    if (!hours || Number(hours) <= 0) {
      return res.status(400).json({
        success: false,
        message: "hours must be greater than 0"
      });
    }

    const result = await pool.query(
      `UPDATE complaints
       SET sla_deadline = CURRENT_TIMESTAMP + ($1 * INTERVAL '1 hour'),
           sla_status = 'pending',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, sla_deadline, sla_status`,
      [Number(hours), complaintId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    res.json({
      success: true,
      message: "SLA deadline set successfully",
      complaint: result.rows[0]
    });
  } catch (error) {
    console.error("Set SLA error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getOverdueComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE complaints
       SET sla_status = 'overdue'
       WHERE sla_deadline < CURRENT_TIMESTAMP
       AND status NOT IN ('resolved', 'verified', 'closed')
       AND sla_status = 'pending'`
    );

    const overdue = await pool.query(
      `SELECT *
       FROM complaints
       WHERE sla_status = 'overdue'
       ORDER BY sla_deadline ASC`
    );

    res.json({
      success: true,
      updated_count: result.rowCount,
      complaints: overdue.rows
    });
  } catch (error) {
    console.error("Get overdue complaints error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  setSlaDeadline,
  getOverdueComplaints
};
