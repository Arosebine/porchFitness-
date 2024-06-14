const Membership = require('../model/member.model');
const sendEmail = require('../utils/sendEmail.utils');

// Create a new membership
exports.createMembership = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      membershipType,
      startDate,
      dueDate,
      totalAmount,
      email,
    } = req.body;
    const membership = await Membership.create({
      membershipId,
      firstName,
      lastName,
      membershipType,
      startDate,
      dueDate,
      totalAmount,
      email,
    });
    return res.status(201).json(membership);
  } catch (error) {
    return res.status(500).json({ message: "internal server error",
        error: error.message });
  }
};

// Add an add-on to an existing membership
exports.addAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, monthlyAmount } = req.body;

    const membership = await Membership.findById(id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    membership.addOns.push({ name, monthlyAmount });
    await membership.save();

    return res.status(200).json({ message: "membership add on successfully",  membership });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error: error.message });
  }
};

// Cron job function to check for upcoming membership fees
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

        const receipt = `Total Amount: ${totalAmount}`;
        await sendEmail({
          to: membership.email,
          subject: `Fitness+ Membership Reminder - ${membership.membershipType}`,
          text: `Your membership is due soon. ${receipt}.`,
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

      const receipt = `Monthly Amount: ${totalMonthlyAmount}`;
      await sendEmail({
        from: process.env.EMAIL_USER,
        to: membership.email,
        subject: `Fitness+ Monthly Service Reminder - ${membership.membershipType}`,
        text: `Your monthly add-on service is due soon. ${receipt}.`,
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
