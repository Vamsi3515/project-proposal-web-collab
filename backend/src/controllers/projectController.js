const pool = require("../config/db");

exports.createProject = async (req, res) => {
    try {
        const { userId, projectName, domain, description, referenceFile, deliveryDate, termsAgreed } = req.body;

        const projectCode = `HT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000)}`;
        const projectStatus = 'pending';
        const referencePdfUrl = referenceFile; 
        const termsAgreedStatus = termsAgreed || false;

        await pool.execute(
            "INSERT INTO projects (user_id, project_code, project_name, domain, description, reference_pdf_url, delivery_date, terms_agreed, project_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, projectCode, projectName, domain, description, referencePdfUrl, deliveryDate, termsAgreedStatus, projectStatus]
        );

        res.status(201).json({ message: "Project request submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const [projects] = await pool.execute("SELECT * FROM projects");
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const [project] = await pool.execute("SELECT * FROM projects WHERE project_id = ?", [id]);

        if (project.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json(project[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { projectName, domain, description, referenceFile, deliveryDate, termsAgreed, projectStatus, adminNotes, projectFileUrl } = req.body;

        const [result] = await pool.execute(
            "UPDATE projects SET project_name = ?, domain = ?, description = ?, reference_pdf_url = ?, delivery_date = ?, terms_agreed = ?, project_status = ?, admin_notes = ?, project_file_url = ? WHERE project_id = ?",
            [projectName, domain, description, referenceFile, deliveryDate, termsAgreed, projectStatus, adminNotes, projectFileUrl, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found or not updated" });
        }

        res.json({ message: "Project updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute("DELETE FROM projects WHERE project_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};