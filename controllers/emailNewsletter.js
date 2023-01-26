import { transporter } from '../utils/nodemailer.js';
import { config } from 'dotenv';
config();

export default async (req, res) => {
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
    res.status(200).json({
      message: 'Email sent successfully',
      success: true,
      data: mailOptions,
      email,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error sending email',
      success: false,
      error,
    });
  }
};
