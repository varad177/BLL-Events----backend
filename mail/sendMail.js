import nodemailer from "nodemailer";
import { getTemplate } from "./mailTemplates/sendTemplate.js";

const sendEmail = async function (data, user) {
     console.log(data.editor[0]); 
  const transporter = nodemailer.createTransport({
    // host:process.env.SMPT_HOST,
    // port: process.env.SMPT_PORT,
    host: "smtp.elasticemail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      // user:'april61@ethereal.email' ,
      // pass:process.env.SMPT_PASSWORD
      pass: process.env.MAILPASS,
    },
  });

  const emailTemplate = getTemplate(data, user);

  await transporter.sendMail({
    // from: process.env.SMPT_FROM_HOST ,
    from: "fakeacc6862@gmail.com",
    to: user.email,
    subject: data.heading,
    html: emailTemplate,
  });
};

export default sendEmail;
