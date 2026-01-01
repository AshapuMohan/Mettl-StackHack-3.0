import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Filter, Grid, List, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: currentPage,
    limit: 12
  });

  const { data: products, isLoading, error } = useQuery(
    ['products', filters.page, filters.category, filters.sortBy, filters.sortOrder, filters.limit, filters.minPrice, filters.maxPrice, filters.search],
    () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      console.log('Fetching products with params:', params.toString());
      console.log('Current filters:', filters);
      return axios.get(`/api/products?${params.toString()}`).then(res => {
        console.log('Products response:', res.data);
        return res.data;
      });
    },
    { 
      keepPreviousData: false,
      retry: 3,
      onError: (error) => {
        console.error('Failed to fetch products:', error);
      }
    }
  );

  const { data: categories, error: categoriesError } = useQuery(
    'categories',
    () => {
      console.log('Fetching categories...');
      return axios.get('/api/categories').then(res => {
        console.log('Categories response:', res.data);
        return res.data;
      });
    },
    {
      retry: 3,
      onError: (error) => {
        console.error('Failed to fetch categories:', error);
      }
    }
  );

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Update filters when URL params change
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    const categoryFromUrl = searchParams.get('category') || '';
    const sortByFromUrl = searchParams.get('sortBy') || 'createdAt';
    const sortOrderFromUrl = searchParams.get('sortOrder') || 'desc';
    
    setCurrentPage(pageFromUrl);
    setFilters(prev => ({
      ...prev,
      page: pageFromUrl,
      category: categoryFromUrl,
      sortBy: sortByFromUrl,
      sortOrder: sortOrderFromUrl
    }));
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    console.log('Changing to page:', page);
    setCurrentPage(page);
    setFilters(prev => {
      const newFilters = { ...prev, page };
      console.log('New filters:', newFilters);
      return newFilters;
    });
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col items-center space-y-4 mt-8">
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Page {currentPage - 1}
          </button>
        )}
        
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    
    const handleImageError = () => {
      setImageError(true);
      setImageLoading(false);
    };

    const handleImageLoad = () => {
      setImageLoading(false);
    };

    const getPlaceholderIcon = () => {
      let categoryName = '';
      if (typeof product.category === 'string') {
        categoryName = product.category;
      } else if (product.category && typeof product.category === 'object' && product.category.name) {
        categoryName = product.category.name;
      }
      
      if (categoryName.includes('Footwear') || product.name.toLowerCase().includes('shoe') || product.name.toLowerCase().includes('sneaker')) {
        return '👟';
      } else if (categoryName.includes('Food') || product.name.toLowerCase().includes('pizza') || product.name.toLowerCase().includes('food')) {
        return '🍕';
      } else if (categoryName.includes('Digital') || product.name.toLowerCase().includes('carbon') || product.name.toLowerCase().includes('project')) {
        return '🌱';
      } else if (categoryName.includes('Electronics')) {
        return '📱';
      } else if (categoryName.includes('Clothing')) {
        return '👕';
      } else if (categoryName.includes('Books')) {
        return '📚';
      } else if (categoryName.includes('Sports')) {
        return '🏋️';
      } else if (categoryName.includes('Beauty')) {
        return '💄';
      } else if (categoryName.includes('Home')) {
        return '🏠';
      }
      return '🛍️';
    };

    const renderSpecialBadges = () => {
      const badges = [];
      
      if (product.qualityCheck?.authenticated) {
        badges.push(
          <span key="auth" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Authenticated
          </span>
        );
      }
      
      if (product.delivery?.estimatedTime) {
        badges.push(
          <span key="delivery" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🚚 {product.delivery.estimatedTime}
          </span>
        );
      }
      
      if (product.certifications?.verra) {
        badges.push(
          <span key="verra" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            🌱 VERRA Certified
          </span>
        );
      }
      
      if (product.dietaryInfo?.vegan) {
        badges.push(
          <span key="vegan" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🌱 Vegan
          </span>
        );
      }
      
      return badges;
    };

    const renderSpecialDetails = () => {
      if (product.qualityCheck?.score) {
        return (
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <span className="font-medium">Quality Score: {product.qualityCheck.score}/10</span>
            <span className="ml-2 text-green-600">✓ {product.qualityCheck.authenticator || 'Verified'}</span>
          </div>
        );
      }
      
      if (product.restaurant?.name) {
        return (
          <div className="text-xs text-gray-600 mb-1">
            <span className="font-medium">{product.restaurant.name}</span>
            <span className="ml-2">⭐ {product.restaurant.rating || 'N/A'}</span>
          </div>
        );
      }
      
      if (product.sdgGoals?.length > 0) {
        const highImpactGoals = product.sdgGoals.filter(goal => goal.impact === 'High').length;
        return (
          <div className="text-xs text-gray-600 mb-1">
            <span className="font-medium">{highImpactGoals} SDG Goals</span>
            <span className="ml-2">📍 {product.specifications?.location || 'Global'}</span>
          </div>
        );
      }
      
      return null;
    };

    return (
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
        <div className={`bg-gray-200 relative ${viewMode === 'list' ? 'w-48 h-32' : 'aspect-w-1'}`}>
          <div className={viewMode === 'list' ? '' : 'aspect-h-1'}>
            <Link to={`/products/${product._id}`}>
              {product.images?.[0]?.url && !imageError ? (
                <div className="relative w-full h-full">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={`object-cover hover:scale-105 transition-transform duration-200 ${
                      viewMode === 'list' ? 'w-full h-full' : 'w-full h-full'
                    } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  />
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center hover:bg-gray-300 transition-colors ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-full'}`}>
                  <div className="text-4xl mb-2">{getPlaceholderIcon()}</div>
                  <span className="text-xs text-gray-500 text-center px-2">
                    {imageError ? 'Image unavailable' : 'No image'}
                  </span>
                </div>
              )}
            </Link>
            
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <Link to={`/products/${product._id}`} className="block hover:text-blue-600 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          {renderSpecialDetails()}
          
          <div className="flex flex-wrap gap-1 mb-2">
            {renderSpecialBadges()}
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.ratings?.average || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.ratings?.count || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            {product.shipping?.freeShipping ? (
              <span className="text-xs text-green-600 font-medium">
                Free Shipping
              </span>
            ) : product.delivery?.deliveryFee ? (
              <span className="text-xs text-gray-500">
                +${product.delivery.deliveryFee} delivery
              </span>
            ) : null}
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              by {
                (typeof product.seller === 'object' && product.seller?.name) || 
                product.restaurant?.name || 
                'Unknown Seller'
              }
            </span>
            
            {product.delivery?.type === 'Digital Certificate' && (
              <span className="text-xs text-blue-600 font-medium">
                Instant Delivery
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>
              
              {categories && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="ratings.average-desc">Highest Rated</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items Per Page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Products</h1>
                {products && (
                  <p className="text-gray-600">
                    Showing {((products.page - 1) * products.limit) + 1} to {Math.min(products.page * products.limit, products.totalDocs)} of {products.totalDocs} products
                    {products.totalPages > 1 && (
                      <span className="ml-2 text-sm">
                        (Page {products.page} of {products.totalPages})
                      </span>
                    )}
                  </p>
                )}
{/*                 
                {products && (
                  <p className="text-xs text-gray-500 mt-1">
                    Debug: Current page: {currentPage}, API page: {products.page}, Total pages: {products.totalPages}, Items on page: {products.docs?.length || 0}
                  </p>
                )} */}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
                <p className="text-gray-600 mb-4">
                  {error.response?.data?.message || error.message || 'Something went wrong'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Error details: {JSON.stringify(error.response?.status)} - {error.code}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : !products ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data received</h3>
                <p className="text-gray-600 mb-4">Products data is undefined or null.</p>
                <p className="text-sm text-gray-500">
                  Debug info: isLoading={String(isLoading)}, error={error ? 'true' : 'false'}, products={products ? 'exists' : 'null'}
                </p>
              </div>
            ) : !products.docs || products.docs.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Applied filters: Category: {filters.category || 'All'}, Price: {filters.minPrice || 'Any'}-{filters.maxPrice || 'Any'}
                </p>
              </div>
            ) : (
              <>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                }`}>
                  {products.docs.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                
                <Pagination 
                  currentPage={products.page}
                  totalPages={products.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;