const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const path = require("path");
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: '465',
      service: 'gmail',
      auth: {
        user: 'farooq.waheed@abzafirst.com', // Your email address
        pass: 'lhjfhgloszqsoags', // Your email password
      },
    });

    const templatePath = path.join(__dirname, 'templates', `${options.type}.html`);
    const template = fs.readFileSync(templatePath, 'utf8');

    const html = template
    .replace('{{ firstName }}', options.firstName)
    .replace('{{ lastName }}', options.lastName)
    .replace('{{ firstName1 }}', options.firstName)
    .replace('{{ lastName1 }}', options.lastName)
    .replace('{{ email }}', options.email)
    .replace('{{ phoneNo }}', options.phoneNo)
    .replace('{{ organisation }}', options.organisation)
    .replace('{{ message }}', options.message)
    const mailOptions = {
        from: 'farooq.waheed@abzafirst.com',
        // to: options.email,
        to: 'info@ebdny.com',
        subject: options.subject,
        html: html,
      };
  

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
