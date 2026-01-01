const mongoose = require('mongoose');
const Product = require('../server/models/Product');
const Category = require('../server/models/Category');
const User = require('../server/models/User');

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

const additionalProducts = [
  // SNEAKERS MARKETPLACE - Premium Sneakers with Authentication Features
  {
    name: "Air Jordan 1 Retro High OG 'Chicago'",
    description: "Iconic basketball sneaker with premium leather construction. Includes authenticity certificate and quality verification.",
    price: 170.00,
    originalPrice: 200.00,
    category: "Footwear",
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", alt: "Air Jordan 1 Chicago" }
    ],
    specifications: {
      brand: "Nike",
      model: "Air Jordan 1 Retro High OG",
      colorway: "Chicago",
      material: "Premium Leather",
      sole: "Rubber Outsole",
      release: "2015"
    },
    qualityCheck: {
      authenticated: true,
      checkPoints: [
        "Swoosh alignment and stitching",
        "Wings logo placement",
        "Heel tab construction", 
        "Toe box shape and perforations",
        "Midsole paint and finish",
        "Insole branding and font",
        "Box label authenticity",
        "Size tag verification",
        "Overall craftsmanship",
        "Material quality assessment"
      ],
      score: 10,
      authenticator: "StockX Verified"
    },
    variants: [
      { name: "Size", options: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"] }
    ],
    features: ["Authenticity Guaranteed", "Quality Verified", "Original Box", "Fast Shipping"],
    inventory: { quantity: 45, lowStockThreshold: 5 },
    shipping: { 
      weight: 2.5, 
      freeShipping: true, 
      shippingCost: 0,
      tracking: true,
      estimatedDays: "2-3 business days"
    },
    ratings: { average: 4.8, count: 234 },
    returnPolicy: {
      days: 30,
      condition: "Unworn with original packaging",
      freeReturns: true
    }
  },
  {
    name: "Adidas Yeezy Boost 350 V2 'Zebra'",
    description: "Limited edition Yeezy with distinctive zebra pattern. Authenticated and verified for quality.",
    price: 320.00,
    originalPrice: 380.00,
    category: "Footwear",
    images: [
      { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500", alt: "Yeezy Zebra" }
    ],
    specifications: {
      brand: "Adidas",
      model: "Yeezy Boost 350 V2",
      colorway: "Zebra",
      material: "Primeknit Upper",
      sole: "Boost Midsole",
      release: "2022"
    },
    qualityCheck: {
      authenticated: true,
      checkPoints: [
        "Primeknit pattern accuracy",
        "Boost sole authenticity",
        "Size tag verification",
        "Box label matching",
        "Heel tab placement",
        "Lace quality and length",
        "Insole branding",
        "Overall construction",
        "Color accuracy",
        "Shape and silhouette"
      ],
      score: 10,
      authenticator: "GOAT Verified"
    },
    variants: [
      { name: "Size", options: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"] }
    ],
    features: ["Limited Edition", "Boost Technology", "Authenticated", "Premium Materials"],
    inventory: { quantity: 23, lowStockThreshold: 3 },
    shipping: { 
      weight: 2.2, 
      freeShipping: true, 
      shippingCost: 0,
      tracking: true,
      estimatedDays: "1-2 business days"
    },
    ratings: { average: 4.9, count: 156 },
    returnPolicy: {
      days: 14,
      condition: "Deadstock condition only",
      freeReturns: true
    }
  },
  {
    name: "Nike Dunk Low 'Panda'",
    description: "Classic black and white colorway. Popular lifestyle sneaker with vintage basketball heritage.",
    price: 110.00,
    originalPrice: 130.00,
    category: "Footwear",
    images: [
      { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500", alt: "Nike Dunk Panda" }
    ],
    specifications: {
      brand: "Nike",
      model: "Dunk Low",
      colorway: "White/Black",
      material: "Leather Upper",
      sole: "Rubber Cupsole",
      release: "2021"
    },
    qualityCheck: {
      authenticated: true,
      checkPoints: [
        "Swoosh positioning",
        "Leather quality",
        "Stitching consistency",
        "Sole attachment",
        "Tongue padding",
        "Heel construction",
        "Lace eyelets",
        "Size tag accuracy",
        "Box authenticity",
        "Overall finish"
      ],
      score: 9,
      authenticator: "Flight Club Verified"
    },
    variants: [
      { name: "Size", options: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"] }
    ],
    features: ["Versatile Style", "Comfortable Fit", "Durable Construction", "Authentic Guarantee"],
    inventory: { quantity: 67, lowStockThreshold: 10 },
    shipping: { 
      weight: 2.3, 
      freeShipping: false, 
      shippingCost: 12.99,
      tracking: true,
      estimatedDays: "3-5 business days"
    },
    ratings: { average: 4.6, count: 89 },
    returnPolicy: {
      days: 30,
      condition: "Unworn condition",
      freeReturns: false
    }
  },

  // FOOD DELIVERY MARKETPLACE - Restaurant Menu Items
  {
    name: "Margherita Pizza - Tony's Italian",
    description: "Classic Neapolitan pizza with fresh mozzarella, basil, and San Marzano tomatoes. Made in wood-fired oven.",
    price: 18.99,
    originalPrice: 22.99,
    category: "Food & Beverages",
    images: [
      { url: "https://plus.unsplash.com/premium_photo-1733266807710-f8f8de34416f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Margherita Pizza" }
    ],
    specifications: {
      restaurant: "Tony's Italian Kitchen",
      cuisine: "Italian",
      category: "Pizza",
      servingSize: "12 inch (2-3 people)",
      prepTime: "15-20 minutes",
      calories: "850 per pizza"
    },
    ingredients: [
      "San Marzano tomatoes",
      "Fresh mozzarella",
      "Fresh basil",
      "Extra virgin olive oil",
      "Wood-fired pizza dough",
      "Sea salt"
    ],
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      spiceLevel: "Mild",
      allergens: ["Gluten", "Dairy"]
    },
    delivery: {
      estimatedTime: "25-35 minutes",
      minimumOrder: 15.00,
      deliveryFee: 2.99,
      freeDeliveryOver: 35.00,
      packaging: "Eco-friendly box"
    },
    restaurant: {
      name: "Tony's Italian Kitchen",
      rating: 4.7,
      address: "123 Main St, Downtown",
      phone: "+1-555-0123",
      whatsapp: "+1-555-0123"
    },
    features: ["Wood-fired", "Fresh ingredients", "Traditional recipe", "Hot delivery"],
    inventory: { quantity: 999, lowStockThreshold: 50 },
    shipping: { weight: 1.5, freeShipping: false, shippingCost: 2.99 },
    ratings: { average: 4.8, count: 342 }
  },
  {
    name: "Chicken Biryani - Spice Palace",
    description: "Aromatic basmati rice with tender chicken, saffron, and traditional spices. Served with raita and pickle.",
    price: 16.99,
    originalPrice: 19.99,
    category: "Food & Beverages",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Chicken Biryani" }
    ],
    specifications: {
      restaurant: "Spice Palace",
      cuisine: "Indian",
      category: "Rice Dishes",
      servingSize: "Large (1-2 people)",
      prepTime: "20-25 minutes",
      calories: "720 per serving"
    },
    ingredients: [
      "Basmati rice",
      "Chicken pieces",
      "Saffron",
      "Caramelized onions",
      "Yogurt marinade",
      "Biryani spices"
    ],
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      spiceLevel: "Medium",
      allergens: ["Dairy", "Nuts"]
    },
    delivery: {
      estimatedTime: "30-40 minutes",
      minimumOrder: 20.00,
      deliveryFee: 3.99,
      freeDeliveryOver: 40.00,
      packaging: "Insulated container"
    },
    restaurant: {
      name: "Spice Palace",
      rating: 4.6,
      address: "456 Curry Lane, Spice District",
      phone: "+1-555-0456",
      whatsapp: "+1-555-0456"
    },
    features: ["Authentic recipe", "Premium saffron", "Includes sides", "Halal certified"],
    inventory: { quantity: 999, lowStockThreshold: 30 },
    shipping: { weight: 2.0, freeShipping: false, shippingCost: 3.99 },
    ratings: { average: 4.7, count: 278 }
  },
  {
    name: "Avocado Toast Bowl - Green Garden",
    description: "Healthy bowl with smashed avocado, quinoa, cherry tomatoes, and hemp seeds. Vegan and nutritious.",
    price: 12.99,
    originalPrice: 15.99,
    category: "Food & Beverages",
    images: [
      { url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500", alt: "Avocado Bowl" }
    ],
    specifications: {
      restaurant: "Green Garden Cafe",
      cuisine: "Healthy/Vegan",
      category: "Bowls",
      servingSize: "Regular (1 person)",
      prepTime: "10-15 minutes",
      calories: "420 per bowl"
    },
    ingredients: [
      "Fresh avocado",
      "Quinoa",
      "Cherry tomatoes",
      "Hemp seeds",
      "Lemon dressing",
      "Mixed greens"
    ],
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      spiceLevel: "None",
      allergens: ["None"]
    },
    delivery: {
      estimatedTime: "15-25 minutes",
      minimumOrder: 12.00,
      deliveryFee: 1.99,
      freeDeliveryOver: 25.00,
      packaging: "Compostable bowl"
    },
    restaurant: {
      name: "Green Garden Cafe",
      rating: 4.9,
      address: "789 Health St, Wellness District",
      phone: "+1-555-0789",
      whatsapp: "+1-555-0789"
    },
    features: ["Superfood ingredients", "Vegan", "Gluten-free", "Sustainable packaging"],
    inventory: { quantity: 999, lowStockThreshold: 25 },
    shipping: { weight: 0.8, freeShipping: false, shippingCost: 1.99 },
    ratings: { average: 4.9, count: 156 }
  },

  // CARBON CREDITS MARKETPLACE - Environmental Projects
  {
    name: "Amazon Rainforest Conservation Project",
    description: "VERRA certified forestry project protecting 50,000 hectares of Amazon rainforest. Supports indigenous communities.",
    price: 25.50,
    originalPrice: 28.00,
    category: "Digital Products",
    images: [
      { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500", alt: "Amazon Forest" }
    ],
    specifications: {
      projectType: "Forestry - REDD+",
      location: "Acre, Brazil",
      area: "50,000 hectares",
      vintage: "2023",
      methodology: "VM0015",
      registry: "VERRA VCS"
    },
    certifications: {
      verra: true,
      verraId: "VCS-2156",
      goldStandard: false,
      cdm: false,
      additionalCertifications: ["CCBS", "Social Carbon"]
    },
    sdgGoals: [
      { goal: 1, name: "No Poverty", impact: "High" },
      { goal: 13, name: "Climate Action", impact: "High" },
      { goal: 15, name: "Life on Land", impact: "High" },
      { goal: 8, name: "Decent Work", impact: "Medium" },
      { goal: 5, name: "Gender Equality", impact: "Medium" },
      { goal: 6, name: "Clean Water", impact: "Low" }
    ],
    projectDetails: {
      co2Reduction: "1 tonne CO2e per credit",
      projectDuration: "30 years",
      communityBenefit: "500+ indigenous families",
      biodiversity: "2,000+ species protected",
      monitoring: "Satellite + ground verification"
    },
    features: ["VERRA Certified", "Community Benefits", "Biodiversity Protection", "Satellite Monitored"],
    inventory: { quantity: 10000, lowStockThreshold: 1000 },
    shipping: { weight: 0, freeShipping: true, shippingCost: 0 },
    ratings: { average: 4.8, count: 89 },
    delivery: {
      type: "Digital Certificate",
      timeframe: "Immediate",
      format: "PDF Certificate + Blockchain Record"
    }
  },
  {
    name: "Solar Farm Project - Rajasthan",
    description: "Large-scale solar energy project in India. Clean renewable energy replacing coal-fired power generation.",
    price: 18.75,
    originalPrice: 22.00,
    category: "Digital Products",
    images: [
      { url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500", alt: "Solar Farm" }
    ],
    specifications: {
      projectType: "Renewable Energy - Solar",
      location: "Rajasthan, India",
      capacity: "100 MW",
      vintage: "2023",
      methodology: "ACM0002",
      registry: "VERRA VCS"
    },
    certifications: {
      verra: true,
      verraId: "VCS-3247",
      goldStandard: true,
      cdm: false,
      additionalCertifications: ["Gold Standard CER"]
    },
    sdgGoals: [
      { goal: 7, name: "Affordable Clean Energy", impact: "High" },
      { goal: 13, name: "Climate Action", impact: "High" },
      { goal: 8, name: "Decent Work", impact: "High" },
      { goal: 9, name: "Industry Innovation", impact: "Medium" },
      { goal: 3, name: "Good Health", impact: "Medium" }
    ],
    projectDetails: {
      co2Reduction: "1 tonne CO2e per credit",
      energyGeneration: "180 GWh annually",
      coalDisplacement: "150,000 tonnes coal/year",
      jobsCreated: "200+ permanent jobs",
      airQualityImprovement: "Reduced PM2.5 emissions"
    },
    features: ["Gold Standard", "Clean Energy", "Job Creation", "Air Quality Improvement"],
    inventory: { quantity: 15000, lowStockThreshold: 2000 },
    shipping: { weight: 0, freeShipping: true, shippingCost: 0 },
    ratings: { average: 4.7, count: 67 },
    delivery: {
      type: "Digital Certificate",
      timeframe: "Within 24 hours",
      format: "PDF Certificate + Registry Link"
    }
  },
  {
    name: "Wind Energy Project - Texas",
    description: "Utility-scale wind farm generating clean electricity. Advanced turbine technology with high efficiency.",
    price: 22.25,
    originalPrice: 25.50,
    category: "Digital Products",
    images: [
      { url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500", alt: "Wind Farm" }
    ],
    specifications: {
      projectType: "Renewable Energy - Wind",
      location: "Texas, USA",
      capacity: "150 MW",
      vintage: "2023",
      methodology: "ACM0002",
      registry: "Climate Action Reserve"
    },
    certifications: {
      verra: false,
      verraId: null,
      goldStandard: false,
      cdm: false,
      additionalCertifications: ["Climate Action Reserve", "Green-e Certified"]
    },
    sdgGoals: [
      { goal: 7, name: "Affordable Clean Energy", impact: "High" },
      { goal: 13, name: "Climate Action", impact: "High" },
      { goal: 9, name: "Industry Innovation", impact: "High" },
      { goal: 8, name: "Decent Work", impact: "Medium" }
    ],
    projectDetails: {
      co2Reduction: "1 tonne CO2e per credit",
      energyGeneration: "450 GWh annually",
      householdsPowered: "42,000 homes equivalent",
      turbines: "50 advanced turbines",
      gridConnection: "ERCOT grid integration"
    },
    features: ["High Efficiency", "Grid Scale", "Advanced Technology", "US Domestic"],
    inventory: { quantity: 8500, lowStockThreshold: 1500 },
    shipping: { weight: 0, freeShipping: true, shippingCost: 0 },
    ratings: { average: 4.6, count: 45 },
    delivery: {
      type: "Digital Certificate",
      timeframe: "Same day",
      format: "Digital Registry Certificate"
    }
  }
];

const addMoreProducts = async () => {
  try {
    console.log('🔄 Adding more products to database...');

    // Get categories and sellers
    const categories = await Category.find();
    const sellers = await User.find({ role: 'seller' });

    if (categories.length === 0 || sellers.length === 0) {
      console.error('❌ No categories or sellers found. Please run the main seeding script first.');
      return;
    }

    // Create category map
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    let addedCount = 0;

    for (const productData of additionalProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ name: productData.name });
      if (existingProduct) {
        console.log(`⏭️  Product "${productData.name}" already exists, skipping...`);
        continue;
      }

      // Get random seller
      const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];
      
      // Create product
      const product = new Product({
        ...productData,
        category: categoryMap[productData.category],
        seller: randomSeller._id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        seo: {
          metaTitle: `${productData.name} - Best Price Online`,
          metaDescription: productData.description.substring(0, 150),
          keywords: productData.name.split(' ').concat(['buy', 'online', 'best', 'price'])
        }
      });

      await product.save();
      addedCount++;
      console.log(`✅ Added: ${productData.name}`);
    }

    console.log(`\n🎉 Successfully added ${addedCount} new products!`);
    
    // Show updated stats
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Error adding products:', error);
  }
};

const main = async () => {
  await connectDB();
  await addMoreProducts();
  mongoose.disconnect();
  console.log('✅ Database connection closed');
};

main().catch(console.error);