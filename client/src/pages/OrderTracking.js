import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import io from 'socket.io-client';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);

  const { data: trackingData, refetch } = useQuery(
    ['orderTracking', id],
    () => axios.get(`/api/orders/${id}/track`).then(res => res.data),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  useEffect(() => {
    // Initialize socket connection for real-time updates
    const newSocket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002');
    setSocket(newSocket);

    // Join order room for real-time updates
    newSocket.emit('join-order', id);

    // Listen for order updates
    newSocket.on('order-updated', (update) => {
      setLiveUpdates(prev => [update, ...prev]);
      refetch(); // Refetch the latest data
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, refetch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-orange-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const getCurrentStepIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  if (!trackingData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(trackingData.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">Order Tracking</h1>
          <p className="text-blue-100">Order #{trackingData.orderNumber}</p>
        </div>

        {/* Status Progress */}
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
                {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
              </span>
            </div>

            {/* Progress Steps */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        index <= currentStepIndex
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {index <= currentStepIndex ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current"></div>
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    
                    {/* Progress Line */}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-5 left-10 w-full h-0.5 ${
                          index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        style={{ width: 'calc(100% + 2.5rem)' }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {trackingData.tracking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {trackingData.tracking.carrier && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Carrier</h3>
                  <p className="text-gray-600">{trackingData.tracking.carrier}</p>
                </div>
              )}
              
              {trackingData.tracking.trackingNumber && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Tracking Number</h3>
                  <p className="text-gray-600 font-mono">{trackingData.tracking.trackingNumber}</p>
                </div>
              )}
              
              {trackingData.tracking.estimatedDelivery && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Delivery</h3>
                  <p className="text-gray-600">
                    {new Date(trackingData.tracking.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {trackingData.tracking.actualDelivery && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Delivered On</h3>
                  <p className="text-green-600">
                    {new Date(trackingData.tracking.actualDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Digital Product Notice */}
          {trackingData.isDigital && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  This is a digital product. Download links will be available once payment is confirmed.
                </span>
              </div>
            </div>
          )}

          {/* Tracking Updates */}
          {trackingData.tracking?.updates && trackingData.tracking.updates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Updates</h3>
              <div className="space-y-4">
                {trackingData.tracking.updates
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(update.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{update.message}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(update.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {update.location && (
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {update.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Live Updates Notification */}
          {liveUpdates.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Receiving live updates for this order
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;