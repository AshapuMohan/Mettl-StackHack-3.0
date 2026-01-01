import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Star, X, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';

const ProductCompare = () => {
  const [searchParams] = useSearchParams();
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    const ids = searchParams.get('products');
    if (ids) {
      setProductIds(ids.split(',').filter(id => id.length > 0));
    }
  }, [searchParams]);

  const { data: products, isLoading } = useQuery(
    ['compareProducts', productIds],
    () => axios.post('/api/products/compare', { productIds }).then(res => res.data),
    { enabled: productIds.length > 0 }
  );

  const removeProduct = (productId) => {
    const newIds = productIds.filter(id => id !== productId);
    setProductIds(newIds);
    
    // Update URL
    const newSearchParams = new URLSearchParams();
    if (newIds.length > 0) {
      newSearchParams.set('products', newIds.join(','));
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
  };

  const getComparisonRows = () => {
    if (!products || products.length === 0) return [];

    return [
      {
        label: 'Price',
        getValue: (product) => `$${product.price}`,
        highlight: (product) => {
          const prices = products.map(p => p.price);
          const minPrice = Math.min(...prices);
          return product.price === minPrice;
        }
      },
      {
        label: 'Rating',
        getValue: (product) => (
          <div className="flex items-center space-x-1">
            <div className="flex">
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
            <span className="text-sm text-gray-600">
              ({product.ratings?.count || 0})
            </span>
          </div>
        ),
        highlight: (product) => {
          const ratings = products.map(p => p.ratings?.average || 0);
          const maxRating = Math.max(...ratings);
          return (product.ratings?.average || 0) === maxRating;
        }
      },
      {
        label: 'Category',
        getValue: (product) => product.category?.name || 'N/A'
      },
      {
        label: 'Seller',
        getValue: (product) => product.seller?.name || 'Unknown'
      },
      {
        label: 'Stock',
        getValue: (product) => product.inventory?.quantity || 0,
        highlight: (product) => (product.inventory?.quantity || 0) > 0
      },
      {
        label: 'Shipping',
        getValue: (product) => product.shipping?.freeShipping ? 'Free' : `$${product.shipping?.shippingCost || 0}`
      }
    ];
  };

  if (productIds.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Products</h1>
          <p className="text-gray-600 mb-8">
            Select products from our catalog to compare their features, prices, and ratings side by side.
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(productIds.length)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-96 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const comparisonRows = getComparisonRows();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/products"
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Products</span>
          </Link>
          <div className="h-6 border-l border-gray-300"></div>
          <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
        </div>
        
        <Link
          to="/products"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add More</span>
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Product Headers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-gray-200">
            <div className="p-6 bg-gray-50 border-r border-gray-200">
              <h3 className="font-semibold text-gray-900">Features</h3>
            </div>
            {products.map((product) => (
              <div key={product._id} className="p-6 border-r border-gray-200 last:border-r-0">
                <div className="relative">
                  <button
                    onClick={() => removeProduct(product._id)}
                    className="absolute top-0 right-0 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  <div className="mb-4">
                    <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/products/${product._id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                  </div>
                  
                  <Link
                    to={`/products/${product._id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          {comparisonRows.map((row, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-gray-200 last:border-b-0">
              <div className="p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-900">
                {row.label}
              </div>
              {products.map((product) => {
                const isHighlighted = row.highlight ? row.highlight(product) : false;
                return (
                  <div
                    key={product._id}
                    className={`p-4 border-r border-gray-200 last:border-r-0 ${
                      isHighlighted ? 'bg-green-50 text-green-800 font-medium' : ''
                    }`}
                  >
                    {typeof row.getValue(product) === 'string' || typeof row.getValue(product) === 'number'
                      ? row.getValue(product)
                      : row.getValue(product)
                    }
                  </div>
                );
              })}
            </div>
          ))}

          {/* Specifications */}
          {products.some(p => p.specifications && p.specifications.length > 0) && (
            <>
              <div className="bg-gray-100 px-6 py-3">
                <h3 className="font-semibold text-gray-900">Specifications</h3>
              </div>
              
              {/* Get all unique specification keys */}
              {Array.from(
                new Set(
                  products.flatMap(p => 
                    (p.specifications || []).map(spec => spec.key)
                  )
                )
              ).map((specKey) => (
                <div key={specKey} className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-gray-200 last:border-b-0">
                  <div className="p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-900">
                    {specKey}
                  </div>
                  {products.map((product) => {
                    const spec = (product.specifications || []).find(s => s.key === specKey);
                    return (
                      <div key={product._id} className="p-4 border-r border-gray-200 last:border-r-0">
                        {spec ? spec.value : 'N/A'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No products to compare</h2>
          <p className="text-gray-600 mb-8">
            The products you selected could not be found or are no longer available.
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Comparison Tips</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Green highlights indicate the best value in each category</li>
          <li>• Click "View Details" to see more information about each product</li>
          <li>• Use the "Add More" button to compare additional products</li>
          <li>• Remove products by clicking the X in the top-right corner</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductCompare;