import { transporter } from '../utils/nodemailer.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const templatePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../templates/contactTemplate.html'
);

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char])
  );

export const contact = catchAsync(async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const htmlContent = fs
      .readFileSync(templatePath, 'utf-8')
      .replaceAll('{{name}}', escapeHtml(name))
      .replaceAll('{{email}}', escapeHtml(email))
      .replaceAll('{{message}}', escapeHtml(message));

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL_SEND,
      subject: 'Contact Form',
      html: htmlContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return next(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Error sending email'
          )
        );
      }
      console.log('Email sent:' + info.response);
      res.status(httpStatus.OK).json({
        message: 'Your message has been sent!',
        success: true,
      });
    });
  } catch (error) {
    next(error);
  }
});
