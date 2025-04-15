import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchCategories } from "../../services/admin";
import axios from "axios";
import defaultImage from "../../assets/gardener.jpg";
import { fetchPopularCategories } from "../../services/admin";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaSearch,
  FaUserTie,
  FaStar,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

const slideIn = {
  hidden: { x: -60, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

const ServiceCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser,fetchMongoUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Starting to fetch categories..."); // Debug 1
        const allCategories = await fetchCategories();
        console.log("Raw categories data:", allCategories); // Debug 2

        if (!Array.isArray(allCategories)) {
          throw new Error("Categories data is not an array");
        }

        const transformedCategories = allCategories.map((category) => ({
          id: category._id,
          name: category.name,
          imageUrl: category.thumbnail?.url || defaultImage,
          viewCount: category.viewCount || 0,
          isPopular: category.popular || false,
        }));

        console.log("Transformed categories:", transformedCategories); // Debug 3
        setCategories(transformedCategories);

        // Try to get popular categories
        try {
          console.log("Fetching popular categories..."); // Debug 4
          const popular = await fetchPopularCategories();
          console.log("Popular categories:", popular); // Debug 5
          setPopularCategories(Array.isArray(popular) ? popular : []);
        } catch (popError) {
          console.log("Using fallback popular categories");
          setPopularCategories(
            transformedCategories.filter((cat) => cat.isPopular).slice(0, 4)
          );
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Couldn't load categories. Please refresh to try again.");
        setCategories([]);
        setPopularCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceCategories();
  }, []);
  console.log(currentUser);
  const handleCategorySelection = async (categoryId, categoryName) => {
    // Track view if user is logged in
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await axios.post(
          `/api/categories/${categoryId}/view`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (trackingError) {
        console.error("View tracking failed:", trackingError);
      }
    }

    navigate(`/services/${categoryName.toLowerCase()}`, {
      state: { categoryId, categoryName },
    });
  };

  const handleBrowseAllClick = () => {
    navigate("/services");
  };

  if (isLoading) {
    return (
      <div className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <motion.main 
      initial="hidden"
      animate="visible"
      className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12"
    >
      {/* Hero Banner */}
      <motion.section 
        variants={fadeInUp}
        className="mb-16 relative overflow-hidden rounded-2xl transform hover:scale-[1.02] transition-transform duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90 animate-gradient"></div>
        <motion.div 
          className="relative z-10 p-8 md:p-12 lg:p-16 text-white"
          variants={staggerContainer}
        >
          <motion.h1 
            variants={slideIn}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
          >
            Find Trusted Home Service Professionals
          </motion.h1>
          <motion.p 
            variants={slideIn}
            className="text-xl md:text-2xl opacity-90 max-w-2xl mb-8 leading-relaxed"
          >
            Connect with skilled professionals for all your home service needs
          </motion.p>
          <motion.div 
            variants={scaleIn}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBrowseAllClick}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Browse Services <FaArrowRight className="animate-bounce-x" />
            </motion.button>
            {!currentUser && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/signup")}
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Sign Up Now
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Popular Categories Section */}
      <motion.section 
        variants={fadeInUp}
        className="mb-20"
      >
        <motion.div 
          variants={staggerContainer}
          className="flex justify-between items-center mb-8"
        >
          <motion.div variants={slideIn}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Popular Services
            </h2>
            <p className="text-gray-600 mt-2 font-medium">
              Most requested services this week
            </p>
          </motion.div>
          <motion.button
            variants={scaleIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBrowseAllClick}
            className="text-blue-600 font-medium hover:text-blue-800 transition-all duration-300 flex items-center group"
          >
            View All <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {Array.isArray(popularCategories) && popularCategories.length > 0 ? (
            popularCategories.map((category) => (
              <motion.button
                variants={scaleIn}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                key={category._id || category.id}
                onClick={() =>
                  handleCategorySelection(
                    category._id || category.id,
                    category.name
                  )
                }
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 group-hover:opacity-75 transition-opacity duration-500"></div>
                <img
                  src={
                    category.thumbnail?.url || category.imageUrl || defaultImage
                  }
                  alt={`Popular ${category.name} service`}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                  <div className="flex items-center gap-2 mb-2">
                    <FaStar className="text-yellow-400 animate-pulse" />
                    {popularCategories.slice(0, 3).some(c => c._id === category._id || c.id === category.id) && (
                      <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-white/90 text-sm flex items-center gap-2 group-hover:text-yellow-200 transition-colors duration-300">
                    Browse professionals
                    <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                  </p>
                </div>
              </motion.button>
            ))
          ) : (
            <motion.p 
              variants={fadeInUp}
              className="text-gray-500 col-span-full text-center py-8 animate-pulse"
            >
              No popular categories available
            </motion.p>
          )}
        </motion.div>
      </motion.section>

      {/* All Service Categories */}
      <motion.section 
        variants={fadeInUp}
        className="mb-20"
      >
        <motion.div 
          variants={staggerContainer}
          className="flex justify-between items-center mb-8"
        >
          <motion.div variants={slideIn}>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Services
            </h2>
            <p className="text-gray-600 mt-2 font-medium">
              Browse all available service categories
            </p>
          </motion.div>
          <motion.button
            variants={scaleIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBrowseAllClick}
            className="text-blue-600 font-medium hover:text-blue-800 transition-all duration-300 flex items-center group"
          >
            View All <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.button
              variants={scaleIn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              key={category.id}
              onClick={() =>
                handleCategorySelection(category.id, category.name)
              }
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={category.imageUrl}
                  alt={`${category.name} service`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {category.isPopular && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                    >
                      Popular
                    </motion.span>
                  )}
                </div>
              </div>
              <motion.div 
                className="p-5 transform transition-transform duration-300 group-hover:translate-y-[-4px]"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm flex items-center gap-2 group-hover:text-blue-500 transition-colors duration-300">
                  Browse professionals
                  <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </p>
              </motion.div>
            </motion.button>
          ))}
        </motion.div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        variants={fadeInUp}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 mb-16 shadow-lg hover:shadow-xl transition-shadow duration-500"
      >
        <motion.h2 
          variants={slideIn}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-12 text-center"
        >
          How It Works
        </motion.h2>
        <motion.div 
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              title: "Choose a Service",
              description: "Browse our categories to find the service you need",
              icon: <FaSearch className="text-2xl" />,
            },
            {
              title: "View Professionals",
              description:
                "See available professionals with profiles and reviews",
              icon: <FaUserTie className="text-2xl" />,
            },
            {
              title: "Book Your Service",
              description: "Select a professional and schedule your service",
              icon: <FaCheckCircle className="text-2xl" />,
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-500 transform"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.7 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <span className="text-white">{step.icon}</span>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-800">
                {step.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        variants={fadeInUp}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white text-center shadow-xl hover:shadow-2xl transition-shadow duration-500 transform hover:scale-[1.02]"
      >
        <motion.h2 
          variants={slideIn}
          className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200"
        >
          Ready to Get Started?
        </motion.h2>
        <motion.p 
          variants={fadeInUp}
          className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Join thousands of satisfied customers who found their perfect service
          professional
        </motion.p>
        <motion.div 
          variants={staggerContainer}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBrowseAllClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            Browse Services
            <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
          {!currentUser && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Sign Up Now
            </motion.button>
          )}
        </motion.div>
      </motion.section>
    </motion.main>
  );
};

export default ServiceCategoriesPage;
