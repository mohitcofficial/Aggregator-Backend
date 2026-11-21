import { config } from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables before creating transporter
config({
  path: "./config/config.env",
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),

  secure: false,
  requireTLS: true,

  // Identify your server with your domain
  name: "virtualxcel.in",

  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

export default transporter;
