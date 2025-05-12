const pool = require("../config/db");
const nodemailer = require('nodemailer');

exports.getAllReports = async (req, res) => {
  try {
    const [reports] = await pool.query(`
      SELECT r.*, u.name as user_name
      FROM reports r
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, reports });
  } catch (err) {
    console.error("Error getting all reports:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserReports = async (req, res) => {
    try {
      const userId = req.user.id;
      const [reports] = await pool.query(`
        SELECT r.*, u.full_name as user_name
        FROM reports r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `, [userId]);
      res.json({ success: true, reports });
    } catch (err) {
      console.error("Error getting user reports:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

exports.createReport = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  const file = req.file?.filename;
  const fileUrl = file ? `/uploads/reports/${file}` : null;

  if (!title || !description || title.trim() === "" || description.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title and description are required.",
    });
  }

  try {
    const [insertResult] = await pool.query(
      `INSERT INTO reports (user_id, title, description, pdf_url)
       VALUES (?, ?, ?, ?)`,
      [userId, title, description, fileUrl]
    );

    const insertedId = insertResult.insertId;

    const [reportRows] = await pool.query(
      `SELECT * FROM reports WHERE report_id = ?`,
      [insertedId]
    );

    const report = reportRows[0];

    const [userRows] = await pool.query(
      `SELECT email FROM users WHERE user_id = ?`,
      [userId]
    );

    if (userRows.length > 0) {
      const user = userRows[0];

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"HUGU Technologies" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Your report "${report.title}" has been submitted!`,
        html: `
          <h2>Hello,</h2>
          <p>Your report titled <strong>${report.title}</strong> has been successfully submitted.</p>
          <p>Ticket Status: <strong>Open</strong></p>
          <p>Thank you for reaching out to us.</p>
        `,
      });
    }

    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  if (!["open", "closed"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    await pool.query("UPDATE reports SET report_status = ? WHERE report_id = ?", [status, reportId]);
    res.json({ success: true, message: "Report status updated" });
  } catch (err) {
    console.error("Error updating report status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.checkUserReports = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as reportCount FROM reports WHERE user_id = ?",
      [userId]
    );

    const hasReports = rows[0].reportCount > 0;

    res.json({ hasReports });
  } catch (error) {
    console.error("Error checking user reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};