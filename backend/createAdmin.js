const dotenv = require("dotenv");
const db = require("./src/config/db.js");
dotenv.config();

db.getConnection()
    .then((connection) => {
        console.log("MySQL Database Connected Successfully!");
        connection.release();
    })
    .catch((err) => {
        console.error("Database Connection Failed:", err.message);
    });

const bcrypt = require('bcrypt');

const createAdmin = async () => {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);

    try {
        const [rows] = await db.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [process.env.ADMIN_USER, hashedPassword, 'admin']
        );
        console.log('Admin created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        db.end();
    }
};

createAdmin();