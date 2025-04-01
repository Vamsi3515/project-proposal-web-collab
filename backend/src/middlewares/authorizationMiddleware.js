const pool = require("../config/db");

const authorizeAdminOrOwner = async (req, res, next) => {
    const userId = req.user.id;
    const resourceId = req.params.id;

    try {
        const [user] = await pool.execute("SELECT role FROM users WHERE id = ?", [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user[0].role === "admin") {
            return next();
        }

        const [resource] = await pool.execute("SELECT userId FROM projects WHERE id = ?", [resourceId]);
        if (resource.length === 0) {
            return res.status(404).json({ message: "Resource not found" });
        }

        if (resource[0].userId === userId) {
            return next();
        }

        return res.status(403).json({ message: "Permission denied" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = authorizeAdminOrOwner;