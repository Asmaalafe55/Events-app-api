import { transporter } from '../utils/nodemailer.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { config } from 'dotenv';

config();

export const contact = catchAsync(async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const mailOptions = {
      from: process.env.GMAIL_EMAIL_SEND, // here i need to specify the sender
      to: process.env.GMAIL_EMAIL_SEND,
      subject: 'Contact Form',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
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
