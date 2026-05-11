import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User';
import Community from '../models/Community';
import Post from '../models/Post';
import Event from '../models/Event';
import Notification from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lokconnect';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Community.deleteMany({}),
      Post.deleteMany({}), Event.deleteMany({}), Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const password = await bcrypt.hash('password123', 12);
    const users = await User.create([
      { name: 'Admin User', username: 'admin', email: 'admin@lokconnect.com', password, role: 'platformAdmin', city: 'Mumbai', hometown: 'Varanasi', bio: 'Platform administrator', badges: ['Early Adopter', 'Community Builder'], contributionPoints: 500, interests: ['technology', 'community'] },
      { name: 'Priya Sharma', username: 'priya_sharma', email: 'priya@example.com', password, city: 'Delhi', hometown: 'Jaipur', bio: 'Community enthusiast & event organizer', badges: ['Early Adopter', 'Event Organizer'], contributionPoints: 250, interests: ['culture', 'events'] },
      { name: 'Rahul Verma', username: 'rahul_verma', email: 'rahul@example.com', password, city: 'Bangalore', hometown: 'Lucknow', bio: 'Software developer connecting with hometown', badges: ['Early Adopter'], contributionPoints: 100, interests: ['technology', 'sports'] },
      { name: 'Anita Patel', username: 'anita_patel', email: 'anita@example.com', password, city: 'Mumbai', hometown: 'Ahmedabad', bio: 'Teacher and culture preservationist', badges: ['Early Adopter', 'Active Member'], contributionPoints: 180, interests: ['education', 'culture'] },
      { name: 'Vikram Singh', username: 'vikram_singh', email: 'vikram@example.com', password, city: 'Hyderabad', hometown: 'Udaipur', bio: 'Entrepreneur building local connections', badges: ['Early Adopter'], contributionPoints: 75, interests: ['business', 'networking'] },
    ]);
    console.log(`Created ${users.length} users`);

    // Create communities
    const communities = await Community.create([
      {
        name: 'Mumbai Connect', slug: 'mumbai-connect', description: 'A vibrant community for Mumbai residents and those who love the city of dreams. Share local events, food spots, and connect with fellow Mumbaikars!',
        city: 'Mumbai', state: 'Maharashtra', category: 'city', privacy: 'public',
        tags: ['mumbai', 'maharashtra', 'city-life'], rules: ['Be respectful', 'No spam', 'Keep content relevant to Mumbai'],
        creator: users[0]._id,
        members: users.map((u, i) => ({ user: u._id, role: i === 0 ? 'admin' : 'member', joinedAt: new Date() })),
        memberCount: users.length,
      },
      {
        name: 'Jaipur Heritage', slug: 'jaipur-heritage', description: 'Celebrating the rich culture and heritage of the Pink City. Discuss festivals, traditions, local cuisine, and historical landmarks.',
        city: 'Jaipur', state: 'Rajasthan', category: 'cultural', privacy: 'public',
        tags: ['jaipur', 'rajasthan', 'heritage', 'culture'], rules: ['Respect all cultures', 'Share authentic content'],
        creator: users[1]._id,
        members: [{ user: users[1]._id, role: 'admin', joinedAt: new Date() }, { user: users[0]._id, role: 'member', joinedAt: new Date() }, { user: users[4]._id, role: 'member', joinedAt: new Date() }],
        memberCount: 3,
      },
      {
        name: 'Bangalore Tech Locals', slug: 'bangalore-tech-locals', description: 'Tech professionals in Bangalore connecting beyond work. Meetups, local startup scene, and community events for techies in the Garden City.',
        city: 'Bangalore', state: 'Karnataka', category: 'professional', privacy: 'public',
        tags: ['bangalore', 'tech', 'startups', 'networking'],
        creator: users[2]._id,
        members: [{ user: users[2]._id, role: 'admin', joinedAt: new Date() }, { user: users[0]._id, role: 'member', joinedAt: new Date() }],
        memberCount: 2,
      },
      {
        name: 'Gujarat Foodies', slug: 'gujarat-foodies', description: 'For everyone who loves Gujarati food and wants to share recipes, restaurant reviews, and food event updates!',
        city: 'Ahmedabad', state: 'Gujarat', category: 'social', privacy: 'public',
        tags: ['gujarat', 'food', 'recipes', 'ahmedabad'],
        creator: users[3]._id,
        members: [{ user: users[3]._id, role: 'admin', joinedAt: new Date() }, { user: users[4]._id, role: 'member', joinedAt: new Date() }],
        memberCount: 2,
      },
    ]);
    console.log(`Created ${communities.length} communities`);

    // Update users with joined communities
    for (const user of users) {
      const userCommunities = communities.filter(c => c.members.some(m => m.user.toString() === user._id.toString()));
      await User.findByIdAndUpdate(user._id, { joinedCommunities: userCommunities.map(c => c._id) });
    }

    // Create posts
    const posts = await Post.create([
      { author: users[0]._id, community: communities[0]._id, content: '🎉 Welcome to Mumbai Connect! This is our official community for all things Mumbai. Share your favorite spots, upcoming events, and connect with fellow Mumbaikars. Let\'s build something amazing together!', type: 'announcement', isPinned: true, likeCount: 15 },
      { author: users[1]._id, community: communities[0]._id, content: 'Just discovered an amazing hidden café in Bandra. Perfect chai and cutting vibes! Has anyone else been to "The Bombay Canteen" recently? The new menu is incredible 🍵', type: 'text', likeCount: 8 },
      { author: users[2]._id, community: communities[0]._id, content: 'Mumbai rains are here! What\'s your go-to comfort food during the monsoon season?', type: 'poll', pollOptions: [{ text: 'Vada Pav 🥔', votes: [users[0]._id, users[3]._id] }, { text: 'Bhutta (Corn) 🌽', votes: [users[1]._id] }, { text: 'Pakoras 🧆', votes: [users[4]._id] }, { text: 'Chai & Biscuits ☕', votes: [users[2]._id] }], likeCount: 5 },
      { author: users[1]._id, community: communities[1]._id, content: '📸 Throwback to last year\'s Hawa Mahal sunset. Jaipur never fails to mesmerize! Who\'s planning to visit during Diwali?', type: 'text', likeCount: 12 },
      { author: users[2]._id, community: communities[2]._id, content: 'Organizing a developer meetup this Saturday at Koramangala! Topics: React 19, Next.js 15, and AI in web dev. Who\'s in? Drop a comment!', type: 'announcement', likeCount: 20, commentCount: 5 },
      { author: users[3]._id, community: communities[3]._id, content: 'My grandmother\'s secret Undhiyu recipe that\'s been in our family for generations 🍲 The key ingredient? Love and lots of methi! Will share the full recipe in the comments.', type: 'text', likeCount: 25 },
    ]);
    console.log(`Created ${posts.length} posts`);

    // Create events
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 30);

    const events = await Event.create([
      {
        title: 'Mumbai Community Meetup 2026', description: 'Join us for the biggest community meetup in Mumbai! Network, share stories, and celebrate our city together. Refreshments and swag included!',
        date: futureDate, time: '18:00', location: 'Marine Drive, Mumbai', organizer: users[0]._id, community: communities[0]._id,
        category: 'meetup', maxParticipants: 100, participants: [users[0]._id, users[1]._id, users[3]._id], participantCount: 3,
      },
      {
        title: 'Jaipur Cultural Festival', description: 'A celebration of Rajasthani culture with folk music, dance performances, local cuisine, and art exhibitions.',
        date: futureDate2, time: '10:00', location: 'Albert Hall Museum, Jaipur', organizer: users[1]._id, community: communities[1]._id,
        category: 'festival', participants: [users[1]._id, users[4]._id], participantCount: 2,
      },
      {
        title: 'Bangalore Tech Talk: AI & Community', description: 'An evening discussing how AI can help build stronger local communities. Speakers from top Bangalore startups.',
        date: futureDate, time: '19:00', location: 'WeWork Galaxy, Bangalore', organizer: users[2]._id, community: communities[2]._id,
        category: 'workshop', maxParticipants: 50, participants: [users[2]._id, users[0]._id], participantCount: 2,
      },
    ]);
    console.log(`Created ${events.length} events`);

    // Create notifications
    await Notification.create([
      { recipient: users[0]._id, sender: users[1]._id, type: 'community', title: 'New Member', message: 'Priya Sharma joined Mumbai Connect', link: '/communities/mumbai-connect' },
      { recipient: users[0]._id, sender: users[2]._id, type: 'event', title: 'New Event RSVP', message: 'Rahul Verma is attending Mumbai Community Meetup 2026', link: '/events' },
      { recipient: users[1]._id, sender: users[0]._id, type: 'like', title: 'New Like', message: 'Admin User liked your post in Jaipur Heritage', link: '/communities/jaipur-heritage' },
      { recipient: users[2]._id, sender: users[0]._id, type: 'comment', title: 'New Comment', message: 'Admin User commented on your developer meetup post', link: '/communities/bangalore-tech-locals' },
    ]);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('  Admin: admin@lokconnect.com / password123');
    console.log('  User:  priya@example.com / password123');
    console.log('  User:  rahul@example.com / password123');
    console.log('  User:  anita@example.com / password123');
    console.log('  User:  vikram@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
