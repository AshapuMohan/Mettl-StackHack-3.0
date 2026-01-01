const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/marketplace', {
      authSource: "marketplace",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function checkDatabase() {
  try {
    await connectDB();
    
    console.log('\n📊 Database Status Check\n');
    
    // Check collections
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`📂 Categories: ${categoryCount}`);
    console.log(`📦 Products: ${productCount}`);
    
    if (productCount === 0) {
      console.log('\n⚠️  No products found in database!');
      console.log('🔧 Run the following command to seed the database:');
      console.log('   npm run seed');
    } else {
      console.log('\n✅ Database has been seeded with products');
      
      // Show sample products
      const sampleProducts = await Product.find()
        .populate('category', 'name')
        .populate('seller', 'name')
        .limit(5);
      
      console.log('\n📦 Sample Products:');
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (${product.category?.name})`);
      });
    }
    
    // Check categories
    if (categoryCount > 0) {
      const categories = await Category.find().select('name');
      console.log('\n📂 Categories:');
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
      });
    }
    
    //Admin
    const admin=await User.findOne({role:'admin'});
    if(admin){
      console.log('\n🔐 Admin:');
      console.log(`${admin.name} (${admin.email})`);
    }
    
    // Check sellers
    const sellers = await User.find({ role: 'seller' }).select('name email');
    if (sellers.length > 0) {
      console.log('\n🏪 Sellers:');
      sellers.slice(0, 5).forEach((seller, index) => {
        console.log(`${index + 1}. ${seller.name} (${seller.email})`);
      });
      if (sellers.length > 5) {
        console.log(`   ... and ${sellers.length - 5} more sellers`);
      }
    }
    
    // Check customers
    const customers = await User.find({ role: 'customer' }).select('name email');
    if (customers.length > 0) {
      console.log('\n👤 Customers:');
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name} (${customer.email})`);
      });
    }
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('Customer: customer@demo.com / demo123');
    console.log('Seller: sneakerhub@marketplace.com / seller123');
    console.log(`${admin.name} (${admin.email})`)
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();