const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require("../config/db");
const nodemailer = require("nodemailer");

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

  exports.approveProject = async (req, res) => {
    const { projectId, price } = req.body;

    if (!projectId || !price) {
    return res.status(400).json({ message: "projectId and totalAmount are required." });
    }

    try {
      const [[project]] = await pool.execute(
        `SELECT p.project_name, u.email, p.user_id
         FROM projects p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.project_id = ?`,
        [projectId]
      );
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      await pool.execute(
        `UPDATE projects SET project_status = 'approved' WHERE project_id = ?`,
        [projectId]
      );
  
      await pool.execute(
        `INSERT INTO payments (project_id, user_id, total_amount, paid_amount, payment_status)
         VALUES (?, ?, ?, 0, 'pending')
         ON DUPLICATE KEY UPDATE total_amount = ?, payment_status = 'pending'`,
        [projectId, project.user_id, price, price]
      );      
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      await transporter.sendMail({
        from: `"Project Portal" <${process.env.EMAIL_USER}>`,
        to: project.email,
        subject: "Your project has been approved!",
        html: `
          <h2>Hi,</h2>
          <p>Your project <strong>${project.project_name}</strong> has been approved!</p>
          <p>The total cost for your project is <strong>₹${price}</strong>.</p>
          <p>Please make the payment to begin the development.</p>
          <p>Thank you!</p>
        `,
      });
  
      res.status(200).json({ message: "Project approved and email sent." });
    } catch (error) {
      console.error("Approve Project Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };  

  exports.rejectProject = async (req, res) => {
    const { projectId, reason } = req.body;
  
    if (!projectId || !reason) {
      return res.status(400).json({ message: "projectId and reason are required." });
    }
  
    try {
      const [[project]] = await pool.execute(
        `SELECT p.project_name, u.email 
         FROM projects p 
         JOIN users u ON p.user_id = u.user_id 
         WHERE p.project_id = ?`,
        [projectId]
      );
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      await pool.execute(
        `UPDATE projects SET project_status = 'rejected', admin_notes = ? WHERE project_id = ?`,
        [reason, projectId]
      );
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      await transporter.sendMail({
        from: `"Project Portal" <${process.env.EMAIL_USER}>`,
        to: project.email,
        subject: "Your project has been rejected",
        html: `
          <h2>Hi,</h2>
          <p>Your project <strong>${project.project_name}</strong> has been rejected.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>You can contact us for further clarification or submit a new request.</p>
        `,
      });
  
      res.status(200).json({ message: "Project rejected and email sent." });
  
    } catch (error) {
      console.error("Reject Project Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };  

  exports.closeReport = async (req, res) => {
    const { reportId } = req.params;
  
    try {
      const [result] = await pool.execute(
        `UPDATE reports SET report_status = 'closed' WHERE report_id = ?`,
        [reportId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Report not found" });
      }
  
      res.status(200).json({ message: "Report closed successfully." });
    } catch (error) {
      console.error("Close Report Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  exports.deleteReport = async (req, res) => {
    const { reportId } = req.params;
  
    try {
      const [result] = await pool.execute(
        `DELETE FROM reports WHERE report_id = ?`,
        [reportId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Report not found" });
      }
  
      res.status(200).json({ message: "Report deleted successfully." });
    } catch (error) {
      console.error("Delete Report Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };  