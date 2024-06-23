const sendEmail = require('../utils/sendEmail.utils');
const User = require('../model/user.model');
const { AddOn, Membership, Payment } = require('../model/member.model');
const referralCodeGenerator = require('referral-code-generator');

// Create a new membership
exports.createMembership = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can create membership" });
    }
    const {
      firstName,
      lastName,
      membershipType,
      startDate,
      dueDate,
      totalAmount,
      email,
    } = req.body;
    const membershipId = referralCodeGenerator.custom('lowercase', 5, 5, 'PorchPlus');
    const existingMembership = await Membership.findOne({ email: email });
    if (existingMembership) {
      return res.status(409).json({ message: "Membership already exists" });
    }
    const membership = await Membership.create({
      firstName,
      lastName,
      membershipType,
      membershipId: membershipId,
      startDate,
      dueDate,
      totalAmount,
      email,
    });
    await sendEmail({
      email: email,
      subject: `Fitness+ Membership Confirmation - ${membership.membershipType}`,
      message: `<p>Dear ${membership.firstName},</p>
                <p>Thank you for signing up for a ${membership.membershipType} membership with PorchPlus.</p>
                <p>Your membership ID is: ${membership.membershipId}</p>
                <p> Your monthly due: ${membership.totalAmount}`,
                attachments: [
                  {
                    filename: 'confirmation.pdf',
                    content: `<p>Dear ${membership.firstName},</p>
                              <p>Thank you for signing up for a ${membership.membershipType} membership with PorchPlus.</p>
                              <p>Your membership ID is: ${membership.membershipId}</p>
                              <p>Your monthly due: ${membership.totalAmount}</p>
                              <p>Your start date: ${membership.startDate}</p>
                              <p>Your due date: ${membership.dueDate}</p>`,
                  },
                ]
              })
    return res.status(201).json(membership);
  } catch (error) {
    return res.status(500).json({ message: "internal server error",
        error: error.message });
  }
};

// pay for the monthly due and membership fee
exports.paidMonthlyService = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can make membership payment" });
    }
    const { membershipId, addonId } = req.params;
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }
    
    const addOn = membership.addOns.id(addonId);
    if (!addOn) {
      return res.status(404).json({ message: "Add-on not found" });
    }
    if (addOn.isPaid === true || membership.isFirstMonth === false) {
      return res.status(409).json({ message: "The First Add-on and membership already paid" });
    }
    
    addOn.isPaid = true;
    membership.totalAmount += addOn.monthlyAmount;
    membership.isFirstMonth = true;
    await membership.save();
    await addOn.save();
    const paymentHistory = await Payment.create({
      userId: membership._id,
      membershipId: membership.membershipId,
      paymentType: 'first Addon and membership payment',
      amount: membership.totalAmount,
      paidFor: `${addOn.addonName} and ${membership.membershipType}`,
      fullName: `${membership.firstName} ${membership.lastName}`,

    })
    const receipt = `<p>Dear ${membership.firstName},</p>
    <p>This is a confirmation for your first monthly add-on service payment.</p>
    <p>Add-On Service: ${addOn.addonName}</p>
    <p>Monthly Amount: ${addOn.monthlyAmount}</p>
    <p>Total Amount: ${membership.totalAmount}</p>`;

    await sendEmail({
      email: membership.email,
      subject: `First Fitness Addons + Membership Payment - ${membership.membershipType}`,
      message: receipt,
      attachments: [
        {
          filename:'receipt.pdf',
          content: receipt,
        }]
    })
    return res.status(200).json({ message: "Member first Payment successfully", membership });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




exports.addAddonToMember = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can make membership addon payment" });
    }
    const { membershipId } = req.params;
    const { addonName, monthlyAmount } = req.body;
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }
    const addOn = await AddOn.create({
      userId: membership._id,
      addonName,
      monthlyAmount
     });
    membership.addOns.push(addOn);
    await membership.save();
    await sendEmail({
      email: membership.email,
      subject: `Fitness+ Add-On Service - ${addOn.addonName}`,
      message: `Dear ${membership.firstName},\n\nThis is a Receipt for your monthly add-on service subscription.\n\nAdd-On Service: ${addOn.addonName}\nMonthly Amount: ${addOn.monthlyAmount}\n`,
      attachments: [
        {
          filename: 'receipt.pdf',
          content: `Dear ${membership.firstName},\n\nThis is a Receipt for your monthly add-on service subscription.\n\nAdd-On Service: ${addOn.addonName}\nMonthly Amount: ${addOn.monthlyAmount}\n`,
    }],
  });

    return res.status(201).json({ message: "membership add on successfully",  membership });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error: error.message });
  }
};

