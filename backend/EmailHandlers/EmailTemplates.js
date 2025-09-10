import { EmailTransporter } from "./EmailHandlers.js";
import jwt from "jsonwebtoken";
import * as Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_EUREKA_KEY
);

export const welcomeEmail = (user) => ({
  subject: "🎉 Welcome to Eureka !",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .content { 
            padding: 30px; 
        }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #667eea; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Platform!</h1>
            <p>We're thrilled to have you join us</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.username},</h2>
            <p>Thank you for creating an account with us! Your journey to amazing experiences starts now.</p>
            
            <p>Here's what you can do next:</p>
            <ul>
                <li>Complete your profile</li>
                <li>Explore our features</li>
                <li>Connect with other users</li>
                <li>Start creating amazing content</li>
            </ul>

            <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/User/dashboard" class="button">
                    Get Started
                </a>
            </div>

            <p>If you have any questions, feel free to reply to this email or visit our help center.</p>
            
            <p>Welcome aboard!<br>
            <strong>Team Eureka</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2024 Eureka. All rights reserved.</p>
            <p>You're receiving this email because you recently created an account with us.</p>
        </div>
    </div>
</body>
</html>
    `,
});

export const loginNotificationEmail = (user, loginData) => ({
  subject: "🔐 New Login Detected on Your Account",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .alert-box { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 5px; 
            padding: 15px; 
            margin: 20px 0; 
        }
        .login-details { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Login Activity</h1>
            <p>We noticed a recent login to your account</p>
        </div>
        
        <div class="content" style="padding: 30px;">
            <h2>Hello ${user.username},</h2>
            
            <div class="alert-box">
                <strong>⚠️ Security Alert:</strong> A new login was detected on your account.
            </div>

            <p><strong>Login Details:</strong></p>
            <div class="login-details">
                <p>📅 <strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
                <p>🌐 <strong>Ip address:</strong> ${
                  loginData.ip || "Unknown"
                }</p>
                <p>💻 <strong>Device:</strong> ${
                  loginData.userAgent || "Unknown device"
                }</p>
                <p>📱 <strong>Browser:</strong> ${
                  loginData.browser || "Unknown browser"
                }</p>
                <p>📱 <strong>Platform:</strong> ${
                  loginData.platform || "Unknown browser"
                }</p>

            </div>

            <p>If this was you, no action is needed. If you don't recognize this activity:</p>
            <ol>
                <li>Change your password immediately</li>
                <li>Contact our support team</li>
            </ol>

        
        <div class="footer" style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2024 Eureka. All rights reserved.</p>
            <p>This is an automated security message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `,
});

export const passwordResetEmail = (user, resetToken) => ({
  subject: "🔑 Reset Your Password",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .button { 
            display: inline-block; 
            padding: 15px 35px; 
            background: #4ecdc4; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin: 20px 0; 
        }
        .token-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0; 
            word-break: break-all; 
            font-family: monospace; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
            <p>Let's get you back into your account</p>
        </div>
        
        <div class="content" style="padding: 30px;">
            <h2>Hello ${user.username},</h2>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" class="button">
                    Reset Password
                </a>
            </div>

            <p>Or copy and paste this link in your browser:</p>
            <div class="token-box">
                ${process.env.CLIENT_URL}/reset-password?token=${resetToken}
            </div>

            <p><strong>⚠️ Important:</strong></p>
            <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will not change until you create a new one</li>
            </ul>

            <p>Need help? <a href="mailto:ayushgairola2002@gmail.com" style="color: #4ecdc4;">Contact support</a></p>

            <p>Best regards,<br>
            <strong>Support Team</strong></p>
        </div>
        
        <div class="footer" style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2024 Our Platform. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `,
});

export const passwordResetConfirmationEmail = (user) => ({
  subject: "✅ Your Password Has Been Reset",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Successfully Reset</h1>
            <p>Your account security has been updated</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.username},</h2>
            
            <p>Your password was successfully reset on <strong>${new Date().toLocaleString()}</strong>.</p>
            
            <p>If you did not perform this action, please contact us immediately:</p>
            <a href="mailto:support@eureka.com" style="color: #28a745;">Contact Security Team</a>
            
            <p>For your security, we recommend:</p>
            <ul>
                <li>Using a strong, unique password</li>
                <li>Regularly updating your password</li>
            </ul>
            
            <p>Stay secure,<br><strong>The Eureka Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2024 Eureka. All rights reserved.</p>
            <p>This is an automated security message.</p>
        </div>
    </div>
</body>
</html>
    `,
});
export const emailVerificationEmail = (user, verificationToken) => ({
  subject: "✅ Verify Your Eureka Account",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 15px 35px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
            <p>One click away from joining Eureka!</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.username},</h2>
            
            <p>Welcome to Eureka! Please verify your email address to complete your registration and unlock all features.</p>

            <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/user/verify-email?token=${verificationToken}" class="button">
                    Verify Email Address
                </a>
            </div>

            <p>Or copy this link into your browser:</p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all;">
                ${process.env.CLIENT_URL}/user/verify-email?token=${verificationToken}
            </p>

            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create this account, please ignore this email.</p>

            <p>Welcome aboard!<br><strong>The Eureka Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2024 Eureka. All rights reserved.</p>
            <p>This is an automated verification message.</p>
        </div>
    </div>
</body>
</html>
    `,
});

export class EmailServices {
  // actual email sending function
  static async SendEmail(to, subject, html) {
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();

      sendSmtpEmail.sender = {
        name: "Eureka",
        email: "ayushgairola2002@gmail.com",
      };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.params = {
        name: "Eureka",
        email: "ayushgairola2002@gmail.com",
      };
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      return data;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }
  // Public methods - specific email types
  static async sendWelcomeEmail(user) {
    const { subject, html } = welcomeEmail(user);
    return this.SendEmail(user.email, subject, html);
  }

  static async sendLoginNotification(user, loginData) {
    const { subject, html } = loginNotificationEmail(user, loginData);
    return this.SendEmail(user.email, subject, html);
  }

  static async sendPasswordResetEmail(user, resetToken) {
    const { subject, html } = passwordResetEmail(user, resetToken);
    return this.SendEmail(user.email, subject, html);
  }

  static async sendPasswordResetSuccessEmail(user) {
    const { subject, html } = passwordResetConfirmationEmail(user);
    return this.SendEmail(user.email, subject, html);
  }
  static async sendAccountVerficicationEmail(user, verificationToken) {
    const { subject, html } = emailVerificationEmail(user, verificationToken);
    return this.SendEmail(user.email, subject, html);
  }
}
