const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://Mohan:123456@127.0.0.1:27017/marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Better, more reliable image URLs
const categoryImages = {
  'Electronics': [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&h=500&fit=crop'
  ],
  'Footwear': [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop'
  ],
  'Clothing': [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop'
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1585515656973-a0b8d3ba9c1b?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500&h=500&fit=crop'
  ],
  'Books': [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'
  ],
  'Sports & Fitness': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop'
  ],
  'Food & Beverages': [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop'
  ],
  'Beauty & Personal Care': [
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop'
  ],
  'Digital Products': [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&h=500&fit=crop'
  ]
};

// Specific product image mappings for better accuracy
const specificProductImages = {
  'Nike Air Max 270': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'Adidas Ultraboost 22': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
  'Apple iPhone 14 Pro': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
  'Samsung Galaxy S23 Ultra': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop',
  'Sony WH-1000XM4 Headphones': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop',
  'MacBook Air M2': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
  'Air Jordan 1 Retro High OG \'Chicago\'': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'Adidas Yeezy Boost 350 V2 \'Zebra\'': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
  'Nike Dunk Low \'Panda\'': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
  'Margherita Pizza - Tony\'s Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=500&fit=crop',
  'Chicken Biryani - Spice Palace': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&h=500&fit=crop',
  'Avocado Toast Bowl - Green Garden': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&h=500&fit=crop',
  'Amazon Rainforest Conservation Project': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop',
  'Solar Farm Project - Rajasthan': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
  'Wind Energy Project - Texas': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&h=500&fit=crop',
  'Digital Art Course - Complete Guide': 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=500&h=500&fit=crop',
  'Levi\'s 501 Original Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
  'Nike Dri-FIT T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
  'Instant Pot Duo 7-in-1': 'https://images.unsplash.com/photo-1585515656973-a0b8d3ba9c1b?w=500&h=500&fit=crop',
  'The Great Gatsby - Hardcover': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
  'Yoga Mat Premium': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
  'Organic Green Tea - 100 Bags': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop',
  'Coffee Beans - Ethiopian Single Origin': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop',
  'Fitness Tracker Watch': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop'
};

const fixProductImages = async () => {
  try {
    console.log('🔄 Fixing product images...');

    // Get all products with their categories
    const products = await Product.find().populate('category', 'name');
    let fixedCount = 0;
    let addedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      let updatedImages = [...(product.images || [])];

      // Check if product has no images
      if (!product.images || product.images.length === 0) {
        console.log(`❌ No images for: ${product.name}`);
        
        // Try to get specific image first
        if (specificProductImages[product.name]) {
          updatedImages = [{
            url: specificProductImages[product.name],
            alt: product.name
          }];
          needsUpdate = true;
          addedCount++;
          console.log(`✅ Added specific image for: ${product.name}`);
        }
        // Fall back to category image
        else if (product.category && categoryImages[product.category.name]) {
          const categoryImageUrls = categoryImages[product.category.name];
          const randomImage = categoryImageUrls[Math.floor(Math.random() * categoryImageUrls.length)];
          updatedImages = [{
            url: randomImage,
            alt: product.name
          }];
          needsUpdate = true;
          addedCount++;
          console.log(`✅ Added category image for: ${product.name} (${product.category.name})`);
        }
      }
      // Check if existing images need better URLs
      else if (product.images.length > 0) {
        // Update existing images with better URLs if available
        if (specificProductImages[product.name]) {
          updatedImages[0] = {
            url: specificProductImages[product.name],
            alt: product.name
          };
          needsUpdate = true;
          fixedCount++;
          console.log(`🔧 Updated image for: ${product.name}`);
        }
        // Ensure images have proper parameters for better loading
        else if (!product.images[0].url.includes('fit=crop')) {
          const currentUrl = product.images[0].url;
          if (currentUrl.includes('unsplash.com')) {
            updatedImages[0] = {
              url: currentUrl.includes('?') 
                ? `${currentUrl}&fit=crop&h=500` 
                : `${currentUrl}?w=500&h=500&fit=crop`,
              alt: product.name
            };
            needsUpdate = true;
            fixedCount++;
            console.log(`🔧 Enhanced image URL for: ${product.name}`);
          }
        }
      }

      // Update product if needed
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, {
          images: updatedImages
        });
      }
    }

    console.log(`\n🎉 Image fixing completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Images added: ${addedCount}`);
    console.log(`   - Images fixed: ${fixedCount}`);
    console.log(`   - Total products processed: ${products.length}`);

  } catch (error) {
    console.error('❌ Error fixing images:', error);
  }
};

const main = async () => {
  await connectDB();
  await fixProductImages();
  mongoose.disconnect();
  console.log('✅ Database connection closed');
};

main().catch(console.error);