exports.getMemberships = async (req, res) => {
    try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can view membership" });
    }
        const memberships = await Membership.find();
        if (memberships.length === 0) {
            return res.status(404).json({ message: "Membership not found" });
        }
        return res.status(200).json({ message: "Memberships fetched sucessfully",  memberships });
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
}

exports.getMembershipById = async (req, res) => {
    try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can make membership addon payment" });
    }
    const { membershipId } = req.params;
    const membership = await Membership.findById(membershipId);
    if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
    }
    return res.status(200).json({ message: "Membership fetched sucessfully",  membership });
    }catch(error) {
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
}

exports.updateMembership = async (req, res) => {
    try {
        const { membershipId } = req.params;
        const {
            firstName,
            lastName,
            membershipType,
            startDate,
            dueDate,
            totalAmount,
            email,
        } = req.body;
        const membership = await Membership.findById(membershipId);
        if (!membership) {
            return res.status(404).json({ message: "Membership not found" });
        }
        const updatedMembership = await Membership.findByIdAndUpdate(membershipId, {
            firstName,
            lastName,
            membershipType,
            startDate,
            dueDate,
            totalAmount,
            email,
        }, { new: true });
        return res.status(200).json({ message: "Membership updated sucessfully",  updatedMembership });
    }catch(error) {
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
}

exports.deleteMembership = async (req, res) => {
    try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can delete member " });
    }
    const { membershipId } = req.params;
    const membership = await Membership.findById(membershipId);
    if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
    }
    await Membership.findByIdAndDelete(membership._id);
    return res.status(200).json({ message: "Membership deleted sucessfully",  membership });
    }catch(error) {
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
}


exports.updateAddon = async (req, res) => {
    try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can update membership record " });
    }
    const { membershipId, addonId } = req.params;

    const { addonName, monthlyAmount } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
    }
    const addOn = membership.addOns.id(addonId);
    if (!addOn) {
        return res.status(404).json({ message: "Add-on not found" });
    }
    addOn.addonName = addonName;
    addOn.monthlyAmount = monthlyAmount;
    await membership.save();

    return res.status(200).json({ message: "Add-on updated successfully", membership });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}





// Get all add-ons for a membership
exports.getAllAddons = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can view membership's addons " });
    }
    const { membershipId } = req.params;
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    return res.status(200).json(membership.addOns);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get a single add-on by ID
exports.getAddon = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can view membership's addons " });
    }
    const { membershipId, addonId } = req.params;
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const addOn = membership.addOns.id(addonId);

    if (!addOn) {
      return res.status(404).json({ message: "Add-on not found" });
    }

    return res.status(200).json(addOn);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete an add-on by ID
