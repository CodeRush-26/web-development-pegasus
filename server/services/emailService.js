import dotenv from "dotenv";

dotenv.config();

const EMAIL_SERVICE_URL =
  process.env.EMAIL_SERVICE_URL || "https://calculator-lkr6.vercel.app";
const EMAIL_SERVICE_API_KEY =
  process.env.EMAIL_SERVICE_API_KEY || "jc-email-svc-k8x92mNpQ7wL4vR6";

export const sendOTP = async (email, otp) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Email Verification</h1>
      <p>Your OTP for email verification is:</p>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
        <strong>${otp}</strong>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
    </div>
  `;

  const payload = {
    to: email,
    subject: "Your Verification OTP",
    html: htmlContent,
    fromName: "Strait Navigation Command",
    fromEmail: process.env.EMAIL_USER,
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      username: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
    },
  };

  try {
    const response = await fetch(`${EMAIL_SERVICE_URL}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": EMAIL_SERVICE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Email microservice failed:", response.status, errText);
      return false;
    }

    const data = await response.json();
    console.log("Email sent successfully via microservice:", data);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendPasswordReset = async (email, resetLink) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Password Reset Request</h1>
      <p>You requested a password reset for your Fleet Command account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="margin: 20px 0; text-align: center;">
        <a href="${resetLink}" style="background-color: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request a password reset, please ignore this email. Your account remains secure.</p>
    </div>
  `;

  const payload = {
    to: email,
    subject: "Password Reset Request - Fleet Command",
    html: htmlContent,
    fromName: "Strait Navigation Command",
    fromEmail: process.env.EMAIL_USER,
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      username: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
    },
  };

  try {
    const response = await fetch(`${EMAIL_SERVICE_URL}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": EMAIL_SERVICE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Email microservice failed:", response.status, errText);
      return false;
    }

    const data = await response.json();
    console.log("Password reset email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Password reset email sending failed:", error);
    return false;
  }
};

export const sendInviteEmail = async (email, role, inviteLink) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">You've been invited!</h1>
      <p>You have been invited to join the Fleet Command as a <strong>${role}</strong>.</p>
      <p>Click the button below to accept your invitation and set up your account:</p>
      <div style="margin: 20px 0; text-align: center;">
        <a href="${inviteLink}" style="background-color: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Accept Invitation</a>
      </div>
      <p style="color: #666; font-size: 12px;">If you were not expecting this invitation, please ignore this email.</p>
    </div>
  `;

  const payload = {
    to: email,
    subject: "Invitation to join Fleet Command",
    html: htmlContent,
    fromName: "Strait Navigation Command",
    fromEmail: process.env.EMAIL_USER,
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      username: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
    },
  };

  try {
    const response = await fetch(`${EMAIL_SERVICE_URL}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": EMAIL_SERVICE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Email microservice failed:", response.status, errText);
      return false;
    }

    const data = await response.json();
    console.log("Invite email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Invite email sending failed:", error);
    return false;
  }
};
