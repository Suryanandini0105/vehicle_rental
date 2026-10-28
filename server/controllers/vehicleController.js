const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

/**
 * @desc    Get all vehicles with optional filters, search, sorting & date-availability check
 * @route   GET /api/vehicles
 * @access  Public
 */
const getVehicles = async (req, res, next) => {
  try {
    const {
      search,
      category,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sort,
      pickupDate,
      returnDate,
      includeUnavailable,
    } = req.query;

    const query = { isDeleted: false };

    // Unless explicitly requested by admin, only show Available vehicles
    if (includeUnavailable !== 'true') {
      query.status = 'Available';
    }

    // Text search by name or brand
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { brand: searchRegex }];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Fuel type filter
    if (fuelType && fuelType !== 'All') {
      query.fuelType = fuelType;
    }

    // Transmission filter
    if (transmission && transmission !== 'All') {
      query.transmission = transmission;
    }

    // Price range filters
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    // Date-based availability filter:
    // If pickupDate & returnDate are specified, exclude vehicles that have active bookings during that window
    if (pickupDate && returnDate) {
      const pDate = new Date(pickupDate);
      const rDate = new Date(returnDate);

      if (!isNaN(pDate.getTime()) && !isNaN(rDate.getTime()) && rDate > pDate) {
        const conflictingBookings = await Booking.find({
          status: { $in: ['Pending', 'Confirmed'] },
          pickupDate: { $lt: rDate },
          returnDate: { $gt: pDate },
        }).select('vehicle');

        const conflictingVehicleIds = conflictingBookings.map((b) => b.vehicle);
        if (conflictingVehicleIds.length > 0) {
          query._id = { $nin: conflictingVehicleIds };
        }
      }
    }

    // Sorting logic
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortOption = { pricePerDay: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { pricePerDay: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { name: 1 };
    }

    const vehicles = await Vehicle.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vehicle details by ID
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new vehicle
 * @route   POST /api/vehicles
 * @access  Private/Admin
 */
const createVehicle = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      image,
      description,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      registrationNumber,
      status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !brand ||
      !category ||
      !image ||
      !description ||
      !pricePerDay ||
      !fuelType ||
      !transmission ||
      !seats ||
      !registrationNumber
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required vehicle details.',
      });
    }

    const vehicle = await Vehicle.create({
      name: name.trim(),
      brand: brand.trim(),
      category,
      image: image.trim(),
      description: description.trim(),
      pricePerDay: Number(pricePerDay),
      fuelType,
      transmission,
      seats: Number(seats),
      registrationNumber: registrationNumber.toUpperCase().trim(),
      status: status || 'Available',
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully!',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vehicle details
 * @route   PUT /api/vehicles/:id
 * @access  Private/Admin
 */
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    const allowedFields = [
      'name',
      'brand',
      'category',
      'image',
      'description',
      'pricePerDay',
      'fuelType',
      'transmission',
      'seats',
      'registrationNumber',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'pricePerDay' || field === 'seats') {
          vehicle[field] = Number(req.body[field]);
        } else if (field === 'registrationNumber') {
          vehicle[field] = req.body[field].toUpperCase().trim();
        } else if (typeof req.body[field] === 'string') {
          vehicle[field] = req.body[field].trim();
        } else {
          vehicle[field] = req.body[field];
        }
      }
    });

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully!',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete vehicle (Safe deletion: prevents corrupting past/active bookings)
 * @route   DELETE /api/vehicles/:id
 * @access  Private/Admin
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle || vehicle.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    // Check for active or upcoming bookings
    const activeBookings = await Booking.find({
      vehicle: vehicle._id,
      status: { $in: ['Pending', 'Confirmed'] },
      returnDate: { $gte: new Date() },
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle: It has ${activeBookings.length} active or upcoming reservation(s). Mark status as 'Maintenance' or cancel active bookings first.`,
      });
    }

    // Soft delete so past completed/cancelled bookings remain valid
    vehicle.isDeleted = true;
    vehicle.status = 'Maintenance';
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle removed from fleet successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
