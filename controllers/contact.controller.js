import { transporter } from '../utils/nodemailer.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { config } from 'dotenv';
import fs from 'fs';
// import path from 'path';

// Rest of your code here...
// const templatePath = path.join(__dirname, 'templates', 'contactTemplate.html');

config();

export const contact = catchAsync(async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const templatePath = 'templates/contactTemplate.html';

    const htmlContent = fs
      .readFileSync(templatePath, 'utf-8')
      .replace('{{name}}', name)
      .replace('{{email}}', email)
      .replace('{{message}}', message);

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL_SEND,
      subject: 'Contact Form',
      html: htmlContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Error sending email'
        );
      } else {
        console.log('Email sent:' + info.response);
        res.status(httpStatus.OK).json({
          message: 'Your message has been sent!',
          success: true,
          data: mailOptions,
          email,
        });
      }
    });
  } catch (error) {
    next(error);
  }
});
