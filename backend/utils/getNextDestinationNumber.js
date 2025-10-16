import Counter from "../models/counterModel.js";
export const getNextDestinationNumber = async (companyId) => {
  const counter = await Counter.findOneAndUpdate(
    { company: companyId },
    { $inc: { destinationSequence: 1 } },
    { new: true, upsert: true }
  );

  return counter.destinationSequence;
};