const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
  var transporter = nodeMailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "def455f9e43e41",
      pass: "1666e8e7aa8d61",
    },
  });
  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    message: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
