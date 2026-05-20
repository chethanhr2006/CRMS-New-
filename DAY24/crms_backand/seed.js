require('dotenv').config();
const mongoose  = require('mongoose');
const Station   = require('./models/Station');
const Officer   = require('./models/Officer');
const Criminal  = require('./models/Criminal');
const Victim    = require('./models/Victim');
const CrimeType = require('./models/CrimeType');
const FIR       = require('./models/FIR');
const Case      = require('./models/Case');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Station.deleteMany(), Officer.deleteMany(), Criminal.deleteMany(),
    Victim.deleteMany(), CrimeType.deleteMany(), FIR.deleteMany(), Case.deleteMany()
  ]);
  console.log('🗑️  Cleared existing data');

  // Stations
  const stations = await Station.insertMany([
    { name: 'Koramangala Police Station', location: 'Koramangala, Bangalore', district: 'Bangalore Urban', phone: '080-25500100', inCharge: 'DCP Rajesh Kumar', established: 1985 },
    { name: 'MG Road Police Station',  location: 'MG Road, Bangalore',  district: 'Bangalore Urban', phone: '080-28411100', inCharge: 'DCP Suresh Nair',   established: 1992 },
  ]);
  console.log('🏢 Stations seeded');

  // Officers

  const officers = await Officer.insertMany([
  {
    name: "Rajesh Kumar",
    badge: "BG101",
    rank: "Inspector",
    station_id: stations[0]._id,
    contact:9988776655,
    station_name:"MG Road Station",
  },
   {
    name: "Priya Nair",
    badge: "DG102",
    rank: "Sub Inspector",
    station_id: stations[1]._id,
    contact:9876543210,
    station_name:"Koramangala Station",
  },
]);

console.log("👮 Officers seeded");
 

  // Criminals
 const criminals = await Criminal.insertMany([
  {
    name: 'Raju Bhai',
    alias: 'Raju Don',
    dob: new Date('1985-04-12'),
    gender: 'Male',
    address: 'Shivajinagar, Bangalore',
    phone: '9811001100',
    crimeHistory: ['Robbery', 'Assault'],
    status: 'Active',
    dangerLevel: 'High'
  },
  {
    name: 'Sonu Sharma',
    alias: 'Sonu Bullet',
    dob: new Date('1990-08-23'),
    gender: 'Male',
    address: 'Unknown',
    crimeHistory: ['Murder', 'Robbery'],
    status: 'Wanted',
    dangerLevel: 'Extreme'
  },
  {
    name: 'Kavitha',
    dob: new Date('1995-01-10'),
    gender: 'Female',
    address: 'Indiranagar, Bangalore',
    phone: '9922334455',
    crimeHistory: ['Fraud', 'Cheating'],
    status: 'Under Trial',
    dangerLevel: 'Medium'
  },
]);
  console.log('🦹 Criminals seeded');

  // Victims
  const victims = await Victim.insertMany([
    { name: 'Arjun Mehta',   dob: new Date('1988-06-15'), gender: 'Male',   address: 'HSR Layout, Bangalore', phone: '9876543210', occupation: 'Software Engineer', statement: 'Was robbed at ATM on MG Road at midnight.' },
    { name: 'Deepa Shetty',  dob: new Date('1993-11-22'), gender: 'Female', address: 'Koramangala, Bangalore',phone: '9765432109', occupation: 'Teacher',           statement: 'Cheated online by unknown person for Rs 50,000.' },
    { name: 'Ramesh Yadav',  dob: new Date('1975-03-30'), gender: 'Male',   address: 'Whitefield, Bangalore', phone: '9654321098', occupation: 'Businessman',       statement: 'Shop was burgled during night.' },
  ]);
  console.log('🙋 Victims seeded');

  // Crime Types
const crimeTypes = await CrimeType.insertMany([
  {
    name: "Robbery",
    description: "Stealing money or valuables",
    severity: "Serious",
    punishment: "5 years imprisonment",
  },
  {
    name: "Fraud",
    description: "Financial cheating",
    severity: "Medium",
    punishment: "3 years imprisonment",
  },
  {
    name: "Murder",
    description: "Intentional killing",
    severity: "Extreme",
    punishment: "Life imprisonment",
  },
]);
  console.log('📋 Crime types seeded');

  // FIRs
const firs = await FIR.insertMany([
  {
    date: "2024-11-10",
    crime_id: crimeTypes[0]._id,
    description:
      "Complainant was robbed at gunpoint while withdrawing cash from ATM.",
    officer_id: officers[0]._id,
    station_id: stations[0]._id,
    victim_id: victims[0]._id,
    status: "Under Investigation",
  },

  {
    date: "2024-11-15",
    crime_id: crimeTypes[1]._id,
    description:
      "Victim was cheated via fake online investment scheme.",
    officer_id: officers[1]._id,
    station_id: stations[1]._id,
    victim_id: victims[1]._id,
    status: "Registered",
  },

  {
    date: "2024-11-20",
    crime_id: crimeTypes[0]._id,
    description:
      "Shop burglary during night. Cash and electronics stolen.",
    officer_id: officers[0]._id,
    station_id: stations[0]._id,
    victim_id: victims[2]._id,
    status: "Chargesheet Filed",
  },
]);

console.log("📄 FIRs seeded");

  // Cases
await Case.insertMany([
  {
    caseNumber: "CC/2024/BLR/001",
    fir_id: firs[0]._id,
    criminal_id: criminals[0]._id,
    court: "Chief Metropolitan Magistrate Court, Bangalore",
    judge: "Hon. Justice P.K. Iyer",
    nextHearingDate: new Date("2025-02-15"),
    status: "Under Trial",
    remarks: "Bail rejected. Accused in judicial custody.",
  },

  {
    caseNumber: "CC/2024/BLR/002",
    fir_id: firs[1]._id,
    criminal_id: criminals[2]._id,
    court: "Civil & Sessions Court, Bangalore",
    judge: "Hon. Justice S. Menon",
    nextHearingDate: new Date("2025-03-01"),
    status: "Open",
    remarks: "Investigation ongoing.",
  },
]);

console.log("⚖️ Cases seeded");


  console.log('\n✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log("Login Details:");
  console.log('  Username: sharma  | Password: sharma123  | Role: Inspector');
  console.log('  Username: verma   | Password: verma123   | Role: Sub-Inspector');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
