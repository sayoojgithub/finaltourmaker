import Purchaser from "../models/purchaserModel.js";
import Country from "../models/countryModel.js";
import State from "../models/stateModel.js";
import Destination from "../models/destinationModel.js";
import Vendor from "../models/vendorModel.js";
import Vehicle from "../models/vehicleModel.js";
import Accommodation from "../models/accommodationModel.js";
import Trip from "../models/tripModel.js";
import Activity from "../models/activityModel.js";
import AddOnTrip from "../models/addontripModel.js";
import GroupTour from "../models/groupTourModel.js";
import FixedTour from "../models/fixedTourModel.js";
import Food from "../models/foodModel.js";
import { getNextDestinationNumber } from "../utils/getNextDestinationNumber.js";
import { getNextVendorNumber } from "../utils/getNextVendorNumber.js";
import { getNextAccommodationNumber } from "../utils/getNextAccommodationNumber.js";
import Counter from "../models/counterModel.js";
export const createCountry = async (req, res) => {
  try {
    const { name } = req.body;
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Country name is required." });
    }

    const trimmedName = name.trim().toUpperCase();

    // ✅ Check if country already exists for the same purchaser and company
    const existing = await Country.findOne({
      name: trimmedName,
      company: purchaser.company,
    });

    if (existing) {
      return res.status(409).json({ message: "Country already exists." });
    }

    // Create and save new country
    const country = new Country({
      name: trimmedName,
      purchaser: purchaser._id,
      company: purchaser.company,
    });

    await country.save();

    res.status(201).json({ message: "Country created successfully.", country });
  } catch (error) {
    console.error("Error creating country:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getCountries = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const countries = await Country.find({ purchaser: purchaserId })
      .select("_id name") // fetch only _id and name
      .sort({ name: 1 });

    res.status(200).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createState = async (req, res) => {
  try {
    const { name, country } = req.body;
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // Validation
    if (!name || !country) {
      return res
        .status(400)
        .json({ message: "State name and country ID are required." });
    }

    // Check if state already exists under the same country
    const existingState = await State.findOne({
      name: name.trim().toUpperCase(),
      country: country,
    });
    if (existingState) {
      return res
        .status(409)
        .json({ message: "State already exists in this country." });
    }

    // Create and save the state
    const state = new State({
      name: name.trim().toUpperCase(),
      country: country,
      purchaser: purchaser._id,
      company: purchaser.company,
    });

    await state.save();

    res.status(201).json({ message: "State created successfully.", state });
  } catch (error) {
    console.error("Error creating state:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getStatesByCountry = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const countryId = req.params.countryId;

    const states = await State.find({
      purchaser: purchaserId,
      country: countryId,
    })
      .select("_id name")
      .sort({ name: 1 });

    res.status(200).json(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDestination = async (req, res) => {
  try {
    const { name, country, state } = req.body;
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    if (!name || !country || !state) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Prevent duplicates
    const existing = await Destination.findOne({
      name: name.trim().toUpperCase(),
      country,
      state,
    });

    if (existing) {
      return res.status(409).json({ message: "Destination already exists." });
    }
    // 🔥 Generate unique destination code
    const destinationPrefix = name
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .slice(0, 3);
    const nextSequence = await getNextDestinationNumber(purchaser.company);
    const paddedNumber = String(nextSequence).padStart(3, "0");
    const destinationCode = `${destinationPrefix}${paddedNumber}`;

    const destination = new Destination({
      name: name.trim().toUpperCase(),
      purchaser: purchaser._id,
      company: purchaser.company,
      country,
      state,
      destinationCode,
    });

    await destination.save();
    res
      .status(201)
      .json({ message: "Destination created successfully.", destination });
  } catch (error) {
    console.error("Error creating destination:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
export const updateDestinationStatus = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { id } = req.params;
    const { activeStatus } = req.body;

    const updated = await Destination.findByIdAndUpdate(
      id,
      { activeStatus },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    console.error("Status update failed", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDestinations = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { page = 1, search = "" } = req.query;
    const limit = 3;
    const skip = (page - 1) * limit;

    const query = {
      purchaser: purchaserId,
      name: { $regex: search.trim(), $options: "i" },
    };

    const total = await Destination.countDocuments(query);
    const destinations = await Destination.find(query)
      .select("_id name country state destinationCode activeStatus")
      .populate("country", "name")
      .populate("state", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: destinations,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// export const getDestinationsByCountryAndState = async (req, res) => {
//   const { countryId, stateId } = req.params;
//   const purchaserId = req.userId;

//   try {
//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     const companyId = purchaser.company;

//     const destinations = await Destination.find({
//       purchaser: purchaserId,
//       company: companyId,
//       country: countryId,
//       state: stateId,
//       activeStatus: true,
//     }).select("_id name");

//     res.status(200).json(destinations);
//   } catch (err) {
//     console.error("Error fetching destinations:", err);
//     res
//       .status(500)
//       .json({ message: "Server error while fetching destinations" });
//   }
// };

//for fetching activestatus false destinations also in case of the edit//
export const getDestinationsByCountryAndState = async (req, res) => {
  const { countryId, stateId } = req.params;
  let { currentDestinationId } = req.query; // 👈 NEW
  const purchaserId = req.userId;

  try {
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const companyId = purchaser.company;

    // normalize weird values from query string
    if (
      currentDestinationId === "undefined" ||
      currentDestinationId === "null" ||
      currentDestinationId === ""
    ) {
      currentDestinationId = undefined;
    }

    // 1) all ACTIVE destinations
    let destinations = await Destination.find({
      purchaser: purchaserId,
      company: companyId,
      country: countryId,
      state: stateId,
      activeStatus: true,
    }).select("_id name activeStatus"); // 👈 include activeStatus for UI label

    // 2) if editing: include current destination even if inactive
    if (currentDestinationId) {
      const exists = destinations.some(
        (d) => d._id.toString() === currentDestinationId.toString()
      );

      if (!exists) {
        const currentDest = await Destination.findOne({
          _id: currentDestinationId,
          purchaser: purchaserId,
          company: companyId,
          country: countryId,
          state: stateId,
          // NOTE: no activeStatus filter → can be inactive
        }).select("_id name activeStatus");

        if (currentDest) {
          destinations.push(currentDest);
        }
      }
    }

    res.status(200).json(destinations);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching destinations" });
  }
};

export const createVendor = async (req, res) => {
  try {
    const purchaserId = req.userId;

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { email, destination } = req.body;
    const companyId = purchaser.company;

    // 1. Check if vendor exists with same email, company, and destination
    const existingVendorInSameDestination = await Vendor.findOne({
      email,
      company: companyId,
      destination,
    });

    if (existingVendorInSameDestination) {
      return res
        .status(400)
        .json({ message: "Vendor already exists in this destination" });
    }
    // 2. Check if vendor exists with same email and company (in other destination)
    const existingVendor = await Vendor.findOne({
      email,
      company: companyId,
    });

    let vendorCode = "";

    if (existingVendor) {
      // Reuse the vendorNumber
      vendorCode = existingVendor.vendorCode;
    } else {
      // Create new vendorNumber using counter
      const sequence = await getNextVendorNumber(companyId);
      vendorCode = `VEN${String(sequence).padStart(3, "0")}`;
    }

    const newVendor = new Vendor({
      ...req.body,
      purchaser: purchaserId,
      company: purchaser.company,
      vendorCode,
    });

    await newVendor.save();
    res
      .status(201)
      .json({ message: "Vendor created successfully", vendor: newVendor });
  } catch (err) {
    console.error("Create Vendor Error:", err);
    res.status(500).json({ message: "Server error while creating vendor" });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res
      .status(200)
      .json({ message: "Vendor updated successfully", vendor: updatedVendor });
  } catch (err) {
    console.error("Update Vendor Error:", err);
    res.status(500).json({ message: "Server error while updating vendor" });
  }
};

export const getVendorsPaginated = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { page = 1, search = "" } = req.query;
    const limit = 3;
    const skip = (page - 1) * limit;

    const query = {
      purchaser: purchaserId,
      name: { $regex: search, $options: "i" },
    };

    const vendors = await Vendor.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("destination", "name");
    const total = await Vendor.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ data: vendors, totalPages });
  } catch (err) {
    console.error("Fetch Vendors Error:", err);
    res.status(500).json({ message: "Server error while fetching vendors" });
  }
};
export const updateVendorStatus = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { id } = req.params;
    const { activeStatus } = req.body;

    const updated = await Vendor.findByIdAndUpdate(
      id,
      { activeStatus },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    console.error("Status update failed", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const getVendorsOfVehiclesByLocation = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }
//     const { countryId, stateId, destinationId } = req.params;
//     const vendors = await Vendor.find({
//       purchaser: purchaserId,
//       country: countryId,
//       state: stateId,
//       destination: destinationId,
//       activeStatus:true,
//       services: "Vehicle",
//     }).select("_id name");

//     res.status(200).json(vendors);
//   } catch (error) {
//     console.error("Error fetching vendors:", error);
//     res.status(500).json({ message: "Failed to fetch vendors" });
//   }
// };

// export const getVendorsOfVehiclesByLocation = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     const { countryId, stateId, destinationId } = req.params;
//     let { currentVendorId } = req.query; // 👈 NEW

//     // normalize possible string junk
//     if (
//       currentVendorId === "undefined" ||
//       currentVendorId === "null" ||
//       currentVendorId === ""
//     ) {
//       currentVendorId = undefined;
//     }

//     // 1) all ACTIVE vendors for Vehicle service
//     let vendors = await Vendor.find({
//       purchaser: purchaserId,
//       country: countryId,
//       state: stateId,
//       destination: destinationId,
//       activeStatus: true,
//       services: "Vehicle",
//     }).select("_id name activeStatus"); // 👈 include activeStatus for UI

//     // 2) if editing, ensure current vendor is also included (even if inactive)
//     if (currentVendorId) {
//       const exists = vendors.some(
//         (v) => v._id.toString() === currentVendorId.toString()
//       );

//       if (!exists) {
//         const currentVendor = await Vendor.findOne({
//           _id: currentVendorId,
//           purchaser: purchaserId,
//           country: countryId,
//           state: stateId,
//           destination: destinationId,
//           services: "Vehicle",
//           // NOTE: no activeStatus filter → can be inactive
//         }).select("_id name activeStatus");

//         if (currentVendor) {
//           vendors.push(currentVendor);
//         }
//       }
//     }

//     res.status(200).json(vendors);
//   } catch (error) {
//     console.error("Error fetching vendors:", error);
//     res.status(500).json({ message: "Failed to fetch vendors" });
//   }
// };
export const getVendorsOfVehiclesByLocation = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { countryId, stateId, destinationId } = req.params;
    let { currentVendorId } = req.query; // can be "id1,id2"

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // normalize possible string junk
    if (
      currentVendorId === "undefined" ||
      currentVendorId === "null" ||
      currentVendorId === ""
    ) {
      currentVendorId = undefined;
    }

    const forcedVendorIds = currentVendorId
      ? currentVendorId.split(",").filter(Boolean)
      : [];

    // 1) all ACTIVE vendors for Vehicle service
    let vendors = await Vendor.find({
      purchaser: purchaserId,
      country: countryId,
      state: stateId,
      destination: destinationId,
      activeStatus: true,
      services: "Vehicle",
    }).select("_id name activeStatus"); // include activeStatus for UI

    // 2) if editing, ensure current vendor(s) are also included (even if inactive)
    if (forcedVendorIds.length > 0) {
      const existingIds = new Set(vendors.map((v) => v._id.toString()));

      const extraVendors = await Vendor.find({
        _id: { $in: forcedVendorIds },
        purchaser: purchaserId,
        country: countryId,
        state: stateId,
        destination: destinationId,
        services: "Vehicle",
        // NOTE: no activeStatus filter → can be inactive
      }).select("_id name activeStatus");

      for (const v of extraVendors) {
        if (!existingIds.has(v._id.toString())) {
          vendors.push(v);
        }
      }
    }

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const {
      countryId,
      stateId,
      destinationId,
      vendorId,
      category,
      vehicle,
      imageUrl,
      percentage,
    } = req.body;

    if (
      !countryId ||
      !stateId ||
      !destinationId ||
      !vendorId ||
      !category ||
      !vehicle ||
      percentage === undefined
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const newVehicle = new Vehicle({
      purchaser: purchaserId,
      company: purchaser.company, // companyId comes from purchaser doc
      country: countryId,
      state: stateId,
      destination: destinationId,
      vendor: vendorId,
      category,
      vehicle,
      imageUrl,
      percentage,
    });

    await newVehicle.save();

    res
      .status(201)
      .json({ message: "Vehicle created successfully", vehicle: newVehicle });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Failed to create vehicle" });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const {
      countryId,
      stateId,
      destinationId,
      vendorId,
      category,
      vehicle,
      imageUrl,
      percentage,
    } = req.body;

    if (
      !countryId ||
      !stateId ||
      !destinationId ||
      !vendorId ||
      !category ||
      !vehicle ||
      percentage === undefined
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const vehicleToUpdate = await Vehicle.findOne({
      _id: vehicleId,
      purchaser: purchaserId,
    });

    if (!vehicleToUpdate) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    vehicleToUpdate.country = countryId;
    vehicleToUpdate.state = stateId;
    vehicleToUpdate.destination = destinationId;
    vehicleToUpdate.vendor = vendorId;
    vehicleToUpdate.category = category;
    vehicleToUpdate.vehicle = vehicle;
    vehicleToUpdate.imageUrl = imageUrl;
    vehicleToUpdate.percentage = percentage;

    await vehicleToUpdate.save();

    res
      .status(200)
      .json({ success: true, message: "Vehicle updated successfully." });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ message: "Failed to update vehicle" });
  }
};

export const getVehiclesByPurchaser = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      purchaser: purchaserId,
    };

    if (search) {
      // First, find matching destination IDs by name
      const matchingDestinations = await Destination.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      query.destination = { $in: matchingDestinations.map((d) => d._id) };
    }

    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("vendor", "name") // already done
      .populate("destination", "name") // already done
      .populate("country", "_id name") // ✅ add this
      .populate("state", "_id name"); // ✅ add this

    const totalCount = await Vehicle.countDocuments(query);

    res.status(200).json({
      vehicles,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateVehicleStatus = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { id } = req.params;
    const { activeStatus } = req.body;

    const updated = await Vehicle.findByIdAndUpdate(
      id,
      { activeStatus },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    console.error("Status update failed", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const getVendorsOfHotelsByLocation = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const { countryId, stateId, destinationId } = req.params;
//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }
//     const vendors = await Vendor.find({
//       purchaser: purchaserId,
//       country: countryId,
//       state: stateId,
//       destination: destinationId,
//       activeStatus: true,
//       services: "Hotels",
//     }).select("_id name");

//     res.status(200).json(vendors);
//   } catch (error) {
//     console.error("Error fetching vendors:", error);
//     res.status(500).json({ message: "Failed to fetch vendors" });
//   }
// };
export const getVendorsOfHotelsByLocation = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { countryId, stateId, destinationId } = req.params;
    let { currentVendorId } = req.query; // 👈 NEW

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // normalize junk
    if (
      currentVendorId === "undefined" ||
      currentVendorId === "null" ||
      currentVendorId === ""
    ) {
      currentVendorId = undefined;
    }

    // 1) active hotel vendors
    let vendors = await Vendor.find({
      purchaser: purchaserId,
      country: countryId,
      state: stateId,
      destination: destinationId,
      activeStatus: true,
      services: "Hotels",
    }).select("_id name activeStatus"); // 👈 include activeStatus

    // 2) if editing, include current vendor even if inactive
    if (currentVendorId) {
      const exists = vendors.some(
        (v) => v._id.toString() === currentVendorId.toString()
      );

      if (!exists) {
        const currentVendor = await Vendor.findOne({
          _id: currentVendorId,
          purchaser: purchaserId,
          country: countryId,
          state: stateId,
          destination: destinationId,
          services: "Hotels",
          // no activeStatus filter → allow inactive
        }).select("_id name activeStatus");

        if (currentVendor) {
          vendors.push(currentVendor);
        }
      }
    }

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

export const createAccommodation = async (req, res) => {
  try {
    const purchaserId = req.userId;

    const purchaser = await Purchaser.findById(purchaserId).lean();
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    console.log(req.body, "full accommodation");

    const companyId = purchaser.company;
    const { formSections, ...rest } = req.body;
    const { email, destination, roomCategory } = rest;

    // Check for exact match: company, email, destination, roomCategory
    const exactMatch = await Accommodation.findOne({
      companyId,
      email,
      destination,
      roomCategory,
    });

    if (exactMatch) {
      return res.status(409).json({
        message:
          "Accommodation already exists in this destination with the same room category.",
      });
    }

    // Check if accommodation exists for same company and email (but maybe diff destination/room)
    const existingAccommodationForEmail = await Accommodation.findOne({
      companyId,
      email,
    });

    let accommodationCode = "";

    if (existingAccommodationForEmail) {
      // Reuse existing accommodation code
      accommodationCode = existingAccommodationForEmail.accommodationCode;
    } else {
      // Generate new accommodation code
      const nextNumber = await getNextAccommodationNumber(companyId);
      accommodationCode = `ACC${String(nextNumber).padStart(3, "0")}`;
    }

    const formSectionsWithCommission = formSections.map((section) => {
      const commission = Number(section.commission) || 0;
      const inflatedSection = { ...section };

      // Iterate over keys and inflate only numeric fields
      Object.keys(section).forEach((key) => {
        if (
          key !== "validFrom" &&
          key !== "validTo" &&
          key !== "commission" &&
          typeof section[key] === "number"
        ) {
          inflatedSection[key] = +(
            section[key] *
            (1 + commission / 100)
          ).toFixed(2);
        }
      });

      return inflatedSection;
    });

    const accommodation = new Accommodation({
      ...rest,
      purchaserId,
      companyId,
      accommodationCode,
      formSections,
      formSectionsWithCommission,
    });

    await accommodation.save();

    res.status(201).json({ message: "Accommodation created", accommodation });
  } catch (error) {
    console.error("Error creating accommodation:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAccommodations = async (req, res) => {
  try {
    const purchaserId = req.userId; // from verifyUser middleware
    const purchaser = await Purchaser.findById(purchaserId).lean();
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { page = 1, search = "" } = req.query;
    const limit = 3;
    const skip = (page - 1) * limit;

    const query = {
      purchaserId,
      propertyName: { $regex: search, $options: "i" },
    };

    const total = await Accommodation.countDocuments(query);
    const accommodations = await Accommodation.find(query)
      .populate("country state destination vendor companyId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ data: accommodations, totalPages });
  } catch (err) {
    console.error("Error fetching accommodations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAccommodation = async (req, res) => {
  try {
    const accommodationId = req.params.id;
    const purchaserId = req.userId;

    const purchaser = await Purchaser.findById(purchaserId).lean();
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const companyId = purchaser.company;

    const { formSections, ...rest } = req.body;

    const formSectionsWithCommission = formSections.map((section) => {
      const commission = Number(section.commission) || 0;
      const inflatedSection = { ...section };

      Object.keys(section).forEach((key) => {
        if (
          key !== "validFrom" &&
          key !== "validTo" &&
          key !== "commission" &&
          typeof section[key] === "number"
        ) {
          inflatedSection[key] = +(
            section[key] *
            (1 + commission / 100)
          ).toFixed(2);
        }
      });

      return inflatedSection;
    });

    const updatedData = {
      ...rest,
      formSections,
      formSectionsWithCommission,
      purchaserId,
      companyId,
    };

    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      accommodationId,
      updatedData,
      { new: true }
    );

    if (!updatedAccommodation) {
      return res.status(404).json({ error: "Accommodation not found" });
    }

    res.json({
      message: "Accommodation updated successfully",
      accommodation: updatedAccommodation,
    });
  } catch (error) {
    console.error("Error updating accommodation:", error);
    res.status(500).json({ error: error.message });
  }
};

// export const getVehiclesForTrip = async (req, res) => {
//   try {
//     const { country, state, destination, vendor } = req.params;
//     const purchaserId = req.userId; // Provided by verifyUser middleware

//     // Step 1: Find purchaser and its associated company
//     const purchaser = await Purchaser.findById(purchaserId).select("company");

//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     const companyId = purchaser.company;

//     // Step 2: Query vehicles with additional filters
//     const vehicles = await Vehicle.find({
//       country,
//       state,
//       destination,
//       vendor,
//       purchaser: purchaserId,
//       company: companyId,
//       activeStatus: true,
//     }).select("category vehicle");

//     res.json(vehicles);
//   } catch (err) {
//     console.error("Error fetching vehicles:", err);
//     res.status(500).json({ error: "Failed to fetch vehicles" });
//   }
// };
export const getVehiclesForTrip = async (req, res) => {
  try {
    const { country, state, destination, vendor } = req.params;
    const purchaserId = req.userId; // Provided by verifyUser middleware
    let { currentVehicleIds } = req.query; // 👈 NEW (comma-separated IDs)

    // normalize possible string junk
    if (
      currentVehicleIds === "undefined" ||
      currentVehicleIds === "null" ||
      currentVehicleIds === ""
    ) {
      currentVehicleIds = undefined;
    }

    const forcedIds = currentVehicleIds
      ? currentVehicleIds.split(",").filter(Boolean)
      : [];

    // Step 1: Find purchaser and its associated company
    const purchaser = await Purchaser.findById(purchaserId).select("company");

    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const companyId = purchaser.company;

    // Step 2: ACTIVE vehicles
    let vehicles = await Vehicle.find({
      country,
      state,
      destination,
      vendor,
      purchaser: purchaserId,
      company: companyId,
      activeStatus: true,
    }).select("_id category vehicle activeStatus");

    // Step 3: if editing – ensure current vehicle(s) are included even if inactive
    if (forcedIds.length > 0) {
      const alreadyIds = new Set(vehicles.map((v) => v._id.toString()));

      const extraVehicles = await Vehicle.find({
        _id: { $in: forcedIds },
        country,
        state,
        destination,
        vendor,
        purchaser: purchaserId,
        company: companyId,
        // NOTE: no activeStatus filter here → can be inactive
      }).select("_id category vehicle activeStatus");

      for (const v of extraVehicles) {
        if (!alreadyIds.has(v._id.toString())) {
          vehicles.push(v);
        }
      }
    }

    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
};

export const createTrip = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { formData, rows } = req.body;

    const purchaser = await Purchaser.findById(purchaserId).select("company");
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    console.log(rows);

    // Build vehicle blocks with itineraryPrices
    const vehicleBlocks = [];

    for (const row of rows) {
      const vehicleDoc = await Vehicle.findById(row.vehicle).select(
        "percentage"
      );

      if (!vehicleDoc) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const percentage = vehicleDoc.percentage;

      const prices = row.prices.map((p) => ({
        validFrom: new Date(p.validFrom),
        validTo: new Date(p.validTo),
        price: p.price,
      }));

      const itineraryPrices = prices.map((p) => {
        const basePrice = Number(p.price);
        const increasedPrice = basePrice + (basePrice * percentage) / 100;
        return {
          validFrom: p.validFrom,
          validTo: p.validTo,
          price: Number(increasedPrice.toFixed(2)),
        };
      });

      vehicleBlocks.push({
        vendor: row.vendor,
        category: row.category,
        vehicle: row.vehicle,
        prices,
        itineraryPrices, // ✅ included
      });
    }

    const trip = new Trip({
      purchaser: purchaserId,
      company: purchaser.company,
      country: formData.country,
      state: formData.state,
      destination: formData.destination,
      tripName: formData.tripName,
      description: formData.description,
      approxKm: formData.approxKm,
      imageUrl: formData.imageUrl,
      vehicles: vehicleBlocks,
    });

    await trip.save();

    res.status(201).json({ message: "Trip created successfully", trip });
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ error: "Failed to create trip" });
  }
};
export const getTrips = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId).lean();
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      purchaser: purchaserId,
    };

    if (search.trim()) {
      query.tripName = { $regex: search.trim(), $options: "i" }; // case-insensitive
    }

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate("country state destination vehicles.vendor vehicles.vehicle")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Trip.countDocuments(query),
    ]);

    res.status(200).json({
      trips,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { id } = req.params;
    const { formData, rows } = req.body;

    const purchaser = await Purchaser.findById(purchaserId).select("company");
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // Construct updated vehicle blocks (with itineraryPrices)
    const updatedVehicleBlocks = [];

    for (const row of rows) {
      const vehicleDoc = await Vehicle.findById(row.vehicle).select(
        "percentage"
      );

      if (!vehicleDoc) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const percentage = vehicleDoc.percentage;

      const prices = row.prices.map((p) => ({
        validFrom: new Date(p.validFrom),
        validTo: new Date(p.validTo),
        price: p.price,
      }));

      const itineraryPrices = prices.map((p) => {
        const basePrice = Number(p.price);
        const increasedPrice = basePrice + (basePrice * percentage) / 100;
        return {
          validFrom: p.validFrom,
          validTo: p.validTo,
          price: Number(increasedPrice.toFixed(2)),
        };
      });

      updatedVehicleBlocks.push({
        vendor: row.vendor,
        category: row.category,
        vehicle: row.vehicle,
        prices,
        itineraryPrices,
      });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      {
        purchaser: purchaserId,
        company: purchaser.company,
        country: formData.country,
        state: formData.state,
        destination: formData.destination,
        tripName: formData.tripName,
        description: formData.description,
        approxKm: formData.approxKm,
        imageUrl: formData.imageUrl,
        vehicles: updatedVehicleBlocks,
      },
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res
      .status(200)
      .json({ message: "Trip updated successfully", trip: updatedTrip });
  } catch (err) {
    console.error("Error updating trip:", err);
    res.status(500).json({ error: "Failed to update trip" });
  }
};
export const updateTripStatus = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { id } = req.params;
    const { activeStatus } = req.body;

    const updated = await Trip.findByIdAndUpdate(
      id,
      { activeStatus },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    console.error("Status update failed", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const getVendorsOfActivitiesByLocation = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const { countryId, stateId, destinationId } = req.params;
//     const purchaser = await Purchaser.findById(purchaserId).lean();
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }
//     const vendors = await Vendor.find({
//       purchaser: purchaserId,
//       country: countryId,
//       state: stateId,
//       destination: destinationId,
//       services: "Activities",
//     }).select("_id name");

//     res.status(200).json(vendors);
//   } catch (error) {
//     console.error("Error fetching vendors:", error);
//     res.status(500).json({ message: "Failed to fetch vendors" });
//   }
// };

// export const getTripsByLocation = async (req, res) => {
//   try {
//     const { countryId, stateId, destinationId } = req.params;
//     const purchaserId = req.userId;

//     // Get purchaser to find associated company
//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     const companyId = purchaser.company;

//     const trips = await Trip.find({
//       purchaser: purchaserId,
//       company: companyId,
//       country: countryId,
//       state: stateId,
//       destination: destinationId,
//        activeStatus:true,
//     }).select("_id tripName");

//     res.status(200).json(trips);
//   } catch (error) {
//     console.error("Error fetching trips:", error);
//     res.status(500).json({ error: "Failed to fetch trips" });
//   }
// };
export const getVendorsOfActivitiesByLocation = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { countryId, stateId, destinationId } = req.params;
    let { currentVendorId } = req.query; // 👈 NEW

    const purchaser = await Purchaser.findById(purchaserId).lean();
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // normalize weird values
    if (
      currentVendorId === "undefined" ||
      currentVendorId === "null" ||
      currentVendorId === ""
    ) {
      currentVendorId = undefined;
    }

    // 1) all ACTIVE vendors for Activities
    let vendors = await Vendor.find({
      purchaser: purchaserId,
      country: countryId,
      state: stateId,
      destination: destinationId,
      services: "Activities",
      activeStatus: true,
    }).select("_id name activeStatus"); // 👈 include activeStatus

    // 2) if editing: ensure current vendor is included even if inactive
    if (currentVendorId) {
      const exists = vendors.some(
        (v) => v._id.toString() === currentVendorId.toString()
      );

      if (!exists) {
        const currentVendor = await Vendor.findOne({
          _id: currentVendorId,
          purchaser: purchaserId,
          country: countryId,
          state: stateId,
          destination: destinationId,
          services: "Activities",
          // no activeStatus filter → may be inactive
        }).select("_id name activeStatus");

        if (currentVendor) {
          vendors.push(currentVendor);
        }
      }
    }

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

export const getTripsByLocation = async (req, res) => {
  try {
    const { countryId, stateId, destinationId } = req.params;
    let { currentTripId } = req.query; // 👈 NEW
    const purchaserId = req.userId;

    // normalize weird values from query string
    if (
      currentTripId === "undefined" ||
      currentTripId === "null" ||
      currentTripId === ""
    ) {
      currentTripId = undefined;
    }

    // Get purchaser to find associated company
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const companyId = purchaser.company;

    // 1) all ACTIVE trips
    let trips = await Trip.find({
      purchaser: purchaserId,
      company: companyId,
      country: countryId,
      state: stateId,
      destination: destinationId,
      activeStatus: true,
    }).select("_id tripName activeStatus"); // 👈 include activeStatus

    // 2) if editing: include current trip even if inactive
    if (currentTripId) {
      const exists = trips.some(
        (t) => t._id.toString() === currentTripId.toString()
      );

      if (!exists) {
        const currentTrip = await Trip.findOne({
          _id: currentTripId,
          purchaser: purchaserId,
          company: companyId,
          country: countryId,
          state: stateId,
          destination: destinationId,
          // NOTE: no activeStatus filter → can be inactive
        }).select("_id tripName activeStatus");

        if (currentTrip) {
          trips.push(currentTrip);
        }
      }
    }

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

export const createActivity = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const {
      country,
      state,
      destination,
      vendor,
      trip,
      activityName,
      description,
      prices,
      imageUrl,
    } = req.body;

    const activity = new Activity({
      country,
      state,
      destination,
      vendor,
      trip,
      activityName,
      description,
      prices,
      imageUrl,
      purchaser: purchaserId,
      company: purchaser.company,
    });

    await activity.save();

    res
      .status(201)
      .json({ message: "Activity created successfully", activity });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
};
export const getActivities = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { page = 1, limit = 3, search = "" } = req.query;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const query = {
      purchaser: purchaserId,
      activityName: { $regex: search, $options: "i" },
    };

    const totalActivities = await Activity.countDocuments(query);
    const totalPages = Math.ceil(totalActivities / limit);
    const activities = await Activity.find(query)
      .populate("trip", "tripName")
      .populate("vendor", "name")
      .populate("country", "name")
      .populate("state", "name")
      .populate("destination", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ activities, totalPages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};
export const updateActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const activity = await Activity.findOne({
      _id: activityId,
      purchaser: purchaserId,
    });

    if (!activity) {
      return res
        .status(404)
        .json({ error: "Activity not found or unauthorized" });
    }

    const {
      country,
      state,
      destination,
      vendor,
      trip,
      activityName,
      description,
      prices,
      imageUrl,
    } = req.body;

    activity.country = country;
    activity.state = state;
    activity.destination = destination;
    activity.vendor = vendor;
    activity.trip = trip;
    activity.activityName = activityName;
    activity.description = description;
    activity.prices = prices;
    if (typeof imageUrl !== "undefined") {
      activity.imageUrl = imageUrl; // allow update OR clear
    }

    await activity.save();

    res
      .status(200)
      .json({ message: "Activity updated successfully", activity });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Failed to update activity" });
  }
};
export const updateActivityStatus = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { id } = req.params;
    const { activeStatus } = req.body;

    const updated = await Activity.findByIdAndUpdate(
      id,
      { activeStatus },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    console.error("Status update failed", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const createAddOnTrip = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { formData, rows } = req.body;

    const purchaser = await Purchaser.findById(purchaserId).select("company");
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    // Build vehicle blocks with itineraryPrices
    const vehicleBlocks = [];

    for (const row of rows) {
      const vehicleDoc = await Vehicle.findById(row.vehicle).select(
        "percentage"
      );

      if (!vehicleDoc) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const percentage = vehicleDoc.percentage;

      const prices = row.prices.map((p) => ({
        validFrom: new Date(p.validFrom),
        validTo: new Date(p.validTo),
        price: p.price,
      }));

      const itineraryPrices = prices.map((p) => {
        const basePrice = Number(p.price);
        const increasedPrice = basePrice + (basePrice * percentage) / 100;
        return {
          validFrom: p.validFrom,
          validTo: p.validTo,
          price: Number(increasedPrice.toFixed(2)),
        };
      });

      vehicleBlocks.push({
        vendor: row.vendor,
        category: row.category,
        vehicle: row.vehicle,
        prices,
        itineraryPrices,
      });
    }

    const trip = new AddOnTrip({
      purchaser: purchaserId,
      company: purchaser.company,
      country: formData.country,
      state: formData.state,
      destination: formData.destination,
      trip: formData.trip,
      addontripName: formData.addontripName,
      description: formData.description,
      approxKm: formData.approxKm,
      imageUrl: formData.imageUrl,
      vehicles: vehicleBlocks,
    });

    await trip.save();
    res.status(201).json({ message: "AddOnTrip created successfully", trip });
  } catch (err) {
    console.error("Error creating addontrip:", err);
    res.status(500).json({ error: "Failed to create addontrip" });
  }
};
export const getAddOnTrips = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const query = {
      purchaser: purchaserId,
    };

    if (search.trim()) {
      query.addontripName = { $regex: search.trim(), $options: "i" }; // case-insensitive
    }

    const [trips, total] = await Promise.all([
      AddOnTrip.find(query)
        .populate(
          "country state destination trip vehicles.vendor vehicles.vehicle"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AddOnTrip.countDocuments(query),
    ]);

    res.status(200).json({
      trips,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

export const updateAddOnTrip = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { id } = req.params;
    const { formData, rows } = req.body;

    const purchaser = await Purchaser.findById(purchaserId).select("company");
    if (!purchaser) {
      return res.status(404).json({ error: "Purchaser not found" });
    }
    // Construct updated vehicle blocks (with itineraryPrices)
    const updatedVehicleBlocks = [];

    for (const row of rows) {
      const vehicleDoc = await Vehicle.findById(row.vehicle).select(
        "percentage"
      );

      if (!vehicleDoc) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const percentage = vehicleDoc.percentage;

      const prices = row.prices.map((p) => ({
        validFrom: new Date(p.validFrom),
        validTo: new Date(p.validTo),
        price: p.price,
      }));

      const itineraryPrices = prices.map((p) => {
        const basePrice = Number(p.price);
        const increasedPrice = basePrice + (basePrice * percentage) / 100;
        return {
          validFrom: p.validFrom,
          validTo: p.validTo,
          price: Number(increasedPrice.toFixed(2)),
        };
      });

      updatedVehicleBlocks.push({
        vendor: row.vendor,
        category: row.category,
        vehicle: row.vehicle,
        prices,
        itineraryPrices,
      });
    }

    const updatedTrip = await AddOnTrip.findByIdAndUpdate(
      id,
      {
        purchaser: purchaserId,
        company: purchaser.company,
        country: formData.country,
        state: formData.state,
        destination: formData.destination,
        trip: formData.trip,
        addontripName: formData.addontripName,
        description: formData.description,
        approxKm: formData.approxKm,
        imageUrl: formData.imageUrl,
        vehicles: updatedVehicleBlocks,
      },
      { new: true } // Return updated document
    );

    if (!updatedTrip) {
      return res.status(404).json({ error: "AddOnTrip not found" });
    }

    res
      .status(200)
      .json({ message: "AddOnTrip updated successfully", trip: updatedTrip });
  } catch (err) {
    console.error("Error updating addontrip:", err);
    res.status(500).json({ error: "Failed to update addontrip" });
  }
};
export const updateAddOnTripStatus = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { id } = req.params;
    const { activeStatus } = req.body;

    const updated = await AddOnTrip.findByIdAndUpdate(
      id,
      { activeStatus },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Addontrip not found" });
    }

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    console.error("Status update failed", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const getTripDetails = async (req, res) => {
//   try {
//     const { tripId } = req.params;
//     const purchaserId = req.userId;
//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     // Fetch Add-On Trips
//     const addonTrips = await AddOnTrip.find({
//       purchaser: purchaserId,
//       trip: tripId,
//     }).select("_id addontripName");

//     // Map to use consistent name key
//     const formattedAddons = addonTrips.map((trip) => ({
//       _id: trip._id,
//       tripName: trip.addontripName,
//     }));

//     // Fetch Activities
//     const activities = await Activity.find({
//       purchaser: purchaserId,
//       trip: tripId,
//     }).select("_id activityName");

//     const formattedActivities = activities.map((act) => ({
//       _id: act._id,
//       tripName: act.activityName,
//     }));

//     return res.json({
//       addonTrips: formattedAddons,
//       activities: formattedActivities,
//     });
//   } catch (err) {
//     console.error("Error in getTripDetails:", err.message);
//     res
//       .status(500)
//       .json({ message: "Server error while fetching trip details." });
//   }
// };
export const getTripDetails = async (req, res) => {
  try {
    const { tripId } = req.params;
    const purchaserId = req.userId;

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // ✅ 1) Fetch ONLY ACTIVE Add-On Trips for this trip & purchaser
    const addonTrips = await AddOnTrip.find({
      purchaser: purchaserId,
      trip: tripId,
      activeStatus: { $ne: false }, // 👈 consider only active add-on trips
    }).select("_id addontripName");

    const formattedAddons = addonTrips.map((trip) => ({
      _id: trip._id,
      tripName: trip.addontripName,
    }));

    // ✅ 2) Fetch ONLY ACTIVE Activities whose vendor is also ACTIVE
    const rawActivities = await Activity.find({
      purchaser: purchaserId,
      trip: tripId,
      activeStatus: { $ne: false }, // 👈 only active activities
    })
      .populate("vendor", "activeStatus") // 👈 need vendor.activeStatus
      .lean();

    // ✅ filter out activities with missing/inactive vendor
    const filteredActivities = rawActivities.filter(
      (act) => act.vendor && act.vendor.activeStatus !== false
    );

    const formattedActivities = filteredActivities.map((act) => ({
      _id: act._id,
      tripName: act.activityName,
    }));

    return res.json({
      addonTrips: formattedAddons,
      activities: formattedActivities,
    });
  } catch (err) {
    console.error("Error in getTripDetails:", err.message);
    res
      .status(500)
      .json({ message: "Server error while fetching trip details." });
  }
};

const buildArticleNumber = (tourName, seq) => {
  const name = (tourName || "").replace(/\s+/g, "").toUpperCase(); // remove spaces, uppercase

  const first3 = name.substring(0, 3); // first 3 letters
  const last3 = name.slice(-3); // last 3 letters

  const num = String(seq || 1).padStart(3, "0"); // 001 format

  return `${first3}-${num}-${last3}`;
};
export const createGroupTour = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser)
      return res.status(404).json({ message: "Purchaser not found" });

    const company = purchaser.company;

    const {
      country,
      state,
      destination,
      tourName,
      category,
      pickupPoint,
      dropOffPoint,
      totalDays,
      totalNights,
      startDate,
      netCost,
      pricePerPax,
      totalPax,
      riskAmount,
      includes,
      excludes,
      days,
    } = req.body;

    if (!Array.isArray(days)) {
      return res.status(400).json({ message: "Invalid itinerary days format" });
    }

    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate)) {
      return res.status(400).json({ message: "Invalid start date" });
    }

    for (let i = 0; i < days.length; i++) {
      if (!Array.isArray(days[i].segments) || days[i].segments.length === 0) {
        return res
          .status(400)
          .json({ message: `Day ${i + 1} requires at least one segment` });
      }
    }
    const counter = await Counter.findOneAndUpdate(
      { company },
      { $inc: { TourSequence: 1 } },
      { new: true, upsert: true }
    );

    const articleNumber = buildArticleNumber(tourName, counter.TourSequence);

    const formattedDays = days.map((day, index) => {
      const calculatedDate = new Date(parsedStartDate);
      calculatedDate.setDate(parsedStartDate.getDate() + index);
      return {
        dayLabel: `Day ${index + 1}`,
        date: calculatedDate,
        segments: day.segments.map((s) => ({
          country: s.country || undefined,
          state: s.state || undefined,
          destination: s.destination || undefined,
          trip: s.trip || undefined,
          selectedAddon: s.selectedAddon || undefined,
          // CHANGED: accept array of activities
          selectedActivities: Array.isArray(s.selectedActivities)
            ? s.selectedActivities.filter(Boolean)
            : [],
        })),
      };
    });

    const newTour = new GroupTour({
      purchaser: purchaserId,
      company,
      country,
      state,
      destination,
      tourName,
      articleNumber,
      category,
      pickupPoint,
      dropOffPoint,
      totalDays,
      totalNights,
      startDate: parsedStartDate,
      netCost,
      pricePerPax,
      totalPax,
      seatsAvailable: totalPax || 0,
      seatsBooked: 0,
      riskAmount,
      includes,
      excludes,
      days: formattedDays,
    });

    await newTour.save();
    return res.status(201).json({
      message: "Group Tour created successfully",
      tourId: newTour._id,
    });
  } catch (err) {
    console.error("Group tour creation error:", err);
    return res.status(500).json({ message: "Failed to create group tour" });
  }
};

// LIST
export const getGroupTours = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const { page = 1, limit = 3, search = "" } = req.query;
    const query = {
      purchaser: purchaserId,
      tourName: { $regex: search, $options: "i" },
    };

    const totalTours = await GroupTour.countDocuments(query);
    const totalPages = Math.ceil(totalTours / limit);

    const tours = await GroupTour.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.status(200).json({ tours, totalPages });
  } catch (error) {
    console.error("Error fetching group tours:", error);
    res.status(500).json({ error: "Server error while fetching group tours." });
  }
};

const toDateOrNull = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

export const getGroupTourById = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const tourId = req.params.id;

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const tour = await GroupTour.findOne({
      _id: tourId,
      purchaser: purchaserId,
    })
      .populate("country", "name")
      .populate("state", "name")
      .populate("destination", "name")
      .populate({ path: "days.segments.country", select: "name" })
      .populate({ path: "days.segments.state", select: "name" })
      .populate({ path: "days.segments.destination", select: "name" })
      .populate({
        path: "days.segments.trip",
        select: "tripName duration price",
      })
      .populate({
        path: "days.segments.selectedAddon",
        select: "addontripName price",
      })
      .populate({
        path: "days.segments.selectedActivities",
        select: "activityName price",
      })
      .lean();

    if (!tour) return res.status(404).json({ message: "Tour not found" });

    return res.status(200).json({ tour });
  } catch (err) {
    console.error("Error fetching tour by id:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching the tour." });
  }
};

