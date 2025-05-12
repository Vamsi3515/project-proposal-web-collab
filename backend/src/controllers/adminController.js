const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require("../config/db");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

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

// exports.getAllProjects = async (req, res) => {
//   try {
//     const [projects] = await pool.execute(`
//       SELECT 
//         p.*, 
//         u.email AS user_email,
//         COALESCE(s.name, 'Unknown') AS full_name,
//         st.college, 
//         st.domain AS user_domain,
//         COALESCE(pay.payment_status, 'pending') AS payment_status
//       FROM projects p
//       JOIN users u ON p.user_id = u.user_id
//       LEFT JOIN student_teams st ON st.user_id = u.user_id
//       LEFT JOIN students s ON s.user_id = u.user_id
//         AND s.student_id = (
//           SELECT MIN(student_id) 
//           FROM students 
//           WHERE user_id = u.user_id
//         )
//       LEFT JOIN payments pay ON p.project_id = pay.project_id
//     `);    

//     res.status(200).json(projects);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch projects: " + error.message });
//   }
// };

exports.getAllProjects = async (req, res) => {
  try {
    const [projects] = await pool.execute(`
      SELECT 
        p.*, 
        u.email AS user_email,
        st.college, 
        st.domain AS user_domain,
        COALESCE(SUM(pay.paid_amount), 0) AS paid_amount
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN student_teams st ON st.user_id = u.user_id
      LEFT JOIN payments pay ON p.project_id = pay.project_id AND pay.payment_status = 'success'
      GROUP BY p.project_id, u.email, st.college, st.domain
      ORDER BY p.created_at DESC;
    `);

    const [students] = await pool.execute(`
      SELECT 
        s.user_id,
        s.name,
        s.roll_no,
        s.branch,
        s.email,
        s.phone
      FROM students s
    `);

    const projectsWithStudents = projects.map(project => {
      const relatedStudents = students.filter(s => s.user_id === project.user_id);
      return {
        ...project,
        students: relatedStudents,
      };
    });

    res.status(200).json(projectsWithStudents);
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

// exports.getAllPayments = async (req, res) => {
//   try {
//     const [payments] = await pool.execute(`
//       SELECT 
//         p.payment_id,
//         p.user_id,
//         u.email AS user_email,
//         (SELECT s.name FROM students s WHERE s.email = u.email LIMIT 1) AS student_name,
//         pr.project_id,
//         pr.project_code,
//         pr.project_name,
//         pr.delivery_date,
//         p.total_amount,
//         p.paid_amount,
//         p.pending_amount,
//         p.payment_status,
//         p.created_at,
//         p.updated_at
//       FROM payments p
//       JOIN users u ON p.user_id = u.user_id
//       JOIN projects pr ON p.project_id = pr.project_id
//       ORDER BY p.created_at DESC;
//     `);

//     res.status(200).json(payments);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch payments: " + error.message });
//   }
// };

exports.getAllPayments = async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT 
      p.payment_id,
      p.user_id,
      p.order_id,
      u.email AS user_email,
      s.name AS student_name,
      pr.project_id,
      pr.project_code,
      pr.project_name,
      pr.delivery_date,
      pr.total_amount,
      p.paid_amount,
      p.payment_status,
      p.invoice_url,
      
      (pr.total_amount - IFNULL((
        SELECT SUM(p2.paid_amount)
        FROM payments p2
        WHERE p2.project_id = pr.project_id AND p2.payment_status = 'success'
      ), 0)) AS pending_amount,

      p.created_at,
      p.updated_at

      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN students s ON s.user_id = u.user_id
        AND s.student_id = (
          SELECT MIN(student_id) 
          FROM students 
          WHERE user_id = u.user_id
        )
      JOIN projects pr ON p.project_id = pr.project_id
      ORDER BY p.created_at DESC;
    `);

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments: " + error.message });
  }
};

  // exports.approveProject = async (req, res) => {
  //   const { projectId, price } = req.body;

  //   if (!projectId || !price) {
  //   return res.status(400).json({ message: "projectId and totalAmount are required." });
  //   }

  //   try {
  //     const [[project]] = await pool.execute(
  //       `SELECT p.project_name, u.email, p.user_id
  //        FROM projects p
  //        JOIN users u ON p.user_id = u.user_id
  //        WHERE p.project_id = ?`,
  //       [projectId]
  //     );
  
  //     if (!project) {
  //       return res.status(404).json({ message: "Project not found" });
  //     }
  
  //     await pool.execute(
  //       `UPDATE projects SET project_status = 'approved' WHERE project_id = ?`,
  //       [projectId]
  //     );
  
  //     await pool.execute(
  //       `INSERT INTO payments (project_id, user_id, total_amount, paid_amount, payment_status)
  //        VALUES (?, ?, ?, 0, 'pending')
  //        ON DUPLICATE KEY UPDATE total_amount = ?, payment_status = 'pending'`,
  //       [projectId, project.user_id, price, price]
  //     );         
  
  //     const transporter = nodemailer.createTransport({
  //       service: "gmail",
  //       auth: {
  //         user: process.env.EMAIL_USER,
  //         pass: process.env.EMAIL_PASS,
  //       },
  //     });
  
  //     await transporter.sendMail({
  //       from: `"Project Portal" <${process.env.EMAIL_USER}>`,
  //       to: project.email,
  //       subject: "Your project has been approved!",
  //       html: `
  //         <h2>Hi,</h2>
  //         <p>Your project <strong>${project.project_name}</strong> has been approved!</p>
  //         <p>The total cost for your project is <strong>₹${price}</strong>.</p>
  //         <p>Please make the payment to begin the development.</p>
  //         <p>Thank you!</p>
  //       `,
  //     });
  
  //     res.status(200).json({ message: "Project approved and email sent." });
  //   } catch (error) {
  //     console.error("Approve Project Error:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // };  

  // exports.rejectProject = async (req, res) => {
  //   const { projectId, reason } = req.body;
  
  //   if (!projectId || !reason) {
  //     return res.status(400).json({ message: "projectId and reason are required." });
  //   }
  
  //   try {
  //     const [[project]] = await pool.execute(
  //       `SELECT p.project_name, u.email 
  //        FROM projects p 
  //        JOIN users u ON p.user_id = u.user_id 
  //        WHERE p.project_id = ?`,
  //       [projectId]
  //     );
  
  //     if (!project) {
  //       return res.status(404).json({ message: "Project not found" });
  //     }
  
  //     await pool.execute(
  //       `UPDATE projects SET project_status = 'rejected', admin_notes = ? WHERE project_id = ?`,
  //       [reason, projectId]
  //     );
  
  //     const transporter = nodemailer.createTransport({
  //       service: "gmail",
  //       auth: {
  //         user: process.env.EMAIL_USER,
  //         pass: process.env.EMAIL_PASS,
  //       },
  //     });
  
  //     await transporter.sendMail({
  //       from: `"Project Portal" <${process.env.EMAIL_USER}>`,
  //       to: project.email,
  //       subject: "Your project has been rejected",
  //       html: `
  //         <h2>Hi,</h2>
  //         <p>Your project <strong>${project.project_name}</strong> has been rejected.</p>
  //         <p><strong>Reason:</strong> ${reason}</p>
  //         <p>You can contact us for further clarification or submit a new request.</p>
  //       `,
  //     });
  
  //     res.status(200).json({ message: "Project rejected and email sent." });
  
  //   } catch (error) {
  //     console.error("Reject Project Error:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // };  

exports.approveProject = async (req, res) => {
  const { projectId, price } = req.body;

  if (!projectId || !price) {
    return res.status(400).json({ message: "projectId and price are required." });
  }

  try {
    const [[project]] = await pool.execute(
      `SELECT p.project_name, p.project_code, u.email, p.user_id
       FROM projects p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.project_id = ?`,
      [projectId]
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await pool.execute(
      `UPDATE projects 
       SET project_status = 'approved', total_amount = ?, payment_status = 'pending'
       WHERE project_id = ?`,
      [price, projectId]
    );

    await pool.execute(
      `INSERT INTO payments (project_id, user_id, paid_amount, payment_status)
       VALUES (?, ?, 0, 'pending')
       ON DUPLICATE KEY UPDATE paid_amount = 0, payment_status = 'pending'`,
      [projectId, project.user_id]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HUGU Technologies" <${process.env.EMAIL_USER}>`,
      to: project.email,
      subject: `Your project "${project.project_name}" (Code: ${project.project_code}) has been approved!`,
      html: `
        <h2>Hi,</h2>
        <p>Your project <strong>${project.project_name}</strong> (Code: ${project.project_code}) has been approved!</p>
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
      `SELECT p.project_name, p.project_code, u.email 
       FROM projects p 
       JOIN users u ON p.user_id = u.user_id 
       WHERE p.project_id = ?`,
      [projectId]
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await pool.execute(
      `UPDATE projects 
       SET project_status = 'rejected', admin_notes = ? 
       WHERE project_id = ?`,
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
      from: `"HUGU Technologies" <${process.env.EMAIL_USER}>`,
      to: project.email,
      subject: `Your project "${project.project_name}" (Code: ${project.project_code}) has been rejected`,
      html: `
        <h2>Hi,</h2>
        <p>Your project <strong>${project.project_name}</strong> (Code: ${project.project_code}) has been rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you have any questions or need further clarification, feel free to contact us.</p>
      `,
    });

    res.status(200).json({ message: "Project rejected and email sent." });

  } catch (error) {
    console.error("Reject Project Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


  // exports.closeReport = async (req, res) => {
  //   const { reportId } = req.params;
  
  //   try {
      
  //     const [result] = await pool.execute(
  //       `UPDATE reports SET report_status = 'closed' WHERE report_id = ?`,
  //       [reportId]
  //     );
  
  //     if (result.affectedRows === 0) {
  //       return res.status(404).json({ message: "Report not found" });
  //     }

  //     const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: process.env.EMAIL_USER,
  //       pass: process.env.EMAIL_PASS,
  //     },
  //   });

  //   await transporter.sendMail({
  //     from: `"Project Portal" <${process.env.EMAIL_USER}>`,
  //     to: user.email,
  //     subject: ` "${report.title}" has been closed!`,
  //     html: `
  //       <h2>Hi,</h2>
  //       <p>Your report <strong>${report.title}</strong> has been closed!</p>
  //       <p>Thank you!</p>
  //     `,
  //   });
  
  //     res.status(200).json({ message: "Report closed successfully." });
  //   } catch (error) {
  //     console.error("Close Report Error:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // };

exports.closeReport = async (req, res) => {
  const { reportId } = req.params;

  try {
    const [reportRows] = await pool.execute(
      `SELECT title, user_id FROM reports WHERE report_id = ?`,
      [reportId]
    );

    if (reportRows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = reportRows[0];

    const [userRows] = await pool.execute(
      `SELECT email FROM users WHERE user_id = ?`,
      [report.user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    const [updateResult] = await pool.execute(
      `UPDATE reports SET report_status = 'closed' WHERE report_id = ?`,
      [reportId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to close the report" });
    }

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
      subject: `Your report "${report.title}" has been closed`,
      html: `
        <h2>Hello,</h2>
        <p>Your report titled <strong>${report.title}</strong> has been reviewed and marked as <strong>closed</strong>.</p>
        <p>Thank you for reporting!</p>
      `,
    });

    res.status(200).json({ message: "Report closed and user notified successfully." });
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

  // exports.deleteProject = async (req, res) => {
  //   const { projectId } = req.params;
  
  //   if (!projectId) {
  //     return res.status(400).json({ message: "Project ID is required." });
  //   }
  
  //   try {
  //     const [rows] = await pool.execute(
  //       `SELECT p.project_id, p.user_id, p.project_name, u.email, pay.payment_status
  //        FROM projects p
  //        JOIN users u ON p.user_id = u.user_id
  //        LEFT JOIN payments pay ON pay.project_id = p.project_id
  //        WHERE p.project_id = ?`,
  //       [projectId]
  //     );
      
  //     const projectDetails = rows[0];

  //     const { payment_status, user_id, project_name, email } = projectDetails;

  //     if (!projectDetails) {
  //       return res.status(404).json({ message: "Project not found." });
  //     }
      
  //     console.log("Payment status :", payment_status);

  //     if (payment_status !== 'pending' && payment_status !== 'refunded' && payment_status !== null) {
  //       return res.status(403).json({
  //         message: "Cannot delete project. Payment already processed.",
  //       });
  //     }      
  
  //     await pool.execute(`DELETE FROM users WHERE user_id = ?`, [user_id]);
  
  //     const transporter = nodemailer.createTransport({
  //       service: "gmail",
  //       auth: {
  //         user: process.env.EMAIL_USER,
  //         pass: process.env.EMAIL_PASS,
  //       },
  //     });
  
  //     await transporter.sendMail({
  //       from: `"Project Portal" <${process.env.EMAIL_USER}>`,
  //       to: email,
  //       subject: "Your project has been removed",
  //       html: `
  //         <h2>Hi,</h2>
  //         <p>Your project <strong>${project_name}</strong> has been removed by the admin.</p>
  //         <p>Reason: The project was not processed due to payment status (<strong>${payment_status}</strong>).</p>
  //         <p>All your project and team details are also deleted from our system.</p>
  //         <p>Feel free to submit a new request anytime.</p>
  //       `,
  //     });
  
  //     return res.status(200).json({ message: "Project and associated user data deleted successfully." });
  
  //   } catch (error) {
  //     console.error("Delete Project Error:", error);
  //     return res.status(500).json({ message: "Internal server error." });
  //   }
  // };

  exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required." });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT p.project_id, p.user_id, p.project_name, u.email, pay.payment_status
       FROM projects p
       JOIN users u ON p.user_id = u.user_id
       LEFT JOIN payments pay ON pay.project_id = p.project_id
       WHERE p.project_id = ?`,
      [projectId]
    );

    const projectDetails = rows[0];

    if (!projectDetails) {
      return res.status(404).json({ message: "Project not found." });
    }

    const { payment_status, user_id, project_name, email } = projectDetails;

    console.log("Payment status:", payment_status);

    if (payment_status !== 'pending' && payment_status !== 'refunded' && payment_status !== null) {
      return res.status(403).json({
        message: "Cannot delete project. Payment already processed.",
      });
    }

    const [refundRows] = await pool.execute(
      `SELECT * FROM refunds WHERE payment_id IN (SELECT payment_id FROM payments WHERE project_id = ?) AND refund_status = 'pending'`,
      [projectId]
    );

    if (refundRows.length > 0) {
      return res.status(403).json({
        message: "Cannot delete project. Refund is pending.",
      });
    }

    await pool.execute(`DELETE FROM reports WHERE user_id = ?`, [user_id]);
    await pool.execute(`DELETE FROM payments WHERE user_id = ?`, [user_id]);
    await pool.execute(`DELETE FROM invoices WHERE user_id = ?`, [user_id]);
    await pool.execute(`DELETE FROM refunds WHERE payment_id IN (SELECT payment_id FROM payments WHERE user_id = ?)`, [user_id]);
    await pool.execute(`DELETE FROM projects WHERE user_id = ?`, [user_id]);

    await pool.execute(`DELETE FROM users WHERE user_id = ?`, [user_id]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HUGU Technologies" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your account and all associated data have been removed`,
      html: `
        <h2>Hi,</h2>
        <p>Your project <strong>${project_name}</strong> and all associated data have been removed by the admin.</p>
        <p>Reason: The project was not processed due to payment status (<strong>${payment_status}</strong>) or pending refunds.</p>
        <p>All your projects, reports, payments, invoices, refunds, and your account details have been deleted from our system.</p>
        <p>Feel free to submit a new request anytime.</p>
      `,
    });

    return res.status(200).json({ message: "Project and all associated user data deleted successfully." });

  } catch (error) {
    console.error("Delete Project Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.addDomain = async (req, res) => {
  const { domainName } = req.body;
  const file = req.file;
  
  if (!domainName || !file) {
    return res.status(400).json({ message: "Both domain name and PDF file are required." });
  }

  try {
    const [existing] = await pool.execute(`SELECT * FROM domains WHERE domain_name = ?`, [domainName]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Domain already exists." });
    }

    const pdfPath = `/uploads/domains/${file.filename}`;
    await pool.execute(`INSERT INTO domains (domain_name, pdf_url) VALUES (?, ?)`, [domainName, pdfPath]);

    res.status(201).json({ message: "Domain added successfully." });
  } catch (error) {
    console.error("Add Domain Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getAllDomains = async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT domain_id, domain_name, pdf_url FROM domains`);
    res.status(200).json({ domains: rows });
  } catch (error) {
    console.error("Get Domains Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteDomain = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(`SELECT pdf_url FROM domains WHERE domain_id = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Domain not found." });

    const filePath = path.join(__dirname, "..", rows[0].pdf_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.execute(`DELETE FROM domains WHERE domain_id = ?`, [id]);
    res.status(200).json({ message: "Domain deleted successfully." });
  } catch (error) {
    console.error("Delete Domain Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updateDomain = async (req, res) => {
  const domainId = req.params.id;
  const { domainName } = req.body;
  const file = req.file;

  try {
    const [existing] = await pool.execute(`SELECT * FROM domains WHERE domain_id = ?`, [domainId]);
    if (existing.length === 0) return res.status(404).json({ message: "Domain not found" });

    const current = existing[0];
    const updatedName = domainName || current.domain_name;
    const updatedPDF = file ? `/uploads/domains/${file.filename}` : current.pdf_url;

    await pool.execute(`UPDATE domains SET domain_name = ?, pdf_url = ? WHERE domain_id = ?`, [updatedName, updatedPDF, domainId]);

    res.status(200).json({ message: "Domain updated successfully" });
  } catch (error) {
    console.error("Update Domain Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.uploadProjectSolution = async (req, res) => {
//   try {
//     const { projectCode } = req.body;
//     const renamedPaths = [];

//     for (const file of req.files) {
//       const ext = path.extname(file.originalname);
//       const newFileName = `${projectCode}-${Date.now()}${ext}`;
//       const newPath = path.join("uploads/projects/solutions", newFileName);

//       fs.renameSync(file.path, newPath);
//       renamedPaths.push(newPath);
//     }

//     if (renamedPaths.length > 0) {
//       await pool.execute(
//         "UPDATE projects SET project_file_url = ? WHERE project_code = ?",
//         [renamedPaths[0], projectCode]
//       );
//     }

//     res.status(200).json({
//       message: "Files uploaded successfully",
//       files: renamedPaths,
//     });
//   } catch (err) {
//     console.error("Upload Error:", err);
//     res.status(500).json({ message: "Upload failed", error: err.message });
//   }
// };

exports.uploadProjectSolution = async (req, res) => {
  try {
    const { projectCode } = req.body;
    const renamedPaths = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname);
      const newFileName = `${projectCode}-${Date.now()}${ext}`;
      const newPath = path.join("uploads/projects/solutions", newFileName);

      fs.renameSync(file.path, newPath);
      renamedPaths.push(newPath);
    }

    if (renamedPaths.length > 0) {
      await pool.execute(
        "UPDATE projects SET project_file_url = ? WHERE project_code = ?",
        [renamedPaths[0], projectCode]
      );
    }

    const [userResult] = await pool.execute(
      `SELECT u.email, p.project_name 
       FROM projects p 
       JOIN users u ON p.user_id = u.user_id 
       WHERE p.project_code = ?`,
      [projectCode]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found for this project" });
    }

    const user = userResult[0];

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
      subject: `Solution uploaded for your project "${user.project_name}"`,
      html: `
        <h2>Hello,</h2>
        <p>The solution for your project <strong>${user.project_name}</strong> has been uploaded by the admin.</p>
        <p>Please visit the website to download it.</p>
        <p>Thank you!</p>
      `,
    });

    res.status(200).json({
      message: "Files uploaded successfully and notification email sent.",
      files: renamedPaths,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

exports.addProjectNote = async (req, res) => {
  try {
    const { projectCode, note } = req.body;

    if (!projectCode || !note?.trim()) {
      return res.status(400).json({ message: "Project code and note are required." });
    }

    await pool.execute(
      "UPDATE projects SET admin_notes = ? WHERE project_code = ?",
      [note, projectCode]
    );

    const [userResult] = await pool.execute(
      `SELECT u.email, p.project_name 
       FROM projects p 
       JOIN users u ON p.user_id = u.user_id 
       WHERE p.project_code = ?`,
      [projectCode]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found for this project." });
    }

    const user = userResult[0];

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
      subject: `New admin note for your project "${user.project_name}"`,
      html: `
        <h2>Hello,</h2>
        <p>You have received a new note from the admin for your project: <strong>${user.project_name}</strong>.</p>
        <p>Please log in to the website to view the note.</p>
        <p>Thank you!</p>
      `,
    });

    res.status(200).json({ message: "Note added and email notification sent." });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ message: "Failed to add note.", error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const { projectCode } = req.params;

    const [projectRows] = await pool.execute(
      "SELECT project_id, user_id FROM projects WHERE project_code = ?",
      [projectCode]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { project_id, user_id } = projectRows[0];

    const [invoiceRows] = await pool.execute(
      "SELECT invoice_url FROM invoices WHERE project_id = ? AND user_id = ?",
      [project_id, user_id]
    );

    if (invoiceRows.length === 0) {
      return res.status(404).json({ message: "No invoice available" });
    }

    return res.status(200).json({ invoiceUrl: invoiceRows[0].invoice_url });
  } catch (error) {
    console.error("Invoice fetch error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProjectDetails = async (req, res) => {
  try {
    const { projectCode } = req.params;
    const { project_name, domain, delivery_date } = req.body;

    const [result] = await pool.execute(
      `UPDATE projects 
       SET project_name = ?, domain = ?, delivery_date = ? 
       WHERE project_code = ?`,
      [project_name, domain, delivery_date, projectCode]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found or no changes made" });
    }

    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.updateReportNote = async (req, res) => {
  const { reportId } = req.params;
  const { note } = req.body;

  if (typeof note !== 'string' || note.trim() === '') {
    return res.status(400).json({ message: "A valid note string is required." });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE reports SET report_note = ? WHERE report_id = ?`,
      [note, reportId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Report not found." });
    }

    const [userResult] = await pool.execute(
      `SELECT r.title, u.email 
       FROM reports r 
       JOIN users u ON r.user_id = u.user_id 
       WHERE r.report_id = ?`,
      [reportId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found for this report." });
    }

    const user = userResult[0];

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
      subject: `Admin replied to your report: "${user.title}"`,
      html: `
        <h2>Hello,</h2>
        <p>The admin has replied to your report titled <strong>${user.title}</strong>.</p>
        <p>Please log in to the platform to read the note.</p>
        <p>Thank you!</p>
      `,
    });

    res.json({ message: "Note updated and user notified." });
  } catch (err) {
    console.error("Update Report Note Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.getProjectInvoices = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const [invoices] = await pool.execute(
      `SELECT payment_id, paid_amount, payment_method, invoice_url, payment_status, created_at
       FROM payments
       WHERE project_id = ? AND invoice_url IS NOT NULL
       ORDER BY created_at DESC`,
      [projectId]
    );

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve invoices" });
  }
};