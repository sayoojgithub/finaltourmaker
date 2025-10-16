import Counter from "../models/counterModel.js";
export const getNextVendorNumber = async (companyId) => {
  const counter = await Counter.findOneAndUpdate(
    { company: companyId },
    { $inc: { vendorSequence: 1 } },
    { new: true, upsert: true }
  );

  return counter.vendorSequence;
};