/**
 * PUT /purchaser/groupTours/:id/bo
 * Body:
 * {
 *   vehLines:      { "i-j": [ ... ] },
 *   addonVehLines: { "i-j": [ ... ] },
 *   foodLines:     { "i-j": [ ... ] },
 *   actLines:      { "i-j": [ ... ] },
 *   accLines:      { "i-j": [ ... ] }
 * }
 */
export const saveGroupTourBO = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const tourId = req.params.id;

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const tour = await GroupTour.findOne({
      _id: tourId,
      purchaser: purchaserId,
    });
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    const {
      vehLines = {},
      addonVehLines = {},
      foodLines = {},
      actLines = {},
      accLines = {},
      totalBO,
      totalItinerary,
    } = req.body || {};

    // Walk days/segments; segKey = `${i}-${j}`
    (tour.days || []).forEach((day, i) => {
      (day.segments || []).forEach((seg, j) => {
        const key = `${i}-${j}`;

        const normalize = (arr) =>
          (arr || []).map((x) => ({ ...x, date: toDateOrNull(x?.date) }));

        seg.boTripVehicles = normalize(vehLines[key]);
        seg.boAddonVehicles = normalize(addonVehLines[key]);
        seg.boFoods = normalize(foodLines[key]);
        seg.boActivities = normalize(actLines[key]);
        seg.boAccommodations = normalize(accLines[key]);
      });
    });
    /** 🔽 NEW: use totals to update tour fields */
    const safeTotalBO = Number(totalBO || 0);
    const safeTotalItinerary = Number(totalItinerary || 0);
    const totalPax = Number(tour.totalPax || 0);

    // netCost = total BO
    tour.netCost = safeTotalBO;

    // pricePerPax = ceil(totalItinerary / totalPax) (if pax > 0)
    if (totalPax > 0 && safeTotalItinerary > 0) {
      tour.pricePerPax = Math.ceil(safeTotalItinerary / totalPax);
    } else {
      tour.pricePerPax = 0; // or keep previous value if you prefer
    }

    // activate the tour
    tour.activeStatus = true;

    await tour.save();

    const fresh = await GroupTour.findById(tourId)
      .populate("country", "name")
      .populate("state", "name")
      .populate("destination", "name")
      .populate({ path: "days.segments.country", select: "name" })
      .populate({ path: "days.segments.state", select: "name" })
      .populate({ path: "days.segments.destination", select: "name" })
      .populate({
        path: "days.segments.trip",
        select: "tripName duration price",
      })
      .populate({
        path: "days.segments.selectedAddon",
        select: "addontripName price",
      })
      .populate({
        path: "days.segments.selectedActivities",
        select: "activityName price",
      })
      .lean();

    return res
      .status(200)
      .json({ message: "Booking order saved", tour: fresh });
  } catch (err) {
    console.error("saveGroupTourBO error:", err);
    return res.status(500).json({ message: "Failed to save booking order" });
  }
};
// UPDATE
export const updateGroupTour = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const tourId = req.params.id;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser)
      return res.status(404).json({ message: "Purchaser not found" });

    const {
      country,
      state,
      destination,
      tourName,
      articleNumber,
      category,
      pickupPoint,
      dropOffPoint,
      totalDays,
      totalNights,
      startDate,
      netCost,
      pricePerPax,
      totalPax,
      riskAmount,
      includes,
      excludes,
      days,
    } = req.body;

    if (!Array.isArray(days)) {
      return res.status(400).json({ message: "Invalid itinerary days format" });
    }

    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate))
      return res.status(400).json({ message: "Invalid start date" });

    for (let i = 0; i < days.length; i++) {
      if (!Array.isArray(days[i].segments) || days[i].segments.length === 0) {
        return res
          .status(400)
          .json({ message: `Day ${i + 1} requires at least one segment` });
      }
    }

    const formattedDays = days.map((day, index) => {
      const calculatedDate = new Date(parsedStartDate);
      calculatedDate.setDate(parsedStartDate.getDate() + index);
      return {
        dayLabel: `Day ${index + 1}`,
        date: calculatedDate,
        segments: day.segments.map((s) => ({
          country: s.country || undefined,
          state: s.state || undefined,
          destination: s.destination || undefined,
          trip: s.trip || undefined,
          selectedAddon: s.selectedAddon || undefined,
          // CHANGED: accept array of activities
          selectedActivities: Array.isArray(s.selectedActivities)
            ? s.selectedActivities.filter(Boolean)
            : [],
        })),
      };
    });

    const updatedTour = await GroupTour.findByIdAndUpdate(
      tourId,
      {
        country,
        state,
        destination,
        tourName,
        articleNumber,
        category,
        pickupPoint,
        dropOffPoint,
        totalDays,
        totalNights,
        startDate: parsedStartDate,
        netCost,
        pricePerPax,
        totalPax,
        riskAmount,
        includes,
        excludes,
        days: formattedDays,
      },
      { new: true }
    );

    if (!updatedTour)
      return res.status(404).json({ message: "Tour not found" });

    res.status(200).json({
      message: "Group Tour updated successfully",
      tourId: updatedTour._id,
    });
  } catch (err) {
    console.error("Group tour update error:", err);
    res.status(500).json({ message: "Failed to update group tour" });
  }
};
const normalizeStart = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
const normalizeEnd = (d) => new Date(new Date(d).setHours(23, 59, 59, 999));
const inRange = (d, from, to) =>
  d >= normalizeStart(from) && d <= normalizeEnd(to);

