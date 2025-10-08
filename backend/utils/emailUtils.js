import supabase from "./supabaseUtils.js";
import { createTransport } from "nodemailer";

/**
 * Send password reset email using Nodemailer with Gmail
 * Sends real emails to the recipient's inbox
 * 
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} recipientName - Name of the recipient
 * @returns {Object} - { success, message }
 */
export async function sendPasswordResetEmail(email, resetToken, recipientName) {
  try {
    // Construct reset URL (adjust based on your frontend URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/admin/reset-password?token=${resetToken}`;

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${recipientName || 'Admin'},</p>
            
            <p>We received a request to reset your password for your Namma Pothole Admin account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If you need assistance, please contact the system administrator.</p>
            
            <p>Best regards,<br>Namma Pothole Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Namma Pothole. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Password Reset Request

Hello ${recipientName || 'Admin'},

We received a request to reset your password for your Namma Pothole Admin account.

Reset your password by visiting this link:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

Best regards,
Namma Pothole Team
    `;

    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPass) {
      // Fallback to console logging for development
      console.log('\n=================================');
      console.log('📧 PASSWORD RESET EMAIL (DEV MODE)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Name: ${recipientName}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('=================================');
      console.log('⚠️  EMAIL_USER and EMAIL_PASSWORD not configured');
      console.log('   Add them to .env to send real emails');
      console.log('=================================\n');
      
      return {
        success: true,
        message: 'Password reset email sent successfully (dev mode)',
        resetUrl, // Include for testing purposes
      };
    }

    // Create nodemailer transporter
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass, // Use App Password, not regular password
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Namma Pothole" <${emailUser}>`,
      to: email,
      subject: 'Reset Your Namma Pothole Admin Password',
      text: emailText,
      html: emailHtml,
    });

    console.log(`✅ Password reset email sent to ${email}`);

    return {
      success: true,
      message: 'Password reset email sent successfully',
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: 'Failed to send password reset email',
    };
  }
}

/**
 * Send password change confirmation email
 * @param {string} email - Recipient email
 * @param {string} recipientName - Name of the recipient
 * @returns {Object} - { success, message }
 */
export async function sendPasswordChangedEmail(email, recipientName) {
  try {
    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          .warning { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
          </div>
          <div class="content">
            <p>Hello ${recipientName || 'Admin'},</p>
            
            <p>Your Namma Pothole Admin account password has been successfully changed.</p>
            
            <p><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
            
            <div class="warning">
              <strong>⚠️ Didn't make this change?</strong>
              <p>If you didn't change your password, please contact your system administrator immediately.</p>
            </div>
            
            <p>Best regards,<br>Namma Pothole Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Namma Pothole. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (!emailUser || !emailPass) {
      // Fallback to console logging for development
      console.log('\n=================================');
      console.log('📧 PASSWORD CHANGED CONFIRMATION (DEV MODE)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Name: ${recipientName}`);
      console.log(`Time: ${new Date().toLocaleString()}`);
      console.log('=================================\n');
      
      return {
        success: true,
        message: 'Password change confirmation sent (dev mode)',
      };
    }

    // Create nodemailer transporter
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Namma Pothole" <${emailUser}>`,
      to: email,
      subject: 'Password Changed Successfully - Namma Pothole Admin',
      html: emailHtml,
    });

    console.log(`✅ Password change confirmation sent to ${email}`);
    
    return {
      success: true,
      message: 'Password change confirmation sent',
    };
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return {
      success: false,
      error: 'Failed to send confirmation email',
    };
  }
}

