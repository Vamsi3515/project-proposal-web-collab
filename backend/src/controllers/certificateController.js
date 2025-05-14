const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const pool = require("../config/db");

exports.uploadCertificate = async (req, res) => {
  console.log("Certificate is generating...");
  try {
        console.log("1");

    const receivedHash = req.body.auth;
    const timestamp = req.body.timestamp;
    const SECRET = process.env.CERTIFICATE_SECRET_KEY;
    const expectedHash = crypto.createHash('sha256').update(SECRET + timestamp).digest('base64');
    console.log("2");

    console.log("Input to Hash:", SECRET + timestamp);
    console.log("Hashed:", expectedHash);
    console.log("Received Hash : ", receivedHash);

    if (receivedHash !== expectedHash) {
      return res.status(401).json({ message: 'Unauthorized request' });
    }
    console.log("3");

    const {
      name, college, role, start, end,
      email, certificateId, issuedDate
    } = req.body;

    console.log("4");

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Certificate file missing' });

        console.log("5");

    const filePath = path.join('uploads/certificates/view', file.filename);

    const formatDate = (d) => {
      if (!d || isNaN(new Date(d).getTime())) {
        console.log("Invalid Date:", d);
        return null;
      }
      return new Date(d).toISOString().split("T")[0];
    };

    console.log("6");

    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);
    const issuedDateFormatted = formatDate(issuedDate);

    console.log("Formatted Start Date:", startFormatted);
    console.log("Formatted End Date:", endFormatted);
    console.log("Formatted Issued Date:", issuedDateFormatted);

    await pool.execute(
    `INSERT INTO certificates 
      (name, college, role, start_date, end_date, email, certificate_id, issued_date, file_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      college = VALUES(college),
      role = VALUES(role),
      start_date = VALUES(start_date),
      end_date = VALUES(end_date),
      email = VALUES(email),
      issued_date = VALUES(issued_date),
      file_path = VALUES(file_path)`,
    [name, college, role, startFormatted, endFormatted, email, certificateId, issuedDateFormatted, filePath]
  );

    const certificate_path = filePath.replace(/\\/g, '/');

    const qrUrl = `${process.env.PUBLIC_DOMAIN}/${certificate_path}`;
    console.log("qrUrl:", qrUrl);

    res.status(200).json({ message: 'Certificate stored successfully', qrUrl });


  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getCertificateById = async (req, res) => {
  const { certificateId } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM certificates WHERE certificate_id = ?',
      [certificateId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Certificate not found' });

    const cert = rows[0];
    res.status(200).json(cert);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};