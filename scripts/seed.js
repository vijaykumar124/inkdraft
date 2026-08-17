require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Artist = require('../models/Artist');
const Category = require('../models/Category');
const Design = require('../models/Design');
const Testimonial = require('../models/Testimonial');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Admin
  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await Admin.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'superadmin' });
    console.log('✅ Admin created:', process.env.ADMIN_EMAIL);
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Clear & Re-seed Categories with 100% accurate tattoo images matching style names
  await Category.deleteMany({});
  const categories = [
    { name: 'Traditional', slug: 'traditional', image: 'https://images.unsplash.com/photo-1612459284453-a2b74c3f57c3?w=400&q=80&fit=crop', order: 1 },
    { name: 'Minimalist', slug: 'minimalist', image: 'https://images.unsplash.com/photo-1567527827878-a5d3aba7eec5?w=400&q=80&fit=crop', order: 2 },
    { name: 'Geometric', slug: 'geometric', image: 'https://images.unsplash.com/photo-1543489822-c49534f3271f?w=400&q=80&fit=crop', order: 3 },
    { name: 'Blackwork', slug: 'blackwork', image: 'https://images.unsplash.com/photo-1597075380606-cf8e1e8a6f8b?w=400&q=80&fit=crop', order: 4 },
    { name: 'Watercolor', slug: 'watercolor', image: 'https://images.unsplash.com/photo-1561883088-039e53143d73?w=400&q=80&fit=crop', order: 5 },
    { name: 'Realism', slug: 'realism', image: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=400&q=80&fit=crop', order: 6 },
    { name: 'Japanese', slug: 'japanese', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&q=80&fit=crop', order: 7 },
    { name: 'Fine Line', slug: 'fine-line', image: 'https://images.unsplash.com/photo-1590246813516-a8b8d47c74c5?w=400&q=80&fit=crop', order: 8 }
  ];
  await Category.insertMany(categories);
  console.log('✅ Categories seeded with accurate tattoo artwork');

  // Clear & Re-seed Designs with accurate matching tattoo images
  await Design.deleteMany({});
  const designs = [
    { title: 'Dragon Sleeve', category: 'Japanese', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80&fit=crop', isFeatured: true, order: 1 },
    { title: 'Geometric Wolf', category: 'Geometric', image: 'https://images.unsplash.com/photo-1543489822-c49534f3271f?w=800&q=80&fit=crop', isFeatured: true, order: 2 },
    { title: 'Rose Blackwork', category: 'Blackwork', image: 'https://images.unsplash.com/photo-1597075380606-cf8e1e8a6f8b?w=800&q=80&fit=crop', isFeatured: true, order: 3 },
    { title: 'Fine Line Portrait', category: 'Fine Line', image: 'https://images.unsplash.com/photo-1590246813516-a8b8d47c74c5?w=800&q=80&fit=crop', isFeatured: true, order: 4 },
    { title: 'Traditional Eagle', category: 'Traditional', image: 'https://images.unsplash.com/photo-1612459284453-a2b74c3f57c3?w=800&q=80&fit=crop', isFeatured: true, order: 5 },
    { title: 'Watercolor Galaxy', category: 'Watercolor', image: 'https://images.unsplash.com/photo-1561883088-039e53143d73?w=800&q=80&fit=crop', isFeatured: true, order: 6 }
  ];
  await Design.insertMany(designs);
  console.log('✅ Featured Designs seeded with accurate tattoo artwork');

  // Artists
  const artistCount = await Artist.countDocuments();
  if (artistCount === 0) {
    const artists = [
      { name: 'Alex Rivera', specialty: 'Japanese', experience: '8+ years', bio: 'Specializing in traditional Japanese art and large-scale sleeves.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop&crop=face', instagram: 'alex_inkcraft', rating: 5.0, reviewCount: 247, order: 1 },
      { name: 'Maya Chen', specialty: 'Fine Line', experience: '6+ years', bio: 'Delicate fine line and botanical tattoo specialist.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&fit=crop&crop=face', instagram: 'maya_fineline', rating: 4.9, reviewCount: 198, order: 2 },
      { name: 'Jordan Blake', specialty: 'Geometric', experience: '5+ years', bio: 'Sacred geometry and pattern work expert.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face', instagram: 'jordan_geometric', rating: 4.8, reviewCount: 156, order: 3 },
      { name: 'Sam Torres', specialty: 'Realism', experience: '10+ years', bio: 'Hyper-realistic portrait and wildlife tattoo artist.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&fit=crop&crop=face', instagram: 'sam_realism', rating: 5.0, reviewCount: 312, order: 4 },
      { name: 'Kai Nakamura', specialty: 'Blackwork', experience: '7+ years', bio: 'Bold blackwork, tribal patterns and neo-traditional designs.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80&fit=crop&crop=face', instagram: 'kai_blackwork', rating: 4.9, reviewCount: 203, order: 5 }
    ];
    await Artist.insertMany(artists);
    console.log('✅ Artists seeded');
  }

  // Testimonials
  const testCount = await Testimonial.countDocuments();
  if (testCount === 0) {
    const testimonials = [
      { name: 'Sarah M.', location: 'New York, NY', rating: 5, review: 'Absolutely blown away by my sleeve. The artist understood exactly what I wanted and brought it to life in the most incredible way. 10/10 would recommend InkDraft to anyone looking for world-class work.', tattooStyle: 'Japanese Sleeve', isApproved: true, isFeatured: true },
      { name: 'James K.', location: 'Los Angeles, CA', rating: 5, review: 'From the initial consultation to the final session, the entire experience was world-class. My geometric back piece is exactly what I envisioned. Pure artistry at InkDraft.', tattooStyle: 'Geometric', isApproved: true, isFeatured: true },
      { name: 'Priya S.', location: 'Chicago, IL', rating: 5, review: 'I was nervous about my first tattoo, but the team made me feel so comfortable. The fine line botanical piece on my forearm is delicate and perfect. Couldn\'t be happier!', tattooStyle: 'Fine Line', isApproved: true, isFeatured: true }
    ];
    await Testimonial.insertMany(testimonials);
    console.log('✅ Testimonials seeded');
  }

  // Pricing
  const priceCount = await Pricing.countDocuments();
  if (priceCount === 0) {
    const plans = [
      { name: 'Starter', price: 29, period: 'session', description: 'Perfect for small, simple designs', features: ['1 design concept', 'Up to 2 revisions', 'Standard placement', 'Digital design file', 'Basic aftercare guide'], isPopular: false, ctaText: 'Book Starter', order: 1 },
      { name: 'Premium', price: 89, period: 'session', description: 'Our most popular package for custom work', features: ['3 design concepts', 'Unlimited revisions', 'Artist consultation', 'Priority booking', 'Full aftercare kit', 'Touch-up session included'], isPopular: true, ctaText: 'Book Premium', order: 2 },
      { name: 'Elite', price: 249, period: 'session', description: 'Full sleeve & complex full-body artwork', features: ['Custom concept art', 'Dedicated senior artist', 'Full sleeve planning', 'Multiple sessions', 'VIP studio access', '1 year touch-ups', 'Professional photo session'], isPopular: false, ctaText: 'Book Elite', order: 3 }
    ];
    await Pricing.insertMany(plans);
    console.log('✅ Pricing plans seeded');
  }

  // Default Settings
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    const defaults = [
      { key: 'siteTitle', value: 'InkDraft - Design Your Next Tattoo', group: 'seo' },
      { key: 'metaDescription', value: 'Premium tattoo studio with world-class artists. Custom tattoo designs, traditional, minimalist, geometric and more.', group: 'seo' },
      { key: 'heroDescription', value: 'Work with world-class tattoo artists to bring your vision to life. From minimalist line work to elaborate full-sleeve masterpieces.', group: 'hero' },
      { key: 'statDesigns', value: '3000', group: 'stats' },
      { key: 'statArtists', value: '50', group: 'stats' },
      { key: 'statClients', value: '8500', group: 'stats' },
      { key: 'statYears', value: '12', group: 'stats' },
      { key: 'contactEmail', value: 'hello@inkdraft.com', group: 'contact' },
      { key: 'contactPhone', value: '+1 (555) 000-0000', group: 'contact' },
      { key: 'address', value: '123 Art District, New York, NY 10001', group: 'contact' },
      { key: 'hours', value: 'Mon–Sat: 10am – 8pm', group: 'contact' }
    ];
    await Settings.insertMany(defaults);
    console.log('✅ Settings seeded');
  }

  console.log('\n🎉 Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Admin Email: ${process.env.ADMIN_EMAIL}`);
  console.log(`Admin Password: ${process.env.ADMIN_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
