import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = mongoose.connection.db.collection('users');
  const Invite = mongoose.connection.db.collection('invites');

  const updates = [
    { email: 'nabdullah482@gmail.com', role: 'admin', assignedShipId: null },
    { email: 'abdu@gmail.com', role: 'captain', assignedShipId: 'MV-1' },
    { email: 'abdullahniaziuni@gmail.com', role: 'captain', assignedShipId: 'MV-2' }
  ];

  for (const u of updates) {
    // 1. Ensure invite is exactly right
    await Invite.updateOne(
      { email: u.email },
      { $set: { email: u.email, role: u.role, assignedShipId: u.assignedShipId, status: 'accepted' } },
      { upsert: true }
    );
    // 2. Ensure user is exactly right (if they exist)
    await User.updateOne(
      { email: u.email },
      { $set: { role: u.role, assignedShipId: u.assignedShipId } }
    );
    console.log('Updated mapping for:', u.email, '->', u.role, u.assignedShipId);
  }
  
  console.log('Done mapping roles.');
  process.exit(0);
});
