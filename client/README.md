# Marketplace App

A modern full-stack marketplace application built with React and Node.js that enables customers to browse, compare, and purchase products with real-time order tracking.

## 🚀 Features

### Core Marketplace Features
- **Product Catalog**: Browse products across multiple categories with advanced filtering
- **Search & Filter**: Search by name, filter by category, price range, and ratings
- **Product Comparison**: Compare multiple products side-by-side
- **Shopping Cart**: Add/remove items with quantity management
- **User Authentication**: Secure login/register for customers and sellers
- **Order Management**: Complete checkout process with order tracking

### Order & Delivery Tracking
- **Real-time Updates**: Live order status updates via WebSocket
- **Visual Progress**: Track orders from placement to delivery
- **Digital Products**: Instant delivery for digital goods
- **Physical Products**: Comprehensive shipping tracking
- **Return System**: Easy return and refund process

### Review System
- **Verified Reviews**: Only verified purchasers can review products
- **Multi-dimensional Ratings**: Rate quality, value, shipping, and service
- **Helpful Votes**: Community-driven review ranking
- **Seller Responses**: Sellers can respond to customer feedback

### Seller Features
- **Seller Dashboard**: Analytics and order management
- **Product Management**: Easy product listing with image upload
- **Order Processing**: Streamlined fulfillment workflow
- **Inventory Management**: Stock tracking with alerts

## 🛠️ Technology Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT authentication
- Multer for file uploads

**Frontend:**
- React 18 with hooks
- React Router for navigation
- React Query for data management
- Tailwind CSS for styling
- Lucide React for icons

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd marketplace-app
npm run install-all
```

### 2. Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

### 3. Database Setup
```bash
# Seed database with sample data
npm run seed
```

### 4. Start Application
```bash
# Start both server and client
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Demo Accounts

After seeding the database:

**Customer Account:**
- Email: customer@demo.com
- Password: demo123

**Seller Account:**
- Email: sneakerhub@marketplace.com
- Password: seller123

## 📊 Sample Data

The application includes:
- **29 Products** across 9 categories
- **19 Sellers** with realistic profiles
- **Multiple Categories**: Electronics, Footwear, Clothing, etc.
- **Price Range**: $14.99 - $1,199.99
- **Product Features**: Images, specifications, ratings, reviews

## 🔧 Available Scripts

```bash
npm run dev          # Start development servers
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run seed         # Populate database with sample data
npm run check-db     # Check database status
```

## 📱 Key Features Showcase

### Product Browsing
- Clean, responsive product grid
- High-quality product images
- Price comparison and discounts
- Rating and review display
- Category-based filtering

### Shopping Experience
- Intuitive shopping cart
- Secure checkout process
- Multiple payment options
- Order confirmation and tracking

### User Experience
- Personalized home page for logged-in users
- Mobile-responsive design
- Fast loading with optimized queries
- Real-time updates and notifications

## 🎨 UI/UX Improvements

### Home Page
- **Personalized Welcome**: Custom greeting for logged-in users
- **Featured Products**: Showcase top-rated items with hover effects
- **Category Navigation**: Quick access to product categories
- **Discount Badges**: Visual indicators for sale items
- **Loading States**: Smooth loading animations

### Product Display
- **Image Hover Effects**: Smooth zoom on product images
- **Sale Indicators**: Clear discount percentages
- **Free Shipping Badges**: Highlight shipping benefits
- **Star Ratings**: Visual rating display
- **Responsive Grid**: Adapts to different screen sizes

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Secure file upload handling

## 📈 Performance Optimizations

- React Query for efficient data caching
- Lazy loading for images
- Pagination for large datasets
- Optimized database queries
- Compressed assets

## 🚀 Deployment Ready

The application is configured for easy deployment:
- Environment-based configuration
- Production build scripts
- Static asset optimization
- Database connection handling

## 📞 Support

For issues or questions:
- Check the API health: `/api/health`
- Test products API: `/api/products/test`
- Verify database: `npm run check-db`

---

**Built with ❤️ for modern e-commerce experiences**