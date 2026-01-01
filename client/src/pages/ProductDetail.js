import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => axios.get(`/api/products/${id}`).then(res => res.data)
  );

  const { data: reviews, error: reviewsError } = useQuery(
    ['reviews', id],
    () => axios.get(`/api/reviews/product/${id}`).then(res => res.data),
    { 
      enabled: !!id,
      retry: 1,
      onError: (error) => {
        console.error('Failed to fetch reviews:', error);
      }
    }
  );

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedVariant);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-700">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">by {
              (typeof product.seller === 'object' && product.seller?.name) || 
              (typeof product.seller === 'string' ? product.seller : 'Unknown Seller')
            }</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.ratings?.average || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.ratings?.average?.toFixed(1) || 0} ({product.ratings?.count || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Options</h3>
              <div className="space-y-3">
                {product.variants.map((variant, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {variant.name}
                    </label>
                    <select
                      onChange={(e) => setSelectedVariant({ ...variant, option: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select {variant.name}</option>
                      {variant.options.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              product.inventory?.quantity > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm ${
              product.inventory?.quantity > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.inventory?.quantity > 0 
                ? `${product.inventory.quantity} in stock` 
                : 'Out of stock'
              }
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={product.inventory?.quantity === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                {isInCart(product._id, selectedVariant) ? 'Added to Cart' : 'Add to Cart'}
              </span>
            </button>
            
            <div className="flex space-x-3">
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Wishlist</span>
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Specifications and Special Features */}
          <div className="space-y-6">
            {/* Quality Check for Sneakers */}
            {product.qualityCheck && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Authentication & Quality Check
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-green-800">Quality Score: {product.qualityCheck.score}/10</span>
                    <span className="text-sm text-green-600">✓ {product.qualityCheck.authenticator}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {product.qualityCheck.checkPoints?.slice(0, 6).map((point, index) => (
                      <div key={index} className="flex items-center text-sm text-green-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Restaurant Info for Food */}
            {product.restaurant && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Restaurant Information</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">{product.restaurant.name}</h4>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-blue-800">{product.restaurant.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">{product.restaurant.address}</p>
                  <div className="flex space-x-4">
                    <a href={`tel:${product.restaurant.phone}`} className="text-sm text-blue-600 hover:underline">
                      📞 Call Restaurant
                    </a>
                    <a href={`https://wa.me/${product.restaurant.whatsapp?.replace(/[^0-9]/g, '')}`} className="text-sm text-green-600 hover:underline">
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Info for Food */}
            {product.delivery && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  Delivery Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Estimated Time</span>
                    <p className="font-medium">{product.delivery.estimatedTime}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Delivery Fee</span>
                    <p className="font-medium">${product.delivery.deliveryFee}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Minimum Order</span>
                    <p className="font-medium">${product.delivery.minimumOrder}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Free Delivery Over</span>
                    <p className="font-medium">${product.delivery.freeDeliveryOver}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dietary Information for Food */}
            {product.dietaryInfo && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Dietary Information</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.dietaryInfo.vegetarian && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🌱 Vegetarian</span>
                  )}
                  {product.dietaryInfo.vegan && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🌿 Vegan</span>
                  )}
                  {product.dietaryInfo.glutenFree && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">🌾 Gluten Free</span>
                  )}
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    🌶️ {product.dietaryInfo.spiceLevel}
                  </span>
                </div>
                {product.dietaryInfo.allergens?.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Allergens: </span>
                    <span className="text-sm font-medium">{product.dietaryInfo.allergens.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Carbon Credits Certifications */}
            {product.certifications && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                  Certifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.certifications.verra && (
                    <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-emerald-600 mr-2">✓</span>
                      <div>
                        <p className="font-medium text-emerald-800">VERRA Certified</p>
                        <p className="text-sm text-emerald-600">ID: {product.certifications.verraId}</p>
                      </div>
                    </div>
                  )}
                  {product.certifications.goldStandard && (
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-600 mr-2">⭐</span>
                      <div>
                        <p className="font-medium text-yellow-800">Gold Standard</p>
                        <p className="text-sm text-yellow-600">Premium Quality</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SDG Goals for Carbon Credits */}
            {product.sdgGoals && product.sdgGoals.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">UN Sustainable Development Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.sdgGoals.map((goal, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      goal.impact === 'High' ? 'border-green-500 bg-green-50' :
                      goal.impact === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-gray-500 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Goal {goal.goal}: {goal.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          goal.impact === 'High' ? 'bg-green-200 text-green-800' :
                          goal.impact === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {goal.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Details for Carbon Credits */}
            {product.projectDetails && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.projectDetails).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <p className="font-medium">
                        {typeof value === 'object' && value !== null 
                          ? (value.name || value.title || value.value || 'N/A')
                          : String(value)
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Specifications */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {product.specifications && (
                  Array.isArray(product.specifications) 
                    ? product.specifications.map((spec, index) => (
                        <div key={index}>
                          <span className="text-sm text-gray-600 capitalize">{spec.key}</span>
                          <p className="font-medium">{spec.value}</p>
                        </div>
                      ))
                    : Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <p className="font-medium">
                            {typeof value === 'object' && value !== null 
                              ? (value.name || value.title || value.value || 'N/A')
                              : String(value)
                            }
                          </p>
                        </div>
                      ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviewsError ? (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews available for this product yet.</p>
          </div>
        </div>
      ) : reviews && reviews.reviews && reviews.reviews.length > 0 ? (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.reviews.slice(0, 5).map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{review.customer?.name}</span>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating.overall
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews available for this product yet.</p>
            <p className="text-sm text-gray-500 mt-2">Be the first to review this product!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;