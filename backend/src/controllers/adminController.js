const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require("../config/db");

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.execute("SELECT * FROM users WHERE email = ? AND role = 'admin'", [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const admin = users[0];
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: admin.user_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin.user_id,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Error in loginAdmin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const [projects] = await pool.execute("SELECT * FROM projects");
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch projects: " + error.message });
    }
};

exports.updateProjectStatus = async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        await pool.execute(
            "UPDATE projects SET status = ?, admin_notes = ? WHERE project_id = ?",
            [status, notes || "", id]
        );
        res.status(200).json({ message: `Project ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: "Failed to update project status: " + error.message });
    }
};

exports.setProjectPrice = async (req, res) => {
    const { id } = req.params;
    const { price } = req.body;

    try {
        await pool.execute("UPDATE projects SET price = ? WHERE project_id = ?", [price, id]);
        res.status(200).json({ message: "Price set successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to set price: " + error.message });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const [reports] = await pool.execute("SELECT * FROM reports");
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reports: " + error.message });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const [payments] = await pool.execute(`
            SELECT 
              p.payment_id,
              p.user_id,
              u.email AS user_email,
              pr.project_id,
              pr.project_code,
              pr.project_name,
              p.total_amount,
              p.paid_amount,
              p.pending_amount,
              p.payment_status,
              p.created_at,
              p.updated_at
            FROM payments p
            JOIN users u ON p.user_id = u.user_id
            JOIN projects pr ON p.project_id = pr.project_id
            ORDER BY p.created_at DESC;
          `);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments: " + error.message });
    }
  };  