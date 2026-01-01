import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Package,
  Calendar,
  Download
} from 'lucide-react';

const Analytics = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    orders: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    users: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    products: {
      total: 0,
      active: 0,
      inactive: 0
    },
    topProducts: [],
    topCategories: [],
    recentSales: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [isAdmin, navigate, dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/admin/analytics?days=${dateRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await axios.get(`/api/admin/analytics/export?days=${dateRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${dateRange}days.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report');
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track marketplace performance and insights</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            
            <button
              onClick={exportReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${analytics.revenue.total.toLocaleString()}`}
            change={analytics.revenue.growth}
            icon={DollarSign}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Orders"
            value={analytics.orders.total.toLocaleString()}
            change={analytics.orders.growth}
            icon={ShoppingBag}
            color="bg-blue-500"
          />
          <MetricCard
            title="Total Users"
            value={analytics.users.total.toLocaleString()}
            change={analytics.users.growth}
            icon={Users}
            color="bg-purple-500"
          />
          <MetricCard
            title="Active Products"
            value={analytics.products.active.toLocaleString()}
            icon={Package}
            color="bg-orange-500"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.products} products</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{category.sales} sales</p>
                    <p className="text-xs text-gray-500">${category.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentSales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{sale.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.customer?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.items?.[0]?.product?.name}
                      {sale.items?.length > 1 && ` +${sale.items.length - 1} more`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${sale.pricing?.total?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">This Month</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-medium">${analytics.revenue.thisMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orders:</span>
                <span className="font-medium">{analytics.orders.thisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Users:</span>
                <span className="font-medium">{analytics.users.thisMonth}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Performance</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Order Value:</span>
                <span className="font-medium">
                  ${analytics.orders.total > 0 ? (analytics.revenue.total / analytics.orders.total).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-medium">
                  {analytics.users.total > 0 ? ((analytics.orders.total / analytics.users.total) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Products:</span>
                <span className="font-medium">
                  {analytics.products.total > 0 ? ((analytics.products.active / analytics.products.total) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Growth Trends</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Growth:</span>
                <span className={`font-medium ${analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.revenue.growth >= 0 ? '+' : ''}{analytics.revenue.growth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Growth:</span>
                <span className={`font-medium ${analytics.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.orders.growth >= 0 ? '+' : ''}{analytics.orders.growth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Growth:</span>
                <span className={`font-medium ${analytics.users.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.users.growth >= 0 ? '+' : ''}{analytics.users.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;