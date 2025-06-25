import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import decrypt from "./Helper"; // Adjust path as needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await axios.post(
      "https://zadmicrofin.brightoncloudtech.com/api/v1/adminRoutes/adminLogin",
      {
        login: process.env.LOGIN_USER,
        password: process.env.LOGIN_PASS,
      }
    );

    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("ENCRYPTION_KEY is not set in environment variables.");
    }

    const data = decrypt(response.data[1], response.data[0], encryptionKey);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    try {
      const now = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: "vijayloganathan2002@gmail.com",
        subject: "🚨 API DOWN ALERT",
        text: `API check failed at ${now} IST\n\nError: ${error.message}`,
      });
    } catch (mailError: any) {
      console.error("❌ Failed to send alert email:", mailError.message);
    }

    return res.status(500).json({
      success: false,
      message: "API failed",
      error: error.message,
    });
  }
}
