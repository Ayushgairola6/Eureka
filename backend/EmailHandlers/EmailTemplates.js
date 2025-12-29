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
  process.env.BREVO_AntiNode_KEY
);
const commonStyles = `
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    line-height: 1.6; 
    color: #e2e8f0; 
    margin: 0; 
    padding: 0; 
    background-color: #09090b; 
  }
  .container { 
    max-width: 600px; 
    margin: 40px auto; 
    background: #18181b; 
    border: 1px solid #27272a;
    border-radius: 16px; 
    overflow: hidden; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.5); 
  }
  .header { 
    background: #18181b; 
    border-bottom: 1px solid #27272a;
    padding: 32px 20px; 
    text-align: center; 
  }
  .brand-text {
    background: linear-gradient(to right, #22d3ee, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0;
  }
  .content { 
    padding: 40px 32px; 
  }
  h2 {
    color: #f8fafc;
    font-size: 20px;
    font-weight: 600;
    margin-top: 0;
  }
  p {
    color: #94a3b8;
    font-size: 15px;
    margin-bottom: 24px;
  }
  .button { 
    display: inline-block; 
    padding: 14px 32px; 
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); 
    color: white; 
    text-decoration: none; 
    border-radius: 8px; 
    font-weight: 600; 
    font-size: 14px;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
  }
  .highlight-box {
    background: rgba(39, 39, 42, 0.5);
    border: 1px solid #3f3f46;
    border-radius: 8px;
    padding: 20px;
    margin: 24px 0;
  }
  .footer { 
    background: #09090b; 
    border-top: 1px solid #27272a;
    padding: 32px; 
    text-align: center; 
    color: #52525b; 
    font-size: 12px; 
  }
  .link {
    color: #22d3ee;
    text-decoration: none;
  }
`;

// export const welcomeEmail = (user) => ({
//   subject: "🎉 Welcome to AntiNode !",
//   html: `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <style>
//         body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             margin: 0;
//             padding: 0;
//             background-color: #f4f4f4;
//         }
//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//         }
//         .header {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             padding: 30px 20px;
//             text-align: center;
//         }
//         .content {
//             padding: 30px;
//         }
//         .button {
//             display: inline-block;
//             padding: 12px 30px;
//             background: #667eea;
//             color: white;
//             text-decoration: none;
//             border-radius: 5px;
//             margin: 20px 0;
//         }
//         .footer {
//             background: #f8f9fa;
//             padding: 20px;
//             text-align: center;
//             color: #666;
//             font-size: 12px;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h1>Welcome to Our Platform!</h1>
//             <p>We're thrilled to have you join us</p>
//         </div>

//         <div class="content">
//             <h2>Hello ${user.username},</h2>
//             <p>Thank you for creating an account with us! Your journey to amazing experiences starts now.</p>

//             <p>Here's what you can do next:</p>
//             <ul>
//                 <li>Complete your profile</li>
//                 <li>Explore our features</li>
//                 <li>Connect with other users</li>
//                 <li>Start creating amazing content</li>
//             </ul>

//             <div style="text-align: center;">
//                 <a href="${process.env.CLIENT_URL}/User/dashboard" class="button">
//                     Get Started
//                 </a>
//             </div>

//             <p>If you have any questions, feel free to reply to this email or visit our help center.</p>

//             <p>Welcome aboard!<br>
//             <strong>Team AntiNode</strong></p>
//         </div>

//         <div class="footer">
//             <p>© 2024 AntiNode. All rights reserved.</p>
//             <p>You're receiving this email because you recently created an account with us.</p>
//         </div>
//     </div>
// </body>
// </html>
//     `,
// });
export const welcomeEmail = (user) => ({
  subject: "🚀 Welcome to the Future with AntiNode",
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
            <h1 class="brand-text">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>Hello ${user.username},</h2>
            <p>Welcome to the next generation of intelligence. You've just unlocked a powerful suite of tools designed to amplify your potential.</p>
            
            <p>We've set up your workspace. Here is what awaits you:</p>
            
            <div class="highlight-box">
                <ul style="list-style: none; padding: 0; margin: 0; color: #e2e8f0;">
                    <li style="margin-bottom: 12px;">✨ <strong>Smart Synthesis:</strong> Turn data into insights instantly.</li>
                    <li style="margin-bottom: 12px;">📊 <strong>Dynamic Visuals:</strong> See your data come to life.</li>
                    <li>🤝 <strong>Collaborative AI:</strong> A partner that thinks with you and your team.</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
                <a href="${
                  process.env.CLIENT_URL
                }/User/dashboard" class="button">
                    Launch Dashboard
                </a>
            </div>

            <p style="font-size: 13px;">Ready to build something extraordinary?</p>
            
            <p><strong>The AntiNode Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AntiNode Inc. All rights reserved.</p>
            <p>Transforming ideas into reality.</p>
        </div>
    </div>
</body>
</html>
    `,
});
// 2. LOGIN NOTIFICATION (Security Alert)
export const loginNotificationEmail = (user, loginData) => ({
  subject: "🛡️ New Login Detected",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header" style="border-bottom: 1px solid #ef4444;">
             <h1 class="brand-text" style="background: none; -webkit-text-fill-color: #ef4444; color: #ef4444;">Security Alert</h1>
        </div>
        
        <div class="content">
            <h2>New sign-in to your account</h2>
            <p>We detected a new login to <strong>AntiNode</strong>. If this was you, you can safely ignore this email.</p>

            <div class="highlight-box" style="border-color: #ef4444; background: rgba(239, 68, 68, 0.05);">
                <table style="width: 100%; font-size: 14px; color: #e2e8f0;">
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8;">Time</td>
                        <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8;">IP Address</td>
                        <td style="padding: 8px 0; text-align: right;">${
                          loginData.ip || "Unknown"
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8;">Device</td>
                        <td style="padding: 8px 0; text-align: right;">${
                          loginData.platform || "Unknown OS"
                        } - ${loginData.browser || "Unknown Browser"}</td>
                    </tr>
                </table>
            </div>

            <p>If you did not authorize this login, please secure your account immediately.</p>
            
             <div style="text-align: center; margin-top: 24px;">
                <a href="mailto:support@AntiNode.com" style="color: #ef4444; font-weight: 600; text-decoration: none; font-size: 14px;">
                    Lock Account & Contact Support &rarr;
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>Automated security notification from AntiNode.</p>
        </div>
    </div>
</body>
</html>
    `,
});

