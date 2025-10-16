import Counter from "../models/counterModel.js";
export const getNextAccommodationNumber = async (companyId) => {
  const counter = await Counter.findOneAndUpdate(
    { company: companyId },
    { $inc: { accommodationSequence: 1 } },
    { new: true, upsert: true }
  );

  return counter.accommodationSequence;
};