/**
 * GET /purchaser/tripVehicles/:tripId?date=YYYY-MM-DD
 * Returns available categories and vehicles for that trip on the given date,
 * including vehicle percentage and base BO price (from Trip.vehicles[].prices[]).
 */
// export const getTripVehiclesForDate = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const { tripId } = req.params;
//     const { date } = req.query;

//     if (!date)
//       return res
//         .status(400)
//         .json({ message: "date query (YYYY-MM-DD) is required" });
//     const dayDate = new Date(date);
//     if (isNaN(dayDate))
//       return res.status(400).json({ message: "Invalid date" });

//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     const trip = await Trip.findOne({ _id: tripId, purchaser: purchaserId })
//       .populate({
//         path: "vehicles.vehicle",
//         select: "vehicle percentage", // vehicle name + percentage (from Vehicle model)
//       })
//       .lean();

//     if (!trip) return res.status(404).json({ message: "Trip not found" });

//     // Build options grouped by category with a price that matches this date
//     const byCategory = {};
//     for (const row of trip.vehicles || []) {
//       if (!row || !row.vehicle) continue;
//        const vehDoc = row.vehicle;
//       const vendorDoc = row.vendor; // populated above

//       // ❌ skip if no vehicle or vehicle is inactive
//       if (!vehDoc || vehDoc.activeStatus === false) continue;

