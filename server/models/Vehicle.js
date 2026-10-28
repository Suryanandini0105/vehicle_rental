const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle model name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Vehicle category is required'],
      enum: {
        values: ['Hatchback', 'Sedan', 'SUV', 'Electric', 'Luxury'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    image: {
      type: String,
      required: [true, 'Vehicle image URL is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Vehicle description is required'],
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [100, 'Price per day must be at least ₹100'],
      index: true,
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
        message: '{VALUE} is not a supported fuel type',
      },
      index: true,
    },
    transmission: {
      type: String,
      required: [true, 'Transmission type is required'],
      enum: {
        values: ['Manual', 'Automatic'],
        message: '{VALUE} is not a valid transmission type',
      },
      index: true,
    },
    seats: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [2, 'Minimum seating capacity is 2'],
      max: [12, 'Maximum seating capacity is 12'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Maintenance', 'Rented'],
      default: 'Available',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted Indian Rupee price
vehicleSchema.virtual('formattedPrice').get(function () {
  return `₹${this.pricePerDay.toLocaleString('en-IN')}`;
});

vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
