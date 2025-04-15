import React from 'react';
import { FaTimes, FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

const WorkerProfileModal = ({ worker, isOpen, onClose }) => {
  if (!isOpen || !worker) return null;

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Worker Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Profile content */}
        <div className="p-6">
          {/* Basic info section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              <img 
                src={worker.profilePicture || "/fallback.png"} 
                alt={worker.name} 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                onError={(e) => { e.target.src = "/fallback.png"; }}
              />
            </div>
            
            <div className="flex-grow">
              <h3 className="text-2xl font-bold mb-1">{worker.name || "Unknown Professional"}</h3>
              <p className="text-gray-600 text-lg mb-2">{worker.title || "Service Professional"}</p>
              
              <div className="flex items-center mb-3">
                <div className="flex items-center text-yellow-500 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < Math.floor(worker.rating || 0) ? "text-yellow-500" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {worker.rating ? `${worker.rating.toFixed(1)} / 5.0` : "No ratings yet"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {worker.categories && worker.categories.length > 0 && 
                  worker.categories.map((category) => (
                    <span 
                      key={category._id || category.id} 
                      className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                    >
                      {category.name}
                    </span>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Contact information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FaEnvelope className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{worker.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaPhone className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{worker.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{worker.location || "Not specified"}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{worker.experience || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Bio/About section */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">About</h4>
            <p className="text-gray-700 whitespace-pre-line">
              {worker.bio || "No bio information available."}
            </p>
          </div>

          {/* Services section if available */}
          {worker.services && worker.services.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-3">Services Offered</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worker.services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h5 className="font-medium">{service.name}</h5>
                    <p className="text-gray-600">{service.description}</p>
                    <p className="text-blue-600 font-bold mt-2">${service.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews section if available */}
          {worker.reviews && worker.reviews.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold mb-3">Client Reviews</h4>
              <div className="space-y-4">
                {worker.reviews.map((review, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{review.clientName}</div>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                            size={14}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-gray-500 text-sm mt-1">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="border-t p-6 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = `/hiring?workerId=${worker._id || worker.id}`}
          >
            Hire Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfileModal;