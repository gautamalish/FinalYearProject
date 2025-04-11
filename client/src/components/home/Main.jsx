import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchCategories } from "../../services/admin";
import axios from "axios";
import defaultImage from "../../assets/gardener.jpg";
import { fetchPopularCategories } from "../../services/admin";

const ServiceCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
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
    <main className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Hero Banner */}
      <section className="mb-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find Trusted Home Service Professionals
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
          Browse categories to discover skilled professionals ready to help
        </p>
      </section>

      {/* All Service Categories */}
      <section className="mb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Service Categories
          </h2>
          <button
            onClick={handleBrowseAllClick}
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center"
          >
            View All <span className="ml-1 text-xl">→</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                handleCategorySelection(category.id, category.name)
              }
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={category.imageUrl}
                  alt={`${category.name} service`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                <span className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                  {category.viewCount} views
                </span>
                {category.isPopular && (
                  <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    Popular
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800">
                  {category.name}
                </h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Browse professionals →
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Categories Section */}
      <section className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
          Trending This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(popularCategories) && popularCategories.length > 0 ? (
            popularCategories.map((category) => (
              <button
                key={category._id || category.id}
                onClick={() =>
                  handleCategorySelection(
                    category._id || category.id,
                    category.name
                  )
                }
                className="relative rounded-2xl overflow-hidden shadow-lg group h-full focus:outline-none focus:ring-2 focus:ring-white"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                <img
                  src={
                    category.thumbnail?.url || category.imageUrl || defaultImage
                  }
                  alt={`Popular ${category.name} service`}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/80">
                    {category.viewCount || 0} views this week
                  </p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">
              No trending categories available
            </p>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Choose a Service",
              description: "Browse our categories to find the service you need",
            },
            {
              title: "View Professionals",
              description:
                "See available professionals with profiles and reviews",
            },
            {
              title: "Book Your Service",
              description: "Select a professional and schedule your service",
            },
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to find your professional?
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
          Join thousands of satisfied customers who found the perfect service
          provider
        </p>
        <button
          onClick={handleBrowseAllClick}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Browse Services
        </button>
      </section>
    </main>
  );
};

export default ServiceCategoriesPage;
