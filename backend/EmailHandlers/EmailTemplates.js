import * as Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();
// It looks like we've had a few conversations recently, and it seems like the topic has shifted from the UKPSC JE exam preparation to setting up Brevo SMTP with Node.js. I'll provide you with the information I found on the latter.

// ## Setting Up Brevo SMTP with Node.js for Email Sending

// My research indicates that setting up Brevo (formerly Sendinblue) SMTP with Node.js involves a few key steps, focusing on generating an SMTP key, configuring your Node.js project, and then writing the code to send emails.

// Here's a breakdown of how to achieve this:

// ### 1. Create a Brevo Account and Generate an SMTP Key

// *   **Sign Up for Brevo:** If you don't already have an account, you'll need to register for one on the [Brevo website](https://www.brevo.com/). You can choose a plan that suits your needs, with a free tier available for sending a limited number of emails daily. [Source 5, Source 9, Source 12]
// *   **Navigate to SMTP & API:** Once logged into your Brevo dashboard, find the "SMTP & API" section. [Source 1, Source 9]
// *   **Generate an SMTP Key:** Within the "SMTP & API" settings, you'll be able to generate a new SMTP key. It's recommended to use the "Standard" key, which is 64 characters long, for better security. [Source 1, Source 14]
// *   **Note Your Credentials:** Make sure to securely store the generated SMTP key and the login email associated with your Brevo account. You'll need these for your Node.js application. [Source 1, Source 14]

// ### 2. Set Up Your Node.js Project

// *   **Install Nodemailer:** This is a popular Node.js module for sending emails. Install it in your project directory using npm:
//     ```bash
//     npm install nodemailer
//     ```
// *   **Install Dotenv:** To securely manage your credentials, it's best practice to use environment variables. Install the `dotenv` package:
//     ```bash
//     npm install dotenv
//     ```
// *   **Store Credentials:** Create a `.env` file in the root of your project and store your Brevo login email and SMTP key there. For example:
//     ```
//     BREVO_USER='your_brevo_login_email@example.com'
//     BREVO_SMTP_KEY='your_generated_64_character_smtp_key'
//     ```
//     Remember to add `.env` to your `.gitignore` file to prevent accidentally committing your credentials. [Source 4]

// ### 3. Write the Node.js Code to Send Emails

// The following code snippet demonstrates how to set up a Nodemailer transport using your Brevo SMTP credentials and a function to send emails. This approach utilizes connection pooling for better performance.

// ```javascript
// require('dotenv').config(); // Load environment variables from .env file
// const nodemailer = require('nodemailer');

// // Configure the Nodemailer transport using Brevo's SMTP details
// const transport = nodemailer.createTransport({
//   host: 'smtp-relay.brevo.com', // Brevo's SMTP server host
//   port: 587,                   // Port for TLS
//   secure: false,               // Use STARTTLS
//   auth: {
//     user: process.env.BREVO_USER, // Your Brevo login email
//     pass: process.env.BREVO_SMTP_KEY, // Your generated Brevo SMTP key
//   },
//   pool: true,                  // Enable connection pooling
//   maxConnections: 5,           // Adjust based on expected load
//   maxMessages: 100,            // Reuse connections up to this many times
//   tls: {
//     rejectUnauthorized: true   // Ensure TLS certificates are valid
//   }
// });

// /**
//  * Sends an email using the configured Brevo SMTP transport.
//  * @param {string} to - The recipient's email address.
//  * @param {string} subject - The subject of the email.
//  * @param {string} html - The HTML content of the email.
//  */
// async function sendMail(to, subject, html) {
//   try {
//     const info = await transport.sendMail({
//       from: `"Your Name" <${process.env.BREVO_USER}>`, // Sender details
//       to,                                           // Recipient(s)
//       subject,                                      // Email subject
//       html,                                         // Email body in HTML format
//     });
//     console.log('Message sent:', info.messageId);
//     return info;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; // Re-throw the error for higher-level handling
//   }
// }

// // Export the sendMail function for use in other parts of your application
// module.exports = { sendMail };

// // Optional: Close the transport pool when your application exits
// // transport.close();
// ```

// **Explanation of the Code:**

// *   **`require('dotenv').config();`**: This line loads your environment variables from the `.env` file.
// *   **`nodemailer.createTransport({...})`**: This is where you configure Nodemailer to use Brevo's SMTP server.
//     *   `host`: Set to `smtp-relay.brevo.com`. [Source 7, Source 10]
//     *   `port`: Typically `587` for TLS connections. [Source 1, Source 7, Source 10]
//     *   `secure: false` and `tls: { rejectUnauthorized: true }`: This indicates that you'll be using STARTTLS to upgrade the connection to an encrypted one.
//     *   `auth`: Provides your Brevo `user` (login email) and `pass` (SMTP key).
//     *   `pool: true`, `maxConnections`, `maxMessages`: These options enable connection pooling, which keeps the TLS session alive across multiple email sends. This significantly reduces the overhead of establishing a new connection for each email, leading to faster and more efficient sending. [Source 1]
// *   **`async function sendMail(to, subject, html)`**: This function encapsulates the email sending logic.
//     *   It takes the recipient's email address (`to`), the `subject`, and the HTML content (`html`) as arguments.
//     *   `transport.sendMail({...})`: This is the core Nodemailer method that sends the email.
//     *   `from`: Specifies the sender's name and email address. It's good practice to use your Brevo login email here.
//     *   The function logs the message ID upon successful sending or any errors encountered.
// *   **`module.exports = { sendMail };`**: This makes the `sendMail` function available for import and use in other modules of your Node.js application.

