require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

const seedVehicles = [
  {
    name: 'Nexon EV Long Range',
    brand: 'Tata',
    category: 'Electric',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    description: 'India’s most popular electric SUV offering 465 km ARAI range, silent whisper-quiet cabin, wireless Apple CarPlay, ventilated front seats, and 5-star safety rating.',
    pricePerDay: 2800,
    fuelType: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    registrationNumber: 'MH02EV4590',
    status: 'Available',
  },
  {
    name: 'Creta SX(O) Turbo',
    brand: 'Hyundai',
    category: 'SUV',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    description: 'Premier compact SUV with panoramic sunroof, Bose sound system, advanced driver assistance (ADAS), and smooth 7-speed DCT transmission for effortless highway cruising.',
    pricePerDay: 2600,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 5,
    registrationNumber: 'KA03NB8211',
    status: 'Available',
  },
  {
    name: 'City ZX e:HEV',
    brand: 'Honda',
    category: 'Sedan',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    description: 'Executive sedan known for unparalleled rear seat comfort, plush leatherette upholstery, exceptional hybrid fuel efficiency of 27 km/l, and refined Japanese engineering.',
    pricePerDay: 2400,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seats: 5,
    registrationNumber: 'DL01CB3329',
    status: 'Available',
  },
  {
    name: 'Swift ZXi Plus',
    brand: 'Maruti Suzuki',
    category: 'Hatchback',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
    description: 'Agile city hatchback delivering unmatched agility, peppy 1.2L DualJet engine, tight turning radius, touch infotainment, and best-in-class fuel economy for urban travel.',
    pricePerDay: 1400,
    fuelType: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    registrationNumber: 'TS07EZ9012',
    status: 'Available',
  },
  {
    name: 'XUV700 AX7 Luxury Pack',
    brand: 'Mahindra',
    category: 'SUV',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    description: 'Flagship 7-seater SUV with dual 10.25-inch high-resolution screens, Sony 3D spatial audio, Level 2 ADAS, panoramic skyroof, and robust mStallion turbocharged powertrain.',
    pricePerDay: 3600,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    registrationNumber: 'MH12PQ7788',
    status: 'Available',
  },
  {
    name: 'Fortuner Legender 4x4',
    brand: 'Toyota',
    category: 'Luxury',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    description: 'The undisputed king of all-terrain luxury SUVs. Features aggressive bi-tone styling, 500 Nm torque, true 4WD capabilities, rear differential lock, and legendary bulletproof reliability.',
    pricePerDay: 6500,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    registrationNumber: 'HR26BK5001',
    status: 'Available',
  },
  {
    name: 'ZS EV Exclusive Pro',
    brand: 'MG',
    category: 'Electric',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    description: 'Full-electric smart SUV with 50.3 kWh prismatic battery, dual-pane panoramic skyroof, 360-degree high-definition camera, i-SMART connected car tech, and fast DC charging.',
    pricePerDay: 2900,
    fuelType: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    registrationNumber: 'KA04EV1234',
    status: 'Available',
  },
  {
    name: 'i20 Asta (O) Turbo',
    brand: 'Hyundai',
    category: 'Hatchback',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    description: 'Premium European-styled hatchback with 10.25-inch touchscreen navigation, wireless phone charging, air purifier with AQI display, and responsive turbo power delivery.',
    pricePerDay: 1600,
    fuelType: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    registrationNumber: 'TN09AP4420',
    status: 'Available',
  },
  {
    name: '3 Series Gran Limousine',
    brand: 'BMW',
    category: 'Luxury',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    description: 'The benchmark German executive luxury sedan with extended wheelbase for lavish rear legroom, BMW Curved Display, Harman Kardon surround audio, and 258 hp TwinPower Turbo.',
    pricePerDay: 8500,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    registrationNumber: 'DL03XY9999',
    status: 'Available',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in server/.env');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB successfully.');

    // 1. Seed or update Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@driveease.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@DriveEase2026';
    const adminName = process.env.ADMIN_NAME || 'DriveEase Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '+91 9876543210';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        passwordHash: adminPassword,
        role: 'admin',
      });
      console.log(`👤 Created Administrator account: ${adminEmail}`);
    } else {
      admin.role = 'admin';
      admin.passwordHash = adminPassword;
      await admin.save();
      console.log(`👤 Updated Administrator account: ${adminEmail}`);
    }

    // 2. Seed Demo Customer
    const demoEmail = 'rahul.sharma@example.com';
    let demoCustomer = await User.findOne({ email: demoEmail });
    if (!demoCustomer) {
      demoCustomer = await User.create({
        name: 'Rahul Sharma',
        email: demoEmail,
        phone: '+91 9811223344',
        passwordHash: 'Customer@123',
        role: 'customer',
      });
      console.log(`👤 Created Demo Customer: ${demoEmail}`);
    }

    // 3. Clear and seed Vehicles
    await Vehicle.deleteMany({});
    const insertedVehicles = await Vehicle.insertMany(seedVehicles);
    console.log(`🚗 Seeded ${insertedVehicles.length} vehicles across Hatchback, Sedan, SUV, Electric, and Luxury.`);

    // 4. Clear and seed sample bookings for realistic dashboard metrics
    await Booking.deleteMany({});

    // Sample Booking 1: Confirmed past booking (Completed)
    const pickup1 = new Date();
    pickup1.setDate(pickup1.getDate() - 10);
    const return1 = new Date();
    return1.setDate(return1.getDate() - 7);
    const days1 = 3;

    await Booking.create({
      bookingReference: 'DE-2026-X8K1A',
      user: demoCustomer._id,
      vehicle: insertedVehicles[0]._id, // Nexon EV
      pickupDate: pickup1,
      returnDate: return1,
      rentalDays: days1,
      pricePerDayAtBooking: insertedVehicles[0].pricePerDay,
      totalAmount: days1 * insertedVehicles[0].pricePerDay,
      status: 'Completed',
      notes: 'Weekend trip to Lonavala',
    });

    // Sample Booking 2: Active Confirmed booking in upcoming week
    const pickup2 = new Date();
    pickup2.setDate(pickup2.getDate() + 5);
    const return2 = new Date();
    return2.setDate(return2.getDate() + 9);
    const days2 = 4;

    await Booking.create({
      bookingReference: 'DE-2026-M4N9Q',
      user: demoCustomer._id,
      vehicle: insertedVehicles[1]._id, // Creta
      pickupDate: pickup2,
      returnDate: return2,
      rentalDays: days2,
      pricePerDayAtBooking: insertedVehicles[1].pricePerDay,
      totalAmount: days2 * insertedVehicles[1].pricePerDay,
      status: 'Confirmed',
      notes: 'Family vacation to Mysore',
    });

    // Sample Booking 3: Pending reservation awaiting admin approval
    const pickup3 = new Date();
    pickup3.setDate(pickup3.getDate() + 12);
    const return3 = new Date();
    return3.setDate(return3.getDate() + 15);
    const days3 = 3;

    await Booking.create({
      bookingReference: 'DE-2026-P2R7Z',
      user: demoCustomer._id,
      vehicle: insertedVehicles[2]._id, // Honda City
      pickupDate: pickup3,
      returnDate: return3,
      rentalDays: days3,
      pricePerDayAtBooking: insertedVehicles[2].pricePerDay,
      totalAmount: days3 * insertedVehicles[2].pricePerDay,
      status: 'Pending',
      notes: 'Client meetings in Delhi NCR',
    });

    console.log('📋 Seeded 3 sample bookings (Completed, Confirmed, Pending) for live stats.');
    console.log('\n🎉 [DriveEase Database Seeding Complete!]');
    console.log('--------------------------------------------------');
    console.log(`Admin Email:     ${adminEmail}`);
    console.log(`Admin Password:  ${adminPassword}`);
    console.log(`Customer Email:  ${demoEmail}`);
    console.log(`Customer Pass:   Customer@123`);
    console.log('--------------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
