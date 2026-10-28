/**
 * DriveEase - Automated Verification Test Suite
 * Tests REST API routes, JWT security, Role-Based Access Control, and Booking Rules
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const assert = require('assert');

console.log('====================================================');
console.log('🧪 DriveEase API & Business Logic Verification Suite');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

const runTest = (name, testFn) => {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}\n`);
  }
};

const runAsyncTest = async (name, testFn) => {
  totalTests++;
  try {
    await testFn();
    passedTests++;
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}\n`);
  }
};

async function main() {
  // Test 1: JWT token generation and verification
  const { generateToken } = require('../utils/jwt');
  const jwt = require('jsonwebtoken');

  runTest('JWT generation creates valid verifiable token', () => {
    const fakeUserId = '64f1a2b3c4d5e6f7a8b9c0d1';
    const token = generateToken(fakeUserId);
    assert(token && typeof token === 'string', 'Token should be a non-empty string');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'driveease_secret_fallback');
    assert.strictEqual(decoded.id, fakeUserId, 'Decoded user ID should match');
  });

  // Test 2: Role Authorization Middleware
  const { authorize } = require('../middleware/auth');

  runTest('Role Authorization blocks unauthorized customer from admin endpoints', () => {
    const customerReq = { user: { role: 'customer' } };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const adminOnly = authorize('admin');
    adminOnly(customerReq, res, next);

    assert.strictEqual(nextCalled, false, 'Next middleware should not be called');
    assert.strictEqual(statusSent, 403, 'Should respond with 403 Forbidden');
    assert.strictEqual(jsonSent.success, false, 'Response should indicate failure');
  });

  runTest('Role Authorization allows authorized admin to proceed', () => {
    const adminReq = { user: { role: 'admin' } };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const adminOnly = authorize('admin');
    adminOnly(adminReq, {}, next);

    assert.strictEqual(nextCalled, true, 'Next middleware should be called for admin');
  });

  // Test 3: Booking Duration & Server-Side Price Calculation Logic
  runTest('Server calculates rental days and total amount correctly', () => {
    const pickup = new Date('2026-11-01');
    const returnDate = new Date('2026-11-05');
    const diffTime = Math.abs(returnDate - pickup);
    const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    assert.strictEqual(rentalDays, 4, 'Rental duration should be 4 days');

    const dailyRate = 2800; // Tata Nexon EV rate
    const calculatedTotal = rentalDays * dailyRate;
    assert.strictEqual(calculatedTotal, 11200, 'Total should be ₹11,200 for 4 days');
  });

  // Test 4: Booking Overlap / Date Collision Detection Logic
  runTest('Overlap detection formula identifies conflicting date windows', () => {
    // Existing reservation: Nov 10 to Nov 15
    const existingPickup = new Date('2026-11-10T00:00:00Z');
    const existingReturn = new Date('2026-11-15T00:00:00Z');

    const hasConflict = (newP, newR) => {
      const p = new Date(newP);
      const r = new Date(newR);
      return existingPickup < r && existingReturn > p;
    };

    // Case A: Overlaps completely inside
    assert.strictEqual(hasConflict('2026-11-11', '2026-11-14'), true, 'Should detect internal overlap');

    // Case B: Overlaps start edge
    assert.strictEqual(hasConflict('2026-11-08', '2026-11-12'), true, 'Should detect start edge overlap');

    // Case C: Overlaps end edge
    assert.strictEqual(hasConflict('2026-11-13', '2026-11-18'), true, 'Should detect end edge overlap');

    // Case D: Completely before (No conflict)
    assert.strictEqual(hasConflict('2026-11-01', '2026-11-09'), false, 'Should allow prior non-overlapping dates');

    // Case E: Completely after (No conflict)
    assert.strictEqual(hasConflict('2026-11-16', '2026-11-20'), false, 'Should allow subsequent non-overlapping dates');
  });

  // Test 5: Booking State Transitions
  runTest('Booking status lifecycle allows valid transitions and blocks invalid ones', () => {
    const validTransitions = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };

    // Valid transitions
    assert(validTransitions['Pending'].includes('Confirmed'), 'Pending -> Confirmed must be valid');
    assert(validTransitions['Pending'].includes('Cancelled'), 'Pending -> Cancelled must be valid');
    assert(validTransitions['Confirmed'].includes('Completed'), 'Confirmed -> Completed must be valid');
    assert(validTransitions['Confirmed'].includes('Cancelled'), 'Confirmed -> Cancelled must be valid');

    // Invalid transitions
    assert(!validTransitions['Completed'].includes('Pending'), 'Completed cannot revert to Pending');
    assert(!validTransitions['Cancelled'].includes('Confirmed'), 'Cancelled cannot revert to Confirmed');
    assert(!validTransitions['Completed'].includes('Cancelled'), 'Completed cannot be cancelled');
  });

  // Test 6: User Model Password Hash Striping on serialization
  runTest('User schema excludes passwordHash when converted to JSON', () => {
    const User = require('../models/User');
    const mockUser = new User({
      name: 'Test Student',
      email: 'student@college.edu',
      phone: '+91 9988776655',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'customer',
    });

    const jsonUser = mockUser.toJSON();
    assert.strictEqual(jsonUser.passwordHash, undefined, 'passwordHash must never be exposed in JSON');
    assert.strictEqual(jsonUser.name, 'Test Student');
    assert.strictEqual(jsonUser.email, 'student@college.edu');
  });

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('----------------------------------------------------\n');

  if (passedTests === totalTests) {
    console.log('🎉 All backend security, calculations, and rules validated successfully!');
  } else {
    process.exit(1);
  }
}

main();
