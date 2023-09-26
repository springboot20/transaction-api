import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const OAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  OAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    OAuth2Client.getAccessToken((error, token) => {
      if (error) {
        reject('Failed to catch the access token');
      }
      resolve(token);
    });
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      accessToken,
      refreshToken: process.env.REFRESH_TOKEN,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    tls: {
      rejectUnauthorized: false, // This line bypasses SSL certificate verification
    },
  });
};

const sendMail = async (emailOptions) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail(emailOptions);
  } catch (error) {
    console.log(error);
  }
};

export default sendMail;
