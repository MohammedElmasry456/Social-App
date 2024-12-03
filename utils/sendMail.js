const nodemailer = require("nodemailer");

exports.sendMail = async function (options) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILERUSER,
      pass: process.env.NODEMAILERPASS,
    },
  });

  await transporter.sendMail({
    from: `"Social Media App 👻" <${process.env.nodeMailerUser}>`,
    to: options.user,
    subject: "Reset Code",
    html: `reset code :<b>${options.message}</b>`,
  });
};
