import nodemailer from "nodemailer";

const sendVerificationEmail = async (name, email, verificationLink) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.elasticemail.com",
      port: 2525,
      auth: {
        user: "isholasherifdeen@gmail.com",
        pass: "47758DAAC841BAEF259D88D271AA93056A75",
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "isholasherifdeen@gmail.com",
      // to: email,
      to: email,
      subject: "Email Verification",
      text: "Hello world?",
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

const sendResetPasswordEmail = async (name, email, resetLink) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: "Password Reset",
      html: `
        <p>Welcome ${name}</p>
        <p>We received a request to reset the password for your account. Please click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};

export { sendVerificationEmail, sendResetPasswordEmail };
