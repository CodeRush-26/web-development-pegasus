import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Invite from '../models/Invite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from the server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding');

    const hashedPassword = await bcrypt.hash('Captain@1234', 10);
    const adminHashedPassword = await bcrypt.hash('Admin@1234', 10);

    const captains = [
      {
        name: 'Capt. James Harrow',
        email: 'captain.aurora@fleetcmd.local',
        password: hashedPassword,
        role: 'captain',
        assignedShipId: 'MV-1',
        isVerified: true
      },
      {
        name: 'Capt. Sara Vance',
        email: 'captain.borealis@fleetcmd.local',
        password: hashedPassword,
        role: 'captain',
        assignedShipId: 'MV-2',
        isVerified: true
      },
      {
        name: 'Capt. Omar Khalid',
        email: 'captain.cygnus@fleetcmd.local',
        password: hashedPassword,
        role: 'captain',
        assignedShipId: 'MV-3',
        isVerified: true
      }
    ];

    const admin = {
      name: 'Fleet Admiral',
      email: 'admin@fleetcommand.com', // use this instead of .local to match the user's previous attempt
      password: adminHashedPassword,
      role: 'admin',
      isVerified: true
    };

    // Seed Admin
    const existingAdmin = await User.findOne({ email: admin.email });
    if (!existingAdmin) {
      const adminUser = await User.create(admin);
      await Invite.create({
        email: admin.email,
        role: 'admin',
        status: 'accepted'
      });
      console.log('Admin account created');
    } else {
      console.log('Admin account already exists, making sure invite exists too...');
      const adminInvite = await Invite.findOne({ email: admin.email });
      if (!adminInvite) {
        await Invite.create({
          email: admin.email,
          role: 'admin',
          status: 'accepted'
        });
        console.log('Admin invite created');
      }
    }

    // Seed Captains
    for (const captain of captains) {
      const existingCaptain = await User.findOne({ email: captain.email });
      if (!existingCaptain) {
        await User.create(captain);
        await Invite.create({
          email: captain.email,
          role: captain.role,
          assignedShipId: captain.assignedShipId,
          status: 'accepted'
        });
        console.log(`Captain account created for ${captain.name}`);
      } else {
        console.log(`Captain account ${captain.name} already exists, making sure invite exists...`);
        const capInvite = await Invite.findOne({ email: captain.email });
        if (!capInvite) {
          await Invite.create({
            email: captain.email,
            role: captain.role,
            assignedShipId: captain.assignedShipId,
            status: 'accepted'
          });
          console.log(`Captain invite created for ${captain.name}`);
        }
      }
    }

    console.log('Seeding completed successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
