import { transporter } from '../utils/nodemailer.js';
import { config } from 'dotenv';
config();

export default async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const mailOptions = {
      from: process.env.GMAIL_EMAIL, // here i need to specify the sender
      to: process.env.GMAIL_EMAIL_SEND,
      subject: 'Contact Form',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };
  } catch (error) {
    console.log(error);
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent:' + info.response);
    }
    // res.status(200).json(info);
    res.status(200).json({
      message: 'Your message has been sent!',
      success: true,
      data: mailOptions,
      email,
    });
    res.end();
  });
};