//       // ❌ skip if vendor missing or vendor inactive
//       if (!vendorDoc || vendorDoc.activeStatus === false) continue;

//       // Pick a price that matches the date
//       const match = (row.prices || []).find((p) =>
//         inRange(dayDate, p.validFrom, p.validTo)
//       );
//       if (!match) continue;

//       // const vehDoc = row.vehicle;
//       const entry = {
//         vehicleId: vehDoc?._id,
//         vehicleName: vehDoc?.vehicle, // Vehicle.vehicle (string)
//         percentage: Number(vehDoc?.percentage ?? 0),
//         basePrice: Number(match.price), // BO base price (per unit)
//         vendor: row.vendor || null, // optional
//       };

//       if (!byCategory[row.category]) byCategory[row.category] = [];
//       byCategory[row.category].push(entry);
//     }

//     const categories = Object.keys(byCategory);
//     return res
//       .status(200)
//       .json({ tripId, date, categories, options: byCategory });
//   } catch (err) {
//     console.error("getTripVehiclesForDate error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error while fetching trip vehicles." });
//   }
// };
export const getTripVehiclesForDate = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { tripId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    }

    const dayDate = new Date(date);
    if (isNaN(dayDate)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const trip = await Trip.findOne({ _id: tripId, purchaser: purchaserId })
      .populate({
        path: "vehicles.vehicle",
        select: "vehicle percentage activeStatus", // ✅ include activeStatus
      })
      .populate({
        path: "vehicles.vendor",
        select: "activeStatus", // ✅ populate vendor & its activeStatus
      })
      .lean();

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const byCategory = {};

    for (const row of trip.vehicles || []) {
      if (!row) continue;

      const vehDoc = row.vehicle; // populated above
      const vendorDoc = row.vendor; // populated above

      // ❌ skip if no vehicle or vehicle inactive
      if (!vehDoc || vehDoc.activeStatus === false) continue;

      // ❌ skip if no vendor or vendor inactive
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      // pick matching price slab
      const match = (row.prices || []).find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!match) continue;

      const entry = {
        vehicleId: vehDoc?._id,
        vehicleName: vehDoc?.vehicle,
        percentage: Number(vehDoc?.percentage ?? 0),
        basePrice: Number(match.price),
        vendor: vendorDoc?._id || null, // ✅ id of active vendor
      };

      if (!byCategory[row.category]) byCategory[row.category] = [];
      byCategory[row.category].push(entry);
    }

    const categories = Object.keys(byCategory);
    return res
      .status(200)
      .json({ tripId, date, categories, options: byCategory });
  } catch (err) {
    console.error("getTripVehiclesForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching trip vehicles." });
  }
};

