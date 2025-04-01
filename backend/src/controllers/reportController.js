const pool = require("../config/db");

exports.createReport = async (req, res) => {
    try {
        const { userId, projectId, title, description, imageUrl, pdfUrl, reportStatus } = req.body;

        await pool.execute(
            "INSERT INTO reports (user_id, project_id, title, description, image_url, pdf_url, report_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, projectId, title, description, imageUrl, pdfUrl, reportStatus || 'open']
        );

        res.status(201).json({ message: "Report submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const [reports] = await pool.execute("SELECT * FROM reports");
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const [report] = await pool.execute("SELECT * FROM reports WHERE report_id = ?", [id]);

        if (report.length === 0) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json(report[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, title, imageUrl, pdfUrl, reportStatus } = req.body;

        const [result] = await pool.execute(
            "UPDATE reports SET description = ?, title = ?, image_url = ?, pdf_url = ?, report_status = ? WHERE report_id = ?",
            [description, title, imageUrl, pdfUrl, reportStatus, id] 
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Report not found or not updated" });
        }

        res.json({ message: "Report updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute("DELETE FROM reports WHERE report_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json({ message: "Report deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};