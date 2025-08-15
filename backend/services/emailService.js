const nodemailer = require("nodemailer");

// Create transporter with optimized settings
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add connection pooling and timeout settings for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
  });
};

// Send account activation email
const sendActivationEmail = async (email, firstName, lastName, activationToken) => {
  try {
    const transporter = createTransporter();
    
    const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/set-password?token=${activationToken}`;
    
    const mailOptions = {
      from: `"Ensums" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome! Please Set Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to OmenFox!</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello ${firstName} ${lastName},
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Your account has been created successfully! To complete your registration and access your account, please set your password by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Set Your Password
              </a>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all;">
              ${activationLink}
            </p>
            
            <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              If you didn't expect this email, please ignore it or contact support.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending activation email:", error);
    return { success: false, error: error.message };
  }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (email, firstName, lastName, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Ensums" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset Request</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello ${firstName} ${lastName},
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all;">
              ${resetLink}
            </p>
            
            <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
};