// export const getTripFoodsForDate = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const { tripId } = req.params;
//     const { date } = req.query;

//     if (!date)
//       return res
//         .status(400)
//         .json({ message: "date query (YYYY-MM-DD) is required" });
//     const dayDate = new Date(date);
//     if (isNaN(dayDate))
//       return res.status(400).json({ message: "Invalid date" });

//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     // Find a Food doc for this trip (active) belonging to this purchaser
//     const foodDoc = await Food.findOne({
//       trip: tripId,
//       purchaser: purchaserId,
//       activeStatus: { $ne: false },
//     })
//       .populate("rows.vendor", "name")
//       .lean();

//     if (!foodDoc) {
//       return res.status(200).json({
//         tripId,
//         date,
//         categories: [],
//         typesByCategory: {},
//         options: {},
//       });
//     }

//     const byCategoryType = {}; // { [category]: { [type]: [items] } }
//     const categoriesSet = new Set();
//     const typesByCategory = {}; // { [category]: [types...] }

//     for (const row of foodDoc.rows || []) {
//       const {
//         vendor,
//         mealType,
//         mealCategory,
//         foodName,
//         description,
//         prices = [],
//       } = row;

//       // Find a price that matches this date
//       const match = prices.find((p) =>
//         inRange(dayDate, p.validFrom, p.validTo)
//       );
//       if (!match) continue;

