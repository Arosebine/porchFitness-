const sendEmail = require('../utils/sendEmail.utils');
const { AddOn, Membership } = require('../model/member.model');


exports.checkMembershipFees = async () => {
  const today = new Date();
  const memberships = await Membership.find({ dueDate: { $lte: today } });

  memberships.forEach(async (membership) => {
    if (membership.isFirstMonth == true) {
      // Send combined invoice for annual fee and first month's add-on services
      const reminderDate = new Date(membership.dueDate);
      reminderDate.setDate(reminderDate.getDate() - 7);

      if (today >= reminderDate) {
        let totalAmount = membership.totalAmount;
        membership.addOns.forEach(addOn => totalAmount += addOn.monthlyAmount);

        const receipt = `<p>Dear ${membership.firstName},</p>
                         <p>This is a reminder for your upcoming payment.</p>
                         <p>Membership Type: ${membership.membershipType}</p>
                         <p>Total Amount: ${totalAmount}</p>`;

        await sendEmail({
          email: membership.email,
          subject: `Fitness+ Membership Reminder - ${membership.membershipType}`,
          message: receipt,
          attachments: [
            {
              filename: 'receipt.pdf',
              content: receipt,
            },
          ],
        });

      }
    } else {
      // Send monthly invoice for add-on services
      let totalMonthlyAmount = 0;
      const addOnReceipts = membership.addOns.map(addOn => {
        if (addOn.isPaid == false) {
          totalMonthlyAmount += addOn.monthlyAmount;
          return `<p>Add-On Service: ${addOn.addonName}</p>
                  <p>Monthly Amount: ${addOn.monthlyAmount}</p>`;
        }
      }).join('');

      const receipt = `<p>Dear ${membership.firstName},</p>
                       <p>This is a reminder for your upcoming monthly add-on service payment.</p>
                       ${addOnReceipts}
                       <p>Total Monthly Amount: ${totalMonthlyAmount}</p>`;

      await sendEmail({
        email: membership.email,
        subject: `Fitness+ Monthly Service Reminder - ${membership.membershipType}`,
        message: receipt,
        attachments: [
          {
            filename: 'receipt.pdf',
            content: receipt,
          },
        ],
      });
    }
  });
};