exports.deleteAddon = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can delete membership's addons " });
    }
    const { membershipId, addonId } = req.params;
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const addOn = membership.addOns.id(addonId);

    if (!addOn) {
      return res.status(404).json({ message: "Add-on not found" });
    }

    membership.addOns.pull(addOn);
    await membership.save();

    return res.status(200).json({ message: "Add-on deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.renewAnnualMembership = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can renew member's annual membership " });
    }
    const {membershipId } = req.params;
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }
    // check if membership has already been renewed through the updatedAt
    if (membership.updatedAt.getFullYear() === new Date().getFullYear()) {
      return res.status(400).json({ message: "Membership has already been renewed" });
    }
    // Calculate the new due date for the next year
    const newDueDate = new Date(membership.dueDate);
    newDueDate.setFullYear(newDueDate.getFullYear() + 1);

    // Update membership details
    membership.dueDate = newDueDate;
    membership.isFirstMonth = false;
    await membership.save();

    const paymentHistory = await Payment.create({
      userId: membership._id,
      membershipId: membership.membershipId,
      paymentType: membership.membershipType,
      amount: membership.totalAmount,
      paidFor: membership.membershipType,
      fullName: `${membership.firstName} ${membership.lastName}`,

    })

    // Send renewal confirmation email
    const receipt = `<p>Dear ${membership.firstName},</p>
                     <p>Your annual membership has been renewed.</p>
                     <p>Membership Type: ${membership.membershipType}</p>
                     <p>Total Amount: ${membership.totalAmount}</p>
                     <p>Next Due Date: ${membership.dueDate.toDateString()}</p>
                     <p>Thanks</p>`;

    await sendEmail({
      email: membership.email,
      subject: `Fitness+ Membership Renewal Confirmation - ${membership.membershipType}`,
      message: receipt,
      attachments: [
        {
          filename: 'receipt.pdf',
          content: receipt,
        },
      ],
    });

    return res.status(200).json({ message: "Membership renewed successfully", membership });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.renewMonthlyMembership = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can renew member's monthly membership " });
    }
    const { membershipId } = req.params;
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const newDueDate = new Date(membership.dueDate);
    newDueDate.setMonth(newDueDate.getMonth() + 1);

    membership.dueDate = newDueDate;
    membership.isFirstMonth = false; // Update as it's no longer the first month

    const paymentHistory = await Payment.create({
      userId: membership._id,
      membershipId: membership.membershipId,
      paymentType: membership.membershipType,
      amount: membership.totalAmount,
      paidFor: membership.membershipType,
      fullName: `${membership.firstName} ${membership.lastName}`,

    })

    await membership.save();

    const receipt = `<p>Dear ${membership.firstName},</p>
                     <p>Your monthly membership has been renewed.</p>
                     <p>Membership Type: ${membership.membershipType}</p>
                     <p>Monthly Amount: ${membership.monthlyAmount}</p>
                     <p>Next Due Date: ${membership.dueDate.toDateString()}</p>
                     <p>Thanks You</p>`;

    await sendEmail({
      email: membership.email,
      subject: `Fitness+ Membership Renewal Confirmation - ${membership.membershipType}`,
      message: receipt,
      attachments: [
        {
          filename: 'receipt.pdf',
          content: receipt,
        },
      ],
    });

    return res.status(200).json({ message: "Membership renewed successfully", membership, paymentHistory });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};





exports.addonMonthlyPayment = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can renew member's monthly addons membership " });
    }
    const { membershipId, addonId } = req.params;
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const addOn = membership.addOns.id(addonId);

    if (!addOn) {
      return res.status(404).json({ message: "Add-on not found" });
    }

    if (addOn.isPaid === true) {
      return res.status(400).json({ message: "Add-on is already paid" });
    }

    addOn.isPaid = true;
    membership.totalAmount += addOn.monthlyAmount;
    await membership.save();

    const paymentHistory = await Payment.create({
      userId: membership._id,
      membershipId: membership.membershipId,
      paymentType: 'Monthly Add-On',
      amount: addOn.monthlyAmount,
      paidFor: addOn.addonName,
      fullName: `${membership.firstName} ${membership.lastName}`
    })

    const receipt = `<p>Dear ${membership.firstName},</p>
                     <p>Your payment for the add-on service has been received.</p>
                     <p>Add-On Service: ${addOn.name}</p>
                     <p>Monthly Amount: ${addOn.monthlyAmount}</p>
                     <p>Thank you</a></p>`;

    await sendEmail({
      email: membership.email,
      subject: `Fitness+ Add-On Service Payment Confirmation`,
      message: receipt,
      attachments: [
        {
          filename: 'receipt.pdf',
          content: receipt,
        },
      ],
    });

    return res.status(200).json({ message: "Add-on payment successful", membership, paymentHistory });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.getPaymentHistoryById = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can view member's payment history" });
    }
    const { membershipId} = req.params;
    const membership = await Membership.findById(membershipId);
    const paymentHistory = await Payment.find({ membershipId: membership.membershipId });
    return res.status(200).json({ message: "Payment history retrieved successfully", paymentHistory });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


exports.searchMembershipPaymentByName = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if(user.roles !== 'admin') {
      return res.status(401).json({ message: "Unauthorized access, only admin can search member's payment history" });
    }
    const { fullName } = req.params;
    const membership = await Payment.find({ fullName: new RegExp(fullName, "i") })
    if(membership.length === 0) {
      return res.status(404).json({ message: `No Membership by that name ${fullName}` });
    }
    return res.status(200).json({ message: "Membership payment retrieved successfully", membership });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}