//       const item = {
//         foodName,
//         description: description || "",
//         price: Number(match.price || 0),
//         percent: Number(match.percent || 0),
//         itineraryPrice: Number(match.itineraryPrice || 0),
//         vendor: vendor?._id || null,
//         vendorName: vendor?.name || "",
//       };

//       categoriesSet.add(mealCategory || "Uncategorized");

//       if (!byCategoryType[mealCategory]) byCategoryType[mealCategory] = {};
//       if (!byCategoryType[mealCategory][mealType])
//         byCategoryType[mealCategory][mealType] = [];
//       byCategoryType[mealCategory][mealType].push(item);
//     }

//     // Build typesByCategory lists
//     for (const cat of Object.keys(byCategoryType)) {
//       typesByCategory[cat] = Object.keys(byCategoryType[cat]);
//     }

//     return res.status(200).json({
//       tripId,
//       date,
//       categories: Array.from(categoriesSet),
//       typesByCategory,
//       options: byCategoryType, // category -> type -> [items]
//     });
//   } catch (err) {
//     console.error("getTripFoodsForDate error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error while fetching trip foods." });
//   }
// };

export const getTripFoodsForDate = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { tripId } = req.params;
    const { date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // Find a Food doc for this trip (active) belonging to this purchaser
    const foodDoc = await Food.findOne({
      trip: tripId,
      purchaser: purchaserId,
      activeStatus: { $ne: false },
    })
      .populate("rows.vendor", "name activeStatus") // ✅ include activeStatus
      .lean();

    if (!foodDoc) {
      return res.status(200).json({
        tripId,
        date,
        categories: [],
        typesByCategory: {},
        options: {},
      });
    }

    const byCategoryType = {}; // { [category]: { [type]: [items] } }
    const categoriesSet = new Set();
    const typesByCategory = {}; // { [category]: [types...] }

    for (const row of foodDoc.rows || []) {
      const {
        vendor,
        mealType,
        mealCategory,
        foodName,
        description,
        prices = [],
      } = row;

      const vendorDoc = vendor; // populated above

      // ❌ skip if no vendor or vendor inactive
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      // Find a price that matches this date
      const match = prices.find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!match) continue;

      const item = {
        foodName,
        description: description || "",
        price: Number(match.price || 0),
        percent: Number(match.percent || 0),
        itineraryPrice: Number(match.itineraryPrice || 0),
        vendor: vendorDoc?._id || null, // ✅ only active vendor id
        vendorName: vendorDoc?.name || "", // ✅ for UI
      };

      const catKey = mealCategory || "Uncategorized";

      categoriesSet.add(catKey);

      if (!byCategoryType[catKey]) byCategoryType[catKey] = {};
      if (!byCategoryType[catKey][mealType])
        byCategoryType[catKey][mealType] = [];
      byCategoryType[catKey][mealType].push(item);
    }

    // Build typesByCategory lists
    for (const cat of Object.keys(byCategoryType)) {
      typesByCategory[cat] = Object.keys(byCategoryType[cat]);
    }

    return res.status(200).json({
      tripId,
      date,
      categories: Array.from(categoriesSet),
      typesByCategory,
      options: byCategoryType, // category -> type -> [items]
    });
  } catch (err) {
    console.error("getTripFoodsForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching trip foods." });
  }
};

// export const getAddonTripVehiclesForDate = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const { addonTripId } = req.params;
//     const { date } = req.query;

//     if (!date)
//       return res
//         .status(400)
//         .json({ message: "date query (YYYY-MM-DD) is required" });
//     const dayDate = new Date(date);
//     if (isNaN(dayDate))
//       return res.status(400).json({ message: "Invalid date" });

