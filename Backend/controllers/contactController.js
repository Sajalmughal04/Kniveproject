import transporter from "../config/emailConfig.js";

// Send Contact Email
export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (name, email, message)",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  console.log("\n📨 Attempting to send email...");
  console.log("From User:", name, `<${email}>`);
  console.log("To:", process.env.EMAIL_USER);

  // Email configuration
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`, // Your Gmail (authenticated)
    to: process.env.EMAIL_USER, // You receive this message
    replyTo: email, // If you click reply, it will go to the user's email
    subject: `🆕 New Contact Message from ${name}`,
    text: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from KnifeHub Contact Form
Date: ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="background-color: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #f97316; margin-bottom: 10px;">🔪 KnifeHub Contact Form</h2>
          <p style="color: #374151;">You have received a new message:</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
          
          <p><strong>👤 Name:</strong> ${name}</p>
          <p><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #f59e0b;">${email}</a></p>
          <p><strong>💬 Message:</strong></p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 5px; border-left: 4px solid #f59e0b;">
            <p style="white-space: pre-wrap; color: #1f2937;">${message}</p>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="mailto:${email}?subject=Re: Your KnifeHub Inquiry" 
               style="background-color: #f59e0b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              📧 Reply to ${name}
            </a>
          </div>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 15px;">
          Received at: ${new Date().toLocaleString("en-PK", {
            timeZone: "Asia/Karachi",
            dateStyle: "full",
            timeStyle: "short",
          })}
        </p>
      </div>
    `,
  };

  try {
    // ✅ Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    // ✅ Respond to frontend
    res.status(200).json({
      success: true,
      message: "Email sent successfully! We will get back to you soon.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("\n❌ Email send error:");
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);

    // Handle common errors
    let errorMsg = "Failed to send email. Please try again later.";

    if (error.code === "EAUTH") {
      errorMsg = "Email authentication failed. Please check email configuration.";
      console.log("\n⚠️ Check:");
      console.log("1️⃣ EMAIL_USER and EMAIL_PASS in .env");
      console.log("2️⃣ Make sure Gmail 2-Step Verification is enabled");
      console.log("3️⃣ Generate 16-character App Password");
    } else if (error.code === "ESOCKET") {
      errorMsg = "Network error. Please check your internet connection.";
    }

    res.status(500).json({
      success: false,
      message: errorMsg,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
