import dotenv from "dotenv";
import nodemailer from "nodemailer";

// ✅ Load environment variables
dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Log configuration
console.log("\n📧 Email Configuration:");
console.log("EMAIL_USER:", emailUser ? "✅ Loaded" : "❌ Missing");
console.log("EMAIL_PASS:", emailPass ? `✅ Loaded (${emailPass.length} chars)` : "❌ Missing");

if (!emailUser || !emailPass) {
  console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS not found in .env file!");
  console.log("\n⚠️ Please set these in your .env file:");
  console.log("EMAIL_USER=your-email@gmail.com");
  console.log("EMAIL_PASS=your-16-character-app-password\n");
}

// ✅ Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// ✅ Verify Gmail setup
const verifyEmail = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready");
    console.log(`📧 Using: ${emailUser}\n`);
  } catch (error) {
    console.log("❌ Email verification failed:", error.message);
  }
};
verifyEmail();

// ✅ Send email function (user ➜ you)
export const sendContactEmail = async (name, email, message) => {
  try {
    const mailOptions = {
      from: emailUser, // your Gmail (sender)
      to: emailUser, // your Gmail (receiver)
      subject: `📩 New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      replyTo: email, // so you can reply directly to user
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to your inbox!");
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Error sending contact email:", error.message);
    return { success: false, message: error.message };
  }
};

export default transporter;
