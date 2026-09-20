const pool = require("../utils/db");

const getDepartments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM departments
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      departments: result.rows
    });
  } catch (error) {
    console.error("Get departments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO departments (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description || null]
    );

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department: result.rows[0]
    });
  } catch (error) {
    console.error("Create department error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Department already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getDepartments,
  createDepartment
};