//     const purchaser = await Purchaser.findById(purchaserId);
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     const addon = await AddOnTrip.findOne({
//       _id: addonTripId,
//       purchaser: purchaserId,
//     })
//       .populate({
//         path: "vehicles.vehicle",
//         select: "vehicle percentage", // from Vehicle model
//       })
//       .lean();

//     if (!addon)
//       return res.status(404).json({ message: "Add-on trip not found" });

//     const byCategory = {};
//     for (const row of addon.vehicles || []) {
//       if (!row || !row.vehicle) continue;

//       // choose price for the given date
//       const matched = (row.prices || []).find((p) =>
//         inRange(dayDate, p.validFrom, p.validTo)
//       );
//       if (!matched) continue;

//       const vehDoc = row.vehicle;
//       const entry = {
//         vehicleId: vehDoc?._id,
//         vehicleName: vehDoc?.vehicle,
//         percentage: Number(vehDoc?.percentage ?? 0),
//         basePrice: Number(matched.price),
//         vendor: row.vendor || null,
//       };

//       if (!byCategory[row.category]) byCategory[row.category] = [];
//       byCategory[row.category].push(entry);
//     }

//     return res.status(200).json({
//       addonTripId,
//       date,
//       categories: Object.keys(byCategory),
//       options: byCategory,
//     });
//   } catch (err) {
//     console.error("getAddonTripVehiclesForDate error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error while fetching add-on vehicles." });
//   }
// };
export const getAddonTripVehiclesForDate = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { addonTripId } = req.params;
    const { date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const addon = await AddOnTrip.findOne({
      _id: addonTripId,
      purchaser: purchaserId,
    })
      .populate({
        path: "vehicles.vehicle",
        select: "vehicle percentage activeStatus", // ✅ include activeStatus
      })
      .populate({
        path: "vehicles.vendor",
        select: "activeStatus", // ✅ populate vendor & its activeStatus
      })
      .lean();

    if (!addon)
      return res.status(404).json({ message: "Add-on trip not found" });

    const byCategory = {};
    for (const row of addon.vehicles || []) {
      if (!row) continue;

      const vehDoc = row.vehicle; // populated above
      const vendorDoc = row.vendor; // populated above

      // ❌ skip if no vehicle or vehicle inactive
      if (!vehDoc || vehDoc.activeStatus === false) continue;

      // ❌ skip if no vendor or vendor inactive
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      // choose price for the given date
      const matched = (row.prices || []).find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!matched) continue;

      const entry = {
        vehicleId: vehDoc?._id,
        vehicleName: vehDoc?.vehicle,
        percentage: Number(vehDoc?.percentage ?? 0),
        basePrice: Number(matched.price),
        vendor: vendorDoc?._id || null, // ✅ only active vendor id
      };

      if (!byCategory[row.category]) byCategory[row.category] = [];
      byCategory[row.category].push(entry);
    }

    return res.status(200).json({
      addonTripId,
      date,
      categories: Object.keys(byCategory),
      options: byCategory,
    });
  } catch (err) {
    console.error("getAddonTripVehiclesForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching add-on vehicles." });
  }
};

export const getActivitiesPricingForDate = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { ids, date } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ message: "date query (YYYY-MM-DD) is required" });
    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    if (!ids)
      return res.status(400).json({
        message: "ids query is required (comma separated activity ids)",
      });
    const idList = ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!idList.length)
      return res.status(400).json({ message: "No valid ids provided" });

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const acts = await Activity.find({
      _id: { $in: idList },
      purchaser: purchaserId,
      activeStatus: { $ne: false },
    })
      .populate("vendor", "name")
      .lean();

    const items = [];
    for (const a of acts) {
      // 👇 uses your inRange(d, from, to)
      const match = (a.prices || []).find((p) =>
        inRange(dayDate, p.validFrom, p.validTo)
      );
      if (!match) continue;

      const base = Number(match.price || 0);
      const perc = Number(match.percentage || 0);
      const itin =
        match.itineraryPrice != null && !isNaN(match.itineraryPrice)
          ? Number(match.itineraryPrice)
          : Math.round(base * (1 + perc / 100));

      items.push({
        activityId: String(a._id),
        activityName: a.activityName,
        price: base,
        percentage: perc,
        itineraryPrice: itin,
        vendorId: a.vendor?._id || null,
        vendorName: a.vendor?.name || "",
      });
    }

    return res.status(200).json({ date, items });
  } catch (err) {
    console.error("getActivitiesPricingForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching activities pricing." });
  }
};
// export const getAccommodationsPricingForDate = async (req, res) => {
//   try {
//     const purchaserId = req.userId;
//     const { destinationId, date } = req.query;

//     if (!destinationId)
//       return res.status(400).json({ message: "destinationId is required" });
//     if (!date)
//       return res.status(400).json({ message: "date (YYYY-MM-DD) is required" });

//     const dayDate = new Date(date);
//     if (isNaN(dayDate))
//       return res.status(400).json({ message: "Invalid date" });

//     const purchaser = await Purchaser.findById(purchaserId).lean();
//     if (!purchaser) {
//       return res
//         .status(404)
//         .json({ message: "Unauthorized: Purchaser not found or inactive." });
//     }

//     // Pull candidate accommodations for that destination and purchaser
//     const accs = await Accommodation.find({
//       destination: destinationId,
//       purchaserId: purchaserId, // matches your schema field name
//     })
//       .populate("vendor", "name")
//       .lean();

//     // Known "room type" numeric keys we care about
//     const ROOM_KEYS = [
//       "2BEDEP",
//       "2BEDCP",
//       "2BEDMAP",
//       "3BEDEP",
//       "3BEDCP",
//       "3BEDMAP",
//       "4BEDEP",
//       "4BEDCP",
//       "4BEDMAP",
//       "EXTRABEDEP",
//       "EXTRABEDCP",
//       "EXTRABEDMAP",
//       "FRESHUP",
//       "EARLYCHECKIN",
//       "LATECHECKOUT",
//     ];

//     const items = [];

//     for (const a of accs) {
//       const baseSection = (a.formSections || []).find((ps) =>
//         inRange(dayDate, ps?.validFrom, ps?.validTo)
//       );
//       const commSection = (a.formSectionsWithCommission || []).find((ps) =>
//         inRange(dayDate, ps?.validFrom, ps?.validTo)
//       );
//       if (!baseSection || !commSection) continue;

//       const roomTypes = [];
//       for (const key of ROOM_KEYS) {
//         const boVal = Number(baseSection[key] ?? 0);
//         const itinVal = Number(commSection[key] ?? 0);
//         if (!Number.isFinite(boVal) || boVal <= 0) continue; // only non-zero/positive
//         // push room type option
//         roomTypes.push({
//           code: key,
//           label: key, // keep code as label (you can prettify if you like)
//           bo: boVal,
//           itinerary: Number.isFinite(itinVal)
//             ? itinVal
//             : Math.round(
//                 boVal * (1 + Number(baseSection.commission || 0) / 100)
//               ),
//         });
//       }
//       if (!roomTypes.length) continue;

//       items.push({
//         accommodationId: String(a._id),
//         propertyName: a.propertyName,
//         hotelCategory: a.hotelCategory || "",
//         roomCategory: a.roomCategory || "",
//         vendorId: a.vendor?._id || null,
//         vendorName: a.vendor?.name || "",
//         commission: Number(
//           a?.formSections?.length ? baseSection.commission || 0 : 0
//         ),
//         roomTypes,
//       });
//     }

//     return res.status(200).json({
//       destinationId,
//       date,
//       properties: items,
//     });
//   } catch (err) {
//     console.error("getAccommodationsPricingForDate error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error while fetching accommodations pricing." });
//   }
// };
export const getAccommodationsPricingForDate = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { destinationId, date } = req.query;

    if (!destinationId)
      return res.status(400).json({ message: "destinationId is required" });
    if (!date)
      return res.status(400).json({ message: "date (YYYY-MM-DD) is required" });

    const dayDate = new Date(date);
    if (isNaN(dayDate))
      return res.status(400).json({ message: "Invalid date" });

    const purchaser = await Purchaser.findById(purchaserId).lean();
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // ✅ Pull only ACTIVE accommodations for that destination & purchaser
    const accs = await Accommodation.find({
      destination: destinationId,
      purchaserId: purchaserId,
      status: "Active", // 👈 only active accommodations
    })
      .populate("vendor", "name activeStatus") // 👈 also load vendor.activeStatus
      .lean();

    const ROOM_KEYS = [
      "2BEDEP",
      "2BEDCP",
      "2BEDMAP",
      "3BEDEP",
      "3BEDCP",
      "3BEDMAP",
      "4BEDEP",
      "4BEDCP",
      "4BEDMAP",
      "EXTRABEDEP",
      "EXTRABEDCP",
      "EXTRABEDMAP",
      "FRESHUP",
      "EARLYCHECKIN",
      "LATECHECKOUT",
    ];

    const items = [];

    for (const a of accs) {
      const vendorDoc = a.vendor;

      // ✅ skip if no vendor OR vendor inactive
      if (!vendorDoc || vendorDoc.activeStatus === false) continue;

      const baseSection = (a.formSections || []).find((ps) =>
        inRange(dayDate, ps?.validFrom, ps?.validTo)
      );
      const commSection = (a.formSectionsWithCommission || []).find((ps) =>
        inRange(dayDate, ps?.validFrom, ps?.validTo)
      );
      if (!baseSection || !commSection) continue;

      const roomTypes = [];
      for (const key of ROOM_KEYS) {
        const boVal = Number(baseSection[key] ?? 0);
        const itinVal = Number(commSection[key] ?? 0);
        if (!Number.isFinite(boVal) || boVal <= 0) continue;

        roomTypes.push({
          code: key,
          label: key,
          bo: boVal,
          itinerary: Number.isFinite(itinVal)
            ? itinVal
            : Math.round(
                boVal * (1 + Number(baseSection.commission || 0) / 100)
              ),
        });
      }
      if (!roomTypes.length) continue;

      items.push({
        accommodationId: String(a._id),
        propertyName: a.propertyName,
        hotelCategory: a.hotelCategory || "",
        roomCategory: a.roomCategory || "",
        vendorId: vendorDoc?._id || null, // ✅ only active vendor id
        vendorName: vendorDoc?.name || "",
        commission: Number(baseSection.commission || 0),
        roomTypes,
      });
    }

    return res.status(200).json({
      destinationId,
      date,
      properties: items,
    });
  } catch (err) {
    console.error("getAccommodationsPricingForDate error:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching accommodations pricing." });
  }
};

