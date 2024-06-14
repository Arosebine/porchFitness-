import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// export const sendMail = async (to: string, subject: string, html: string) => {
//   await transporter.sendMail({
//     from: process.env.GMAIL_USER,
//     to,
//     subject,
//     html,
//   });
// };


export class GmailMessagingService {
    private transporter: nodemailer.Transporter;
  
    constructor() {
      this.transporter = nodemailer.createTransport({
        service: 'zoho',
        host: process.env.GMAIL_ADDRESS,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
    }
  
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
      try {
        const mailOptions = {
          from: process.env.EMAIL,
          to: to,
          subject: subject,
          html: html
        };
  
        await this.transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    }
  
  }