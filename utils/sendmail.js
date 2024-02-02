const nodemailer = require("nodemailer");
const sendEmail = async (mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      // secure: false, // Use false for TLS/STARTTLS
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.KEY,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    return { message: "Success", status: 200 };
  } catch (err) {
    return { message: "Error", status: 400 };
  }
};
module.exports = sendEmail;
