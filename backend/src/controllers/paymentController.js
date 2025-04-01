const pool = require("../config/db");

exports.createPayment = async (req, res) => {
    try {
        const { userId, amountPaid, paymentMethod } = req.body;

        const paymentStatus = 'Pending';
        const createdAt = new Date();

        await pool.execute(
            "INSERT INTO payments (user_id, amount_paid, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?)",
            [userId, amountPaid, paymentMethod, paymentStatus, createdAt]
        );

        res.status(201).json({ message: "Payment recorded successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingPayments = async (req, res) => {
    try {
        const { userId } = req.params;

        const [result] = await pool.execute(
            "SELECT SUM(amount_due) AS pendingAmount FROM payments WHERE user_id = ? AND status = 'Pending'",
            [userId]
        );

        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const [history] = await pool.execute(
            "SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;

        const [result] = await pool.execute(
            "UPDATE payments SET status = 'Completed' WHERE payment_id = ?",
            [paymentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payment not found or already confirmed" });
        }

        res.json({ message: "Payment confirmed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};