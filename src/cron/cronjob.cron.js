const Membership = require('../model/member.model');
const cron = require('node-cron');


exports.checkMembershipFees = async () => {
    const today = new Date();
    const memberships = await Membership.find({ dueDate: { $lte: today } });
  
    memberships.forEach(async (membership) => {
      if (membership.isFirstMonth) {
        // Send combined invoice for annual fee and first month's add-on services
        const reminderDate = new Date(membership.dueDate);
        reminderDate.setDate(reminderDate.getDate() - 7);
        
        if (today >= reminderDate) {
          let totalAmount = membership.totalAmount;
          membership.addOns.forEach(addOn => totalAmount += addOn.monthlyAmount);
  
          const receipt = `<p>Dear ${membership.firstName},</p>
                   <p>This is a reminder for your upcoming payment.</p>
                   <p>Membership Type: ${membership.membershipType}</p>
                   <p>Total Amount: N${membership.totalAmount}</p>
                   <p>Invoice Link: <a href="${membership.invoiceLink}">${membership.invoiceLink}</a></p>`;
                   
          await sendEmail({
            to: membership.email,
            subject: `Fitness+ Membership Reminder - ${membership.membershipType}`,
            text: `${receipt}.`,
            attachments: [
              {
                filename: 'receipt.txt',
                content: receipt,
              },
            ],
          });
  
          membership.isFirstMonth = false;
          await membership.save();
        }
      } else {
        // Send monthly invoice for add-on services
        let totalMonthlyAmount = 0;
        membership.addOns.forEach(addOn => totalMonthlyAmount += addOn.monthlyAmount);
  
        const receipt = `<p>Dear ${membership.firstName},</p>
                     <p>This is a reminder for your Monthly upcoming add-on service payment.</p>
                     <p>Add-On Service: ${addOn.name}</p>
                     <p>Monthly Amount: ${addOn.monthlyAmount}</p>
                     <p>Invoice Link: <a href="${membership.invoiceLink}">${membership.invoiceLink}</a></p>`; 

        await sendEmail({
          from: process.env.EMAIL_USER,
          to: membership.email,
          subject: `Fitness+ Monthly Service Reminder - ${membership.membershipType}`, 
          text: `${receipt}.`,
          attachments: [
            {
              filename: 'receipt.txt',
              content: receipt,
            },
          ],
        });
      }
    });
  };
  


// cron.schedule('0 0 * * *', async () => {
//     const today = new Date();
//     const memberships = await Membership.find({ dueDate: { $lte: today } });
  
//     memberships.forEach(async (membership) => {
//       if (membership.isFirstMonth) {
//         // Send combined invoice for annual fee and first month's add-on services
//         const reminderDate = new Date(membership.dueDate);
//         reminderDate.setDate(reminderDate.getDate() - 7);
        
//         if (today >= reminderDate) {
//           const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: membership.email,
//             subject: `Fitness+ Membership Reminder - ${membership.membershipType}`,
//             text: `Your membership is due soon. Total amount: ${membership.totalAmount}.`,
//           };
  
//           await transporter.sendMail(mailOptions);
//           membership.isFirstMonth = false;
//           await membership.save();
//         }
//       } else {
//         // Send monthly invoice for add-on services
//         const mailOptions = {
//           from: process.env.EMAIL_USER,
//           to: membership.email,
//           subject: `Fitness+ Monthly Service Reminder - ${membership.membershipType}`,
//           text: `Your monthly add-on service is due soon. Monthly amount: ${membership.monthlyAmount}.`,
//         };
  
//         await transporter.sendMail(mailOptions);
//       }
//     });
//   });
  