// 3. PASSWORD RESET REQUEST
export const passwordResetEmail = (user, resetToken) => ({
  subject: "🔑 Reset Your AntiNode Credentials",
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
             <h1 class="brand-text">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>Password Reset Request</h2>
            
            <p>We received a request to update your security credentials. To set a new password, click the button below. This link is valid for <strong>1 hour</strong>.</p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${
                  process.env.CLIENT_URL
                }/reset-password?token=${resetToken}" class="button">
                    Reset Password
                </a>
            </div>

            <p style="font-size: 13px; color: #64748b;">Or paste this link into your browser:</p>
            <div class="highlight-box" style="padding: 12px; font-family: monospace; font-size: 12px; word-break: break-all; color: #22d3ee; background: #000;">
                ${process.env.CLIENT_URL}/reset-password?token=${resetToken}
            </div>

            <p style="font-size: 13px;">If you didn't request this, you can safely ignore this email. Your current password will remain active.</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} AntiNode Inc.</p>
        </div>
    </div>
</body>
</html>
    `,
});

// 4. PASSWORD RESET SUCCESS
export const passwordResetConfirmationEmail = (user) => ({
  subject: "✅ Credentials Updated Successfully",
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
             <h1 class="brand-text" style="background: none; -webkit-text-fill-color: #22c55e; color: #22c55e;">Success</h1>
        </div>
        
        <div class="content">
            <h2>Account Secured</h2>
            <p>Your password has been successfully reset on <strong>${new Date().toLocaleString()}</strong>.</p>
            
            <div class="highlight-box" style="text-align: center;">
                <p style="margin: 0; color: #e2e8f0;">You can now log in with your new credentials.</p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
                <a href="${process.env.CLIENT_URL}/login" class="button">
                    Go to Login
                </a>
            </div>
            
            <p style="margin-top: 32px;">If you did not make this change, please <a href="mailto:support@AntiNode.com" class="link">contact support</a> immediately.</p>
        </div>
        
        <div class="footer">
            <p>Security update from AntiNode.</p>
        </div>
    </div>
</body>
</html>
    `,
});

// 5. EMAIL VERIFICATION
export const emailVerificationEmail = (user, verificationToken) => ({
  subject: "⚡ Verify Your AntiNode Identity",
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
             <h1 class="brand-text">AntiNode</h1>
        </div>
        
        <div class="content">
            <h2>Verify your email address</h2>
            <p>You are almost there. We just need to verify that <strong>${
              user.email || "this email"
            }</strong> belongs to you to activate your full AntiNode experience.</p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${
                  process.env.CLIENT_URL
                }/user/verify-email?token=${verificationToken}" class="button">
                    Verify Account
                </a>
            </div>

            <p style="font-size: 13px; color: #64748b;">Or paste this secure link into your browser:</p>
            <div class="highlight-box" style="padding: 12px; font-family: monospace; font-size: 12px; word-break: break-all; color: #22d3ee; background: #000;">
                ${
                  process.env.CLIENT_URL
                }/user/verify-email?token=${verificationToken}
            </div>

            <p style="font-size: 12px; color: #52525b; margin-top: 24px;">This verification link will expire in 24 hours.</p>
        </div>
        
        <div class="footer">
            <p>Welcome to the future of data.</p>
            <p>© ${new Date().getFullYear()} AntiNode Inc.</p>
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
        email: "ayushgairola2002@gmail.com",
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