// ### Why Connection Pooling is Important

// Imagine you're sending out a batch of welcome emails to new users. Without connection pooling, your application would have to establish a new secure connection to the Brevo server for *each* email. This involves a handshake process (like introducing yourselves and agreeing on communication rules) which takes time.

// With connection pooling enabled, your application establishes a few connections upfront and keeps them open. When you need to send another email, it simply reuses an existing, established connection. It's like having a few efficient receptionists ready to take calls instead of making each caller wait for a new receptionist to be found and briefed every single time. This drastically speeds up the sending process, especially for high volumes of emails. [Source 1]

// ### Using the `sendMail` Function

// You can then import and use this function in your routes or services like so:

// ```javascript
// const { sendMail } = require('./your_email_module'); // Assuming your code is in 'your_email_module.js'

// // Example usage in an Express.js route
// app.post('/signup', async (req, res) => {
//   const { email, name } = req.body;

//   try {
//     await sendMail(
//       email,
//       'Welcome to Our Service!',
//       `<p>Hello ${name},</p><p>Thanks for signing up!</p>`
//     );
//     res.status(200).send('Signup successful, welcome email sent!');
//   } catch (error) {
//     res.status(500).send('Signup successful, but failed to send welcome email.');
//   }
// });
// ```

// By following these steps, you can effectively integrate Brevo's SMTP relay service into your Node.js application for sending transactional emails.
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_ANTINODE
);
const commonStyles = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
    line-height: 1.6; 
    color: #374151; 
    margin: 0; 
    padding: 0; 
    background-color: #f9fafb; 
  }
  .container { 
    max-width: 580px; 
    margin: 40px auto; 
    background: #ffffff; 
    border: 1px solid #e5e7eb;
    border-radius: 8px; 
    overflow: hidden; 
  }
  .header { 
    background: #ffffff; 
    padding: 32px 28px 24px; 
    border-bottom: 1px solid #e5e7eb;
  }
  .logo {
    font-size: 22px;
    font-weight: 700;
    color: #ea580c;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .content { 
    padding: 32px 28px; 
  }
  h2 {
    color: #111827;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
    line-height: 1.4;
  }
  p {
    color: #4b5563;
    font-size: 15px;
    margin: 0 0 16px 0;
    line-height: 1.6;
  }
  .button { 
    display: inline-block; 
    padding: 12px 28px; 
    background: #ea580c; 
    color: #ffffff; 
    text-decoration: none; 
    border-radius: 6px; 
    font-weight: 600; 
    font-size: 14px;
    margin: 8px 0;
  }
  .info-box {
    background: #f9fafb;
    border-left: 3px solid #ea580c;
    border-radius: 4px;
    padding: 16px 18px;
    margin: 20px 0;
  }
  .details-table {
    width: 100%;
    font-size: 14px;
    margin: 12px 0;
  }
  .details-table td {
    padding: 8px 0;
    color: #6b7280;
  }
  .details-table td:last-child {
    text-align: right;
    color: #374151;
  }
  .footer { 
    background: #f9fafb; 
    border-top: 1px solid #e5e7eb;
    padding: 24px 28px; 
    color: #6b7280; 
    font-size: 13px; 
  }
  .footer p {
    margin: 0 0 8px 0;
    color: #6b7280;
    font-size: 13px;
  }
  .link {
    color: #ea580c;
    text-decoration: none;
  }
  .muted {
    color: #6b7280;
    font-size: 13px;
  }
  strong {
    color: #111827;
    font-weight: 600;
  }
`;

// 1. WELCOME EMAIL
export const welcomeEmail = (user) => ({
  subject: "Welcome to AntiNode",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>Hey ${user.username || "there"},</h2>
            
            <p>Thanks for signing up. Your account is ready to go.</p>
            
            <p>You now have access to:</p>
            
            <div class="info-box">
                <p style="margin: 0 0 10px 0; color: #d1d5db;"><strong>Smart Synthesis</strong> – Turn your data into insights</p>
                <p style="margin: 0 0 10px 0; color: #d1d5db;"><strong>Dynamic Visuals</strong> – Charts and graphs that actually help</p>
                <p style="margin: 0; color: #d1d5db;"><strong>Collaborative AI</strong> – Work alongside AI that gets it</p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
                <a href="${
                  process.env.CLIENT_URL
                }/User/dashboard" class="button">
                    Open Dashboard
                </a>
            </div>

            <p class="muted">Questions or running into issues? Just reply to this email or reach out at <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
            
            <p style="margin-top: 24px;">– The AntiNode Team</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AntiNode Inc.</p>
            <p style="margin: 0;">We're here if you need us: <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
        </div>
    </div>
</body>
</html>
    `,
});

