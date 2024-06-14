const Membership = require('../model/member.model');
const sendEmail = require('../utils/sendEmail.utils');
const referralCodeGenerator = require('referral-code-generator');

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
    const membershipId = referralCodeGenerator.custom('lowercase', 5, 5, 'PorchPlus');
    const invoiceLink = `${process.env.DOMAIN}/invoices/${membershipId}`;
    const membership = await Membership.create({
      firstName,
      lastName,
      membershipType,
      membershipId: membershipId,
      startDate,
      dueDate,
      totalAmount,
      email,
      invoiceLink: invoiceLink,
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

exports.getMemberships = async (req, res) => {
    try {
        const memberships = await Membership.find();
        return res.status(200).json({ message: "Memberships fetched sucessfully",  memberships });
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
}

exports.getMembershipById = async (req, res) => {
    try {
        const { id } = req.params;
        const membership = await Membership.findById(id);
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
        const { id } = req.params;
        const {
            firstName,
            lastName,
            membershipType,
            startDate,
            dueDate,
            totalAmount,
            email,
        } = req.body;
        const membership = await Membership.findById(id);
        if (!membership) {
            return res.status(404).json({ message: "Membership not found" });
        }
        const updatedMembership = await Membership.findByIdAndUpdate(id, {
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
        const { id } = req.params;
        const membership = await Membership.findById(id);
        if (!membership) {
            return res.status(404).json({ message: "Membership not found" });
        }
        await Membership.findByIdAndDelete(id);
        return res.status(200).json({ message: "Membership deleted sucessfully",  membership });
    }catch(error) {
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
}


exports.updateAddon = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, monthlyAmount } = req.body;

        const membership = await Membership.findById(id);
        if (!membership) {
            return res.status(404).json({ message: "Membership not found" });
        }

        membership.addOns.push({ name, monthlyAmount });
        await membership.save();

        return res.status(200).json({ message: "Add-on updated successfully", membership });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}



// Get all add-ons for a membership
exports.getAllAddons = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res.status(200).json(membership.addOns);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get a single add-on by ID
exports.getAddon = async (req, res) => {
  try {
    const { id, addonId } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const addOn = membership.addOns.id(addonId);

    if (!addOn) {
      return res.status(404).json({ message: "Add-on not found" });
    }

    res.status(200).json(addOn);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete an add-on by ID
exports.deleteAddon = async (req, res) => {
  try {
    const { id, addonId } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const addOn = membership.addOns.id(addonId);

    if (!addOn) {
      return res.status(404).json({ message: "Add-on not found" });
    }

    addOn.remove();
    await membership.save();

    return res.status(200).json({ message: "Add-on deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
