const uuidv1 = require("uuidv1");
const pool = require("../db/index");
var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ACC,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Create a reset request and send it
const createResetRequest = (email, role) => {
  const id = uuidv1();
  const request = {
    id,
    email,
    role,
  };

  // pool query to save request

  var mailOptions = {
    from: process.env.EMAIL_ACC,
    to: email,
    subject: "Password Reset Request For Lebanese University Survey Website",
    text: `To reset your password, please click on this link: http://localhost:3000/reset/${id}/${role}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return error;
    } else {
      return info;
    }
  });
};

const getResetRequest = (id) => {
  // check  if id in db
  //return request as is
};