export const createFixedTour = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser)
      return res.status(404).json({ message: "Purchaser not found" });

    const company = purchaser.company;
    const {
      country,
      state,
      destination,
      tourName,
      category,
      pickupPoint,
      dropOffPoint,
      totalDays,
      totalNights,
      validFrom,
      validTill,
      paxPrices,
      includes,
      excludes,
      days,
    } = req.body;

    if (!Array.isArray(days)) {
      return res.status(400).json({ message: "Invalid itinerary days format" });
    }

    const fromDate = new Date(validFrom);
    const tillDate = new Date(validTill);
    if (isNaN(fromDate) || isNaN(tillDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Validate each day has segments array
    for (let i = 0; i < days.length; i++) {
      if (!Array.isArray(days[i].segments) || days[i].segments.length === 0) {
        return res
          .status(400)
          .json({ message: `Day ${i + 1} requires at least one segment` });
      }
    }

    const formattedDays = days.map((day, idx) => ({
      dayLabel: `Day ${idx + 1}`,
      segments: day.segments.map((s) => ({
        country: s.country || undefined,
        state: s.state || undefined,
        destination: s.destination || undefined,
        trip: s.trip || undefined,
        selectedAddon: s.selectedAddon || undefined,
        selectedActivities: Array.isArray(s.selectedActivities)
          ? s.selectedActivities.filter(Boolean)
          : [],
      })),
    }));
    const counter = await Counter.findOneAndUpdate(
      { company },
      { $inc: { TourSequence: 1 } },
      { new: true, upsert: true }
    );
    const articleNumber = buildArticleNumber(tourName, counter.TourSequence);

    const newTour = new FixedTour({
      purchaser: purchaserId,
      company,
      country,
      state,
      destination,
      tourName,
      articleNumber,
      category,
      pickupPoint,
      dropOffPoint,
      totalDays,
      totalNights,
      validFrom: fromDate,
      validTill: tillDate,
      paxPrices,
      includes,
      excludes,
      days: formattedDays,
    });

    await newTour.save();
    return res.status(201).json({
      message: "Fixed Tour created successfully",
      tourId: newTour._id,
    });
  } catch (err) {
    console.error("Fixed tour creation error:", err);
    return res.status(500).json({ message: "Failed to create fixed tour" });
  }
};

// LIST
export const getFixedTours = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    const { page = 1, limit = 3, search = "" } = req.query;
    const query = {
      purchaser: purchaserId,
      tourName: { $regex: search, $options: "i" },
    };

    const totalTours = await FixedTour.countDocuments(query);
    const totalPages = Math.ceil(totalTours / limit);

    const tours = await FixedTour.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.status(200).json({ tours, totalPages });
  } catch (error) {
    console.error("Error fetching fixed tours:", error);
    res.status(500).json({ error: "Server error while fetching fixed tours." });
  }
};

// UPDATE
export const updateFixedTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const purchaserId = req.userId;

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser)
      return res.status(404).json({ message: "Purchaser not found" });

    const {
      country,
      state,
      destination,
      tourName,
      articleNumber,
      category,
      pickupPoint,
      dropOffPoint,
      totalDays,
      totalNights,
      validFrom,
      validTill,
      paxPrices,
      includes,
      excludes,
      days,
    } = req.body;

    if (!Array.isArray(days)) {
      return res.status(400).json({ message: "Invalid itinerary days format" });
    }

    for (let i = 0; i < days.length; i++) {
      if (!Array.isArray(days[i].segments) || days[i].segments.length === 0) {
        return res
          .status(400)
          .json({ message: `Day ${i + 1} requires at least one segment` });
      }
    }

    const fromDate = new Date(validFrom);
    const tillDate = new Date(validTill);
    if (isNaN(fromDate) || isNaN(tillDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const formattedDays = days.map((day, idx) => ({
      dayLabel: `Day ${idx + 1}`,
      segments: day.segments.map((s) => ({
        country: s.country || undefined,
        state: s.state || undefined,
        destination: s.destination || undefined,
        trip: s.trip || undefined,
        selectedAddon: s.selectedAddon || undefined,
        selectedActivities: Array.isArray(s.selectedActivities)
          ? s.selectedActivities.filter(Boolean)
          : [],
      })),
    }));

    const updatedTour = await FixedTour.findByIdAndUpdate(
      tourId,
      {
        country,
        state,
        destination,
        tourName,
        articleNumber,
        category,
        pickupPoint,
        dropOffPoint,
        totalDays,
        totalNights,
        validFrom: fromDate,
        validTill: tillDate,
        paxPrices,
        includes,
        excludes,
        days: formattedDays,
      },
      { new: true }
    );

    if (!updatedTour)
      return res.status(404).json({ message: "Fixed tour not found" });
    return res.status(200).json({
      message: "Fixed Tour updated successfully",
      tourId: updatedTour._id,
    });
  } catch (err) {
    console.error("Error updating fixed tour:", err);
    return res.status(500).json({ message: "Failed to update fixed tour" });
  }
};
// export const getVendorsOfFoodsByLocation = async (req, res) => {
//   const purchaserId = req.userId;
//   const { countryId, stateId, destinationId } = req.params;
//   const purchaser = await Purchaser.findById(purchaserId);
//   if (!purchaser) {
//     return res
//       .status(404)
//       .json({ message: "Unauthorized: Purchaser not found or inactive." });
//   }

//   try {
//     const vendors = await Vendor.find({
//       purchaser: purchaserId,
//       country: countryId,
//       state: stateId,
//       destination: destinationId,
//       services: "Food",
//     }).select("_id name");

//     res.status(200).json(vendors);
//   } catch (error) {
//     console.error("Error fetching vendors:", error);
//     res.status(500).json({ message: "Failed to fetch vendors" });
//   }
// };
export const getVendorsOfFoodsByLocation = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { countryId, stateId, destinationId } = req.params;
    let { currentVendorId } = req.query; // 👈 NEW

    const purchaser = await Purchaser.findById(purchaserId).lean();
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }

    // normalize query param junk
    if (
      currentVendorId === "undefined" ||
      currentVendorId === "null" ||
      currentVendorId === ""
    ) {
      currentVendorId = undefined;
    }

    const forcedVendorIds = currentVendorId
      ? currentVendorId.split(",").filter(Boolean)
      : [];

    // 1) ACTIVE vendors for Food
    let vendors = await Vendor.find({
      purchaser: purchaserId,
      country: countryId,
      state: stateId,
      destination: destinationId,
      services: "Food",
      activeStatus: true,
    }).select("_id name activeStatus"); // 👈 include activeStatus

    // 2) If editing, ensure current vendor(s) are included even if inactive
    if (forcedVendorIds.length > 0) {
      const existingIds = new Set(vendors.map((v) => v._id.toString()));

      const extraVendors = await Vendor.find({
        _id: { $in: forcedVendorIds },
        purchaser: purchaserId,
        country: countryId,
        state: stateId,
        destination: destinationId,
        services: "Food",
        // no activeStatus filter → can be inactive
      }).select("_id name activeStatus");

      for (const v of extraVendors) {
        if (!existingIds.has(v._id.toString())) {
          vendors.push(v);
        }
      }
    }

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

export const createFood = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const { country, state, destination, trip, rows } = req.body;

    if (!country || !state || !destination || !trip || !rows || !rows.length) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }

    const company = purchaser.company;
    const existingFood = await Food.findOne({ purchaser: purchaserId, trip });
    if (existingFood) {
      return res.status(400).json({
        success: false,
        message: "You have already added food  for this trip.",
      });
    }

    const newFood = new Food({
      purchaser: purchaserId,
      company,
      country,
      state,
      destination,
      trip,
      rows,
    });

    await newFood.save();
    res.status(201).json({
      success: true,
      message: "Food created successfully",
      data: newFood,
    });
  } catch (error) {
    console.error("Create Food Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const getFoodTrips = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { search = "", page = 1, limit = 3 } = req.query;

    const skip = (page - 1) * limit;

    // Match purchaser first
    const matchStage = { purchaser: purchaserId };

    // If search keyword is given, use trip name filtering
    if (search.trim()) {
      // Get matching trip IDs based on search
      const matchingTrips = await Trip.find({
        tripName: { $regex: search, $options: "i" },
      }).select("_id");

      matchStage.trip = { $in: matchingTrips.map((trip) => trip._id) };
    }

    // Count total documents matching the condition
    const totalDocs = await Food.countDocuments(matchStage);
    const totalPages = Math.ceil(totalDocs / limit);

    // Fetch paginated food documents
    const foodDocs = await Food.find(matchStage)
      .populate("trip", "tripName")
      .populate("country", "name")
      .populate("state", "name")
      .populate("destination", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Transform into desired format
    const trips = foodDocs.map((food) => ({
      _id: food._id,
      tripName: food.trip?.tripName || "N/A",
      country: food.country?.name || "N/A",
      state: food.state?.name || "N/A",
      destination: food.destination?.name || "N/A",
      activeStatus: !!food.activeStatus,
    }));

    res.status(200).json({ trips, totalPages });
  } catch (err) {
    console.error("Error fetching food trips:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFoodById = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const foodId = req.params.id;

    const food = await Food.findById(foodId)
      .populate("country", "name")
      .populate("state", "name")
      .populate("destination", "name")
      .populate("trip", "tripName")
      .populate("rows.vendor", "name"); // <- populates vendor name inside rows

    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }

    res.status(200).json(food);
  } catch (error) {
    console.error("Error fetching food:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateFood = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const foodId = req.params.id;
    const { country, state, destination, trip, rows } = req.body;

    if (!country || !state || !destination || !trip || !rows || !rows.length) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ success: false, message: "Purchaser not found" });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      foodId,
      {
        country,
        state,
        destination,
        trip,
        rows,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      data: updatedFood,
    });
  } catch (error) {
    console.error("Update Food Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const updateFoodStatus = async (req, res) => {
  try {
    const purchaserId = req.userId;
    const purchaser = await Purchaser.findById(purchaserId);
    if (!purchaser) {
      return res
        .status(404)
        .json({ message: "Unauthorized: Purchaser not found or inactive." });
    }
    const { id } = req.params;
    const { activeStatus } = req.body;

    const updated = await Food.findByIdAndUpdate(
      id,
      { activeStatus },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    console.error("Status update failed", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
