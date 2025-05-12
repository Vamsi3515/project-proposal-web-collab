const Razorpay = require('razorpay');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require("../config/db");

const { createInvoice } = require('../utils/invoiceGenerator.js');

exports.getPendingPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [pendingProjects] = await pool.execute(
      `SELECT 
         pr.project_id,
         pr.project_name,
         pr.total_amount,
         COALESCE(SUM(p.paid_amount), 0) AS paid_amount,
         (pr.total_amount - COALESCE(SUM(p.paid_amount), 0)) AS pending_amount,
         CASE
           WHEN COALESCE(SUM(p.paid_amount), 0) = 0 THEN 'pending'
           ELSE 'partially_paid'
         END AS payment_status
       FROM projects pr
       LEFT JOIN payments p 
         ON pr.project_id = p.project_id AND p.payment_status = 'success'
       WHERE pr.user_id = ?
       GROUP BY pr.project_id
       HAVING pending_amount > 0
       ORDER BY pr.created_at DESC`,
      [userId]
    );

    res.json({ success: true, payments: pendingProjects });
  } catch (error) {
    console.error("Error getting pending payments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [history] = await pool.execute(
      `SELECT 
         p.payment_id, 
         p.project_id, 
         pr.project_name, 
         p.paid_amount, 
         p.created_at
       FROM payments p
       INNER JOIN projects pr ON p.project_id = pr.project_id
       WHERE p.user_id = ? AND p.payment_status = 'success'
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ success: true, payments: history });
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, projectId } = req.body;

    const [project] = await pool.execute("SELECT * FROM projects WHERE project_id = ?", [projectId]);
    if (!project.length) {
      return res.status(404).json({ message: "Project not found" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        project_id: projectId,
        user_id: req.user.id
      }
    });

    await pool.execute(
      `INSERT INTO payments (order_id, user_id, project_id, paid_amount, payment_status)
      VALUES (?, ?, ?, ?, ?)`,
      [order.id, req.user.id, projectId, 0.00, 'pending']
    );

    res.status(200).json({
      message: "Payment order created",
      orderId: order.id,
      amount: amount * 100
    });

  } catch (error) {
    console.error("Payment Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;

    const [order] = await pool.execute(
      `SELECT * FROM payments 
       WHERE user_id = ? AND order_id = ? AND paid_amount = 0`,
      [req.user.id, orderId]
    );

    const [user] = await pool.execute(
      `SELECT email FROM users 
      WHERE user_id = ?`,
      [req.user.id]
    );

    const [student] = await pool.execute(
      `SELECT name,phone FROM students 
      WHERE user_id = ?`,
      [req.user.id]
    );

    const [project] = await pool.execute(
      `SELECT project_name, project_code,domain,delivery_date,total_amount FROM projects 
      WHERE project_id = ?`,
      [order[0].project_id]
    );

    const [team] = await pool.execute(
      `SELECT 
        JSON_UNQUOTE(college->'$.name') AS college_name, 
        domain 
      FROM student_teams 
      WHERE user_id = ?`,
      [req.user.id]
    );

    if (!order.length) {
      return res.status(404).json({ 
        success: false,
        message: "Payment record not found or already processed." 
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);
    if (!['authorized', 'captured'].includes(payment.status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid payment status: ${payment.status}` 
      });
    }

    let capturedPayment = payment;
    if (payment.status === 'authorized') {
      capturedPayment = await razorpay.payments.capture(paymentId, payment.amount);
    }

    const paidAmount = capturedPayment.amount / 100;
    const method = capturedPayment.method || 'unknown';

    const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');
    const signatureImagePath = path.join(__dirname, '..', '..', 'assets', 'signature.png');

    const [totalPaidBefore] = await pool.execute(
      `SELECT SUM(paid_amount) AS total_paid 
       FROM payments 
       WHERE project_id = ? AND payment_status = 'success'`,
      [order[0].project_id]
    );
    const paidBefore = totalPaidBefore[0].total_paid || 0;

    //invoice call
    // const invoiceUrl = await generateProfessionalInvoice({
    //   invoiceNumber: orderId,
      // businessInfo: {
      //   name: 'HUGU TECHNOLOGIES',
      //   address1: '# 2nd Floor, Chenna Complex,Opp Mega Theatre',
      //   address2: 'Pillar No P-1542,Near Dilsukhnagar, Hyderabad',
      //   phone: '+91 8106803105, +91 6303063542',
      //   email: 'info@hugotechnologies.in',
      //   website: 'http://www.hugotechnologies.in'
      // },
    // clientInfo: {
    //   name: student[0].name,
    //   email: user[0].email,
    //   phone: student[0].phone,
    //   college: team[0].college.name,
    //   domain: project[0].domain,
    // },
    // items: [{
    //   description: project[0].project_name,
    //   quantity: 1,
    //   paid_amt: paidAmount,
    // }],
    // paymentInfo: {
    //   subtotal: paidAmount,
    //   taxRate: 0,
    //   taxAmount: 0,
    //   total: paidAmount},
    //   signatureImagePath,
    //   logoPath,
    // });

    const invoice = {
      bussinessInfo: {
        name: 'HUGU TECHNOLOGIES',
        address1: '# 2nd Floor, Chenna Complex,Opp Mega Theatre',
        address2: 'Pillar No P-1542,Near Dilsukhnagar, Hyderabad',
        phone: '+91 8106803105, +91 6303063542',
        email: 'info@hugotechnologies.in',
        website: 'http://www.hugotechnologies.in'
      },
      clientInfo: {
        name: student[0].name,
        email: user[0].email,
        phone: student[0].phone,
        college: team[0].college_name,
        domain: project[0].domain,
      },
      items: [
        {
          name: project[0].project_name,
          deliveryBy: project[0].delivery_date,
          cost: project[0].total_amount,
          paid_amt: paidAmount,
          // totalPaid: paidBefore+paidAmount
        }
      ],
      paymentInfo: {
      subtotal: paidAmount,
      taxRate: 0,
      taxAmount: 0,
      dueAmount: Number(project[0].total_amount) - (Number(paidBefore)+Number(paidAmount)),
      total_paid: Number(paidBefore)+Number(paidAmount),
      total: project[0].total_amount},
    };

    const invoiceUrl = createInvoice(invoice, orderId, logoPath, signatureImagePath);

    await pool.execute(
      `UPDATE payments 
       SET paid_amount = ?, 
           payment_method = ?, 
           invoice_url = ?, 
           payment_status = 'success',
           updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = ?`,
      [paidAmount, method, invoiceUrl, order[0].payment_id]
    );

    const [totalPaidRows] = await pool.execute(
      `SELECT SUM(paid_amount) AS total_paid 
       FROM payments 
       WHERE project_id = ? AND payment_status = 'success'`,
      [order[0].project_id]
    );
    const totalPaid = totalPaidRows[0].total_paid || 0;

    const [projectRows] = await pool.execute(
      `SELECT total_amount FROM projects WHERE project_id = ?`,
      [order[0].project_id]
    );
    const totalAmount = projectRows[0].total_amount;

    let newStatus = 'pending';
    if (totalPaid >= totalAmount) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially_paid';
    }

    await pool.execute(
      `UPDATE projects SET payment_status = ? WHERE project_id = ?`,
      [newStatus, order[0].project_id]
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
      to: user[0].email,
      subject: `Payment Successful for Project: ${project[0].project_name}`,
      html: `
        <h2>Hi ${student[0].name},</h2>
        <p>Your payment of <strong>₹${paidAmount}</strong> has been successfully received for the project <strong>${project[0].project_name}</strong> (${project[0].project_code}).</p>
        <p><strong>Payment Method:</strong> ${method}</p>
        <p><strong>Invoice:</strong> <a href="${invoiceUrl}">Click here to view/download</a></p>
        <p>Thank you for choosing HUGU Technologies.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      payment: {
        id: capturedPayment.id,
        amount: paidAmount,
        method,
        status: capturedPayment.status
      },
      invoiceUrl,
      projectPaymentStatus: newStatus,
    });

  } catch (error) {
    console.error("Payment Capture Error:", error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};

// Separate invoice generation function
const generateAndSaveInvoice = async ({ paymentId, userId, projectId, amount, status }) => {
  const invoiceFileName = `invoice_${paymentId}.pdf`;
  const invoiceDir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
  
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }

  const invoicePath = path.join(invoiceDir, invoiceFileName);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(fs.createWriteStream(invoicePath));

  // Add watermark if exists
  const watermarkPath = path.join(__dirname, '..', '..', 'assets', 'watermark.png');
  if (fs.existsSync(watermarkPath)) {
    doc.image(watermarkPath, 150, 200, {
      width: 300,
      opacity: 0.1,
      align: 'center',
      valign: 'center'
    });
  }

  // Add logo if exists
  const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 30, { width: 100 });
  }

  // Invoice content
  doc.fontSize(22)
     .text('Payment Invoice', 50, 130)
     .moveDown();

  doc.fontSize(12)
     .text(`Invoice ID: ${paymentId}`)
     .text(`Project ID: ${projectId}`)
     .text(`User ID: ${userId}`)
     .text(`Amount Paid: ₹${amount.toFixed(2)}`)
     .text(`Status: ${status}`)
     .text(`Date: ${new Date().toLocaleString()}`)
     .moveDown(2)
     .text("Thank you for your payment!", { align: 'center' });

  doc.end();

  return `/uploads/invoices/${invoiceFileName}`;
};

exports.getUserDashboardPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const [payments] = await pool.execute(
      `SELECT 
        p.payment_id,
        p.order_id,
        p.user_id,
        p.invoice_url,
        p.project_id,
        pr.project_name,
        pr.project_code,
        pr.domain,
        pr.total_amount,
        p.paid_amount,
        p.payment_status,
        (
          pr.total_amount 
          - (
              CASE 
                WHEN p.payment_status = 'success' THEN 
                  p.paid_amount + COALESCE((
                    SELECT SUM(p2.paid_amount) 
                    FROM payments p2 
                    WHERE p2.project_id = p.project_id 
                      AND p2.payment_status = 'success' 
                      AND p2.payment_id < p.payment_id
                  ), 0)
                ELSE 
                  COALESCE((
                    SELECT SUM(p2.paid_amount) 
                    FROM payments p2 
                    WHERE p2.project_id = p.project_id 
                      AND p2.payment_status = 'success' 
                      AND p2.payment_id < p.payment_id
                  ), 0)
              END
          )
        ) AS pending_amount,
        p.created_at,
        p.updated_at
      FROM payments p
      JOIN projects pr ON p.project_id = pr.project_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC`,
      [userId]
    );

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Error fetching user dashboard payments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getProjectInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;

    const [invoices] = await pool.execute(
      `SELECT payment_id, paid_amount, payment_method, invoice_url, payment_status, created_at
       FROM payments
       WHERE user_id = ? AND project_id = ? AND invoice_url IS NOT NULL
       ORDER BY created_at DESC`,
      [userId, projectId]
    );

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve invoices" });
  }
};