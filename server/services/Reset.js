const uuidv1 = require("uuidv1");
const pool = require("../db/index");
var nodemailer = require("nodemailer");

// Create a reset request and send it
const createResetRequest = async (email, role) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ACC,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const id = uuidv1();
  const request = {
    id,
    email,
    role,
  };

  try {
    const insertQuery = await pool.query(
      'INSERT INTO "resetRequest" (id, email) VALUES (($1), ($2));',
      [id, email]
    );
    const mailOptions = {
      from: process.env.EMAIL_ACC,
      to: email,
      subject: "Password Reset Request For Lebanese University Survey Website",
      text: `To reset your password, please click on this link: http://localhost:3000/reset/${id}/${role}`,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    return error.message;
  }
};

const getResetRequest = async (id) => {
  const ans = await pool.query('SELECT * FROM "resetRequest" WHERE id= ($1)', [
    id,
  ]);
  return ans;
};

module.exports = { createResetRequest, getResetRequest };
