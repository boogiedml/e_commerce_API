import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendVerificationEmail = async (name, email, verificationLink) => {
  try {
    transporter;

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      // to: email,
      to: email,
      subject: "Email Verification",
      html: `
        <p>Welcome ${name}</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};

const sendPasswordResetEmail = async (name, email, resetLink) => {
  try {
    transporter;

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: "Password Reset",
      html: `
        <p>Hello ${name}</p>
        <p>We received a request to reset the password for your account. Please click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};

export { sendVerificationEmail, sendPasswordResetEmail };
