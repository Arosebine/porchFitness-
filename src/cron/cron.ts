import cron from 'node-cron';
import Member from "../models/member";
import Addon from "../models/addon";
import { GmailMessagingService } from '../mail/mailer';

cron.schedule('0 0 * * *', async () => {
  const today = new Date();
  const members = await Member.findAll({ include: [Addon] });

  members.forEach(async (member: any) => {
    if (member.isFirstMonth) {
      const reminderDate = new Date(member.startDate);
      reminderDate.setDate(reminderDate.getDate() + 7);

      if (today.toDateString() === reminderDate.toDateString()) {
        await sendFirstMonthReminder(member);
      }
    } else {
      for (const addon of member.addons) {
        const dueDate = new Date(member.startDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        if (today.getMonth() === dueDate.getMonth()) {
          await sendMonthlyReminder(member, addon);
        }
      }
    }
  });
});

const sendFirstMonthReminder = async (member: any) => {
  const totalAmount = member.totalAmount + member.addons.reduce((sum: number, addon: any) => sum + addon.monthlyAmount, 0);
  const subject = `Fitness+ Membership Reminder - ${member.membershipType}`;
  const body = `
    <p>Dear ${member.firstName} ${member.lastName},</p>
    <p>This is a reminder for your upcoming payment.</p>
    <p>Membership Type: ${member.membershipType}</p>
    <p>Total Amount: $${totalAmount}</p>
    <p>Due Date: ${member.dueDate.toDateString()}</p>
    <p><a href="#">View Invoice</a></p>
    <p>Thank you for being with us.</p>
  `;

  const emailServiceVendor = new GmailMessagingService();
          await emailServiceVendor.sendEmail(
            member.email,
            subject,
            body
          );
};

const sendMonthlyReminder = async (member: any, addon: any) => {
  const subject = `Fitness+ Membership Reminder - ${addon.serviceName}`;
  const body = `
    <p>Dear ${member.firstName} ${member.lastName},</p>
    <p>This is a reminder for your upcoming payment.</p>
    <p>Service Name: ${addon.serviceName}</p>
    <p>Monthly Amount: $${addon.monthlyAmount}</p>
    <p><a href="#">View Invoice</a></p>
    <p>Thank you for being with us.</p>
  `;

  const emailServiceVendor = new GmailMessagingService();
          await emailServiceVendor.sendEmail(
            member.email,
            subject,
            body
          );
};
