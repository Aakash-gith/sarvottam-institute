
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Use 465 for secure, or 587 for TLS
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Transporter verification failed:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

export const createMailOptions = (to, subject, html) => ({
  from: process.env.MAIL_USER,
  to,
  subject,
  html,
});

export const otpEmailTemplate = (otp) => `
${otp}
`;