// 2. LOGIN NOTIFICATION
export const loginNotificationEmail = (user, loginData) => ({
  subject: "New login to your AntiNode account",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>We noticed a new login</h2>
            
            <p>Someone just signed into your AntiNode account. If this was you, you're all set – nothing else to do.</p>

            <div class="info-box">
                <table class="details-table">
                    <tr>
                        <td>Time</td>
                        <td>${new Date().toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>IP Address</td>
                        <td>${loginData.ip || "Unknown"}</td>
                    </tr>
                    <tr>
                        <td>Device</td>
                        <td>${loginData.platform || "Unknown"} • ${
    loginData.browser || "Unknown"
  }</td>
                    </tr>
                </table>
            </div>

            <p><strong>Wasn't you?</strong> Secure your account right away. Change your password and let us know at <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
            
            <p class="muted" style="margin-top: 24px;">This is an automated security notification. We send these to keep your account safe.</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AntiNode Inc.</p>
            <p style="margin: 0;">Need help? <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
        </div>
    </div>
</body>
</html>
    `,
});

// 3. PASSWORD RESET REQUEST
export const passwordResetEmail = (user, resetToken) => ({
  subject: "Reset your AntiNode password",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>Password reset requested</h2>
            
            <p>We got a request to reset your password. Click below to choose a new one:</p>

            <div style="text-align: center; margin: 28px 0;">
                <a href="${
                  process.env.CLIENT_URL
                }/reset-password?token=${resetToken}" class="button">
                    Reset Password
                </a>
            </div>

            <p class="muted">This link expires in 1 hour. If it doesn't work, copy and paste this into your browser:</p>
            
            <div class="info-box">
                <p style="margin: 0; font-size: 12px; word-break: break-all; color: #9ca3af; font-family: monospace;">
                    ${process.env.CLIENT_URL}/reset-password?token=${resetToken}
                </p>
            </div>

            <p><strong>Didn't request this?</strong> You can ignore this email. Your password won't change.</p>

            <p class="muted" style="margin-top: 24px;">Having trouble? We're here: <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AntiNode Inc.</p>
            <p style="margin: 0;">Questions? <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
        </div>
    </div>
</body>
</html>
    `,
});

// 4. PASSWORD RESET SUCCESS
export const passwordResetConfirmationEmail = (user) => ({
  subject: "Your password has been changed",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>Password updated</h2>
            
            <p>Your AntiNode password was successfully changed on ${new Date().toLocaleString()}.</p>
            
            <p>You can log in now with your new password.</p>
            
            <div style="text-align: center; margin: 28px 0;">
                <a href="${process.env.CLIENT_URL}/login" class="button">
                    Go to Login
                </a>
            </div>
            
            <p><strong>This wasn't you?</strong> Contact us immediately at <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${
    process.env.SUPPORT_EMAIL
  }</a> and we'll help secure your account.</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AntiNode Inc.</p>
            <p style="margin: 0;">Need assistance? <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
        </div>
    </div>
</body>
</html>
    `,
});

// 5. EMAIL VERIFICATION
export const emailVerificationEmail = (user, verificationToken) => ({
  subject: "Verify your email address",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>One quick step to finish setup</h2>
            
            <p>We need to verify that <strong>${
              user.email || "this email"
            }</strong> belongs to you. Click below to confirm:</p>

            <div style="text-align: center; margin: 28px 0;">
                <a href="${
                  process.env.CLIENT_URL
                }/user/verify-email?token=${verificationToken}" class="button">
                    Verify Email Address
                </a>
            </div>

            <p class="muted">Link not working? Copy and paste this into your browser:</p>
            
            <div class="info-box">
                <p style="margin: 0; font-size: 12px; word-break: break-all; color: #9ca3af; font-family: monospace;">
                    ${
                      process.env.CLIENT_URL
                    }/user/verify-email?token=${verificationToken}
                </p>
            </div>

            <p class="muted">This verification link expires in 24 hours.</p>

            <p class="muted" style="margin-top: 24px;">Running into issues? Reach out at <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AntiNode Inc.</p>
            <p style="margin: 0;">We're here to help: <a href="mailto:${
              process.env.SUPPORT_EMAIL
            }" class="link">${process.env.SUPPORT_EMAIL}</a></p>
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
        name: "AntiNode",
        email: process.env.SUPPORT_EMAIL,
      };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.params = {
        name: "AntiNode",
        email: "ayushgairola2002@gmail.com",
      };
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      return data;
    } catch (error) {
      console.error("Email sending failed");
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
