const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

// Import models
const User = require('../server/models/User');
const Category = require('../server/models/Category');
const Product = require('../server/models/Product');

// Categories data
const categoriesData = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and electronic devices' },
  { name: 'Footwear', slug: 'footwear', description: 'Shoes and sneakers for all occasions' },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel for everyone' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Everything for your home and kitchen' },
  { name: 'Books', slug: 'books', description: 'Books and literature' },
  { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Sports equipment and fitness gear' },
  { name: 'Food & Beverages', slug: 'food-beverages', description: 'Gourmet food and beverages' },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Beauty products and personal care items' },
  { name: 'Digital Products', slug: 'digital-products', description: 'Digital downloads and online courses' }
];

// Sellers data
const sellersData = [
  { name: 'SneakerHub', email: 'sneakerhub@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'SportZone', email: 'sportzone@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'TechWorld', email: 'techworld@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'AudioPro', email: 'audiopro@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'DenimCo', email: 'denimco@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'KitchenPro', email: 'kitchenpro@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'HomeTech', email: 'hometech@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'BookHaven', email: 'bookhaven@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'FitLife', email: 'fitlife@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'TeaGarden', email: 'teagarden@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'GameGear', email: 'gamegear@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'GlowSkin', email: 'glowskin@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'CoffeeCraft', email: 'coffeecraft@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'FitTech', email: 'fittech@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'ComfortHome', email: 'comforthome@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'ArtMaster', email: 'artmaster@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'HydroLife', email: 'hydrolife@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'NaturalLiving', email: 'naturalliving@marketplace.com', password: 'seller123', role: 'seller' },
  { name: 'PureEssence', email: 'pureessence@marketplace.com', password: 'seller123', role: 'seller' }
];

// Demo customers
const customersData = [
  { name: 'John Doe', email: 'customer@demo.com', password: 'demo123', role: 'customer' },
  { name: 'Jane Smith', email: 'jane@demo.com', password: 'demo123', role: 'customer' },
  { name: 'Admin User', email: 'admin@marketplace.com', password: 'admin123', role: 'admin' }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  await Product.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});
  console.log('✅ Database cleared');
}

async function seedCategories() {
  console.log('📂 Seeding categories...');
  const categories = await Category.insertMany(categoriesData);
  console.log(`✅ Created ${categories.length} categories`);
  return categories;
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  // Create sellers one by one to trigger password hashing
  const sellers = [];
  for (const sellerData of sellersData) {
    const seller = new User(sellerData);
    await seller.save();
    sellers.push(seller);
  }
  console.log(`✅ Created ${sellers.length} sellers`);
  
  // Create customers one by one to trigger password hashing
  const customers = [];
  for (const customerData of customersData) {
    const customer = new User(customerData);
    await customer.save();
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers`);
  
  return { sellers, customers };
}

async function seedProducts(categories, sellers) {
  console.log('📦 Seeding products from CSV...');
  
  const products = [];
  const csvPath = path.join(__dirname, '../data/products.csv');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Find category
        const category = categories.find(cat => cat.name === row.category);
        if (!category) {
          console.warn(`⚠️  Category not found for product: ${row.name}`);
          return;
        }
        
        // Find seller
        const seller = sellers.find(s => s.email === row.seller_email);
        if (!seller) {
          console.warn(`⚠️  Seller not found for product: ${row.name} (${row.seller_email})`);
          return;
        }
        
        // Parse specifications
        const specifications = row.specifications ? 
          row.specifications.split('|').map(spec => {
            const [key, value] = spec.split(':');
            return { key: key.trim(), value: value.trim() };
          }) : [];
        
        // Parse images
        const images = row.images ? 
          [{ url: row.images, alt: row.name }] : [];
        
        // Parse tags
        const tags = row.tags ? row.tags.split(',').map(tag => tag.trim()) : [];
        
        const product = {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
          category: category._id,
          seller: seller._id,
          images,
          specifications,
          inventory: {
            quantity: parseInt(row.inventory_quantity),
            lowStockThreshold: 10
          },
          shipping: {
            weight: parseFloat(row.shipping_weight),
            freeShipping: row.shipping_freeShipping === 'true',
            shippingCost: parseFloat(row.shipping_cost)
          },
          ratings: {
            average: Math.random() * 2 + 3, // Random rating between 3-5
            count: Math.floor(Math.random() * 100) + 5 // Random count between 5-105
          },
          tags,
          isActive: true,
          isDigital: row.isDigital === 'true',
          seo: {
            metaTitle: row.name,
            metaDescription: row.description.substring(0, 160),
            slug: row.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
          }
        };
        
        products.push(product);
      })
      .on('end', async () => {
        try {
          const createdProducts = await Product.insertMany(products);
          console.log(`✅ Created ${createdProducts.length} products`);
          resolve(createdProducts);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function seedDatabase() {
  try {
    await connectDB();
    await clearDatabase();
    
    const categories = await seedCategories();
    const { sellers, customers } = await seedUsers();
    const products = await seedProducts(categories, sellers);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Sellers: ${sellers.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Products: ${products.length}`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('Customer: customer@demo.com / demo123');
    console.log('Seller: sneakerhub@marketplace.com / seller123');
    
    console.log('\n🚀 You can now start the application with: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();