import { transporter } from '../utils/nodemailer.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { config } from 'dotenv';

config();

export const emailNewsletter = catchAsync(async (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: 'Hello',
    text: 'Hello world?',
    html: '<b>Hello world?</b>',
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(httpStatus.OK).json({
      message: 'Email sent successfully',
      success: true,
      data: mailOptions,
      email,
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error sending email',
      error
    );
  }
});
